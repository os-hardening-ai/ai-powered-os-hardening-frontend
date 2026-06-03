import { MessagesSquare, Trash2, UploadCloud } from "lucide-react";
import type { HistorySession } from "@/hooks/useChatHistory";

interface Props {
  sessions: HistorySession[];
  onLoad: (session: HistorySession) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

function relativeDate(ts: number): string {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "az önce";
  if (min < 60) return `${min} dk önce`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} sa önce`;
  const days = Math.floor(hr / 24);
  if (days < 7) return `${days} gün önce`;
  return new Date(ts).toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
}

export function HistoryPanel({ sessions, onLoad, onDelete, onClearAll }: Props) {
  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
        <MessagesSquare size={28} className="text-faint" />
        <p className="font-mono text-xs uppercase tracking-wider text-muted">Geçmiş yok</p>
        <p className="text-xs text-faint">
          Sohbet sıfırlandığında buraya kaydedilir.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 min-h-0">
      <div className="flex items-center justify-between">
        <p className="label">Sohbet Geçmişi</p>
        <button
          onClick={onClearAll}
          className="flex items-center gap-1 text-[11px] text-muted hover:text-danger transition-colors"
          title="Tüm geçmişi sil"
        >
          <Trash2 size={12} />
          Tümünü sil
        </button>
      </div>

      <ul className="space-y-1.5 overflow-y-auto flex-1">
        {sessions.map((s) => (
          <li
            key={s.id}
            className="group rounded-lg border border-line bg-surface-2/50 px-3 py-2.5 hover:border-accent/30 hover:bg-surface transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <button
                onClick={() => onLoad(s)}
                className="min-w-0 flex-1 text-left"
                title="Bu sohbeti yükle"
              >
                <p className="truncate text-xs text-ink leading-snug">{s.title}</p>
                <p className="mt-0.5 font-mono text-[10px] text-faint">
                  {relativeDate(s.createdAt)} · {s.messages.length} mesaj
                </p>
              </button>

              <div className="flex shrink-0 items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onLoad(s)}
                  title="Yükle"
                  className="flex h-6 w-6 items-center justify-center rounded text-faint hover:text-accent transition-colors"
                >
                  <UploadCloud size={13} />
                </button>
                <button
                  onClick={() => onDelete(s.id)}
                  title="Sil"
                  className="flex h-6 w-6 items-center justify-center rounded text-faint hover:text-danger transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
