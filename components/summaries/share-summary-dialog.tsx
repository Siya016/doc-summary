"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { shareSummaryAction } from "@/actions/summary-actions";
import { toast } from "sonner";
import { Send, X, Plus, Trash2 } from "lucide-react";

interface ShareSummaryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  summaryId: string;
  fileName: string;
  title: string;
}

export function ShareSummaryDialog({
  isOpen,
  onClose,
  summaryId,
  fileName,
  title,
}: ShareSummaryDialogProps) {
  const [emails, setEmails] = useState<string[]>([""]);
  const [subject, setSubject] = useState(`AI Summary: ${title}`);
  const [isSending, setIsSending] = useState(false);

  const addEmailField = () => {
    setEmails([...emails, ""]);
  };

  const removeEmailField = (index: number) => {
    if (emails.length > 1) {
      setEmails(emails.filter((_, i) => i !== index));
    }
  };

  const updateEmail = (index: number, value: string) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
  };

  const handleShare = async () => {
    const validEmails = emails.filter(email => email.trim() !== "");
    
    if (validEmails.length === 0) {
      toast.error("Please enter at least one email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = validEmails.filter(email => !emailRegex.test(email));
    
    if (invalidEmails.length > 0) {
      toast.error(`Invalid email format: ${invalidEmails.join(", ")}`);
      return;
    }

    setIsSending(true);
    try {
      const result = await shareSummaryAction(summaryId, validEmails, subject);
      
      if (result.success) {
        toast.success(result.message);
        onClose();
        // Reset form
        setEmails([""]);
        setSubject(`AI Summary: ${title}`);
      } else {
        toast.error(result.message || "Failed to share summary");
      }
    } catch (error) {
      toast.error("An error occurred while sharing the summary");
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    onClose();
    // Reset form
    setEmails([""]);
    setSubject(`AI Summary: ${title}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-rose-500" />
            Share Summary
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject"
            />
          </div>

          <div>
            <Label>Recipient Emails</Label>
            <div className="space-y-2">
              {emails.map((email, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => updateEmail(index, e.target.value)}
                    placeholder="recipient@example.com"
                  />
                  {emails.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeEmailField(index)}
                      className="px-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addEmailField}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Another Email
              </Button>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleShare}
              disabled={isSending}
              className="flex-1"
            >
              <Send className="h-4 w-4 mr-2" />
              {isSending ? "Sending..." : "Send"}
            </Button>
            <Button
              onClick={handleClose}
              variant="outline"
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 