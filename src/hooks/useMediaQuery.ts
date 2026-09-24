import { useCallback, useSyncExternalStore } from "react";

/** SSR-safe media query hook. Renders `false` (mobile-first) until
 *  hydrated, then tracks the query live — via useSyncExternalStore rather
 *  than an effect + setState, so React reconciles the server/client value
 *  itself instead of us triggering an extra render manually. */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (callback: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", callback);
      return () => mql.removeEventListener("change", callback);
    },
    [query],
  );
  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);
  const getServerSnapshot = () => false;

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useIsDesktop(): boolean {
  return useMediaQuery("(min-width: 768px)");
}

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

const noopSubscribe = () => () => {};

/** True once the component has hydrated on the client. Use this to gate
 *  any render output that depends on the visitor's own local time/timezone
 *  or on browser-only storage, so the mismatched value never appears in
 *  the server-rendered HTML that hydration diffs against. */
export function useIsClient(): boolean {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}
