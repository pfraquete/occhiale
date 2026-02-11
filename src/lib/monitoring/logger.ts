/**
 * Structured Logger
 *
 * Provides structured JSON logging for production.
 * In development, uses human-readable console output.
 * In production, outputs JSON for log aggregation services.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  data?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

const isDev = process.env.NODE_ENV === "development";

function formatLog(entry: LogEntry): string {
  if (isDev) {
    const prefix = `[${entry.level.toUpperCase()}]${entry.context ? ` [${entry.context}]` : ""}`;
    const data = entry.data ? ` ${JSON.stringify(entry.data)}` : "";
    const err = entry.error ? `\n  Error: ${entry.error.message}` : "";
    return `${prefix} ${entry.message}${data}${err}`;
  }

  return JSON.stringify(entry);
}

function log(
  level: LogLevel,
  message: string,
  options?: {
    context?: string;
    data?: Record<string, unknown>;
    error?: Error;
  }
) {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    context: options?.context,
    data: options?.data,
    error: options?.error
      ? {
          name: options.error.name,
          message: options.error.message,
          stack: options.error.stack,
        }
      : undefined,
  };

  const formatted = formatLog(entry);

  switch (level) {
    case "debug":
      if (isDev) console.debug(formatted);
      break;
    case "info":
      console.log(formatted);
      break;
    case "warn":
      console.warn(formatted);
      break;
    case "error":
      console.error(formatted);
      break;
  }
}

/**
 * Create a logger with a fixed context (module name).
 *
 * @example
 * const logger = createLogger("checkout");
 * logger.info("Order created", { data: { orderId: "123" } });
 * logger.error("Payment failed", { error: new Error("timeout") });
 */
export function createLogger(context: string) {
  return {
    debug: (message: string, options?: { data?: Record<string, unknown> }) =>
      log("debug", message, { context, ...options }),

    info: (message: string, options?: { data?: Record<string, unknown> }) =>
      log("info", message, { context, ...options }),

    warn: (
      message: string,
      options?: { data?: Record<string, unknown>; error?: Error }
    ) => log("warn", message, { context, ...options }),

    error: (
      message: string,
      options?: { data?: Record<string, unknown>; error?: Error }
    ) => log("error", message, { context, ...options }),
  };
}

export const logger = createLogger("app");
