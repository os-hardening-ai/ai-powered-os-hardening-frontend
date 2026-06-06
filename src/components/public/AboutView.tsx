import { Info, Layers, Users } from "lucide-react";
import { PublicLayout } from "@/components/public/PublicLayout";

const LAYERS: { n: string; t: string; d: string }[] = [
  { n: "L1", t: "Safety", d: "Güvenlik sınıflandırma — prompt-injection / jailbreak / kapsam-dışı filtresi (fail-closed)." },
  { n: "L2", t: "Intent", d: "Niyet tespiti — TF-IDF + LogReg (%93,48), pattern fallback." },
  { n: "L3", t: "Routing", d: "3A pattern · 3B RAG bilgi · 3C aksiyon (script üretimi)." },
  { n: "L4", t: "Validation", d: "Üretim + groundedness doğrulama (ClaimVerifier)." },
];

const TEAM: { name: string; role: string }[] = [
  { name: "Engin", role: "Enhanced RAG & Embeddings (İP-2–4) · Gözlemlenebilirlik (İP-11)" },
  { name: "Mert", role: "LLM / Agentic pipeline · Güvenlik · Değerlendirme (İP-5–8)" },
  { name: "Tankut", role: "Frontend & API yüzeyi (İP-9–10)" },
];

const STACK = [
  "FastAPI", "React + TypeScript", "Qdrant", "Cerebras gpt-oss-120b",
  "Novita embeddings", "Redis", "Prometheus / Grafana / Jaeger", "Docker + Caddy",
];

export function AboutView() {
  return (
    <PublicLayout
      eyebrow={<><Info size={13} aria-hidden="true" /> Hakkında</>}
      title="Proje hakkında"
      intro="CIS Benchmark, NIST SP 800-207 ve ISO 27001 kaynaklarından beslenen, işletim sistemi sıkılaştırması için RAG + LLM tabanlı bir karar destek sistemi. Doğal dil sorularını dayanaklı önerilere ve çalıştırılabilir script'lere dönüştürür."
    >
      {/* Mimari */}
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
        <Layers size={16} className="text-accent" aria-hidden="true" /> 4 katmanlı güvenli pipeline
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {LAYERS.map((l) => (
          <div key={l.n} className="panel p-4">
            <div className="mb-1 flex items-center gap-2">
              <span className="chip">{l.n}</span>
              <span className="text-sm font-semibold text-ink">{l.t}</span>
            </div>
            <p className="text-[13px] leading-relaxed text-muted">{l.d}</p>
          </div>
        ))}
      </div>

      {/* Ekip */}
      <h2 className="mb-3 mt-10 flex items-center gap-2 text-sm font-semibold text-ink">
        <Users size={16} className="text-accent" aria-hidden="true" /> Ekip & iş paketleri (İP)
      </h2>
      <div className="flex flex-col gap-2">
        {TEAM.map((m) => (
          <div key={m.name} className="panel flex flex-col gap-0.5 p-4 sm:flex-row sm:items-center sm:gap-4">
            <span className="font-mono text-sm font-semibold text-accent sm:w-20">{m.name}</span>
            <span className="text-[13px] leading-relaxed text-muted">{m.role}</span>
          </div>
        ))}
      </div>

      {/* Teknoloji */}
      <h2 className="mb-3 mt-10 text-sm font-semibold text-ink">Teknoloji yığını</h2>
      <ul className="flex flex-wrap gap-2">
        {STACK.map((s) => (
          <li key={s} className="chip">{s}</li>
        ))}
      </ul>
    </PublicLayout>
  );
}
