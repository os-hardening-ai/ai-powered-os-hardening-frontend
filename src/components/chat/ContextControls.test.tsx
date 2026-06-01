import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ContextControls } from "./ContextControls";
import { DEFAULT_SETTINGS, type ChatSettings } from "@/hooks/useChat";

function setup(overrides: Partial<ChatSettings> = {}) {
  const settings: ChatSettings = { ...DEFAULT_SETTINGS, ...overrides };
  const onChange = vi.fn();
  render(<ContextControls settings={settings} onChange={onChange} />);
  return { settings, onChange };
}

describe("ContextControls — Grup 1 (bağlam)", () => {
  it("OS/rol/seviye/ZT her zaman görünür", () => {
    setup();
    expect(screen.getByText("İşletim sistemi")).toBeInTheDocument();
    expect(screen.getByText("Rol")).toBeInTheDocument();
    expect(screen.getByText("Güvenlik seviyesi")).toBeInTheDocument();
    expect(screen.getByText("ZT Olgunluğu")).toBeInTheDocument();
  });

  it("OS değişince onChange doğru değerle çağrılır", () => {
    const { onChange } = setup();
    const osSelect = screen.getByText("İşletim sistemi").parentElement!.querySelector("select")!;
    fireEvent.change(osSelect, { target: { value: "windows_11" } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ os: "windows_11" }));
  });
});

describe("ContextControls — Grup 2 (gelişmiş accordion)", () => {
  it("retrieval ayarları varsayılan GİZLİ (accordion kapalı)", () => {
    setup();
    expect(screen.queryByText("RAG kullan")).not.toBeInTheDocument();
    const toggle = screen.getByRole("button", { name: /Gelişmiş — Retrieval/i });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  it("accordion açılınca retrieval ayarları görünür", () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: /Gelişmiş — Retrieval/i }));
    expect(screen.getByText("RAG kullan")).toBeInTheDocument();
    expect(screen.getByText(/Top-K kaynak/)).toBeInTheDocument();
    expect(screen.getByText(/Min. benzerlik skoru/)).toBeInTheDocument();
  });
});

describe("ContextControls — RAG-off uyarısı", () => {
  it("RAG açıkken uyarı YOK", () => {
    setup({ use_rag: true });
    fireEvent.click(screen.getByRole("button", { name: /Gelişmiş — Retrieval/i }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("RAG kapalıyken uydurma riski uyarısı GÖRÜNÜR", () => {
    setup({ use_rag: false });
    fireEvent.click(screen.getByRole("button", { name: /Gelişmiş — Retrieval/i }));
    const alert = screen.getByRole("alert");
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent(/uydurma|hallucination/i);
    expect(alert).toHaveTextContent(/kaynak/i);
  });

  it("RAG kapalıyken Top-K ve min-score slider'ları devre dışı", () => {
    setup({ use_rag: false });
    fireEvent.click(screen.getByRole("button", { name: /Gelişmiş — Retrieval/i }));
    const sliders = screen.getAllByRole("slider") as HTMLInputElement[];
    expect(sliders.length).toBe(2);
    sliders.forEach((s) => expect(s).toBeDisabled());
  });

  it("RAG açıkken slider'lar etkin", () => {
    setup({ use_rag: true });
    fireEvent.click(screen.getByRole("button", { name: /Gelişmiş — Retrieval/i }));
    const sliders = screen.getAllByRole("slider") as HTMLInputElement[];
    sliders.forEach((s) => expect(s).not.toBeDisabled());
  });

  it("RAG toggle'ı onChange'i tersine çevirir", () => {
    const { onChange } = setup({ use_rag: true });
    fireEvent.click(screen.getByRole("button", { name: /Gelişmiş — Retrieval/i }));
    fireEvent.click(screen.getByRole("switch", { name: /RAG kullan/i }));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ use_rag: false }));
  });
});
