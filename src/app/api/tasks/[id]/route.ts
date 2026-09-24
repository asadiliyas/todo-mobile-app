import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/db";
import { Task, type TaskStatus } from "@/models/Task";
import { getOwnerId } from "@/lib/owner";
import { ok, notFound, withErrorHandling } from "@/lib/api-response";
import { serializeTask, type LeanTask } from "@/lib/serialize";
import { taskUpdateSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

async function findOwnedTask(id: string, ownerId: string) {
  if (!mongoose.isValidObjectId(id)) notFound("Task not found");
  const doc = await Task.findOne({ _id: id, ownerId });
  if (!doc) notFound("Task not found");
  return doc;
}

export async function GET(_request: NextRequest, { params }: Params) {
  return withErrorHandling(async () => {
    await dbConnect();
    const ownerId = await getOwnerId();
    const { id } = await params;
    const doc = await findOwnedTask(id, ownerId);
    return ok(serializeTask(doc.toObject() as LeanTask));
  });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  return withErrorHandling(async () => {
    await dbConnect();
    const ownerId = await getOwnerId();
    const { id } = await params;
    const doc = await findOwnedTask(id, ownerId);

    const body = await request.json().catch(() => ({}));
    const input = taskUpdateSchema.parse(body);

    if (input.title !== undefined) doc.title = input.title;
    if (input.description !== undefined) doc.description = input.description;
    if (input.startAt !== undefined) doc.startAt = input.startAt;
    if ("endAt" in input) doc.endAt = input.endAt ?? undefined;
    if ("priority" in input) doc.priority = input.priority ?? undefined;

    if (input.status !== undefined && input.status !== doc.status) {
      doc.status = input.status as TaskStatus;
      doc.completedAt = input.status === "completed" ? new Date() : undefined;
    }

    await doc.save();
    return ok(serializeTask(doc.toObject() as LeanTask));
  });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  return withErrorHandling(async () => {
    await dbConnect();
    const ownerId = await getOwnerId();
    const { id } = await params;
    const doc = await findOwnedTask(id, ownerId);
    await doc.deleteOne();
    return ok({ id: String(doc._id) });
  });
}
