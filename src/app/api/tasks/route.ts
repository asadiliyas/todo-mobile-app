import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Task } from "@/models/Task";
import { getOwnerId } from "@/lib/owner";
import { ok, withErrorHandling } from "@/lib/api-response";
import { serializeTask, type LeanTask } from "@/lib/serialize";
import { taskInputSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

// GET /api/tasks              -> everything for this browser
// GET /api/tasks?q=keyword    -> title/description search
// GET /api/tasks?from&to      -> tasks whose startAt falls in [from, to]
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    await dbConnect();
    const ownerId = await getOwnerId();
    const { searchParams } = new URL(request.url);

    const q = searchParams.get("q")?.trim();
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const filter: Record<string, unknown> = { ownerId };

    if (q) {
      const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp(escaped, "i");
      filter.$or = [{ title: re }, { description: re }];
    } else if (from && to) {
      const fromDate = new Date(from);
      const toDate = new Date(to);
      filter.startAt = { $gte: fromDate, $lte: toDate };
    }

    const docs = await Task.find(filter)
      .sort({ startAt: 1 })
      .limit(500)
      .lean<LeanTask[]>();

    return ok(docs.map(serializeTask));
  });
}

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    await dbConnect();
    const ownerId = await getOwnerId();
    const body = await request.json().catch(() => ({}));
    const input = taskInputSchema.parse(body);

    const doc = await Task.create({ ...input, ownerId, status: "in_progress" });
    return ok(serializeTask(doc.toObject() as LeanTask), { status: 201 });
  });
}

export async function OPTIONS() {
  return NextResponse.json(null, { status: 204 });
}
