import { useEffect, useRef, useState } from "react";
import { MessagesSquare, RotateCcw, Sparkles } from "lucide-react";
import { DEFAULT_SETTINGS, useChat, type ChatSettings } from "@/hooks/useChat";
import { useAuth } from "@/context/AuthContext";
import { defaultExpertModeForRole } from "@/lib/permissions";
import { MessageBubble } from "./MessageBubble";
import { Composer } from "./Composer";
import { ContextControls } from "./ContextControls";
import { EmptyState, ErrorBanner } from "@/components/ui/ui";

export function ChatView() {
  const { messages, busy, error, send, stop, reset } = useChat();
  const { user } = useAuth();
  // Başlangıç "Yanıt modu" rol'e göre: IT/uzman roller → Hızlı RAG, end_user → Tam (akıllı).
  // Yalnız ilk değer; kullanıcı ContextControls'taki seçiciyle değiştirebilir.
  const [settings, setSettings] = useState<ChatSettings>(() => ({
    ...DEFAULT_SETTINGS,
    expertMode: defaultExpertModeForRole(user?.role),
  }));
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  return (
    <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
      <section className="panel flex min-h-0 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-line px-4 py-3">
          <div className="flex items-center gap-2">
            <MessagesSquare size={18} className="text-accent" />
            <h2 className="font-mono text-sm uppercase tracking-wider text-ink">Hardening Asistanı</h2>
          </div>
          <button
            onClick={reset}
            disabled={messages.length === 0}
            className="flex items-center gap-1.5 text-xs text-muted hover:text-accent disabled:opacity-30"
          >
            <RotateCcw size={13} /> Yeni sohbet
          </button>
        </header>

        <div ref={scrollRef} className="relative z-10 flex-1 space-y-4 overflow-y-auto px-4 py-5">
          {messages.length === 0 ? (
            <EmptyState
              icon={<Sparkles size={28} />}
              title="CIS tabanlı güvenlik asistanı"
              hint="Sıkılaştırma kuralları, gerekçeleri ve güvenli yapılandırma adımları hakkında soru sor. Yanıtlar geri getirilen CIS kaynaklarına dayandırılır ve kaynak ID'leriyle gösterilir."
            />
          ) : (
            messages.map((m) => <MessageBubble key={m.id} message={m} />)
          )}
          {error && (
            <ErrorBanner message={error.message} requestId={error.requestId} />
          )}
        </div>

        <Composer busy={busy} onSend={(t) => send(t, settings)} onStop={stop} empty={messages.length === 0} />
      </section>

      <aside className="panel hidden flex-col overflow-y-auto p-4 lg:flex">
        <ContextControls settings={settings} onChange={setSettings} />
      </aside>
    </div>
  );
}
