import { apiRequest, streamUrl } from "@/lib/http";
import { getToken, setToken, notifyUnauthorized } from "@/lib/auth-token";
import type {
  AgentHardenRequest,
  AgentHardenResponse,
  AgentPlanRequest,
  AgentPlanResponse,
  ArtifactRequest,
  ArtifactResponse,
  AuthUser,
  ChatRequest,
  ChatResponse,
  ExecutionPlanResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  HealthResponse,
  LoginRequest,
  OsTarget,
  RagSearchRequest,
  RagSearchResponse,
  RagSource,
  RegisterRequest,
  ResetPasswordRequest,
  RuleConflict,
  RuleListParams,
  RuleListResponse,
  StreamMetadata,
  TokenResponse,
} from "@/types/api";

// ── Auth ─────────────────────────────────────────────────────
export function login(req: LoginRequest, signal?: AbortSignal): Promise<TokenResponse> {
  return apiRequest<TokenResponse>("/auth/login", { method: "POST", body: req, signal });
}

export function register(req: RegisterRequest, signal?: AbortSignal): Promise<TokenResponse> {
  return apiRequest<TokenResponse>("/auth/register", { method: "POST", body: req, signal });
}

export function forgotPassword(
  req: ForgotPasswordRequest,
  signal?: AbortSignal,
): Promise<ForgotPasswordResponse> {
  return apiRequest<ForgotPasswordResponse>("/auth/forgot-password", { method: "POST", body: req, signal });
}

export function resetPassword(req: ResetPasswordRequest, signal?: AbortSignal): Promise<{ message: string }> {
  return apiRequest<{ message: string }>("/auth/reset-password", { method: "POST", body: req, signal });
}

export function logout(signal?: AbortSignal): Promise<{ message: string }> {
  return apiRequest<{ message: string }>("/auth/logout", { method: "POST", signal });
}

export function getMe(signal?: AbortSignal): Promise<AuthUser> {
  return apiRequest<AuthUser>("/auth/me", { method: "GET", signal });
}

// ── Chat ─────────────────────────────────────────────────────
export function postChat(req: ChatRequest, signal?: AbortSignal): Promise<ChatResponse> {
  const timeoutMs = (req.timeout ?? 60) * 1000 + 5_000;
  return apiRequest<ChatResponse>("/api/chat", { method: "POST", body: req, signal, timeoutMs });
}

export interface StreamHandlers {
  onMetadata?: (m: StreamMetadata) => void;
  onSources?: (sources: RagSource[]) => void;
  onToken?: (token: string) => void;
  onDone?: (info: Record<string, unknown>) => void;
  onError?: (message: string) => void;
}

/**
 * Consumes the backend SSE stream (`/api/chat/stream`). Because the endpoint is
 * a POST that returns text/event-stream, we read the body with a streaming
 * fetch + manual SSE frame parser (EventSource only supports GET).
 * Returns an abort function the caller can use to stop early.
 */
export function streamChat(req: ChatRequest, handlers: StreamHandlers): () => void {
  const controller = new AbortController();

  (async () => {
    try {
      const streamHeaders: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      };
      const token = getToken();
      if (token) streamHeaders["Authorization"] = `Bearer ${token}`;
      const res = await fetch(streamUrl("/api/chat/stream"), {
        method: "POST",
        headers: streamHeaders,
        body: JSON.stringify({ ...req, stream: true }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        if (res.status === 401 && token) {
          setToken(null);
          notifyUnauthorized();
        }
        handlers.onError?.(`Stream başlatılamadı (HTTP ${res.status}).`);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // SSE frames are separated by a blank line.
        let sep: number;
        while ((sep = buffer.indexOf("\n\n")) !== -1) {
          const frame = buffer.slice(0, sep);
          buffer = buffer.slice(sep + 2);
          dispatchSseFrame(frame, handlers);
        }
      }
    } catch (err) {
      if (!(err instanceof DOMException && err.name === "AbortError")) {
        handlers.onError?.("Stream sırasında bağlantı hatası oluştu.");
      }
    }
  })();

  return () => controller.abort();
}

function dispatchSseFrame(frame: string, handlers: StreamHandlers): void {
  let event = "message";
  const dataLines: string[] = [];
  for (const line of frame.split("\n")) {
    if (line.startsWith("event:")) event = line.slice(6).trim();
    else if (line.startsWith("data:")) dataLines.push(line.slice(5).trim());
  }
  if (dataLines.length === 0) return;

  let data: Record<string, unknown> = {};
  try {
    data = JSON.parse(dataLines.join("\n"));
  } catch {
    return;
  }

  switch (event) {
    case "metadata":
      handlers.onMetadata?.(data as StreamMetadata);
      break;
    case "sources":
      handlers.onSources?.((data.rag_sources as RagSource[]) ?? []);
      break;
    case "message":
      if (typeof data.token === "string") handlers.onToken?.(data.token);
      break;
    case "done":
      handlers.onDone?.(data);
      break;
    case "error":
      handlers.onError?.(String(data.message ?? "Bilinmeyen stream hatası"));
      break;
  }
}

// ── RAG search ───────────────────────────────────────────────
export function ragSearch(req: RagSearchRequest, signal?: AbortSignal): Promise<RagSearchResponse> {
  return apiRequest<RagSearchResponse>("/rag/search", { method: "POST", body: req, signal });
}

// ── Rules ────────────────────────────────────────────────────
export function listCategories(os?: OsTarget, signal?: AbortSignal): Promise<string[]> {
  return apiRequest<string[]>("/api/rules/categories", {
    method: "GET",
    query: { os },
    signal,
  });
}

export function listRules(params: RuleListParams = {}, signal?: AbortSignal): Promise<RuleListResponse> {
  return apiRequest<RuleListResponse>("/api/rules", {
    method: "GET",
    query: {
      os: params.os_target,
      level: params.level,
      category: params.category || undefined,
      auto_remediate: params.auto_remediate,
      limit: params.limit ?? 50,
      offset: params.offset ?? 0,
    },
    signal,
  });
}

export function getExecutionPlan(
  ruleIds: string[],
  osTarget?: OsTarget,
  signal?: AbortSignal,
): Promise<ExecutionPlanResponse> {
  return apiRequest<ExecutionPlanResponse>("/api/rules/plan", {
    method: "POST",
    body: { rule_ids: ruleIds, ...(osTarget ? { os_target: osTarget } : {}) },
    signal,
  });
}

export function detectConflicts(
  ruleIds: string[],
  osTarget?: OsTarget,
  signal?: AbortSignal,
): Promise<RuleConflict[]> {
  return apiRequest<RuleConflict[]>("/api/rules/conflicts", {
    method: "POST",
    body: { rule_ids: ruleIds, ...(osTarget ? { os_target: osTarget } : {}) },
    signal,
  });
}

// ── Artifacts ────────────────────────────────────────────────
export function generateArtifact(req: ArtifactRequest, signal?: AbortSignal): Promise<ArtifactResponse> {
  return apiRequest<ArtifactResponse>("/api/artifacts/generate", { method: "POST", body: req, signal });
}

// ── Agent ────────────────────────────────────────────────────
export function agentPlan(req: AgentPlanRequest, signal?: AbortSignal): Promise<AgentPlanResponse> {
  return apiRequest<AgentPlanResponse>("/api/agent/plan", { method: "POST", body: req, signal, timeoutMs: 120_000 });
}

export function agentHarden(req: AgentHardenRequest, signal?: AbortSignal): Promise<AgentHardenResponse> {
  return apiRequest<AgentHardenResponse>("/api/agent/harden", { method: "POST", body: req, signal, timeoutMs: 120_000 });
}

// ── System ───────────────────────────────────────────────────
export function getHealth(signal?: AbortSignal): Promise<HealthResponse> {
  return apiRequest<HealthResponse>("/health/detailed", { method: "GET", signal, timeoutMs: 10_000 });
}
