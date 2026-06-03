import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AuthProvider } from "@/context/AuthContext";
import type { ChatMessage } from "@/hooks/useChat";

// useChat'i mock'la — API/SSE'den izole, sadece ChatView davranışını test et.
const mockReset = vi.fn();
const mockSend = vi.fn();
const mockStop = vi.fn();
let mockMessages: ChatMessage[] = [];

vi.mock("@/hooks/useChat", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/hooks/useChat")>();
  return {
    ...actual, // DEFAULT_SETTINGS gerçeği kalsın
    useChat: () => ({
      messages: mockMessages,
      busy: false,
      error: null,
      send: mockSend,
      stop: mockStop,
      reset: mockReset,
    }),
  };
});

import { ChatView } from "./ChatView";

// ChatView artık useAuth (rol-bazlı varsayılan "Yanıt modu") okuyor → AuthProvider gerekir.
// Token yoksa status=anonymous (network çağrısı yok), user=null → expertMode varsayılan false.
const renderView = () => render(<ChatView />, { wrapper: AuthProvider });

beforeEach(() => {
  mockMessages = [];
  mockReset.mockClear();
  mockSend.mockClear();
});

describe("ChatView — Yeni sohbet butonu", () => {
  it("buton etiketi 'Yeni sohbet' (eski 'Yeni oturum' DEĞİL)", () => {
    renderView();
    expect(screen.getByText("Yeni sohbet")).toBeInTheDocument();
    expect(screen.queryByText("Yeni oturum")).not.toBeInTheDocument();
  });

  it("mesaj yokken buton devre dışı", () => {
    mockMessages = [];
    renderView();
    expect(screen.getByRole("button", { name: /Yeni sohbet/i })).toBeDisabled();
  });

  it("mesaj varken butona basınca reset (yeni session) çağrılır", () => {
    mockMessages = [{ id: "m1", role: "user", content: "selam" }];
    renderView();
    const btn = screen.getByRole("button", { name: /Yeni sohbet/i });
    expect(btn).not.toBeDisabled();
    fireEvent.click(btn);
    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it("mesaj yokken boş durum (empty state) gösterilir", () => {
    renderView();
    expect(screen.getByText(/CIS tabanlı güvenlik asistanı/i)).toBeInTheDocument();
  });
});
