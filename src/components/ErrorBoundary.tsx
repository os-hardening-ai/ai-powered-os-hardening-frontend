import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Uygulama genelinde React hata sınırı. Bir alt bileşen render sırasında patlarsa,
 * boş beyaz ekran yerine biçimlendirilmiş bir kurtarma ekranı gösterir.
 * (Router'ın DIŞINDA sarmalandığı için <Link> yerine düz <a> kullanılır.)
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Üretimde bir hata-izleme servisine (örn. Sentry) gönderilebilir.
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  private handleReload = () => window.location.reload();

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="relative z-10 mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-5 text-center">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg border border-danger/40 bg-danger/10 text-danger">
          <AlertTriangle size={26} aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-semibold text-ink">Bir şeyler ters gitti</h1>
        <p className="mt-2 max-w-md text-sm text-muted">
          Beklenmeyen bir hata oluştu. Sayfayı yenilemek sorunu çoğu zaman çözer.
        </p>
        {this.state.error?.message && (
          <p className="mt-3 max-w-md truncate font-mono text-[11px] text-faint">
            {this.state.error.message}
          </p>
        )}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={this.handleReload} className="btn btn-accent">
            Yeniden dene
          </button>
          <a href="/" className="btn">Ana sayfa</a>
        </div>
      </main>
    );
  }
}
