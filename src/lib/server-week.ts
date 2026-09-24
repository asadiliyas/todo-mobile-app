/**
 * Timezone-safe week math for the server.
 *
 * The client always knows its own local time correctly (a browser's plain
 * `Date` getters ARE local time). A server doesn't — Vercel functions run
 * in UTC, so naive `date-fns` week math there would use UTC day boundaries,
 * not the visitor's. Fix: the client sends its `Date.getTimezoneOffset()`
 * (e.g. -330 for IST) and every boundary below is computed using only
 * `getUTC*`/`Date.UTC`, which are immune to whatever timezone the server
 * process itself happens to be in.
 */

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

/** The real instant marking Monday 00:00:00.000 *in the visitor's timezone*
 *  for the week containing `anchorMs`, shifted by `weekDelta` whole weeks. */
export function weekStartUTCSafe(
  anchorMs: number,
  tzOffsetMinutes: number,
  weekDelta = 0,
): Date {
  const offsetMs = tzOffsetMinutes * 60_000;
  const local = new Date(anchorMs - offsetMs); // wall-clock time, stored using UTC fields
  const dow = local.getUTCDay(); // 0 = Sun .. 6 = Sat
  const sinceMonday = (dow + 6) % 7;

  const localMonday = Date.UTC(
    local.getUTCFullYear(),
    local.getUTCMonth(),
    local.getUTCDate() - sinceMonday,
    0,
    0,
    0,
    0,
  );

  return new Date(localMonday + offsetMs + weekDelta * WEEK_MS);
}

export function weekEndFromStart(weekStart: Date): Date {
  return new Date(weekStart.getTime() + WEEK_MS - 1);
}

/** The real instant for `hour:minute` on the day `dayDelta` from `anchorMs`,
 *  in the visitor's own timezone. Used to place demo/sample tasks sensibly
 *  ("today at 9am") regardless of where the server process itself runs. */
export function atLocalTime(
  anchorMs: number,
  tzOffsetMinutes: number,
  dayDelta: number,
  hour: number,
  minute: number,
): Date {
  const offsetMs = tzOffsetMinutes * 60_000;
  const local = new Date(anchorMs - offsetMs);
  const wallClock = Date.UTC(
    local.getUTCFullYear(),
    local.getUTCMonth(),
    local.getUTCDate() + dayDelta,
    hour,
    minute,
    0,
    0,
  );
  return new Date(wallClock + offsetMs);
}

/** Shift an instant so that passing it to date-fns's *local* getters/format
 *  on a UTC server reproduces the visitor's local calendar fields. Cosmetic
 *  labels only — bucket boundaries above never depend on this. */
export function shiftForDisplay(date: Date, tzOffsetMinutes: number): Date {
  return new Date(date.getTime() - tzOffsetMinutes * 60_000);
}
