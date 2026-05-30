import { useEffect, useState } from "react";
import { getHealth } from "@/lib/api";

export type HealthState = "checking" | "online" | "offline";

export function useHealth(intervalMs = 30_000): { state: HealthState; ragAvailable: boolean } {
  const [state, setState] = useState<HealthState>("checking");
  const [ragAvailable, setRagAvailable] = useState(false);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    async function check() {
      try {
        const h = await getHealth(controller.signal);
        if (!active) return;
        setState(h.status === "ok" || h.status === "healthy" ? "online" : "offline");
        setRagAvailable(h.components?.vector_store === "ok");
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

  return { state, ragAvailable };
}
