import { useCallback, useState } from "react";
import type { ChatMessage } from "@/hooks/useChat";

const STORAGE_KEY = "chat_history_v1";
const MAX_SESSIONS = 40;

export interface HistorySession {
  id: string;
  title: string;
  createdAt: number;
  messages: ChatMessage[];
}

function loadFromStorage(): HistorySession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as HistorySession[]) : [];
  } catch {
    return [];
  }
}

function saveToStorage(sessions: HistorySession[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.slice(0, MAX_SESSIONS)));
  } catch {
    // Storage full or unavailable — fail silently
  }
}

export function useChatHistory() {
  const [sessions, setSessions] = useState<HistorySession[]>(loadFromStorage);

  const saveSession = useCallback((messages: ChatMessage[]) => {
    const done = messages.filter((m) => !m.streaming && m.content.trim());
    if (done.length === 0) return;

    const firstUser = done.find((m) => m.role === "user");
    const title = (firstUser?.content ?? "Sohbet").slice(0, 70);

    const session: HistorySession = {
      id: `sess_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
      title,
      createdAt: Date.now(),
      messages: done,
    };

    setSessions((prev) => {
      const next = [session, ...prev].slice(0, MAX_SESSIONS);
      saveToStorage(next);
      return next;
    });
  }, []);

  /** Var olan sohbeti günceller ve listenin başına taşır. */
  const updateSession = useCallback((id: string, messages: ChatMessage[]) => {
    const done = messages.filter((m) => !m.streaming && m.content.trim());
    if (done.length === 0) return;

    setSessions((prev) => {
      const existing = prev.find((s) => s.id === id);
      if (!existing) {
        // Silinmişse yeniden oluştur
        saveSession(messages);
        return prev;
      }
      const updated: HistorySession = {
        ...existing,
        messages: done,
        createdAt: Date.now(),
      };
      const next = [updated, ...prev.filter((s) => s.id !== id)].slice(0, MAX_SESSIONS);
      saveToStorage(next);
      return next;
    });
  }, [saveSession]);

  const deleteSession = useCallback((id: string) => {
    setSessions((prev) => {
      const next = prev.filter((s) => s.id !== id);
      saveToStorage(next);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setSessions([]);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  }, []);

  return { sessions, saveSession, updateSession, deleteSession, clearAll };
}
