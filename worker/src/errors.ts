export type ErrorCode = "rate_limited" | "bad_image" | "model_parse" | "upstream" | "timeout";

export function jsonError(error: ErrorCode, status: number, extra?: Record<string, unknown>): Response {
  return Response.json({ error, ...extra }, { status });
}

export function statusFor(error: ErrorCode): number {
  switch (error) {
    case "rate_limited":
      return 429;
    case "bad_image":
      return 400;
    case "timeout":
      return 504;
    case "model_parse":
    case "upstream":
      return 502;
  }
}
