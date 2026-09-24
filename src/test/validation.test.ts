import { describe, expect, it } from "vitest";
import { taskInputSchema, taskUpdateSchema } from "@/lib/validation";

describe("taskInputSchema", () => {
  it("accepts a minimal valid task", () => {
    const result = taskInputSchema.safeParse({ title: "Buy milk", startAt: "2026-09-24T10:00:00.000Z" });
    expect(result.success).toBe(true);
  });

  it("rejects a blank title", () => {
    expect(taskInputSchema.safeParse({ title: "   ", startAt: "2026-09-24T10:00:00.000Z" }).success).toBe(false);
  });

  it("rejects a missing startAt", () => {
    expect(taskInputSchema.safeParse({ title: "Buy milk" }).success).toBe(false);
  });

  it("rejects endAt at or before startAt", () => {
    const base = { title: "Buy milk", startAt: "2026-09-24T10:00:00.000Z" };
    expect(taskInputSchema.safeParse({ ...base, endAt: "2026-09-24T09:00:00.000Z" }).success).toBe(false);
    expect(taskInputSchema.safeParse({ ...base, endAt: "2026-09-24T10:00:00.000Z" }).success).toBe(false);
  });

  it("rejects an unknown priority", () => {
    const result = taskInputSchema.safeParse({
      title: "Buy milk",
      startAt: "2026-09-24T10:00:00.000Z",
      priority: "urgent",
    });
    expect(result.success).toBe(false);
  });

  it("defaults description to an empty string", () => {
    const result = taskInputSchema.parse({ title: "Buy milk", startAt: "2026-09-24T10:00:00.000Z" });
    expect(result.description).toBe("");
  });
});

describe("taskUpdateSchema", () => {
  it("allows a status-only update", () => {
    expect(taskUpdateSchema.safeParse({ status: "completed" }).success).toBe(true);
  });

  it("omits fields that weren't provided, instead of defaulting them", () => {
    const result = taskUpdateSchema.parse({ status: "completed" });
    expect(Object.keys(result)).toEqual(["status"]);
  });

  it("allows explicitly clearing endAt and priority with null", () => {
    expect(taskUpdateSchema.safeParse({ endAt: null, priority: null }).success).toBe(true);
  });

  it("rejects an invalid status value", () => {
    expect(taskUpdateSchema.safeParse({ status: "done" }).success).toBe(false);
  });
});
