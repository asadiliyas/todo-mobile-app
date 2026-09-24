/**
 * Shared, framework-free constants/types for a task's enum fields.
 *
 * Deliberately has zero imports. `src/models/Task.ts` imports Mongoose,
 * which pulls in Node built-ins (`tls`, `timers/promises`, …) that don't
 * exist in the browser — importing so much as a `Priority` type from a
 * client component through that file would drag Mongoose into the
 * client bundle and break the build. Client code imports from here
 * instead; the Mongoose model imports these same values from here too.
 */

export const PRIORITIES = ["low", "medium", "high"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const STATUSES = ["in_progress", "completed"] as const;
export type TaskStatus = (typeof STATUSES)[number];
