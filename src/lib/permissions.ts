import type { Role } from "@/types/api";

// ─────────────────────────────────────────────────────────────
// Frontend RBAC — backend role gate'leriyle (main.py) AYNALI.
// Amaç: yetkisi olmayan kullanıcı, backend'in 403 döneceği bir sayfayı
// (Pano/Kurallar/Agent) HİÇ görmesin → ne nav'da link, ne route erişimi.
// Böylece yetkisiz kullanıcı /metrics gibi korumalı uçları tetikleyip
// 401/403 → spurious logout (panoda "tekrar şifre sorma") yaşamaz.
//
// Backend kaynağı (api/main.py):
//   _role_sec = sysadmin, security                      → /metrics, /api/analytics, /v1/*
//   _role_dev = sysadmin, security, developer           → /api/artifacts, /api/agent
//   _any      = herhangi doğrulanmış kullanıcı          → /api/chat, /rag/search
// ─────────────────────────────────────────────────────────────

/** Korumalı route → izinli backend rolleri. Listede OLMAYAN path herkese açıktır. */
export const ROUTE_ROLES: Record<string, Role[]> = {
  "/dashboard": ["sysadmin", "security"],            // Pano — /metrics (_role_sec)
  "/rules": ["sysadmin", "security", "developer"],   // Kurallar — /api/artifacts (_role_dev)
  "/agent": ["sysadmin", "security", "developer"],   // Agent — /api/agent (_role_dev)
};

/** Verilen rol bu path'e erişebilir mi? Kısıtsız path'ler için her zaman true. */
export function canAccess(path: string, role?: Role | null): boolean {
  const allowed = ROUTE_ROLES[path];
  if (!allowed) return true; // kısıtsız (chat, retrieval)
  return !!role && allowed.includes(role);
}

// "Hızlı RAG" modunu VARSAYILAN açık getirecek roller. IT/uzman roller (sysadmin,
// security, developer) genelde hep güvenlik sorusu sorar → hız + doğrudan RAG mantıklı.
// end_user smalltalk da yapabilir → "Tam (akıllı)" varsayılan onun için daha doğru.
// NOT: bu yalnız BAŞLANGIÇ varsayılanıdır; kullanıcı "Yanıt modu" seçicisiyle değiştirebilir.
const EXPERT_DEFAULT_ROLES: Role[] = ["sysadmin", "security", "developer"];

/** Rol için "Hızlı RAG" modu varsayılan açık mı gelsin? (yalnız ilk değer) */
export function defaultExpertModeForRole(role?: Role | null): boolean {
  return !!role && EXPERT_DEFAULT_ROLES.includes(role);
}
