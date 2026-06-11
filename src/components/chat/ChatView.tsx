import { useEffect, useRef, useState } from "react";
import { Download, FileText, History, MessagesSquare, Printer, RotateCcw, Sparkles } from "lucide-react";
import { DEFAULT_SETTINGS, useChat, type ChatSettings } from "@/hooks/useChat";
import { useChatHistory, type HistorySession } from "@/hooks/useChatHistory";
import { useAuth } from "@/context/AuthContext";
import { exportMarkdown, exportPdf } from "@/lib/export";
import { MessageBubble } from "./MessageBubble";
import { Composer } from "./Composer";
import { ContextControls } from "./ContextControls";
import { HistoryPanel } from "./HistoryPanel";
import { EmptyState, ErrorBanner } from "@/components/ui/ui";

type ActivePanel = "context" | "history";

export function ChatView() {
  const { user } = useAuth();
  const { messages, busy, error, send, stop, reset, loadSession } = useChat();
  // ChatView ProtectedRoute arkasında (prod'da user hep var), ama null'da ÇÖKME (test/anon
  // veya yarış durumu) → güvenli fallback ile session geçmişini boş anahtara köklendir.
  const { sessions, saveSession, updateSession, deleteSession, clearAll } = useChatHistory(user?.username ?? "");
  const [settings, setSettings] = useState<ChatSettings>(DEFAULT_SETTINGS);
  const [activePanel, setActivePanel] = useState<ActivePanel>("context");
  const [exportOpen, setExportOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  // Yüklenen geçmiş session'ın ID'si. null = yeni/orijinal sohbet.
  const loadedSessionId = useRef<string | null>(null);
  // true → geçmişten yüklendi, henüz yeni mesaj gönderilmedi.
  const isFromHistory = useRef(false);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Close export dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setExportOpen(false);
      }
    };
    if (exportOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [exportOpen]);

  const flushCurrent = () => {
    if (messages.length === 0 || isFromHistory.current) return;
    if (loadedSessionId.current) {
      updateSession(loadedSessionId.current, messages);
    } else {
      saveSession(messages);
    }
  };

  const handleReset = () => {
    flushCurrent();
    isFromHistory.current = false;
    loadedSessionId.current = null;
    reset();
  };

  const handleSend = (text: string) => {
    // İlk mesaj gönderilince "geçmişten yüklendi" bayrağını kaldır
    isFromHistory.current = false;
    send(text, settings);
  };

  const handleLoadSession = (session: HistorySession) => {
    flushCurrent();
    isFromHistory.current = true;
    loadedSessionId.current = session.id;
    loadSession(session.messages);
    setActivePanel("context");
  };

  return (
    <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
      {/* ── Chat column ── */}
      <section className="panel flex min-h-0 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-line px-4 py-3">
          <div className="flex items-center gap-2">
            <MessagesSquare size={18} className="text-accent" />
            <h2 className="font-mono text-sm uppercase tracking-wider text-ink">Hardening Asistanı</h2>
          </div>

          <div className="flex items-center gap-1">
            {/* Export dropdown */}
            <div ref={exportRef} className="relative">
              <button
                onClick={() => setExportOpen((o) => !o)}
                disabled={messages.length === 0}
                className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted hover:bg-surface-2 hover:text-accent disabled:opacity-30 transition-colors"
                title="Dışa aktar"
              >
                <Download size={13} />
                Dışa aktar
              </button>
              {exportOpen && (
                <div className="absolute right-0 top-full z-20 mt-1 w-48 overflow-hidden rounded-lg border border-line bg-surface shadow-panel animate-fade-up">
                  <button
                    onClick={() => { exportMarkdown(messages); setExportOpen(false); }}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-muted hover:bg-surface-2 hover:text-ink transition-colors"
                  >
                    <FileText size={14} className="text-accent" />
                    Markdown olarak indir
                  </button>
                  <button
                    onClick={() => { exportPdf(messages); setExportOpen(false); }}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-muted hover:bg-surface-2 hover:text-ink transition-colors"
                  >
                    <Printer size={14} className="text-accent" />
                    PDF olarak yazdır
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleReset}
              disabled={messages.length === 0}
              className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted hover:bg-surface-2 hover:text-accent disabled:opacity-30 transition-colors"
            >
              <RotateCcw size={13} /> Yeni sohbet
            </button>
          </div>
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

        <Composer busy={busy} onSend={handleSend} onStop={stop} empty={messages.length === 0} />
      </section>

      {/* ── Right panel: Context Controls / History ── */}
      <aside className="panel hidden flex-col overflow-hidden lg:flex">
        {/* Panel tab bar */}
        <div className="flex shrink-0 border-b border-line">
          <button
            onClick={() => setActivePanel("context")}
            className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${
              activePanel === "context"
                ? "border-b-2 border-accent text-accent"
                : "text-muted hover:text-ink"
            }`}
          >
            Bağlam
          </button>
          <button
            onClick={() => setActivePanel("history")}
            className={`relative flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${
              activePanel === "history"
                ? "border-b-2 border-accent text-accent"
                : "text-muted hover:text-ink"
            }`}
          >
            <History size={13} />
            Geçmiş
            {sessions.length > 0 && (
              <span className="absolute right-3 top-1.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-accent/20 px-1 font-mono text-[9px] text-accent">
                {sessions.length}
              </span>
            )}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {activePanel === "context" ? (
            <ContextControls settings={settings} onChange={setSettings} />
          ) : (
            <HistoryPanel
              sessions={sessions}
              onLoad={handleLoadSession}
              onDelete={deleteSession}
              onClearAll={clearAll}
            />
          )}
        </div>
      </aside>
    </div>
  );
}
