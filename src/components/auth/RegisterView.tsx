import { type FormEvent, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ErrorBanner, Spinner } from "@/components/ui/ui";
import { AuthField, AuthShell } from "@/components/auth/AuthShell";

const MIN_USERNAME = 3;
const MIN_PASSWORD = 6;

export function RegisterView() {
  const { status, register } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (status === "authenticated") return <Navigate to="/chat" replace />;

  // İstemci-tarafı doğrulama (backend de ayrıca doğrular).
  const validation =
    username.trim().length < MIN_USERNAME
      ? `Kullanıcı adı en az ${MIN_USERNAME} karakter olmalı.`
      : !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())
        ? "Geçerli bir e-posta adresi gir."
        : password.length < MIN_PASSWORD
          ? `Parola en az ${MIN_PASSWORD} karakter olmalı.`
          : password !== confirm
            ? "Parolalar eşleşmiyor."
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
      await register(username.trim(), password, email.trim());
      navigate("/chat", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kayıt başarısız.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      subtitle="yeni hesap"
      footer={
        <>
          Zaten hesabın var mı?{" "}
          <Link to="/login" className="text-accent hover:underline">
            Giriş yap
          </Link>
        </>
      }
    >
      {error && <div className="mb-4"><ErrorBanner message={error} /></div>}

      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <AuthField
          label="Kullanıcı adı"
          autoComplete="username"
          autoFocus
          minLength={MIN_USERNAME}
          value={username}
          onChange={setUsername}
          hint={`En az ${MIN_USERNAME} karakter`}
        />
        <AuthField
          label="E-posta"
          type="email"
          autoComplete="email"
          value={email}
          onChange={setEmail}
          hint="Parola sıfırlama bu adrese gönderilir"
        />
        <AuthField
          label="Parola"
          type="password"
          autoComplete="new-password"
          minLength={MIN_PASSWORD}
          value={password}
          onChange={setPassword}
          hint={`En az ${MIN_PASSWORD} karakter`}
        />
        <AuthField
          label="Parola (tekrar)"
          type="password"
          autoComplete="new-password"
          minLength={MIN_PASSWORD}
          value={confirm}
          onChange={setConfirm}
        />

        <button
          type="submit"
          disabled={submitting || validation !== null}
          className="mt-1 flex items-center justify-center gap-2 rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? <Spinner className="h-4 w-4" /> : <UserPlus size={16} aria-hidden="true" />}
          {submitting ? "Hesap oluşturuluyor…" : "Kayıt ol"}
        </button>
      </form>

      <p className="mt-4 font-mono text-[10px] leading-relaxed text-faint">
        Yeni hesaplar <span className="text-muted">end_user</span> rolüyle açılır · POST&nbsp;/auth/register
      </p>
    </AuthShell>
  );
}
