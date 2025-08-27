"use server";

import { getDbConnection } from "@/lib/db";
import { auth, currentUser } from "@clerk/nextjs/server";
import { sendSummaryEmail } from "@/lib/email";
import { revalidatePath } from "next/cache";

export async function updateSummaryAction(summaryId: string, newContent: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        message: "User not authenticated",
      };
    }

    const sql = await getDbConnection();

    // Update the summary content
    const [updatedSummary] = await sql`
      UPDATE pdf_summaries 
      SET summary_text = ${newContent}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${summaryId} AND user_id = ${userId}
      RETURNING id, summary_text
    `;

    if (!updatedSummary) {
      return {
        success: false,
        message: "Summary not found or you don't have permission to edit it",
      };
    }

    revalidatePath(`/summaries/${summaryId}`);
    revalidatePath('/dashboard');

    return {
      success: true,
      message: "Summary updated successfully",
      data: updatedSummary,
    };
  } catch (error) {
    console.error("Error updating summary:", error);
    return {
      success: false,
      message: "Failed to update summary",
    };
  }
}

export async function shareSummaryAction(
  summaryId: string,
  recipientEmails: string[],
  subject: string
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        message: "User not authenticated",
      };
    }

    const user = await currentUser();
    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    const sql = await getDbConnection();

    // Get the summary details
    const [summary] = await sql`
      SELECT title, summary_text, file_name 
      FROM pdf_summaries 
      WHERE id = ${summaryId} AND user_id = ${userId}
    `;

    if (!summary) {
      return {
        success: false,
        message: "Summary not found or you don't have permission to share it",
      };
    }

    // Send email
    await sendSummaryEmail({
      to: recipientEmails,
      subject: subject || `AI Summary: ${summary.title}`,
      summaryTitle: summary.title || "Document Summary",
      summaryContent: summary.summary_text,
      fileName: summary.file_name || "Unknown File",
      senderName: user.fullName || user.emailAddresses[0]?.emailAddress,
    });

    return {
      success: true,
      message: `Summary shared successfully with ${recipientEmails.length} recipient(s)`,
    };
  } catch (error) {
    console.error("Error sharing summary:", error);
    return {
      success: false,
      message: `Failed to share summary: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

export async function deleteSummaryAction(summaryId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        message: "User not authenticated",
      };
    }

    const sql = await getDbConnection();

    const result = await sql`
      DELETE FROM pdf_summaries
      WHERE id = ${summaryId} AND user_id = ${userId}
      RETURNING id;`;

    if (result.length > 0) {
      revalidatePath("/dashboard");
      return { success: true, message: "Summary deleted successfully" };
    }
    return { success: false, message: "Summary not found or you don't have permission to delete it" };
  } catch (error) {
    console.error("Error deleting summary", error);
    return { success: false, message: "Failed to delete summary" };
  }
}
