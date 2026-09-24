"use client";

import { useTaskSheet } from "@/components/TaskSheetProvider";
import { useDeleteTask, useUpdateTask } from "@/hooks/useTaskMutations";
import type { TaskDTO } from "@/lib/types";

/** Shared wiring for a <TaskRow>, so Home's list, the weekly-overview
 *  accordion and the Search results all behave identically. */
export function useTaskRowActions() {
  const { openEdit, openView } = useTaskSheet();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  return {
    onToggleStatus: (task: TaskDTO, checked: boolean) =>
      updateTask.mutate({ id: task.id, input: { status: checked ? "completed" : "in_progress" } }),
    onEdit: (task: TaskDTO) => openEdit(task),
    onOpenView: (task: TaskDTO) => openView(task),
    onDelete: (task: TaskDTO) => deleteTask.mutate(task),
  };
}
