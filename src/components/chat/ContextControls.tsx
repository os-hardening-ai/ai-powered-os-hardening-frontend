import { useState } from "react";
import { ChevronDown, AlertTriangle } from "lucide-react";
import { Select, Toggle } from "@/components/ui/ui";
import { OS_OPTIONS, ROLE_OPTIONS, SECURITY_LEVELS, ZT_MATURITY_OPTIONS } from "@/config";
import type { ChatSettings } from "@/hooks/useChat";
import type { OsTarget, SecurityLevel, UserRole, ZtMaturity } from "@/types/api";

export function ContextControls({
  settings,
  onChange,
}: {
  settings: ChatSettings;
  onChange: (next: ChatSettings) => void;
}) {
  // Gelişmiş retrieval ayarları varsayılan KAPALI (sade arayüz); kullanıcı açabilir.
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const set = <K extends keyof ChatSettings>(key: K, value: ChatSettings[K]) =>
    onChange({ ...settings, [key]: value });

  const ztDesc = ZT_MATURITY_OPTIONS.find((o) => o.value === settings.zt_maturity)?.description;

  // stream × mod → çağrılacak gerçek endpoint (useChat ile aynı eşleme).
  const activeEndpoint = settings.stream
    ? settings.expertMode
      ? "/api/chat/stream/fast"
      : "/api/chat/stream"
    : settings.expertMode
      ? "/api/chat/fast"
      : "/api/chat";

  return (
    <div className="space-y-4">
      {/* ── Grup 1: GERÇEK bağlam — her isteğe giden OS/rol/seviye/ZT ── */}
      <div>
        <p className="label mb-2">Bağlam</p>
        <div className="space-y-3">
          <Select<OsTarget>
            label="İşletim sistemi"
            value={(settings.os ?? "ubuntu_24_04") as OsTarget}
            onChange={(v) => set("os", v)}
            options={OS_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          />
          <Select<UserRole>
            label="Rol"
            value={(settings.role ?? "sysadmin") as UserRole}
            onChange={(v) => set("role", v)}
            options={ROLE_OPTIONS}
          />
          <Select<SecurityLevel>
            label="Güvenlik seviyesi"
            value={settings.security_level}
            onChange={(v) => set("security_level", v)}
            options={SECURITY_LEVELS.map((s) => ({ value: s, label: s }))}
          />
          <label className="flex flex-col gap-1">
            <span className="label">ZT Olgunluğu</span>
            <select
              className="field appearance-none"
              value={settings.zt_maturity}
              onChange={(e) => set("zt_maturity", e.target.value as ZtMaturity)}
            >
              {ZT_MATURITY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value} className="bg-surface">
                  {o.label} — {o.description}
                </option>
              ))}
            </select>
            {ztDesc && (
              <span className="font-mono text-[10px] leading-relaxed text-faint">{ztDesc}</span>
            )}
          </label>
        </div>
      </div>

      {/* ── Grup 2: Gelişmiş retrieval — katlanır accordion ── */}
      <div className="border-t border-line pt-4">
        <button
          type="button"
          aria-expanded={advancedOpen}
          onClick={() => setAdvancedOpen((o) => !o)}
          className="flex w-full items-center justify-between text-left"
        >
          <span className="label">Gelişmiş — Retrieval</span>
          <ChevronDown
            size={15}
            className={`text-muted transition-transform ${advancedOpen ? "rotate-180" : ""}`}
          />
        </button>

        {advancedOpen && (
          <div className="mt-3 space-y-3 animate-fade-up">
            <Toggle
              label="RAG kullan"
              checked={settings.use_rag}
              onChange={(v) => set("use_rag", v)}
            />

            {/* RAG kapalıyken kaynaksız (uydurma riski) uyarısı */}
            {!settings.use_rag && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-lg border border-warn/40 bg-warn/10 px-3 py-2 text-xs text-warn"
              >
                <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                <span>
                  RAG kapalı: yanıtlar CIS Benchmark kaynaklarına dayandırılmaz, kaynak
                  gösterilmez ve uydurma (hallucination) riski artar.
                </span>
              </div>
            )}

            {/* Yanıt modu — HER İKİ MOD DA RAG kullanır; fark RAG'de değil, yönlendirme+hızda:
                  Tam (akıllı) → /api/chat[/stream]      (intent routing + smalltalk + complexity + doğrulama)
                  Hızlı RAG    → /api/chat/fast[/stream]  (routing yok, doğrudan RAG-grounded üretim) */}
            <Select<"full" | "fast">
              label="Yanıt modu"
              value={settings.expertMode ? "fast" : "full"}
              onChange={(v) => set("expertMode", v === "fast")}
              options={[
                { value: "full", label: "Tam (akıllı) — önerilen" },
                { value: "fast", label: "Hızlı RAG" },
              ]}
            />
            <p className="font-mono text-[10px] leading-relaxed text-faint">
              {settings.expertMode
                ? "Hızlı RAG: RAG + doğrudan üretim; yönlendirme atlanır → en hızlı ilk-token. Her girdi güvenlik sorusu sayılır (selam/naber yönlendirmesi yok)."
                : "Tam (akıllı): RAG + selam/naber yönlendirmesi + soru karmaşıklığına göre model + iddia doğrulaması. İkisi de CIS kaynaklarını kullanır."}
            </p>

            {/* Streaming — gerçek ürünlerde gizli/hep-açık olur ama konsol/değerlendirme
                için kapatılabilir bırakıldı. Kapalıyken bile 'Hızlı RAG' modu çalışır
                (non-stream /api/chat/fast). */}
            <Toggle
              label="Streaming (SSE)"
              checked={settings.stream}
              onChange={(v) => set("stream", v)}
            />

            {/* Aktif uç — request GÖVDESİ 4 uçta da AYNI (ChatRequest); değişen yalnız
                hangi endpoint'e gidildiği (stream × mod). Şeffaflık için gösterilir. */}
            <div className="rounded-lg border border-line bg-bg/40 px-3 py-2">
              <p className="label normal-case tracking-normal text-faint">Aktif uç</p>
              <code className="mt-0.5 block font-mono text-[11px] text-accent">
                POST {activeEndpoint}
              </code>
            </div>
            <label className="flex flex-col gap-1.5">
              <span className="label normal-case tracking-normal text-muted">
                Top-K kaynak: <span className="text-accent">{settings.rag_top_k}</span>
              </span>
              <input
                type="range"
                min={1}
                max={20}
                value={settings.rag_top_k}
                disabled={!settings.use_rag}
                onChange={(e) => set("rag_top_k", Number(e.target.value))}
                className="accent-accent disabled:opacity-40"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="label normal-case tracking-normal text-muted">
                Min. benzerlik skoru:{" "}
                <span className={settings.rag_min_score > 0 ? "text-accent" : "text-faint"}>
                  {settings.rag_min_score > 0 ? settings.rag_min_score.toFixed(2) : "kapalı"}
                </span>
              </span>
              <input
                type="range"
                min={0}
                max={0.9}
                step={0.05}
                value={settings.rag_min_score}
                disabled={!settings.use_rag}
                onChange={(e) => set("rag_min_score", Number(e.target.value))}
                className="accent-accent disabled:opacity-40"
              />
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
