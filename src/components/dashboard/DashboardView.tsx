import { useEffect, useState } from "react";
import { Activity, Cpu, Gauge, Server, Timer } from "lucide-react";
import { apiRequest } from "@/lib/http";
import { useHealth } from "@/hooks/useHealth";
import { Card } from "@/components/ui/ui";

interface Metrics {
  requests: { total: number; successful: number; failed: number; error_rate: number };
  latency_ms: { avg: number; p50: number; p95: number; p99: number };
  tokens: { total: number; avg_per_request: number };
  llm_providers: Record<string, number>;
  llm_models: Record<string, number>;
}

export function DashboardView() {
  const { state, ragAvailable } = useHealth(15_000);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const tick = () =>
      apiRequest<Metrics>("/metrics", { timeoutMs: 8000 })
        .then((m) => active && (setMetrics(m), setErr(null)))
        .catch((e) => active && setErr(e.message));
    tick();
    const id = setInterval(tick, 15_000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  const stateLabel = { checking: "kontrol ediliyor", online: "çevrimiçi", offline: "çevrimdışı" }[state];
  const stateColor = { checking: "text-warn", online: "text-accent", offline: "text-danger" }[state];

  return (
    <div className="space-y-4 overflow-y-auto">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          icon={<Server size={16} />}
          label="API durumu"
          value={stateLabel}
          valueClass={stateColor}
          sub={ragAvailable ? "RAG aktif" : "RAG durumu bilinmiyor"}
        />
        <Stat
          icon={<Activity size={16} />}
          label="Toplam istek"
          value={metrics ? String(metrics.requests.total) : "—"}
          sub={metrics ? `hata oranı %${metrics.requests.error_rate}` : undefined}
        />
        <Stat
          icon={<Timer size={16} />}
          label="Ort. gecikme"
          value={metrics ? `${metrics.latency_ms.avg} ms` : "—"}
          sub={metrics ? `p95 ${metrics.latency_ms.p95} ms` : undefined}
        />
        <Stat
          icon={<Cpu size={16} />}
          label="Token / istek"
          value={metrics ? String(metrics.tokens.avg_per_request) : "—"}
          sub={metrics ? `toplam ${metrics.tokens.total}` : undefined}
        />
      </div>

      {err && (
        <Card className="p-4 text-sm text-faint">
          Metrikler alınamadı ({err}). Backend çalışmıyorsa bu panel boş kalır.
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <h3 className="label mb-3 flex items-center gap-2">
            <Gauge size={14} /> Gecikme dağılımı
          </h3>
          {metrics ? (
            <div className="space-y-2">
              {(["p50", "p95", "p99"] as const).map((k) => {
                const v = metrics.latency_ms[k];
                const max = metrics.latency_ms.p99 || 1;
                return (
                  <div key={k} className="flex items-center gap-3">
                    <span className="w-10 font-mono text-xs text-faint">{k}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
                      <div className="h-full rounded-full bg-accent/70" style={{ width: `${(v / max) * 100}%` }} />
                    </div>
                    <span className="w-16 text-right font-mono text-xs text-muted">{v} ms</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-faint">Veri yok.</p>
          )}
        </Card>

        <Card className="p-4">
          <h3 className="label mb-3">LLM sağlayıcı dağılımı</h3>
          {metrics && Object.keys(metrics.llm_providers).length ? (
            <ul className="space-y-2">
              {Object.entries(metrics.llm_providers).map(([name, count]) => (
                <li key={name} className="flex items-center justify-between text-sm">
                  <span className="font-mono text-muted">{name}</span>
                  <span className="font-mono text-accent">{count}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-faint">Henüz istek kaydı yok.</p>
          )}
        </Card>
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  sub,
  valueClass = "text-ink",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  valueClass?: string;
}) {
  return (
    <Card className="p-4">
      <div className="mb-2 flex items-center gap-2 text-faint">
        {icon}
        <span className="label">{label}</span>
      </div>
      <p className={`font-mono text-2xl ${valueClass}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-faint">{sub}</p>}
    </Card>
  );
}
