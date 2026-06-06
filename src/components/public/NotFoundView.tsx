import { Link } from "react-router-dom";
import { Home, MessageSquare, ShieldCheck } from "lucide-react";

export function NotFoundView() {
  return (
    <main className="relative z-10 mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-5 text-center">
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg border border-accent/40 bg-accent/10 text-accent">
        <ShieldCheck size={26} aria-hidden="true" />
      </div>
      <span className="font-mono text-7xl font-bold text-accent">404</span>
      <h1 className="mt-3 text-2xl font-semibold text-ink">Sayfa bulunamadı</h1>
      <p className="mt-2 max-w-md text-sm text-muted">
        Aradığınız sayfa taşınmış, silinmiş veya hiç var olmamış olabilir. Bağlantıyı kontrol edin.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link to="/" className="btn btn-accent">
          <Home size={16} aria-hidden="true" /> Ana sayfa
        </Link>
        <Link to="/contact" className="btn">
          <MessageSquare size={16} aria-hidden="true" /> İletişim
        </Link>
      </div>
    </main>
  );
}
