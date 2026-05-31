import { type ReactNode } from "react";
import { ShieldCheck } from "lucide-react";

/**
 * Auth sayfaları için ortak kabuk — ortalanmış kart + marka başlığı.
 * Login / Register / ForgotPassword görünümleri bunu kullanır (tutarlı görünüm).
 */
export function AuthShell({
  subtitle,
  children,
  footer,
}: {
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-surface/70 p-6 backdrop-blur shadow-glow animate-fade-up">
        <div className="mb-6 flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-accent/40 bg-accent/10 text-accent">
            <ShieldCheck size={22} aria-hidden="true" />
          </div>
          <div className="leading-tight">
            <p className="font-mono text-sm font-semibold text-ink">OS&nbsp;HARDENING</p>
            <p className="font-mono text-[10px] uppercase tracking-widest text-faint">{subtitle}</p>
          </div>
        </div>

        {children}

        {footer && <div className="mt-5 border-t border-line pt-4 text-center text-sm text-faint">{footer}</div>}
      </div>
    </div>
  );
}

/** Auth formlarında ortak metin girişi — erişilebilir label + mono başlık. */
export function AuthField({
  label,
  type = "text",
  value,
  onChange,
  autoComplete,
  autoFocus,
  required = true,
  minLength,
  placeholder,
  hint,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  autoFocus?: boolean;
  required?: boolean;
  minLength?: number;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-mono text-[11px] uppercase tracking-wider text-faint">{label}</span>
      <input
        type={type}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        required={required}
        minLength={minLength}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-line bg-bg/60 px-3 py-2 text-sm text-ink outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/20"
      />
      {hint && <span className="text-[11px] text-faint">{hint}</span>}
    </label>
  );
}
