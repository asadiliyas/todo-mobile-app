import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { DbNotConfiguredError } from "@/lib/db";

/** Every error response has this shape, so the client can branch on `code`. */
export class ApiError extends Error {
  code: string;
  status: number;
  fieldErrors?: Record<string, string>;

  constructor(
    status: number,
    code: string,
    message: string,
    fieldErrors?: Record<string, string>,
  ) {
    super(message);
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

export function ok<T>(data: T, init?: number | ResponseInit) {
  return NextResponse.json({ data }, typeof init === "number" ? { status: init } : init);
}

function fieldErrorsFromZod(error: ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

/** Wrap a route handler body so every thrown error becomes a clean JSON response. */
export function withErrorHandling(
  handler: () => Promise<NextResponse>,
): Promise<NextResponse> {
  return handler().catch((error: unknown) => {
    if (error instanceof ApiError) {
      return NextResponse.json(
        {
          error: {
            message: error.message,
            code: error.code,
            fieldErrors: error.fieldErrors,
          },
        },
        { status: error.status },
      );
    }

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: {
            message: "Some fields need fixing.",
            code: "VALIDATION_ERROR",
            fieldErrors: fieldErrorsFromZod(error),
          },
        },
        { status: 400 },
      );
    }

    if (error instanceof DbNotConfiguredError) {
      return NextResponse.json(
        {
          error: {
            message:
              "The database isn't connected yet. Ask the site owner to finish setup.",
            code: "DB_NOT_CONFIGURED",
          },
        },
        { status: 503 },
      );
    }

    console.error("[api] unhandled error:", error);
    return NextResponse.json(
      {
        error: {
          message: "Something went wrong. Please try again.",
          code: "INTERNAL_ERROR",
        },
      },
      { status: 500 },
    );
  });
}

export function notFound(message = "Not found"): never {
  throw new ApiError(404, "NOT_FOUND", message);
}

export function badRequest(message: string, fieldErrors?: Record<string, string>): never {
  throw new ApiError(400, "BAD_REQUEST", message, fieldErrors);
}
