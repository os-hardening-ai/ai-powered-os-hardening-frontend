import { useState } from "react";
import { ChevronDown, FileText } from "lucide-react";
import type { RagSource } from "@/types/api";
import { Badge } from "@/components/ui/ui";

// Renders the "Evidence" block: grounded RAG sources with rule IDs / sections
// and relevance scores. Directly supports the project's grounding requirement
// ("always cite which rule IDs / document sections you used").
export function EvidencePanel({ sources }: { sources: RagSource[] }) {
  if (!sources || sources.length === 0) return null;
  return (
    <div className="mt-3 rounded-lg border border-line bg-bg/40 p-3">
      <div className="mb-2 flex items-center gap-2">
        <FileText size={14} className="text-accent" />
        <span className="font-mono text-[11px] uppercase tracking-wider text-accent">
          Evidence · {sources.length} kaynak
        </span>
      </div>
      <ol className="space-y-1.5">
        {sources.map((s, i) => (
          <SourceRow key={s.id || i} index={i + 1} source={s} />
        ))}
      </ol>
    </div>
  );
}

function SourceRow({ index, source }: { index: number; source: RagSource }) {
  const [open, setOpen] = useState(false);
  const pct = Math.round((source.score ?? 0) * 100);
  const tone = pct >= 75 ? "accent" : pct >= 50 ? "info" : "muted";

  return (
    <li className="rounded-md border border-line bg-surface-2/60">
      <button
        onClick={() => source.text && setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left"
      >
        <span className="font-mono text-[11px] text-faint">[{index}]</span>
        <span className="flex-1 truncate font-mono text-xs text-ink">
          {source.source}
          {source.section && source.section !== "N/A" ? ` · §${source.section}` : ""}
        </span>
        <Badge tone={tone as "accent" | "info" | "muted"}>{pct}%</Badge>
        {source.text && (
          <ChevronDown size={14} className={`text-faint transition-transform ${open ? "rotate-180" : ""}`} />
        )}
      </button>
      {open && source.text && (
        <p className="border-t border-line px-2.5 py-2 font-mono text-[11.5px] leading-relaxed text-muted">
          {source.text}
        </p>
      )}
    </li>
  );
}
