import { useEffect, useState, type ReactNode } from "react";
import { Activity, Cpu, Gauge, Server, Timer } from "lucide-react";
import { apiRequest } from "@/lib/http";
import { useHealth } from "@/hooks/useHealth";
import { Card } from "@/components/ui/ui";

interface EndpointLatency {
  count: number;
  avg_ms: number;
  p95_ms: number;
  max_ms: number;
}

interface Metrics {
  requests: { total: number; successful: number; failed: number; error_rate: number };
  latency_ms: { avg: number; p50: number; p95: number; p99: number };
  tokens: { total: number; avg_per_request: number };
  llm_providers: Record<string, number>;
  llm_models: Record<string, number>;
  // PR #44: lane başına başarısızlık + ortalama gecikme + endpoint-grubu gecikme
  llm_lane_failures?: Record<string, number>;
  llm_lane_latency_ms?: Record<string, number>;
  latency_by_endpoint?: Record<string, EndpointLatency>;
}

export function DashboardView() {
  const { state, ragAvailable, dependencies } = useHealth(15_000);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const tick = () =>
      // noLogoutOn401: bu arka-plan metrik poll'ü 401 alsa bile kullanıcıyı login'e ATMASIN
      // (Pano'da "şifre penceresi" açılmasını önler) — sadece banner'da hata gösterilir.
      apiRequest<Metrics>("/metrics", { timeoutMs: 8000, noLogoutOn401: true })
        .then((m) => active && (setMetrics(m), setErr(null)))
        .catch((e) => active && setErr(e.message));
    tick();
    const id = setInterval(tick, 15_000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  const stateLabel: Record<string, string> = { checking: "kontrol ediliyor", online: "çevrimiçi", degraded: "kısıtlı", offline: "çevrimdışı" };
  const stateColor: Record<string, string> = { checking: "text-warn", online: "text-accent", degraded: "text-warn", offline: "text-danger" };

  // Servis durumu: /health/detailed → dependencies (qdrant/llm/redis). Renk + Türkçe etiket.
  const svcMeta: Record<string, { dot: string; label: string }> = {
    ok: { dot: "bg-accent", label: "çalışıyor" },
    disabled: { dot: "bg-faint", label: "devre dışı" },
    degraded: { dot: "bg-warn", label: "kısıtlı" },
    checking: { dot: "bg-warn animate-pulse", label: "kontrol ediliyor" },
  };
  const svc = (s?: string) => svcMeta[s ?? ""] ?? { dot: "bg-danger", label: s || "bilinmiyor" };
  const SERVICES: { key: string; label: string }[] = [
    { key: "qdrant", label: "Qdrant (vektör DB)" },
    { key: "llm", label: "LLM sağlayıcı" },
    { key: "redis", label: "Redis (cache/oturum)" },
  ];

  // Lane sağlık: başarılı (llm_providers) + hata (llm_lane_failures) anahtarlarının birleşimi.
  // Fail eden lane success=0 olsa bile listede görünür → "istek gitmedi mi?" yanılgısını önler.
  const lanes = metrics
    ? Array.from(
        new Set([
          ...Object.keys(metrics.llm_providers ?? {}),
          ...Object.keys(metrics.llm_lane_failures ?? {}),
        ]),
      ).sort()
    : [];

  return (
    <div className="h-full space-y-4 overflow-y-auto">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          icon={<Server size={16} />}
          label="API durumu"
          value={stateLabel[state]}
          valueClass={stateColor[state]}
          sub={state === "checking" ? "RAG kontrol ediliyor" : ragAvailable ? "RAG aktif" : "RAG çevrimdışı"}
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

      {/* Servis Durumu — qdrant / llm / redis (her zaman görünür, renkli) */}
      <Card className="p-4">
        <h3 className="label mb-3 flex items-center gap-2">
          <Server size={14} /> Servis Durumu
        </h3>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {SERVICES.map(({ key, label }) => {
            const st = dependencies[key] ?? (state === "checking" ? "checking" : "unknown");
            const m = svc(st);
            return (
              <div
                key={key}
                className="flex items-center gap-2.5 rounded-lg border border-line bg-bg/40 px-3 py-2"
              >
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${m.dot}`} />
                <div className="min-w-0 leading-tight">
                  <p className="truncate font-mono text-xs text-ink">{label}</p>
                  <p className="font-mono text-[10px] text-faint">{m.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

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
          <h3 className="label mb-1">LLM Lane Sağlık</h3>
          <p className="mb-2 text-[10px] text-faint">
            <span className="text-accent">✓ başarılı</span> ·{" "}
            <span className="text-danger">✗ hata</span> (istek gitti, lane fail → fallback kurtardı) · ort. gecikme
          </p>
          {metrics && lanes.length ? (
            <ul className="space-y-1.5">
              {lanes.map((name) => {
                const ok = metrics.llm_providers?.[name] ?? 0;
                const fail = metrics.llm_lane_failures?.[name] ?? 0;
                const lat = metrics.llm_lane_latency_ms?.[name];
                return (
                  <li key={name} className="flex items-center justify-between gap-2 text-xs">
                    <span className="min-w-0 flex-1 truncate font-mono text-muted" title={name}>
                      {name}
                    </span>
                    <span className="flex shrink-0 items-center gap-2.5 font-mono">
                      <span className="text-accent">✓{ok}</span>
                      <span className={fail > 0 ? "font-semibold text-danger" : "text-faint"}>✗{fail}</span>
                      <span className="w-12 text-right text-faint">
                        {lat ? `${(lat / 1000).toFixed(1)}s` : "—"}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-faint">Henüz istek kaydı yok.</p>
          )}

          {metrics?.latency_by_endpoint && Object.keys(metrics.latency_by_endpoint).length > 0 && (
            <div className="mt-3 border-t border-line pt-2">
              <p className="label mb-1 text-[10px]">Endpoint gecikme (chat / agent / …)</p>
              {Object.entries(metrics.latency_by_endpoint).map(([ep, s]) => (
                <div key={ep} className="flex items-center justify-between font-mono text-[11px]">
                  <span className="text-muted">{ep}</span>
                  <span className="text-faint">
                    {(s.avg_ms / 1000).toFixed(1)}s · p95 {(s.p95_ms / 1000).toFixed(1)}s · {s.count}×
                  </span>
                </div>
              ))}
            </div>
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
  icon: ReactNode;
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
