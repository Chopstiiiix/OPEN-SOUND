import { cn } from "@/lib/utils";

export default function Card({
  children,
  className,
  hover = true,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-surface/95 border border-white/[0.06] p-5",
        "transition-colors duration-200 shadow-[0_8px_24px_rgba(0,0,0,0.24)]",
        hover && "hover:border-white/[0.12] hover:bg-surface-hover/90 hover-lift",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
