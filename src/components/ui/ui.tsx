import { type ReactNode } from "react";
import { Loader2, HelpCircle } from "lucide-react";

type Tone = "accent" | "info" | "warn" | "danger" | "muted";

const toneClasses: Record<Tone, string> = {
  accent: "border-accent/40 bg-accent/10 text-accent",
  info: "border-info/40 bg-info/10 text-info",
  warn: "border-warn/40 bg-warn/10 text-warn",
  danger: "border-danger/40 bg-danger/10 text-danger",
  muted: "border-line bg-surface-2 text-muted",
};

export function Badge({
  children,
  tone = "muted",
  title,
}: {
  children: ReactNode;
  tone?: Tone;
  title?: string;
}) {
  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-[11px] uppercase tracking-wider ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}

export function Spinner({ className = "" }: { className?: string }) {
  return <Loader2 className={`animate-spin ${className}`} size={16} />;
}

export function Card({
  children,
  className = "",
  as: As = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article";
}) {
  return <As className={`panel ${className}`}>{children}</As>;
}

export function EmptyState({
  icon,
  title,
  hint,
}: {
  icon?: ReactNode;
  title: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      {icon && <div className="text-faint">{icon}</div>}
      <p className="font-mono text-sm uppercase tracking-wider text-muted">{title}</p>
      {hint && <p className="max-w-sm text-sm text-faint">{hint}</p>}
    </div>
  );
}

export function ErrorBanner({ message, requestId }: { message: string; requestId?: string }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger animate-fade-up">
      <span className="mt-0.5 font-mono text-xs">!</span>
      <div>
        <p>{message}</p>
        {requestId && <p className="mt-0.5 font-mono text-[11px] text-danger/70">request_id: {requestId}</p>}
      </div>
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between gap-3 text-sm text-ink"
    >
      <span className="label normal-case tracking-normal text-muted">{label}</span>
      <span
        className={`relative h-5 w-9 rounded-full border transition-colors ${
          checked ? "border-accent/60 bg-accent/30" : "border-line bg-surface-2"
        }`}
      >
        <span
          className={`absolute top-0.5 h-3.5 w-3.5 rounded-full transition-all ${
            checked ? "left-[18px] bg-accent" : "left-0.5 bg-faint"
          }`}
        />
      </span>
    </button>
  );
}

/**
 * Küçük "?" ikonu — üzerine gelince (hover) açıklama balonu açar.
 * Erişilebilir: ikon focus alır, klavye/dokunmatik için de balon görünür.
 */
export function InfoTip({ content, label = "Bilgi" }: { content: ReactNode; label?: string }) {
  return (
    <span className="group/tip relative inline-flex align-middle">
      <button
        type="button"
        aria-label={label}
        className="cursor-help text-faint transition-colors hover:text-accent focus:text-accent focus:outline-none"
      >
        <HelpCircle size={13} aria-hidden="true" />
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 w-64 -translate-x-1/2 rounded-lg
          border border-line bg-surface px-3 py-2 text-left text-[11px] font-normal normal-case leading-relaxed
          tracking-normal text-muted opacity-0 shadow-xl transition-opacity duration-150
          group-hover/tip:opacity-100 group-focus-within/tip:opacity-100"
      >
        {content}
      </span>
    </span>
  );
}

export function Select<T extends string>({
  value,
  onChange,
  options,
  label,
  info,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  label?: string;
  info?: ReactNode;  // verilirse label yanına "?" hover-açıklaması koyar
}) {
  return (
    <label className="flex flex-col gap-1">
      {label && (
        <span className="label inline-flex items-center gap-1.5">
          {label}
          {info && <InfoTip content={info} label={`${label} hakkında`} />}
        </span>
      )}
      <select className="field appearance-none" value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-surface">
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
