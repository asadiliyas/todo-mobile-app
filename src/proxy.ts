import { NextResponse, type NextRequest } from "next/server";
import { OWNER_COOKIE, OWNER_COOKIE_MAX_AGE } from "@/lib/owner";

/**
 * Gives every browser its own anonymous, private task list — no signup.
 *
 * On first visit we mint a random id and store it in a long-lived,
 * httpOnly cookie. Every API route reads that cookie (never a value the
 * client can forge through the request body) to scope all reads/writes,
 * so one visitor can never see or delete another visitor's tasks.
 */
export function proxy(request: NextRequest) {
  const existing = request.cookies.get(OWNER_COOKIE)?.value;
  if (existing) return NextResponse.next();

  const response = NextResponse.next();
  response.cookies.set(OWNER_COOKIE, crypto.randomUUID(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: OWNER_COOKIE_MAX_AGE,
    path: "/",
  });
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons/).*)"],
};
