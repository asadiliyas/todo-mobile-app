import { Check, X } from "lucide-react";

interface StatCardsProps {
  completed: number;
  pending: number;
}

export function StatCards({ completed, pending }: StatCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-2xl bg-complete-bg p-4">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-complete-icon">
            <Check className="h-4 w-4 text-white" strokeWidth={3} />
          </span>
          <span className="text-sm font-medium text-slate-600">Task Complete</span>
        </div>
        <p className="mt-3 text-3xl font-bold text-slate-900">
          {completed}
          <span className="ml-1.5 text-xs font-medium text-slate-400">This Week</span>
        </p>
      </div>

      <div className="rounded-2xl bg-pending-bg p-4">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-pending-icon">
            <X className="h-4 w-4 text-white" strokeWidth={3} />
          </span>
          <span className="text-sm font-medium text-slate-600">Task Pending</span>
        </div>
        <p className="mt-3 text-3xl font-bold text-slate-900">
          {pending}
          <span className="ml-1.5 text-xs font-medium text-slate-400">This Week</span>
        </p>
      </div>
    </div>
  );
}

interface ProgressBarProps {
  completed: number;
  total: number;
}

export function ProgressBar({ completed, total }: ProgressBarProps) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">Weekly Progress</h2>
        <span className="text-sm font-medium text-slate-400">{pct}%</span>
      </div>
      <div
        className="h-2.5 w-full overflow-hidden rounded-full bg-brand-50"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Weekly progress"
      >
        <div
          className="h-full rounded-full bg-brand-600 transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
