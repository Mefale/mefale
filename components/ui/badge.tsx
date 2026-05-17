import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#1A56DB] focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#1A56DB] text-white hover:bg-[#1A56DB]/90",
        secondary:
          "border-transparent bg-[#F1F5F9] text-[#0F172A] hover:bg-[#E2E8F0]",
        destructive:
          "border-transparent bg-[#DC2626] text-white hover:bg-[#DC2626]/90",
        outline: "border-[#CBD5E1] text-[#0F172A]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
