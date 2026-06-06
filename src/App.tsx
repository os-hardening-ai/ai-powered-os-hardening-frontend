import { lazy, Suspense } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RoleRoute } from "@/components/auth/RoleRoute";
import { AppShell } from "@/components/layout/AppShell";
import { Spinner } from "@/components/ui/ui";

// Eager (ilk boyama hızlı kalsın): açılış + kimlik doğrulama ekranları
import { LoginView } from "@/components/auth/LoginView";
import { RegisterView } from "@/components/auth/RegisterView";
import { ForgotPasswordView } from "@/components/auth/ForgotPasswordView";
import { WelcomeView } from "@/components/welcome/WelcomeView";

// Lazy (talep üzerine yüklenir → ilk bundle küçülür)
const ContactView = lazy(() => import("@/components/contact/ContactView").then((m) => ({ default: m.ContactView })));
const AboutView = lazy(() => import("@/components/public/AboutView").then((m) => ({ default: m.AboutView })));
const FaqView = lazy(() => import("@/components/public/FaqView").then((m) => ({ default: m.FaqView })));
const LegalView = lazy(() => import("@/components/public/LegalView").then((m) => ({ default: m.LegalView })));
const NotFoundView = lazy(() => import("@/components/public/NotFoundView").then((m) => ({ default: m.NotFoundView })));
const ChatView = lazy(() => import("@/components/chat/ChatView").then((m) => ({ default: m.ChatView })));
const RulesView = lazy(() => import("@/components/rules/RulesView").then((m) => ({ default: m.RulesView })));
const DashboardView = lazy(() => import("@/components/dashboard/DashboardView").then((m) => ({ default: m.DashboardView })));
const RetrievalExplorer = lazy(() => import("@/components/retrieval/RetrievalExplorer").then((m) => ({ default: m.RetrievalExplorer })));
const AgentView = lazy(() => import("@/components/agent/AgentView").then((m) => ({ default: m.AgentView })));

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Spinner className="h-6 w-6 text-accent" />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* ── Public (JWT gerektirmez) ───────────────────────────── */}
          <Route path="/" element={<WelcomeView />} />
          <Route path="/welcome" element={<WelcomeView />} />
          <Route path="/login" element={<LoginView />} />
          <Route path="/register" element={<RegisterView />} />
          <Route path="/forgot-password" element={<ForgotPasswordView />} />
          <Route path="/contact" element={<ContactView />} />
          <Route path="/about" element={<AboutView />} />
          <Route path="/sss" element={<FaqView />} />
          <Route path="/gizlilik" element={<LegalView kind="privacy" />} />
          <Route path="/kosullar" element={<LegalView kind="terms" />} />

          {/* ── Korumalı uygulama (AppShell layout + JWT) ──────────── */}
          <Route
            element={
              <ProtectedRoute>
                <AppShell>
                  <Outlet />
                </AppShell>
              </ProtectedRoute>
            }
          >
            <Route path="/chat" element={<ChatView />} />
            <Route path="/rules" element={<RoleRoute path="/rules"><RulesView /></RoleRoute>} />
            <Route path="/agent" element={<RoleRoute path="/agent"><AgentView /></RoleRoute>} />
            <Route path="/dashboard" element={<RoleRoute path="/dashboard"><DashboardView /></RoleRoute>} />
            <Route path="/retrieval" element={<RetrievalExplorer />} />
            <Route path="/rag-test" element={<Navigate to="/retrieval" replace />} />
          </Route>

          {/* ── Public 404 — bilinmeyen her yol ────────────────────── */}
          <Route path="*" element={<NotFoundView />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}
