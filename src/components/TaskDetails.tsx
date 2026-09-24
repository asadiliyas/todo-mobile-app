import { format } from "date-fns";
import { Pencil, Trash2, CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PriorityDot, priorityLabel } from "@/components/PriorityControls";
import { formatDayLabel } from "@/lib/week";
import { cn } from "@/lib/cn";
import type { TaskDTO } from "@/lib/types";

interface TaskDetailsProps {
  task: TaskDTO;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
  isToggling?: boolean;
}

export function TaskDetails({ task, onEdit, onDelete, onToggleStatus, isToggling }: TaskDetailsProps) {
  const start = new Date(task.startAt);
  const isCompleted = task.status === "completed";
  const timeLabel = task.endAt
    ? `${format(start, "h:mm a")} – ${format(new Date(task.endAt), "h:mm a")}`
    : format(start, "h:mm a");

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-semibold",
            isCompleted ? "bg-emerald-50 text-emerald-600" : "bg-brand-50 text-brand-700",
          )}
        >
          {isCompleted ? "Completed" : "In progress"}
        </span>
        {task.priority ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
            <PriorityDot priority={task.priority} />
            {priorityLabel(task.priority)} priority
          </span>
        ) : null}
      </div>

      <div>
        <h3 className={cn("text-xl font-semibold text-slate-900", isCompleted && "text-slate-400 line-through")}>
          {task.title}
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          {formatDayLabel(start)} · {timeLabel}
        </p>
      </div>

      <div>
        <h4 className="text-sm font-medium text-slate-500">Description</h4>
        <p className="mt-1 whitespace-pre-wrap text-[15px] text-slate-700">
          {task.description || <span className="text-slate-400">No description added.</span>}
        </p>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <Button variant="secondary" size="lg" className="flex-1" onClick={onToggleStatus} isLoading={isToggling}>
          {isCompleted ? <Circle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
          {isCompleted ? "Mark in progress" : "Mark complete"}
        </Button>
        <Button variant="ghost" size="icon" aria-label="Edit task" onClick={onEdit}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="danger" size="icon" aria-label="Delete task" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
