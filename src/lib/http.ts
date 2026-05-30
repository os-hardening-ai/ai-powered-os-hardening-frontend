import { API_BASE_URL } from "@/config";
import type { ApiErrorShape } from "@/types/api";

export class ApiError extends Error implements ApiErrorShape {
  status: number;
  code: string;
  requestId?: string;
  details?: Record<string, unknown>;

  constructor(shape: ApiErrorShape) {
    super(shape.message);
    this.name = "ApiError";
    this.status = shape.status;
    this.code = shape.code;
    this.requestId = shape.requestId;
    this.details = shape.details;
  }
}

interface RequestOptions {
  method?: "GET" | "POST";
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
  signal?: AbortSignal;
  timeoutMs?: number;
}

function buildUrl(path: string, query?: RequestOptions["query"]): string {
  const url = `${API_BASE_URL}${path}`;
  if (!query) return url;
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined && v !== null) params.append(k, String(v));
  }
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

/**
 * Normalizes the various backend error envelopes (FastAPI's `detail`, the
 * project's custom `{error:{code,message,...}}`, and validation arrays) into a
 * single ApiError so the UI has one shape to handle.
 */
async function normalizeError(res: Response): Promise<ApiError> {
  let payload: unknown = null;
  try {
    payload = await res.json();
  } catch {
    /* non-JSON body */
  }

  // The backend may return one of three error envelopes: the project's custom
  // `{error:{code,message,...}}`, FastAPI's string `detail`, or a validation
  // array under `detail`. We narrow `unknown` defensively for each shape.
  const p = (payload ?? {}) as Record<string, unknown>;

  const errEnvelope = p.error as Record<string, unknown> | undefined;
  if (errEnvelope && typeof errEnvelope.message === "string") {
    return new ApiError({
      status: res.status,
      code: typeof errEnvelope.code === "string" ? errEnvelope.code : "API_ERROR",
      message: errEnvelope.message,
      requestId: typeof errEnvelope.request_id === "string" ? errEnvelope.request_id : undefined,
      details: errEnvelope.details as Record<string, unknown> | undefined,
    });
  }
  if (typeof p.detail === "string") {
    return new ApiError({ status: res.status, code: "API_ERROR", message: p.detail });
  }
  if (Array.isArray(p.detail)) {
    const first = p.detail[0] as Record<string, unknown> | undefined;
    const loc = Array.isArray(first?.loc) ? first.loc.join(".") : "";
    const msg = typeof first?.msg === "string" ? first.msg : "Validation error";
    return new ApiError({
      status: res.status,
      code: "VALIDATION_ERROR",
      message: `${loc ? `${loc}: ` : ""}${msg}`,
      details: { detail: p.detail },
    });
  }
  return new ApiError({
    status: res.status,
    code: "API_ERROR",
    message: res.statusText || `Request failed with status ${res.status}`,
  });
}

export async function apiRequest<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, query, signal, timeoutMs = 65_000 } = opts;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  // Allow an external abort signal to cancel as well.
  if (signal) signal.addEventListener("abort", () => controller.abort(), { once: true });

  try {
    const res = await fetch(buildUrl(path, query), {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    if (!res.ok) throw await normalizeError(res);
    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiError({ status: 0, code: "TIMEOUT", message: "İstek zaman aşımına uğradı veya iptal edildi." });
    }
    throw new ApiError({
      status: 0,
      code: "NETWORK_ERROR",
      message: "Backend'e ulaşılamadı. API çalışıyor mu? (VITE_API_BASE_URL / proxy kontrol edin)",
    });
  } finally {
    clearTimeout(timer);
  }
}

export function streamUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}
