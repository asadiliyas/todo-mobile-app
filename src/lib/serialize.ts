import type { Types } from "mongoose";
import type { Priority, TaskStatus } from "@/lib/task-constants";
import type { TaskDTO } from "@/lib/types";

export interface LeanTask {
  _id: Types.ObjectId | string;
  title: string;
  description?: string;
  startAt: Date;
  endAt?: Date;
  priority?: Priority;
  status: TaskStatus;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/** Mongoose doc -> plain JSON-safe object. Deliberately drops `ownerId`. */
export function serializeTask(doc: LeanTask): TaskDTO {
  return {
    id: String(doc._id),
    title: doc.title,
    description: doc.description ?? "",
    startAt: doc.startAt.toISOString(),
    endAt: doc.endAt ? doc.endAt.toISOString() : undefined,
    priority: doc.priority,
    status: doc.status,
    completedAt: doc.completedAt ? doc.completedAt.toISOString() : undefined,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}
