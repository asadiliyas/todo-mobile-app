"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { TaskForm, type TaskFormSubmitValues } from "@/components/TaskForm";
import { TaskDetails } from "@/components/TaskDetails";
import { useCreateTask, useDeleteTask, useUpdateTask } from "@/hooks/useTaskMutations";
import type { TaskDTO } from "@/lib/types";

type SheetState =
  | { mode: "closed" }
  | { mode: "create"; defaultDate: Date }
  | { mode: "edit"; task: TaskDTO }
  | { mode: "view"; task: TaskDTO };

interface TaskSheetContextValue {
  openCreate: (defaultDate?: Date) => void;
  openEdit: (task: TaskDTO) => void;
  openView: (task: TaskDTO) => void;
}

const TaskSheetContext = createContext<TaskSheetContextValue | null>(null);

export function useTaskSheet(): TaskSheetContextValue {
  const ctx = useContext(TaskSheetContext);
  if (!ctx) throw new Error("useTaskSheet must be used within TaskSheetProvider");
  return ctx;
}

export function TaskSheetProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SheetState>({ mode: "closed" });
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const close = () => setState({ mode: "closed" });

  const ctxValue = useMemo<TaskSheetContextValue>(
    () => ({
      openCreate: (defaultDate = new Date()) => setState({ mode: "create", defaultDate }),
      openEdit: (task) => setState({ mode: "edit", task }),
      openView: (task) => setState({ mode: "view", task }),
    }),
    [],
  );

  function handleFormSubmit(values: TaskFormSubmitValues) {
    if (state.mode === "create") {
      createTask.mutate(
        {
          title: values.title,
          description: values.description,
          startAt: values.startAt,
          endAt: values.endAt,
          priority: values.priority,
        },
        { onSuccess: close },
      );
    } else if (state.mode === "edit") {
      updateTask.mutate(
        {
          id: state.task.id,
          input: {
            title: values.title,
            description: values.description,
            startAt: values.startAt,
            endAt: values.endAt ?? null,
            priority: values.priority ?? null,
            status: values.status,
          },
        },
        { onSuccess: close },
      );
    }
  }

  const title =
    state.mode === "create" ? "Add New Task" : state.mode === "edit" ? "Edit Task" : state.mode === "view" ? "Task details" : "";

  return (
    <TaskSheetContext.Provider value={ctxValue}>
      {children}

      <Sheet open={state.mode !== "closed"} onClose={close} title={title}>
        {state.mode === "create" || state.mode === "edit" ? (
          <TaskForm
            task={state.mode === "edit" ? state.task : undefined}
            defaultDate={state.mode === "create" ? state.defaultDate : undefined}
            onSubmit={handleFormSubmit}
            onCancel={close}
            isSubmitting={createTask.isPending || updateTask.isPending}
          />
        ) : state.mode === "view" ? (
          <TaskDetails
            task={state.task}
            onEdit={() => setState({ mode: "edit", task: state.task })}
            onDelete={() => {
              deleteTask.mutate(state.task);
              close();
            }}
            onToggleStatus={() => {
              const nextStatus = state.task.status === "completed" ? "in_progress" : "completed";
              updateTask.mutate(
                { id: state.task.id, input: { status: nextStatus } },
                {
                  onSuccess: (updated) => setState({ mode: "view", task: updated }),
                },
              );
            }}
            isToggling={updateTask.isPending}
          />
        ) : null}
      </Sheet>
    </TaskSheetContext.Provider>
  );
}
