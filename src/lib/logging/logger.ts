// Structured JSON logging.
// Includes request context for traceability.

export type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  requestId?: string;
  traceId?: string;
  userId?: string;
  sessionId?: string;
  provider?: string;
  model?: string;
  latencyMs?: number;
  statusCode?: number;
  errorCode?: string;
  [key: string]: unknown;
}

const LEVEL_WEIGHT: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

let currentLevel: LogLevel = "info";

export function setLogLevel(level: LogLevel) {
  currentLevel = level;
}

function shouldLog(level: LogLevel): boolean {
  return LEVEL_WEIGHT[level] >= LEVEL_WEIGHT[currentLevel];
}

function formatEntry(entry: LogEntry): string {
  return JSON.stringify(entry);
}

function emit(entry: LogEntry) {
  if (!shouldLog(entry.level)) return;
  const line = formatEntry(entry);
  if (entry.level === "error") {
    process.stderr.write(line + "\n");
  } else {
    process.stdout.write(line + "\n");
  }
}

export interface LogContext {
  component?: string;
  requestId?: string;
  traceId?: string;
  userId?: string;
  sessionId?: string;
  provider?: string;
  model?: string;
}

export function createLogger(context: LogContext = {}) {
  const now = () => new Date().toISOString();

  return {
    debug(message: string, extra?: Record<string, unknown>) {
      emit({ level: "debug", message, timestamp: now(), ...context, ...extra });
    },
    info(message: string, extra?: Record<string, unknown>) {
      emit({ level: "info", message, timestamp: now(), ...context, ...extra });
    },
    warn(message: string, extra?: Record<string, unknown>) {
      emit({ level: "warn", message, timestamp: now(), ...context, ...extra });
    },
    error(message: string, extra?: Record<string, unknown>) {
      emit({ level: "error", message, timestamp: now(), ...context, ...extra });
    },
    child(additionalContext: LogContext) {
      return createLogger({ ...context, ...additionalContext });
    },
  };
}

export type Logger = ReturnType<typeof createLogger>;

// Singleton logger for non-request contexts
export const logger = createLogger();
