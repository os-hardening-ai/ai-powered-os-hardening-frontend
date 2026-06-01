import { type ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { Boxes, Bot, LayoutDashboard, LogOut, MessagesSquare, Search, ShieldCheck, UserRound } from "lucide-react";
import { useHealth } from "@/hooks/useHealth";
import { useAuth } from "@/context/AuthContext";
import { canAccess } from "@/lib/permissions";

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
  const { user } = useAuth();
  // Yetkisiz roller, backend'in 403 döneceği sayfaları (Pano/Kurallar/Agent) NAV'da
  // GÖRMESİN — link yoksa yanlışlıkla tıklayıp spurious logout/403 yaşamaz.
  const nav = NAV.filter(({ to }) => canAccess(to, user?.role));
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
        {nav.map(({ to, label, icon: Icon }) => (
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
  const { user, logout } = useAuth();
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
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 rounded-full border border-line bg-surface-2 px-3 py-1">
          <span className={`h-2 w-2 rounded-full ${dot[state]} ${state === "online" ? "animate-pulse" : ""}`} />
          <span className="font-mono text-[11px] uppercase tracking-wider text-muted">{label[state]}</span>
        </div>
        {user && (
          <div className="flex items-center gap-1.5 rounded-full border border-line bg-surface-2 py-1 pl-3 pr-1">
            <UserRound size={13} className="text-faint" />
            <span className="font-mono text-[11px] text-muted">
              {user.username}<span className="text-faint"> · {user.role}</span>
            </span>
            <button
              onClick={() => void logout()}
              title="Çıkış yap"
              className="ml-1 flex h-6 w-6 items-center justify-center rounded-full text-faint transition-colors hover:bg-danger/10 hover:text-danger"
            >
              <LogOut size={13} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
