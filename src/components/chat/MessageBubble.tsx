import { ShieldCheck, Terminal, User } from "lucide-react";
import type { ChatMessage } from "@/hooks/useChat";
import { Badge } from "@/components/ui/ui";
import { MessageContent } from "./MessageContent";
import { EvidencePanel } from "./EvidencePanel";
import { fmtCost, fmtPct, fmtSeconds, intentMeta, safetyTone } from "@/lib/format";

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  if (isUser) {
    return (
      <div className="flex animate-fade-up justify-end gap-3">
        <div className="max-w-[80%] rounded-xl rounded-tr-sm border border-accent/30 bg-accent/10 px-4 py-2.5 text-sm text-ink">
          {message.content}
        </div>
        <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-line bg-surface-2 text-muted">
          <User size={15} />
        </div>
      </div>
    );
  }

  const m = message.meta;
  const intent = intentMeta(m?.intent);
  return (
    <div className="flex animate-fade-up gap-3">
      <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-accent/40 bg-accent/10 text-accent">
        <Terminal size={15} />
      </div>
      <div className="min-w-0 max-w-[88%] flex-1">
        <div className="rounded-xl rounded-tl-sm border border-line bg-surface px-4 py-3 shadow-panel">
          {message.content ? (
            <MessageContent text={message.content} />
          ) : (
            <span className="font-mono text-sm text-faint">
              Analiz ediliyor<span className="animate-blink">▋</span>
            </span>
          )}
          {message.streaming && message.content && <span className="animate-blink text-accent">▋</span>}
          {m?.rag_sources && <EvidencePanel sources={m.rag_sources} />}
        </div>

        {m && !message.streaming && (m.intent || m.layer_path || m.total_time_s !== undefined) && (
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {m.intent && <Badge tone={intent.tone}>{intent.label}</Badge>}
            {m.safety_category && (
              <Badge tone={safetyTone(m.safety_category)} title="Güvenlik sınıflandırması">
                <ShieldCheck size={11} /> {m.safety_category}
              </Badge>
            )}
            {m.layer_path && <Badge title="Pipeline katman yolu">{m.layer_path}</Badge>}
            {m.model && <Badge>{m.model}</Badge>}
            {m.total_time_s !== undefined && <Badge>{fmtSeconds(m.total_time_s)}</Badge>}
            {m.estimated_cost !== undefined && m.estimated_cost !== null && (
              <Badge title="Tahmini LLM maliyeti">{fmtCost(m.estimated_cost)}</Badge>
            )}
            {m.verification_confidence !== undefined && m.verification_confidence !== null && (
              <Badge tone="info" title="Claim doğrulama güven skoru">
                doğrulama {fmtPct(m.verification_confidence)}
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
