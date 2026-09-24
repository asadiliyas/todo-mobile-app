import type { Priority, TaskStatus } from "@/lib/task-constants";

/** What the API sends to the client. Dates are ISO strings over JSON. */
export interface TaskDTO {
  id: string;
  title: string;
  description: string;
  startAt: string;
  endAt?: string;
  priority?: Priority;
  status: TaskStatus;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WeekSummary {
  weekStart: string;
  weekEnd: string;
  label: string;
  open: number;
  completed: number;
  total: number;
}

export interface ApiErrorBody {
  error: {
    message: string;
    code: string;
    fieldErrors?: Record<string, string>;
  };
}
