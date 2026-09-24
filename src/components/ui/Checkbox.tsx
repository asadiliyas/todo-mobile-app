import { forwardRef, type InputHTMLAttributes } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  size?: "sm" | "md";
}

/** A real checkbox underneath (keyboard + screen reader support), styled
 *  to match the Figma's blue outline square / filled-check states. */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, size = "md", checked, ...props }, ref) => {
    const box = size === "sm" ? "h-5 w-5" : "h-6 w-6";
    return (
      <span className={cn("relative inline-flex shrink-0", box, className)}>
        <input
          ref={ref}
          type="checkbox"
          checked={checked}
          className="peer absolute inset-0 h-full w-full cursor-pointer appearance-none opacity-0"
          {...props}
        />
        <span
          className={cn(
            "pointer-events-none flex h-full w-full items-center justify-center rounded-md border-2 border-brand-400 bg-white transition-colors",
            "peer-checked:border-brand-600 peer-checked:bg-brand-600",
            "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-500",
          )}
          aria-hidden
        >
          <Check
            className={cn(
              "h-3.5 w-3.5 text-white opacity-0 transition-opacity",
              checked && "opacity-100",
            )}
            strokeWidth={3}
          />
        </span>
      </span>
    );
  },
);
Checkbox.displayName = "Checkbox";
