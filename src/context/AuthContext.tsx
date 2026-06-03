import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { login as apiLogin, logout as apiLogout, register as apiRegister, getMe } from "@/lib/api";
import { getToken, setToken, setUnauthorizedHandler } from "@/lib/auth-token";
import type { AuthUser } from "@/types/api";

type AuthStatus = "loading" | "authenticated" | "anonymous";

interface AuthContextValue {
  user: AuthUser | null;
  status: AuthStatus;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>(getToken() ? "loading" : "anonymous");

  // Saklı token varsa açılışta doğrula (/auth/me); geçersizse temizle.
  useEffect(() => {
    let cancelled = false;
    if (!getToken()) {
      setStatus("anonymous");
      return;
    }
    getMe()
      .then((me) => {
        if (cancelled) return;
        setUser(me);
        setStatus("authenticated");
      })
      .catch(() => {
        if (cancelled) return;
        setToken(null);
        setUser(null);
        setStatus("anonymous");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // 401 (token süresi dolmuş/iptal) → http katmanı bunu tetikler → oturumu kapat.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
      setStatus("anonymous");
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const res = await apiLogin({ username, password });
    setToken(res.access_token);
    setUser({ username, role: res.role });
    setStatus("authenticated");
  }, []);

  // Kayıt → backend otomatik giriş yapar (token döner) → oturumu aç.
  const register = useCallback(async (username: string, password: string, email: string) => {
    const res = await apiRegister({ username, password, email });
    setToken(res.access_token);
    setUser({ username, role: res.role });
    setStatus("authenticated");
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout(); // jti blacklist (best-effort)
    } catch {
      /* yine de yerelde çıkış yap */
    }
    setToken(null);
    setUser(null);
    setStatus("anonymous");
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, status, login, register, logout }),
    [user, status, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Provider ile aynı dosyada bilinçli tutuluyor (yaygın context deseni); bu yalnız
// HMR fast-refresh uyarısıdır, doğruluğu etkilemez.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
