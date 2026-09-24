import { NextRequest } from "next/server";
import { dbConnect } from "@/lib/db";
import { Task } from "@/models/Task";
import { getOwnerId } from "@/lib/owner";
import { ok, badRequest, withErrorHandling } from "@/lib/api-response";
import { formatWeekLabel } from "@/lib/week";
import { shiftForDisplay, weekEndFromStart, weekStartUTCSafe } from "@/lib/server-week";
import type { WeekSummary } from "@/lib/types";

export const dynamic = "force-dynamic";

const MAX_WEEKS_EACH_SIDE = 26;

/**
 * GET /api/tasks/weeks?tzOffsetMinutes=-330&back=4&forward=8&anchor=<ISO>
 *
 * Open vs. completed task counts per Monday–Sunday week, for the weekly
 * overview cards. `tzOffsetMinutes` is `new Date().getTimezoneOffset()`
 * from the browser — see src/lib/server-week.ts for why that's needed.
 */
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    await dbConnect();
    const ownerId = await getOwnerId();
    const { searchParams } = new URL(request.url);

    const tzOffsetRaw = searchParams.get("tzOffsetMinutes");
    if (tzOffsetRaw === null || Number.isNaN(Number(tzOffsetRaw))) {
      badRequest("tzOffsetMinutes is required (e.g. new Date().getTimezoneOffset())");
    }
    const tzOffsetMinutes = Number(tzOffsetRaw);

    const anchorRaw = searchParams.get("anchor");
    const anchorMs = anchorRaw ? new Date(anchorRaw).getTime() : Date.now();
    if (Number.isNaN(anchorMs)) badRequest("anchor must be a valid date");

    const back = clamp(Number(searchParams.get("back") ?? 4), 0, MAX_WEEKS_EACH_SIDE);
    const forward = clamp(Number(searchParams.get("forward") ?? 8), 0, MAX_WEEKS_EACH_SIDE);

    const buckets = Array.from({ length: back + forward + 1 }, (_, i) => {
      const delta = i - back;
      const start = weekStartUTCSafe(anchorMs, tzOffsetMinutes, delta);
      const end = weekEndFromStart(start);
      return { delta, start, end, open: 0, completed: 0 };
    });

    const windowStart = buckets[0].start;
    const windowEnd = buckets[buckets.length - 1].end;

    const docs = await Task.find({
      ownerId,
      startAt: { $gte: windowStart, $lte: windowEnd },
    })
      .select("startAt status")
      .lean<{ startAt: Date; status: "in_progress" | "completed" }[]>();

    for (const doc of docs) {
      const ms = doc.startAt.getTime();
      const bucket = buckets.find((b) => ms >= b.start.getTime() && ms <= b.end.getTime());
      if (!bucket) continue;
      if (doc.status === "completed") bucket.completed += 1;
      else bucket.open += 1;
    }

    const now = shiftForDisplay(new Date(anchorMs), tzOffsetMinutes);

    const summaries: WeekSummary[] = buckets.map((b) => ({
      weekStart: b.start.toISOString(),
      weekEnd: b.end.toISOString(),
      label: formatWeekLabel(shiftForDisplay(b.start, tzOffsetMinutes), now),
      open: b.open,
      completed: b.completed,
      total: b.open + b.completed,
    }));

    return ok(summaries);
  });
}

function clamp(n: number, min: number, max: number): number {
  if (Number.isNaN(n)) return min;
  return Math.min(max, Math.max(min, Math.trunc(n)));
}
