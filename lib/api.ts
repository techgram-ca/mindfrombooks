import "server-only";
import { NextResponse } from "next/server";
import { ZodError, type ZodType } from "zod";
import { HttpError } from "@/lib/auth";

export function jsonError(status: number, message: string, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

export async function parseBody<T>(request: Request, schema: ZodType<T>): Promise<T> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    throw new HttpError(400, "Invalid request body.");
  }
  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new HttpError(400, result.error.issues[0]?.message ?? "Invalid request.");
  }
  return result.data;
}

/** Wrap a route handler so thrown HttpErrors become clean JSON responses. */
export function handle<A extends unknown[]>(fn: (...args: A) => Promise<Response>) {
  return async (...args: A): Promise<Response> => {
    try {
      return await fn(...args);
    } catch (err) {
      if (err instanceof HttpError) return jsonError(err.status, err.message);
      if (err instanceof ZodError) return jsonError(400, err.issues[0]?.message ?? "Invalid request.");
      console.error("[api] unhandled error", err);
      return jsonError(500, "Something went wrong on our side. Please try again.");
    }
  };
}
