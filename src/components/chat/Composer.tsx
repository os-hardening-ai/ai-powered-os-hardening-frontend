import { useRef, useState, type KeyboardEvent } from "react";
import { Send, Square } from "lucide-react";

const SUGGESTIONS = [
  "SSH root login nasıl devre dışı bırakılır?",
  "Ubuntu 24.04 için ufw firewall sıkılaştırması",
  "Çekirdek modülü cramfs neden kapatılmalı?",
  "PermitRootLogin için CIS kuralı nedir?",
];

export function Composer({
  busy,
  onSend,
  onStop,
  empty,
}: {
  busy: boolean;
  onSend: (text: string) => void;
  onStop: () => void;
  empty: boolean;
}) {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  const submit = () => {
    if (!value.trim() || busy) return;
    onSend(value.trim());
    setValue("");
    if (ref.current) ref.current.style.height = "auto";
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const autosize = () => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  };

  return (
    <div className="border-t border-line bg-surface/80 px-4 py-3 backdrop-blur">
      {empty && (
        <div className="mb-2.5 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => onSend(s)}
              disabled={busy}
              className="rounded-full border border-line bg-surface-2 px-3 py-1 text-xs text-muted transition-colors hover:border-accent/50 hover:text-accent disabled:opacity-40"
            >
              {s}
            </button>
          ))}
        </div>
      )}
      <div className="flex items-end gap-2 rounded-xl border border-line bg-bg/60 px-3 py-2 focus-within:border-accent/50">
        <textarea
          ref={ref}
          rows={1}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            autosize();
          }}
          onKeyDown={onKey}
          placeholder="Bir güvenlik sorusu sor veya bir hardening adımı iste…"
          className="max-h-[180px] flex-1 resize-none bg-transparent py-1 text-sm text-ink placeholder:text-faint focus:outline-none"
        />
        {busy ? (
          <button onClick={onStop} className="btn border-danger/40 bg-danger/10 text-danger hover:bg-danger/20">
            <Square size={15} /> Durdur
          </button>
        ) : (
          <button onClick={submit} disabled={!value.trim()} className="btn btn-accent">
            <Send size={15} /> Gönder
          </button>
        )}
      </div>
      <p className="mt-1.5 text-center text-[11px] text-faint">
        Enter ile gönder · Shift+Enter ile yeni satır · Yanıtlar CIS kaynaklarına dayandırılır
      </p>
    </div>
  );
}
