// "use server";

// import { getDbConnection } from "@/lib/db";
// import { generateSummaryFromGemini } from "@/lib/gemini-ai";
// import { fetchAndExtractPdfText } from "@/lib/langchain";
// import { formatFileNameAsTitle } from "@/utils/format-utils";
// import { auth, currentUser } from "@clerk/nextjs/server";
// import { revalidatePath } from "next/cache";
// import { createOrGetUser } from "@/lib/user";

// interface PdfSummaryType {
//   userId?: string;
//   fileUrl: string;
//   summary: string;
//   title: string;
//   fileName: string;
// }

// export async function generatePdfSummary({
//   fileUrl,
//   fileName,
//   customInstructions,
// }: {
//   fileUrl: string;
//   fileName: string;
//   customInstructions?: string;
// }) {
//   if (!fileUrl) {
//     return {
//       success: false,
//       message: "File upload failed: No file URL provided",
//       data: null,
//     };
//   }

//   try {
//     console.log("Starting PDF processing for:", fileName);
//     console.log("File URL:", fileUrl);
//     console.log("Custom instructions:", customInstructions);
    
//     const pdfTextChunks = await fetchAndExtractPdfText(fileUrl);
//     console.log("PDF text extracted, chunks:", pdfTextChunks.length);
    
//     if (!pdfTextChunks || pdfTextChunks.length === 0) {
//       return {
//         success: false,
//         message: "Failed to extract text from PDF. The file might be corrupted, password-protected, or contain only images.",
//         data: null,
//       };
//     }

//     // Process each chunk and generate summaries
//     const summaries: string[] = [];
//     const failedChunks: number[] = [];
    
//     for (let i = 0; i < pdfTextChunks.length; i++) {
//       const chunk = pdfTextChunks[i];
//       console.log(`Processing chunk ${i + 1}/${pdfTextChunks.length}, length:`, chunk.length);
      
//       try {
//         const chunkSummary = await generateSummaryFromGemini(chunk, customInstructions);
//         summaries.push(chunkSummary);
//         console.log(`✅ Chunk ${i + 1}/${pdfTextChunks.length} summary generated successfully`);
//       } catch (error) {
//         console.error(`❌ Failed to generate summary for chunk ${i + 1}/${pdfTextChunks.length}:`, error);
//         console.error(`Error details:`, {
//           message: error instanceof Error ? error.message : 'Unknown error',
//           chunkLength: chunk.length,
//           chunkPreview: chunk.substring(0, 100) + "..."
//         });
//         failedChunks.push(i + 1);
//         // Continue with other chunks even if one fails
//         // Instead of adding error placeholders, try to provide a basic summary
//         try {
//           // Attempt to generate a basic summary with a simpler prompt
//           const basicPrompt = `Provide a brief summary of this text in 2-3 sentences: ${chunk.substring(0, 1000)}`;
//           const basicSummary = await generateSummaryFromGemini(chunk.substring(0, 1000), "Keep it brief and simple");
//           summaries.push(basicSummary);
//         } catch (retryError) {
//           console.error(`Retry also failed for chunk ${i + 1}:`, retryError);
//           summaries.push(`[Section ${i + 1} summary unavailable]`);
//         }
//       }
//     }
    
//     if (summaries.length === 0) {
//       return {
//         success: false,
//         message: "Failed to generate any summaries from PDF text",
//         data: null,
//       };
//     }

//     // Check if we have too many failed chunks
//     if (failedChunks.length > 0) {
//       console.warn(`Warning: ${failedChunks.length} chunks failed to process:`, failedChunks);
//     }

//       // If more than half the chunks failed, return an error
//       if (failedChunks.length > pdfTextChunks.length / 2) {
//         return {
//           success: false,
//           message: `Too many chunks failed to process (${failedChunks.length}/${pdfTextChunks.length}). The PDF might be too complex or contain unsupported content.`,
//           data: null,
//         };
//       }
//     }
    

//     // Combine all summaries into one comprehensive summary
//     let combinedSummary: string;
//     if (summaries.length === 1) {
//       combinedSummary = summaries[0];
//     } else {
//       // Create a combined summary with section headers
//       combinedSummary = `# Comprehensive Document Summary\n\n`;
//       summaries.forEach((summary, index) => {
//         combinedSummary += `## Section ${index + 1}\n\n${summary}\n\n---\n\n`;
//       });
//     }

//     const formattedFileName = formatFileNameAsTitle(fileName);

//     return {
//       success: true,
//       message: "Summary generated successfully",
//       data: {
//         title: formattedFileName,
//         summary: combinedSummary,
//       },
//     };
//   } catch (error) {
//     console.error("Error in generatePdfSummary:", error);
    
//     // Provide more specific error messages
//     let errorMessage = "File upload failed";
//     if (error instanceof Error) {
//       if (error.message.includes("Failed to fetch PDF")) {
//         errorMessage = "Failed to download the PDF file. Please check your internet connection and try again.";
//       } else if (error.message.includes("Failed to extract PDF text")) {
//         errorMessage = "Failed to read the PDF content. The file might be corrupted, password-protected, or in an unsupported format.";
//       } else if (error.message.includes("GEMINI_API_KEY")) {
//         errorMessage = "AI service configuration error. Please contact support.";
//       } else {
//         errorMessage = `Processing failed: ${error.message}`;
//       }
//     }
    
//     return {
//       success: false,
//       message: errorMessage,
//       data: null,
//     };
//   }
// }

// async function savePdfSummary({
//   userId,
//   fileUrl,
//   summary,
//   title,
//   fileName,
// }: PdfSummaryType) {
//   try {
//     const sql = await getDbConnection();

//     const [savedSummary] = await sql`
//     INSERT INTO pdf_summaries (
//       user_id,
//       original_file_url,
//       summary_text,
//       title,
//       file_name
//       )VALUES(
//     ${userId},
//     ${fileUrl},
//     ${summary},
//     ${title},
//     ${fileName}
//      )RETURNING id,summary_text`;

//     return savedSummary;
//   } catch (error) {
//     console.error("Error saving PDF summary", error);
//     throw error;
//   }
// }

// export async function storePdfSummaryAction({
//   fileUrl,
//   summary,
//   title,
//   fileName,
// }: PdfSummaryType) {
//   let savedSummary: any;
//   try {
//     const { userId } = await auth();
//     if (!userId) {
//       return {
//         success: false,
//         message: "User not found",
//       };
//     }

//     // Get the full user object from Clerk
//     const user = await currentUser();
//     if (!user) {
//       return {
//         success: false,
//         message: "User not found",
//       };
//     }

//     // Create or get user in our database
//     await createOrGetUser(user);

//     savedSummary = await savePdfSummary({
//       userId,
//       fileUrl,
//       summary,
//       title,
//       fileName,
//     });

//     if (!savedSummary) {
//       return {
//         success: false,
//         message: "Failed to save PDF summary, please try again",
//       };
//     }
//   } catch (error) {
//     return {
//       success: false,
//       message:
//         error instanceof Error ? error.message : "Error saving PDF summary",
//     };
//   }

//   //revalidate our cache
//   revalidatePath(`/summaries/${savedSummary.id}`);
//   return {
//     success: true,
//     message: "PDF summary saved successfully",
//     data: {
//       id: savedSummary.id,
//     },
//   };
// }



"use server";

import { getDbConnection } from "@/lib/db";
import { generateSummaryFromGemini } from "@/lib/gemini-ai";
import { fetchAndExtractPdfText } from "@/lib/langchain";
import { formatFileNameAsTitle } from "@/utils/format-utils";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createOrGetUser } from "@/lib/user";

interface PdfSummaryType {
  userId?: string;
  fileUrl: string;
  summary: string;
  title: string;
  fileName: string;
}

export async function generatePdfSummary({
  fileUrl,
  fileName,
  customInstructions,
}: {
  fileUrl: string;
  fileName: string;
  customInstructions?: string;
}) {
  if (!fileUrl) {
    return {
      success: false,
      message: "File upload failed: No file URL provided",
      data: null,
    };
  }

  try {
    console.log("Starting PDF processing for:", fileName);
    console.log("File URL:", fileUrl);
    console.log("Custom instructions:", customInstructions);

    const pdfTextChunks = await fetchAndExtractPdfText(fileUrl);
    console.log("PDF text extracted, chunks:", pdfTextChunks.length);

    if (!pdfTextChunks || pdfTextChunks.length === 0) {
      return {
        success: false,
        message:
          "Failed to extract text from PDF. The file might be corrupted, password-protected, or contain only images.",
        data: null,
      };
    }

    // Process each chunk and generate summaries
    const summaries: string[] = [];
    const failedChunks: number[] = [];

    for (let i = 0; i < pdfTextChunks.length; i++) {
      const chunk = pdfTextChunks[i];
      console.log(
        `Processing chunk ${i + 1}/${pdfTextChunks.length}, length:`,
        chunk.length
      );

      try {
        const chunkSummary = await generateSummaryFromGemini(
          chunk,
          customInstructions
        );
        summaries.push(chunkSummary);
        console.log(
          `✅ Chunk ${i + 1}/${pdfTextChunks.length} summary generated successfully`
        );
      } catch (error) {
        console.error(
          `❌ Failed to generate summary for chunk ${i + 1}/${pdfTextChunks.length}:`,
          error
        );
        console.error(`Error details:`, {
          message: error instanceof Error ? error.message : "Unknown error",
          chunkLength: chunk.length,
          chunkPreview: chunk.substring(0, 100) + "...",
        });
        failedChunks.push(i + 1);

        // Retry with a simpler prompt
        try {
          const basicSummary = await generateSummaryFromGemini(
            chunk.substring(0, 1000),
            "Keep it brief and simple"
          );
          summaries.push(basicSummary);
        } catch (retryError) {
          console.error(`Retry also failed for chunk ${i + 1}:`, retryError);
          summaries.push(`[Section ${i + 1} summary unavailable]`);
        }
      }
    }

    if (summaries.length === 0) {
      return {
        success: false,
        message: "Failed to generate any summaries from PDF text",
        data: null,
      };
    }

    // Check failed chunks
    if (failedChunks.length > 0) {
      console.warn(
        `Warning: ${failedChunks.length} chunks failed to process:`,
        failedChunks
      );
    }

    if (failedChunks.length > pdfTextChunks.length / 2) {
      return {
        success: false,
        message: `Too many chunks failed to process (${failedChunks.length}/${pdfTextChunks.length}). The PDF might be too complex or contain unsupported content.`,
        data: null,
      };
    }

    // Combine summaries
    let combinedSummary: string;
    if (summaries.length === 1) {
      combinedSummary = summaries[0];
    } else {
      combinedSummary = `# Comprehensive Document Summary\n\n`;
      summaries.forEach((summary, index) => {
        combinedSummary += `## Section ${index + 1}\n\n${summary}\n\n---\n\n`;
      });
    }

    const formattedFileName = formatFileNameAsTitle(fileName);

    return {
      success: true,
      message: "Summary generated successfully",
      data: {
        title: formattedFileName,
        summary: combinedSummary,
      },
    };
  } catch (error) {
    console.error("Error in generatePdfSummary:", error);

    let errorMessage = "File upload failed";
    if (error instanceof Error) {
      if (error.message.includes("Failed to fetch PDF")) {
        errorMessage =
          "Failed to download the PDF file. Please check your internet connection and try again.";
      } else if (error.message.includes("Failed to extract PDF text")) {
        errorMessage =
          "Failed to read the PDF content. The file might be corrupted, password-protected, or in an unsupported format.";
      } else if (error.message.includes("GEMINI_API_KEY")) {
        errorMessage =
          "AI service configuration error. Please contact support.";
      } else {
        errorMessage = `Processing failed: ${error.message}`;
      }
    }

    return {
      success: false,
      message: errorMessage,
      data: null,
    };
  }
}

async function savePdfSummary({
  userId,
  fileUrl,
  summary,
  title,
  fileName,
}: PdfSummaryType) {
  try {
    const sql = await getDbConnection();

    const [savedSummary] = await sql`
      INSERT INTO pdf_summaries (
        user_id,
        original_file_url,
        summary_text,
        title,
        file_name
      ) VALUES (
        ${userId},
        ${fileUrl},
        ${summary},
        ${title},
        ${fileName}
      )
      RETURNING id, summary_text`;

    return savedSummary;
  } catch (error) {
    console.error("Error saving PDF summary", error);
    throw error;
  }
}

export async function storePdfSummaryAction({
  fileUrl,
  summary,
  title,
  fileName,
}: PdfSummaryType) {
  let savedSummary: any;
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        message: "User not found",
      };
    }

    const user = await currentUser();
    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    await createOrGetUser(user);

    savedSummary = await savePdfSummary({
      userId,
      fileUrl,
      summary,
      title,
      fileName,
    });

    if (!savedSummary) {
      return {
        success: false,
        message: "Failed to save PDF summary, please try again",
      };
    }
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Error saving PDF summary",
    };
  }

  revalidatePath(`/summaries/${savedSummary.id}`);
  return {
    success: true,
    message: "PDF summary saved successfully",
    data: {
      id: savedSummary.id,
    },
  };
}

