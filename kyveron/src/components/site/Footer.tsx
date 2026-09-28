import Link from "next/link";
import { BRAND } from "@/lib/config/store";
import { getPriceFormatter } from "@/lib/currency";
import { Wordmark } from "./Wordmark";
import { NewsletterForm } from "./NewsletterForm";
import { RegionForm } from "./RegionForm";

const COLUMNS = [
  { title: "Shop", links: [["All products", "/shop"], ["Performance", "/collections/performance"], ["Daily Uniform", "/collections/daily-uniform"], ["Travel", "/collections/travel"], ["Studio", "/collections/studio"]] },
  { title: "Help", links: [["Track an order", "/track-order"], ["Start a return", "/returns"], ["Size guide", "/size-guide"], ["FAQ", "/faq"], ["Contact us", "/contact"]] },
  { title: "Policies", links: [["Shipping", "/legal/shipping"], ["Returns and exchanges", "/legal/returns-policy"], ["Refunds", "/legal/refunds"], ["Cancellations", "/legal/cancellation"], ["Payments and billing", "/legal/payments"]] },
  { title: "Kyveron", links: [["About", "/about"], ["Journal", "/journal"], ["Terms", "/legal/terms"], ["Privacy", "/legal/privacy"], ["Cookies", "/legal/cookies"], ["Grievance redressal", "/legal/grievance"]] },
] as const;

export async function Footer() {
  const fmt = await getPriceFormatter();
  return (
    <footer className="on-dark bg-obsidian text-ivory" data-reveal-scope>
      <div className="container-x grid gap-14 py-16 lg:grid-cols-[1.1fr_2fr] lg:py-24">
        <div data-reveal>
          <Wordmark tone="light" />
          <p className="mt-6 max-w-sm text-[1.0625rem] leading-relaxed text-ivory/85">
            New releases, restocks, and the occasional note on fabric. Twice a month at most.
          </p>
          <div className="mt-6 max-w-md"><NewsletterForm /></div>
        </div>
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4" data-reveal>
          {COLUMNS.map((c) => (
            <nav key={c.title} aria-label={c.title}>
              <h2 className="wide-label text-stone">{c.title}</h2>
              <ul className="mt-4 space-y-2.5 text-[0.9375rem]">
                {c.links.map(([label, href]) => (
                  <li key={href}><Link href={href} className="text-ivory/90 transition-colors hover:text-ivory hover:underline underline-offset-4">{label}</Link></li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>
      <div className="border-t border-graphite">
        <div className="container-x grid gap-8 py-10 lg:grid-cols-[1.1fr_2fr]">
          <address className="not-italic text-sm leading-relaxed text-stone">
            <span className="text-ivory">Customer care</span><br />
            <a href={`mailto:${BRAND.supportEmail}`} className="link">{BRAND.supportEmail}</a><br />
            WhatsApp <a href={BRAND.whatsappLink} className="link" rel="noopener">{BRAND.whatsapp}</a><br />
            {BRAND.serviceHours}
          </address>
          <div className="max-w-xl"><RegionForm currency={fmt.currency} country={fmt.country} dark /></div>
        </div>
      </div>
      <div className="border-t border-graphite">
        <div className="container-x flex flex-col gap-2 py-6 text-xs text-stone sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} {BRAND.legalName}. {BRAND.address}. GSTIN {BRAND.gstin}.</p>
          <p>Prices in INR include GST. Product images are placeholders until launch photography.</p>
        </div>
      </div>
    </footer>
  );
}
