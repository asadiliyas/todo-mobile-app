"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { format } from "date-fns";
import { Pencil, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/Checkbox";
import { PriorityDot } from "@/components/PriorityControls";
import { cn } from "@/lib/cn";
import type { TaskDTO } from "@/lib/types";

const DELETE_WIDTH = 88;

interface TaskRowProps {
  task: TaskDTO;
  onToggleStatus: (checked: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
  onOpenView: () => void;
}

function timeLabel(task: TaskDTO): string {
  const start = format(new Date(task.startAt), "h:mm a");
  if (!task.endAt) return start;
  return `${start} – ${format(new Date(task.endAt), "h:mm a")}`;
}

/**
 * Matches the Figma row (checkbox, title, always-visible edit/delete
 * icons) *and* the brief's flow (swipe left reveals a Delete action) —
 * both call the same delete handler, so keyboard/no-touch users always
 * have the icon button.
 */
export function TaskRow({ task, onToggleStatus, onEdit, onDelete, onOpenView }: TaskRowProps) {
  const [revealed, setRevealed] = useState(false);
  const reduceMotion = useReducedMotion();
  const isCompleted = task.status === "completed";

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <div className="absolute inset-y-0 right-0 flex w-[88px] items-center justify-center bg-red-500">
        <button
          type="button"
          onClick={() => {
            setRevealed(false);
            onDelete();
          }}
          className="flex h-full w-full flex-col items-center justify-center gap-1 text-white"
        >
          <Trash2 className="h-5 w-5" />
          <span className="text-xs font-medium">Delete</span>
        </button>
      </div>

      <motion.div
        drag={reduceMotion ? false : "x"}
        dragDirectionLock
        dragConstraints={{ left: -DELETE_WIDTH, right: 0 }}
        dragElastic={{ left: 0.15, right: 0 }}
        dragMomentum={false}
        animate={{ x: revealed ? -DELETE_WIDTH : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 42 }}
        onDragEnd={(_event, info) => setRevealed(info.offset.x < -DELETE_WIDTH / 2)}
        className={cn(
          "relative flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-3.5 py-3",
        )}
      >
        <Checkbox
          checked={isCompleted}
          onChange={(e) => onToggleStatus(e.target.checked)}
          aria-label={isCompleted ? `Mark "${task.title}" as in progress` : `Mark "${task.title}" as complete`}
        />

        <button
          type="button"
          onClick={() => (revealed ? setRevealed(false) : onOpenView())}
          className="flex flex-1 flex-col items-start text-left"
        >
          <span className={cn("text-[15px] font-medium text-slate-800", isCompleted && "text-slate-400 line-through")}>
            {task.title}
          </span>
          <span className="text-xs text-slate-400">{timeLabel(task)}</span>
        </button>

        <PriorityDot priority={task.priority} />

        <button
          type="button"
          onClick={onEdit}
          aria-label={`Edit "${task.title}"`}
          className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Delete "${task.title}"`}
          className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </motion.div>
    </div>
  );
}
