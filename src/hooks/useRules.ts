import { useCallback, useEffect, useState } from "react";
import { listRules } from "@/lib/api";
import { ApiError } from "@/lib/http";
import type { CisRule, OsTarget, RuleListParams } from "@/types/api";

const PAGE_SIZE = 50;

export function useRules(os?: OsTarget) {
  const [rules, setRules] = useState<CisRule[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [filters, setFilters] = useState<RuleListParams>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const load = useCallback(
    async (nextOffset: number, nextFilters: RuleListParams, append: boolean) => {
      setLoading(true);
      setError(null);
      try {
        const res = await listRules({ ...nextFilters, os_target: os, limit: PAGE_SIZE, offset: nextOffset });
        setTotal(res.total);
        setOffset(res.offset);
        setRules((prev) => (append ? [...prev, ...res.rules] : res.rules));
      } catch (e) {
        setError(e instanceof ApiError ? e : new ApiError({ status: 0, code: "UNKNOWN", message: String(e) }));
        if (!append) setRules([]);
      } finally {
        setLoading(false);
      }
    },
    [os],
  );

  useEffect(() => {
    load(0, filters, false);
  }, [filters, load]);

  const applyFilters = useCallback((next: RuleListParams) => setFilters(next), []);
  const loadMore = useCallback(() => load(offset + PAGE_SIZE, filters, true), [load, offset, filters]);

  const hasMore = rules.length < total;
  return { rules, total, loading, error, filters, applyFilters, loadMore, hasMore };
}
