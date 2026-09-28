import type { Metadata } from "next";
import { BRAND } from "@/lib/config/store";
import { drivers, env } from "@/lib/env";
import { ContactForm } from "@/components/site/ContactForm";

export const metadata: Metadata = { title: "Contact", description: "Contact Kyveron customer care by email, WhatsApp, or the support form." };

export default function ContactPage() {
  const siteKey = drivers().captcha === "turnstile" ? env().NEXT_PUBLIC_TURNSTILE_SITE_KEY! : null;
  return (
    <div className="container-x grid gap-12 py-12 lg:grid-cols-[1fr_1.4fr] lg:py-16">
      <div>
        <h1 className="display text-[clamp(2rem,4vw,3.2rem)]">Contact us</h1>
        <p className="mt-4 max-w-md text-ink-soft">We reply within one working day. For an order, include the order number so we can help faster.</p>
        <dl className="mt-10 grid gap-6 text-[0.9375rem]">
          <div><dt className="font-medium">Email</dt><dd><a className="link" href={`mailto:${BRAND.supportEmail}`}>{BRAND.supportEmail}</a></dd></div>
          <div><dt className="font-medium">WhatsApp</dt><dd><a className="link" href={BRAND.whatsappLink} rel="noopener">{BRAND.whatsapp}</a></dd></div>
          <div><dt className="font-medium">Hours</dt><dd>{BRAND.serviceHours}</dd></div>
          <div><dt className="font-medium">Grievance officer</dt><dd>{BRAND.grievanceOfficer}</dd></div>
          <div><dt className="font-medium">Registered office</dt><dd>{BRAND.legalName}<br />{BRAND.address}</dd></div>
        </dl>
      </div>
      <ContactForm siteKey={siteKey} />
    </div>
  );
}
