import { describe, expect, it } from "vitest";
import { formatDayLabel, formatWeekLabel, getWeekRange, isSameDay, listWeekDays, shiftWeek } from "@/lib/week";

// 2026-09-24 is a Thursday, so its Monday–Sunday week is 09-21..09-27.

describe("getWeekRange", () => {
  it("starts on Monday and ends on Sunday", () => {
    const { start, end } = getWeekRange(new Date(2026, 8, 24));
    expect(start.getDay()).toBe(1);
    expect(end.getDay()).toBe(0);
    expect(end.getTime() - start.getTime()).toBe(7 * 24 * 60 * 60 * 1000 - 1);
  });

  it("keeps a Monday probe as the start of its own week", () => {
    const monday = new Date(2026, 8, 21);
    const { start } = getWeekRange(monday);
    expect(start.toDateString()).toBe(monday.toDateString());
  });
});

describe("listWeekDays", () => {
  it("returns 7 consecutive days starting Monday", () => {
    const days = listWeekDays(new Date(2026, 8, 24));
    expect(days).toHaveLength(7);
    expect(days[0].getDay()).toBe(1);
    expect(days[6].getDay()).toBe(0);
    for (let i = 1; i < 7; i++) {
      expect(days[i].getTime() - days[i - 1].getTime()).toBe(24 * 60 * 60 * 1000);
    }
  });
});

describe("formatWeekLabel", () => {
  const now = new Date(2026, 8, 24);
  const { start: thisStart } = getWeekRange(now);

  it("labels the current week", () => {
    expect(formatWeekLabel(thisStart, now)).toBe("This week");
  });

  it("labels next and last week", () => {
    expect(formatWeekLabel(shiftWeek(thisStart, 1), now)).toBe("Next week");
    expect(formatWeekLabel(shiftWeek(thisStart, -1), now)).toBe("Last week");
  });

  it("falls back to a date range further out", () => {
    expect(formatWeekLabel(shiftWeek(thisStart, 5), now)).toMatch(/–/);
  });
});

describe("formatDayLabel", () => {
  const now = new Date(2026, 8, 24, 10, 0, 0);

  it("labels today, tomorrow and yesterday", () => {
    expect(formatDayLabel(now, now)).toBe("Today");
    expect(formatDayLabel(new Date(2026, 8, 25), now)).toBe("Tomorrow");
    expect(formatDayLabel(new Date(2026, 8, 23), now)).toBe("Yesterday");
  });

  it("falls back to a weekday + date further out", () => {
    expect(formatDayLabel(new Date(2026, 8, 30), now)).not.toMatch(/Today|Tomorrow|Yesterday/);
  });
});

describe("isSameDay", () => {
  it("ignores time-of-day", () => {
    expect(isSameDay(new Date(2026, 8, 24, 1, 0), new Date(2026, 8, 24, 23, 0))).toBe(true);
    expect(isSameDay(new Date(2026, 8, 24), new Date(2026, 8, 25))).toBe(false);
  });
});
