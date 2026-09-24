import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { api } from "@/lib/api-client";
import { queryKeys } from "./query-keys";

export function useWeekTasks(weekStart: Date, weekEnd: Date, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.range(weekStart, weekEnd),
    queryFn: () => api.listRange(weekStart, weekEnd),
    enabled: options?.enabled ?? true,
  });
}

export function useSearchTasks(q: string) {
  const query = q.trim();
  return useQuery({
    queryKey: queryKeys.search(query),
    queryFn: () => api.search(query),
    enabled: query.length > 0,
  });
}

export function useWeekSummaries(back = 4, forward = 8) {
  const anchor = new Date();
  const anchorDay = format(anchor, "yyyy-MM-dd");
  return useQuery({
    queryKey: queryKeys.weeks(anchorDay, back, forward),
    queryFn: () => api.weeks(anchor, back, forward),
  });
}
