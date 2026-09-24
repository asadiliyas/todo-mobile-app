import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { PRIORITIES, STATUSES } from "@/lib/task-constants";

// Re-exported for server-only files that already import these alongside
// `Task` from here. Client code should import from "@/lib/task-constants"
// directly instead — see the comment there for why.
export { PRIORITIES, STATUSES };
export type { Priority, TaskStatus } from "@/lib/task-constants";

const taskSchema = new Schema(
  {
    // Scopes every task to the anonymous device/browser that created it
    // (see src/lib/owner.ts). Never exposed to the client.
    ownerId: { type: String, required: true, index: true },

    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 1000, default: "" },

    startAt: { type: Date, required: true },
    endAt: { type: Date },

    priority: { type: String, enum: PRIORITIES },

    status: {
      type: String,
      enum: STATUSES,
      default: "in_progress",
      required: true,
    },
    completedAt: { type: Date },
  },
  { timestamps: true },
);

taskSchema.index({ ownerId: 1, startAt: 1 });
taskSchema.index({ ownerId: 1, title: "text", description: "text" });

export type TaskDoc = InferSchemaType<typeof taskSchema>;

// Prevent "Cannot overwrite model" errors from Next.js hot reload / the
// serverless module cache reusing the same process across invocations.
export const Task: Model<TaskDoc> =
  (models.Task as Model<TaskDoc>) || model<TaskDoc>("Task", taskSchema);
