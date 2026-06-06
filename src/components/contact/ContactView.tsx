import { type FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Mail, MessageSquare, Send, ShieldCheck } from "lucide-react";
import { apiRequest } from "@/lib/http";
import { ErrorBanner, Spinner } from "@/components/ui/ui";

const SUBJECTS: { value: string; label: string }[] = [
  { value: "oneri", label: "Öneri" },
  { value: "gorus", label: "Görüş / Geri bildirim" },
  { value: "hata", label: "Hata bildirimi" },
  { value: "isbirligi", label: "İş birliği" },
  { value: "diger", label: "Diğer" },
];

export function ContactView() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("oneri");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const emailValid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim());
  const validation =
    name.trim().length < 2
      ? "Lütfen adınızı girin."
      : !emailValid
        ? "Geçerli bir e-posta adresi girin."
        : message.trim().length < 10
          ? "Mesaj en az 10 karakter olmalı."
          : null;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (validation) {
      setError(validation);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await apiRequest("/api/contact", {
        method: "POST",
        body: { name: name.trim(), email: email.trim(), subject, message: message.trim() },
      });
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gönderilemedi. Lütfen tekrar deneyin.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col px-5 py-10 sm:px-8 sm:py-14">
      {/* Header */}
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

      <section className="flex flex-1 flex-col justify-center py-10">
        <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-accent">
          <MessageSquare size={13} aria-hidden="true" /> İletişim
        </span>
        <h1 className="text-3xl font-semibold leading-tight text-ink sm:text-4xl">
          Öneri ve görüşlerinizi <span className="text-accent">bize iletin</span>
        </h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-muted">
          Form aracılığıyla gönderdiğiniz mesaj doğrudan ekibimizin e-postasına iletilir. Geri
          bildirimleriniz sistemi geliştirmemize yardımcı olur.
        </p>

        {sent ? (
          <div className="mt-8 flex flex-col items-center gap-3 rounded-xl border border-accent/40 bg-accent/10 px-6 py-12 text-center animate-fade-up">
            <CheckCircle2 size={40} className="text-accent" aria-hidden="true" />
            <p className="text-lg font-semibold text-ink">Mesajınız iletildi 🎉</p>
            <p className="max-w-md text-sm text-muted">
              Teşekkürler! Geri bildiriminiz ekibimize ulaştı. En kısa sürede dönüş yapacağız.
            </p>
            <Link to="/" className="btn btn-accent mt-2">
              Ana sayfaya dön
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="panel mt-8 flex flex-col gap-4 p-6 animate-fade-up">
            {error && <ErrorBanner message={error} />}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1">
                <span className="label">Ad Soyad</span>
                <input
                  className="field"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Adınız"
                  autoComplete="name"
                  maxLength={80}
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="label">E-posta</span>
                <input
                  className="field"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@eposta.com"
                  autoComplete="email"
                  maxLength={120}
                />
              </label>
            </div>

            <label className="flex flex-col gap-1">
              <span className="label">Konu</span>
              <select
                className="field appearance-none"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              >
                {SUBJECTS.map((s) => (
                  <option key={s.value} value={s.value} className="bg-surface">
                    {s.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="label">Mesajınız</span>
              <textarea
                className="field min-h-[140px] resize-y"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Öneri, görüş veya bildirimini buraya yaz…"
                maxLength={4000}
              />
              <span className="font-mono text-[10px] text-faint">{message.length}/4000</span>
            </label>

            <button
              type="submit"
              disabled={submitting || validation !== null}
              className="btn btn-accent justify-center py-2.5 text-[15px] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? <Spinner className="h-4 w-4" /> : <Send size={16} aria-hidden="true" />}
              {submitting ? "Gönderiliyor…" : "Gönder"}
            </button>

            <p className="flex items-center gap-1.5 font-mono text-[10px] text-faint">
              <Mail size={12} aria-hidden="true" /> Mesajınız güvenli şekilde ekibimize e-posta ile iletilir.
            </p>
          </form>
        )}
      </section>

      <footer className="mt-8 border-t border-line pt-5 text-center font-mono text-[11px] text-faint">
        Marmara Üniversitesi · Bilgisayar Mühendisliği Bitirme Projesi
      </footer>
    </main>
  );
}
