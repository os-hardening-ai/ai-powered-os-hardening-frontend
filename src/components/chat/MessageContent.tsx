import { Fragment, useState, type ReactNode } from "react";
import { Check, Copy, ShieldAlert } from "lucide-react";
import { hasDangerousCommand } from "@/lib/format";

// A deliberately small, dependency-free renderer for the subset of Markdown the
// backend emits (headings, bold, inline code, fenced code blocks, bullet/numbered
// lists). Code blocks get a copy button and — for hardening scripts — a
// destructive-command warning, per the project's safety requirements.

interface Block {
  type: "code" | "text";
  lang?: string;
  content: string;
}

function splitBlocks(src: string): Block[] {
  const blocks: Block[] = [];
  const re = /```([\w-]*)\n([\s\S]*?)```/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) {
    if (m.index > last) blocks.push({ type: "text", content: src.slice(last, m.index) });
    blocks.push({ type: "code", lang: m[1] || "", content: m[2].replace(/\n$/, "") });
    last = re.lastIndex;
  }
  if (last < src.length) blocks.push({ type: "text", content: src.slice(last) });
  return blocks;
}

function renderInline(text: string, key: string): ReactNode {
  // Order matters: inline code first, then bold.
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((p, i) => {
    if (p.startsWith("`") && p.endsWith("`")) {
      return (
        <code key={`${key}-${i}`} className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[0.85em] text-accent">
          {p.slice(1, -1)}
        </code>
      );
    }
    if (p.startsWith("**") && p.endsWith("**")) {
      return (
        <strong key={`${key}-${i}`} className="font-semibold text-ink">
          {p.slice(2, -2)}
        </strong>
      );
    }
    return <Fragment key={`${key}-${i}`}>{p}</Fragment>;
  });
}

function TextBlock({ content }: { content: string }) {
  const lines = content.split("\n");
  const out: ReactNode[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;

  const flush = () => {
    if (!list) return;
    const items = list.items.map((it, i) => (
      <li key={i} className="leading-relaxed">
        {renderInline(it, `li-${out.length}-${i}`)}
      </li>
    ));
    out.push(
      list.ordered ? (
        <ol key={`ol-${out.length}`} className="ml-5 list-decimal space-y-1 text-muted">
          {items}
        </ol>
      ) : (
        <ul key={`ul-${out.length}`} className="ml-5 list-disc space-y-1 text-muted">
          {items}
        </ul>
      ),
    );
    list = null;
  };

  lines.forEach((raw, idx) => {
    const line = raw.trimEnd();
    const heading = line.match(/^(#{1,4})\s+(.*)$/);
    const bullet = line.match(/^\s*[-*]\s+(.*)$/);
    const numbered = line.match(/^\s*\d+\.\s+(.*)$/);

    if (heading) {
      flush();
      out.push(
        <h4 key={`h-${idx}`} className="mt-3 font-mono text-xs uppercase tracking-wider text-accent">
          {heading[2]}
        </h4>,
      );
    } else if (bullet) {
      if (!list || list.ordered) {
        flush();
        list = { ordered: false, items: [] };
      }
      list.items.push(bullet[1]);
    } else if (numbered) {
      if (!list || !list.ordered) {
        flush();
        list = { ordered: true, items: [] };
      }
      list.items.push(numbered[1]);
    } else if (line.trim() === "") {
      flush();
    } else {
      flush();
      out.push(
        <p key={`p-${idx}`} className="leading-relaxed text-muted">
          {renderInline(line, `p-${idx}`)}
        </p>,
      );
    }
  });
  flush();
  return <div className="space-y-2 text-sm">{out}</div>;
}

function CodeBlock({ lang, content }: { lang?: string; content: string }) {
  const [copied, setCopied] = useState(false);
  const dangerous = hasDangerousCommand(content);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="my-3 overflow-hidden rounded-lg border border-line">
      <div className="flex items-center justify-between border-b border-line bg-surface-2 px-3 py-1.5">
        <span className="font-mono text-[11px] uppercase tracking-wider text-faint">{lang || "shell"}</span>
        <button onClick={copy} className="flex items-center gap-1 text-xs text-muted hover:text-accent">
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? "Kopyalandı" : "Kopyala"}
        </button>
      </div>
      {dangerous && (
        <div className="flex items-center gap-2 border-b border-danger/30 bg-danger/10 px-3 py-1.5 text-[12px] text-danger">
          <ShieldAlert size={14} />
          Bu blok geri dönüşü olmayan / yüksek riskli komut içeriyor. Çalıştırmadan önce gözden geçir ve yedek al.
        </div>
      )}
      <pre className="overflow-x-auto bg-bg/70 px-3 py-2.5 font-mono text-[12.5px] leading-relaxed text-ink">
        <code>{content}</code>
      </pre>
    </div>
  );
}

export function MessageContent({ text }: { text: string }) {
  return (
    <div>
      {splitBlocks(text).map((b, i) =>
        b.type === "code" ? (
          <CodeBlock key={i} lang={b.lang} content={b.content} />
        ) : (
          <TextBlock key={i} content={b.content} />
        ),
      )}
    </div>
  );
}
