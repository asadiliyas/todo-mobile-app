import {
  addDays,
  addWeeks,
  endOfDay,
  endOfWeek,
  format,
  isSameDay as dateFnsIsSameDay,
  isSameWeek,
  startOfDay,
  startOfWeek,
} from "date-fns";

/** The PRD is explicit: weeks run Monday through Sunday. */
const WEEK_OPTS = { weekStartsOn: 1 as const };

export interface DateRange {
  start: Date;
  end: Date;
}

export function getWeekRange(date: Date | number = new Date()): DateRange {
  return {
    start: startOfWeek(date, WEEK_OPTS),
    end: endOfWeek(date, WEEK_OPTS),
  };
}

export function getDayRange(date: Date | number = new Date()): DateRange {
  return { start: startOfDay(date), end: endOfDay(date) };
}

/** The 7 calendar days (Mon..Sun) belonging to the week containing `date`. */
export function listWeekDays(date: Date | number = new Date()): Date[] {
  const { start } = getWeekRange(date);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function shiftWeek(date: Date, deltaWeeks: number): Date {
  return addWeeks(date, deltaWeeks);
}

export function isSameDay(a: Date | number, b: Date | number): boolean {
  return dateFnsIsSameDay(a, b);
}

/** Stable key for grouping tasks by the week they fall in, e.g. "2026-09-21". */
export function weekKey(date: Date | number): string {
  return format(startOfWeek(date, WEEK_OPTS), "yyyy-MM-dd");
}

/** Human label matching the brief's flow: "This week" / "Next week" / a date range. */
export function formatWeekLabel(start: Date, now: Date = new Date()): string {
  if (isSameWeek(start, now, WEEK_OPTS)) return "This week";
  if (isSameWeek(start, addWeeks(now, 1), WEEK_OPTS)) return "Next week";
  if (isSameWeek(start, addWeeks(now, -1), WEEK_OPTS)) return "Last week";

  const end = endOfWeek(start, WEEK_OPTS);
  const sameMonth = start.getMonth() === end.getMonth();
  return sameMonth
    ? `${format(start, "d")} – ${format(end, "d MMM")}`
    : `${format(start, "d MMM")} – ${format(end, "d MMM")}`;
}

export function formatDayLabel(date: Date, now: Date = new Date()): string {
  if (isSameDay(date, now)) return "Today";
  if (isSameDay(date, addDays(now, 1))) return "Tomorrow";
  if (isSameDay(date, addDays(now, -1))) return "Yesterday";
  return format(date, "EEE d MMM");
}
