import { NextRequest } from "next/server";
import { dbConnect } from "@/lib/db";
import { Task } from "@/models/Task";
import { getOwnerId } from "@/lib/owner";
import { ok, badRequest, withErrorHandling } from "@/lib/api-response";
import { serializeTask, type LeanTask } from "@/lib/serialize";
import { atLocalTime } from "@/lib/server-week";
import type { Priority, TaskStatus } from "@/lib/task-constants";

export const dynamic = "force-dynamic";

interface SampleSpec {
  title: string;
  description: string;
  dayDelta: number;
  hour: number;
  minute: number;
  durationMinutes?: number;
  priority?: Priority;
  status?: TaskStatus;
}

const SAMPLE_TASKS: SampleSpec[] = [
  { title: "Finishing Wireframe", description: "Home, Add Task and Search screens.", dayDelta: 0, hour: 9, minute: 0, durationMinutes: 90, priority: "high" },
  { title: "Meeting with team", description: "Weekly sync on sprint progress.", dayDelta: 0, hour: 11, minute: 30, durationMinutes: 45, priority: "medium" },
  { title: "Buy a cat food", description: "", dayDelta: 0, hour: 17, minute: 0, priority: "low", status: "completed" },
  { title: "Finishing daily commission", description: "Client illustration piece.", dayDelta: 0, hour: 20, minute: 0, status: "completed" },
  { title: "Doing Homework", description: "Math worksheet, chapters 4-5.", dayDelta: 1, hour: 16, minute: 0, durationMinutes: 60, priority: "medium" },
  { title: "Dentist appointment", description: "Routine checkup.", dayDelta: 2, hour: 10, minute: 0, priority: "high" },
  { title: "Grocery run", description: "Milk, eggs, bread, vegetables.", dayDelta: 3, hour: 18, minute: 30, priority: "low" },
  { title: "Plan next sprint", description: "Draft tickets for the team.", dayDelta: 7, hour: 10, minute: 0, priority: "medium" },
  { title: "Book flight tickets", description: "For the December trip.", dayDelta: 9, hour: 12, minute: 0 },
  { title: "Submit tax documents", description: "", dayDelta: -2, hour: 9, minute: 0, status: "completed" },
  { title: "Car service", description: "Oil change and tire rotation.", dayDelta: -4, hour: 14, minute: 0, status: "completed", priority: "low" },
  { title: "Review pull requests", description: "Backend API review.", dayDelta: -1, hour: 15, minute: 0, status: "completed", priority: "high" },
];

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    await dbConnect();
    const ownerId = await getOwnerId();

    const body = await request.json().catch(() => ({}));
    const tzOffsetMinutes = Number(body?.tzOffsetMinutes);
    if (Number.isNaN(tzOffsetMinutes)) {
      badRequest("tzOffsetMinutes is required (e.g. new Date().getTimezoneOffset())");
    }
    const anchorMs = Date.now();

    const docs = SAMPLE_TASKS.map((spec) => {
      const startAt = atLocalTime(anchorMs, tzOffsetMinutes, spec.dayDelta, spec.hour, spec.minute);
      const endAt = spec.durationMinutes
        ? new Date(startAt.getTime() + spec.durationMinutes * 60_000)
        : undefined;
      return {
        ownerId,
        title: spec.title,
        description: spec.description,
        startAt,
        endAt,
        priority: spec.priority,
        status: spec.status ?? "in_progress",
        completedAt: spec.status === "completed" ? startAt : undefined,
      };
    });

    const created = await Task.insertMany(docs);
    return ok(created.map((doc) => serializeTask(doc.toObject() as LeanTask)), { status: 201 });
  });
}
