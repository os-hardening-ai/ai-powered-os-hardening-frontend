import { type FormEvent, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { LogIn, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ErrorBanner, Spinner } from "@/components/ui/ui";

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
    <div className="flex h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-surface/70 p-6 backdrop-blur shadow-glow">
        <div className="mb-6 flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-accent/40 bg-accent/10 text-accent">
            <ShieldCheck size={22} />
          </div>
          <div className="leading-tight">
            <p className="font-mono text-sm font-semibold text-ink">OS&nbsp;HARDENING</p>
            <p className="font-mono text-[10px] uppercase tracking-widest text-faint">giriş gerekli</p>
          </div>
        </div>

        {error && <div className="mb-4"><ErrorBanner message={error} /></div>}

        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="font-mono text-[11px] uppercase tracking-wider text-faint">Kullanıcı adı</span>
            <input
              type="text"
              autoComplete="username"
              autoFocus
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="rounded-lg border border-line bg-bg/60 px-3 py-2 text-sm text-ink outline-none focus:border-accent/60"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="font-mono text-[11px] uppercase tracking-wider text-faint">Parola</span>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-line bg-bg/60 px-3 py-2 text-sm text-ink outline-none focus:border-accent/60"
            />
          </label>

          <button
            type="submit"
            disabled={submitting || !username || !password}
            className="mt-2 flex items-center justify-center gap-2 rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? <Spinner className="h-4 w-4" /> : <LogIn size={16} />}
            {submitting ? "Giriş yapılıyor…" : "Giriş yap"}
          </button>
        </form>

        <p className="mt-4 font-mono text-[10px] leading-relaxed text-faint">
          JWT kimlik doğrulama · POST&nbsp;/auth/login
          <br />
          Dev demo: <span className="text-muted">admin / changeme123</span>
        </p>
      </div>
    </div>
  );
}
