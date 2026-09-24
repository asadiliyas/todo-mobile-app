import { describe, expect, it } from "vitest";
import { atLocalTime, weekEndFromStart, weekStartUTCSafe } from "@/lib/server-week";

// These are the timezone-safe helpers the API uses, so unlike week.test.ts
// they hardcode exact instants and must pass identically no matter what
// timezone the machine running the test is in.

describe("weekStartUTCSafe", () => {
  const anchor = Date.parse("2026-09-24T10:00:00.000Z"); // Thursday
  const IST = -330;

  it("computes Monday 00:00 IST regardless of the host's own timezone", () => {
    expect(weekStartUTCSafe(anchor, IST).toISOString()).toBe("2026-09-20T18:30:00.000Z");
  });

  it("shifts by whole weeks", () => {
    expect(weekStartUTCSafe(anchor, IST, 1).toISOString()).toBe("2026-09-27T18:30:00.000Z");
    expect(weekStartUTCSafe(anchor, IST, -1).toISOString()).toBe("2026-09-13T18:30:00.000Z");
  });

  it("agrees with plain UTC math when the offset is 0", () => {
    expect(weekStartUTCSafe(anchor, 0).toISOString()).toBe("2026-09-21T00:00:00.000Z");
  });
});

describe("weekEndFromStart", () => {
  it("is exactly 1ms before the next week starts", () => {
    const start = new Date("2026-09-20T18:30:00.000Z");
    const end = weekEndFromStart(start);
    expect(end.getTime()).toBe(start.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);
  });
});

describe("atLocalTime", () => {
  it("places 9am IST at the correct real instant", () => {
    const anchor = Date.parse("2026-09-24T02:00:00.000Z"); // 7:30am IST
    expect(atLocalTime(anchor, -330, 0, 9, 0).toISOString()).toBe("2026-09-24T03:30:00.000Z");
  });

  it("supports day offsets", () => {
    const anchor = Date.parse("2026-09-24T02:00:00.000Z");
    expect(atLocalTime(anchor, -330, 1, 9, 0).toISOString()).toBe("2026-09-25T03:30:00.000Z");
  });
});
