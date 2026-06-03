import { downloadText } from "@/lib/format";
import type { ChatMessage } from "@/hooks/useChat";

function dateTR(): string {
  return new Date().toLocaleString("tr-TR", {
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ── Markdown ────────────────────────────────────────────────────────────────

export function exportMarkdown(messages: ChatMessage[]): void {
  const done = messages.filter((m) => !m.streaming);
  if (done.length === 0) return;

  const lines: string[] = [
    "# OS Hardening Asistanı — Rapor",
    "",
    `**Tarih:** ${dateTR()}`,
    `**Mesaj sayısı:** ${done.length}`,
    "",
  ];

  for (const msg of done) {
    lines.push("---", "");
    if (msg.role === "user") {
      lines.push("### Kullanıcı", "", msg.content, "");
    } else {
      lines.push("### Asistan", "", msg.content, "");
      const m = msg.meta;
      if (m) {
        const tags: string[] = [];
        if (m.intent) tags.push(`intent: ${m.intent}`);
        if (m.layer_path) tags.push(`path: ${m.layer_path}`);
        if (m.total_time_s !== undefined) tags.push(`süre: ${m.total_time_s.toFixed(1)}s`);
        if (m.estimated_cost != null) tags.push(`maliyet: $${m.estimated_cost.toFixed(4)}`);
        if (tags.length) lines.push("", `> ${tags.join(" · ")}`, "");
      }
    }
  }

  const ts = new Date().toISOString().slice(0, 16).replace("T", "_").replace(":", "-");
  downloadText(`hardening-rapor-${ts}.md`, lines.join("\n"));
}

// ── PDF (tarayıcı yazdır) ────────────────────────────────────────────────────

export function exportPdf(messages: ChatMessage[]): void {
  const done = messages.filter((m) => !m.streaming);
  if (done.length === 0) return;

  const rows = done.map((m) => {
    const roleLabel = m.role === "user" ? "Kullanıcı" : "Asistan";
    const cls = m.role === "user" ? "user" : "assistant";
    const body = escapeHtml(m.content);

    let metaHtml = "";
    if (m.role === "assistant" && m.meta) {
      const mm = m.meta;
      const tags: string[] = [];
      if (mm.intent) tags.push(`intent: ${mm.intent}`);
      if (mm.layer_path) tags.push(`path: ${mm.layer_path}`);
      if (mm.total_time_s !== undefined) tags.push(`süre: ${mm.total_time_s.toFixed(1)}s`);
      if (mm.estimated_cost != null) tags.push(`maliyet: $${mm.estimated_cost.toFixed(4)}`);
      if (tags.length) metaHtml = `<div class="meta">${tags.join(" &nbsp;·&nbsp; ")}</div>`;
    }

    return `<div class="message ${cls}">
  <div class="role">${roleLabel}</div>
  <div class="body">${body}</div>
  ${metaHtml}
</div>`;
  }).join("\n");

  const html = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <title>OS Hardening Asistanı Raporu</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: 13px;
      line-height: 1.6;
      color: #1e293b;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 32px;
    }
    header { border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 28px; }
    header h1 { font-size: 18px; font-weight: 700; color: #0f172a; }
    header p { font-size: 11px; color: #64748b; margin-top: 4px; }
    .message { margin-bottom: 20px; page-break-inside: avoid; }
    .role {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #64748b;
      margin-bottom: 6px;
    }
    .body {
      padding: 12px 16px;
      border-radius: 6px;
      white-space: pre-wrap;
      word-break: break-word;
    }
    .user .body  { background: #f1f5f9; border-left: 3px solid #3b82f6; }
    .assistant .body { background: #f8fafc; border-left: 3px solid #22c55e; font-family: monospace; font-size: 12px; }
    .meta {
      font-size: 10px;
      color: #94a3b8;
      margin-top: 5px;
      padding-left: 4px;
    }
    hr { border: none; border-top: 1px solid #e2e8f0; margin: 20px 0; }
    @media print {
      body { padding: 20px; }
      .message { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <header>
    <h1>OS Hardening Asistanı — Rapor</h1>
    <p>Tarih: ${dateTR()} &nbsp;|&nbsp; Mesaj sayısı: ${done.length}</p>
  </header>
  <main>${rows}</main>
</body>
</html>`;

  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  // Short delay so browser renders before the print dialog opens
  setTimeout(() => win.print(), 300);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
