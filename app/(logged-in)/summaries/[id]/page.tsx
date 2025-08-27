import BgGradient from "@/components/common/bg-gradient";
import { MotionDiv } from "@/components/common/motion-wrapper";
import { SourceInfo } from "@/components/summaries/source-info";
import { SummaryHeader } from "@/components/summaries/summary-header";
import { EditableSummaryViewer } from "@/components/summaries/editable-summary-viewer";
import { getSummaryById } from "@/lib/summaries";
import { FileText, ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import Link from "next/link";

interface SummaryPageProps {
  params: Promise<{ id: string }>;
}

export default async function SummaryPage({ params }: SummaryPageProps) {
  const { id } = await params;

  const summary = await getSummaryById(id);

  if (!summary) {
    notFound();
  }

  const {
    title,
    summary_text,
    file_name,
    word_count,
    created_at,
    original_file_url,
  } = summary;

  const readingTime = Math.ceil((word_count || 0) / 200);

  return (
    <div className="relative isolate min-h-screen bg-gradient-to-b from-rose-50/40 to-white">
      <BgGradient className="from-rose-400 via-rose-300 to-orange-200" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 lg:py-24">
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto"
        >
          {/* Back to Dashboard Button */}
          <div className="mb-6">
            <Link 
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>

          {/* Summary Header */}
          <SummaryHeader
            title={title}
            createdAt={created_at}
            readingTime={readingTime}
          />

          {/* Source Info */}
          {file_name && (
            <SourceInfo
              title={title}
              summaryText={summary_text}
              fileName={file_name}
              createdAt={created_at}
              originalFileUrl={original_file_url}
            />
          )}

          {/* Summary Content */}
          <div className="mt-8">
            <EditableSummaryViewer 
              summary={summary_text}
              summaryId={id}
              fileName={file_name || "Unknown File"}
              title={title || "Document Summary"}
            />
          </div>
        </MotionDiv>
      </div>
    </div>
  );
}
