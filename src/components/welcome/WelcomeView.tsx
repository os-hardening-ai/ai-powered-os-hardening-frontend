import { Link } from "react-router-dom";
import {
  Bot,
  CheckCircle2,
  Clock,
  Database,
  FileCode2,
  LogIn,
  Mail,
  Network,
  ScrollText,
  Search,
  ShieldCheck,
  Sparkles,
  UserPlus,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const FEATURES: { icon: typeof Database; title: string; desc: string }[] = [
  {
    icon: Database,
    title: "RAG tabanlı erişim",
    desc: "CIS Benchmark kuralları ve NIST/ISO dokümanları Qdrant vektör DB üzerinden anlamsal olarak getirilir.",
  },
  {
    icon: Bot,
    title: "Hedef-bazlı sıkılaştırma",
    desc: "Doğal dil hedefini ('SSH'i sıkılaştır') sıralı kural planına ve çalıştırılabilir script'e dönüştüren ajan.",
  },
  {
    icon: FileCode2,
    title: "Çoklu artifact formatı",
    desc: "Bash, PowerShell, Ansible, Registry ve GPO çıktıları — Ubuntu ve Windows hedefleri için.",
  },
  {
    icon: Network,
    title: "Zero-Trust zenginleştirme",
    desc: "Her öneri NIST SP 800-207 ilkeleri ve ZT olgunluk seviyesiyle ilişkilendirilir.",
  },
  {
    icon: ShieldCheck,
    title: "JWT + RBAC + Denetim",
    desc: "Rol-bazlı erişim (sysadmin / security / developer / end_user) ve tam denetim kaydı.",
  },
  {
    icon: Sparkles,
    title: "Ücretsiz-öncelikli LLM",
    desc: "Cerebras → SambaNova → Gemini zinciri; groundedness doğrulamasıyla dayanaklı yanıtlar.",
  },
];

const STANDARDS = ["CIS Benchmarks", "NIST SP 800-207", "ISO/IEC 27001"];

const STATS: { value: string; label: string }[] = [
  { value: "%93,48", label: "Niyet doğruluğu" },
  { value: "791", label: "Otomatik test" },
  { value: "4 katman", label: "Güvenlik pipeline" },
  { value: "828", label: "CIS kuralı (Ubuntu+Win)" },
  { value: "≈ $0", label: "Çalışma maliyeti" },
  { value: "5", label: "İzleme panosu" },
];

const STEPS: { icon: typeof Search; title: string; desc: string }[] = [
  { icon: Search, title: "1 · Sor", desc: "Doğal dilde hedefini yaz: 'Ubuntu 24.04 SSH'i sıkılaştır'." },
  { icon: ShieldCheck, title: "2 · Süz", desc: "Güvenlik (L1) + niyet (L2) katmanları sorguyu sınıflandırır." },
  { icon: Database, title: "3 · Getir", desc: "CIS / NIST kaynakları RAG ile anlamsal olarak getirilir." },
  { icon: FileCode2, title: "4 · Üret", desc: "Script + gerekçe + kaynak; groundedness ile doğrulanır." },
];

const DONE: string[] = [
  "4 katmanlı güvenli pipeline (Safety → Intent → Routing → Validation)",
  "Enhanced RAG: hibrit getirme + groundedness doğrulama",
  "Agentic sıkılaştırma: planla → üret → kendi-kendine doğrula",
  "JWT + RBAC + denetim kaydı + hız limiti",
  "OpenAI-uyumlu API + partner (M2M) entegrasyonu",
  "Prometheus / Grafana / Jaeger izleme + e-posta alarm",
  "CI/CD + güvenlik taraması (pip-audit / Trivy / gitleaks)",
];

const INPROGRESS: string[] = [
  "Çok-dilli arayüz (TR / EN)",
  "PWA — kurulabilir masaüstü/mobil uygulama",
  "Cross-encoder reranker (RAG kalitesini artırır)",
  "Sandbox'ta üretilen script'in çalıştırılarak doğrulanması",
  "Kullanıcı geri bildirim döngüsü (👍 / 👎)",
];

export function WelcomeView() {
  const { status } = useAuth();
  const authed = status === "authenticated";

  return (
    <main className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col px-5 py-10 sm:px-8 sm:py-16">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-accent/40 bg-accent/10 text-accent">
            <ShieldCheck size={22} aria-hidden="true" />
          </div>
          <div className="leading-tight">
            <p className="font-mono text-sm font-semibold text-ink">OS&nbsp;HARDENING</p>
            <p className="font-mono text-[10px] uppercase tracking-widest text-faint">karar destek sistemi</p>
          </div>
        </div>
        <nav className="flex items-center gap-2" aria-label="Hesap">
          <Link to="/contact" className="btn hidden sm:inline-flex">
            <Mail size={15} aria-hidden="true" /> İletişim
          </Link>
          {authed ? (
            <Link to="/chat" className="btn btn-accent">
              Konsola git
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn">
                <LogIn size={15} aria-hidden="true" /> Giriş
              </Link>
              <Link to="/register" className="btn btn-accent">
                <UserPlus size={15} aria-hidden="true" /> Kayıt ol
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* Hero */}
      <section className="flex flex-col justify-center py-12 sm:py-16">
        <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-accent">
          <Sparkles size={13} aria-hidden="true" /> RAG + Zero-Trust
        </span>
        <h1 className="max-w-3xl text-3xl font-semibold leading-tight text-ink sm:text-5xl">
          İşletim sistemi sıkılaştırması için{" "}
          <span className="text-accent">yapay zekâ tabanlı karar desteği</span>
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          CIS Benchmark, NIST SP 800-207 ve ISO 27001 kaynaklarından beslenen bir RAG sistemi;
          doğal dil sorularını dayanaklı sıkılaştırma önerilerine ve çalıştırılabilir
          script'lere dönüştürür.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          {authed ? (
            <Link to="/chat" className="btn btn-accent px-5 py-2.5 text-[15px]">
              Konsola git
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-accent px-5 py-2.5 text-[15px]">
                <UserPlus size={16} aria-hidden="true" /> Ücretsiz hesap oluştur
              </Link>
              <Link to="/login" className="btn px-5 py-2.5 text-[15px]">
                <LogIn size={16} aria-hidden="true" /> Giriş yap
              </Link>
            </>
          )}
        </div>

        {/* Standards */}
        <ul className="mt-10 flex flex-wrap items-center gap-x-3 gap-y-2" aria-label="Desteklenen standartlar">
          <li className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-faint">
            <ScrollText size={13} aria-hidden="true" /> Kaynaklar:
          </li>
          {STANDARDS.map((s) => (
            <li key={s} className="chip">
              {s}
            </li>
          ))}
        </ul>
      </section>

      {/* Stats band */}
      <section
        aria-label="Özet metrikler"
        className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3 lg:grid-cols-6"
      >
        {STATS.map((s) => (
          <div key={s.label} className="bg-surface px-4 py-5 text-center">
            <p className="text-xl font-semibold text-accent sm:text-2xl">{s.value}</p>
            <p className="mt-1 text-[11px] leading-tight text-faint">{s.label}</p>
          </div>
        ))}
      </section>

      {/* Features */}
      <section aria-label="Özellikler" className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <article key={title} className="panel p-5">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg border border-accent/30 bg-accent/10 text-accent">
              <Icon size={18} aria-hidden="true" />
            </div>
            <h2 className="mb-1.5 text-sm font-semibold text-ink">{title}</h2>
            <p className="text-[13px] leading-relaxed text-muted">{desc}</p>
          </article>
        ))}
      </section>

      {/* How it works */}
      <section aria-label="Nasıl çalışır" className="mt-14">
        <h2 className="mb-1 text-center text-xs font-mono uppercase tracking-widest text-faint">Nasıl çalışır</h2>
        <p className="mb-6 text-center text-lg font-semibold text-ink">Sorudan çalıştırılabilir script'e</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ icon: Icon, title, desc }) => (
            <article key={title} className="panel flex flex-col gap-2 p-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-accent/30 bg-accent/10 text-accent">
                <Icon size={18} aria-hidden="true" />
              </div>
              <h3 className="font-mono text-sm font-semibold text-ink">{title}</h3>
              <p className="text-[13px] leading-relaxed text-muted">{desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Status / Roadmap */}
      <section aria-label="Durum" className="mt-14 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <article className="panel p-6">
          <div className="mb-4 flex items-center gap-2">
            <CheckCircle2 size={18} className="text-accent" aria-hidden="true" />
            <h2 className="text-sm font-semibold text-ink">Tamamlandı</h2>
            <span className="chip ml-auto">{DONE.length} özellik</span>
          </div>
          <ul className="flex flex-col gap-2.5">
            {DONE.map((item) => (
              <li key={item} className="flex items-start gap-2 text-[13px] leading-relaxed text-muted">
                <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="panel p-6">
          <div className="mb-4 flex items-center gap-2">
            <Clock size={18} className="text-info" aria-hidden="true" />
            <h2 className="text-sm font-semibold text-ink">Yapım aşamasında</h2>
            <span className="chip ml-auto">{INPROGRESS.length} madde</span>
          </div>
          <ul className="flex flex-col gap-2.5">
            {INPROGRESS.map((item) => (
              <li key={item} className="flex items-start gap-2 text-[13px] leading-relaxed text-muted">
                <Clock size={15} className="mt-0.5 shrink-0 text-info" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>

      {/* Contact CTA */}
      <section className="mt-14 flex flex-col items-center gap-4 rounded-xl border border-accent/30 bg-accent/5 px-6 py-10 text-center">
        <Mail size={28} className="text-accent" aria-hidden="true" />
        <h2 className="text-xl font-semibold text-ink">Öneriniz veya görüşünüz mü var?</h2>
        <p className="max-w-md text-sm text-muted">
          Geri bildirimleriniz sistemi geliştirmemize doğrudan katkı sağlıyor. Formu doldurun,
          mesajınız ekibimize ulaşsın.
        </p>
        <Link to="/contact" className="btn btn-accent px-5 py-2.5 text-[15px]">
          <Mail size={16} aria-hidden="true" /> İletişime geç
        </Link>
      </section>

      <footer className="mt-12 flex flex-col items-center gap-2 border-t border-line pt-5 text-center font-mono text-[11px] text-faint">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <Link to="/contact" className="hover:text-accent">İletişim</Link>
          <Link to="/login" className="hover:text-accent">Giriş</Link>
          <Link to="/register" className="hover:text-accent">Kayıt ol</Link>
        </div>
        <p>Marmara Üniversitesi · Bilgisayar Mühendisliği Bitirme Projesi · Sıkılaştırma &amp; Zero-Trust RAG</p>
      </footer>
    </main>
  );
}
