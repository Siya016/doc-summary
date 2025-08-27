// PDF text extraction with fallback methods
// This approach tries multiple methods to extract text from PDFs

// Function to chunk text into smaller pieces
function chunkText(text: string, maxChunkSize: number = 600000): string[] {
    const chunks: string[] = [];
    
    // If text is already small enough, return it as a single chunk
    if (text.length <= maxChunkSize) {
        return [text];
    }
    
    // Split by paragraphs first (double newlines)
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    
    let currentChunk = '';
    
    for (const paragraph of paragraphs) {
        const paragraphWithBreaks = paragraph.trim() + '\n\n';
        
        // If adding this paragraph would exceed the chunk size, save current chunk and start new one
        if (currentChunk.length + paragraphWithBreaks.length > maxChunkSize) {
            if (currentChunk.trim().length > 0) {
                chunks.push(currentChunk.trim());
            }
            currentChunk = paragraphWithBreaks;
        } else {
            currentChunk += paragraphWithBreaks;
        }
    }
    
    // Add the last chunk if it has content
    if (currentChunk.trim().length > 0) {
        chunks.push(currentChunk.trim());
    }
    
    // If we still have chunks that are too long, split them further by sentences
    const finalChunks: string[] = [];
    for (const chunk of chunks) {
        if (chunk.length <= maxChunkSize) {
            finalChunks.push(chunk);
        } else {
            // Split this chunk by sentences
            const sentences = chunk.split(/[.!?]+/).filter(s => s.trim().length > 0);
            let sentenceChunk = '';
            
            for (const sentence of sentences) {
                const sentenceWithPunctuation = sentence.trim() + '. ';
                
                if (sentenceChunk.length + sentenceWithPunctuation.length > maxChunkSize) {
                    if (sentenceChunk.trim().length > 0) {
                        finalChunks.push(sentenceChunk.trim());
                    }
                    sentenceChunk = sentenceWithPunctuation;
                } else {
                    sentenceChunk += sentenceWithPunctuation;
                }
            }
            
            if (sentenceChunk.trim().length > 0) {
                finalChunks.push(sentenceChunk.trim());
            }
        }
    }
    
    return finalChunks;
}

// Function to clean and validate extracted text
function cleanAndValidateText(text: string): string {
    if (!text || text.trim().length === 0) {
        throw new Error("Extracted text is empty");
    }
    
    // Clean up the extracted text
    const cleanedText = text
        .replace(/\f/g, '\n') // Replace form feeds with newlines
        .replace(/\r\n/g, '\n') // Normalize line endings
        .replace(/\r/g, '\n') // Normalize line endings
        .replace(/\n{3,}/g, '\n\n') // Remove excessive newlines
        .replace(/[^\x00-\x7F]/g, '') // Remove non-ASCII characters that might be PDF artifacts
        .trim();
    
    if (cleanedText.length === 0) {
        throw new Error("Text is empty after cleaning");
    }
    
    // Check if the text looks like actual content (not just random characters)
    const wordCount = cleanedText.split(/\s+/).filter(word => word.length > 1).length;
    if (wordCount < 10) {
        throw new Error("Extracted text appears to be too short or contains mostly random characters");
    }
    
    return cleanedText;
}

export async function fetchAndExtractPdfText(fileUrl: string) {
    try {
        console.log("Attempting to fetch PDF from:", fileUrl);
        
        // First, try to fetch as PDF with proper headers
        const pdfResponse = await fetch(fileUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/pdf',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            mode: 'cors',
            cache: 'no-cache'
        });
        
        if (!pdfResponse.ok) {
            throw new Error(`Failed to fetch PDF: ${pdfResponse.status} ${pdfResponse.statusText}`);
        }
        
        // Check if the response is actually a PDF
        const contentType = pdfResponse.headers.get('content-type');
        console.log("Response content type:", contentType);
        
        if (!contentType || !contentType.includes('application/pdf')) {
            console.warn("Warning: Response doesn't appear to be a PDF. Content-Type:", contentType);
        }
        
        // Try multiple extraction methods
        let extractedText = '';
        
        // Method 1: Try to extract text using response.text() (works for some PDFs)
        try {
            const textResponse = await fetch(fileUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'text/plain,application/pdf,*/*',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            
            if (textResponse.ok) {
                const text = await textResponse.text();
                if (text && text.trim().length > 0) {
                    // Check if this looks like actual text content
                    const cleanedText = cleanAndValidateText(text);
                    if (cleanedText.length > 100) { // Minimum reasonable length
                        extractedText = cleanedText;
                        console.log("Text extracted using method 1 (text response), length:", extractedText.length);
                    }
                }
            }
        } catch (error) {
            console.log("Method 1 failed:", error);
        }
        
        // Method 2: Try to extract text from the PDF response as text
        if (!extractedText) {
            try {
                const text = await pdfResponse.text();
                if (text && text.trim().length > 0) {
                    const cleanedText = cleanAndValidateText(text);
                    if (cleanedText.length > 100) {
                        extractedText = cleanedText;
                        console.log("Text extracted using method 2 (PDF response as text), length:", extractedText.length);
                    }
                }
            } catch (error) {
                console.log("Method 2 failed:", error);
            }
        }
        
        // Method 3: Try to extract text from array buffer (for binary PDFs)
        if (!extractedText) {
            try {
                const arrayBuffer = await pdfResponse.arrayBuffer();
                if (arrayBuffer.byteLength > 0) {
                    // Convert to text and try to extract readable content
                    const uint8Array = new Uint8Array(arrayBuffer);
                    const textDecoder = new TextDecoder('utf-8');
                    const text = textDecoder.decode(uint8Array);
                    
                    if (text && text.trim().length > 0) {
                        const cleanedText = cleanAndValidateText(text);
                        if (cleanedText.length > 100) {
                            extractedText = cleanedText;
                            console.log("Text extracted using method 3 (array buffer), length:", extractedText.length);
                        }
                    }
                }
            } catch (error) {
                console.log("Method 3 failed:", error);
            }
        }
        
        // If all methods failed, throw an error
        if (!extractedText) {
            throw new Error("All text extraction methods failed. The PDF might be image-only, corrupted, password-protected, or in an unsupported format.");
        }
        
        console.log("PDF text extracted successfully, length:", extractedText.length);
        
        // Chunk the text if it's too long
        const chunks = chunkText(extractedText);
        console.log(`Text chunked into ${chunks.length} chunks`);
        
        // Return all chunks for processing
        return chunks;
        
    } catch (error) {
        console.error("Error extracting PDF text:", error);
        throw new Error(`Failed to extract PDF text: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
