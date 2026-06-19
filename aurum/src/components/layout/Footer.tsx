import Link from "next/link";
import { site } from "@/config/site";

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-ink text-ivory">
      <div className="mx-auto max-w-editorial px-5 sm:px-8">
        {/* Brand line */}
        <div className="grid gap-12 border-b border-ivory/10 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <p className="font-display text-3xl tracking-luxe">{site.name}</p>
            <p className="mt-5 text-sm font-light leading-relaxed text-taupe">
              Luxury sportswear engineered for performance and designed for prestige.
              Crafted for those who demand both.
            </p>
            <div className="mt-7 flex gap-3">
              {site.footer.social.map((s) => (
                <Link
                  key={s}
                  href="#"
                  aria-label={s}
                  className="flex min-h-[44px] min-w-[44px] items-center justify-center border border-ivory/15 text-[0.62rem] uppercase tracking-wide2 text-taupe transition-colors hover:border-gold hover:text-gold"
                >
                  {s.slice(0, 2)}
                </Link>
              ))}
            </div>
          </div>

          {site.footer.columns.map((col) => (
            <div key={col.heading}>
              <h3 className="font-body text-[0.68rem] uppercase tracking-luxe text-gold">
                {col.heading}
              </h3>
              <ul className="mt-5 space-y-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-sm font-light text-taupe transition-colors hover:text-ivory"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Sub-footer */}
        <div className="flex flex-col items-center justify-between gap-4 py-8 text-center md:flex-row md:text-left">
          <p className="text-[0.68rem] uppercase tracking-wide2 text-taupe">
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <p className="text-[0.68rem] uppercase tracking-wide2 text-taupe">
            Performance · Prestige · Exclusivity · Excellence
          </p>
        </div>
      </div>
    </footer>
  );
}
