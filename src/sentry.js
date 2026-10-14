import * as Sentry from "@sentry/node";

const SENTRY_DSN = process.env.SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV || "development",
    tracesSampleRate: 1.0,
  });
} else {
  console.warn("SENTRY_DSN not set; error tracking is disabled.");
}

export function captureError(err, context) {
  if (SENTRY_DSN) {
    Sentry.captureException(err, context ? { extra: context } : undefined);
  }
}

export { Sentry };