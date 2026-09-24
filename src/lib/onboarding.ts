const ONBOARDED_KEY = "todo:onboarded";

/** Fails open: if storage is unavailable (private mode, blocked), we'd
 *  rather show the app than trap the visitor on the welcome screen. */
export function hasOnboarded(): boolean {
  try {
    return localStorage.getItem(ONBOARDED_KEY) === "1";
  } catch {
    return true;
  }
}

export function markOnboarded(): void {
  try {
    localStorage.setItem(ONBOARDED_KEY, "1");
  } catch {
    // ignore
  }
}
