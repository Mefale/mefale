import { cn } from "@/lib/utils";

type Props = {
  title: string;
  subtitle?: string;
  className?: string;
};

export function SectionHeader({ title, subtitle, className }: Props) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <h2 className="text-2xl sm:text-3xl font-bold text-[#111827] tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="text-[#6B7280] text-sm sm:text-base">{subtitle}</p>
      )}
    </div>
  );
}
