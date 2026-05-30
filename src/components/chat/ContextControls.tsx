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
  const set = <K extends keyof ChatSettings>(key: K, value: ChatSettings[K]) =>
    onChange({ ...settings, [key]: value });

  const ztDesc = ZT_MATURITY_OPTIONS.find((o) => o.value === settings.zt_maturity)?.description;

  return (
    <div className="space-y-4">
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

      <div className="space-y-3 border-t border-line pt-4">
        <p className="label">Retrieval</p>
        <Toggle label="RAG kullan" checked={settings.use_rag} onChange={(v) => set("use_rag", v)} />
        <Toggle label="Streaming (SSE)" checked={settings.stream} onChange={(v) => set("stream", v)} />
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
    </div>
  );
}
