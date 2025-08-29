import { GoogleGenAI } from "@google/genai";
import { SUMMARY_SYSTEM_PROMPT } from "@/utils/prompts";

//initialize the gemini api with your api key
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// Rough estimation of tokens (1 token ≈ 4 characters for English text)
function estimateTokenCount(text: string): number {
    return Math.ceil(text.length / 4);
}

export const generateSummaryFromGemini = async (pdfText: string, customInstructions?: string) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY environment variable is not set");
    }

    const cleanedPdfText = pdfText.replace(/\s{2,}/g, " ").trim();
    
    if (!cleanedPdfText || cleanedPdfText.length === 0) {
      throw new Error("PDF text is empty, cannot generate summary");
    }

    // Estimate token count
    const estimatedTokens = estimateTokenCount(cleanedPdfText);
    console.log("Estimated token count:", estimatedTokens);
    
    // Check if text is too long (Gemini has ~1M token limit)
    if (estimatedTokens > 800000) {
      console.warn("Text is very long, may need further chunking");
    }

    console.log("Generating summary for PDF text of length:", cleanedPdfText.length);
    if (customInstructions) {
      console.log("Using custom instructions:", customInstructions);
    }

    // Build the prompt with custom instructions if provided
    let prompt = SUMMARY_SYSTEM_PROMPT;
    
    if (customInstructions && customInstructions.trim()) {
      prompt += `\n\nIMPORTANT: Follow these specific instructions: ${customInstructions}\n\n`;
    }
    
    // prompt += `\nTransform this document into an engaging, easy-to-read summary with contextually relevant emojis and proper markdown formatting:\n\n${cleanedPdfText}`;
    prompt += `
     Summarize this document into a clear, detailed, and well-structured format. 
     Focus only on the most important points, key arguments, and actionable insights. 
     Avoid adding emojis, unnecessary formatting, or casual language. 
     Ensure the summary is comprehensive and suitable for professional or executive review. ${cleanedPdfText}`;

    const result = await genAI.models.generateContent({
      model: "gemini-1.5-flash", // Updated to use the correct model name
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        temperature: 0.7,
        maxOutputTokens: 1500,
      },
    });

    if (!result.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error("Empty response from Gemini API");
    }

    const summary = result.candidates[0].content.parts[0].text;
    console.log("Summary generated successfully, length:", summary.length);
    
    // Validate the generated summary
    if (summary.trim().length < 50) {
      throw new Error("Generated summary is too short, may indicate an error");
    }
    
    // Check if the summary contains error indicators
    // if (summary.includes("could not be generated") || summary.includes("error")) {
    //   throw new Error("Generated summary contains error indicators");
    // }
      
    if (summary.toLowerCase().includes("i'm sorry") && summary.toLowerCase().includes("cannot")) {
    throw new Error("Generated summary appears to be an error response from the AI model");
    }
    
    // Check if the summary contains actual error indicators (not legitimate content about errors)
    const errorIndicators = [
      "could not be generated",
      "failed to generate",
      "unable to process",
      "processing error",
      "api error",
      "service unavailable",
      "quota exceeded",
      "rate limit exceeded",
      "content policy violation",
      "network error",
      "authentication failed",
      "invalid request"
    ];
    
    const hasErrorIndicator = errorIndicators.some(indicator => 
      summary.toLowerCase().includes(indicator.toLowerCase())
    );
    
    if (hasErrorIndicator) {
      throw new Error("Generated summary contains error indicators");
    }
    
    return summary;
  } catch (error: any) {
    console.error("Gemini API error:", error);
    
    // Provide more specific error messages
    if (error.message?.includes("API_KEY")) {
      throw new Error("Gemini API key is invalid or missing");
    } else if (error.message?.includes("quota")) {
      throw new Error("Gemini API quota exceeded. Please try again later.");
    } else if (error.message?.includes("rate limit")) {
      throw new Error("Gemini API rate limit exceeded. Please wait a moment and try again.");
    } else if (error.message?.includes("content policy")) {
      throw new Error("Content violates Gemini API policy. Please check your document.");
    } else if (error.message?.includes("network")) {
      throw new Error("Network error connecting to Gemini API. Please check your internet connection.");
    } else {
      throw new Error(`AI summary generation failed: ${error.message || 'Unknown error'}`);
    }
  }
};
