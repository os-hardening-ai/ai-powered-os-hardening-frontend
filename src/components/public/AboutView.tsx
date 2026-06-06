import { GraduationCap, Info, Layers, Linkedin, Mail, Target, Users } from "lucide-react";
import { PublicLayout } from "@/components/public/PublicLayout";

const LAYERS: { n: string; t: string; d: string }[] = [
  { n: "L1", t: "Safety", d: "Güvenlik sınıflandırma — prompt-injection / jailbreak / kapsam-dışı filtresi (fail-closed)." },
  { n: "L2", t: "Intent", d: "Niyet tespiti — TF-IDF + LogReg (%93,48), pattern fallback." },
  { n: "L3", t: "Routing", d: "3A pattern · 3B RAG bilgi · 3C aksiyon (script üretimi)." },
  { n: "L4", t: "Validation", d: "Üretim + groundedness doğrulama (ClaimVerifier)." },
];

// NOT: Aşağıdaki ad / LinkedIn / e-posta alanlarını kendi bilgilerinizle doldurun.
const TEAM: { name: string; role: string; linkedin: string; email: string }[] = [
  {
    name: "Engin [Soyad]",
    role: "Enhanced RAG & Embeddings (İP-2–4) · Gözlemlenebilirlik (İP-11)",
    linkedin: "https://www.linkedin.com/in/kullanici-adi",
    email: "engin@ornek.com",
  },
  {
    name: "Mert Baytaş",
    role: "LLM / Agentic pipeline · Güvenlik · Değerlendirme (İP-5–8)",
    linkedin: "https://www.linkedin.com/in/kullanici-adi",
    email: "mertbaytas@gmail.com",
  },
  {
    name: "Tankut [Soyad]",
    role: "Frontend & API yüzeyi (İP-9–10)",
    linkedin: "https://www.linkedin.com/in/kullanici-adi",
    email: "tankut@ornek.com",
  },
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
      intro="CIS Benchmark, NIST SP 800-207 ve ISO 27001 kaynaklarından beslenen, işletim sistemi sıkılaştırması için RAG + LLM tabanlı bir karar destek sistemi."
    >
      {/* Bitirme projesi rozeti */}
      <div className="panel flex items-start gap-3 p-4">
        <GraduationCap size={20} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
        <p className="text-[13px] leading-relaxed text-muted">
          Bu sistem, <strong className="text-ink">Marmara Üniversitesi Bilgisayar Mühendisliği</strong>{" "}
          bölümü <strong className="text-ink">bitirme projesi</strong> kapsamında, 4. sınıf öğrencileri
          tarafından geliştirilmiştir.
        </p>
      </div>

      {/* Amaç */}
      <h2 className="mb-2 mt-10 flex items-center gap-2 text-sm font-semibold text-ink">
        <Target size={16} className="text-accent" aria-hidden="true" /> Amaç
      </h2>
      <p className="text-[13px] leading-relaxed text-muted">
        Güvenlik uzmanlarının işletim sistemi sıkılaştırma kararlarını; doğal dil sorularını
        <strong className="text-ink"> kaynağa-dayalı (groundedness)</strong>, denetlenebilir önerilere
        ve <strong className="text-ink">çalıştırılabilir hardening script'lerine</strong> dönüştürerek
        hızlandırmak ve hata payını azaltmaktır.
      </p>

      {/* Mimari */}
      <h2 className="mb-3 mt-10 flex items-center gap-2 text-sm font-semibold text-ink">
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
      <h2 className="mb-1 mt-10 flex items-center gap-2 text-sm font-semibold text-ink">
        <Users size={16} className="text-accent" aria-hidden="true" /> Ekip
      </h2>
      <p className="mb-3 text-[12px] text-faint">Marmara Üniversitesi · Bilgisayar Mühendisliği · 4. sınıf</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {TEAM.map((m) => (
          <div key={m.name} className="panel flex flex-col gap-2 p-4">
            <span className="text-sm font-semibold text-ink">{m.name}</span>
            <p className="flex-1 text-[12px] leading-relaxed text-muted">{m.role}</p>
            <div className="flex items-center gap-3 pt-1">
              <a
                href={m.linkedin}
                target="_blank"
                rel="noreferrer"
                className="text-faint transition-colors hover:text-accent"
                aria-label={`${m.name} LinkedIn`}
              >
                <Linkedin size={16} aria-hidden="true" />
              </a>
              <a
                href={`mailto:${m.email}`}
                className="text-faint transition-colors hover:text-accent"
                aria-label={`${m.name} e-posta`}
              >
                <Mail size={16} aria-hidden="true" />
              </a>
            </div>
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
