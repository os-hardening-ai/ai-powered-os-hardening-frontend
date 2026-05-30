import type { CisRule } from "@/types/api";

export function osFamily(os?: string | null): "linux" | "windows" | "unknown" {
  if (!os) return "unknown";
  if (os.startsWith("ubuntu") || os.includes("linux")) return "linux";
  if (os.startsWith("windows")) return "windows";
  return "unknown";
}

export function fmtSeconds(s?: number): string {
  if (s === undefined || s === null) return "—";
  return s < 1 ? `${Math.round(s * 1000)} ms` : `${s.toFixed(2)} s`;
}

export function fmtCost(c?: number | null): string {
  if (c === undefined || c === null) return "—";
  return c === 0 ? "$0" : `$${c.toFixed(4)}`;
}

export function fmtPct(v?: number | null): string {
  if (v === undefined || v === null) return "—";
  return `${Math.round(v * 100)}%`;
}

/** Map an intent string to a human label + tone for badges. */
export function intentMeta(intent?: string | null): { label: string; tone: "accent" | "info" | "muted" } {
  switch (intent) {
    case "action_request":
      return { label: "Action", tone: "accent" };
    case "info_request":
      return { label: "Info", tone: "info" };
    case "greeting":
    case "thanks":
    case "farewell":
      return { label: "Smalltalk", tone: "muted" };
    case "out_of_scope":
      return { label: "Out of scope", tone: "muted" };
    default:
      return { label: intent ?? "—", tone: "muted" };
  }
}

/** Safety category → tone. The pipeline rejects unsafe queries, so danger is rare. */
export function safetyTone(cat?: string | null): "accent" | "warn" | "danger" | "muted" {
  if (!cat) return "muted";
  if (cat.includes("unsafe") || cat.includes("malicious")) return "danger";
  if (cat.includes("potentially")) return "warn";
  if (cat.includes("safe")) return "accent";
  return "muted";
}

const DANGER_PATTERNS = [
  /\brm\s+-rf\b/,
  /\bmkfs\b/,
  /\bdd\s+if=/,
  />\s*\/dev\/sd[a-z]/,
  /\bchmod\s+-R\s+777\b/,
  /:\(\)\s*\{\s*:\|:&\s*\};:/, // fork bomb
  /Remove-Item\s+.*-Recurse\s+.*-Force/i,
  /\bdisable[- ]?firewall\b/i,
];

/** Heuristic flag for visibly destructive commands so the UI can warn the user. */
export function hasDangerousCommand(text: string): boolean {
  return DANGER_PATTERNS.some((re) => re.test(text));
}

export function ruleMatchesSearch(rule: CisRule, q: string): boolean {
  if (!q) return true;
  const hay = `${rule.id} ${rule.title} ${rule.category ?? ""} ${(rule.tags ?? []).join(" ")}`.toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .every((term) => hay.includes(term));
}

export function downloadText(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function artifactExtension(fmt: string): string {
  return { bash: "sh", powershell: "ps1", ansible: "yml", reg: "reg", gpo: "txt" }[fmt] ?? "txt";
}

export function newSessionId(): string {
  return `web-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
