"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { TextInput, TextArea } from "@/components/ui/Field";
import { PrioritySelect } from "@/components/PriorityControls";
import { Button } from "@/components/ui/Button";
import { PRIORITIES, type Priority, type TaskStatus } from "@/lib/task-constants";
import type { TaskDTO } from "@/lib/types";

const formSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120, "Keep it under 120 characters"),
  description: z.string().trim().max(1000, "Keep it under 1000 characters").optional(),
  date: z.string().min(1, "Date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().optional(),
  priority: z.enum(PRIORITIES).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export interface TaskFormSubmitValues {
  title: string;
  description: string;
  startAt: Date;
  endAt?: Date;
  priority?: Priority;
  status?: TaskStatus;
}

interface TaskFormProps {
  task?: TaskDTO;
  defaultDate?: Date;
  onSubmit: (values: TaskFormSubmitValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

function combineDateAndTime(date: string, time: string): Date {
  return new Date(`${date}T${time}`);
}

export function TaskForm({ task, defaultDate, onSubmit, onCancel, isSubmitting, submitLabel }: TaskFormProps) {
  const isEdit = Boolean(task);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: task
      ? {
          title: task.title,
          description: task.description,
          date: format(new Date(task.startAt), "yyyy-MM-dd"),
          startTime: format(new Date(task.startAt), "HH:mm"),
          endTime: task.endAt ? format(new Date(task.endAt), "HH:mm") : "",
          priority: task.priority,
        }
      : {
          title: "",
          description: "",
          date: format(defaultDate ?? new Date(), "yyyy-MM-dd"),
          startTime: "",
          endTime: "",
          priority: undefined,
        },
  });

  const priority = watch("priority");
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? "in_progress");

  const submit = handleSubmit((values) => {
    const startAt = combineDateAndTime(values.date, values.startTime);
    if (Number.isNaN(startAt.getTime())) {
      setError("startTime", { message: "Enter a valid start time" });
      return;
    }

    let endAt: Date | undefined;
    if (values.endTime) {
      endAt = combineDateAndTime(values.date, values.endTime);
      if (endAt <= startAt) {
        setError("endTime", { message: "End time must be after the start time" });
        return;
      }
    }

    onSubmit({
      title: values.title,
      description: values.description ?? "",
      startAt,
      endAt,
      priority: values.priority,
      status: isEdit ? status : undefined,
    });
  });

  return (
    <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
      {isEdit ? (
        <div className="flex gap-2 rounded-xl bg-slate-100 p-1" role="radiogroup" aria-label="Task status">
          {(["in_progress", "completed"] as const).map((value) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={status === value}
              onClick={() => setStatus(value)}
              className={
                status === value
                  ? "flex-1 rounded-lg bg-white py-2 text-sm font-semibold text-brand-700 shadow-sm"
                  : "flex-1 rounded-lg py-2 text-sm font-medium text-slate-500"
              }
            >
              {value === "in_progress" ? "In progress" : "Completed"}
            </button>
          ))}
        </div>
      ) : null}

      <TextInput label="Task title" placeholder="e.g. Finishing Wireframe" error={errors.title?.message} {...register("title")} />

      <PrioritySelect value={priority} onChange={(value) => setValue("priority", value)} />

      <div>
        <span className="mb-1.5 block text-sm font-medium text-slate-500">Set Time</span>
        <div className="grid grid-cols-2 gap-3">
          <TextInput label="Start" type="time" error={errors.startTime?.message} {...register("startTime")} />
          <TextInput label="Ends" type="time" error={errors.endTime?.message} {...register("endTime")} />
        </div>
      </div>

      <TextInput label="Set Date" type="date" error={errors.date?.message} {...register("date")} />

      <TextArea label="Description" placeholder="Add Description" error={errors.description?.message} {...register("description")} />

      <div className="flex gap-3 pt-1">
        <Button type="button" variant="ghost" size="lg" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="lg" className="flex-1" isLoading={isSubmitting}>
          {submitLabel ?? (isEdit ? "Save changes" : "Create task")}
        </Button>
      </div>
    </form>
  );
}
