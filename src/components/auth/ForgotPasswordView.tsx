import { type FormEvent, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { CheckCircle2, KeyRound, Mail } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { forgotPassword, resetPassword } from "@/lib/api";
import { ErrorBanner, Spinner } from "@/components/ui/ui";
import { AuthField, AuthShell } from "@/components/auth/AuthShell";

const MIN_PASSWORD = 6;
type Step = "request" | "reset" | "done";

export function ForgotPasswordView() {
  const { status } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("request");
  const [username, setUsername] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (status === "authenticated") return <Navigate to="/chat" replace />;

  // ── Adım 1: sıfırlama talebi ──────────────────────────────────
  async function onRequest(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await forgotPassword({ username: username.trim() });
      setNotice(res.message);
      // DEV-mode: token doğrudan döner → 2. adıma geç + token'ı doldur.
      // PROD: token e-posta ile gelir → kullanıcı elle girer.
      if (res.reset_token) setToken(res.reset_token);
      setStep("reset");
    } catch (err) {
      setError(err instanceof Error ? err.message : "İstek başarısız.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Adım 2: yeni parola ───────────────────────────────────────
  const resetValidation =
    token.trim().length < 8
      ? "Geçerli bir sıfırlama token'ı gir."
      : password.length < MIN_PASSWORD
        ? `Parola en az ${MIN_PASSWORD} karakter olmalı.`
        : password !== confirm
          ? "Parolalar eşleşmiyor."
          : null;

  async function onReset(e: FormEvent) {
    e.preventDefault();
    if (resetValidation) {
      setError(resetValidation);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await resetPassword({ token: token.trim(), new_password: password });
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Parola sıfırlanamadı.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Başarı ekranı ─────────────────────────────────────────────
  if (step === "done") {
    return (
      <AuthShell subtitle="parola sıfırlandı">
        <div className="flex flex-col items-center gap-3 py-2 text-center">
          <CheckCircle2 size={36} className="text-accent" aria-hidden="true" />
          <p className="text-sm text-ink">Parolan güncellendi.</p>
          <p className="text-[12px] text-faint">Yeni parolanla giriş yapabilirsin.</p>
          <button
            onClick={() => navigate("/login", { replace: true })}
            className="mt-2 flex items-center justify-center gap-2 rounded-lg border border-accent/40 bg-accent/10 px-4 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent/20"
          >
            Giriş ekranına dön
          </button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      subtitle="parola sıfırlama"
      footer={
        <Link to="/login" className="text-accent hover:underline">
          ← Giriş ekranına dön
        </Link>
      }
    >
      {error && <div className="mb-4"><ErrorBanner message={error} /></div>}
      {notice && step === "reset" && (
        <div className="mb-4 rounded-lg border border-info/40 bg-info/10 px-3 py-2 text-[12px] text-info">
          {notice}
        </div>
      )}

      {step === "request" ? (
        <form onSubmit={onRequest} className="flex flex-col gap-3">
          <AuthField
            label="Kullanıcı adı"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={setUsername}
            hint="Hesabına ait kullanıcı adını gir."
          />
          <button
            type="submit"
            disabled={submitting || !username.trim()}
            className="mt-1 flex items-center justify-center gap-2 rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? <Spinner className="h-4 w-4" /> : <Mail size={16} aria-hidden="true" />}
            {submitting ? "Gönderiliyor…" : "Sıfırlama token'ı al"}
          </button>
        </form>
      ) : (
        <form onSubmit={onReset} className="flex flex-col gap-3">
          <AuthField
            label="Sıfırlama token'ı"
            value={token}
            onChange={setToken}
            autoFocus={!token}
            hint="Dev ortamda otomatik dolduruldu; prod'da e-postandaki token."
          />
          <AuthField
            label="Yeni parola"
            type="password"
            autoComplete="new-password"
            minLength={MIN_PASSWORD}
            value={password}
            onChange={setPassword}
            autoFocus={!!token}
            hint={`En az ${MIN_PASSWORD} karakter`}
          />
          <AuthField
            label="Yeni parola (tekrar)"
            type="password"
            autoComplete="new-password"
            minLength={MIN_PASSWORD}
            value={confirm}
            onChange={setConfirm}
          />
          <button
            type="submit"
            disabled={submitting || resetValidation !== null}
            className="mt-1 flex items-center justify-center gap-2 rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? <Spinner className="h-4 w-4" /> : <KeyRound size={16} aria-hidden="true" />}
            {submitting ? "Sıfırlanıyor…" : "Parolayı sıfırla"}
          </button>
        </form>
      )}

      <p className="mt-4 font-mono text-[10px] leading-relaxed text-faint">
        Tez kapsamı: e-posta altyapısı yok · dev'de token yanıtta döner · POST&nbsp;/auth/forgot-password
      </p>
    </AuthShell>
  );
}
