"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, Plus } from "lucide-react";
import { format } from "date-fns";
import { TaskRow } from "@/components/TaskRow";
import { useWeekTasks } from "@/hooks/useTasks";
import { useTaskRowActions } from "@/hooks/useTaskRowActions";
import { useTaskSheet } from "@/components/TaskSheetProvider";
import { formatDayLabel } from "@/lib/week";
import { cn } from "@/lib/cn";
import type { WeekSummary } from "@/lib/types";
import type { TaskDTO } from "@/lib/types";

interface WeekOverviewListProps {
  weeks: WeekSummary[];
  isLoading?: boolean;
}

/** The brief's "weekly organization" requirement: one card per week with
 *  open/completed counts, expanding to that week's tasks grouped by day. */
export function WeekOverviewList({ weeks, isLoading }: WeekOverviewListProps) {
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-2xl bg-slate-100" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {weeks.map((week) => (
        <WeekOverviewCard
          key={week.weekStart}
          summary={week}
          expanded={expandedKey === week.weekStart}
          onToggle={() => setExpandedKey((cur) => (cur === week.weekStart ? null : week.weekStart))}
        />
      ))}
    </div>
  );
}

export function groupByDay(tasks: TaskDTO[]): { key: string; label: string; items: TaskDTO[] }[] {
  const groups = new Map<string, { label: string; items: TaskDTO[] }>();
  for (const task of tasks) {
    const start = new Date(task.startAt);
    const key = format(start, "yyyy-MM-dd");
    const existing = groups.get(key);
    if (existing) existing.items.push(task);
    else groups.set(key, { label: formatDayLabel(start), items: [task] });
  }
  return Array.from(groups.entries()).map(([key, value]) => ({ key, ...value }));
}

function WeekOverviewCard({
  summary,
  expanded,
  onToggle,
}: {
  summary: WeekSummary;
  expanded: boolean;
  onToggle: () => void;
}) {
  const weekStart = new Date(summary.weekStart);
  const weekEnd = new Date(summary.weekEnd);
  const { data: tasks, isLoading } = useWeekTasks(weekStart, weekEnd, { enabled: expanded });
  const actions = useTaskRowActions();
  const { openCreate } = useTaskSheet();

  return (
    <div className="rounded-2xl border border-slate-100 bg-white">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
      >
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-800">{summary.label}</p>
          <p className="text-xs text-slate-400">
            {format(weekStart, "d MMM")} – {format(weekEnd, "d MMM")}
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs font-medium">
          <span className="rounded-full bg-complete-bg px-2 py-1 text-complete-icon">{summary.completed} done</span>
          <span className="rounded-full bg-pending-bg px-2 py-1 text-pending-icon">{summary.open} open</span>
        </div>
        <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform", expanded && "rotate-180")} />
      </button>

      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3.5">
              {isLoading ? (
                <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
              ) : !tasks || tasks.length === 0 ? (
                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-3 text-sm text-slate-400">
                  No tasks this week
                  <button
                    type="button"
                    onClick={() => openCreate(weekStart)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add
                  </button>
                </div>
              ) : (
                groupByDay(tasks).map((group) => (
                  <div key={group.key}>
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">{group.label}</p>
                    <div className="flex flex-col gap-2">
                      {group.items.map((task) => (
                        <TaskRow
                          key={task.id}
                          task={task}
                          onToggleStatus={(checked) => actions.onToggleStatus(task, checked)}
                          onEdit={() => actions.onEdit(task)}
                          onOpenView={() => actions.onOpenView(task)}
                          onDelete={() => actions.onDelete(task)}
                        />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
