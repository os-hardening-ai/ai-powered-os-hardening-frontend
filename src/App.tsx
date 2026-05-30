import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { ChatView } from "@/components/chat/ChatView";
import { RulesView } from "@/components/rules/RulesView";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { RetrievalExplorer } from "@/components/retrieval/RetrievalExplorer";
import { AgentView } from "@/components/agent/AgentView";

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Navigate to="/chat" replace />} />
        <Route path="/chat" element={<ChatView />} />
        <Route path="/rules" element={<RulesView />} />
        <Route path="/agent" element={<AgentView />} />
        <Route path="/dashboard" element={<DashboardView />} />
        <Route path="/retrieval" element={<RetrievalExplorer />} />
        <Route path="/rag-test" element={<Navigate to="/retrieval" replace />} />
        <Route path="*" element={<Navigate to="/chat" replace />} />
      </Routes>
    </AppShell>
  );
}
