import type { OsTarget, UserRole, SecurityLevel, ArtifactFormat } from "@/types/api";

// When VITE_API_BASE_URL is empty we use same-origin relative paths, which in
// dev are routed through the Vite proxy (see vite.config.ts) to the backend.
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

export const OS_OPTIONS: { value: OsTarget; label: string; family: "linux" | "windows" }[] = [
  { value: "ubuntu_24_04", label: "Ubuntu 24.04", family: "linux" },
  { value: "ubuntu_22_04", label: "Ubuntu 22.04", family: "linux" },
  { value: "windows_11", label: "Windows 11", family: "windows" },
  { value: "windows_10", label: "Windows 10", family: "windows" },
  { value: "windows_server_2022", label: "Windows Server 2022", family: "windows" },
  { value: "windows_server_2019", label: "Windows Server 2019", family: "windows" },
];

export const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "sysadmin", label: "Sysadmin" },
  { value: "soc", label: "SOC Analyst" },
  { value: "devops", label: "DevOps" },
  { value: "developer", label: "Developer" },
];

export const SECURITY_LEVELS: SecurityLevel[] = ["minimal", "balanced", "strict"];

export const ARTIFACT_FORMATS: { value: ArtifactFormat; label: string; family: "linux" | "windows" | "any" }[] = [
  { value: "bash", label: "Bash (.sh)", family: "linux" },
  { value: "ansible", label: "Ansible playbook", family: "any" },
  { value: "powershell", label: "PowerShell (.ps1)", family: "windows" },
  { value: "reg", label: "Registry (.reg)", family: "windows" },
  { value: "gpo", label: "GPO summary", family: "windows" },
];
