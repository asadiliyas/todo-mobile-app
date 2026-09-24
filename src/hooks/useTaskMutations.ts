"use client";

import { useMutation, useQueryClient, type QueryClient, type QueryKey } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type { TaskDTO } from "@/lib/types";
import type { TaskInput, TaskUpdateInput } from "@/lib/validation";

const isTaskQuery = (query: { queryKey: QueryKey }) => query.queryKey[0] === "tasks";

function snapshotTaskQueries(queryClient: QueryClient) {
  return queryClient.getQueriesData<TaskDTO[]>({ predicate: isTaskQuery });
}

function restoreTaskQueries(queryClient: QueryClient, entries: ReturnType<typeof snapshotTaskQueries>) {
  for (const [key, data] of entries) queryClient.setQueryData(key, data);
}

function invalidateTaskQueries(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ predicate: isTaskQuery });
}

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

function applyOptimisticUpdate(task: TaskDTO, input: TaskUpdateInput): TaskDTO {
  const next: TaskDTO = { ...task };
  if (input.title !== undefined) next.title = input.title;
  if (input.description !== undefined) next.description = input.description;
  if (input.startAt !== undefined) next.startAt = input.startAt.toISOString();
  if ("endAt" in input) next.endAt = input.endAt ? input.endAt.toISOString() : undefined;
  if ("priority" in input) next.priority = input.priority ?? undefined;
  if (input.status !== undefined) {
    next.status = input.status;
    next.completedAt = input.status === "completed" ? new Date().toISOString() : undefined;
  }
  return next;
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: TaskInput) => api.create(input),
    onSuccess: () => {
      invalidateTaskQueries(queryClient);
      toast.success("Task created");
    },
    onError: (err) => toast.error(errorMessage(err, "Couldn't create the task")),
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: TaskUpdateInput }) => api.update(id, input),
    onMutate: async ({ id, input }) => {
      const entries = snapshotTaskQueries(queryClient);
      queryClient.setQueriesData<TaskDTO[]>({ predicate: isTaskQuery }, (old) =>
        old?.map((task) => (task.id === id ? applyOptimisticUpdate(task, input) : task)),
      );
      return { entries };
    },
    onError: (err, _vars, context) => {
      if (context) restoreTaskQueries(queryClient, context.entries);
      toast.error(errorMessage(err, "Couldn't save your changes"));
    },
    onSettled: () => invalidateTaskQueries(queryClient),
  });
}

/**
 * Deletes for real, but the success toast's "Undo" recreates the task from
 * its last known values. Simpler and more robust than a client-side grace
 * timer, at the small, documented cost that priority/description come
 * back but status resets to "in progress" (POST /api/tasks always starts
 * a task there).
 */
export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (task: TaskDTO) => api.remove(task.id),
    onMutate: async (task) => {
      const entries = snapshotTaskQueries(queryClient);
      queryClient.setQueriesData<TaskDTO[]>({ predicate: isTaskQuery }, (old) =>
        old?.filter((t) => t.id !== task.id),
      );
      return { entries };
    },
    onError: (err, _task, context) => {
      if (context) restoreTaskQueries(queryClient, context.entries);
      toast.error(errorMessage(err, "Couldn't delete the task"));
    },
    onSuccess: (_result, task) => {
      toast.success(`"${task.title}" deleted`, {
        duration: 6000,
        action: {
          label: "Undo",
          onClick: () => {
            api
              .create({
                title: task.title,
                description: task.description,
                startAt: new Date(task.startAt),
                endAt: task.endAt ? new Date(task.endAt) : undefined,
                priority: task.priority,
              })
              .then(() => {
                invalidateTaskQueries(queryClient);
                toast.success("Task restored");
              })
              .catch(() => toast.error("Couldn't restore the task"));
          },
        },
      });
    },
    onSettled: () => invalidateTaskQueries(queryClient),
  });
}

export function useSeedSample() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.seedSample(),
    onSuccess: (created) => {
      invalidateTaskQueries(queryClient);
      toast.success(`Added ${created.length} sample tasks`);
    },
    onError: (err) => toast.error(errorMessage(err, "Couldn't load sample tasks")),
  });
}
