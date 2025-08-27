"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MotionDiv } from "../common/motion-wrapper";
import { useState } from "react";
import { updateSummaryAction } from "@/actions/summary-actions";
import { toast } from "sonner";
import { Edit2, Save, X, Share2 } from "lucide-react";
import { ShareSummaryDialog } from "./share-summary-dialog";

interface EditableSummaryViewerProps {
  summary: string;
  summaryId: string;
  fileName: string;
  title: string;
}

export function EditableSummaryViewer({ 
  summary, 
  summaryId, 
  fileName, 
  title 
}: EditableSummaryViewerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(summary);
  const [isSaving, setIsSaving] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);

  const handleSave = async () => {
    if (editedContent.trim() === summary) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      const result = await updateSummaryAction(summaryId, editedContent.trim());
      
      if (result.success) {
        toast.success("Summary updated successfully!");
        setIsEditing(false);
        // Update the parent component if needed
        window.location.reload(); // Simple refresh for now
      } else {
        toast.error(result.message || "Failed to update summary");
      }
    } catch (error) {
      toast.error("An error occurred while updating the summary");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedContent(summary);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setEditedContent(summary);
    setIsEditing(true);
  };

  // Convert markdown-like formatting to HTML
  const formatSummary = (text: string) => {
    return text
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/^/, '<p>')
      .replace(/$/, '</p>')
      .replace(/# (.*?)(?=\n|$)/g, '</p><h1>$1</h1><p>')
      .replace(/## (.*?)(?=\n|$)/g, '</p><h2>$1</h2><p>')
      .replace(/### (.*?)(?=\n|$)/g, '</p><h3>$1</h3><p>')
      .replace(/• (.*?)(?=\n|$)/g, '</p><ul><li>$1</li></ul><p>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/---/g, '</p><hr><p>')
      .replace(/<p><\/p>/g, '')
      .replace(/<p><\/h1>/g, '</h1>')
      .replace(/<p><\/h2>/g, '</h2>')
      .replace(/<p><\/h3>/g, '</h3>')
      .replace(/<p><\/ul>/g, '</ul>')
      .replace(/<p><\/hr>/g, '</hr>');
  };

  return (
    <>
      <MotionDiv 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl mx-auto"
      >
        <Card className="relative bg-white/90 backdrop-blur-sm shadow-xl border border-rose-100/30 rounded-2xl overflow-hidden">
          <CardContent className="p-6 sm:p-8">
            {/* Action Buttons */}
            <div className="flex justify-end gap-2 mb-4">
              {!isEditing ? (
                <>
                  <Button
                    onClick={handleEdit}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => setShowShareDialog(true)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    size="sm"
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <Save className="h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </>
              )}
            </div>

            {/* Content */}
            {isEditing ? (
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="min-h-[400px] text-sm font-mono"
                placeholder="Edit your summary here..."
              />
            ) : (
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: formatSummary(summary)
                }}
              />
            )}
          </CardContent>
        </Card>
      </MotionDiv>

      {/* Share Dialog */}
      <ShareSummaryDialog
        isOpen={showShareDialog}
        onClose={() => setShowShareDialog(false)}
        summaryId={summaryId}
        fileName={fileName}
        title={title}
      />
    </>
  );
} 