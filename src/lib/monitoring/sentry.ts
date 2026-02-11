/**
 * Sentry Error Monitoring
 *
 * Lightweight Sentry integration without the heavy SDK.
 * Uses the Sentry HTTP API directly to report errors.
 *
 * Set NEXT_PUBLIC_SENTRY_DSN in .env.local to enable.
 */

interface SentryEvent {
  message?: string;
  level: "fatal" | "error" | "warning" | "info";
  extra?: Record<string, unknown>;
  tags?: Record<string, string>;
  user?: { id?: string; email?: string };
}

let parsedDsn: { publicKey: string; projectId: string; host: string } | null =
  null;

function parseDsn(dsn: string) {
  if (parsedDsn) return parsedDsn;

  try {
    const url = new URL(dsn);
    const publicKey = url.username;
    const projectId = url.pathname.replace("/", "");
    const host = url.hostname;

    parsedDsn = { publicKey, projectId, host };
    return parsedDsn;
  } catch {
    return null;
  }
}

export async function captureException(
  error: Error,
  context?: Partial<SentryEvent>
): Promise<void> {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) {
    console.error("[Sentry disabled]", error.message);
    return;
  }

  const parsed = parseDsn(dsn);
  if (!parsed) return;

  const envelope = buildEnvelope(
    {
      message: error.message,
      level: "error",
      ...context,
    },
    error,
    parsed
  );

  try {
    await fetch(
      `https://${parsed.host}/api/${parsed.projectId}/envelope/?sentry_key=${parsed.publicKey}&sentry_version=7`,
      {
        method: "POST",
        body: envelope,
      }
    );
  } catch {
    // Silently fail — monitoring should never break the app
  }
}

export async function captureMessage(
  message: string,
  level: SentryEvent["level"] = "info",
  context?: Partial<SentryEvent>
): Promise<void> {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return;

  const parsed = parseDsn(dsn);
  if (!parsed) return;

  const envelope = buildEnvelope({ message, level, ...context }, null, parsed);

  try {
    await fetch(
      `https://${parsed.host}/api/${parsed.projectId}/envelope/?sentry_key=${parsed.publicKey}&sentry_version=7`,
      {
        method: "POST",
        body: envelope,
      }
    );
  } catch {
    // Silently fail
  }
}

function buildEnvelope(
  event: SentryEvent,
  error: Error | null,
  dsn: { publicKey: string; projectId: string }
): string {
  const eventId = crypto.randomUUID().replace(/-/g, "");
  const timestamp = new Date().toISOString();

  const header = JSON.stringify({
    event_id: eventId,
    sent_at: timestamp,
    dsn: `https://${dsn.publicKey}@sentry.io/${dsn.projectId}`,
  });

  const itemHeader = JSON.stringify({
    type: "event",
    content_type: "application/json",
  });

  const payload = JSON.stringify({
    event_id: eventId,
    timestamp,
    platform: "javascript",
    level: event.level,
    message: event.message ? { formatted: event.message } : undefined,
    exception: error
      ? {
          values: [
            {
              type: error.name,
              value: error.message,
              stacktrace: error.stack
                ? {
                    frames: parseStack(error.stack),
                  }
                : undefined,
            },
          ],
        }
      : undefined,
    tags: {
      runtime: typeof window === "undefined" ? "node" : "browser",
      ...event.tags,
    },
    extra: event.extra,
    user: event.user,
    environment: process.env.NODE_ENV ?? "production",
    release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? undefined,
  });

  return `${header}\n${itemHeader}\n${payload}`;
}

function parseStack(stack: string) {
  return stack
    .split("\n")
    .slice(1, 10)
    .map((line) => {
      const match = line.match(/at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/);
      if (match) {
        return {
          function: match[1] ?? "<unknown>",
          filename: match[2] ?? "<unknown>",
          lineno: parseInt(match[3] ?? "0"),
          colno: parseInt(match[4] ?? "0"),
        };
      }
      return {
        function: line.trim(),
        filename: "<unknown>",
        lineno: 0,
        colno: 0,
      };
    });
}
