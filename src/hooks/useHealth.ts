import { useEffect, useState } from "react";
import { getHealth } from "@/lib/api";

export type HealthState = "checking" | "online" | "degraded" | "offline";

export function useHealth(intervalMs = 30_000): {
  state: HealthState;
  ragAvailable: boolean;
  dependencies: Record<string, string>;
} {
  const [state, setState] = useState<HealthState>("checking");
  const [ragAvailable, setRagAvailable] = useState(false);
  const [dependencies, setDependencies] = useState<Record<string, string>>({});

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    async function check() {
      try {
        const h = await getHealth(controller.signal);
        if (!active) return;
        if (h.status === "ok") setState("online");
        else if (h.status === "degraded") setState("degraded");
        else setState("offline");
        setRagAvailable(h.rag_available ?? h.components?.vector_store === "ok");
        setDependencies((h.dependencies as Record<string, string>) ?? {});
      } catch {
        if (active) setState("offline");
      }
    }

    check();
    const id = setInterval(check, intervalMs);
    return () => {
      active = false;
      controller.abort();
      clearInterval(id);
    };
  }, [intervalMs]);

  return { state, ragAvailable, dependencies };
}
