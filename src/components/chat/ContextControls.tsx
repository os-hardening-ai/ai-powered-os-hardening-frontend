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

  // streaming aç/kapa → çağrılacak endpoint (useChat ile aynı). Her ikisi de tam
  // SecurePipelineV2 (intent routing + smalltalk + complexity + doğrulama).
  const activeEndpoint = settings.stream ? "/api/chat/stream" : "/api/chat";

  return (
    <div className="space-y-4">
      {/* ── Grup 1: GERÇEK bağlam — her isteğe giden OS/rol/seviye/ZT ── */}
      <div>
        <p className="label mb-2">Bağlam</p>
        <div className="space-y-3">
          {/* "Otomatik" → null gönderir → backend FilterAgent (LLM) os/rol'ü SORUDAN
              çıkarır. Boş gönderilmezse (sabit değer) FilterAgent hiç çalışmaz; bu yüzden
              "akıllı" param-çıkarımı yalnız Otomatik seçilince devreye girer.
              stats.inferred_os ile ne çıkarıldığı yanıtta görülebilir. */}
          <Select<OsTarget | "auto">
            label="İşletim sistemi"
            value={settings.os ?? "auto"}
            onChange={(v) => set("os", v === "auto" ? null : v)}
            options={[
              { value: "auto", label: "Otomatik (sorudan algıla)" },
              ...OS_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
            ]}
          />
          <Select<UserRole | "auto">
            label="Rol"
            value={settings.role ?? "auto"}
            onChange={(v) => set("role", v === "auto" ? null : v)}
            options={[
              { value: "auto", label: "Otomatik (sorudan algıla)" },
              ...ROLE_OPTIONS,
            ]}
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

            {/* Streaming — açık: /api/chat/stream (SSE), kapalı: /api/chat. İkisi de
                tam SecurePipelineV2 (intent routing + smalltalk + complexity + doğrulama). */}
            <Toggle
              label="Streaming (SSE)"
              checked={settings.stream}
              onChange={(v) => set("stream", v)}
            />

            {/* Aktif uç — request gövdesi aynı (ChatRequest); değişen yalnız stream aç/kapa. */}
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
