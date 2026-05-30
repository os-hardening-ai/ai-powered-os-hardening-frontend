import { useState } from "react";
import { ChevronDown, FileText, Search } from "lucide-react";
import { ragSearch } from "@/lib/api";
import type { RagSource } from "@/types/api";
import { Badge, Card, EmptyState, Spinner } from "@/components/ui/ui";

type SourceKind = "yaml" | "pdf" | "other";

function detectSourceKind(source: string): SourceKind {
  const lower = source.toLowerCase();
  if (lower.endsWith(".yaml") || lower.endsWith(".yml")) return "yaml";
  if (lower.endsWith(".pdf")) return "pdf";
  return "other";
}

function sourceKindBadge(kind: SourceKind) {
  if (kind === "yaml") return <Badge tone="accent">YAML</Badge>;
  if (kind === "pdf") return <Badge tone="info">PDF</Badge>;
  return <Badge tone="muted">TXT</Badge>;
}

function ScoreDistribution({ results }: { results: RagSource[] }) {
  if (results.length === 0) return null;
  const scores = results.map((r) => r.score);
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;

  const buckets = 10;
  const hist = Array(buckets).fill(0) as number[];
  scores.forEach((s) => {
    const idx = Math.min(Math.floor(s * buckets), buckets - 1);
    hist[idx]++;
  });
  const histMax = Math.max(...hist, 1);

  return (
    <Card className="p-4">
      <h3 className="label mb-3 flex items-center gap-2">
        <FileText size={13} /> Skor Dağılımı
      </h3>
      <div className="flex items-end gap-0.5 h-10 mb-2">
        {hist.map((count, i) => (
          <div
            key={i}
            title={`${(i / buckets).toFixed(1)}–${((i + 1) / buckets).toFixed(1)}: ${count} chunk`}
            className="flex-1 rounded-sm bg-accent/60 transition-all"
            style={{ height: `${(count / histMax) * 100}%`, minHeight: count > 0 ? 2 : 0 }}
          />
        ))}
      </div>
      <div className="flex justify-between font-mono text-[10px] text-faint">
        <span>0.0</span>
        <span>0.5</span>
        <span>1.0</span>
      </div>
      <div className="mt-2 flex gap-4">
        {[
          { label: "min", value: min },
          { label: "ort", value: avg },
          { label: "max", value: max },
        ].map(({ label, value }) => (
          <div key={label} className="flex flex-col items-center">
            <span className="font-mono text-xs text-accent">{value.toFixed(3)}</span>
            <span className="font-mono text-[10px] uppercase text-faint">{label}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ChunkCard({ index, chunk }: { index: number; chunk: RagSource }) {
  const [expanded, setExpanded] = useState(false);
  const pct = Math.round((chunk.score ?? 0) * 100);
  const tone: "accent" | "info" | "warn" | "muted" =
    pct >= 75 ? "accent" : pct >= 55 ? "info" : pct >= 35 ? "warn" : "muted";
  const kind = detectSourceKind(chunk.source ?? "");

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 px-4 py-3">
        <span className="font-mono text-xs text-faint shrink-0">[{index}]</span>
        <span className="font-mono text-sm font-semibold text-ink">{chunk.id}</span>
        {chunk.section && chunk.section !== "N/A" && <Badge>§{chunk.section}</Badge>}
        {sourceKindBadge(kind)}
        {chunk.os_version && (
          <Badge tone="info">{chunk.os_version}</Badge>
        )}
        {chunk.source && (
          <span
            className="font-mono text-[11px] text-muted truncate max-w-[180px]"
            title={chunk.source}
          >
            {chunk.source.split("/").pop() ?? chunk.source}
          </span>
        )}
        <div className="ml-auto flex items-center gap-2 shrink-0">
          <div className="h-2 w-24 overflow-hidden rounded-full bg-surface-2">
            <div
              className={`h-full rounded-full transition-all ${
                tone === "accent" ? "bg-accent" : tone === "info" ? "bg-info" : tone === "warn" ? "bg-warn" : "bg-faint"
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <Badge tone={tone}>{pct}%</Badge>
        </div>
      </div>

      {chunk.text && (
        <div className="border-t border-line">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex w-full items-center justify-between px-4 py-1.5 text-left hover:bg-surface-2/40"
          >
            <span className="font-mono text-[11px] text-faint">
              {expanded ? "metni gizle" : `metni göster (${chunk.text.length} karakter)`}
            </span>
            <ChevronDown
              size={13}
              className={`text-faint transition-transform ${expanded ? "rotate-180" : ""}`}
            />
          </button>
          {expanded && (
            <pre className="px-4 pb-3 font-mono text-[11.5px] leading-relaxed text-muted whitespace-pre-wrap">
              {chunk.text}
            </pre>
          )}
        </div>
      )}
    </Card>
  );
}

export function RetrievalExplorer() {
  const [query, setQuery] = useState("");
  const [topK, setTopK] = useState(5);
  const [results, setResults] = useState<RagSource[] | null>(null);
  const [lastQuery, setLastQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async () => {
    const q = query.trim();
    if (!q || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await ragSearch({ query: q, top_k: topK });
      setResults(res.results);
      setLastQuery(res.query);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Arama başarısız");
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      search();
    }
  };

  return (
    <div className="h-full space-y-4 overflow-y-auto">
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Search size={16} className="text-accent" />
          <h2 className="font-mono text-sm uppercase tracking-wider text-ink">Retrieval Explorer</h2>
          <span className="font-mono text-[10px] uppercase tracking-wider text-faint ml-1">Qdrant vektör DB</span>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKey}
              placeholder="Sorgu gir — örn: SSH sertifika doğrulama, cramfs kernel modülü…"
              className="field pl-9"
            />
          </div>

          <label className="flex items-center gap-2 shrink-0">
            <span className="label whitespace-nowrap text-muted">
              top_k: <span className="text-accent">{topK}</span>
            </span>
            <input
              type="range"
              min={1}
              max={20}
              value={topK}
              onChange={(e) => setTopK(Number(e.target.value))}
              className="w-20 accent-accent"
            />
          </label>

          <button
            onClick={search}
            disabled={loading || !query.trim()}
            className="btn-primary flex items-center gap-2 px-4 disabled:opacity-40 shrink-0"
          >
            {loading ? <Spinner /> : <Search size={15} />}
            Ara
          </button>
        </div>

        {error && <p className="mt-2 text-sm text-danger">{error}</p>}
      </Card>

      {results === null && !loading && (
        <EmptyState
          icon={<Search size={28} />}
          title="Retrieval Explorer"
          hint="Bir sorgu gir. Qdrant'tan en ilgili CIS kural chunk'ları döner — skor dağılımı, kaynak türü (YAML / PDF) ve tam metin ile birlikte."
        />
      )}

      {results !== null && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <p className="font-mono text-xs text-faint">
              <span className="text-ink">{results.length}</span> chunk —{" "}
              <span className="text-ink">"{lastQuery}"</span>
            </p>
            <div className="flex gap-2 font-mono text-[10px] text-faint">
              {(["yaml", "pdf", "other"] as SourceKind[]).map((k) => {
                const n = results.filter((r) => detectSourceKind(r.source ?? "") === k).length;
                if (n === 0) return null;
                return (
                  <span key={k}>
                    {k.toUpperCase()} <span className="text-accent">{n}</span>
                  </span>
                );
              })}
            </div>
          </div>

          {results.length > 0 && <ScoreDistribution results={results} />}

          {results.length === 0 ? (
            <Card className="p-6 text-center text-sm text-faint">
              Sonuç bulunamadı. Farklı bir sorgu dene.
            </Card>
          ) : (
            results.map((chunk, i) => (
              <ChunkCard key={chunk.id || i} index={i + 1} chunk={chunk} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
