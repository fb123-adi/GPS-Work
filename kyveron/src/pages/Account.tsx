import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, Heart, Package, MapPin, Settings, LogOut, Trash2 } from 'lucide-react';
import { Reveal, ProductCard } from '../components/Layout';
import { useStore } from '../lib/store';
import { useDynamic } from '../lib/dynamicStore';

// ===== Login Page =====
export function LoginPage() {
  const navigate = useNavigate();
  const { login, showToast } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setIsLoading(true);
    setTimeout(() => {
      login({ id: 'user-001', email, name: email.split('@')[0], role: 'customer', createdAt: new Date().toISOString(), addresses: [], wishlist: [] });
      setIsLoading(false);
      showToast('Welcome back!', 'success');
      navigate('/account');
    }, 1000);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold tracking-[-0.02em] mb-2">Welcome back</h1>
          <p className="text-sm text-[#AAA394]">Sign in to your Kyveron account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-sm text-sm text-red-700">{error}</div>}

          <div>
            <label className="text-xs font-medium text-[#303238] mb-1.5 block">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#AAA394]" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-3 py-3 border border-[#AAA394]/30 rounded-sm text-sm focus:outline-none focus:border-[#214C9A]" placeholder="your@email.com" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-[#303238] mb-1.5 block">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#AAA394]" />
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-10 py-3 border border-[#AAA394]/30 rounded-sm text-sm focus:outline-none focus:border-[#214C9A]" placeholder="••••••••" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#AAA394]">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded text-[#214C9A]" />
              <span className="text-xs text-[#303238]">Remember me</span>
            </label>
            <Link to="/forgot-password" className="text-xs text-[#214C9A] hover:underline">Forgot password?</Link>
          </div>

          <button type="submit" disabled={isLoading} className="w-full py-3.5 bg-[#151515] text-white text-sm font-semibold rounded-sm hover:bg-[#303238] transition-colors disabled:opacity-70 flex items-center justify-center gap-2">
            {isLoading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</> : 'Sign In'}
          </button>

          <div className="relative py-3">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#AAA394]/20" /></div>
            <div className="relative flex justify-center"><span className="px-3 bg-[#F2EEE6] text-xs text-[#AAA394]">or continue with</span></div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <button type="button" className="flex items-center justify-center gap-2 py-2.5 border border-[#AAA394]/30 rounded-sm text-xs font-medium hover:bg-white/60 transition-colors">Google</button>
            <button type="button" className="flex items-center justify-center gap-2 py-2.5 border border-[#AAA394]/30 rounded-sm text-xs font-medium hover:bg-white/60 transition-colors">Apple</button>
            <button type="button" className="flex items-center justify-center gap-2 py-2.5 border border-[#AAA394]/30 rounded-sm text-xs font-medium hover:bg-white/60 transition-colors">Facebook</button>
          </div>
          <p className="text-xs text-[#AAA394] text-center">Social login requires provider configuration.</p>
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
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '', agreeTerms: false });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name required';
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = 'Valid email required';
    if (!formData.phone.match(/^\d{10}$/)) newErrors.phone = 'Valid 10-digit mobile required';
    if (formData.password.length < 8) newErrors.password = 'Min 8 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords don\'t match';
    if (!formData.agreeTerms) newErrors.agreeTerms = 'Please agree to terms';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);
    setTimeout(() => {
      login({ id: 'user-new', email: formData.email, name: formData.name, phone: formData.phone, role: 'customer', createdAt: new Date().toISOString(), addresses: [], wishlist: [] });
      setIsLoading(false);
      showToast('Account created! Welcome to Kyveron.', 'success');
      navigate('/account');
    }, 1200);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold tracking-[-0.02em] mb-2">Create your account</h1>
          <p className="text-sm text-[#AAA394]">Join Kyveron for a premium shopping experience</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-[#303238] mb-1.5 block">Full Name *</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} className={`w-full px-3 py-3 border rounded-sm text-sm focus:outline-none focus:border-[#214C9A] ${errors.name ? 'border-red-400' : 'border-[#AAA394]/30'}`} placeholder="Your full name" />
            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="text-xs font-medium text-[#303238] mb-1.5 block">Email *</label>
            <input type="email" value={formData.email} onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))} className={`w-full px-3 py-3 border rounded-sm text-sm focus:outline-none focus:border-[#214C9A] ${errors.email ? 'border-red-400' : 'border-[#AAA394]/30'}`} placeholder="your@email.com" />
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="text-xs font-medium text-[#303238] mb-1.5 block">Mobile Number *</label>
            <input type="tel" value={formData.phone} onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))} className={`w-full px-3 py-3 border rounded-sm text-sm focus:outline-none focus:border-[#214C9A] ${errors.phone ? 'border-red-400' : 'border-[#AAA394]/30'}`} placeholder="10-digit mobile" />
            {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
          </div>
          <div>
            <label className="text-xs font-medium text-[#303238] mb-1.5 block">Password *</label>
            <input type="password" value={formData.password} onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))} className={`w-full px-3 py-3 border rounded-sm text-sm focus:outline-none focus:border-[#214C9A] ${errors.password ? 'border-red-400' : 'border-[#AAA394]/30'}`} placeholder="Min 8 characters" />
            {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
          </div>
          <div>
            <label className="text-xs font-medium text-[#303238] mb-1.5 block">Confirm Password *</label>
            <input type="password" value={formData.confirmPassword} onChange={(e) => setFormData(p => ({ ...p, confirmPassword: e.target.value }))} className={`w-full px-3 py-3 border rounded-sm text-sm focus:outline-none focus:border-[#214C9A] ${errors.confirmPassword ? 'border-red-400' : 'border-[#AAA394]/30'}`} placeholder="Re-enter password" />
            {errors.confirmPassword && <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>}
          </div>
          <div>
            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" checked={formData.agreeTerms} onChange={(e) => setFormData(p => ({ ...p, agreeTerms: e.target.checked }))} className="w-4 h-4 mt-0.5 rounded text-[#214C9A]" />
              <span className="text-xs text-[#303238]">I agree to the <Link to="/terms" className="text-[#214C9A] underline">Terms & Conditions</Link> and <Link to="/privacy" className="text-[#214C9A] underline">Privacy Policy</Link>. I consent to receive order updates via email and SMS.</span>
            </label>
            {errors.agreeTerms && <p className="text-xs text-red-600 mt-1">{errors.agreeTerms}</p>}
          </div>
          <button type="submit" disabled={isLoading} className="w-full py-3.5 bg-[#151515] text-white text-sm font-semibold rounded-sm hover:bg-[#303238] transition-colors disabled:opacity-70 flex items-center justify-center gap-2">
            {isLoading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating account...</> : 'Create Account'}
          </button>
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
  const { state, logout, formatPrice } = useStore();
  const { state: dynState } = useDynamic();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders');

  if (!state.isAuthenticated) {
    navigate('/login');
    return null;
  }

  const tabs = [
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="bg-white/60 rounded-sm border border-[#AAA394]/10 p-5">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#AAA394]/10">
              <div className="w-10 h-10 bg-[#151515] rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {state.user?.name?.[0]?.toUpperCase() || 'K'}
              </div>
              <div>
                <p className="text-sm font-medium">{state.user?.name}</p>
                <p className="text-xs text-[#AAA394]">{state.user?.email}</p>
              </div>
            </div>
            <nav className="space-y-1">
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm transition-colors ${activeTab === tab.id ? 'bg-[#151515] text-white' : 'text-[#303238] hover:bg-[#AAA394]/10'}`}>
                  <tab.icon size={16} /> {tab.label}
                </button>
              ))}
              <button onClick={() => { logout(); navigate('/'); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm text-red-600 hover:bg-red-50 transition-colors mt-4">
                <LogOut size={16} /> Sign Out
              </button>
            </nav>
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'orders' && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Order History</h2>
              {state.orders.length === 0 ? (
                <div className="text-center py-12 bg-white/60 rounded-sm border border-[#AAA394]/10">
                  <Package size={40} className="text-[#AAA394] mx-auto mb-3" />
                  <p className="text-sm text-[#303238] mb-2">No orders yet</p>
                  <Link to="/shop" className="text-sm text-[#214C9A] hover:underline">Start shopping</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {state.orders.map(order => (
                    <Link key={order.id} to={`/order-confirmation/${order.orderNumber}`} className="block p-5 bg-white/60 rounded-sm border border-[#AAA394]/10 hover:border-[#303238] transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-sm font-semibold">{order.orderNumber}</p>
                          <p className="text-xs text-[#AAA394]">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        </div>
                        <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-sm capitalize">{order.status.replace('_', ' ')}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-[#AAA394]">{order.items.length} item{order.items.length > 1 ? 's' : ''}</p>
                        <p className="text-sm font-semibold">{formatPrice(order.total)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'addresses' && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Saved Addresses</h2>
              <div className="p-8 bg-white/60 rounded-sm border border-[#AAA394]/10 text-center">
                <MapPin size={40} className="text-[#AAA394] mx-auto mb-3" />
                <p className="text-sm text-[#303238] mb-4">No saved addresses yet</p>
                <button className="px-6 py-2.5 bg-[#151515] text-white text-sm font-medium rounded-sm hover:bg-[#303238] transition-colors">Add Address</button>
              </div>
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div>
              <h2 className="text-xl font-semibold mb-6">My Wishlist</h2>
              {state.wishlist.length === 0 ? (
                <div className="p-8 bg-white/60 rounded-sm border border-[#AAA394]/10 text-center">
                  <Heart size={40} className="text-[#AAA394] mx-auto mb-3" />
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
            <div>
              <h2 className="text-xl font-semibold mb-6">Account Settings</h2>
              <div className="bg-white/60 rounded-sm border border-[#AAA394]/10 p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-semibold mb-3">Profile Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-[#303238] mb-1 block">Name</label>
                      <input type="text" defaultValue={state.user?.name} className="w-full px-3 py-2.5 border border-[#AAA394]/30 rounded-sm text-sm focus:outline-none focus:border-[#214C9A]" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[#303238] mb-1 block">Email</label>
                      <input type="email" defaultValue={state.user?.email} className="w-full px-3 py-2.5 border border-[#AAA394]/30 rounded-sm text-sm focus:outline-none focus:border-[#214C9A]" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[#303238] mb-1 block">Phone</label>
                      <input type="tel" defaultValue={state.user?.phone || ''} className="w-full px-3 py-2.5 border border-[#AAA394]/30 rounded-sm text-sm focus:outline-none focus:border-[#214C9A]" />
                    </div>
                  </div>
                  <button className="mt-4 px-6 py-2.5 bg-[#151515] text-white text-sm font-medium rounded-sm hover:bg-[#303238] transition-colors">Save Changes</button>
                </div>
                <div className="border-t border-[#AAA394]/20 pt-6">
                  <h3 className="text-sm font-semibold mb-3">Change Password</h3>
                  <div className="space-y-3 max-w-sm">
                    <input type="password" placeholder="Current password" className="w-full px-3 py-2.5 border border-[#AAA394]/30 rounded-sm text-sm focus:outline-none focus:border-[#214C9A]" />
                    <input type="password" placeholder="New password" className="w-full px-3 py-2.5 border border-[#AAA394]/30 rounded-sm text-sm focus:outline-none focus:border-[#214C9A]" />
                    <button className="px-6 py-2.5 bg-[#151515] text-white text-sm font-medium rounded-sm hover:bg-[#303238] transition-colors">Update Password</button>
                  </div>
                </div>
                <div className="border-t border-[#AAA394]/20 pt-6">
                  <h3 className="text-sm font-semibold mb-2 text-red-600">Danger Zone</h3>
                  <p className="text-xs text-[#AAA394] mb-3">Request account deletion. This action is irreversible.</p>
                  <button className="px-4 py-2 border border-red-300 text-red-600 text-xs font-medium rounded-sm hover:bg-red-50 transition-colors">Request Account Deletion</button>
                </div>
              </div>
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
          <Heart size={48} className="text-[#AAA394] mx-auto mb-4" />
          <p className="text-lg font-medium text-[#303238] mb-2">Your wishlist is empty</p>
          <p className="text-sm text-[#AAA394] mb-6">Save items you love and come back to them later.</p>
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
  const [trackedOrder, setTrackedOrder] = useState<typeof state.orders[0] | null>(state.orders[0] || null);

  const handleTrack = () => {
    const found = state.orders.find(o => o.orderNumber === orderNumber.toUpperCase());
    setTrackedOrder(found || null);
  };

  const statusSteps = ['pending_payment', 'paid', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered'];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Reveal>
        <h1 className="text-2xl font-semibold tracking-[-0.02em] mb-8 text-center">Track Your Order</h1>
      </Reveal>

      <div className="bg-white/60 rounded-sm border border-[#AAA394]/10 p-6 mb-8">
        <div className="flex gap-3">
          <input type="text" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} placeholder="Enter order number (e.g., KYV-...)" className="flex-1 px-4 py-3 border border-[#AAA394]/30 rounded-sm text-sm focus:outline-none focus:border-[#214C9A]" />
          <button onClick={handleTrack} className="px-6 py-3 bg-[#151515] text-white text-sm font-medium rounded-sm hover:bg-[#303238] transition-colors">Track</button>
        </div>
      </div>

      {trackedOrder && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/60 rounded-sm border border-[#AAA394]/10 p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-xs text-[#AAA394] uppercase tracking-wider">Order</p>
              <p className="text-lg font-semibold">{trackedOrder.orderNumber}</p>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-sm capitalize">{trackedOrder.status.replace('_', ' ')}</span>
          </div>

          {/* Timeline */}
          <div className="space-y-0">
            {statusSteps.map((step, i) => {
              const currentIdx = statusSteps.indexOf(trackedOrder.status);
              const isComplete = i <= currentIdx;
              const isCurrent = i === currentIdx;
              return (
                <div key={step} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${isComplete ? 'bg-[#214C9A]' : 'bg-[#AAA394]/30'} ${isCurrent ? 'ring-4 ring-[#214C9A]/20' : ''}`} />
                    {i < statusSteps.length - 1 && <div className={`w-0.5 h-8 ${isComplete ? 'bg-[#214C9A]' : 'bg-[#AAA394]/20'}`} />}
                  </div>
                  <div className="pb-6">
                    <p className={`text-sm ${isComplete ? 'font-medium text-[#151515]' : 'text-[#AAA394]'}`}>{step.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                    {isCurrent && <p className="text-xs text-[#214C9A] mt-0.5">Current status</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {!trackedOrder && orderNumber && (
        <div className="text-center py-8">
          <p className="text-sm text-[#AAA394]">No order found with this number. Please check and try again.</p>
        </div>
      )}
    </div>
  );
}
