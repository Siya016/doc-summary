import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Sparkles } from "lucide-react";

export function SummaryHeader({
  title,
  createdAt,
  readingTime,
}: {
  title: string;
  createdAt: string;
  readingTime: number;
}) {
  return (
    <div className="space-y-6 mb-8">
      <div className="flex flex-wrap items-center gap-4">
        <Badge
          variant={"secondary"}
          className="relative px-4 py-1.5 text-sm font-medium bg-white/80 backdrop-blur-xs rounded-full hover:bg-white/90 transition-all duration-200 shadow-xs hover:shadow-md"
        >
          <Sparkles className="h-4 w-4 min-w-[16px] min-h-[16px] mr-1 text-rose-500" />
          AI Summary
        </Badge>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 text-rose-400" />
          {new Date(createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4 text-rose-400" />
          {readingTime} min Read
        </div>
      </div>
      <h1 className="text-3xl lg:text-4xl font-bold lg:tracking-tight text-gray-900">
        {title}
      </h1>
    </div>
  );
}
