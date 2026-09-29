import { useState, useId, ReactNode } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Heart, Package, MapPin, Settings, LogOut, Info } from 'lucide-react';
import { Reveal, ProductCard } from '../components/Layout';
import { useStore } from '../lib/store';
import { useDynamic } from '../lib/dynamicStore';
import { MINIMUM_AGE } from '../lib/business';

const inputBase = 'w-full py-3 border rounded-sm text-sm bg-white/70 focus:border-[#214C9A]';

function AccountPreviewNote() {
  return (
    <p role="note" className="flex gap-2 p-3 mb-6 bg-[#214C9A]/5 border border-[#214C9A]/30 rounded-sm text-xs text-[#303238]">
      <Info size={14} className="text-[#214C9A] flex-shrink-0 mt-0.5" aria-hidden="true" />
      <span>Preview store: accounts are simulated and exist only in this browser tab. Nothing you enter is sent to us.</span>
    </p>
  );
}

function FormField({ label, error, hint, required, children }: { label: string; error?: string; hint?: string; required?: boolean; children: (p: { id: string; 'aria-invalid': boolean; 'aria-describedby'?: string }) => ReactNode }) {
  const id = useId();
  const describedBy = [hint && `${id}-hint`, error && `${id}-err`].filter(Boolean).join(' ') || undefined;
  return (
    <div>
      <label htmlFor={id} className="text-xs font-medium text-[#303238] mb-1.5 block">{label}{required && <span aria-hidden="true"> *</span>}</label>
      {children({ id, 'aria-invalid': !!error, 'aria-describedby': describedBy })}
      {hint && <p id={`${id}-hint`} className="text-xs text-[#6B665B] mt-1">{hint}</p>}
      {error && <p id={`${id}-err`} className="text-xs text-red-700 mt-1">{error}</p>}
    </div>
  );
}

function CheckboxField({ checked, onChange, error, required, children }: { checked: boolean; onChange: (v: boolean) => void; error?: string; required?: boolean; children: ReactNode }) {
  const id = useId();
  return (
    <div>
      <div className="flex items-start gap-2">
        <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} className="w-4 h-4 mt-0.5 accent-[#214C9A]" />
        <label htmlFor={id} className="text-xs text-[#303238]">{children}{required && <span className="sr-only"> (required)</span>}</label>
      </div>
      {error && <p id={`${id}-err`} className="text-xs text-red-700 mt-1 ml-6">{error}</p>}
    </div>
  );
}

// ===== Login Page =====
export function LoginPage() {
  const navigate = useNavigate();
  const { login, showToast } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Enter your email and password'); return; }
    login({ id: 'user-001', email, name: email.split('@')[0], role: 'customer', createdAt: new Date().toISOString(), addresses: [], wishlist: [], marketingOptIn: false });
    showToast('Signed in', 'success');
    navigate('/account');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold tracking-[-0.02em] mb-2">Welcome back</h1>
          <p className="text-sm text-[#6B665B]">Sign in to your Kyveron account</p>
        </div>
        <AccountPreviewNote />

        <form onSubmit={handleLogin} className="space-y-5" noValidate>
          {error && <div role="alert" className="p-3 bg-red-50 border border-red-300 rounded-sm text-sm text-red-800">{error}</div>}

          <FormField label="Email">{p => (
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B665B]" aria-hidden="true" />
              <input {...p} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={`${inputBase} pl-10 pr-3 border-[#8A8577]`} />
            </div>
          )}</FormField>

          <FormField label="Password">{p => (
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B665B]" aria-hidden="true" />
              <input {...p} type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={`${inputBase} pl-10 pr-10 border-[#8A8577]`} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B665B]">
                {showPassword ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
              </button>
            </div>
          )}</FormField>

          <button type="submit" className="w-full py-3.5 bg-[#151515] text-white text-sm font-semibold rounded-sm hover:bg-[#303238] transition-colors">Sign In</button>
        </form>

        <p className="text-center text-sm text-[#303238] mt-8">
          Don't have an account? <Link to="/register" className="text-[#214C9A] font-medium hover:underline">Create one</Link>
        </p>
      </motion.div>
    </div>
  );
}

// ===== Register Page =====
export function RegisterPage() {
  const navigate = useNavigate();
  const { login, showToast } = useStore();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '', agreeTerms: false, ageConfirmed: false, marketing: false });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = (k: keyof typeof formData, v: string | boolean) => {
    setFormData(p => ({ ...p, [k]: v }));
    if (errors[k]) setErrors(prev => { const n = { ...prev }; delete n[k]; return n; });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const n: Record<string, string> = {};
    if (!formData.name.trim()) n.name = 'Enter your name';
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) n.email = 'Enter a valid email address';
    if (formData.phone && !formData.phone.match(/^\d{10}$/)) n.phone = 'Enter a 10-digit mobile number, or leave it blank';
    if (formData.password.length < 8) n.password = 'Use at least 8 characters';
    if (formData.password !== formData.confirmPassword) n.confirmPassword = 'Passwords don\'t match';
    if (!formData.agreeTerms) n.agreeTerms = 'Please accept the Terms of Service and Privacy Policy';
    if (!formData.ageConfirmed) n.ageConfirmed = `You must be at least ${MINIMUM_AGE} to create an account`;
    setErrors(n);
    if (Object.keys(n).length > 0) { requestAnimationFrame(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()); return; }

    login({ id: 'user-new', email: formData.email, name: formData.name, phone: formData.phone || undefined, role: 'customer', createdAt: new Date().toISOString(), addresses: [], wishlist: [], marketingOptIn: formData.marketing });
    showToast('Account created', 'success');
    navigate('/account');
  };

  const cls = (k: string) => `${inputBase} px-3 ${errors[k] ? 'border-red-700' : 'border-[#8A8577]'}`;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold tracking-[-0.02em] mb-2">Create your account</h1>
          <p className="text-sm text-[#6B665B]">Save your details and see your orders in one place</p>
        </div>
        <AccountPreviewNote />

        <form onSubmit={handleRegister} className="space-y-4" noValidate>
          <FormField label="Full name" required error={errors.name}>{p => <input {...p} type="text" autoComplete="name" value={formData.name} onChange={(e) => set('name', e.target.value)} className={cls('name')} />}</FormField>
          <FormField label="Email" required error={errors.email}>{p => <input {...p} type="email" autoComplete="email" value={formData.email} onChange={(e) => set('email', e.target.value)} className={cls('email')} />}</FormField>
          <FormField label="Mobile number (optional)" error={errors.phone} hint="Only used to prefill checkout. You can add it later.">{p => <input {...p} type="tel" inputMode="numeric" autoComplete="tel-national" value={formData.phone} onChange={(e) => set('phone', e.target.value.replace(/\D/g, '').slice(0, 10))} className={cls('phone')} />}</FormField>
          <FormField label="Password" required error={errors.password} hint="At least 8 characters.">{p => <input {...p} type="password" autoComplete="new-password" value={formData.password} onChange={(e) => set('password', e.target.value)} className={cls('password')} />}</FormField>
          <FormField label="Confirm password" required error={errors.confirmPassword}>{p => <input {...p} type="password" autoComplete="new-password" value={formData.confirmPassword} onChange={(e) => set('confirmPassword', e.target.value)} className={cls('confirmPassword')} />}</FormField>

          <fieldset className="space-y-3 pt-2">
            <legend className="sr-only">Agreements</legend>
            <CheckboxField checked={formData.agreeTerms} onChange={(v) => set('agreeTerms', v)} error={errors.agreeTerms} required>
              I agree to the <Link to="/terms" className="text-[#214C9A] underline">Terms of Service</Link> and have read the <Link to="/privacy" className="text-[#214C9A] underline">Privacy Policy</Link>.
            </CheckboxField>
            <CheckboxField checked={formData.ageConfirmed} onChange={(v) => set('ageConfirmed', v)} error={errors.ageConfirmed} required>
              I am {MINIMUM_AGE} years of age or older.
            </CheckboxField>
            <CheckboxField checked={formData.marketing} onChange={(v) => set('marketing', v)}>
              Optional: send me occasional emails about new collections and offers. I can unsubscribe at any time.
            </CheckboxField>
          </fieldset>

          <button type="submit" className="w-full py-3.5 bg-[#151515] text-white text-sm font-semibold rounded-sm hover:bg-[#303238] transition-colors">Create Account</button>
        </form>

        <p className="text-center text-sm text-[#303238] mt-8">
          Already have an account? <Link to="/login" className="text-[#214C9A] font-medium hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}

// ===== Account Dashboard =====
export function AccountPage() {
  const { state, logout, formatPrice, dispatch, deleteLocalData, showToast } = useStore();
  const { state: dynState } = useDynamic();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders');
  const [profile, setProfile] = useState({ name: state.user?.name || '', phone: state.user?.phone || '' });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const nameId = useId(), emailId = useId(), phoneId = useId(), marketingId = useId();

  if (!state.isAuthenticated || !state.user) return <Navigate to="/login" replace />;
  const user = state.user;

  const tabs = [
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'settings', label: 'Settings & privacy', icon: Settings },
  ];
  const input = 'w-full px-3 py-2.5 border border-[#8A8577] rounded-sm text-sm bg-white/70 focus:border-[#214C9A]';

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <h1 className="sr-only">Your account</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64 flex-shrink-0">
          <div className="bg-white/60 rounded-sm border border-[#AAA394]/20 p-5">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#AAA394]/20">
              <div aria-hidden="true" className="w-10 h-10 bg-[#151515] rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {user.name?.[0]?.toUpperCase() || 'K'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-[#6B665B] truncate">{user.email}</p>
              </div>
            </div>
            <nav aria-label="Account sections" className="space-y-1">
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} aria-current={activeTab === tab.id ? 'page' : undefined} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm transition-colors ${activeTab === tab.id ? 'bg-[#151515] text-white' : 'text-[#303238] hover:bg-[#AAA394]/10'}`}>
                  <tab.icon size={16} aria-hidden="true" /> {tab.label}
                </button>
              ))}
              <button onClick={() => { logout(); navigate('/'); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm text-red-700 hover:bg-red-50 transition-colors mt-4">
                <LogOut size={16} aria-hidden="true" /> Sign Out
              </button>
            </nav>
          </div>
        </aside>

        <div className="flex-1">
          {activeTab === 'orders' && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Order History</h2>
              {state.orders.length === 0 ? (
                <div className="text-center py-12 bg-white/60 rounded-sm border border-[#AAA394]/20">
                  <Package size={40} className="text-[#AAA394] mx-auto mb-3" aria-hidden="true" />
                  <p className="text-sm text-[#303238] mb-2">No orders yet</p>
                  <Link to="/shop" className="text-sm text-[#214C9A] hover:underline">Start shopping</Link>
                </div>
              ) : (
                <ul className="space-y-4">
                  {state.orders.map(order => (
                    <li key={order.id}>
                      <Link to={`/order-confirmation/${order.orderNumber}`} className="block p-5 bg-white/60 rounded-sm border border-[#AAA394]/20 hover:border-[#303238] transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="text-sm font-semibold">{order.orderNumber}</p>
                            <p className="text-xs text-[#6B665B]">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                          </div>
                          <span className="px-2 py-0.5 bg-[#AAA394]/20 text-[#303238] text-xs font-medium rounded-sm">{order.isPreview ? 'Preview · not charged' : order.status.replace(/_/g, ' ')}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-[#6B665B]">{order.items.length} item{order.items.length > 1 ? 's' : ''}</p>
                          <p className="text-sm font-semibold">{formatPrice(order.total)}</p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {activeTab === 'addresses' && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Saved Addresses</h2>
              <div className="p-8 bg-white/60 rounded-sm border border-[#AAA394]/20 text-center">
                <MapPin size={40} className="text-[#AAA394] mx-auto mb-3" aria-hidden="true" />
                <p className="text-sm text-[#303238]">Saved addresses will be available when accounts go live. For now, enter your address at checkout.</p>
              </div>
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div>
              <h2 className="text-xl font-semibold mb-6">My Wishlist</h2>
              {state.wishlist.length === 0 ? (
                <div className="p-8 bg-white/60 rounded-sm border border-[#AAA394]/20 text-center">
                  <Heart size={40} className="text-[#AAA394] mx-auto mb-3" aria-hidden="true" />
                  <p className="text-sm text-[#303238] mb-4">Your wishlist is empty</p>
                  <Link to="/shop" className="text-sm text-[#214C9A] hover:underline">Explore products</Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {dynState.products.filter((p: any) => state.wishlist.includes(p.id) && p.isPublished).map((p: any, i: number) => <ProductCard key={p.id} product={p} index={i} />)}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Settings & privacy</h2>

              <form onSubmit={(e) => { e.preventDefault(); dispatch({ type: 'UPDATE_USER', payload: { name: profile.name, phone: profile.phone || undefined } }); showToast('Profile saved', 'success'); }} className="bg-white/60 rounded-sm border border-[#AAA394]/20 p-6">
                <h3 className="text-sm font-semibold mb-3">Profile</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor={nameId} className="text-xs font-medium text-[#303238] mb-1 block">Name</label>
                    <input id={nameId} type="text" autoComplete="name" value={profile.name} onChange={(e) => setProfile(p => ({ ...p, name: e.target.value }))} className={input} />
                  </div>
                  <div>
                    <label htmlFor={emailId} className="text-xs font-medium text-[#303238] mb-1 block">Email</label>
                    <input id={emailId} type="email" value={user.email} readOnly aria-describedby={`${emailId}-hint`} className={`${input} bg-[#AAA394]/10`} />
                    <p id={`${emailId}-hint`} className="text-xs text-[#6B665B] mt-1">Contact us to change your email.</p>
                  </div>
                  <div>
                    <label htmlFor={phoneId} className="text-xs font-medium text-[#303238] mb-1 block">Mobile (optional)</label>
                    <input id={phoneId} type="tel" inputMode="numeric" autoComplete="tel-national" value={profile.phone} onChange={(e) => setProfile(p => ({ ...p, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))} className={input} />
                  </div>
                </div>
                <button type="submit" className="mt-4 px-6 py-2.5 bg-[#151515] text-white text-sm font-medium rounded-sm hover:bg-[#303238] transition-colors">Save changes</button>
              </form>

              <section aria-labelledby="email-prefs" className="bg-white/60 rounded-sm border border-[#AAA394]/20 p-6">
                <h3 id="email-prefs" className="text-sm font-semibold mb-3">Email preferences</h3>
                <div className="flex items-start gap-2">
                  <input id={marketingId} type="checkbox" role="switch" checked={!!user.marketingOptIn} onChange={(e) => { dispatch({ type: 'UPDATE_USER', payload: { marketingOptIn: e.target.checked } }); showToast(e.target.checked ? 'Subscribed to marketing emails' : 'Unsubscribed from marketing emails', 'success'); }} className="w-4 h-4 mt-0.5 accent-[#214C9A]" />
                  <label htmlFor={marketingId} className="text-sm text-[#303238]">Send me occasional emails about new collections and offers</label>
                </div>
                <p className="text-xs text-[#6B665B] mt-2">Order emails (confirmation, dispatch, refunds) are always sent. Every marketing email also has a one-click unsubscribe link.</p>
              </section>

              <section aria-labelledby="delete-account" className="bg-white/60 rounded-sm border border-[#AAA394]/20 p-6">
                <h3 id="delete-account" className="text-sm font-semibold mb-2 text-red-700">Delete account and data</h3>
                <p className="text-sm text-[#303238] mb-3">Deleting signs you out and removes your account, cart, wishlist and preview orders from this browser straight away. For data held on our systems once the store is live, we also process a deletion request. <Link to="/data-request" className="text-[#214C9A] underline">More about your data rights</Link>.</p>
                {!confirmDelete ? (
                  <button type="button" onClick={() => setConfirmDelete(true)} className="px-4 py-2 border border-red-700 text-red-700 text-sm font-medium rounded-sm hover:bg-red-50 transition-colors">Delete my account</button>
                ) : (
                  <div role="alertdialog" aria-labelledby="confirm-delete-text" className="flex flex-wrap items-center gap-3">
                    <p id="confirm-delete-text" className="w-full text-sm font-medium">Delete your account and all data stored in this browser? This can't be undone.</p>
                    <button type="button" autoFocus onClick={() => { deleteLocalData(); showToast('Your account and data have been deleted', 'success'); navigate('/'); }} className="px-4 py-2 bg-red-700 text-white text-sm font-medium rounded-sm hover:bg-red-800">Yes, delete everything</button>
                    <button type="button" onClick={() => setConfirmDelete(false)} className="px-4 py-2 border border-[#8A8577] text-sm font-medium rounded-sm">Cancel</button>
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ===== Wishlist Page =====
export function WishlistPage() {
  const { state } = useStore();
  const { state: dynState } = useDynamic();
  const wishlistProducts = dynState.products.filter((p: any) => state.wishlist.includes(p.id) && p.isPublished);

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <Reveal>
        <h1 className="text-2xl lg:text-3xl font-semibold tracking-[-0.02em] mb-8">My Wishlist</h1>
      </Reveal>
      {wishlistProducts.length === 0 ? (
        <div className="text-center py-16">
          <Heart size={48} className="text-[#AAA394] mx-auto mb-4" aria-hidden="true" />
          <p className="text-lg font-medium text-[#303238] mb-2">Your wishlist is empty</p>
          <p className="text-sm text-[#6B665B] mb-6">Save items you love and come back to them later.</p>
          <Link to="/shop" className="inline-flex items-center gap-2 px-6 py-3 bg-[#151515] text-white text-sm font-medium rounded-sm hover:bg-[#303238] transition-colors">Explore Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {wishlistProducts.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      )}
    </div>
  );
}

// ===== Track Order Page =====
export function TrackOrderPage() {
  const { state } = useStore();
  const [orderNumber, setOrderNumber] = useState('');
  const [searched, setSearched] = useState(false);
  const [trackedOrder, setTrackedOrder] = useState<typeof state.orders[0] | null>(state.orders[0] || null);
  const inputId = useId();

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const found = state.orders.find(o => o.orderNumber === orderNumber.trim().toUpperCase());
    setTrackedOrder(found || null);
    setSearched(true);
  };

  const statusSteps = ['pending_payment', 'paid', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered'];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Reveal>
        <h1 className="text-2xl font-semibold tracking-[-0.02em] mb-8 text-center">Track Your Order</h1>
      </Reveal>

      <form onSubmit={handleTrack} className="bg-white/60 rounded-sm border border-[#AAA394]/20 p-6 mb-8">
        <label htmlFor={inputId} className="text-xs font-medium text-[#303238] mb-1.5 block">Order number</label>
        <div className="flex gap-3">
          <input id={inputId} type="text" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} placeholder="KYV-..." className="flex-1 px-4 py-3 border border-[#8A8577] rounded-sm text-sm bg-white/70 focus:border-[#214C9A]" />
          <button type="submit" className="px-6 py-3 bg-[#151515] text-white text-sm font-medium rounded-sm hover:bg-[#303238] transition-colors">Track</button>
        </div>
      </form>

      <div role="status" aria-live="polite">
        {trackedOrder && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/60 rounded-sm border border-[#AAA394]/20 p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-xs text-[#6B665B] uppercase tracking-wider">Order</p>
                <p className="text-lg font-semibold">{trackedOrder.orderNumber}</p>
              </div>
              <span className="px-3 py-1 bg-[#AAA394]/20 text-[#303238] text-xs font-medium rounded-sm">{trackedOrder.isPreview ? 'Preview order · not processed' : trackedOrder.status.replace(/_/g, ' ')}</span>
            </div>
            <ol className="space-y-0">
              {statusSteps.map((step, i) => {
                const currentIdx = statusSteps.indexOf(trackedOrder.status);
                const isComplete = i <= currentIdx;
                const isCurrent = i === currentIdx;
                return (
                  <li key={step} className="flex gap-4" aria-current={isCurrent ? 'step' : undefined}>
                    <div className="flex flex-col items-center" aria-hidden="true">
                      <div className={`w-3 h-3 rounded-full ${isComplete ? 'bg-[#214C9A]' : 'bg-[#AAA394]/40'} ${isCurrent ? 'ring-4 ring-[#214C9A]/20' : ''}`} />
                      {i < statusSteps.length - 1 && <div className={`w-0.5 h-8 ${isComplete ? 'bg-[#214C9A]' : 'bg-[#AAA394]/30'}`} />}
                    </div>
                    <div className="pb-6">
                      <p className={`text-sm ${isComplete ? 'font-medium text-[#151515]' : 'text-[#6B665B]'}`}>{step.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                      {isCurrent && <p className="text-xs text-[#214C9A] mt-0.5">Current status</p>}
                    </div>
                  </li>
                );
              })}
            </ol>
          </motion.div>
        )}

        {!trackedOrder && searched && (
          <p className="text-center py-8 text-sm text-[#6B665B]">No order found with this number. Please check it and try again.</p>
        )}
      </div>
    </div>
  );
}
