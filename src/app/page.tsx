"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useIsClient } from "@/hooks/useMediaQuery";
import { addDays, differenceInCalendarDays, format } from "date-fns";
import { Plus } from "lucide-react";
import { SearchEntry } from "@/components/SearchEntry";
import { WeekStrip } from "@/components/WeekStrip";
import { StatCards, ProgressBar } from "@/components/WeeklyStats";
import { WeekOverviewList, groupByDay } from "@/components/WeekOverviewList";
import { TaskRow } from "@/components/TaskRow";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/StateViews";
import { Button } from "@/components/ui/Button";
import { useTaskSheet } from "@/components/TaskSheetProvider";
import { useTaskRowActions } from "@/hooks/useTaskRowActions";
import { useWeekSummaries, useWeekTasks } from "@/hooks/useTasks";
import { useSeedSample } from "@/hooks/useTaskMutations";
import { formatDayLabel, formatWeekLabel, getWeekRange, isSameDay, listWeekDays, shiftWeek } from "@/lib/week";
import { hasOnboarded } from "@/lib/onboarding";

export default function HomePage() {
  const router = useRouter();
  const isClient = useIsClient();
  const onboarded = isClient && hasOnboarded();

  // Redirect is a side effect (fine inside an effect); it does not set any
  // React state itself, so there's nothing here for React to re-render for.
  useEffect(() => {
    if (isClient && !hasOnboarded()) router.replace("/welcome");
  }, [isClient, router]);

  // Gate the first real render behind `isClient`/`onboarded` so the
  // "today"/local-time dependent UI below is only ever computed once
  // mounted in the browser — computing it during SSR could use the
  // server's own timezone and mismatch what the visitor's browser
  // renders on hydration.
  if (!onboarded) return <HomeSkeleton />;
  return <HomeContent />;
}

function HomeSkeleton() {
  return (
    <main className="mx-auto max-w-md px-4 py-6 md:max-w-5xl md:px-8 md:py-10">
      <div className="h-12 animate-pulse rounded-2xl bg-slate-100" />
      <div className="mt-4 h-24 animate-pulse rounded-2xl bg-slate-100" />
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
        <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    </main>
  );
}

function HomeContent() {
  const { openCreate } = useTaskSheet();
  const actions = useTaskRowActions();
  const seedSample = useSeedSample();

  const [weekAnchor, setWeekAnchor] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState(() => new Date());
  const [showAllWeek, setShowAllWeek] = useState(false);

  const { start: weekStart, end: weekEnd } = getWeekRange(weekAnchor);
  const days = listWeekDays(weekAnchor);
  const weekLabel = formatWeekLabel(weekStart);

  const { data: weekTasks, isLoading, isError, refetch } = useWeekTasks(weekStart, weekEnd);
  const summariesQuery = useWeekSummaries(4, 8);

  const daysWithTasks = useMemo(() => {
    const set = new Set<string>();
    weekTasks?.forEach((task) => set.add(format(new Date(task.startAt), "yyyy-MM-dd")));
    return set;
  }, [weekTasks]);

  const completed = weekTasks?.filter((task) => task.status === "completed").length ?? 0;
  const pending = (weekTasks?.length ?? 0) - completed;

  const dayTasks = useMemo(
    () => weekTasks?.filter((task) => isSameDay(new Date(task.startAt), selectedDay)) ?? [],
    [weekTasks, selectedDay],
  );

  function goToWeek(direction: 1 | -1) {
    const dayIndex = differenceInCalendarDays(selectedDay, weekStart);
    const nextAnchor = shiftWeek(weekAnchor, direction);
    const nextStart = getWeekRange(nextAnchor).start;
    setWeekAnchor(nextAnchor);
    setSelectedDay(addDays(nextStart, dayIndex));
  }

  function selectDay(day: Date) {
    setSelectedDay(day);
    setShowAllWeek(false);
  }

  const visibleGroups = showAllWeek ? groupByDay(weekTasks ?? []) : null;
  const noTasksAtAllThisWeek = (weekTasks?.length ?? 0) === 0;

  return (
    <main className="min-h-dvh pb-28 md:pb-12">
      <div className="mx-auto max-w-md px-4 pt-6 md:max-w-5xl md:px-8 md:pt-10">
        <header className="mb-5 flex items-center justify-between md:mb-8">
          <div>
            <p className="text-sm text-slate-400">Hey there 👋</p>
            <h1 className="text-xl font-bold text-slate-900">Let&apos;s get things done</h1>
          </div>
          <Button size="md" className="hidden md:inline-flex" onClick={() => openCreate(selectedDay)}>
            <Plus className="h-4 w-4" /> Add Task
          </Button>
        </header>

        <div className="grid gap-6 md:grid-cols-[1fr_360px] md:gap-8">
          <div className="flex flex-col gap-5">
            <SearchEntry />

            <WeekStrip
              days={days}
              selected={selectedDay}
              onSelect={selectDay}
              daysWithTasks={daysWithTasks}
              onPrevWeek={() => goToWeek(-1)}
              onNextWeek={() => goToWeek(1)}
              weekLabel={weekLabel}
            />

            <StatCards completed={completed} pending={pending} />
            <ProgressBar completed={completed} total={completed + pending} />

            <section>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-900">
                  {showAllWeek ? `All tasks · ${weekLabel}` : formatDayLabel(selectedDay)}
                </h2>
                {!showAllWeek ? (
                  <button
                    type="button"
                    onClick={() => setShowAllWeek(true)}
                    className="text-sm font-semibold text-brand-600 hover:text-brand-700"
                  >
                    View All
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowAllWeek(false)}
                    className="text-sm font-semibold text-brand-600 hover:text-brand-700"
                  >
                    Show {formatDayLabel(selectedDay)}
                  </button>
                )}
              </div>

              {isLoading ? (
                <ListSkeleton />
              ) : isError ? (
                <ErrorState message="Couldn't load your tasks." onRetry={() => refetch()} />
              ) : showAllWeek ? (
                visibleGroups && visibleGroups.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    {visibleGroups.map((group) => (
                      <div key={group.key}>
                        <p className="mb-1.5 text-xs font-semibold tracking-wide text-slate-400 uppercase">{group.label}</p>
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
                    ))}
                  </div>
                ) : (
                  <EmptyState title="No tasks this week" description="Tap the + button to add your first one." />
                )
              ) : dayTasks.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {dayTasks.map((task) => (
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
              ) : (
                <EmptyState
                  title="Nothing here yet"
                  description={
                    noTasksAtAllThisWeek
                      ? "New here? Load a few example tasks around today to see how it looks."
                      : "Tap the + button to add a task for this day."
                  }
                  action={
                    noTasksAtAllThisWeek ? (
                      <Button variant="secondary" onClick={() => seedSample.mutate()} isLoading={seedSample.isPending}>
                        Load sample tasks
                      </Button>
                    ) : undefined
                  }
                />
              )}
            </section>
          </div>

          <div>
            <h2 className="mb-2 text-base font-semibold text-slate-900">Weekly overview</h2>
            {summariesQuery.isError ? (
              <ErrorState message="Couldn't load the weekly overview." onRetry={() => summariesQuery.refetch()} />
            ) : (
              <WeekOverviewList weeks={summariesQuery.data ?? []} isLoading={summariesQuery.isLoading} />
            )}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => openCreate(selectedDay)}
        aria-label="Add task"
        className="fixed right-6 bottom-[calc(env(safe-area-inset-bottom)+1.5rem)] flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg shadow-brand-600/30 transition-transform active:scale-95 md:hidden"
      >
        <Plus className="h-6 w-6" />
      </button>
    </main>
  );
}
