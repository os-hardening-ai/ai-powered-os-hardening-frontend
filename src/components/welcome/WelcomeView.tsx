import { Link } from "react-router-dom";
import {
  Bot,
  Database,
  FileCode2,
  LogIn,
  Network,
  ScrollText,
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
      <section className="flex flex-1 flex-col justify-center py-12 sm:py-20">
        <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-accent">
          <Sparkles size={13} aria-hidden="true" /> RAG + Zero-Trust
        </span>
        <h1 className="max-w-3xl text-3xl font-semibold leading-tight text-ink sm:text-5xl">
          İşletim sistemi sıkılaştırması için{" "}
          <span className="text-accent">yapay zeka destekli karar desteği</span>
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

      {/* Features */}
      <section aria-label="Özellikler" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

      <footer className="mt-12 border-t border-line pt-5 text-center font-mono text-[11px] text-faint">
        Marmara Üniversitesi · Bilgisayar Mühendisliği Bitirme Projesi · Sıkılaştırma &amp; Zero-Trust RAG
      </footer>
    </main>
  );
}
