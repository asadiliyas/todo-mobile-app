import { forwardRef, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface FieldShellProps {
  label: string;
  error?: string;
  hint?: string;
  htmlFor: string;
  children: ReactNode;
  trailing?: ReactNode;
}

export function FieldShell({ label, error, hint, htmlFor, children, trailing }: FieldShellProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label htmlFor={htmlFor} className="text-sm font-medium text-slate-500">
          {label}
        </label>
      ) : null}
      <div className="relative">
        {children}
        {trailing ? (
          <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            {trailing}
          </span>
        ) : null}
      </div>
      {error ? (
        <p className="text-xs font-medium text-red-500" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-slate-400">{hint}</p>
      ) : null}
    </div>
  );
}

const inputBase =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-[15px] text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 aria-[invalid=true]:border-red-400";

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  trailing?: ReactNode;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ label, error, hint, trailing, id, className, ...props }, ref) => {
    const inputId = id ?? `field-${label.toLowerCase().replace(/\s+/g, "-")}`;
    return (
      <FieldShell label={label} error={error} hint={hint} htmlFor={inputId} trailing={trailing}>
        <input
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error)}
          className={cn(inputBase, trailing && "pr-10", className)}
          {...props}
        />
      </FieldShell>
    );
  },
);
TextInput.displayName = "TextInput";

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, hint, id, className, rows = 4, ...props }, ref) => {
    const inputId = id ?? `field-${label.toLowerCase().replace(/\s+/g, "-")}`;
    return (
      <FieldShell label={label} error={error} hint={hint} htmlFor={inputId}>
        <textarea
          ref={ref}
          id={inputId}
          rows={rows}
          aria-invalid={Boolean(error)}
          className={cn(inputBase, "resize-none", className)}
          {...props}
        />
      </FieldShell>
    );
  },
);
TextArea.displayName = "TextArea";
