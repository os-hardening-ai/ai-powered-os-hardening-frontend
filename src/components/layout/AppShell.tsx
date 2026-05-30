import { type ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { Boxes, Bot, LayoutDashboard, MessagesSquare, Search, ShieldCheck } from "lucide-react";
import { useHealth } from "@/hooks/useHealth";

const NAV = [
  { to: "/chat", label: "Asistan", icon: MessagesSquare },
  { to: "/rules", label: "Kurallar", icon: Boxes },
  { to: "/agent", label: "Agent", icon: Bot },
  { to: "/retrieval", label: "Retrieval", icon: Search },
  { to: "/dashboard", label: "Pano", icon: LayoutDashboard },
];

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative z-10 flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="min-h-0 flex-1 overflow-hidden p-4">{children}</main>
      </div>
    </div>
  );
}

function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-line bg-surface/60 px-3 py-4 backdrop-blur md:flex">
      <div className="mb-6 flex items-center gap-2.5 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-accent/40 bg-accent/10 text-accent shadow-glow">
          <ShieldCheck size={20} />
        </div>
        <div className="leading-tight">
          <p className="font-mono text-sm font-semibold text-ink">OS&nbsp;HARDENING</p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-faint">console v1.0</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "border border-accent/40 bg-accent/10 text-accent"
                  : "border border-transparent text-muted hover:bg-surface-2 hover:text-ink"
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto rounded-lg border border-line bg-bg/50 p-3">
        <p className="font-mono text-[10px] uppercase tracking-wider text-faint">Standartlar</p>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          CIS Benchmarks · NIST Zero&nbsp;Trust (SP&nbsp;800-207) · ISO/IEC&nbsp;27001
        </p>
      </div>
    </aside>
  );
}

function TopBar() {
  const { state } = useHealth();
  const dot: Record<string, string> = {
    checking: "bg-warn",
    online: "bg-accent",
    degraded: "bg-warn",
    offline: "bg-danger",
  };
  const label: Record<string, string> = {
    checking: "bağlanıyor",
    online: "API çevrimiçi",
    degraded: "API kısıtlı",
    offline: "API çevrimdışı",
  };

  return (
    <header className="flex h-12 items-center justify-between border-b border-line bg-surface/40 px-4 backdrop-blur">
      <p className="font-mono text-xs uppercase tracking-wider text-faint">
        RAG · Rule Engine · Artifact Generator
      </p>
      <div className="flex items-center gap-2 rounded-full border border-line bg-surface-2 px-3 py-1">
        <span className={`h-2 w-2 rounded-full ${dot[state]} ${state === "online" ? "animate-pulse" : ""}`} />
        <span className="font-mono text-[11px] uppercase tracking-wider text-muted">{label[state]}</span>
      </div>
    </header>
  );
}
