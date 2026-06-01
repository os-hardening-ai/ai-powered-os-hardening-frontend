import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RoleRoute } from "@/components/auth/RoleRoute";
import { LoginView } from "@/components/auth/LoginView";
import { RegisterView } from "@/components/auth/RegisterView";
import { ForgotPasswordView } from "@/components/auth/ForgotPasswordView";
import { WelcomeView } from "@/components/welcome/WelcomeView";
import { AppShell } from "@/components/layout/AppShell";
import { ChatView } from "@/components/chat/ChatView";
import { RulesView } from "@/components/rules/RulesView";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { RetrievalExplorer } from "@/components/retrieval/RetrievalExplorer";
import { AgentView } from "@/components/agent/AgentView";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public — JWT gerektirmez */}
        <Route path="/" element={<WelcomeView />} />
        <Route path="/welcome" element={<WelcomeView />} />
        <Route path="/login" element={<LoginView />} />
        <Route path="/register" element={<RegisterView />} />
        <Route path="/forgot-password" element={<ForgotPasswordView />} />

        {/* Protected — JWT gerektirir; AppShell + uygulama route'ları */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppShell>
                <Routes>
                  <Route path="/" element={<Navigate to="/chat" replace />} />
                  <Route path="/chat" element={<ChatView />} />
                  {/* Rol gate'li — yetkisiz kullanıcı /chat'e yönlendirilir (RoleRoute) */}
                  <Route path="/rules" element={<RoleRoute path="/rules"><RulesView /></RoleRoute>} />
                  <Route path="/agent" element={<RoleRoute path="/agent"><AgentView /></RoleRoute>} />
                  <Route path="/dashboard" element={<RoleRoute path="/dashboard"><DashboardView /></RoleRoute>} />
                  <Route path="/retrieval" element={<RetrievalExplorer />} />
                  <Route path="/rag-test" element={<Navigate to="/retrieval" replace />} />
                  <Route path="*" element={<Navigate to="/chat" replace />} />
                </Routes>
              </AppShell>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}
