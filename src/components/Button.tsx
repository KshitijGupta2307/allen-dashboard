import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** "outline" (default) is a bordered surface button; "link" is a bare text action. */
  variant?: "outline" | "link";
  /** Toggled/selected state — renders solid brand color instead of the neutral outline. */
  active?: boolean;
  /** Fully rounded, for chip-style toggles (status filters). */
  pill?: boolean;
  size?: "sm" | "md";
}

const SIZE_CLS: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "text-[12px] px-2.5 py-1.5",
  md: "text-[13px] px-3 py-1.5",
};

export function Button({
  variant = "outline",
  active = false,
  pill = false,
  size = "sm",
  className = "",
  type = "button",
  children,
  ...rest
}: ButtonProps) {
  if (variant === "link") {
    return (
      <button
        type={type}
        className={`text-[12px] font-medium text-[var(--series-1)] hover:underline transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        {...rest}
      >
        {children}
      </button>
    );
  }

  const shape = pill ? "rounded-full" : "rounded-md";
  const look = active
    ? "border-[var(--series-1)] bg-[var(--series-1)] text-white"
    : "border-[var(--border)] bg-[var(--surface-1)] text-[var(--text-secondary)] hover:bg-[var(--page)] hover:border-[var(--border-strong)]";

  return (
    <button
      type={type}
      className={`inline-flex items-center gap-1.5 border font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${shape} ${SIZE_CLS[size]} ${look} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
