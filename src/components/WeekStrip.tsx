import { ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { isSameDay } from "@/lib/week";
import { cn } from "@/lib/cn";

interface WeekStripProps {
  days: Date[];
  selected: Date;
  onSelect: (day: Date) => void;
  daysWithTasks: Set<string>;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  weekLabel: string;
}

export function WeekStrip({ days, selected, onSelect, daysWithTasks, onPrevWeek, onNextWeek, weekLabel }: WeekStripProps) {
  const today = new Date();

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-500">{weekLabel}</h2>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={onPrevWeek}
            aria-label="Previous week"
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onNextWeek}
            aria-label="Next week"
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {days.map((day) => {
          const isSelected = isSameDay(day, selected);
          const isToday = isSameDay(day, today);
          const key = format(day, "yyyy-MM-dd");
          const hasTasks = daysWithTasks.has(key);

          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(day)}
              aria-pressed={isSelected}
              aria-label={format(day, "EEEE d MMMM") + (isToday ? " (today)" : "")}
              className={cn(
                "flex flex-col items-center gap-1 rounded-2xl py-2 text-center transition-colors",
                isSelected
                  ? "bg-brand-600 text-white"
                  : isToday
                    ? "bg-brand-50 text-brand-700"
                    : "text-slate-500 hover:bg-slate-50",
              )}
            >
              <span className="text-[11px] font-medium uppercase opacity-80">{format(day, "EEE")}</span>
              <span className="text-sm font-semibold">{format(day, "d")}</span>
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  hasTasks ? (isSelected ? "bg-white" : "bg-brand-500") : "bg-transparent",
                )}
                aria-hidden
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
