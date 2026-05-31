import { type FormEvent, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ErrorBanner, Spinner } from "@/components/ui/ui";
import { AuthField, AuthShell } from "@/components/auth/AuthShell";

export function LoginView() {
  const { status, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/chat";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Zaten girişliyse login sayfasını atla.
  if (status === "authenticated") return <Navigate to={from} replace />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(username.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Giriş başarısız.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      subtitle="giriş gerekli"
      footer={
        <>
          Hesabın yok mu?{" "}
          <Link to="/register" className="text-accent hover:underline">
            Kayıt ol
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
          value={username}
          onChange={setUsername}
        />
        <AuthField
          label="Parola"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={setPassword}
        />

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-[11px] text-faint hover:text-accent">
            Parolanı mı unuttun?
          </Link>
        </div>

        <button
          type="submit"
          disabled={submitting || !username || !password}
          className="mt-1 flex items-center justify-center gap-2 rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? <Spinner className="h-4 w-4" /> : <LogIn size={16} aria-hidden="true" />}
          {submitting ? "Giriş yapılıyor…" : "Giriş yap"}
        </button>
      </form>

      <p className="mt-4 font-mono text-[10px] leading-relaxed text-faint">
        JWT kimlik doğrulama · POST&nbsp;/auth/login
        <br />
        Dev demo: <span className="text-muted">admin / changeme123</span>
      </p>
    </AuthShell>
  );
}
