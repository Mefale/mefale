import { cn } from "@/lib/utils";

type Props = {
  title: string;
  subtitle?: string;
  className?: string;
};

export function SectionHeader({ title, subtitle, className }: Props) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center gap-3">
        <span className="h-7 w-1.5 rounded-full bg-[#1A56DB]" />
        <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
          {title}
        </h2>
      </div>
      {subtitle && (
        <p className="text-[#64748B] text-sm sm:text-base pl-[1.875rem]">
          {subtitle}
        </p>
      )}
    </div>
  );
}
