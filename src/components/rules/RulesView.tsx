import { useMemo, useState } from "react";
import { ListChecks, Loader2 } from "lucide-react";
import { useRules } from "@/hooks/useRules";
import { ruleMatchesSearch } from "@/lib/format";
import { OS_OPTIONS } from "@/config";
import { RuleFilters } from "./RuleFilters";
import { RuleRow } from "./RuleRow";
import { ArtifactBuilder } from "@/components/artifacts/ArtifactBuilder";
import { Badge, EmptyState, ErrorBanner, Select } from "@/components/ui/ui";
import type { OsTarget } from "@/types/api";

export function RulesView() {
  const { rules, total, loading, error, filters, applyFilters, loadMore, hasMore } = useRules();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [os, setOs] = useState<OsTarget>("ubuntu_24_04");

  const visible = useMemo(() => rules.filter((r) => ruleMatchesSearch(r, search)), [rules, search]);
  const selectedIds = useMemo(() => [...selected], [selected]);

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const selectAllVisible = () => setSelected((prev) => new Set([...prev, ...visible.map((r) => r.id)]));

  return (
    <div className="grid h-full grid-cols-1 gap-4 xl:grid-cols-[1fr_480px]">
      <section className="panel flex min-h-0 flex-col overflow-hidden">
        <header className="space-y-3 border-b border-line px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ListChecks size={18} className="text-accent" />
              <h2 className="font-mono text-sm uppercase tracking-wider text-ink">CIS Kural Kütüphanesi</h2>
            </div>
            <div className="flex items-center gap-3">
              <Badge>{total} kural</Badge>
              <Select<OsTarget>
                value={os}
                onChange={setOs}
                options={OS_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
              />
            </div>
          </div>
          <RuleFilters search={search} onSearch={setSearch} filters={filters} onFilters={applyFilters} />
          {visible.length > 0 && (
            <div className="flex items-center justify-between text-xs text-faint">
              <button onClick={selectAllVisible} className="hover:text-accent">
                Görünenleri seç ({visible.length})
              </button>
              {selected.size > 0 && (
                <button onClick={() => setSelected(new Set())} className="text-danger hover:underline">
                  Seçimi temizle ({selected.size})
                </button>
              )}
            </div>
          )}
        </header>

        <div className="relative z-10 flex-1 overflow-y-auto px-4 py-3">
          {error ? (
            <ErrorBanner message={error.message} requestId={error.requestId} />
          ) : loading && rules.length === 0 ? (
            <div className="flex justify-center py-16 text-faint">
              <Loader2 className="animate-spin" />
            </div>
          ) : visible.length === 0 ? (
            <EmptyState title="Kural bulunamadı" hint="Filtreleri gevşetmeyi veya arama terimini değiştirmeyi dene." />
          ) : (
            <>
              <ul className="space-y-2">
                {visible.map((r) => (
                  <RuleRow key={r.id} rule={r} selected={selected.has(r.id)} onToggle={toggle} />
                ))}
              </ul>
              {hasMore && !search && (
                <button onClick={loadMore} disabled={loading} className="btn mt-3 w-full">
                  {loading ? <Loader2 size={15} className="animate-spin" /> : null}
                  Daha fazla yükle ({rules.length}/{total})
                </button>
              )}
            </>
          )}
        </div>
      </section>

      <aside className="panel flex min-h-0 flex-col overflow-hidden">
        <ArtifactBuilder selectedIds={selectedIds} os={os} onClear={() => setSelected(new Set())} />
      </aside>
    </div>
  );
}
