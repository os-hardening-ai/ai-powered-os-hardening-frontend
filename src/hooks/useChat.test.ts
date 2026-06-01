import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";

// api katmanını mock'la — gerçek HTTP yok. send() bir kullanıcı + bir asistan mesajı ekler.
const postChat = vi.fn((_req: unknown) =>
  Promise.resolve({
    answer: "cevap",
    intent: "info_request",
    safety_category: "safe_defensive",
    layer_path: "1→2→3B",
    rag_sources: [],
  }),
);
const streamChat = vi.fn();

vi.mock("@/lib/api", () => ({
  postChat: (req: unknown) => postChat(req),
  streamChat: (req: unknown, handlers: unknown) => streamChat(req, handlers),
}));

/** postChat'in i. çağrısının request gövdesini tipli al. */
const reqAt = (i: number) => postChat.mock.calls[i][0] as { session_id: string };

// Her reset farklı session üretmeli → çağrıları sayan deterministik stub.
let sessionSeq = 0;
vi.mock("@/lib/format", () => ({
  newSessionId: () => `sess-${++sessionSeq}`,
}));

import { useChat, DEFAULT_SETTINGS } from "./useChat";

beforeEach(() => {
  sessionSeq = 0;
  postChat.mockClear();
});

describe("useChat — session yönetimi (her sohbet kendi session'ı)", () => {
  it("non-stream send kullanıcı + asistan mesajı ekler ve session_id gönderir", async () => {
    const { result } = renderHook(() => useChat());
    await act(async () => {
      await result.current.send("ssh nedir", { ...DEFAULT_SETTINGS, stream: false });
    });
    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[0]).toMatchObject({ role: "user", content: "ssh nedir" });
    expect(result.current.messages[1]).toMatchObject({ role: "assistant", content: "cevap" });
    // API'ye bir session_id geçti
    expect(reqAt(0).session_id).toMatch(/^sess-/);
  });

  it("reset mesajları temizler ve YENİ session id üretir", async () => {
    const { result } = renderHook(() => useChat());
    await act(async () => {
      await result.current.send("ilk soru", { ...DEFAULT_SETTINGS, stream: false });
    });
    const firstSession = reqAt(0).session_id;
    expect(result.current.messages.length).toBe(2);

    act(() => result.current.reset());
    expect(result.current.messages).toHaveLength(0); // sohbet temizlendi

    await act(async () => {
      await result.current.send("ikinci soru", { ...DEFAULT_SETTINGS, stream: false });
    });
    const secondSession = reqAt(1).session_id;
    // Yeni sohbet → farklı session (eski bağlam taşınmaz)
    expect(secondSession).not.toBe(firstSession);
  });

  it("aynı sohbet içinde session_id sabit kalır (çok turlu bağlam)", async () => {
    const { result } = renderHook(() => useChat());
    await act(async () => {
      await result.current.send("soru bir", { ...DEFAULT_SETTINGS, stream: false });
    });
    await act(async () => {
      await result.current.send("soru iki", { ...DEFAULT_SETTINGS, stream: false });
    });
    expect(reqAt(0).session_id).toBe(reqAt(1).session_id);
  });
});
