import { useEffect, useState } from "react";
import { listCategories } from "@/lib/api";
import type { OsTarget } from "@/types/api";

export function useCategories(os?: OsTarget): string[] {
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    listCategories(os)
      .then((cats) => { if (!cancelled) setCategories(cats); })
      .catch(() => { if (!cancelled) setCategories([]); });
    return () => { cancelled = true; };
  }, [os]);

  return categories;
}
