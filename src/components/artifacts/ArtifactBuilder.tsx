import { useState } from "react";
import { AlertTriangle, Boxes, Check, Copy, Download, GitMerge, Loader2, Play, ShieldAlert } from "lucide-react";
import { generateArtifact, getExecutionPlan } from "@/lib/api";
import { ApiError } from "@/lib/http";
import { ARTIFACT_FORMATS, SECURITY_LEVELS } from "@/config";
import { artifactExtension, downloadText, hasDangerousCommand, osFamily } from "@/lib/format";
import { Badge, ErrorBanner, Select } from "@/components/ui/ui";
import type {
  ArtifactFormat,
  ArtifactResponse,
  ExecutionPlanResponse,
  OsTarget,
  SecurityLevel,
} from "@/types/api";

export function ArtifactBuilder({
  selectedIds,
  os,
  onClear,
}: {
  selectedIds: string[];
  os: OsTarget;
  onClear: () => void;
}) {
  const fam = osFamily(os);
  const formats = ARTIFACT_FORMATS.filter((f) => f.family === "any" || f.family === fam);
  const [format, setFormat] = useState<ArtifactFormat>(fam === "windows" ? "powershell" : "bash");
  const [level, setLevel] = useState<SecurityLevel>("balanced");
  const [plan, setPlan] = useState<ExecutionPlanResponse | null>(null);
  const [artifact, setArtifact] = useState<ArtifactResponse | null>(null);
  const [busy, setBusy] = useState<"plan" | "gen" | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [copied, setCopied] = useState(false);

  const runPlan = async () => {
    setBusy("plan");
    setError(null);
    try {
      setPlan(await getExecutionPlan(selectedIds));
    } catch (e) {
      setError(e instanceof ApiError ? e : new ApiError({ status: 0, code: "UNKNOWN", message: String(e) }));
    } finally {
      setBusy(null);
    }
  };

  const runGenerate = async () => {
    setBusy("gen");
    setError(null);
    try {
      const res = await generateArtifact({
        rule_ids: plan?.ordered_rules ?? selectedIds,
        format,
        os_target: os,
        security_level: level,
      });
      setArtifact(res);
    } catch (e) {
      setError(e instanceof ApiError ? e : new ApiError({ status: 0, code: "UNKNOWN", message: String(e) }));
    } finally {
      setBusy(null);
    }
  };

  const copy = async () => {
    if (!artifact) return;
    await navigator.clipboard.writeText(artifact.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const dangerous = artifact ? hasDangerousCommand(artifact.content) : false;

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b border-line px-4 py-3">
        <div className="flex items-center gap-2">
          <Boxes size={18} className="text-accent" />
          <h2 className="font-mono text-sm uppercase tracking-wider text-ink">Artifact Üretici</h2>
        </div>
        <Badge tone={selectedIds.length ? "accent" : "muted"}>{selectedIds.length} kural</Badge>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {selectedIds.length === 0 ? (
          <p className="py-8 text-center text-sm text-faint">
            Soldaki listeden kural seç. Seçilen kurallar için çalıştırma planı çıkarılıp script üretilir.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap gap-1.5">
              {selectedIds.map((id) => (
                <span key={id} className="chip lowercase">
                  {id}
                </span>
              ))}
              <button onClick={onClear} className="text-xs text-danger hover:underline">
                temizle
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Select<ArtifactFormat>
                label="Format"
                value={format}
                onChange={setFormat}
                options={formats.map((f) => ({ value: f.value, label: f.label }))}
              />
              <Select<SecurityLevel>
                label="Güvenlik seviyesi"
                value={level}
                onChange={setLevel}
                options={SECURITY_LEVELS.map((s) => ({ value: s, label: s }))}
              />
            </div>

            <div className="flex gap-2">
              <button onClick={runPlan} disabled={busy !== null} className="btn flex-1">
                {busy === "plan" ? <Loader2 size={15} className="animate-spin" /> : <GitMerge size={15} />}
                Plan & Çakışma
              </button>
              <button onClick={runGenerate} disabled={busy !== null} className="btn btn-accent flex-1">
                {busy === "gen" ? <Loader2 size={15} className="animate-spin" /> : <Play size={15} />}
                Script Üret
              </button>
            </div>

            {error && <ErrorBanner message={error.message} requestId={error.requestId} />}

            {plan && <PlanView plan={plan} />}

            {artifact && (
              <div className="overflow-hidden rounded-lg border border-line">
                <div className="flex items-center justify-between border-b border-line bg-surface-2 px-3 py-2">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-faint">
                    {artifact.format} · {artifact.rule_count} kural · {artifact.os_target}
                  </span>
                  <div className="flex items-center gap-3">
                    <button onClick={copy} className="flex items-center gap-1 text-xs text-muted hover:text-accent">
                      {copied ? <Check size={13} /> : <Copy size={13} />} Kopyala
                    </button>
                    <button
                      onClick={() =>
                        downloadText(`hardening_${os}.${artifactExtension(artifact.format)}`, artifact.content)
                      }
                      className="flex items-center gap-1 text-xs text-accent hover:underline"
                    >
                      <Download size={13} /> İndir
                    </button>
                  </div>
                </div>
                {dangerous && (
                  <div className="flex items-center gap-2 border-b border-danger/30 bg-danger/10 px-3 py-2 text-[12px] text-danger">
                    <ShieldAlert size={14} />
                    Script yüksek riskli komutlar içeriyor. İzole bir ortamda test et ve sistem yedeği al.
                  </div>
                )}
                {artifact.warnings.length > 0 && (
                  <ul className="space-y-1 border-b border-warn/30 bg-warn/10 px-3 py-2 text-[12px] text-warn">
                    {artifact.warnings.map((w, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                        {w}
                      </li>
                    ))}
                  </ul>
                )}
                <pre className="max-h-80 overflow-auto bg-bg/70 px-3 py-2.5 font-mono text-[12px] leading-relaxed text-ink">
                  <code>{artifact.content}</code>
                </pre>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function PlanView({ plan }: { plan: ExecutionPlanResponse }) {
  return (
    <div className="rounded-lg border border-line bg-bg/40 p-3 text-sm">
      <p className="label mb-2">Çalıştırma sırası · {plan.rule_count} kural</p>
      <div className="mb-3 flex flex-wrap items-center gap-1">
        {plan.ordered_rules.map((id, i) => (
          <span key={id} className="flex items-center">
            <span className="chip lowercase">{id}</span>
            {i < plan.ordered_rules.length - 1 && <span className="px-0.5 text-faint">→</span>}
          </span>
        ))}
      </div>

      {plan.conflicts.length > 0 ? (
        <div className="space-y-1.5">
          <p className="label text-danger">Çakışmalar</p>
          {plan.conflicts.map((c, i) => (
            <div key={i} className="rounded-md border border-danger/30 bg-danger/10 px-2.5 py-1.5 text-[12px] text-danger">
              <span className="font-mono">
                {c.rule_a} ✕ {c.rule_b}
              </span>{" "}
              · {c.conflict_type} ({c.resource}) — {c.description}
            </div>
          ))}
        </div>
      ) : (
        <p className="flex items-center gap-1.5 text-[12px] text-accent">
          <Check size={13} /> Çakışma tespit edilmedi.
        </p>
      )}

      {plan.warnings.length > 0 && (
        <ul className="mt-2 space-y-1 text-[12px] text-warn">
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
