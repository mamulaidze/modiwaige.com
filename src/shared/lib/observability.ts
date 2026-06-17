type ErrorPayload = {
  message: string;
  stack?: string;
  context?: Record<string, unknown>;
  environment?: string;
  release?: string;
};

const monitoringEndpoint = import.meta.env.VITE_MONITORING_ENDPOINT as
  | string
  | undefined;
const analyticsEndpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT as
  | string
  | undefined;
const monitoringEnabled =
  import.meta.env.VITE_MONITORING_ENABLED === 'true' && Boolean(monitoringEndpoint);
const analyticsEnabled =
  import.meta.env.VITE_ANALYTICS_ENABLED === 'true' && Boolean(analyticsEndpoint);
const appEnvironment =
  (import.meta.env.VITE_APP_ENV as string | undefined) ??
  (import.meta.env.MODE as string | undefined);
const appRelease = import.meta.env.VITE_APP_RELEASE as string | undefined;

export function initializeObservability() {
  if (!monitoringEnabled) {
    return;
  }

  window.addEventListener('error', (event) => {
    captureException(event.error ?? new Error(event.message), {
      source: 'window.error',
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    captureException(toError(event.reason), {
      source: 'window.unhandledrejection',
    });
  });
}

export function captureException(
  error: unknown,
  context?: Record<string, unknown>,
) {
  const normalized = toError(error);
  const safeContext = sanitizeContext(context);

  if (import.meta.env.DEV) {
    console.error('Application error', normalized, safeContext);
  }

  if (!monitoringEnabled || !monitoringEndpoint) {
    return;
  }

  sendJson(monitoringEndpoint, {
    context: safeContext,
    environment: appEnvironment,
    message: normalized.message,
    release: appRelease,
    stack: normalized.stack,
  } satisfies ErrorPayload);
}

export function trackPageView(path: string) {
  if (!analyticsEnabled || !analyticsEndpoint) {
    return;
  }

  sendJson(analyticsEndpoint, {
    event: 'page_view',
    environment: appEnvironment,
    path,
    provider: import.meta.env.VITE_ANALYTICS_PROVIDER ?? 'custom',
    release: appRelease,
    title: document.title,
    timestamp: new Date().toISOString(),
  });
}

function sendJson(endpoint: string, payload: Record<string, unknown>) {
  const body = JSON.stringify(payload);

  if (navigator.sendBeacon) {
    navigator.sendBeacon(
      endpoint,
      new Blob([body], { type: 'application/json' }),
    );
    return;
  }

  void fetch(endpoint, {
    body,
    headers: {
      'Content-Type': 'application/json',
    },
    keepalive: true,
    method: 'POST',
  });
}

function toError(value: unknown) {
  if (value instanceof Error) {
    return value;
  }

  return new Error(typeof value === 'string' ? value : 'Unknown error');
}

function sanitizeContext(value: unknown): Record<string, unknown> | undefined {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  return sanitizeValue(value) as Record<string, unknown>;
}

function sanitizeValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item));
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
      key,
      isSensitiveKey(key) ? '[redacted]' : sanitizeValue(entry),
    ]),
  );
}

function isSensitiveKey(key: string) {
  return /phone|token|authorization|password|secret|email|address/i.test(key);
}
