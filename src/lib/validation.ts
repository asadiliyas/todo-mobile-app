import { z } from "zod";
import { PRIORITIES, STATUSES } from "@/lib/task-constants";

/**
 * Single source of truth for task shape. react-hook-form uses this on the
 * client (via @hookform/resolvers) and every API route uses it on the
 * server, so the same rules apply in both places.
 */
const title = z
  .string()
  .trim()
  .min(1, "Title is required")
  .max(120, "Keep the title under 120 characters");

const description = z
  .string()
  .trim()
  .max(1000, "Keep the description under 1000 characters");

const priority = z.enum(PRIORITIES);

export const taskInputSchema = z
  .object({
    title,
    description: description.optional().default(""),
    startAt: z.coerce.date({ error: "A valid date & start time is required" }),
    endAt: z.coerce.date().optional(),
    priority: priority.optional(),
  })
  .refine((data) => !data.endAt || data.endAt > data.startAt, {
    message: "End time must be after the start time",
    path: ["endAt"],
  });

export type TaskInput = z.infer<typeof taskInputSchema>;

// Partial update: every field is optional and, critically, fields left out
// stay `undefined` (no defaults applied) so the API only touches what the
// client actually sent instead of clobbering the rest of the document.
export const taskUpdateSchema = z
  .object({
    title: title.optional(),
    description: description.optional(),
    startAt: z.coerce.date().optional(),
    endAt: z.coerce.date().nullable().optional(),
    priority: priority.nullable().optional(),
    status: z.enum(STATUSES).optional(),
  })
  .refine((data) => !data.endAt || !data.startAt || data.endAt > data.startAt, {
    message: "End time must be after the start time",
    path: ["endAt"],
  });

export type TaskUpdateInput = z.infer<typeof taskUpdateSchema>;

export const searchQuerySchema = z.object({
  q: z.string().trim().min(1).max(200),
});

export const rangeQuerySchema = z.object({
  from: z.coerce.date(),
  to: z.coerce.date(),
});
