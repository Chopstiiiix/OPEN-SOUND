import { cn } from "@/lib/utils";

type BadgeVariant = "active" | "paused" | "ended" | "reward" | "bonus" | "default";

const variants: Record<BadgeVariant, string> = {
  active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  paused: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  ended: "bg-orange-500/15 text-red-400 border-red-500/20",
  reward: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  bonus: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  default: "bg-white/10 text-white/60 border-white/10",
};

export default function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full border",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
