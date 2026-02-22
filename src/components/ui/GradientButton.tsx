import Link from "next/link";
import { cn } from "@/lib/utils";

type GradientButtonProps = {
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
} & (
  | { href: string; onClick?: never; disabled?: never; type?: never }
  | { href?: never; onClick?: () => void; disabled?: boolean; type?: "button" | "submit" }
);

const sizes = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-2.5 text-sm font-semibold",
  lg: "px-8 py-3 text-base font-semibold",
};

export default function GradientButton({
  children,
  className,
  size = "md",
  ...props
}: GradientButtonProps) {
  const classes = cn(
    "btn-gradient inline-flex items-center justify-center rounded-full text-white",
    "shadow-[0_10px_24px_rgba(245,158,11,0.35)]",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    sizes[size],
    className
  );

  if ("href" in props && props.href) {
    return (
      <Link href={props.href} className={classes}>
        {children}
      </Link>
    );
  }

  const buttonProps = props as Extract<
    GradientButtonProps,
    { href?: never; onClick?: () => void; disabled?: boolean; type?: "button" | "submit" }
  >;

  return (
    <button
      className={classes}
      onClick={buttonProps.onClick}
      disabled={buttonProps.disabled}
      type={buttonProps.type || "button"}
    >
      {children}
    </button>
  );
}
