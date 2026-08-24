// Centralized typed error system.
// Extends the existing AppError with additional domain-specific error types.

export type ProblemDocument = {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  request_id?: string;
  retry_after?: number;
  [key: string]: unknown;
};

export class AppError extends Error {
  readonly status: number;
  readonly code: string;
  readonly detail: string;
  readonly retryAfter?: number;
  readonly extra?: Record<string, unknown>;

  constructor(
    status: number,
    code: string,
    detail: string,
    opts?: { retryAfter?: number; extra?: Record<string, unknown> },
  ) {
    super(detail);
    this.name = "AppError";
    this.status = status;
    this.code = code;
    this.detail = detail;
    this.retryAfter = opts?.retryAfter;
    this.extra = opts?.extra;
  }
}

// --- Domain-specific error classes ---

export class AuthenticationError extends AppError {
  constructor(detail = "Authentication required.") {
    super(401, "authentication_error", detail);
  }
}

export class AuthorizationError extends AppError {
  constructor(detail = "You do not have permission to do that.") {
    super(403, "authorization_error", detail);
  }
}

export class ValidationError extends AppError {
  constructor(detail: string, extra?: Record<string, unknown>) {
    super(400, "validation_error", detail, { extra });
  }
}

export class NotFoundError extends AppError {
  constructor(detail = "The requested resource was not found.") {
    super(404, "not_found", detail);
  }
}

export class ConflictError extends AppError {
  constructor(detail: string, extra?: Record<string, unknown>) {
    super(409, "conflict", detail, { extra });
  }
}

export class RateLimitError extends AppError {
  constructor(detail: string, retryAfter: number) {
    super(429, "rate_limited", detail, { retryAfter });
  }
}

export class AIProviderError extends AppError {
  constructor(detail: string, provider?: string) {
    super(502, "ai_provider_error", detail, { extra: { provider } });
  }
}

export class AITimeoutError extends AppError {
  constructor(provider?: string) {
    super(502, "ai_timeout", "AI provider timed out.", { extra: { provider } });
  }
}

export class AudioProcessingError extends AppError {
  constructor(detail: string) {
    super(422, "audio_processing_error", detail);
  }
}

export class TranscriptError extends AppError {
  constructor(detail: string) {
    super(422, "transcript_error", detail);
  }
}

export class DatabaseError extends AppError {
  constructor(detail = "A database error occurred.") {
    super(500, "database_error", detail);
  }
}

export class ExternalServiceError extends AppError {
  constructor(detail: string, service?: string) {
    super(502, "external_service_error", detail, { extra: { service } });
  }
}

export class CostLimitError extends AppError {
  constructor(detail = "AI usage cost limit reached.") {
    super(429, "cost_limit_exceeded", detail);
  }
}

export class SessionExpiredError extends AppError {
  constructor(detail = "Session has expired.") {
    super(401, "session_expired", detail);
  }
}

// --- Factory helpers (backward-compatible) ---

export const badRequest = (detail: string, extra?: Record<string, unknown>) =>
  new ValidationError(detail, extra);

export const unauthorized = (detail = "Authentication required.") =>
  new AuthenticationError(detail);

export const forbidden = (detail = "You do not have permission to do that.") =>
  new AuthorizationError(detail);

export const notFound = (detail = "The requested resource was not found.") =>
  new NotFoundError(detail);

export const conflict = (detail: string, extra?: Record<string, unknown>) =>
  new ConflictError(detail, extra);

export const rateLimited = (detail: string, retryAfter: number) =>
  new RateLimitError(detail, retryAfter);

export const isAppError = (e: unknown): e is AppError => e instanceof AppError;

// --- Problem response mapping ---

const TITLE_MAP: Record<string, string> = {
  bad_request: "Bad request",
  validation_error: "Validation error",
  authentication_error: "Authentication error",
  authorization_error: "Authorization error",
  unauthorized: "Unauthorized",
  forbidden: "Forbidden",
  not_found: "Not found",
  conflict: "Conflict",
  rate_limited: "Rate limit exceeded",
  ai_provider_error: "AI provider error",
  ai_timeout: "AI timeout",
  audio_processing_error: "Audio processing error",
  transcript_error: "Transcript error",
  database_error: "Database error",
  external_service_error: "External service error",
  cost_limit_exceeded: "Cost limit exceeded",
  session_expired: "Session expired",
  internal_error: "Internal server error",
};

export function toProblem(err: unknown, requestId?: string): ProblemDocument {
  if (isAppError(err)) {
    return {
      type: `https://api.fluentai.app/errors/${err.code}`,
      title: TITLE_MAP[err.code] ?? "Request error",
      status: err.status,
      detail: err.detail,
      request_id: requestId,
      ...(err.retryAfter !== undefined ? { retry_after: err.retryAfter } : {}),
      ...err.extra,
    };
  }

  // Unknown / internal errors: never leak internals.
  return {
    type: "https://api.fluentai.app/errors/internal_error",
    title: "Internal server error",
    status: 500,
    detail: "An unexpected error occurred.",
    request_id: requestId,
  };
}
