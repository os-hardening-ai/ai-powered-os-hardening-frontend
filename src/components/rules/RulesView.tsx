import { useMemo, useState } from "react";
import { ChevronDown, ListChecks, Loader2 } from "lucide-react";
import { useRules } from "@/hooks/useRules";
import { useCategories } from "@/hooks/useCategories";
import { ruleMatchesSearch } from "@/lib/format";
import { OS_OPTIONS } from "@/config";
import { RuleFilters } from "./RuleFilters";
import { RuleRow } from "./RuleRow";
import { ArtifactBuilder } from "@/components/artifacts/ArtifactBuilder";
import { Badge, EmptyState, ErrorBanner, Select } from "@/components/ui/ui";
import type { OsTarget } from "@/types/api";

type OsFamily = "linux" | "windows";

const FAMILY_TABS: { value: OsFamily; label: string }[] = [
  { value: "linux", label: "Linux" },
  { value: "windows", label: "Windows" },
];

export function RulesView() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [family, setFamily] = useState<OsFamily>("linux");
  const [collapsedCats, setCollapsedCats] = useState<Set<string>>(new Set());
  const [os, setOs] = useState<OsTarget>(OS_OPTIONS.find((o) => o.family === "linux")!.value);

  const familyOsOptions = useMemo(
    () => OS_OPTIONS.filter((o) => o.family === family).map((o) => ({ value: o.value, label: o.label })),
    [family],
  );

  const { rules, total, loading, error, filters, applyFilters, loadMore, hasMore } = useRules(os);

  const handleFamilyChange = (f: OsFamily) => {
    setFamily(f);
    const first = OS_OPTIONS.find((o) => o.family === f);
    if (first) setOs(first.value);
    setCollapsedCats(new Set());
    applyFilters({});
    setSearch("");
  };

  const handleOsChange = (next: OsTarget) => {
    setOs(next);
    applyFilters({});
    setSearch("");
    setCollapsedCats(new Set());
  };

  const categories = useCategories(os);

  const visible = useMemo(() => rules.filter((r) => ruleMatchesSearch(r, search)), [rules, search]);
  const selectedIds = useMemo(() => [...selected], [selected]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof visible>();
    for (const r of visible) {
      const key = r.category ?? "Diğer";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }
    return [...map.entries()].map(([cat, items]) => ({ cat, items }));
  }, [visible]);

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleCat = (cat: string) =>
    setCollapsedCats((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });

  const selectAllVisible = () => setSelected((prev) => new Set([...prev, ...visible.map((r) => r.id)]));

  return (
    <div className="grid h-full grid-cols-1 gap-4 xl:grid-cols-[1fr_480px]">
      <section className="panel flex min-h-0 flex-col overflow-hidden">
        <header className="space-y-3 border-b border-line px-4 py-3">
          {/* OS family tabs */}
          <div className="flex items-center gap-1 rounded-lg border border-line bg-bg/40 p-1 w-fit">
            {FAMILY_TABS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => handleFamilyChange(value)}
                className={`rounded-md px-4 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors ${
                  family === value
                    ? "bg-accent/15 text-accent border border-accent/30"
                    : "text-muted hover:text-ink"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ListChecks size={18} className="text-accent" />
              <h2 className="font-mono text-sm uppercase tracking-wider text-ink">CIS Kural Kütüphanesi</h2>
            </div>
            <div className="flex items-center gap-3">
              <Badge>{total} kural</Badge>
              <Select<OsTarget>
                value={os}
                onChange={handleOsChange}
                options={familyOsOptions}
              />
            </div>
          </div>

          <RuleFilters search={search} onSearch={setSearch} filters={filters} onFilters={applyFilters} categories={categories} />

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
            <div className="space-y-3">
              {grouped.map(({ cat, items }) => {
                const collapsed = collapsedCats.has(cat);
                return (
                  <div key={cat} className="rounded-lg border border-line overflow-hidden">
                    <button
                      onClick={() => toggleCat(cat)}
                      className="flex w-full items-center justify-between gap-3 bg-surface-2/60 px-3 py-2 text-left hover:bg-surface-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono text-xs font-semibold uppercase tracking-wider text-accent truncate">
                          {cat}
                        </span>
                        <Badge>{items.length}</Badge>
                      </div>
                      <ChevronDown
                        size={15}
                        className={`shrink-0 text-faint transition-transform ${collapsed ? "-rotate-90" : ""}`}
                      />
                    </button>

                    {!collapsed && (
                      <ul className="divide-y divide-line/50 px-2 py-2 space-y-1.5">
                        {items.map((r) => (
                          <RuleRow key={r.id} rule={r} selected={selected.has(r.id)} onToggle={toggle} />
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}

              {hasMore && !search && (
                <button onClick={loadMore} disabled={loading} className="btn mt-3 w-full">
                  {loading ? <Loader2 size={15} className="animate-spin" /> : null}
                  Daha fazla yükle ({rules.length}/{total})
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      <aside className="panel flex min-h-0 flex-col overflow-hidden">
        <ArtifactBuilder selectedIds={selectedIds} os={os} onClear={() => setSelected(new Set())} />
      </aside>
    </div>
  );
}
