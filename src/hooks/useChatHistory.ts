import { useCallback, useEffect, useState } from "react";
import type { ChatMessage } from "@/hooks/useChat";

const MAX_SESSIONS = 40;

function storageKey(userId: string): string {
  return `chat_history_v1_${userId}`;
}

function loadFromStorage(userId: string): HistorySession[] {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    return raw ? (JSON.parse(raw) as HistorySession[]) : [];
  } catch {
    return [];
  }
}

function saveToStorage(userId: string, sessions: HistorySession[]): void {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(sessions.slice(0, MAX_SESSIONS)));
  } catch {
    // Storage full or unavailable — fail silently
  }
}

export interface HistorySession {
  id: string;
  title: string;
  createdAt: number;
  messages: ChatMessage[];
}

export function useChatHistory(userId: string) {
  const [sessions, setSessions] = useState<HistorySession[]>(() => loadFromStorage(userId));

  // Kullanıcı değişince (farklı hesap girişi) o kullanıcıya ait geçmişi yükle.
  useEffect(() => {
    setSessions(loadFromStorage(userId));
  }, [userId]);

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
      saveToStorage(userId, next);
      return next;
    });
  }, [userId]);

  /** Var olan sohbeti günceller ve listenin başına taşır. */
  const updateSession = useCallback((id: string, messages: ChatMessage[]) => {
    const done = messages.filter((m) => !m.streaming && m.content.trim());
    if (done.length === 0) return;

    setSessions((prev) => {
      const existing = prev.find((s) => s.id === id);
      if (!existing) {
        saveSession(messages);
        return prev;
      }
      const updated: HistorySession = {
        ...existing,
        messages: done,
        createdAt: Date.now(),
      };
      const next = [updated, ...prev.filter((s) => s.id !== id)].slice(0, MAX_SESSIONS);
      saveToStorage(userId, next);
      return next;
    });
  }, [userId, saveSession]);

  const deleteSession = useCallback((id: string) => {
    setSessions((prev) => {
      const next = prev.filter((s) => s.id !== id);
      saveToStorage(userId, next);
      return next;
    });
  }, [userId]);

  const clearAll = useCallback(() => {
    setSessions([]);
    try { localStorage.removeItem(storageKey(userId)); } catch { /* ignore */ }
  }, [userId]);

  return { sessions, saveSession, updateSession, deleteSession, clearAll };
}
