import { format } from "date-fns";

/** Central place for React Query key shapes so invalidation predicates
 *  (queryKey[0] === "tasks") stay correct everywhere they're used. */
export const queryKeys = {
  all: ["tasks"] as const,
  range: (from: Date, to: Date) =>
    ["tasks", "range", format(from, "yyyy-MM-dd'T'HH:mm"), format(to, "yyyy-MM-dd'T'HH:mm")] as const,
  search: (q: string) => ["tasks", "search", q] as const,
  weeks: (anchorDay: string, back: number, forward: number) =>
    ["tasks", "weeks", anchorDay, back, forward] as const,
};
