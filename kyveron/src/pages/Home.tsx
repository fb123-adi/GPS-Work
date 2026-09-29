import { useState, useId } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Truck, Receipt, RotateCcw, Star } from 'lucide-react';
import { Reveal, ProductCard } from '../components/Layout';
import { useDynamic } from '../lib/dynamicStore';
import { MINIMUM_AGE } from '../lib/business';

export default function HomePage() {
  const { state, formatPrice } = useDynamic();
  const { homepage, products, reviews } = state;
  const featuredProducts = products.filter(p => p.isFeatured && p.isPublished).slice(0, 4);
  const newProducts = products.filter(p => p.isNew && p.isPublished);
  // Only reviews tied to a real purchase are shown; nothing is ever added for display.
  const verifiedReviews = reviews.filter(r => r.isVerified);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[90vh] min-h-[600px] max-h-[900px] overflow-hidden">
        <motion.div initial={{ scale: 1.1, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }} className="absolute inset-0">
          <img src={homepage.heroImage} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#151515]/80 via-[#151515]/50 to-[#151515]/10" />
        </motion.div>
        <div className="relative h-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
          <div className="max-w-xl">
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }} className="text-[#E4DFD5] text-sm font-medium uppercase tracking-wider mb-4">{homepage.heroBadge}</motion.p>
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.7, ease: [0.16, 1, 0.3, 1] }} className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-white leading-[1.1] tracking-[-0.02em] mb-6 whitespace-pre-line">
              {homepage.heroTitle}
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.6 }} className="text-[#E4DFD5] text-base lg:text-lg leading-relaxed mb-8 max-w-md">
              {homepage.heroSubtitle}
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.6 }} className="flex flex-wrap gap-4">
              <Link to="/shop" className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-[#151515] text-sm font-semibold rounded-sm hover:bg-[#F2EEE6] transition-colors duration-200">
                Shop Collection <ArrowRight size={16} />
              </Link>
              <Link to="/collections/core-performance" className="inline-flex items-center gap-2 px-7 py-3.5 border border-white/40 text-white text-sm font-medium rounded-sm hover:bg-white/10 transition-colors duration-200">
                Explore Performance
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Brand Values */}
      <section className="py-12 border-b border-[#AAA394]/20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <Reveal delay={0}>
              <div className="flex items-center gap-4">
                <Truck size={24} className="text-[#214C9A] flex-shrink-0" aria-hidden="true" />
                <div>
                  <p className="text-sm font-semibold">Free delivery</p>
                  <p className="text-xs text-[#6B665B]">On orders of {formatPrice(state.settings.freeShippingThreshold)} or more</p>
                </div>
              </div>
            </Reveal>
            <Reveal delay={100}>
              <div className="flex items-center gap-4">
                <RotateCcw size={24} className="text-[#214C9A] flex-shrink-0" aria-hidden="true" />
                <div>
                  <p className="text-sm font-semibold">Free returns</p>
                  <p className="text-xs text-[#6B665B]">Within {state.settings.returnWindowDays} days of delivery</p>
                </div>
              </div>
            </Reveal>
            <Reveal delay={200}>
              <div className="flex items-center gap-4">
                <Receipt size={24} className="text-[#214C9A] flex-shrink-0" aria-hidden="true" />
                <div>
                  <p className="text-sm font-semibold">Clear pricing</p>
                  <p className="text-xs text-[#6B665B]">GST included, no hidden fees</p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-16 lg:py-24">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="flex items-end justify-between mb-10">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#214C9A] mb-2">{homepage.featuredSubtitle}</p>
                  <h2 className="text-2xl lg:text-3xl font-semibold tracking-[-0.02em]">{homepage.featuredTitle}</h2>
                </div>
                <Link to="/shop" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-[#303238] hover:text-[#214C9A] transition-colors">
                  View All <ArrowRight size={14} />
                </Link>
              </div>
            </Reveal>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {featuredProducts.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Editorial Banner */}
      <section className="py-16 lg:py-24 bg-[#151515]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <Reveal>
              <div className="aspect-[4/5] overflow-hidden rounded-sm">
                <img src={homepage.performanceImage} alt="" className="w-full h-full object-cover" loading="lazy" />
              </div>
            </Reveal>
            <Reveal delay={200}>
              <div className="lg:pl-8">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#8FB0EA] mb-4">{homepage.performanceSubtitle}</p>
                <h2 className="text-3xl lg:text-4xl font-semibold text-white tracking-[-0.02em] mb-6 leading-tight whitespace-pre-line">
                  {homepage.performanceTitle}
                </h2>
                <p className="text-[#AAA394] leading-relaxed mb-8 max-w-md">
                  {homepage.performanceDescription}
                </p>
                <Link to="/collections/core-performance" className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-[#151515] text-sm font-semibold rounded-sm hover:bg-[#F2EEE6] transition-colors duration-200">
                  Explore Collection <ArrowRight size={16} />
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Brand Story */}
      <section className="py-16 lg:py-24">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <Reveal delay={200} className="order-2 lg:order-1">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#214C9A] mb-4">{homepage.storySubtitle}</p>
                <h2 className="text-3xl lg:text-4xl font-semibold tracking-[-0.02em] mb-6 leading-tight whitespace-pre-line">
                  {homepage.storyTitle}
                </h2>
                {homepage.storyParagraphs.map((para, i) => (
                  <p key={i} className="text-[#303238] leading-relaxed mb-6">{para}</p>
                ))}
                <Link to="/about" className="inline-flex items-center gap-2 text-sm font-medium text-[#151515] hover:text-[#214C9A] transition-colors">
                  Our Story <ArrowRight size={14} />
                </Link>
              </div>
            </Reveal>
            <Reveal className="order-1 lg:order-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="aspect-square overflow-hidden rounded-sm">
                  <img src={homepage.performanceImage} alt="" className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="aspect-square overflow-hidden rounded-sm mt-8">
                  <img src={products[0]?.images[1]?.url || products[0]?.images[0]?.url} alt="" className="w-full h-full object-cover" loading="lazy" />
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      {newProducts.length > 0 && (
        <section className="py-16 lg:py-24 bg-white/40">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="flex items-end justify-between mb-10">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#214C9A] mb-2">Just Dropped</p>
                  <h2 className="text-2xl lg:text-3xl font-semibold tracking-[-0.02em]">New Arrivals</h2>
                </div>
                <Link to="/shop?new=true" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-[#303238] hover:text-[#214C9A] transition-colors">
                  View All <ArrowRight size={14} />
                </Link>
              </div>
            </Reveal>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {newProducts.slice(0, 3).map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Reviews */}
      {verifiedReviews.length > 0 && (
        <section className="py-16 lg:py-24">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="text-center mb-12">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#214C9A] mb-2">From verified buyers</p>
                <h2 className="text-2xl lg:text-3xl font-semibold tracking-[-0.02em]">Customer Reviews</h2>
              </div>
            </Reveal>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {verifiedReviews.slice(0, 3).map((review, i) => (
                <Reveal key={review.id} delay={i * 120}>
                  <div className="p-6 bg-white/60 rounded-sm border border-[#AAA394]/10">
                    <div className="flex gap-0.5 mb-3" role="img" aria-label={`${review.rating} out of 5 stars`}>
                      {Array.from({ length: review.rating }).map((_, j) => <Star key={j} size={14} aria-hidden="true" className="fill-[#151515] text-[#151515]" />)}
                    </div>
                    <p className="text-sm text-[#303238] leading-relaxed mb-4">"{review.body}"</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium">{review.userName}</p>
                      <p className="text-xs text-[#6B665B]">Verified purchase</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter */}
      <section className="py-16 lg:py-24 bg-[#151515]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="max-w-lg mx-auto text-center">
              <h2 className="text-2xl lg:text-3xl font-semibold text-white tracking-[-0.02em] mb-4">{homepage.newsletterTitle}</h2>
              <p className="text-[#AAA394] text-sm mb-8">{homepage.newsletterSubtitle}</p>
              <NewsletterForm />
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

// Marketing sign-up: explicit opt-in, age confirmation and a clear note that it isn't live yet.
function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'unavailable' | 'error'>('idle');
  const emailId = useId(), consentId = useId();
  const endpoint = import.meta.env.VITE_NEWSLETTER_ENDPOINT;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!endpoint) { setStatus('unavailable'); return; }
    setStatus('sending');
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, consent: true, source: 'homepage', consentText: 'Marketing emails; 18+ confirmed' }) });
      setStatus(res.ok ? 'sent' : 'error');
    } catch {
      setStatus('error');
    }
  };

  return (
    <form onSubmit={submit} className="text-left space-y-3">
      <label htmlFor={emailId} className="sr-only">Email address</label>
      <div className="flex gap-3">
        <input id={emailId} type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email address" className="flex-1 min-w-0 px-4 py-3 bg-[#303238] border border-[#8A8577] text-white text-sm rounded-sm placeholder:text-[#AAA394] focus:border-[#F2EEE6] transition-colors" />
        <button type="submit" disabled={!consent || status === 'sending'} className="px-6 py-3 bg-white text-[#151515] text-sm font-semibold rounded-sm hover:bg-[#F2EEE6] transition-colors disabled:opacity-60 disabled:cursor-not-allowed">Subscribe</button>
      </div>
      <div className="flex items-start gap-2">
        <input id={consentId} type="checkbox" required checked={consent} onChange={(e) => setConsent(e.target.checked)} className="w-4 h-4 mt-0.5 accent-[#F2EEE6]" />
        <label htmlFor={consentId} className="text-xs text-[#CFCAC0]">I'd like marketing emails from Kyveron and I am {MINIMUM_AGE} or older. I can unsubscribe at any time. See the <Link to="/privacy" className="underline hover:text-white">Privacy Policy</Link>.</label>
      </div>
      <div role="status" aria-live="polite" className="text-xs">
        {status === 'sent' && <p className="text-[#F2EEE6]">You're subscribed. Every email has an unsubscribe link.</p>}
        {status === 'unavailable' && <p className="text-[#F2EEE6]">Newsletter sign-up isn't live yet in this preview. Your email was not saved.</p>}
        {status === 'error' && <p className="text-[#F2EEE6]">Sorry, that didn't work. Please try again.</p>}
      </div>
    </form>
  );
}
