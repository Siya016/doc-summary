import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Crown } from "lucide-react";

export default function PlanBadge() {
  // Show a static badge for all users
  return (
    <Badge
      variant="outline"
      className={cn(
        "ml-2 bg-linear-to-r from-amber-100 to-amber-200 border-amber-300 hidden lg:flex flex-row items-center"
      )}
    >
      <Crown className="w-3 h-3 mr-1 text-amber-600" />
      Free Plan
    </Badge>
  );
}
