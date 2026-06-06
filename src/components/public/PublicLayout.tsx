import { type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export function PublicLayout({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow?: ReactNode;
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <main className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col px-5 py-10 sm:px-8 sm:py-14">
      <header className="flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-accent/40 bg-accent/10 text-accent">
            <ShieldCheck size={22} aria-hidden="true" />
          </div>
          <div className="leading-tight">
            <p className="font-mono text-sm font-semibold text-ink">OS&nbsp;HARDENING</p>
            <p className="font-mono text-[10px] uppercase tracking-widest text-faint">karar destek sistemi</p>
          </div>
        </Link>
        <Link to="/" className="btn">
          <ArrowLeft size={15} aria-hidden="true" /> Ana sayfa
        </Link>
      </header>

      <section className="flex-1 py-10">
        {eyebrow && (
          <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-accent">
            {eyebrow}
          </span>
        )}
        <h1 className="text-3xl font-semibold leading-tight text-ink sm:text-4xl">{title}</h1>
        {intro && <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">{intro}</p>}
        <div className="mt-8">{children}</div>
      </section>

      <footer className="mt-8 flex flex-col items-center gap-2 border-t border-line pt-5 text-center font-mono text-[11px] text-faint">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <Link to="/about" className="hover:text-accent">Hakkında</Link>
          <Link to="/sss" className="hover:text-accent">SSS</Link>
          <Link to="/gizlilik" className="hover:text-accent">Gizlilik (KVKK)</Link>
          <Link to="/kosullar" className="hover:text-accent">Şartlar</Link>
          <Link to="/contact" className="hover:text-accent">İletişim</Link>
        </div>
        <p>Marmara Üniversitesi · Bilgisayar Mühendisliği Bitirme Projesi</p>
      </footer>
    </main>
  );
}
