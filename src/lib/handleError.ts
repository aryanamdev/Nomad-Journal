import { NextResponse } from "next/server";
import { AppError } from "./errors";
import { errorResponse } from "./response";

/** Turns any thrown value into the API's standard error response. */
export function handleError(err: unknown) {
  if (err instanceof AppError) {
    return NextResponse.json(errorResponse(err.message), { status: err.statusCode });
  }
  if (err instanceof SyntaxError) {
    return NextResponse.json(errorResponse("Request body must be valid JSON"), { status: 400 });
  }
  // Mongoose cast errors (e.g. a malformed id) are client errors, not crashes.
  if (err && typeof err === "object" && (err as { name?: string }).name === "CastError") {
    return NextResponse.json(errorResponse("Invalid id"), { status: 400 });
  }
  console.error(err);
  return NextResponse.json(errorResponse("Internal Server Error"), { status: 500 });
}
