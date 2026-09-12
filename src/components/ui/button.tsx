import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

type ButtonVariant = "glass" | "accent" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: "icon" | "default";
};

export function Button({ className, variant = "glass", size = "default", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-2 font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-45",
        variant === "glass" && "border border-glass-border bg-glass text-overlay-foreground backdrop-blur-xl hover:bg-glass-strong",
        variant === "accent" && "bg-accent text-accent-foreground shadow-lg hover:bg-accent-strong",
        variant === "ghost" && "text-overlay-muted hover:bg-glass hover:text-overlay-foreground",
        size === "icon" ? "size-10 rounded-xl" : "h-10 rounded-xl px-4 text-sm",
        className,
      )}
      {...props}
    />
  );
}