import type { ApiErrorBody, TaskDTO, WeekSummary } from "@/lib/types";
import type { TaskInput, TaskUpdateInput } from "@/lib/validation";

export class ApiClientError extends Error {
  code: string;
  status: number;
  fieldErrors?: Record<string, string>;

  constructor(status: number, body: ApiErrorBody["error"]) {
    super(body.message);
    this.status = status;
    this.code = body.code;
    this.fieldErrors = body.fieldErrors;
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const body = (json as ApiErrorBody | null)?.error ?? {
      message: "Something went wrong. Please try again.",
      code: "UNKNOWN",
    };
    throw new ApiClientError(res.status, body);
  }

  return (json as { data: T }).data;
}

/** Every browser has its own local time; the server needs it for correct
 *  Monday–Sunday week boundaries. See src/lib/server-week.ts. */
function tzOffsetMinutes(): number {
  return new Date().getTimezoneOffset();
}

export const api = {
  listRange(from: Date, to: Date) {
    const params = new URLSearchParams({ from: from.toISOString(), to: to.toISOString() });
    return request<TaskDTO[]>(`/api/tasks?${params}`);
  },

  search(q: string) {
    const params = new URLSearchParams({ q });
    return request<TaskDTO[]>(`/api/tasks?${params}`);
  },

  create(input: TaskInput) {
    return request<TaskDTO>(`/api/tasks`, { method: "POST", body: JSON.stringify(input) });
  },

  update(id: string, input: TaskUpdateInput) {
    return request<TaskDTO>(`/api/tasks/${id}`, { method: "PATCH", body: JSON.stringify(input) });
  },

  remove(id: string) {
    return request<{ id: string }>(`/api/tasks/${id}`, { method: "DELETE" });
  },

  weeks(anchor: Date, back = 4, forward = 8) {
    const params = new URLSearchParams({
      tzOffsetMinutes: String(tzOffsetMinutes()),
      anchor: anchor.toISOString(),
      back: String(back),
      forward: String(forward),
    });
    return request<WeekSummary[]>(`/api/tasks/weeks?${params}`);
  },

  seedSample() {
    return request<TaskDTO[]>(`/api/tasks/sample`, {
      method: "POST",
      body: JSON.stringify({ tzOffsetMinutes: tzOffsetMinutes() }),
    });
  },
};
