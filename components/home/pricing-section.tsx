import { cn } from "@/lib/utils";
import {
  containerVariants,
  itemVariants,
  pricingPlans,
} from "@/utils/constants";
import { ArrowRight, CheckIcon } from "lucide-react";
import Link from "next/link";
import { MotionDiv, MotionSection } from "../common/motion-wrapper";

interface PriceType {
  name: string;
  price: number;
  description: string;
  items: string[];
  id: string;
  // paymentLink prop removed
  priceId: string;
}

const listVariant = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", damping: 20, stiffness: 100 },
  },
};

const PricingCard = ({
  name,
  price,
  description,
  items,
  id,
  // paymentLink removed
}: PriceType) => {
  return (
    <MotionDiv
      variants={listVariant}
      whileHover={{ scale: 1.02 }}
      className="relative w-full max-w-lg hover:scale-105 hover:transition-all duration-300 p-6 flex flex-col gap-6 border rounded-lg shadow"
    >
      {/* Buy button removed since payment functionality is gone */}
      <div>
        <p className="text-lg lg:text-xl font-bold capitalize">{name}</p>
        <p className="text-base-content/80 mt-2">{description}</p>
      </div>
      <div className="flex gap-2 items-end">
        <p className="text-5xl tracking-tight font-extrabold">₹{price}</p>
        <div className="flex flex-col justify-end mb-[4px]">
          <p className="text-xs uppercase font-semibold">INR</p>
          <p className="text-xs">/month</p>
        </div>
      </div>
      <ul className="space-y-2.5 leading-relaxed text-base flex-1/2">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-center gap-2">
            <CheckIcon size={18} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      {/* Buy Now button removed since payment functionality is gone */}
    </MotionDiv>
  );
};

export default function PricingSection() {
  return (
    <MotionSection
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      className="relative overflow-hidden "
      id="pricing"
    >
      <div className="py-12 lg:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 lg:pt-12">
        <MotionDiv
          variants={itemVariants}
          className="flex items-center justify-center w-full pb-12"
        >
          <h2 className="uppercase font-bold text-xl mb-8 text-rose-500">
            Pricing
          </h2>
        </MotionDiv>
        <div className="relative flex justify-center flex-col lg:flex-row items-center lg:items-stretch gap-8">
          {pricingPlans.map((plan) => (
            <PricingCard key={plan.id} {...plan} />
          ))}
        </div>
      </div>
    </MotionSection>
  );
}
