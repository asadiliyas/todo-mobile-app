import { cookies } from "next/headers";

export const OWNER_COOKIE = "tdid";
export const OWNER_COOKIE_MAX_AGE = 60 * 60 * 24 * 365 * 10; // 10 years

/**
 * Reads the anonymous owner id set by middleware.ts. Every API route calls
 * this to scope its query instead of trusting anything from the client.
 *
 * Route handlers run after middleware, so in normal operation the cookie
 * is always present. The fallback only matters for edge cases like a
 * request that bypassed the matcher.
 */
export async function getOwnerId(): Promise<string> {
  const store = await cookies();
  const existing = store.get(OWNER_COOKIE)?.value;
  if (existing) return existing;

  const fresh = crypto.randomUUID();
  store.set(OWNER_COOKIE, fresh, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: OWNER_COOKIE_MAX_AGE,
    path: "/",
  });
  return fresh;
}
