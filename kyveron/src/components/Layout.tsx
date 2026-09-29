import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Search, User, Heart, Menu, X, ChevronDown, Minus, Plus, Trash2, ArrowRight, Star, Check, AlertCircle, Info, Eye } from 'lucide-react';
import { useStore } from '../lib/store';
import { useDynamic } from '../lib/dynamicStore';
import { IMAGES } from '../lib/data';

// ===== Header =====
export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const location = useLocation();
  const { state } = useStore();
  const cartCount = state.cart.items.reduce((sum, i) => sum + i.quantity, 0);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setIsMobileMenuOpen(false); }, [location]);

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-[#F2EEE6]/95 backdrop-blur-md shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Mobile menu button */}
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 -ml-2" aria-label="Open menu">
              <Menu size={22} />
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center">
              <span className="text-xl lg:text-2xl font-semibold tracking-[-0.02em] text-[#151515]">KYVERON</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              <Link to="/shop" className="text-sm font-medium text-[#303238] hover:text-[#151515] transition-colors duration-200">Shop</Link>
              <Link to="/collections/core-performance" className="text-sm font-medium text-[#303238] hover:text-[#151515] transition-colors duration-200">Performance</Link>
              <Link to="/collections/daily-luxury" className="text-sm font-medium text-[#303238] hover:text-[#151515] transition-colors duration-200">Daily Luxury</Link>
              <Link to="/journal" className="text-sm font-medium text-[#303238] hover:text-[#151515] transition-colors duration-200">Journal</Link>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <Link to="/search" className="p-2 hover:opacity-70 transition-opacity" aria-label="Search">
                <Search size={20} />
              </Link>
              <Link to="/wishlist" className="hidden sm:block p-2 hover:opacity-70 transition-opacity relative" aria-label="Wishlist">
                <Heart size={20} />
                {state.wishlist.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#214C9A] text-white text-[10px] rounded-full flex items-center justify-center">{state.wishlist.length}</span>
                )}
              </Link>
              <Link to="/account" className="hidden sm:block p-2 hover:opacity-70 transition-opacity" aria-label="Account">
                <User size={20} />
              </Link>
              <button onClick={() => setIsCartOpen(true)} className="p-2 hover:opacity-70 transition-opacity relative" aria-label="Cart">
                <ShoppingBag size={20} />
                {cartCount > 0 && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#214C9A] text-white text-[10px] rounded-full flex items-center justify-center">
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
            <div className="absolute inset-0 bg-black/40" onClick={() => setIsMobileMenuOpen(false)} />
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'tween', duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="absolute left-0 top-0 bottom-0 w-[280px] bg-[#F2EEE6] p-6">
              <div className="flex justify-between items-center mb-8">
                <span className="text-lg font-semibold">KYVERON</span>
                <button onClick={() => setIsMobileMenuOpen(false)} aria-label="Close menu"><X size={22} /></button>
              </div>
              <nav className="flex flex-col gap-4">
                <Link to="/shop" className="text-base font-medium py-2">Shop All</Link>
                <Link to="/collections/core-performance" className="text-base font-medium py-2">Performance</Link>
                <Link to="/collections/daily-luxury" className="text-base font-medium py-2">Daily Luxury</Link>
                <Link to="/journal" className="text-base font-medium py-2">Journal</Link>
                <hr className="border-[#AAA394]/30 my-2" />
                <Link to="/account" className="text-base font-medium py-2">Account</Link>
                <Link to="/wishlist" className="text-base font-medium py-2">Wishlist</Link>
                <Link to="/track-order" className="text-base font-medium py-2">Track Order</Link>
                <Link to="/contact" className="text-base font-medium py-2">Contact</Link>
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}

// ===== Cart Drawer =====
function CartDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { state, removeFromCart, updateQuantity, formatPrice } = useStore();

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70]">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40" onClick={onClose} />
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween', duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className="absolute right-0 top-0 bottom-0 w-full max-w-[420px] bg-[#F2EEE6] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-[#AAA394]/20">
              <h2 className="text-lg font-semibold">Your Cart ({state.cart.items.reduce((s, i) => s + i.quantity, 0)})</h2>
              <button onClick={onClose} aria-label="Close cart" className="p-1"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
              {state.cart.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag size={48} className="text-[#AAA394] mb-4" />
                  <p className="text-[#303238] font-medium mb-2">Your cart is empty</p>
                  <p className="text-sm text-[#AAA394] mb-6">Discover our collection and add something you love.</p>
                  <Link to="/shop" onClick={onClose} className="px-6 py-2.5 bg-[#151515] text-white text-sm font-medium rounded-sm hover:bg-[#303238] transition-colors">Shop Now</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {state.cart.items.map((item) => (
                    <motion.div key={item.variantId} layout className="flex gap-3 p-3 bg-white/60 rounded-sm">
                      <img src={item.product.images[0]?.url} alt={item.product.name} className="w-20 h-24 object-cover rounded-sm" />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium truncate">{item.product.name}</h3>
                        <p className="text-xs text-[#AAA394] mt-0.5">{item.color} / {item.size}</p>
                        <p className="text-sm font-medium mt-1">{formatPrice(item.product.basePrice)}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-[#AAA394]/30 rounded-sm">
                            <button onClick={() => updateQuantity(item.variantId, item.quantity - 1)} className="p-1.5 hover:bg-[#AAA394]/10" aria-label="Decrease"><Minus size={14} /></button>
                            <span className="px-2 text-sm min-w-[24px] text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.variantId, item.quantity + 1)} className="p-1.5 hover:bg-[#AAA394]/10" aria-label="Increase"><Plus size={14} /></button>
                          </div>
                          <button onClick={() => removeFromCart(item.variantId)} className="p-1.5 text-[#AAA394] hover:text-red-600 transition-colors" aria-label="Remove"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
            {state.cart.items.length > 0 && (
              <div className="border-t border-[#AAA394]/20 p-4 space-y-3">
                <div className="flex justify-between text-sm"><span>Subtotal</span><span>{formatPrice(state.cart.subtotal)}</span></div>
                {state.cart.discount > 0 && <div className="flex justify-between text-sm text-green-700"><span>Discount</span><span>-{formatPrice(state.cart.discount)}</span></div>}
                <div className="flex justify-between text-sm"><span>Shipping</span><span>{state.cart.shipping === 0 ? 'Free' : formatPrice(state.cart.shipping)}</span></div>
                <div className="flex justify-between text-base font-semibold pt-2 border-t border-[#AAA394]/20"><span>Total</span><span>{formatPrice(state.cart.total)}</span></div>
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

// ===== Footer =====
export function Footer() {
  const { state: dynState } = useDynamic();
  return (
    <footer className="bg-[#151515] text-[#F2EEE6]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <h3 className="text-lg font-semibold tracking-[-0.02em] mb-4">{dynState.settings.brandName}</h3>
            <p className="text-sm text-[#AAA394] leading-relaxed">Premium Indian apparel. Luxurious daily wear and performance sportswear crafted for modern life.</p>
            <div className="flex gap-4 mt-6">
              <a href="#" className="text-[#AAA394] hover:text-[#F2EEE6] transition-colors text-sm">Instagram</a>
              <a href="#" className="text-[#AAA394] hover:text-[#F2EEE6] transition-colors text-sm">Twitter</a>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Shop</h4>
            <ul className="space-y-2.5">
              <li><Link to="/shop" className="text-sm text-[#AAA394] hover:text-[#F2EEE6] transition-colors">All Products</Link></li>
              <li><Link to="/collections/core-performance" className="text-sm text-[#AAA394] hover:text-[#F2EEE6] transition-colors">Performance</Link></li>
              <li><Link to="/collections/daily-luxury" className="text-sm text-[#AAA394] hover:text-[#F2EEE6] transition-colors">Daily Luxury</Link></li>
              <li><Link to="/shop?new=true" className="text-sm text-[#AAA394] hover:text-[#F2EEE6] transition-colors">New Arrivals</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Support</h4>
            <ul className="space-y-2.5">
              <li><Link to="/contact" className="text-sm text-[#AAA394] hover:text-[#F2EEE6] transition-colors">Contact Us</Link></li>
              <li><Link to="/track-order" className="text-sm text-[#AAA394] hover:text-[#F2EEE6] transition-colors">Track Order</Link></li>
              <li><Link to="/returns" className="text-sm text-[#AAA394] hover:text-[#F2EEE6] transition-colors">Returns & Exchanges</Link></li>
              <li><Link to="/faq" className="text-sm text-[#AAA394] hover:text-[#F2EEE6] transition-colors">FAQ</Link></li>
              <li><Link to="/size-guide" className="text-sm text-[#AAA394] hover:text-[#F2EEE6] transition-colors">Size Guide</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Legal</h4>
            <ul className="space-y-2.5">
              <li><Link to="/terms" className="text-sm text-[#AAA394] hover:text-[#F2EEE6] transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/privacy" className="text-sm text-[#AAA394] hover:text-[#F2EEE6] transition-colors">Privacy Policy</Link></li>
              <li><Link to="/shipping-policy" className="text-sm text-[#AAA394] hover:text-[#F2EEE6] transition-colors">Shipping Policy</Link></li>
              <li><Link to="/refund-policy" className="text-sm text-[#AAA394] hover:text-[#F2EEE6] transition-colors">Refund Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-[#303238] mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-[#AAA394]">© 2024 {dynState.settings.brandName}. All rights reserved.</p>
          <p className="text-xs text-[#AAA394]">Crafted with intention in India.</p>
        </div>
      </div>
    </footer>
  );
}

// ===== Toast Notifications =====
export function ToastContainer() {
  const { state, dispatch } = useStore();
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      <AnimatePresence>
        {state.toasts.map((toast) => (
          <motion.div key={toast.id} initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }} className={`flex items-center gap-2 px-4 py-3 rounded-sm shadow-lg text-sm font-medium ${toast.type === 'success' ? 'bg-[#151515] text-white' : toast.type === 'error' ? 'bg-red-700 text-white' : 'bg-[#303238] text-white'}`}>
            {toast.type === 'success' && <Check size={16} />}
            {toast.type === 'error' && <AlertCircle size={16} />}
            {toast.type === 'info' && <Info size={16} />}
            {toast.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ===== Cookie Consent Banner =====
export function CookieBanner() {
  const { state, dispatch } = useStore();
  if (state.cookieConsent.hasConsented) return null;

  return (
    <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="fixed bottom-0 left-0 right-0 z-[80] bg-[#151515] text-[#F2EEE6] p-4 shadow-xl">
      <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-[#AAA394]">We use cookies to enhance your experience. By continuing, you agree to our <Link to="/cookie-policy" className="underline hover:text-white">Cookie Policy</Link>.</p>
        <div className="flex gap-3">
          <button onClick={() => dispatch({ type: 'SET_COOKIE_CONSENT', payload: { necessary: true, analytics: false, marketing: false, hasConsented: true } })} className="px-4 py-2 text-sm border border-[#AAA394]/30 rounded-sm hover:border-[#AAA394] transition-colors">Reject Optional</button>
          <button onClick={() => dispatch({ type: 'SET_COOKIE_CONSENT', payload: { necessary: true, analytics: true, marketing: true, hasConsented: true } })} className="px-4 py-2 text-sm bg-[#F2EEE6] text-[#151515] rounded-sm font-medium hover:bg-white transition-colors">Accept All</button>
        </div>
      </div>
    </motion.div>
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

// ===== Product Card =====
export function ProductCard({ product, index = 0 }: { product: any; index?: number }) {
  const { state, toggleWishlist, formatPrice } = useStore();
  const isWished = state.wishlist.includes(product.id);
  const [imageIndex, setImageIndex] = useState(0);

  return (
    <Reveal delay={index * 80}>
      <Link to={`/products/${product.slug}`} className="group block">
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
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.isNew && <span className="px-2 py-0.5 bg-[#214C9A] text-white text-[10px] font-semibold uppercase tracking-wider rounded-sm">New</span>}
            {product.compareAtPrice && <span className="px-2 py-0.5 bg-[#151515] text-white text-[10px] font-semibold uppercase tracking-wider rounded-sm">Sale</span>}
          </div>
          {/* Wishlist */}
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product.id); }}
            className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white"
            aria-label={isWished ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart size={16} className={isWished ? 'fill-[#214C9A] text-[#214C9A]' : 'text-[#303238]'} />
          </button>
          {/* Quick view */}
          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="flex items-center justify-center py-2 bg-white/90 backdrop-blur-sm rounded-sm text-xs font-medium text-[#151515]">
              <Eye size={14} className="mr-1.5" /> Quick View
            </div>
          </div>
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-[#151515] group-hover:text-[#214C9A] transition-colors duration-200">{product.name}</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{formatPrice(product.basePrice)}</span>
            {product.compareAtPrice && <span className="text-xs text-[#AAA394] line-through">{formatPrice(product.compareAtPrice)}</span>}
          </div>
          <div className="flex items-center gap-1">
            <div className="flex">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={12} className={i < Math.floor(product.rating) ? 'fill-[#151515] text-[#151515]' : 'text-[#AAA394]'} />)}</div>
            <span className="text-xs text-[#AAA394]">({product.reviewCount})</span>
          </div>
          <p className="text-xs text-[#AAA394]">{product.colors.length} colour{product.colors.length > 1 ? 's' : ''}</p>
        </div>
      </Link>
    </Reveal>
  );
}

// ===== Skeleton Loader =====
export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/4] bg-[#e8e4dc] rounded-sm mb-3" />
      <div className="h-4 bg-[#e8e4dc] rounded w-3/4 mb-2" />
      <div className="h-4 bg-[#e8e4dc] rounded w-1/4" />
    </div>
  );
}

// ===== Page Layout =====
export function PageLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-16 lg:pt-20">
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
