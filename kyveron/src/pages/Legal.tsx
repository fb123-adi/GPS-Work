import { useState, useId, ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useStore } from '../lib/store';
import { useDynamic } from '../lib/dynamicStore';
import { formatPrice } from '../lib/types';
import { BUSINESS, POLICY_UPDATED, MINIMUM_AGE, mailtoHref } from '../lib/business';

// ===== Shared policy layout =====
type Block = string | string[];
interface Section { heading: string; body: Block[] }

function PolicyPage({ title, intro, sections, children }: { title: string; intro?: ReactNode; sections: Section[]; children?: ReactNode }) {
  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 text-[#303238]">
      <h1 className="text-3xl font-semibold tracking-[-0.02em] mb-3 text-[#151515]">{title}</h1>
      <p className="text-xs text-[#6B665B] mb-6">Last updated: {POLICY_UPDATED}</p>
      <DraftNotice />
      {intro && <div className="text-sm leading-relaxed mb-8">{intro}</div>}
      <nav aria-label="On this page" className="mb-10 p-4 bg-white/60 border border-[#AAA394]/20 rounded-sm">
        <h2 className="text-xs font-semibold uppercase tracking-wider mb-2">On this page</h2>
        <ol className="list-decimal list-inside text-sm space-y-1">
          {sections.map((s, i) => <li key={i}><a href={`#section-${i + 1}`} onClick={(e) => { e.preventDefault(); document.getElementById(`section-${i + 1}`)?.scrollIntoView({ behavior: 'smooth' }); }} className="text-[#214C9A] hover:underline">{s.heading}</a></li>)}
        </ol>
      </nav>
      <div className="space-y-8">
        {sections.map((s, i) => (
          <section key={i} id={`section-${i + 1}`} aria-labelledby={`section-${i + 1}-h`} className="scroll-mt-24">
            <h2 id={`section-${i + 1}-h`} className="text-lg font-semibold text-[#151515] mb-3">{i + 1}. {s.heading}</h2>
            <div className="space-y-3 text-sm leading-relaxed">
              {s.body.map((b, j) => Array.isArray(b)
                ? <ul key={j} className="list-disc pl-5 space-y-1.5">{b.map((li, k) => <li key={k}>{li}</li>)}</ul>
                : <p key={j}>{b}</p>)}
            </div>
          </section>
        ))}
      </div>
      {children}
      <ContactBlock />
    </article>
  );
}

function DraftNotice() {
  return (
    <div className="mb-8 p-4 bg-[#214C9A]/5 border border-[#214C9A]/30 rounded-sm text-xs leading-relaxed" role="note">
      <strong>Draft for legal review.</strong> Details in [square brackets] still need to be filled in, and a qualified Indian lawyer should review this text before the store starts selling.
    </div>
  );
}

function ContactBlock() {
  const g = BUSINESS.grievanceOfficer;
  return (
    <section aria-labelledby="policy-contact" className="mt-12 p-5 bg-white/60 border border-[#AAA394]/20 rounded-sm text-sm leading-relaxed">
      <h2 id="policy-contact" className="font-semibold text-[#151515] mb-2">Contact and grievances</h2>
      <p>{BUSINESS.legalName}, {BUSINESS.registeredAddress}</p>
      <p>Customer care: {BUSINESS.supportEmail} · {BUSINESS.supportPhone} ({BUSINESS.serviceHours})</p>
      <p className="mt-2">Grievance Officer: {g.name} · {g.email} · {g.phone} · {g.address}</p>
      <p className="mt-2">Privacy and data requests: {BUSINESS.privacyEmail}, or use the <Link to="/data-request" className="text-[#214C9A] underline">data request form</Link>.</p>
    </section>
  );
}

// ===== Privacy Policy =====
export function PrivacyPolicyPage() {
  return (
    <PolicyPage
      title="Privacy Policy"
      intro={<>
        <p>This policy explains what personal data {BUSINESS.legalName} ("Kyveron", "we") collects when you use this website, why, who we share it with and the choices you have. It is written to meet the Digital Personal Data Protection Act, 2023 (DPDP Act) and the Information Technology Act, 2000 and its rules.</p>
        <p className="mt-3 p-3 bg-white/60 border border-[#AAA394]/20 rounded-sm"><strong>About this preview:</strong> the store is not live yet. Accounts, carts and orders you create here stay in your browser tab and are not sent to us. Payments, emails and deliveries are not switched on. The rest of this policy describes how the live store will handle your data.</p>
      </>}
      sections={[
        { heading: 'Who is responsible for your data', body: [
          `${BUSINESS.legalName} (${BUSINESS.entityType}), ${BUSINESS.registeredAddress}, is the Data Fiduciary for personal data collected through this website.`,
          `Our Grievance Officer is ${BUSINESS.grievanceOfficer.name}, reachable at ${BUSINESS.grievanceOfficer.email} or ${BUSINESS.grievanceOfficer.phone}.`,
        ]},
        { heading: 'What we collect', body: [
          'We collect only what we need for the purpose described:',
          [
            'Account: your name, email address and password. A mobile number is optional. We never see your password in readable form.',
            'Orders: the name, delivery address, email and mobile number needed to deliver the order and contact you about it, plus what you bought and what you paid.',
            'Payments: handled by our payment provider. We receive a payment reference and status, never your full card number, CVV, UPI PIN or net-banking password.',
            'Support: what you tell us when you contact us, and your order number if you give it.',
            'Marketing: your email address, only if you tick the separate box to receive marketing emails.',
            'Technical: our hosting provider records basic request logs (such as IP address, browser and pages requested) to run and secure the site.',
          ],
          'We do not ask for your date of birth, gender, Aadhaar, PAN or other government IDs, and we do not collect precise location.',
        ]},
        { heading: 'Why we use it', body: [
          [
            'To create and run your account (with your consent, which you give when you sign up).',
            'To process, deliver, return and refund your orders, and to send messages about them. These are transactional and do not need marketing consent.',
            'To answer your questions and handle complaints.',
            'To send marketing emails, only if you opted in. You can withdraw that consent at any time, as easily as you gave it.',
            'To meet legal duties, such as keeping GST invoices and responding to lawful requests from authorities.',
            'To keep the site secure and prevent fraud.',
          ],
        ]},
        { heading: 'Who we share it with', body: [
          'We do not sell your personal data or share it for other companies\' advertising. We share it only with service providers who process it for us under contract, and only what each one needs:',
          [
            'Payment processing: [payment provider, e.g. Razorpay Software Pvt. Ltd.].',
            'Order and account database hosting: [database provider, e.g. Supabase].',
            'Email delivery: [email provider, e.g. Resend].',
            'Delivery: the courier partner carrying your order (name, address, mobile number).',
            'Website hosting: [hosting provider]. This preview is hosted on GitHub Pages.',
            'Government and regulators, when the law requires it.',
          ],
          'Some of these providers may process data outside India. We only use providers that protect data to the standard the DPDP Act requires, and we will follow any restrictions the Government notifies on transfers.',
        ]},
        { heading: 'How long we keep it', body: [
          [
            'Account data: until you delete your account, or after [period] of inactivity.',
            'Order and invoice records: for as long as GST and accounting law requires (currently 72 months from the due date of the annual return for that year).',
            'Marketing list: until you unsubscribe.',
            'Support messages: [retention period] after the query is closed.',
            'Hosting logs: [retention period].',
          ],
          'When the period ends, or once you withdraw consent and the purpose is complete, we delete the data or make it anonymous.',
        ]},
        { heading: 'Your rights', body: [
          'Under the DPDP Act you can:',
          [
            'get a summary of the personal data we hold about you and who we have shared it with;',
            'ask us to correct, complete or update it;',
            'ask us to delete it, unless the law requires us to keep it (for example, tax invoices);',
            'withdraw consent at any time. This does not affect anything done before you withdrew it;',
            'nominate someone to exercise these rights if you die or become incapable;',
            'complain to our Grievance Officer, and if you are not satisfied, to the Data Protection Board of India.',
          ],
          'To use any of these rights, send a request through the data request form or email the privacy address below. We may ask you to confirm your identity first. We reply within [30] days.',
        ]},
        { heading: 'Children', body: [
          `You must be at least ${MINIMUM_AGE} to create an account or place an order. We do not knowingly collect personal data from anyone under ${MINIMUM_AGE}, and we do not track, profile or target advertising at children.`,
          'If you believe a child has given us personal data, contact us and we will delete it. If we later offer anything for under-18s, we will first obtain verifiable consent from a parent or lawful guardian, as the DPDP Act requires.',
        ]},
        { heading: 'Cookies and browser storage', body: [
          'We only use storage that the site needs to work. Analytics or marketing tools would load only after you agree, and none are installed today. Details are in our Cookie Policy.',
        ]},
        { heading: 'Security', body: [
          'We use encrypted connections (HTTPS), access controls and reputable providers to protect your data. If a breach affects you, we will tell you and the Data Protection Board of India as the law requires.',
        ]},
        { heading: 'Changes to this policy', body: [
          'If we change this policy we will update the date at the top. If a change affects how we use data you have already given us, we will tell you before it takes effect and ask for consent again where needed.',
        ]},
      ]}
    />
  );
}

// ===== Terms of Service =====
export function TermsPage() {
  const { state } = useDynamic();
  const s = state.settings;
  return (
    <PolicyPage
      title="Terms of Service"
      intro={<p>These terms apply when you use this website or buy from {BUSINESS.legalName}. Please read them with our <Link to="/privacy" className="text-[#214C9A] underline">Privacy Policy</Link>, <Link to="/refund-policy" className="text-[#214C9A] underline">Refund Policy</Link> and <Link to="/shipping-policy" className="text-[#214C9A] underline">Shipping Policy</Link>. Nothing here takes away your rights under the Consumer Protection Act, 2019.</p>}
      sections={[
        { heading: 'About us', body: [
          `This website is operated by ${BUSINESS.legalName} (${BUSINESS.entityType}), registered office ${BUSINESS.registeredAddress}, GSTIN ${BUSINESS.gstin}. We are the seller of every product on this site.`,
          'The store is currently a preview: orders placed here are not processed, charged or delivered.',
        ]},
        { heading: 'Who can buy', body: [
          `You must be at least ${MINIMUM_AGE} years old and able to enter a binding contract under Indian law to create an account or place an order.`,
          'Keep your password private. You are responsible for activity on your account. Tell us straight away if you think someone else is using it.',
        ]},
        { heading: 'Products and prices', body: [
          'We describe products and show their colours as accurately as we can. Screens show colours differently, so the actual shade may vary slightly. Each product page lists fabric, fit, care and country of origin.',
          'Prices are in Indian Rupees and include GST. Delivery charges and any cash-on-delivery fee are shown in the cart and at checkout before you pay. We never add charges after you place the order.',
          'If a price is shown wrongly because of an obvious error, we will tell you and give you the choice to buy at the correct price or cancel for a full refund.',
        ]},
        { heading: 'Orders', body: [
          'When you place an order you make an offer to buy. We accept it when we send the dispatch confirmation. We may decline or cancel an order if the product is unavailable, the payment fails, or we reasonably suspect fraud. If we cancel after you have paid, we refund you in full.',
          'You may order up to 10 units of any item per order.',
        ]},
        { heading: 'Payment', body: [
          'Payments are processed by our payment provider over a secure connection. We never see or store your full card details.',
          `Cash on delivery, where available, carries a fee of ${formatPrice(s.codFee)}. It is shown before you place the order.`,
        ]},
        { heading: 'Delivery', body: [
          `Delivery is free on orders of ${formatPrice(s.freeShippingThreshold)} or more after discounts; below that, delivery costs ${formatPrice(s.shippingCharge)}. Our Shipping Policy has timelines and details.`,
        ]},
        { heading: 'Cancellations, returns and refunds', body: [
          'You can cancel free of charge until the order is dispatched.',
          `You can return eligible items within ${s.returnWindowDays} days of delivery. Our Refund Policy explains eligibility, how to return an item and how refunds are paid.`,
        ]},
        { heading: 'Discount codes', body: [
          'Discount codes have the conditions shown with them (minimum order, validity dates, usage limits). One code per order. Codes have no cash value.',
        ]},
        { heading: 'Reviews', body: [
          'Only customers who bought a product can review it. We publish reviews whether positive or negative, subject to removing unlawful or abusive content. We do not pay for, write or edit reviews.',
        ]},
        { heading: 'Using the site', body: [
          'Please do not misuse the site: no attempts to break its security, scrape it at scale, place fraudulent orders or upload unlawful content.',
          'Text, designs, logos and photographs on the site belong to us or our licensors. You may not reuse them commercially without permission.',
        ]},
        { heading: 'Liability', body: [
          'We are responsible for losses that are a foreseeable result of our breach of these terms or our negligence. We are not responsible for losses that were not foreseeable, or for business losses. Nothing in these terms limits liability that cannot be limited under Indian law, including your rights as a consumer.',
        ]},
        { heading: 'Complaints and disputes', body: [
          `Contact customer care first. If we can't resolve it, write to our Grievance Officer, ${BUSINESS.grievanceOfficer.name} (${BUSINESS.grievanceOfficer.email}). We acknowledge complaints within 48 hours and aim to resolve them within one month.`,
          'You may also approach the National Consumer Helpline (1915 or consumerhelpline.gov.in) or a consumer commission.',
          'These terms are governed by the laws of India. Courts at [city] have jurisdiction, without affecting your right to bring a consumer complaint where you live.',
        ]},
        { heading: 'Changes', body: [
          'We may update these terms. The version on the site when you place an order applies to that order.',
        ]},
      ]}
    />
  );
}

// ===== Refund Policy =====
export function RefundPolicyPage() {
  const { state } = useDynamic();
  const s = state.settings;
  return (
    <PolicyPage
      title="Refund Policy"
      intro={<p>If something isn't right, you can return it. This policy covers returns, exchanges, cancellations and refunds. There are no restocking or return-processing fees.</p>}
      sections={[
        { heading: 'Cancelling an order', body: [
          'You can cancel any order free of charge until it is dispatched, from your account or by contacting customer care. We refund prepaid orders in full, including delivery charges.',
        ]},
        { heading: 'Returns', body: [
          `You can return items within ${s.returnWindowDays} days of delivery if they are unused and unwashed, with the original tags attached.`,
          'For hygiene reasons we cannot accept returns of innerwear or items whose hygiene seal has been removed. The product page tells you before you buy if an item cannot be returned.',
          'Items bought at a discount can be returned on the same terms as full-price items.',
        ]},
        { heading: 'Damaged, faulty or wrong items', body: [
          'If an item arrives damaged, faulty or is not what you ordered, tell us within [48 hours] of delivery with a photo. We will collect it free of charge and send a replacement or give a full refund, including delivery charges, whichever you prefer.',
        ]},
        { heading: 'How to return', body: [
          [
            'Contact customer care with your order number and the items you want to return.',
            'Choose a refund or a size exchange.',
            'We confirm the request within 2 business days and arrange a pickup, or give you the return address if pickup is not available at your PIN code.',
          ],
          'Return pickup is free.',
        ]},
        { heading: 'Refunds', body: [
          'We check returned items within 2 business days of receiving them and tell you the result. If the return is accepted, we start the refund the same day.',
          [
            'Prepaid orders: refunded to the original payment method. Banks usually take 5–7 business days to show the credit.',
            'Cash-on-delivery orders: refunded to a bank account or UPI ID you give us.',
            'Delivery charges are refunded when the whole order is returned because it was damaged, faulty or wrong, or cancelled before dispatch.',
            `The cash-on-delivery fee (${formatPrice(s.codFee)}) is refunded if the order is cancelled before dispatch or returned because of our error.`,
            'If you used a discount code and return only part of an order, the refund is the price you actually paid for the returned items.',
          ],
          'If a return is not accepted, we tell you why and send the item back to you free of charge.',
        ]},
        { heading: 'Exchanges', body: [
          'We exchange for a different size of the same item, subject to stock. If your size is unavailable, we refund you instead. Exchange delivery is free.',
        ]},
        { heading: 'Failed payments', body: [
          'If money leaves your account but the order is not created, it is reversed automatically, normally within 5–7 business days in line with RBI timelines. Contact us if it has not arrived.',
        ]},
      ]}
    />
  );
}

// ===== Shipping Policy =====
export function ShippingPolicyPage() {
  const { state } = useDynamic();
  const s = state.settings;
  return (
    <PolicyPage
      title="Shipping Policy"
      sections={[
        { heading: 'Where we deliver', body: ['We deliver to serviceable PIN codes across India. International delivery is not available.'] },
        { heading: 'Delivery charges', body: [
          `Delivery is free on orders of ${formatPrice(s.freeShippingThreshold)} or more after discounts. Below that, delivery costs ${formatPrice(s.shippingCharge)}.`,
          `Cash on delivery, where available, has a fee of ${formatPrice(s.codFee)}.`,
          'All charges are shown in the cart and at checkout before you pay. Nothing is added afterwards.',
        ]},
        { heading: 'Timelines', body: [
          'We dispatch within 1–2 business days of your order. Delivery usually takes 3–5 business days to metro cities and 5–7 business days elsewhere. These are estimates. We will tell you if your order is delayed.',
        ]},
        { heading: 'Tracking', body: ['When your order is dispatched we send you the courier name and tracking number. You can also check the status on the Track Order page.'] },
      ]}
    />
  );
}

// ===== Cookie Policy =====
export function CookiePolicyPage() {
  const { openCookieSettings } = useStore();
  const rows = [
    { name: 'kyveron_consent', type: 'Browser storage (localStorage)', purpose: 'Remembers your cookie choice so we don\'t ask again.', category: 'Strictly necessary', duration: 'Until you change it or delete site data' },
    { name: 'kyveron_dynamic_data_v2', type: 'Browser storage (localStorage)', purpose: 'Only set on the admin screen: saves catalogue edits made on that device.', category: 'Strictly necessary', duration: 'Until reset or site data is deleted' },
  ];
  return (
    <PolicyPage
      title="Cookie Policy"
      intro={<p>This policy lists everything this website stores on your device and the other services your browser contacts when you visit. We do not set any cookies ourselves.</p>}
      sections={[
        { heading: 'What we store', body: ['The table below lists every item. Nothing is used to track you across other websites.'] },
        { heading: 'Analytics and marketing', body: [
          'We do not use any analytics, advertising or social-media tracking tools today. If we add one, it will be listed here and will load only after you switch that category on in Cookie settings. Rejecting it will never stop you from using the store.',
        ]},
        { heading: 'Other services your browser contacts', body: [
          [
            'Hosting: this preview is served by GitHub Pages, which records basic request logs (such as IP address) to run the service.',
            'Product images: currently loaded from image.qwenlm.ai, the image service they were created with. That service can see your IP address when it sends an image. We plan to host all images ourselves.',
            'Fonts and icons are hosted with the site itself, so no font service is contacted.',
          ],
        ]},
        { heading: 'Managing your choices', body: [
          'You can change your choice at any time from "Cookie settings" in the footer or the button below. You can also delete everything this site has stored from the "Your data & deletion" page, or through your browser settings.',
        ]},
      ]}
    >
      <div className="mt-8 overflow-x-auto">
        <table className="w-full text-sm border border-[#8A8577]">
          <caption className="text-left text-xs text-[#6B665B] mb-2">Items this site stores on your device</caption>
          <thead className="bg-white/60">
            <tr>{['Name', 'Type', 'Purpose', 'Category', 'How long'].map(h => <th key={h} scope="col" className="text-left p-2 border-b border-[#8A8577] font-semibold">{h}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.name} className="align-top">
                <th scope="row" className="text-left p-2 border-b border-[#AAA394]/20 font-mono text-xs">{r.name}</th>
                <td className="p-2 border-b border-[#AAA394]/20">{r.type}</td>
                <td className="p-2 border-b border-[#AAA394]/20">{r.purpose}</td>
                <td className="p-2 border-b border-[#AAA394]/20">{r.category}</td>
                <td className="p-2 border-b border-[#AAA394]/20">{r.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" onClick={openCookieSettings} className="mt-6 px-5 py-2.5 bg-[#151515] text-white text-sm font-medium rounded-sm hover:bg-[#303238]">Open cookie settings</button>
    </PolicyPage>
  );
}

// ===== Size Guide =====
export function SizeGuidePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 text-[#303238]">
      <h1 className="text-3xl font-semibold tracking-[-0.02em] mb-6 text-[#151515]">Size Guide</h1>
      <SizeTable />
      <ul className="mt-6 list-disc pl-5 space-y-1.5 text-sm">
        <li>All measurements are body measurements in inches.</li>
        <li>Chest: around the fullest part of your chest.</li>
        <li>Waist: around your natural waistline.</li>
        <li>Length: from the highest point of the shoulder to the hem.</li>
        <li>If you are between sizes, size up for a relaxed fit or down for a closer fit. Each product page has its own fit notes.</li>
      </ul>
    </div>
  );
}

export function SizeTable() {
  const rows = [['XS', '34–36', '28–30', '26'], ['S', '36–38', '30–32', '27'], ['M', '38–40', '32–34', '28'], ['L', '40–42', '34–36', '29'], ['XL', '42–44', '36–38', '30'], ['XXL', '44–46', '38–40', '31']];
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <caption className="sr-only">Body measurements in inches by size</caption>
        <thead>
          <tr className="border-b border-[#8A8577]">
            {['Size', 'Chest (in)', 'Waist (in)', 'Length (in)'].map(h => <th key={h} scope="col" className="text-left py-2 pr-4 font-medium">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map(([size, chest, waist, length]) => (
            <tr key={size} className="border-b border-[#AAA394]/20">
              <th scope="row" className="text-left py-2 pr-4 font-medium">{size}</th>
              <td className="py-2 pr-4">{chest}</td>
              <td className="py-2 pr-4">{waist}</td>
              <td className="py-2">{length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ===== Request helpers =====
// When a backend endpoint is configured the form posts to it; until then it opens a pre-filled
// email to the right address so the request still reaches a person.
async function sendRequest(endpoint: string | undefined, payload: Record<string, string>, email: { to: string; subject: string; body: string }): Promise<'sent' | 'mail' | 'unavailable'> {
  if (endpoint) {
    const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!res.ok) throw new Error(`Request failed (${res.status})`);
    return 'sent';
  }
  const href = mailtoHref(email.to, email.subject, email.body);
  if (!href) return 'unavailable';
  window.location.href = href;
  return 'mail';
}

const inputClass = 'w-full px-3 py-2.5 border border-[#8A8577] rounded-sm text-sm bg-white/70 focus:border-[#214C9A]';

function Field({ label, children, hint, required }: { label: string; children: (id: string, describedBy?: string) => ReactNode; hint?: string; required?: boolean }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="text-xs font-medium text-[#303238] mb-1.5 block">{label}{required && <span aria-hidden="true"> *</span>}</label>
      {children(id, hint ? `${id}-hint` : undefined)}
      {hint && <p id={`${id}-hint`} className="text-xs text-[#6B665B] mt-1">{hint}</p>}
    </div>
  );
}

// ===== Data Request / Deletion =====
export function DataRequestPage() {
  const { deleteLocalData, showToast } = useStore();
  const [form, setForm] = useState({ name: '', email: '', type: 'deletion', details: '', confirm: false });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'mail' | 'unavailable' | 'error'>('idle');
  const [confirmingLocal, setConfirmingLocal] = useState(false);
  const types: Record<string, string> = {
    deletion: 'Delete my personal data',
    access: 'Send me a summary of my personal data',
    correction: 'Correct or update my data',
    withdraw: 'Withdraw consent / stop marketing',
    nominate: 'Nominate someone to act for me',
    grievance: 'Complaint about how my data is handled',
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    const body = `Request: ${types[form.type]}\nName: ${form.name}\nEmail on account/orders: ${form.email}\n\nDetails:\n${form.details || '-'}\n\nI confirm I am the person this data is about, or am authorised to act for them.`;
    try {
      const result = await sendRequest(import.meta.env.VITE_PRIVACY_REQUEST_ENDPOINT, { ...form, confirm: String(form.confirm), requestType: types[form.type] }, { to: BUSINESS.privacyEmail, subject: `Data request: ${types[form.type]}`, body });
      setStatus(result);
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 text-[#303238]">
      <h1 className="text-3xl font-semibold tracking-[-0.02em] mb-3 text-[#151515]">Your data & deletion</h1>
      <p className="text-sm leading-relaxed mb-10">You can ask us to delete, correct or give you a summary of your personal data, or withdraw consent, at any time. See our <Link to="/privacy" className="text-[#214C9A] underline">Privacy Policy</Link> for details.</p>

      <section aria-labelledby="local-data" className="mb-12 p-5 bg-white/60 border border-[#AAA394]/20 rounded-sm">
        <h2 id="local-data" className="text-lg font-semibold text-[#151515] mb-2">Delete what this site stored in your browser</h2>
        <p className="text-sm leading-relaxed mb-4">This clears your cookie choice and any cart, wishlist, sign-in or preview orders held in this browser. It takes effect straight away.</p>
        {!confirmingLocal ? (
          <button type="button" onClick={() => setConfirmingLocal(true)} className="px-5 py-2.5 border border-red-700 text-red-700 text-sm font-medium rounded-sm hover:bg-red-50">Delete data in this browser</button>
        ) : (
          <div role="alertdialog" aria-labelledby="confirm-local" className="flex flex-wrap items-center gap-3">
            <p id="confirm-local" className="text-sm font-medium w-full">Delete everything this site stored in this browser?</p>
            <button type="button" autoFocus onClick={() => { deleteLocalData(); setConfirmingLocal(false); showToast('Data stored in this browser has been deleted', 'success'); }} className="px-5 py-2.5 bg-red-700 text-white text-sm font-medium rounded-sm hover:bg-red-800">Yes, delete it</button>
            <button type="button" onClick={() => setConfirmingLocal(false)} className="px-5 py-2.5 border border-[#8A8577] text-sm font-medium rounded-sm">Cancel</button>
          </div>
        )}
      </section>

      <section aria-labelledby="request-form">
        <h2 id="request-form" className="text-lg font-semibold text-[#151515] mb-2">Request about data we hold</h2>
        <p className="text-sm leading-relaxed mb-6">For account, order or marketing data. We may ask you to confirm your identity, and we reply within [30] days. Tax law requires us to keep invoices for a set period even if you ask us to delete your account. We'll tell you if that applies.</p>
        <form onSubmit={submit} className="space-y-5" noValidate={false}>
          <Field label="Type of request" required>{(id) => (
            <select id={id} value={form.type} onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))} className={inputClass}>
              {Object.entries(types).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          )}</Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full name" required>{(id) => <input id={id} type="text" required autoComplete="name" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} className={inputClass} />}</Field>
            <Field label="Email used with us" required hint="So we can find your data and reply.">{(id, d) => <input id={id} type="email" required autoComplete="email" aria-describedby={d} value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} className={inputClass} />}</Field>
          </div>
          <Field label="Details (optional)">{(id) => <textarea id={id} rows={4} value={form.details} onChange={(e) => setForm(f => ({ ...f, details: e.target.value }))} className={`${inputClass} resize-y`} />}</Field>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" required checked={form.confirm} onChange={(e) => setForm(f => ({ ...f, confirm: e.target.checked }))} className="w-4 h-4 mt-0.5" />
            <span>I am the person this data is about, or I am authorised to act for them.</span>
          </label>
          <button type="submit" disabled={status === 'sending'} className="px-6 py-3 bg-[#151515] text-white text-sm font-semibold rounded-sm hover:bg-[#303238] disabled:opacity-60">Send request</button>
          <div role="status" aria-live="polite" className="text-sm">
            {status === 'sent' && <p className="text-green-800">Request received. We'll reply to {form.email}.</p>}
            {status === 'mail' && <p>Your email app should open with the request filled in. Please press send there.</p>}
            {status === 'unavailable' && <p className="text-red-700">Online requests aren't set up yet in this preview, and the privacy email address hasn't been added. Please use the contact details below once they're published.</p>}
            {status === 'error' && <p className="text-red-700">Sorry, the request couldn't be sent. Please try again or email {BUSINESS.privacyEmail}.</p>}
          </div>
        </form>
      </section>
      <ContactBlock />
    </div>
  );
}

// ===== Unsubscribe =====
// Linked from the footer of every marketing email: {site}/#/unsubscribe?email=...&token=...
export function UnsubscribePage() {
  const [params] = useSearchParams();
  const [email, setEmail] = useState(params.get('email') || '');
  const token = params.get('token') || '';
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'mail' | 'unavailable' | 'error'>('idle');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      setStatus(await sendRequest(import.meta.env.VITE_UNSUBSCRIBE_ENDPOINT, { email, token }, { to: BUSINESS.privacyEmail, subject: 'Unsubscribe from marketing emails', body: `Please remove ${email} from all Kyveron marketing emails.` }));
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 text-[#303238]">
      <h1 className="text-2xl font-semibold tracking-[-0.02em] mb-3 text-[#151515]">Unsubscribe from marketing emails</h1>
      <p className="text-sm leading-relaxed mb-6">We'll stop sending you offers and news. You'll still get emails about orders you place, such as dispatch and refund updates.</p>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Email address" required>{(id) => <input id={id} type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />}</Field>
        <button type="submit" disabled={status === 'sending'} className="w-full py-3 bg-[#151515] text-white text-sm font-semibold rounded-sm hover:bg-[#303238] disabled:opacity-60">Unsubscribe</button>
        <div role="status" aria-live="polite" className="text-sm">
          {status === 'sent' && <p className="text-green-800">Done. {email} won't receive marketing emails from us.</p>}
          {status === 'mail' && <p>Your email app should open with the request filled in. Please press send there.</p>}
          {status === 'unavailable' && <p className="text-red-700">Marketing emails aren't being sent yet, so there's nothing to unsubscribe from. This page will work once the email service is connected.</p>}
          {status === 'error' && <p className="text-red-700">Sorry, that didn't work. Please try again.</p>}
        </div>
      </form>
    </div>
  );
}

// ===== Credits & licences =====
export function CreditsPage() {
  const items = [
    { what: 'Inter typeface', who: 'The Inter Project Authors', licence: 'SIL Open Font License 1.1', note: 'Hosted with the site (self-hosted).' },
    { what: 'Lucide icons', who: 'Lucide contributors', licence: 'ISC License', note: 'Bundled with the site.' },
    { what: 'React, React Router, Framer Motion, Tailwind CSS', who: 'Their respective authors', licence: 'MIT License', note: 'Bundled with the site.' },
    { what: 'Product and lifestyle images', who: 'AI-generated with Qwen (Alibaba Cloud)', licence: '[Confirm usage rights under the Qwen terms of service]', note: 'Illustrative only: they are not photographs of the actual garments. They will be replaced with photography Kyveron owns or has licensed.' },
  ];
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 text-[#303238]">
      <h1 className="text-3xl font-semibold tracking-[-0.02em] mb-6 text-[#151515]">Fonts, icons & image credits</h1>
      <ul className="space-y-4">
        {items.map(i => (
          <li key={i.what} className="p-4 bg-white/60 border border-[#AAA394]/20 rounded-sm text-sm">
            <p className="font-semibold text-[#151515]">{i.what}</p>
            <p>{i.who} · {i.licence}</p>
            <p className="text-[#6B665B] mt-1">{i.note}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

