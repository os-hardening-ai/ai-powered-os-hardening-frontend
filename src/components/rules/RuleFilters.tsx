import { Search, X } from "lucide-react";
import type { RuleListParams } from "@/types/api";

const CATEGORIES = [
  "Initial Setup and Filesystem Configuration",
  "Software and Service Configuration",
  "Network Configuration",
  "Logging and Auditing",
  "Access Authentication and Authorization",
  "System Maintenance",
  "Security Patching and Updates",
];

export function RuleFilters({
  search,
  onSearch,
  filters,
  onFilters,
}: {
  search: string;
  onSearch: (v: string) => void;
  filters: RuleListParams;
  onFilters: (f: RuleListParams) => void;
}) {
  const setLevel = (lvl?: 1 | 2) => onFilters({ ...filters, level: filters.level === lvl ? undefined : lvl });
  const setAuto = (v?: boolean) =>
    onFilters({ ...filters, auto_remediate: filters.auto_remediate === v ? undefined : v });

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Kural ara — id, başlık, tag…"
          className="field pl-9 pr-9"
        />
        {search && (
          <button onClick={() => onSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-faint hover:text-ink">
            <X size={15} />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="label">Level</span>
        {[1, 2].map((l) => (
          <button
            key={l}
            onClick={() => setLevel(l as 1 | 2)}
            className={`chip cursor-pointer ${filters.level === l ? "border-accent/60 text-accent" : ""}`}
          >
            L{l}
          </button>
        ))}
        <span className="ml-2 label">Remediation</span>
        <button
          onClick={() => setAuto(true)}
          className={`chip cursor-pointer ${filters.auto_remediate === true ? "border-accent/60 text-accent" : ""}`}
        >
          Auto
        </button>
        <button
          onClick={() => setAuto(false)}
          className={`chip cursor-pointer ${filters.auto_remediate === false ? "border-warn/60 text-warn" : ""}`}
        >
          Manual
        </button>
      </div>

      <select
        className="field appearance-none"
        value={filters.category ?? ""}
        onChange={(e) => onFilters({ ...filters, category: e.target.value || undefined })}
      >
        <option value="">Tüm kategoriler</option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    </div>
  );
}
