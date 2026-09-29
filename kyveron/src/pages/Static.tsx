import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Reveal } from '../components/Layout';
import { IMAGES } from '../lib/data';
import { Mail, Phone, Clock, Send, Building2 } from 'lucide-react';
import { useState, useId } from 'react';
import { useDynamic } from '../lib/dynamicStore';
import { BUSINESS, mailtoHref } from '../lib/business';

// ===== About Page =====
export function AboutPage() {
  return (
    <div>
      <section className="relative h-[60vh] min-h-[400px] overflow-hidden">
        <img src={IMAGES.hero} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-[#151515]/60" />
        <div className="absolute inset-0 flex items-center justify-center text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl lg:text-5xl font-semibold text-white tracking-[-0.02em] mb-4">Our Story</h1>
            <p className="text-[#CFCAC0] max-w-lg mx-auto">Daily wear and sportswear, designed with intention.</p>
          </motion.div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <Reveal>
          <div className="prose prose-sm max-w-none space-y-6 text-[#303238] leading-relaxed">
            <h2 className="text-2xl font-semibold text-[#151515] tracking-[-0.02em]">Built on Intention</h2>
            <p>Kyveron makes daily wear and sportswear for people who value considered design and clothes that are honest about what they are.</p>
            <p>We make deliberate choices about each piece, from the weight and feel of the fabric to where the seams sit. We would rather make fewer things well than follow every trend.</p>

            <h2 className="text-2xl font-semibold text-[#151515] tracking-[-0.02em] pt-6">What we tell you</h2>
            <p>Every product page lists the fabric and its weight in GSM, the fit, care instructions and the country of origin, so you know what you are buying before you buy it.</p>
            <p className="text-sm text-[#6B665B] italic">[Add verified details about how and where Kyveron garments are made, and any certifications, before publishing. Only include claims you can evidence.]</p>
          </div>
        </Reveal>
      </section>

      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Reveal>
            <div className="aspect-[4/3] overflow-hidden rounded-sm">
              <img src={IMAGES.brandStory} alt="Kyveron editorial image (AI-generated illustration)" className="w-full h-full object-cover" loading="lazy" />
            </div>
          </Reveal>
          <Reveal delay={200}>
            <div className="aspect-[4/3] overflow-hidden rounded-sm">
              <img src={IMAGES.blackTee.detail} alt="Close-up of the Obsidian Performance Tee fabric (AI-generated illustration)" className="w-full h-full object-cover" loading="lazy" />
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

// ===== Contact Page =====
export function ContactPage() {
  const empty = { name: '', email: '', phone: '', orderNumber: '', category: 'General enquiry', message: '' };
  const [formData, setFormData] = useState(empty);
  const [status, setStatus] = useState<'idle' | 'mail' | 'unavailable'>('idle');
  const ids = { name: useId(), email: useId(), phone: useId(), order: useId(), category: useId(), message: useId() };
  const input = 'w-full px-3 py-2.5 border border-[#8A8577] rounded-sm text-sm bg-white/70 focus:border-[#214C9A]';
  const label = 'text-xs font-medium text-[#303238] mb-1.5 block';
  const set = (k: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setFormData(p => ({ ...p, [k]: e.target.value }));

  // No message backend exists yet, so the form opens a pre-filled email rather than pretending to send.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const body = [`Name: ${formData.name}`, `Email: ${formData.email}`, formData.phone && `Mobile: ${formData.phone}`, formData.orderNumber && `Order: ${formData.orderNumber}`, '', formData.message].filter(v => v !== '' && v !== undefined).join('\n');
    const href = mailtoHref(BUSINESS.supportEmail, `${formData.category}${formData.orderNumber ? ` – ${formData.orderNumber}` : ''}`, body);
    if (!href) { setStatus('unavailable'); return; }
    window.location.href = href;
    setStatus('mail');
  };

  const details = [
    { icon: Mail, title: 'Email', lines: [BUSINESS.supportEmail] },
    { icon: Phone, title: 'Phone', lines: [BUSINESS.supportPhone] },
    { icon: Clock, title: 'Service hours', lines: [BUSINESS.serviceHours] },
    { icon: Building2, title: 'Seller', lines: [BUSINESS.legalName, BUSINESS.registeredAddress, `GSTIN: ${BUSINESS.gstin}`] },
  ];

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <Reveal>
        <div className="text-center mb-12">
          <h1 className="text-3xl lg:text-4xl font-semibold tracking-[-0.02em] mb-3">Contact Us</h1>
          <p className="text-[#6B665B] text-sm max-w-md mx-auto">Have a question about your order, our products, or anything else? We're here to help.</p>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 max-w-5xl mx-auto">
        <Reveal>
          <div className="space-y-4">
            {details.map(d => (
              <div key={d.title} className="p-5 bg-white/60 rounded-sm border border-[#AAA394]/20">
                <div className="flex items-center gap-3 mb-2">
                  <d.icon size={18} className="text-[#214C9A]" aria-hidden="true" />
                  <h2 className="text-sm font-semibold">{d.title}</h2>
                </div>
                {d.lines.map(l => <p key={l} className="text-sm text-[#303238] break-words">{l}</p>)}
              </div>
            ))}
            <div className="p-5 bg-white/60 rounded-sm border border-[#AAA394]/20">
              <h2 className="text-sm font-semibold mb-2">Grievance Officer</h2>
              <p className="text-sm text-[#303238]">{BUSINESS.grievanceOfficer.name}</p>
              <p className="text-sm text-[#303238] break-words">{BUSINESS.grievanceOfficer.email} · {BUSINESS.grievanceOfficer.phone}</p>
              <p className="text-xs text-[#6B665B] mt-1">Complaints are acknowledged within 48 hours.</p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={200} className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white/60 rounded-sm border border-[#AAA394]/20 p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor={ids.name} className={label}>Name <span aria-hidden="true">*</span></label>
                <input id={ids.name} type="text" required autoComplete="name" value={formData.name} onChange={set('name')} className={input} />
              </div>
              <div>
                <label htmlFor={ids.email} className={label}>Email <span aria-hidden="true">*</span></label>
                <input id={ids.email} type="email" required autoComplete="email" value={formData.email} onChange={set('email')} className={input} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor={ids.phone} className={label}>Mobile (optional)</label>
                <input id={ids.phone} type="tel" autoComplete="tel" value={formData.phone} onChange={set('phone')} className={input} />
              </div>
              <div>
                <label htmlFor={ids.order} className={label}>Order number (if you have one)</label>
                <input id={ids.order} type="text" value={formData.orderNumber} onChange={set('orderNumber')} className={input} placeholder="KYV-..." />
              </div>
            </div>
            <div>
              <label htmlFor={ids.category} className={label}>Topic</label>
              <select id={ids.category} value={formData.category} onChange={set('category')} className={input}>
                {['General enquiry', 'Order issue', 'Return or exchange', 'Product question', 'Payment issue', 'Complaint'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor={ids.message} className={label}>Message <span aria-hidden="true">*</span></label>
              <textarea id={ids.message} required rows={5} value={formData.message} onChange={set('message')} className={`${input} resize-y`} />
            </div>
            <p className="text-xs text-[#6B665B]">We use these details only to reply to you. See our <Link to="/privacy" className="text-[#214C9A] underline">Privacy Policy</Link>.</p>
            <button type="submit" className="inline-flex items-center gap-2 px-6 py-3 bg-[#151515] text-white text-sm font-semibold rounded-sm hover:bg-[#303238] transition-colors">
              <Send size={16} aria-hidden="true" /> Write to us
            </button>
            <div role="status" aria-live="polite" className="text-sm">
              {status === 'mail' && <p>Your email app should open with your message filled in. Please press send there.</p>}
              {status === 'unavailable' && <p className="text-red-700">The support email address hasn't been published yet, so this form can't send. Nothing was saved.</p>}
            </div>
          </form>
        </Reveal>
      </div>
    </div>
  );
}

// ===== Journal Page =====
export function JournalPage() {
  const { state } = useDynamic();
  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <Reveal>
        <div className="text-center mb-12">
          <h1 className="text-3xl lg:text-4xl font-semibold tracking-[-0.02em] mb-3">Journal</h1>
          <p className="text-[#6B665B] text-sm">Stories, guides, and insights from the Kyveron workshop.</p>
        </div>
      </Reveal>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {state.journalPosts.map((post: any, i: number) => (
          <Reveal key={post.id} delay={i * 150}>
            <article className="group">
              <div className="aspect-[16/10] overflow-hidden rounded-sm mb-4">
                <img src={post.coverImage} alt="" className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" loading="lazy" />
              </div>
              <div className="flex items-center gap-2 text-xs text-[#6B665B] mb-2">
                <span>{new Date(post.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                <span>·</span>
                <span>{post.tags.join(', ')}</span>
              </div>
              <h2 className="text-lg font-semibold mb-2 group-hover:text-[#214C9A] transition-colors">{post.title}</h2>
              <p className="text-sm text-[#303238] leading-relaxed">{post.excerpt}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

// ===== Returns Page =====
export function ReturnsPage() {
  const { state } = useDynamic();
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <Reveal>
        <h1 className="text-3xl font-semibold tracking-[-0.02em] mb-8">Returns & Exchanges</h1>
        <div className="prose prose-sm max-w-none space-y-6 text-[#303238] leading-relaxed">
          <div className="p-5 bg-white/60 rounded-sm border border-[#AAA394]/10">
            <h2 className="text-lg font-semibold text-[#151515] mb-3">Return Eligibility</h2>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Items can be returned within {state.settings.returnWindowDays} days of delivery.</li>
              <li>Items must be unused, unwashed, with original tags attached.</li>
              <li>Innerwear and items with a removed hygiene seal can't be returned. The product page says so before you buy.</li>
              <li>Discounted items can be returned on the same terms as full-price items.</li>
              <li>Return pickup is free, and there are no return or restocking fees.</li>
            </ul>
          </div>
          <div className="p-5 bg-white/60 rounded-sm border border-[#AAA394]/10">
            <h2 className="text-lg font-semibold text-[#151515] mb-3">How to Initiate a Return</h2>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Contact customer care with your order number and the items you want to return.</li>
              <li>Choose a refund or a size exchange.</li>
              <li>We confirm within 2 business days and arrange a free pickup.</li>
              <li>We check the item within 2 business days of receiving it and start your refund the same day. Banks usually take 5–7 business days to show it.</li>
            </ol>
          </div>
          <div className="p-5 bg-white/60 rounded-sm border border-[#AAA394]/10">
            <h2 className="text-lg font-semibold text-[#151515] mb-3">Exchange Policy</h2>
            <p className="text-sm">Size exchanges are subject to availability. If the requested size is not available, a refund will be issued instead. Exchange shipments are free of charge.</p>
          </div>
          <p className="text-sm">Full details are in our <Link to="/refund-policy" className="text-[#214C9A] underline">Refund Policy</Link>.</p>
          <div className="pt-4">
            <Link to="/contact" className="inline-flex items-center gap-2 px-6 py-3 bg-[#151515] text-white text-sm font-medium rounded-sm hover:bg-[#303238] transition-colors">Contact Support</Link>
          </div>
        </div>
      </Reveal>
    </div>
  );
}

// ===== FAQ Page =====
export function FAQPage() {
  const { state } = useDynamic();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const faqs = state.faqs.map(f => ({ q: f.question, a: f.answer }));

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <Reveal>
        <div className="text-center mb-10">
          <h1 className="text-3xl font-semibold tracking-[-0.02em] mb-3">Frequently Asked Questions</h1>
          <p className="text-sm text-[#6B665B]">Find answers to common questions about orders, shipping, and more.</p>
        </div>
      </Reveal>
      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <Reveal key={i} delay={i * 60}>
            <div className="border border-[#AAA394]/10 rounded-sm overflow-hidden">
              <button onClick={() => setOpenIndex(openIndex === i ? null : i)} aria-expanded={openIndex === i} aria-controls={`faq-panel-${i}`} id={`faq-button-${i}`} className="w-full flex items-center justify-between p-4 text-left hover:bg-white/40 transition-colors">
                <span className="text-sm font-medium pr-4">{faq.q}</span>
                <motion.span aria-hidden="true" animate={{ rotate: openIndex === i ? 180 : 0 }} className="text-[#6B665B] flex-shrink-0">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </motion.span>
              </button>
              <motion.div id={`faq-panel-${i}`} role="region" aria-labelledby={`faq-button-${i}`} hidden={openIndex !== i} initial={false} animate={{ height: openIndex === i ? 'auto' : 0, opacity: openIndex === i ? 1 : 0 }} className="overflow-hidden">
                <p className="px-4 pb-4 text-sm text-[#303238] leading-relaxed">{faq.a}</p>
              </motion.div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

// Policy pages live in ./Legal.tsx; the admin panel in ./Admin.tsx.
