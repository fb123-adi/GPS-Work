import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";

type Crumb = { label: string; href?: string };

export function PageHeader({
  eyebrow,
  title,
  intro,
  crumbs,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  crumbs?: Crumb[];
}) {
  return (
    <header className="border-b border-stone bg-parchment pt-[72px]">
      <div className="mx-auto max-w-editorial px-5 py-14 sm:px-8 sm:py-20">
        {crumbs && (
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex flex-wrap items-center gap-2 text-[0.66rem] uppercase tracking-wide2 text-taupe">
              {crumbs.map((c, i) => (
                <li key={c.label} className="flex items-center gap-2">
                  {c.href ? (
                    <Link href={c.href} className="hover:text-gold-ink">
                      {c.label}
                    </Link>
                  ) : (
                    <span className="text-graphite">{c.label}</span>
                  )}
                  {i < crumbs.length - 1 && <span aria-hidden>/</span>}
                </li>
              ))}
            </ol>
          </nav>
        )}
        <Reveal className="flex flex-col gap-5">
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          <h1 className="max-w-3xl text-balance font-display text-4xl leading-[1.05] sm:text-5xl md:text-6xl">
            {title}
          </h1>
          {intro && (
            <p className="max-w-2xl text-pretty text-[0.98rem] font-light leading-relaxed text-graphite">
              {intro}
            </p>
          )}
        </Reveal>
      </div>
    </header>
  );
}
