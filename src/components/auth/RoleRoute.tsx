import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { canAccess } from "@/lib/permissions";

/**
 * ROL gate'i — doğrulanmış ama yetkisi olmayan kullanıcıyı /chat'e yönlendirir.
 *
 * ProtectedRoute zaten ANONİM kullanıcıyı /login'e atar; bu bileşen onun İÇİNDE
 * çalışır ve yalnız ROL kontrolü yapar. Böylece örn. `end_user`, Pano'ya (/dashboard)
 * ne NAV linkinden ne de doğrudan URL ile ulaşır → backend'in 403/401'ini (ve ondan
 * doğan spurious logout/"tekrar şifre sorma") hiç tetiklemez.
 */
export function RoleRoute({ path, children }: { path: string; children: ReactNode }) {
  const { user } = useAuth();
  if (!canAccess(path, user?.role)) {
    return <Navigate to="/chat" replace />;
  }
  return <>{children}</>;
}
