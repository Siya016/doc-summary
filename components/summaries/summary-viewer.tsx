"use client";
import { Card, CardContent } from "@/components/ui/card";
import { MotionDiv } from "../common/motion-wrapper";

export function SummaryViewer({ summary }: { summary: string }) {
  // Convert markdown-like formatting to HTML
  const formatSummary = (text: string) => {
    return text
      .replace(/\n\n/g, '</p><p>') // Double newlines become paragraph breaks
      .replace(/\n/g, '<br>') // Single newlines become line breaks
      .replace(/^/, '<p>') // Start with paragraph
      .replace(/$/, '</p>') // End with paragraph
      .replace(/# (.*?)(?=\n|$)/g, '</p><h1>$1</h1><p>') // Headers
      .replace(/## (.*?)(?=\n|$)/g, '</p><h2>$1</h2><p>') // Subheaders
      .replace(/### (.*?)(?=\n|$)/g, '</p><h3>$1</h3><p>') // Sub-subheaders
      .replace(/• (.*?)(?=\n|$)/g, '</p><ul><li>$1</li></ul><p>') // Bullet points
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold text
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic text
      .replace(/---/g, '</p><hr><p>') // Horizontal rules
      .replace(/<p><\/p>/g, '') // Remove empty paragraphs
      .replace(/<p><\/h1>/g, '</h1>') // Fix header formatting
      .replace(/<p><\/h2>/g, '</h2>') // Fix header formatting
      .replace(/<p><\/h3>/g, '</h3>') // Fix header formatting
      .replace(/<p><\/ul>/g, '</ul>') // Fix list formatting
      .replace(/<p><\/hr>/g, '</hr>'); // Fix hr formatting
  };

  return (
    <MotionDiv 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto"
    >
      <Card className="relative bg-white/90 backdrop-blur-sm shadow-xl border border-rose-100/30 rounded-2xl overflow-hidden">
        <CardContent className="p-6 sm:p-8">
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ 
              __html: formatSummary(summary)
            }}
          />
        </CardContent>
      </Card>
    </MotionDiv>
  );
}
