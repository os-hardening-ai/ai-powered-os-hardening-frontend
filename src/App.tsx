import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { ChatView } from "@/components/chat/ChatView";
import { RulesView } from "@/components/rules/RulesView";
import { DashboardView } from "@/components/dashboard/DashboardView";

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Navigate to="/chat" replace />} />
        <Route path="/chat" element={<ChatView />} />
        <Route path="/rules" element={<RulesView />} />
        <Route path="/dashboard" element={<DashboardView />} />
        <Route path="*" element={<Navigate to="/chat" replace />} />
      </Routes>
    </AppShell>
  );
}
