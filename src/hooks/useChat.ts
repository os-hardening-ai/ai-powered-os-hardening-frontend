import { useCallback, useRef, useState } from "react";
import { postChat, streamChat } from "@/lib/api";
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
  ZtMaturity,
} from "@/types/api";

export interface ChatSettings {
  os: OsTarget | null;
  role: UserRole | null;
  security_level: SecurityLevel;
  zt_maturity: ZtMaturity;
  use_rag: boolean;
  verify_claims: boolean;  // groundedness doğrulama (ClaimVerifier) — yavaş, opt-in
  deep_validate: boolean;  // çıktı doğrulama (script judge/correction) — yavaş, opt-in
  rag_top_k: number;
  rag_min_score: number;
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
  // OS + Rol VARSAYILAN "Otomatik" (null) → backend FilterAgent (LLM) bunları SORUDAN
  // çıkarır (akıllı pipeline'ın amacı). Kullanıcı isterse seçiciden sabitleyebilir.
  // (Güvenlik seviyesi + ZT çıkarsanamaz → kullanıcı tercihi olarak sabit varsayılanlı kalır.)
  os: null,
  role: null,
  security_level: "balanced",
  zt_maturity: "medium",
  use_rag: true,
  // Kalite↔hız tradeoff'lu doğrulamalar VARSAYILAN KAPALI — açılınca yanıt belirgin yavaşlar
  // (verify_claims ~15s, deep_validate ~10s). Kullanıcı isterse açar (perf uyarısı gösterilir).
  verify_claims: false,
  deep_validate: false,
  rag_top_k: 3,
  rag_min_score: 0.5,
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
        zt_maturity: settings.zt_maturity,
        use_rag: settings.use_rag,
        verify_claims: settings.verify_claims,
        deep_validate: settings.deep_validate,
        rag_top_k: settings.rag_top_k,
        rag_min_score: settings.rag_min_score > 0 ? settings.rag_min_score : undefined,
        stream: settings.stream,
        session_id: sessionId.current,
        timeout: 90,
      };

      if (settings.stream) {
        let streamMeta: StreamMetadata = {};
        let streamSources: RagSource[] = [];
        const stop = streamChat(req, {
          onMetadata: (m) => {
            streamMeta = m;
            patchMessage(assistantId, {
              meta: { intent: m.intent, safety_category: m.safety, layer_path: m.layer_path, rag_used: m.rag_used },
            });
          },
          onSources: (sources) => {
            streamSources = sources;
          },
          onToken: (tok) =>
            setMessages((prev) =>
              prev.map((msg) => (msg.id === assistantId ? { ...msg, content: msg.content + tok } : msg)),
            ),
          onDone: (info) => {
            patchMessage(assistantId, {
              streaming: false,
              meta: {
                intent: streamMeta.intent,
                safety_category: streamMeta.safety,
                layer_path: streamMeta.layer_path,
                rag_used: streamMeta.rag_used,
                rag_sources: streamSources.length > 0 ? streamSources : undefined,
                total_time_s: typeof info.total_time_s === "number" ? info.total_time_s : undefined,
                estimated_cost: typeof info.estimated_cost === "number" ? info.estimated_cost : undefined,
                verification_confidence: typeof info.verification_confidence === "number" ? info.verification_confidence : undefined,
              },
            });
            setBusy(false);
            abortRef.current = null;
          },
          onError: (msg) => {
            patchMessage(assistantId, {
              streaming: false,
              content: "Stream başarısız oldu — standart isteğe düşülüyor…",
            });
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

  const loadSession = useCallback((msgs: ChatMessage[]) => {
    abortRef.current?.();
    abortRef.current = null;
    sessionId.current = newSessionId();
    setMessages(msgs.map((m) => ({ ...m, streaming: false })));
    setError(null);
    setBusy(false);
  }, []);

  return { messages, busy, error, send, stop, reset, loadSession };
}
