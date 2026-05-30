import { Select, Toggle } from "@/components/ui/ui";
import { OS_OPTIONS, ROLE_OPTIONS, SECURITY_LEVELS } from "@/config";
import type { ChatSettings } from "@/hooks/useChat";
import type { OsTarget, SecurityLevel, UserRole } from "@/types/api";

export function ContextControls({
  settings,
  onChange,
}: {
  settings: ChatSettings;
  onChange: (next: ChatSettings) => void;
}) {
  const set = <K extends keyof ChatSettings>(key: K, value: ChatSettings[K]) =>
    onChange({ ...settings, [key]: value });

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
      </div>
    </div>
  );
}
