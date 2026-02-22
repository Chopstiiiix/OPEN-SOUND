import { cn } from "@/lib/utils";

export default function ProgressBar({
  value,
  max = 100,
  className,
  barClassName,
}: {
  value: number;
  max?: number;
  className?: string;
  barClassName?: string;
}) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;

  return (
    <div
      className={cn(
        "h-2 w-full rounded-full bg-white/[0.08] overflow-hidden",
        className
      )}
    >
      <div
        className={cn(
          "h-full rounded-full transition-all duration-500 ease-out",
          "bg-gradient-to-r from-amber-400 to-orange-500",
          barClassName
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
