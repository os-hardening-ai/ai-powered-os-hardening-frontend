import { useCallback, useRef, useState } from "react";
import { postChat, ragSearch, streamChat } from "@/lib/api";
import { ApiError } from "@/lib/http";
import { newSessionId } from "@/lib/format";
import type {
  ChatRequest,
  ChatResponse,
  OsTarget,
  RagSource,
  SecurityLevel,
  StreamMetadata,
  UserRole,
} from "@/types/api";

export interface ChatSettings {
  os: OsTarget | null;
  role: UserRole | null;
  security_level: SecurityLevel;
  use_rag: boolean;
  rag_top_k: number;
  stream: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
  meta?: {
    intent?: string | null;
    safety_category?: string | null;
    layer_path?: string | null;
    rag_sources?: RagSource[];
    total_time_s?: number;
    estimated_cost?: number | null;
    verification_confidence?: number | null;
    model?: string;
    rag_used?: boolean;
  };
}

export const DEFAULT_SETTINGS: ChatSettings = {
  os: "ubuntu_24_04",
  role: "sysadmin",
  security_level: "balanced",
  use_rag: true,
  rag_top_k: 5,
  stream: true,
};

let idSeq = 0;
const nextId = () => `m${++idSeq}-${Date.now().toString(36)}`;

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const sessionId = useRef<string>(newSessionId());
  const abortRef = useRef<(() => void) | null>(null);

  const patchMessage = useCallback((id: string, patch: Partial<ChatMessage>) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }, []);

  const send = useCallback(
    async (text: string, settings: ChatSettings) => {
      const question = text.trim();
      if (!question || busy) return;
      setError(null);
      setBusy(true);

      const userMsg: ChatMessage = { id: nextId(), role: "user", content: question };
      const assistantId = nextId();
      setMessages((prev) => [
        ...prev,
        userMsg,
        { id: assistantId, role: "assistant", content: "", streaming: settings.stream },
      ]);

      const req: ChatRequest = {
        question,
        os: settings.os,
        role: settings.role,
        security_level: settings.security_level,
        use_rag: settings.use_rag,
        rag_top_k: settings.rag_top_k,
        stream: settings.stream,
        session_id: sessionId.current,
        timeout: 90,
      };

      if (settings.stream) {
        let streamMeta: StreamMetadata = {};
        const stop = streamChat(req, {
          onMetadata: (m) => {
            streamMeta = m;
            patchMessage(assistantId, {
              meta: { intent: m.intent, safety_category: m.safety, layer_path: m.layer_path, rag_used: m.rag_used },
            });
          },
          onToken: (tok) =>
            setMessages((prev) =>
              prev.map((msg) => (msg.id === assistantId ? { ...msg, content: msg.content + tok } : msg)),
            ),
          onDone: (info) => {
            const baseMeta = {
              intent: streamMeta.intent,
              safety_category: streamMeta.safety,
              layer_path: streamMeta.layer_path,
              rag_used: streamMeta.rag_used,
              total_time_s: typeof info.total_time_s === "number" ? info.total_time_s : undefined,
            };
            patchMessage(assistantId, { streaming: false, meta: baseMeta });
            setBusy(false);
            abortRef.current = null;
            // Stream endpoint returns no rag_sources — fetch them separately.
            if (streamMeta.rag_used) {
              ragSearch({ query: question, top_k: req.rag_top_k ?? 5 })
                .then((r) =>
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantId
                        ? { ...m, meta: { ...(m.meta ?? {}), rag_sources: r.results } }
                        : m,
                    ),
                  ),
                )
                .catch(() => {});
            }
          },
          onError: (msg) => {
            patchMessage(assistantId, {
              streaming: false,
              content: "Stream başarısız oldu — standart isteğe düşülüyor…",
            });
            // Fall back to the non-streaming endpoint for a complete answer.
            postChat({ ...req, stream: false })
              .then((res) => applyFullResponse(assistantId, res))
              .catch((e) => {
                setError(e instanceof ApiError ? e : new ApiError({ status: 0, code: "UNKNOWN", message: msg }));
                patchMessage(assistantId, { streaming: false, content: "Yanıt alınamadı." });
              })
              .finally(() => {
                setBusy(false);
                abortRef.current = null;
              });
          },
        });
        abortRef.current = stop;
      } else {
        try {
          const res = await postChat(req);
          applyFullResponse(assistantId, res);
        } catch (e) {
          setError(e instanceof ApiError ? e : new ApiError({ status: 0, code: "UNKNOWN", message: String(e) }));
          patchMessage(assistantId, { streaming: false, content: "Yanıt alınamadı." });
        } finally {
          setBusy(false);
        }
      }

      function applyFullResponse(id: string, res: ChatResponse) {
        patchMessage(id, {
          content: res.answer,
          streaming: false,
          meta: {
            intent: res.intent,
            safety_category: res.safety_category,
            layer_path: res.layer_path,
            rag_sources: res.rag_sources,
            total_time_s: res.stats?.total_time_s,
            estimated_cost: res.estimated_cost,
            verification_confidence: res.verification_confidence,
            model: typeof res.stats?.model === "string" ? res.stats.model : undefined,
            rag_used: res.stats?.rag_used,
          },
        });
      }
    },
    [busy, patchMessage],
  );

  const stop = useCallback(() => {
    abortRef.current?.();
    abortRef.current = null;
    setBusy(false);
    setMessages((prev) => prev.map((m) => (m.streaming ? { ...m, streaming: false } : m)));
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.();
    abortRef.current = null;
    sessionId.current = newSessionId();
    setMessages([]);
    setError(null);
    setBusy(false);
  }, []);

  return { messages, busy, error, send, stop, reset };
}
