import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { CisRule } from "@/types/api";
import { Badge } from "@/components/ui/ui";

export function RuleRow({
  rule,
  selected,
  onToggle,
}: {
  rule: CisRule;
  selected: boolean;
  onToggle: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <li className={`rounded-lg border bg-surface-2/40 transition-colors ${selected ? "border-accent/50" : "border-line"}`}>
      <div className="flex items-center gap-3 px-3 py-2.5">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggle(rule.id)}
          className="h-4 w-4 shrink-0 accent-[rgb(52_211_153)]"
          aria-label={`${rule.id} kuralını seç`}
        />
        <button onClick={() => setOpen((v) => !v)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
          <span className="shrink-0 font-mono text-xs text-accent">{rule.id}</span>
          <span className="min-w-0 flex-1 truncate text-sm text-ink">{rule.title}</span>
          <div className="hidden shrink-0 items-center gap-1.5 sm:flex">
            {rule.level && <Badge>L{rule.level}</Badge>}
            {rule.auto_remediate ? (
              <Badge tone="accent">auto</Badge>
            ) : (
              <Badge tone="warn">manual</Badge>
            )}
          </div>
          <ChevronDown size={15} className={`shrink-0 text-faint transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      </div>

      {open && (
        <div className="space-y-2.5 border-t border-line px-3 py-3 text-sm">
          {rule.description && <p className="leading-relaxed text-muted">{rule.description}</p>}
          <dl className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
            {rule.category && <Field k="Kategori" v={rule.category} />}
            {rule.section && <Field k="Section" v={rule.section} mono />}
            {rule.sshd_directive && <Field k="SSH direktifi" v={rule.sshd_directive} mono />}
            {rule.expected_value && <Field k="Beklenen değer" v={rule.expected_value} mono />}
            {rule.kernel_module && <Field k="Kernel modülü" v={rule.kernel_module} mono />}
            {rule.config_files?.length ? <Field k="Config" v={rule.config_files.join(", ")} mono /> : null}
          </dl>
          {rule.tags?.length ? (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {rule.tags.map((t) => (
                <span key={t} className="chip lowercase">
                  {t}
                </span>
              ))}
            </div>
          ) : null}
          {rule.audit_command && (
            <CmdBlock label="Audit (verify)" content={rule.audit_command} />
          )}
          {rule.remediation_command && (
            <CmdBlock label="Remediation (apply)" content={rule.remediation_command} />
          )}
        </div>
      )}
    </li>
  );
}

function Field({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex gap-2">
      <dt className="label shrink-0">{k}</dt>
      <dd className={`min-w-0 break-words text-muted ${mono ? "font-mono text-xs" : ""}`}>{v}</dd>
    </div>
  );
}

function CmdBlock({ label, content }: { label: string; content: string }) {
  return (
    <div>
      <p className="label mb-1">{label}</p>
      <pre className="overflow-x-auto rounded-md border border-line bg-bg/60 px-2.5 py-1.5 font-mono text-[11.5px] text-ink">
        {content}
      </pre>
    </div>
  );
}
