"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Loader2, Lightbulb } from "lucide-react";
import { forwardRef } from "react";

interface UploadFormInputProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
}

const UploadFormInput = forwardRef<HTMLFormElement, UploadFormInputProps>(
  ({ onSubmit, isLoading }, ref) => {
    return (
      <form ref={ref} className="flex flex-col gap-6" onSubmit={onSubmit}>
        <div className="space-y-4">
          <div>
            <Label htmlFor="customInstructions" className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              Custom Instructions (Optional)
            </Label>
            <Textarea
              id="customInstructions"
              name="customInstructions"
              placeholder="e.g., 'Summarize in bullet points for executives' or 'Highlight only action items' or 'Focus on technical details' or 'Create a summary suitable for a 5-minute presentation'"
              className="mt-2 min-h-[80px] resize-none"
              disabled={isLoading}
            />
            <p className="mt-1 text-xs text-gray-500">
              Leave blank for a general summary, or specify how you'd like the content summarized. Examples: "bullet points for executives", "action items only", "technical focus", "5-minute presentation format".
            </p>
          </div>
          
          <div className="flex justify-end items-center gap-1.5">
            <Input
              id="file"
              type="file"
              name="file"
              accept="application/pdf"
              required
              className={cn(isLoading && "opacity-50 cursor-not-allowed")}
              disabled={isLoading}
            />
            <Button disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Upload your PDF"
              )}
            </Button>
          </div>
        </div>
      </form>
    );
  }
);

UploadFormInput.displayName = "UploadFormInput";

export default UploadFormInput;
