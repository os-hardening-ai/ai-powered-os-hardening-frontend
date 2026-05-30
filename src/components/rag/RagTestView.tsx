import { useState } from "react";
import { Database, Search } from "lucide-react";
import { ragSearch } from "@/lib/api";
import type { RagSource } from "@/types/api";
import { Badge, Card, EmptyState, Spinner } from "@/components/ui/ui";

export function RagTestView() {
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
          <Database size={16} className="text-accent" />
          <h2 className="font-mono text-sm uppercase tracking-wider text-ink">RAG Vektör Arama Testi</h2>
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

          <div className="flex items-center gap-1.5">
            <span className="label whitespace-nowrap">top_k</span>
            <input
              type="number"
              min={1}
              max={20}
              value={topK}
              onChange={(e) => setTopK(Math.max(1, Math.min(20, Number(e.target.value))))}
              className="field w-16 text-center font-mono"
            />
          </div>

          <button
            onClick={search}
            disabled={loading || !query.trim()}
            className="btn-primary flex items-center gap-2 px-4 disabled:opacity-40"
          >
            {loading ? <Spinner /> : <Search size={15} />}
            Ara
          </button>
        </div>

        {error && (
          <p className="mt-2 text-sm text-danger">{error}</p>
        )}
      </Card>

      {results === null && !loading && (
        <EmptyState
          icon={<Database size={28} />}
          title="RAG chunk testi"
          hint="Bir sorgu gir. Qdrant vektör veritabanından en ilgili CIS kural chunk'ları döner, benzerlik skoru ve tam metin ile birlikte."
        />
      )}

      {results !== null && (
        <div className="space-y-2">
          <p className="font-mono text-xs text-faint px-1">
            {results.length} chunk döndü — sorgu: <span className="text-ink">"{lastQuery}"</span>
          </p>

          {results.length === 0 && (
            <Card className="p-6 text-center text-sm text-faint">
              Sonuç bulunamadı. Farklı bir sorgu dene.
            </Card>
          )}

          {results.map((chunk, i) => (
            <ChunkCard key={chunk.id || i} index={i + 1} chunk={chunk} />
          ))}
        </div>
      )}
    </div>
  );
}

function ChunkCard({ index, chunk }: { index: number; chunk: RagSource }) {
  const pct = Math.round((chunk.score ?? 0) * 100);
  const tone: "accent" | "info" | "warn" | "muted" =
    pct >= 75 ? "accent" : pct >= 55 ? "info" : pct >= 35 ? "warn" : "muted";

  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className="font-mono text-xs text-faint">[{index}]</span>
        <span className="font-mono text-sm font-semibold text-ink">{chunk.id}</span>
        {chunk.section && chunk.section !== "N/A" && (
          <Badge>§{chunk.section}</Badge>
        )}
        {chunk.source && (
          <span className="font-mono text-xs text-muted truncate max-w-[200px]">{chunk.source}</span>
        )}
        <div className="ml-auto flex items-center gap-2">
          <div className="h-2 w-28 overflow-hidden rounded-full bg-surface-2">
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

      {chunk.text ? (
        <p className="font-mono text-[12px] leading-relaxed text-muted whitespace-pre-wrap border-t border-line pt-2 mt-1">
          {chunk.text}
        </p>
      ) : (
        <p className="text-xs text-faint italic">chunk metni yok</p>
      )}
    </Card>
  );
}
