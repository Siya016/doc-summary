import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { MotionDiv, MotionH1, MotionH2, MotionSection, MotionSpan } from "../common/motion-wrapper";
import { containerVariants, itemVariants } from "@/utils/constants";

const buttonVariants = {
  scale:1.05,
  transition:{
    type:"spring",
    damping:10,
    stiffness:300,
  }
}

export default function HeroSection() {
  return (
    <MotionSection variants={containerVariants} initial="hidden" animate="visible" className="relative mx-auto flex flex-col z-0 items-center justify-center py-16 sm:py-20 lg:pb-28 transition-all animate-in lg:px-12 max-w-7xl">

      {/* Badge */}
      
        <Badge
          variant={"secondary"}
          className="relative px-6 py-2 text-base font-medium bg-white rounded-full group-hover:bg-gray-50 transition-colors duration-200"
        >
          <Sparkles className="h-6 w-6 mr-1 min-w-[28px] min-h-[28px] text-blue-600 animate-pulse" />
          <p className="text-base text-blue-600">Powered by AI</p>
        </Badge>
      

      {/* Title */}
      
        Transform PDFs into{" "}
        <span className="relative inline-block">
          <MotionSpan whileHover={buttonVariants} className="relative z-10 px-2">concise</MotionSpan>
          <span
            className="absolute inset-0 bg-blue-200/50 -rotate-2 rounded-lg transform -skew-y-1"
            aria-hidden="true"
          ></span>
        </span>{" "}
        summaries
      

      {/* Description */}
      
        Get a beautiful summary reel of the document in seconds.


      {/* Button */}
    
        <Button
          variant={"link"}
          className="text-white mt-6 text-base sm:text-lg lg:text-xl rounded-full px-8 sm:px-10 lg:px-12 py-6 sm:py-7 lg:py-8 lg:mt-16 bg-linear-to-r from-slate-900 to-rose-500 hover:from-rose-500 hover:to-slate-900 hover:no-underline font-bold shadow-lg transition-all duration-300"
        >
          <Link href="/#pricing" className="flex gap-2 items-center">
            <span>Try Minuites</span>
            <ArrowRight className="animate-pulse" />
          </Link>
        </Button>
   
    </MotionSection>
  );
}
