import type { OsTarget, UserRole, SecurityLevel, ArtifactFormat, ZtMaturity } from "@/types/api";

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");
// Auth: JWT Bearer (POST /auth/login → token). X-API-Key kaldırıldı.

export const OS_OPTIONS: { value: OsTarget; label: string; family: "linux" | "windows" }[] = [
  { value: "ubuntu_24_04", label: "Ubuntu 24.04 LTS", family: "linux" },
  { value: "ubuntu_22_04", label: "Ubuntu 22.04 LTS", family: "linux" },
  { value: "windows_11", label: "Windows 11", family: "windows" },
  { value: "windows_server_2025", label: "Windows Server 2025", family: "windows" },
];

export const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "sysadmin", label: "Sysadmin" },
  { value: "soc", label: "SOC Analyst" },
  { value: "devops", label: "DevOps" },
  { value: "developer", label: "Developer" },
  { value: "auditor", label: "Auditor" },
];

export const SECURITY_LEVELS: SecurityLevel[] = ["minimal", "balanced", "strict"];

export const ZT_MATURITY_OPTIONS: { value: ZtMaturity; label: string; description: string }[] = [
  { value: "low", label: "Düşük", description: "Least privilege + temel loglama" },
  { value: "medium", label: "Orta", description: "+ MFA + ağ segmentasyonu" },
  { value: "high", label: "Yüksek", description: "+ sürekli doğrulama + mikro-segmentasyon" },
];

export const ARTIFACT_FORMATS: { value: ArtifactFormat; label: string; family: "linux" | "windows" | "any" }[] = [
  { value: "bash", label: "Bash (.sh)", family: "linux" },
  { value: "ansible", label: "Ansible playbook", family: "any" },
  { value: "powershell", label: "PowerShell (.ps1)", family: "windows" },
  { value: "reg", label: "Registry (.reg)", family: "windows" },
  { value: "gpo", label: "GPO summary", family: "windows" },
];
