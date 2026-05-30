import { useState } from "react";
import {
  AlertTriangle,
  Bot,
  Check,
  Copy,
  Download,
  Loader2,
  Play,
  ShieldAlert,
  Wand2,
  X,
} from "lucide-react";
import { agentHarden, agentPlan } from "@/lib/api";
import { ApiError } from "@/lib/http";
import { ARTIFACT_FORMATS, OS_OPTIONS, SECURITY_LEVELS } from "@/config";
import { artifactExtension, downloadText, hasDangerousCommand, osFamily } from "@/lib/format";
import { Badge, EmptyState, ErrorBanner, Select } from "@/components/ui/ui";
import type {
  AgentHardenResponse,
  AgentPlanResponse,
  AgentStep,
  ArtifactFormat,
  OsTarget,
  SecurityLevel,
} from "@/types/api";

const OS_OPTS = OS_OPTIONS.filter((o) => o.value !== "windows_server_2025").map((o) => ({
  value: o.value,
  label: o.label,
}));

export function AgentView() {
  const [goal, setGoal] = useState("");
  const [os, setOs] = useState<OsTarget>("ubuntu_24_04");
  const [level, setLevel] = useState<SecurityLevel>("balanced");
  const [format, setFormat] = useState<ArtifactFormat>("bash");
  const [busy, setBusy] = useState<"plan" | "harden" | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [plan, setPlan] = useState<AgentPlanResponse | null>(null);
  const [harden, setHarden] = useState<AgentHardenResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const fam = osFamily(os);
  const formats = ARTIFACT_FORMATS.filter((f) => f.family === "any" || f.family === fam);

  const runPlan = async () => {
    if (!goal.trim() || busy) return;
    setBusy("plan");
    setError(null);
    setHarden(null);
    try {
      setPlan(await agentPlan({ goal: goal.trim(), os_target: os, security_level: level }));
    } catch (e) {
      setError(e instanceof ApiError ? e : new ApiError({ status: 0, code: "UNKNOWN", message: String(e) }));
    } finally {
      setBusy(null);
    }
  };

  const runHarden = async () => {
    if (!goal.trim() || busy) return;
    setBusy("harden");
    setError(null);
    try {
      const res = await agentHarden({ goal: goal.trim(), os_target: os, security_level: level, format });
      setHarden(res);
      setPlan(res.plan);
    } catch (e) {
      setError(e instanceof ApiError ? e : new ApiError({ status: 0, code: "UNKNOWN", message: String(e) }));
    } finally {
      setBusy(null);
    }
  };

  const copy = async () => {
    if (!harden) return;
    await navigator.clipboard.writeText(harden.artifact_content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const dangerous = harden ? hasDangerousCommand(harden.artifact_content) : false;

  return (
    <div className="grid h-full grid-cols-1 gap-4 xl:grid-cols-[420px_1fr]">
      {/* Input panel */}
      <section className="panel flex min-h-0 flex-col overflow-hidden">
        <header className="flex items-center gap-2 border-b border-line px-4 py-3">
          <Bot size={18} className="text-accent" />
          <h2 className="font-mono text-sm uppercase tracking-wider text-ink">Hedef-bazlı Sıkılaştırma</h2>
        </header>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
          <div>
            <label className="label mb-1.5 block">Hedef</label>
            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Örn: SSH ve parola politikasını sıkılaştır"
              rows={4}
              className="field w-full resize-none"
            />
          </div>

          <Select<OsTarget>
            label="İşletim sistemi"
            value={os}
            onChange={(v) => {
              setOs(v);
              const newFam = osFamily(v);
              const defaultFmt = newFam === "windows" ? "powershell" : "bash";
              setFormat(defaultFmt as ArtifactFormat);
            }}
            options={OS_OPTS}
          />

          <Select<SecurityLevel>
            label="Güvenlik seviyesi"
            value={level}
            onChange={setLevel}
            options={SECURITY_LEVELS.map((s) => ({ value: s, label: s }))}
          />

          <Select<ArtifactFormat>
            label="Artifact formatı"
            value={format}
            onChange={setFormat}
            options={formats.map((f) => ({ value: f.value, label: f.label }))}
          />

          <div className="flex gap-2">
            <button onClick={runPlan} disabled={!goal.trim() || busy !== null} className="btn flex-1">
              {busy === "plan" ? <Loader2 size={15} className="animate-spin" /> : <Wand2 size={15} />}
              Planla
            </button>
            <button onClick={runHarden} disabled={!goal.trim() || busy !== null} className="btn btn-accent flex-1">
              {busy === "harden" ? <Loader2 size={15} className="animate-spin" /> : <Play size={15} />}
              Sıkılaştır
            </button>
          </div>

          {error && <ErrorBanner message={error.message} requestId={error.requestId} />}
        </div>
      </section>

      {/* Results panel */}
      <section className="panel flex min-h-0 flex-col overflow-hidden">
        <header className="border-b border-line px-4 py-3">
          <h2 className="font-mono text-sm uppercase tracking-wider text-ink">Sonuç</h2>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {!plan && !harden && busy === null && (
            <EmptyState
              title="Henüz sonuç yok"
              hint="Hedef yaz, OS ve format seç. 'Planla' ile kural listesi, 'Sıkılaştır' ile hazır script üretilir."
            />
          )}

          {(busy === "plan" || busy === "harden") && (
            <div className="flex justify-center py-16 text-faint">
              <Loader2 className="animate-spin" />
            </div>
          )}

          {harden && <HardenResult res={harden} onCopy={copy} copied={copied} dangerous={dangerous} os={os} />}

          {plan && !harden && <PlanResult plan={plan} />}
        </div>
      </section>
    </div>
  );
}

function PlanResult({ plan }: { plan: AgentPlanResponse }) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-line bg-surface-2/40 p-3">
        <p className="label mb-1">Özet</p>
        <p className="text-sm text-muted">{plan.summary}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Badge tone="muted">{plan.os_target}</Badge>
          <Badge tone="muted">{plan.security_level}</Badge>
          <Badge tone="accent">{plan.items.length} kural</Badge>
        </div>
      </div>

      <div className="space-y-2">
        <p className="label">Kural planı</p>
        {plan.items.map((item) => (
          <div key={item.rule_id} className="rounded-lg border border-line p-3 space-y-1.5">
            <div className="flex items-start gap-2">
              <Badge tone="muted">#{item.order}</Badge>
              <span className="font-mono text-xs text-accent">{item.rule_id}</span>
              <span className="text-sm text-ink flex-1">{item.title}</span>
            </div>
            <p className="text-xs text-muted leading-relaxed">{item.rationale}</p>
            <div className="flex flex-wrap gap-1.5">
              <Badge tone={item.risk.toLowerCase().includes("high") ? "danger" : item.risk.toLowerCase().includes("medium") ? "warn" : "muted"}>
                risk: {item.risk}
              </Badge>
              {item.zt_principle && <span className="chip text-[10px]">ZT: {item.zt_principle}</span>}
              {item.nist_ref && <span className="chip text-[10px]">NIST: {item.nist_ref}</span>}
            </div>
          </div>
        ))}
      </div>

      {plan.conflicts.length > 0 && (
        <div className="space-y-1.5">
          <p className="label text-danger">Çakışmalar</p>
          {plan.conflicts.map((c, i) => (
            <div key={i} className="rounded-md border border-danger/30 bg-danger/10 px-2.5 py-1.5 text-[12px] text-danger">
              <span className="font-mono">{c.rule_a} ✕ {c.rule_b}</span> · {c.conflict_type} ({c.resource}) — {c.description}
            </div>
          ))}
        </div>
      )}

      {plan.warnings.length > 0 && (
        <ul className="space-y-1 text-[12px] text-warn">
          {plan.warnings.map((w, i) => (
            <li key={i} className="flex items-start gap-1.5">
              <AlertTriangle size={13} className="mt-0.5 shrink-0" />
              {w}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function HardenResult({
  res,
  onCopy,
  copied,
  dangerous,
  os,
}: {
  res: AgentHardenResponse;
  onCopy: () => void;
  copied: boolean;
  dangerous: boolean;
  os: OsTarget;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Badge tone={res.success ? "accent" : "danger"}>
          {res.success ? "başarılı" : "kısmi"}
        </Badge>
        <Badge tone="muted">{res.rule_count} kural</Badge>
        <Badge tone="muted">{res.format}</Badge>
      </div>

      <div className="rounded-lg border border-line bg-surface-2/40 p-3">
        <p className="text-sm text-muted">{res.summary}</p>
      </div>

      {/* Step trace */}
      <div className="space-y-1.5">
        <p className="label">Adım izi</p>
        {res.steps.map((step, i) => (
          <StepRow key={i} step={step} />
        ))}
      </div>

      {res.issues.length > 0 && (
        <ul className="space-y-1 text-[12px] text-warn">
          {res.issues.map((w, i) => (
            <li key={i} className="flex items-start gap-1.5">
              <AlertTriangle size={13} className="mt-0.5 shrink-0" />
              {w}
            </li>
          ))}
        </ul>
      )}

      {/* Artifact */}
      {res.artifact_content && (
        <div className="overflow-hidden rounded-lg border border-line">
          <div className="flex items-center justify-between border-b border-line bg-surface-2 px-3 py-2">
            <span className="font-mono text-[11px] uppercase tracking-wider text-faint">
              {res.format} · {res.rule_count} kural · {res.os_target}
            </span>
            <div className="flex items-center gap-3">
              <button onClick={onCopy} className="flex items-center gap-1 text-xs text-muted hover:text-accent">
                {copied ? <Check size={13} /> : <Copy size={13} />} Kopyala
              </button>
              <button
                onClick={() => downloadText(`hardening_${os}.${artifactExtension(res.format)}`, res.artifact_content)}
                className="flex items-center gap-1 text-xs text-accent hover:underline"
              >
                <Download size={13} /> İndir
              </button>
            </div>
          </div>
          {dangerous && (
            <div className="flex items-center gap-2 border-b border-danger/30 bg-danger/10 px-3 py-2 text-[12px] text-danger">
              <ShieldAlert size={14} />
              Script yüksek riskli komutlar içeriyor. İzole ortamda test et.
            </div>
          )}
          <pre className="max-h-80 overflow-auto bg-bg/70 px-3 py-2.5 font-mono text-[12px] leading-relaxed text-ink">
            <code>{res.artifact_content}</code>
          </pre>
        </div>
      )}

      {/* Plan summary */}
      {res.plan.items.length > 0 && (
        <details className="rounded-lg border border-line">
          <summary className="cursor-pointer px-3 py-2 font-mono text-xs uppercase tracking-wider text-faint hover:text-ink">
            Plan özeti ({res.plan.items.length} kural)
          </summary>
          <div className="px-3 pb-3">
            <PlanResult plan={res.plan} />
          </div>
        </details>
      )}
    </div>
  );
}

function StepRow({ step }: { step: AgentStep }) {
  return (
    <div className="flex items-start gap-2 rounded-md border border-line px-2.5 py-2 text-sm">
      <span className={`mt-0.5 shrink-0 ${step.ok ? "text-accent" : "text-danger"}`}>
        {step.ok ? <Check size={13} /> : <X size={13} />}
      </span>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-ink">{step.name}</span>
          <span className="chip text-[10px]">{step.tool}</span>
        </div>
        {step.detail && <p className="mt-0.5 text-xs text-faint">{step.detail}</p>}
      </div>
    </div>
  );
}
