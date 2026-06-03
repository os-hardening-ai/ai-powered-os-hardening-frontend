import { describe, it, expect } from "vitest";
import { canAccess, ROUTE_ROLES } from "./permissions";

// Pano (Dashboard) auth bug fix'inin çekirdek mantığı: route → izinli rol eşlemesi.
// Backend RBAC ile aynalı (main.py): /metrics _role_sec, /api/artifacts+/api/agent _role_dev.
describe("permissions.canAccess — pano/route role-gate", () => {
  it("/dashboard (Pano) yalnız sysadmin + security", () => {
    expect(canAccess("/dashboard", "sysadmin")).toBe(true);
    expect(canAccess("/dashboard", "security")).toBe(true);
    expect(canAccess("/dashboard", "developer")).toBe(false);
    expect(canAccess("/dashboard", "end_user")).toBe(false);
  });

  it("/rules + /agent: sysadmin + security + developer (end_user HARİÇ)", () => {
    for (const path of ["/rules", "/agent"]) {
      expect(canAccess(path, "sysadmin")).toBe(true);
      expect(canAccess(path, "security")).toBe(true);
      expect(canAccess(path, "developer")).toBe(true);
      expect(canAccess(path, "end_user")).toBe(false);
    }
  });

  it("kısıtsız route'lar (/chat, /retrieval) her doğrulanmış role açık", () => {
    expect(canAccess("/chat", "end_user")).toBe(true);
    expect(canAccess("/retrieval", "end_user")).toBe(true);
    expect(canAccess("/chat", "sysadmin")).toBe(true);
  });

  it("rol null/undefined → kısıtlı route'lara erişemez, kısıtsızlara erişir", () => {
    expect(canAccess("/dashboard", null)).toBe(false);
    expect(canAccess("/dashboard", undefined)).toBe(false);
    expect(canAccess("/chat", null)).toBe(true); // kısıtsız (ProtectedRoute zaten anonim'i /login'e atar)
  });

  it("ROUTE_ROLES yalnız beklenen kısıtlı path'leri içerir (chat/retrieval kısıtsız)", () => {
    expect(Object.keys(ROUTE_ROLES).sort()).toEqual(["/agent", "/dashboard", "/rules"]);
    expect(ROUTE_ROLES["/chat"]).toBeUndefined();
    expect(ROUTE_ROLES["/retrieval"]).toBeUndefined();
  });
});
