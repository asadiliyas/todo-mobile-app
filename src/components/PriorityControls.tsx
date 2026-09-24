import { cn } from "@/lib/cn";
import type { Priority } from "@/lib/task-constants";

const OPTIONS: { value: Priority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const DOT_CLASSES: Record<Priority, string> = {
  low: "bg-priority-low",
  medium: "bg-priority-medium",
  high: "bg-priority-high",
};

const RING_CLASSES: Record<Priority, string> = {
  low: "border-priority-low text-priority-low bg-priority-low/10",
  medium: "border-priority-medium text-priority-medium bg-priority-medium/10",
  high: "border-priority-high text-priority-high bg-priority-high/10",
};

interface PrioritySelectProps {
  value?: Priority;
  onChange: (value: Priority | undefined) => void;
  label?: string;
}

/** Not in the Figma (the brief asks for it) — styled as a segmented
 *  control so it reads as part of the same design language. */
export function PrioritySelect({ value, onChange, label = "Priority" }: PrioritySelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-slate-500">{label}</span>
      <div className="flex gap-2" role="radiogroup" aria-label={label}>
        {OPTIONS.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(active ? undefined : opt.value)}
              className={cn(
                "flex-1 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors",
                active ? RING_CLASSES[opt.value] : "border-slate-200 text-slate-500 hover:bg-slate-50",
              )}
            >
              <span className={cn("mr-1.5 inline-block h-2 w-2 rounded-full", DOT_CLASSES[opt.value])} />
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function PriorityDot({ priority }: { priority?: Priority }) {
  if (!priority) return null;
  return (
    <span
      className={cn("inline-block h-2 w-2 rounded-full", DOT_CLASSES[priority])}
      aria-label={`${priority} priority`}
      title={`${priority} priority`}
    />
  );
}

export function priorityLabel(priority?: Priority): string | undefined {
  if (!priority) return undefined;
  return priority[0].toUpperCase() + priority.slice(1);
}
