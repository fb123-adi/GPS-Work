import type { ReactNode } from "react";

/**
 * Minimal, safe Markdown for admin-edited content (journal, legal pages).
 * Supports ## / ### headings, paragraphs, - lists, > notes, **bold**, and
 * [links](https://...). Output is React elements; raw HTML is never
 * interpreted, so stored content cannot inject scripts.
 */
function inline(text: string, key: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\*\*(.+?)\*\*|\[([^\]]+)\]\(((?:https?:\/\/|\/)[^\s)]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1]) out.push(<strong key={`${key}b${i++}`}>{m[1]}</strong>);
    else out.push(<a key={`${key}a${i++}`} href={m[3]} rel={m[3].startsWith("http") ? "noopener noreferrer" : undefined}>{m[2]}</a>);
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function Markdown({ source }: { source: string }) {
  const blocks = source.replace(/\r\n/g, "\n").split(/\n{2,}/);
  return (
    <>
      {blocks.map((b, i) => {
        const t = b.trim();
        if (!t) return null;
        if (t.startsWith("### ")) return <h3 key={i}>{inline(t.slice(4), `h${i}`)}</h3>;
        if (t.startsWith("## ")) return <h2 key={i}>{inline(t.slice(3), `h${i}`)}</h2>;
        if (t.startsWith("> ")) return <blockquote key={i}>{inline(t.replace(/^> ?/gm, ""), `q${i}`)}</blockquote>;
        if (/^- /m.test(t) && t.split("\n").every((l) => l.startsWith("- "))) {
          return <ul key={i}>{t.split("\n").map((l, j) => <li key={j}>{inline(l.slice(2), `l${i}-${j}`)}</li>)}</ul>;
        }
        return <p key={i}>{inline(t.replace(/\n/g, " "), `p${i}`)}</p>;
      })}
    </>
  );
}
