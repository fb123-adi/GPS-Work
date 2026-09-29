import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Reveal } from '../components/Layout';
import { IMAGES } from '../lib/data';
import { Mail, Phone, MessageCircle, Clock, Send } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '../lib/store';
import { useDynamic } from '../lib/dynamicStore';

// ===== About Page =====
export function AboutPage() {
  return (
    <div>
      <section className="relative h-[60vh] min-h-[400px] overflow-hidden">
        <img src={IMAGES.hero} alt="Kyveron brand story - premium apparel craftsmanship" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-[#151515]/60" />
        <div className="absolute inset-0 flex items-center justify-center text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl lg:text-5xl font-semibold text-white tracking-[-0.02em] mb-4">Our Story</h1>
            <p className="text-[#AAA394] max-w-lg mx-auto">Premium Indian apparel, crafted with intention.</p>
          </motion.div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <Reveal>
          <div className="prose prose-sm max-w-none space-y-6 text-[#303238] leading-relaxed">
            <h2 className="text-2xl font-semibold text-[#151515] tracking-[-0.02em]">Built on Intention</h2>
            <p>Kyveron was founded on a simple belief: premium apparel should be defined by quality, not excess. We create garments for people who value considered design, honest materials, and construction that lasts.</p>
            <p>Every piece in our collection is the result of deliberate choices—from the weight and hand-feel of our fabrics to the placement of every seam. We don't follow trends. We build garments that perform when you need them to and feel considered when you wear them.</p>

            <h2 className="text-2xl font-semibold text-[#151515] tracking-[-0.02em] pt-6">Product Philosophy</h2>
            <p>We approach each garment as an engineering problem with aesthetic constraints. Our performance collection uses technical fabrics selected for moisture management, durability, and movement. Our daily luxury collection prioritises hand-feel, drape, and versatility.</p>
            <p>We test every material for pilling resistance, colour fastness, shrinkage, and long-term wear. Only fabrics that meet our standards move forward. Every garment is constructed with reinforced stress points, clean finishing, and attention to the details that separate considered apparel from the rest.</p>

            <h2 className="text-2xl font-semibold text-[#151515] tracking-[-0.02em] pt-6">Quality Standards</h2>
            <p>We believe in transparency about what goes into our products. We specify fabric weight in GSM, detail our construction methods, and provide clear care instructions. We stand behind every garment we make.</p>
            <p className="text-sm text-[#AAA394] italic">Note: This page is a placeholder. Business claims, certifications, and heritage statements should be reviewed for accuracy before publication.</p>
          </div>
        </Reveal>
      </section>

      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Reveal>
            <div className="aspect-[4/3] overflow-hidden rounded-sm">
              <img src={IMAGES.brandStory} alt="Premium fabric selection and craftsmanship workspace" className="w-full h-full object-cover" loading="lazy" />
            </div>
          </Reveal>
          <Reveal delay={200}>
            <div className="aspect-[4/3] overflow-hidden rounded-sm">
              <img src={IMAGES.blackTee.detail} alt="Close-up of premium cotton fabric texture and quality stitching" className="w-full h-full object-cover" loading="lazy" />
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

// ===== Contact Page =====
export function ContactPage() {
  const { showToast } = useStore();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', orderNumber: '', category: 'general', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Message sent! We\'ll get back to you within 24 hours.', 'success');
    setFormData({ name: '', email: '', phone: '', orderNumber: '', category: 'general', message: '' });
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <Reveal>
        <div className="text-center mb-12">
          <h1 className="text-3xl lg:text-4xl font-semibold tracking-[-0.02em] mb-3">Contact Us</h1>
          <p className="text-[#AAA394] text-sm max-w-md mx-auto">Have a question about your order, our products, or anything else? We're here to help.</p>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 max-w-5xl mx-auto">
        {/* Contact Info */}
        <Reveal>
          <div className="space-y-6">
            <div className="p-5 bg-white/60 rounded-sm border border-[#AAA394]/10">
              <div className="flex items-center gap-3 mb-2">
                <Mail size={18} className="text-[#214C9A]" />
                <h3 className="text-sm font-semibold">Email</h3>
              </div>
              <p className="text-sm text-[#303238]">support@kyveron.in</p>
              <p className="text-xs text-[#AAA394] mt-1">Response within 24 hours</p>
            </div>
            <div className="p-5 bg-white/60 rounded-sm border border-[#AAA394]/10">
              <div className="flex items-center gap-3 mb-2">
                <MessageCircle size={18} className="text-[#214C9A]" />
                <h3 className="text-sm font-semibold">WhatsApp</h3>
              </div>
              <p className="text-sm text-[#303238]">+91 98765 43210</p>
              <p className="text-xs text-[#AAA394] mt-1">Mon–Sat, 10am–7pm IST</p>
            </div>
            <div className="p-5 bg-white/60 rounded-sm border border-[#AAA394]/10">
              <div className="flex items-center gap-3 mb-2">
                <Clock size={18} className="text-[#214C9A]" />
                <h3 className="text-sm font-semibold">Service Hours</h3>
              </div>
              <p className="text-sm text-[#303238]">Monday – Saturday</p>
              <p className="text-sm text-[#303238]">10:00 AM – 7:00 PM IST</p>
            </div>
          </div>
        </Reveal>

        {/* Contact Form */}
        <Reveal delay={200} className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white/60 rounded-sm border border-[#AAA394]/10 p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-[#303238] mb-1.5 block">Name *</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2.5 border border-[#AAA394]/30 rounded-sm text-sm focus:outline-none focus:border-[#214C9A]" />
              </div>
              <div>
                <label className="text-xs font-medium text-[#303238] mb-1.5 block">Email *</label>
                <input type="email" required value={formData.email} onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))} className="w-full px-3 py-2.5 border border-[#AAA394]/30 rounded-sm text-sm focus:outline-none focus:border-[#214C9A]" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-[#303238] mb-1.5 block">Mobile</label>
                <input type="tel" value={formData.phone} onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))} className="w-full px-3 py-2.5 border border-[#AAA394]/30 rounded-sm text-sm focus:outline-none focus:border-[#214C9A]" />
              </div>
              <div>
                <label className="text-xs font-medium text-[#303238] mb-1.5 block">Order Number (if applicable)</label>
                <input type="text" value={formData.orderNumber} onChange={(e) => setFormData(p => ({ ...p, orderNumber: e.target.value }))} className="w-full px-3 py-2.5 border border-[#AAA394]/30 rounded-sm text-sm focus:outline-none focus:border-[#214C9A]" placeholder="KYV-..." />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-[#303238] mb-1.5 block">Category</label>
              <select value={formData.category} onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))} className="w-full px-3 py-2.5 border border-[#AAA394]/30 rounded-sm text-sm focus:outline-none focus:border-[#214C9A]">
                <option value="general">General Enquiry</option>
                <option value="order">Order Issue</option>
                <option value="return">Return/Exchange</option>
                <option value="product">Product Question</option>
                <option value="payment">Payment Issue</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-[#303238] mb-1.5 block">Message *</label>
              <textarea required rows={5} value={formData.message} onChange={(e) => setFormData(p => ({ ...p, message: e.target.value }))} className="w-full px-3 py-2.5 border border-[#AAA394]/30 rounded-sm text-sm focus:outline-none focus:border-[#214C9A] resize-none" />
            </div>
            <button type="submit" className="inline-flex items-center gap-2 px-6 py-3 bg-[#151515] text-white text-sm font-semibold rounded-sm hover:bg-[#303238] transition-colors">
              <Send size={16} /> Send Message
            </button>
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
          <p className="text-[#AAA394] text-sm">Stories, guides, and insights from the Kyveron workshop.</p>
        </div>
      </Reveal>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {state.journalPosts.map((post: any, i: number) => (
          <Reveal key={post.id} delay={i * 150}>
            <article className="group">
              <div className="aspect-[16/10] overflow-hidden rounded-sm mb-4">
                <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" loading="lazy" />
              </div>
              <div className="flex items-center gap-2 text-xs text-[#AAA394] mb-2">
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
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <Reveal>
        <h1 className="text-3xl font-semibold tracking-[-0.02em] mb-8">Returns & Exchanges</h1>
        <div className="prose prose-sm max-w-none space-y-6 text-[#303238] leading-relaxed">
          <div className="p-5 bg-white/60 rounded-sm border border-[#AAA394]/10">
            <h2 className="text-lg font-semibold text-[#151515] mb-3">Return Eligibility</h2>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Items can be returned within 7 days of delivery.</li>
              <li>Items must be unused, unwashed, with original tags attached.</li>
              <li>Innerwear, accessories, and sale items are not eligible for return.</li>
              <li>Items with visible signs of wear, damage, or alteration will not be accepted.</li>
            </ul>
          </div>
          <div className="p-5 bg-white/60 rounded-sm border border-[#AAA394]/10">
            <h2 className="text-lg font-semibold text-[#151515] mb-3">How to Initiate a Return</h2>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Go to your Account → Orders → Select the order.</li>
              <li>Click "Request Return" on the item you wish to return.</li>
              <li>Select a reason and choose refund or exchange.</li>
              <li>Our team will review and approve within 48 hours.</li>
              <li>Once approved, schedule a pickup or ship the item back.</li>
              <li>Refund will be processed within 5-7 business days after we receive the item.</li>
            </ol>
          </div>
          <div className="p-5 bg-white/60 rounded-sm border border-[#AAA394]/10">
            <h2 className="text-lg font-semibold text-[#151515] mb-3">Exchange Policy</h2>
            <p className="text-sm">Size exchanges are subject to availability. If the requested size is not available, a refund will be issued instead. Exchange shipments are free of charge.</p>
          </div>
          <p className="text-xs text-[#AAA394] italic">This policy is a placeholder. Please have your returns policy reviewed by a qualified legal professional before publishing.</p>
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
          <p className="text-sm text-[#AAA394]">Find answers to common questions about orders, shipping, and more.</p>
        </div>
      </Reveal>
      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <Reveal key={i} delay={i * 60}>
            <div className="border border-[#AAA394]/10 rounded-sm overflow-hidden">
              <button onClick={() => setOpenIndex(openIndex === i ? null : i)} className="w-full flex items-center justify-between p-4 text-left hover:bg-white/40 transition-colors">
                <span className="text-sm font-medium pr-4">{faq.q}</span>
                <motion.span animate={{ rotate: openIndex === i ? 180 : 0 }} className="text-[#AAA394] flex-shrink-0">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </motion.span>
              </button>
              <motion.div initial={false} animate={{ height: openIndex === i ? 'auto' : 0, opacity: openIndex === i ? 1 : 0 }} className="overflow-hidden">
                <p className="px-4 pb-4 text-sm text-[#303238] leading-relaxed">{faq.a}</p>
              </motion.div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

// ===== Legal Pages =====
export function LegalPage({ type }: { type: string }) {
  const titles: Record<string, string> = {
    terms: 'Terms & Conditions',
    privacy: 'Privacy Policy',
    'cookie-policy': 'Cookie Policy',
    'shipping-policy': 'Shipping Policy',
    'refund-policy': 'Refund Policy',
    'size-guide': 'Size Guide',
  };

  const content: Record<string, string[]> = {
    terms: [
      'These Terms & Conditions govern your use of the Kyveron website and purchase of products.',
      'By placing an order, you confirm that you are at least 18 years of age and have the legal capacity to enter into binding contracts.',
      'All product prices are displayed in Indian Rupees (INR) and include applicable taxes unless stated otherwise.',
      'We reserve the right to modify prices, product descriptions, and availability without prior notice.',
      'Orders are subject to product availability and payment verification.',
      'We reserve the right to cancel any order at our discretion, including in cases of suspected fraud or pricing errors.',
    ],
    privacy: [
      'This Privacy Policy describes how Kyveron collects, uses, and protects your personal information.',
      'We collect information necessary to process your orders: name, email, phone number, shipping address, and payment details.',
      'Payment information is processed securely through Razorpay. We do not store complete card numbers or CVV codes.',
      'We use your information to process orders, send order updates, and (with your consent) marketing communications.',
      'You can request access to, correction of, or deletion of your personal data by contacting us.',
      'We do not sell your personal information to third parties.',
    ],
    'shipping-policy': [
      'Orders are processed within 1-2 business days after payment confirmation.',
      'Standard delivery takes 3-5 business days for metro cities and 5-7 business days for other locations.',
      'Free shipping is available on orders above ₹999.',
      'Shipping charges for orders below ₹999: ₹99 flat rate.',
      'Cash on Delivery orders may incur an additional handling fee of ₹49.',
      'Delivery timelines are estimates and may vary based on location and courier partner availability.',
    ],
    'refund-policy': [
      'Refunds are processed within 5-7 business days after we receive and inspect the returned item.',
      'Refunds are issued to the original payment method.',
      'For prepaid orders, the full amount including shipping charges will be refunded.',
      'For COD orders, refunds will be transferred to your bank account or UPI ID.',
      'Shipping charges are not refundable unless the return is due to our error (wrong item, damaged product).',
      'Discount amounts are adjusted proportionally in case of partial returns.',
    ],
    'cookie-policy': [
      'We use cookies to enhance your browsing experience and analyse website traffic.',
      'Necessary cookies are required for the website to function and cannot be disabled.',
      'Analytics cookies help us understand how visitors interact with our website.',
      'Marketing cookies are used to deliver relevant advertisements (only with your consent).',
      'You can manage your cookie preferences at any time through the cookie settings.',
      'Disabling certain cookies may affect website functionality.',
    ],
    'size-guide': [
      'All measurements are in inches. Measure yourself or a well-fitting garment for best results.',
      'Chest: Measure around the fullest part of your chest.',
      'Waist: Measure around your natural waistline.',
      'Length: Measure from the highest point of the shoulder to the desired hem.',
      'If you are between sizes, we recommend sizing up for a relaxed fit or sizing down for a closer fit.',
      'Product-specific fit notes are provided on each product page.',
    ],
  };

  const items = content[type] || content.terms;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <Reveal>
        <h1 className="text-3xl font-semibold tracking-[-0.02em] mb-3">{titles[type] || 'Legal'}</h1>
        <p className="text-xs text-[#AAA394] mb-8">Last updated: January 2025. Effective date: January 2025.</p>
        <div className="space-y-4">
          {items.map((item, i) => (
            <div key={i} className="p-4 bg-white/60 rounded-sm border border-[#AAA394]/10">
              <p className="text-sm text-[#303238] leading-relaxed">{item}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 p-4 bg-[#214C9A]/5 border border-[#214C9A]/20 rounded-sm">
          <p className="text-xs text-[#303238]"><strong>Important:</strong> This is placeholder legal content. All legal pages must be reviewed and customized by a qualified Indian lawyer before publication. Do not rely on this text for legal compliance.</p>
        </div>
        <div className="mt-8">
          <p className="text-sm text-[#303238] mb-2">For questions about this policy, contact us:</p>
          <p className="text-sm text-[#303238]">Email: legal@kyveron.in</p>
          <p className="text-sm text-[#303238]">Phone: +91 98765 43210</p>
        </div>
      </Reveal>
    </div>
  );
}

// Admin page moved to ./Admin.tsx
