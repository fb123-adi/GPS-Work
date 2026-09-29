import { useState, useEffect, useRef, useId } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Search, User, Heart, Menu, X, Minus, Plus, Trash2, Star, Check, AlertCircle, Info } from 'lucide-react';
import { useStore, MAX_QUANTITY } from '../lib/store';
import { useDynamic } from '../lib/dynamicStore';
import { BUSINESS } from '../lib/business';

// ===== Dialog behaviour =====
// Moves focus into the dialog, keeps Tab inside it, closes on Escape, locks page scroll and
// hands focus back to whatever opened it.
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function useDialog(isOpen: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;
    const opener = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';
    const focusFirst = requestAnimationFrame(() => {
      const first = ref.current?.querySelector<HTMLElement>(FOCUSABLE);
      (first ?? ref.current)?.focus();
    });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onCloseRef.current(); return; }
      if (e.key !== 'Tab' || !ref.current) return;
      const items = Array.from(ref.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) { e.preventDefault(); return; }
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(focusFirst);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      opener?.focus?.();
    };
  }, [isOpen]);

  return ref;
}

// ===== Header =====
export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const location = useLocation();
  const { state } = useStore();
  const cartCount = state.cart.items.reduce((sum, i) => sum + i.quantity, 0);
  const menuRef = useDialog(isMobileMenuOpen, () => setIsMobileMenuOpen(false));

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setIsMobileMenuOpen(false); }, [location]);

  const navLink = 'text-sm font-medium text-[#303238] hover:text-[#151515] transition-colors duration-200';

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-[#F2EEE6]/95 backdrop-blur-md shadow-sm' : 'bg-[#F2EEE6]/80 backdrop-blur-sm'}`}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 -ml-2" aria-label="Open menu" aria-expanded={isMobileMenuOpen} aria-controls="mobile-menu">
              <Menu size={22} aria-hidden="true" />
            </button>

            <Link to="/" className="flex items-center" aria-label={`${BUSINESS.brandName} home`}>
              <span className="text-xl lg:text-2xl font-semibold tracking-[-0.02em] text-[#151515]">KYVERON</span>
            </Link>

            <nav className="hidden lg:flex items-center gap-8" aria-label="Main">
              <Link to="/shop" className={navLink}>Shop</Link>
              <Link to="/collections/core-performance" className={navLink}>Performance</Link>
              <Link to="/collections/daily-luxury" className={navLink}>Daily Luxury</Link>
              <Link to="/journal" className={navLink}>Journal</Link>
            </nav>

            <div className="flex items-center gap-3">
              <Link to="/search" className="p-2 hover:opacity-70 transition-opacity" aria-label="Search">
                <Search size={20} aria-hidden="true" />
              </Link>
              <Link to="/wishlist" className="hidden sm:block p-2 hover:opacity-70 transition-opacity relative" aria-label={`Wishlist, ${state.wishlist.length} item${state.wishlist.length === 1 ? '' : 's'}`}>
                <Heart size={20} aria-hidden="true" />
                {state.wishlist.length > 0 && (
                  <span aria-hidden="true" className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#214C9A] text-white text-[10px] rounded-full flex items-center justify-center">{state.wishlist.length}</span>
                )}
              </Link>
              <Link to="/account" className="hidden sm:block p-2 hover:opacity-70 transition-opacity" aria-label="Account">
                <User size={20} aria-hidden="true" />
              </Link>
              <button onClick={() => setIsCartOpen(true)} className="p-2 hover:opacity-70 transition-opacity relative" aria-label={`Cart, ${cartCount} item${cartCount === 1 ? '' : 's'}`} aria-haspopup="dialog">
                <ShoppingBag size={20} aria-hidden="true" />
                {cartCount > 0 && (
                  <motion.span aria-hidden="true" initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#214C9A] text-white text-[10px] rounded-full flex items-center justify-center">
                    {cartCount}
                  </motion.span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setIsMobileMenuOpen(false)} aria-hidden="true" />
            <motion.div ref={menuRef} id="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu" tabIndex={-1} initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'tween', duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="absolute left-0 top-0 bottom-0 w-[280px] bg-[#F2EEE6] p-6 overflow-y-auto">
              <div className="flex justify-between items-center mb-8">
                <span className="text-lg font-semibold">KYVERON</span>
                <button onClick={() => setIsMobileMenuOpen(false)} aria-label="Close menu"><X size={22} aria-hidden="true" /></button>
              </div>
              <nav className="flex flex-col gap-4" aria-label="Mobile">
                <Link to="/shop" className="text-base font-medium py-2">Shop All</Link>
                <Link to="/collections/core-performance" className="text-base font-medium py-2">Performance</Link>
                <Link to="/collections/daily-luxury" className="text-base font-medium py-2">Daily Luxury</Link>
                <Link to="/journal" className="text-base font-medium py-2">Journal</Link>
                <hr className="border-[#8A8577] my-2" />
                <Link to="/account" className="text-base font-medium py-2">Account</Link>
                <Link to="/wishlist" className="text-base font-medium py-2">Wishlist</Link>
                <Link to="/track-order" className="text-base font-medium py-2">Track Order</Link>
                <Link to="/contact" className="text-base font-medium py-2">Contact</Link>
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}

// ===== Cart Drawer =====
function CartDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { state, removeFromCart, updateQuantity, formatPrice } = useStore();
  const { state: dyn } = useDynamic();
  const ref = useDialog(isOpen, onClose);
  const count = state.cart.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70]">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
          <motion.div ref={ref} role="dialog" aria-modal="true" aria-labelledby="cart-drawer-title" tabIndex={-1} initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween', duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className="absolute right-0 top-0 bottom-0 w-full max-w-[420px] bg-[#F2EEE6] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-[#AAA394]/20">
              <h2 id="cart-drawer-title" className="text-lg font-semibold">Your Cart ({count})</h2>
              <button onClick={onClose} aria-label="Close cart" className="p-1"><X size={20} aria-hidden="true" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
              {state.cart.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag size={48} className="text-[#AAA394] mb-4" aria-hidden="true" />
                  <p className="text-[#303238] font-medium mb-2">Your cart is empty</p>
                  <p className="text-sm text-[#6B665B] mb-6">Discover our collection and add something you love.</p>
                  <Link to="/shop" onClick={onClose} className="px-6 py-2.5 bg-[#151515] text-white text-sm font-medium rounded-sm hover:bg-[#303238] transition-colors">Shop Now</Link>
                </div>
              ) : (
                <ul className="space-y-4">
                  {state.cart.items.map((item) => (
                    <motion.li key={item.variantId} layout className="flex gap-3 p-3 bg-white/60 rounded-sm">
                      <img src={item.product.images[0]?.url} alt="" className="w-20 h-24 object-cover rounded-sm" />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium truncate">{item.product.name}</h3>
                        <p className="text-xs text-[#6B665B] mt-0.5">{item.color} / {item.size}</p>
                        <p className="text-sm font-medium mt-1">{formatPrice(item.product.basePrice)}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-[#8A8577] rounded-sm">
                            <button onClick={() => updateQuantity(item.variantId, item.quantity - 1)} className="p-1.5 hover:bg-[#AAA394]/10" aria-label={`Decrease quantity of ${item.product.name}`}><Minus size={14} aria-hidden="true" /></button>
                            <span className="px-2 text-sm min-w-[24px] text-center" aria-label={`Quantity ${item.quantity}`}>{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.variantId, item.quantity + 1)} disabled={item.quantity >= MAX_QUANTITY} className="p-1.5 hover:bg-[#AAA394]/10 disabled:opacity-40" aria-label={`Increase quantity of ${item.product.name}`}><Plus size={14} aria-hidden="true" /></button>
                          </div>
                          <button onClick={() => removeFromCart(item.variantId)} className="p-1.5 text-[#6B665B] hover:text-red-700 transition-colors" aria-label={`Remove ${item.product.name} from cart`}><Trash2 size={16} aria-hidden="true" /></button>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>
            {state.cart.items.length > 0 && (
              <div className="border-t border-[#AAA394]/20 p-4 space-y-3">
                <CartTotals />
                {state.cart.shipping > 0 && (
                  <p className="text-xs text-[#6B665B]">Add {formatPrice(dyn.settings.freeShippingThreshold - (state.cart.subtotal - state.cart.discount))} more for free delivery.</p>
                )}
                <Link to="/checkout" onClick={onClose} className="block w-full text-center py-3 bg-[#151515] text-white font-medium text-sm rounded-sm hover:bg-[#303238] transition-colors">Proceed to Checkout</Link>
                <Link to="/cart" onClick={onClose} className="block w-full text-center py-2 text-sm text-[#303238] hover:text-[#151515]">View Full Cart</Link>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ===== Cart Totals =====
// One breakdown for drawer, cart and checkout so every screen shows the same, complete price.
export function CartTotals({ codFee = 0, totalLabel = 'Total' }: { codFee?: number; totalLabel?: string }) {
  const { state, formatPrice } = useStore();
  const { state: dyn } = useDynamic();
  const cart = state.cart;
  return (
    <dl className="space-y-2 text-sm">
      <div className="flex justify-between"><dt>Items</dt><dd>{formatPrice(cart.subtotal)}</dd></div>
      {cart.discount > 0 && <div className="flex justify-between text-green-800"><dt>Discount{cart.couponCode ? ` (${cart.couponCode})` : ''}</dt><dd>−{formatPrice(cart.discount)}</dd></div>}
      <div className="flex justify-between"><dt>Delivery</dt><dd>{cart.shipping === 0 ? 'Free' : formatPrice(cart.shipping)}</dd></div>
      {codFee > 0 && <div className="flex justify-between"><dt>Cash on delivery fee</dt><dd>{formatPrice(codFee)}</dd></div>}
      <div className="flex justify-between text-base font-semibold pt-2 border-t border-[#AAA394]/20"><dt>{totalLabel}</dt><dd>{formatPrice(cart.total + codFee)}</dd></div>
      <p className="text-xs text-[#6B665B]">Prices include GST ({dyn.settings.gstRate}%: {formatPrice(cart.tax)}). No other charges are added.</p>
    </dl>
  );
}

// ===== Footer =====
export function Footer() {
  const { openCookieSettings } = useStore();
  const g = BUSINESS.grievanceOfficer;
  const link = 'text-sm text-[#AAA394] hover:text-[#F2EEE6] transition-colors';
  return (
    <footer className="bg-[#151515] text-[#F2EEE6]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <h2 className="text-lg font-semibold tracking-[-0.02em] mb-4">{BUSINESS.brandName}</h2>
            <p className="text-sm text-[#AAA394] leading-relaxed">Daily wear and sportswear.</p>
          </div>
          <nav aria-label="Shop">
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-4">Shop</h2>
            <ul className="space-y-2.5">
              <li><Link to="/shop" className={link}>All Products</Link></li>
              <li><Link to="/collections/core-performance" className={link}>Performance</Link></li>
              <li><Link to="/collections/daily-luxury" className={link}>Daily Luxury</Link></li>
              <li><Link to="/shop?new=true" className={link}>New Arrivals</Link></li>
            </ul>
          </nav>
          <nav aria-label="Support">
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-4">Support</h2>
            <ul className="space-y-2.5">
              <li><Link to="/contact" className={link}>Contact Us</Link></li>
              <li><Link to="/track-order" className={link}>Track Order</Link></li>
              <li><Link to="/returns" className={link}>Returns & Exchanges</Link></li>
              <li><Link to="/faq" className={link}>FAQ</Link></li>
              <li><Link to="/size-guide" className={link}>Size Guide</Link></li>
            </ul>
          </nav>
          <nav aria-label="Legal">
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-4">Legal</h2>
            <ul className="space-y-2.5">
              <li><Link to="/terms" className={link}>Terms of Service</Link></li>
              <li><Link to="/privacy" className={link}>Privacy Policy</Link></li>
              <li><Link to="/cookie-policy" className={link}>Cookie Policy</Link></li>
              <li><Link to="/refund-policy" className={link}>Refund Policy</Link></li>
              <li><Link to="/shipping-policy" className={link}>Shipping Policy</Link></li>
              <li><Link to="/data-request" className={link}>Your data & deletion</Link></li>
              <li><button type="button" onClick={openCookieSettings} className={link}>Cookie settings</button></li>
            </ul>
          </nav>
        </div>

        <section aria-labelledby="business-details" className="border-t border-[#303238] mt-12 pt-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-[#AAA394] leading-relaxed">
          <div>
            <h2 id="business-details" className="text-[#F2EEE6] font-semibold mb-2">Seller details</h2>
            <p>{BUSINESS.legalName} ({BUSINESS.entityType})</p>
            <p>{BUSINESS.registeredAddress}</p>
            <p>GSTIN: {BUSINESS.gstin} · CIN: {BUSINESS.cin}</p>
            <p>Customer care: {BUSINESS.supportEmail} · {BUSINESS.supportPhone} · {BUSINESS.serviceHours}</p>
          </div>
          <div>
            <h2 className="text-[#F2EEE6] font-semibold mb-2">Grievance Officer</h2>
            <p>{g.name}, {g.designation}</p>
            <p>{g.address}</p>
            <p>{g.email} · {g.phone}</p>
            <p>We acknowledge complaints within 48 hours and aim to resolve them within one month.</p>
          </div>
        </section>

        <div className="border-t border-[#303238] mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-[#AAA394]">© {new Date().getFullYear()} {BUSINESS.legalName}. All rights reserved.</p>
          <Link to="/credits" className="text-xs text-[#AAA394] hover:text-[#F2EEE6]">Fonts, icons & image credits</Link>
        </div>
      </div>
    </footer>
  );
}

// ===== Toast Notifications =====
export function ToastContainer() {
  const { state } = useStore();
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2" role="status" aria-live="polite">
      <AnimatePresence>
        {state.toasts.map((toast) => (
          <motion.div key={toast.id} initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }} className={`flex items-center gap-2 px-4 py-3 rounded-sm shadow-lg text-sm font-medium ${toast.type === 'success' ? 'bg-[#151515] text-white' : toast.type === 'error' ? 'bg-red-800 text-white' : 'bg-[#303238] text-white'}`}>
            {toast.type === 'success' && <Check size={16} aria-hidden="true" />}
            {toast.type === 'error' && <AlertCircle size={16} aria-hidden="true" />}
            {toast.type === 'info' && <Info size={16} aria-hidden="true" />}
            {toast.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ===== Cookie Consent =====
// Accept and reject carry equal weight, nothing optional is pre-selected, and the choice can be
// changed at any time from "Cookie settings" in the footer.
export function CookieBanner() {
  const { state, setCookieConsent, dispatch } = useStore();
  const { hasConsented } = state.cookieConsent;
  const [showDetails, setShowDetails] = useState(false);
  const [analytics, setAnalytics] = useState(state.cookieConsent.analytics);
  const [marketing, setMarketing] = useState(state.cookieConsent.marketing);
  const headingId = useId();
  const reopened = state.cookieSettingsOpen;
  const visible = !hasConsented || reopened;
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!reopened) return;
    setAnalytics(state.cookieConsent.analytics);
    setMarketing(state.cookieConsent.marketing);
    setShowDetails(true);
    requestAnimationFrame(() => panelRef.current?.focus());
  }, [reopened, state.cookieConsent.analytics, state.cookieConsent.marketing]);

  if (!visible) return null;

  const btn = 'px-4 py-2.5 text-sm font-medium rounded-sm border transition-colors';
  const choose = (a: boolean, m: boolean) => setCookieConsent({ analytics: a, marketing: m });

  return (
    <motion.div ref={panelRef} tabIndex={-1} role="region" aria-labelledby={headingId} initial={{ y: 100 }} animate={{ y: 0 }} className="fixed bottom-0 left-0 right-0 z-[80] bg-[#151515] text-[#F2EEE6] p-4 sm:p-5 shadow-xl max-h-[80vh] overflow-y-auto">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="max-w-2xl">
            <h2 id={headingId} className="text-sm font-semibold mb-1">Cookies and browser storage</h2>
            <p className="text-sm text-[#CFCAC0]">
              We only use storage that the site needs to work. Analytics and marketing tools are off unless you switch them on, and we don't use any today. See our <Link to="/cookie-policy" className="underline hover:text-white">Cookie Policy</Link>.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => choose(false, false)} className={`${btn} border-[#F2EEE6] text-[#F2EEE6] hover:bg-white/10`}>Reject optional</button>
            <button type="button" onClick={() => choose(true, true)} className={`${btn} border-[#F2EEE6] text-[#F2EEE6] hover:bg-white/10`}>Accept all</button>
            <button type="button" onClick={() => setShowDetails(v => !v)} aria-expanded={showDetails} aria-controls="cookie-preferences" className={`${btn} border-transparent underline text-[#F2EEE6]`}>
              {showDetails ? 'Hide choices' : 'Choose'}
            </button>
            {reopened && hasConsented && (
              <button type="button" onClick={() => dispatch({ type: 'SET_COOKIE_SETTINGS_OPEN', payload: false })} className={`${btn} border-transparent text-[#F2EEE6]`} aria-label="Close cookie settings"><X size={16} aria-hidden="true" /></button>
            )}
          </div>
        </div>
        {showDetails && (
          <div id="cookie-preferences" className="mt-4 grid gap-3 md:grid-cols-3">
            <ConsentToggle label="Strictly necessary" description="Remembers your cookie choice and keeps the site working. Always on." checked disabled onChange={() => {}} />
            <ConsentToggle label="Analytics" description="Would help us understand how the site is used. No analytics tool is installed yet." checked={analytics} onChange={setAnalytics} />
            <ConsentToggle label="Marketing" description="Would let us measure ads. No marketing tool is installed yet." checked={marketing} onChange={setMarketing} />
            <div className="md:col-span-3">
              <button type="button" onClick={() => choose(analytics, marketing)} className={`${btn} bg-[#F2EEE6] text-[#151515] border-[#F2EEE6] hover:bg-white`}>Save my choices</button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function ConsentToggle({ label, description, checked, disabled, onChange }: { label: string; description: string; checked: boolean; disabled?: boolean; onChange: (v: boolean) => void }) {
  const id = useId();
  return (
    <div className="flex items-start gap-3 p-3 border border-[#303238] rounded-sm">
      <input id={id} type="checkbox" role="switch" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} aria-describedby={`${id}-desc`} className="mt-1 w-4 h-4 accent-[#F2EEE6]" />
      <label htmlFor={id} className="text-sm">
        <span className="font-medium block">{label}</span>
        <span id={`${id}-desc`} className="text-xs text-[#CFCAC0]">{description}</span>
      </label>
    </div>
  );
}

// ===== Scroll Reveal Hook =====
export function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

// ===== Reveal Wrapper =====
export function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, isVisible } = useScrollReveal();
  return (
    <div ref={ref} className={className} style={{ transitionDelay: `${delay}ms` }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={isVisible ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: delay / 1000 }}>
        {children}
      </motion.div>
    </div>
  );
}

// ===== Rating =====
// Shows stars only when real reviews exist; never a placeholder score.
export function Rating({ rating, count, size = 12 }: { rating: number; count: number; size?: number }) {
  if (!count) return null;
  return (
    <div className="flex items-center gap-1">
      <div className="flex" role="img" aria-label={`Rated ${rating} out of 5 from ${count} review${count === 1 ? '' : 's'}`}>
        {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={size} aria-hidden="true" className={i < Math.round(rating) ? 'fill-[#151515] text-[#151515]' : 'text-[#6B665B]'} />)}
      </div>
      <span className="text-xs text-[#6B665B]" aria-hidden="true">({count})</span>
    </div>
  );
}

// ===== Product Card =====
export function ProductCard({ product, index = 0 }: { product: any; index?: number }) {
  const { state, toggleWishlist, formatPrice } = useStore();
  const isWished = state.wishlist.includes(product.id);
  const [imageIndex, setImageIndex] = useState(0);
  const onSale = product.compareAtPrice && product.compareAtPrice > product.basePrice;

  return (
    <Reveal delay={index * 80}>
      <div className="group relative">
        <Link to={`/products/${product.slug}`} className="block" onFocus={() => setImageIndex(0)}>
          <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-[#e8e4dc] mb-3">
            <motion.img
              src={product.images[imageIndex]?.url}
              alt={product.images[imageIndex]?.alt || product.name}
              className="w-full h-full object-cover"
              loading="lazy"
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              onMouseEnter={() => product.images.length > 1 && setImageIndex(1)}
              onMouseLeave={() => setImageIndex(0)}
            />
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {product.isNew && <span className="px-2 py-0.5 bg-[#214C9A] text-white text-[10px] font-semibold uppercase tracking-wider rounded-sm">New</span>}
              {onSale && <span className="px-2 py-0.5 bg-[#151515] text-white text-[10px] font-semibold uppercase tracking-wider rounded-sm">Sale</span>}
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-[#151515] group-hover:text-[#214C9A] transition-colors duration-200">{product.name}</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">{formatPrice(product.basePrice)}</span>
              {onSale && <span className="text-xs text-[#6B665B] line-through"><span className="sr-only">Was </span>{formatPrice(product.compareAtPrice)}</span>}
            </div>
            <Rating rating={product.rating} count={product.reviewCount} />
            <p className="text-xs text-[#6B665B]">{product.colors.length} colour{product.colors.length > 1 ? 's' : ''}</p>
          </div>
        </Link>
        <button
          type="button"
          onClick={() => toggleWishlist(product.id)}
          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full opacity-100 lg:opacity-0 lg:group-hover:opacity-100 focus-visible:opacity-100 transition-opacity duration-200 hover:bg-white"
          aria-label={isWished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          aria-pressed={isWished}
        >
          <Heart size={16} aria-hidden="true" className={isWished ? 'fill-[#214C9A] text-[#214C9A]' : 'text-[#303238]'} />
        </button>
      </div>
    </Reveal>
  );
}

// ===== Skeleton Loader =====
export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse" aria-hidden="true">
      <div className="aspect-[3/4] bg-[#e8e4dc] rounded-sm mb-3" />
      <div className="h-4 bg-[#e8e4dc] rounded w-3/4 mb-2" />
      <div className="h-4 bg-[#e8e4dc] rounded w-1/4" />
    </div>
  );
}

// ===== Page Layout =====
export function PageLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    // After client-side navigation, move focus to the new page so screen readers announce it.
    if (firstRender.current) { firstRender.current = false; return; }
    mainRef.current?.focus({ preventScroll: true });
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <a href="#main-content" onClick={(e) => { e.preventDefault(); mainRef.current?.focus(); }} className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[200] focus:px-4 focus:py-2 focus:bg-[#151515] focus:text-white focus:rounded-sm">
        Skip to main content
      </a>
      <Header />
      <main ref={mainRef} id="main-content" tabIndex={-1} className="flex-1 pt-16 lg:pt-20 outline-none">
        <motion.div key={location.pathname} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
          {children}
        </motion.div>
      </main>
      <Footer />
      <ToastContainer />
      <CookieBanner />
    </div>
  );
}
