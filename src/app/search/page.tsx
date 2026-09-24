"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, X } from "lucide-react";
import { TaskRow } from "@/components/TaskRow";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/StateViews";
import { useSearchTasks } from "@/hooks/useTasks";
import { useTaskRowActions } from "@/hooks/useTaskRowActions";

export default function SearchPage() {
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const actions = useTaskRowActions();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setQuery(input.trim()), 300);
    return () => clearTimeout(timer);
  }, [input]);

  const { data: results, isLoading, isError, refetch } = useSearchTasks(query);

  return (
    <main className="mx-auto min-h-dvh max-w-md px-4 pt-6 md:max-w-2xl md:pt-10">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          aria-label="Back to home"
          className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>

        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search by title or description"
            aria-label="Search tasks"
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pr-10 pl-10 text-[15px] text-slate-800 outline-none placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
          {input ? (
            <button
              type="button"
              onClick={() => setInput("")}
              aria-label="Clear search"
              className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-6">
        {query.length === 0 ? (
          <EmptyState title="Search your tasks" description="Start typing a title or description to find one." />
        ) : isLoading ? (
          <ListSkeleton />
        ) : isError ? (
          <ErrorState message="Couldn't search right now." onRetry={() => refetch()} />
        ) : results && results.length > 0 ? (
          <div className="flex flex-col gap-2">
            {results.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                onToggleStatus={(checked) => actions.onToggleStatus(task, checked)}
                onEdit={() => actions.onEdit(task)}
                onOpenView={() => actions.onOpenView(task)}
                onDelete={() => actions.onDelete(task)}
              />
            ))}
          </div>
        ) : (
          <EmptyState title="No matching tasks" description={`Nothing found for "${query}".`} />
        )}
      </div>
    </main>
  );
}
