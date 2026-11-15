import type { ReactNode } from "react";

/** Replace {{name}} placeholders. Unknown placeholders become empty. */
export function fillTemplate(text: string, vars: Record<string, string | number>): string {
  return text.replace(/\{\{\s*([a-z_]+)\s*\}\}/gi, (_, key: string) =>
    vars[key] !== undefined ? String(vars[key]) : "",
  );
}

const INLINE = /(\*\*[^*]+\*\*|\[[^\]]+\]\((?:https?:\/\/|\/|mailto:)[^)\s]+\))/g;

function inline(text: string, linkColor: string): ReactNode[] {
  return text.split(INLINE).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part);
    if (link) {
      return (
        <a key={i} href={link[2]} style={{ color: linkColor, textDecoration: "underline" }}>
          {link[1]}
        </a>
      );
    }
    return part;
  });
}

/**
 * Tiny, safe markdown: paragraphs (blank line), line breaks, **bold** and
 * [links](https://…). Everything else is plain text, so admin-edited copy can
 * never inject HTML.
 */
export function MarkdownBody({
  text,
  linkColor = "#8a5a12",
}: {
  text: string;
  linkColor?: string;
}) {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  return (
    <>
      {paragraphs.map((p, i) => (
        <p
          key={i}
          style={{ margin: "0 0 16px", fontSize: 16, lineHeight: "26px", color: "#172033" }}
        >
          {p.split("\n").map((line, j) => (
            <span key={j}>
              {j > 0 && <br />}
              {inline(line, linkColor)}
            </span>
          ))}
        </p>
      ))}
    </>
  );
}

export function markdownToText(text: string): string {
  return text.replace(/\*\*([^*]+)\*\*/g, "$1").replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, "$1 ($2)");
}
