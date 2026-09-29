import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Package, FolderOpen, Home, BookOpen, HelpCircle, Star,
  Tag, Settings, LogOut, Plus, Pencil, Trash2, X, Save, Eye, EyeOff,
  ChevronDown, Image, AlertTriangle, Check, ArrowLeft, RefreshCw, Lock
} from 'lucide-react';
import { useDynamic, IMAGES, SIZES, ADMIN_EMAIL } from '../lib/dynamicStore';
import type { Product, Collection, JournalPost, Coupon, Review, Currency } from '../lib/types';
import type { HomepageContent, FAQItem, SiteSettings } from '../lib/dynamicStore';

// ===== Admin Login =====
export function AdminLogin() {
  const { adminLogin } = useDynamic();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setTimeout(() => {
      const success = adminLogin(email, password);
      if (!success) setError('Invalid credentials. Access denied.');
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-[#151515] rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock size={24} className="text-white" />
          </div>
          <h1 className="text-xl font-semibold tracking-[-0.02em] mb-1">Admin Access</h1>
          <p className="text-sm text-[#6B665B]">Kyveron Management Console</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-sm text-sm text-red-700 flex items-center gap-2">
              <AlertTriangle size={16} /> {error}
            </div>
          )}
          <div>
            <label className="text-xs font-medium text-[#303238] mb-1.5 block">Admin Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2.5 border border-[#8A8577] rounded-sm text-sm focus:border-[#214C9A]" placeholder="admin@kyveron.in" required />
          </div>
          <div>
            <label className="text-xs font-medium text-[#303238] mb-1.5 block">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2.5 border border-[#8A8577] rounded-sm text-sm focus:border-[#214C9A]" placeholder="••••••••••" required />
          </div>
          <button type="submit" disabled={isLoading} className="w-full py-3 bg-[#151515] text-white text-sm font-semibold rounded-sm hover:bg-[#303238] transition-colors disabled:opacity-70 flex items-center justify-center gap-2">
            {isLoading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Lock size={16} />}
            {isLoading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
        <p className="text-xs text-[#6B665B] text-center mt-6">Preview admin: changes are saved only in this browser and are not visible to other visitors.</p>
      </motion.div>
    </div>
  );
}

// ===== Admin Panel =====
export function AdminPanel() {
  const { state, adminLogout } = useDynamic();
  const [activeSection, setActiveSection] = useState('dashboard');

  if (!state.isAdminLoggedIn) return <AdminLogin />;

  const sections = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'collections', label: 'Collections', icon: FolderOpen },
    { id: 'homepage', label: 'Homepage', icon: Home },
    { id: 'journal', label: 'Journal', icon: BookOpen },
    { id: 'faqs', label: 'FAQs', icon: HelpCircle },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'coupons', label: 'Coupons', icon: Tag },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#AAA394]/20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#151515] rounded-full flex items-center justify-center">
            <Lock size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Admin Console</h1>
            <p className="text-xs text-[#6B665B]">Logged in as {state.adminUser?.email}</p>
          </div>
        </div>
        <button onClick={adminLogout} className="flex items-center gap-2 px-4 py-2 text-sm text-red-700 border border-red-200 rounded-sm hover:bg-red-50 transition-colors">
          <LogOut size={14} /> Sign Out
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <aside className="lg:w-52 flex-shrink-0">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto no-scrollbar lg:sticky lg:top-24">
            {sections.map(s => (
              <button key={s.id} onClick={() => setActiveSection(s.id)} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-sm text-sm font-medium whitespace-nowrap transition-colors ${activeSection === s.id ? 'bg-[#151515] text-white' : 'text-[#303238] hover:bg-[#AAA394]/10'}`}>
                <s.icon size={16} /> {s.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div key={activeSection} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              {activeSection === 'dashboard' && <AdminDashboard />}
              {activeSection === 'products' && <AdminProducts />}
              {activeSection === 'collections' && <AdminCollections />}
              {activeSection === 'homepage' && <AdminHomepage />}
              {activeSection === 'journal' && <AdminJournal />}
              {activeSection === 'faqs' && <AdminFAQs />}
              {activeSection === 'reviews' && <AdminReviews />}
              {activeSection === 'coupons' && <AdminCoupons />}
              {activeSection === 'settings' && <AdminSettings />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ===== Dashboard =====
function AdminDashboard() {
  const { state, formatPrice, resetAll } = useDynamic();
  const totalProducts = state.products.length;
  const publishedProducts = state.products.filter(p => p.isPublished).length;
  const totalCollections = state.collections.length;
  const activeCoupons = state.coupons.filter(c => c.isActive).length;
  const totalRevenue = state.products.reduce((s, p) => s + p.basePrice * 10, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Dashboard</h2>
        <button onClick={() => { if (confirm('Reset all data to defaults? This cannot be undone.')) resetAll(); }} className="flex items-center gap-2 px-3 py-1.5 text-xs border border-[#8A8577] rounded-sm hover:border-red-300 hover:text-red-700 transition-colors">
          <RefreshCw size={12} /> Reset All Data
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Products', value: totalProducts, sub: `${publishedProducts} published` },
          { label: 'Collections', value: totalCollections, sub: 'Active' },
          { label: 'Active Coupons', value: activeCoupons, sub: `${state.coupons.length} total` },
          { label: 'Journal Posts', value: state.journalPosts.length, sub: 'Published' },
        ].map((stat, i) => (
          <div key={i} className="p-4 bg-white/60 rounded-sm border border-[#AAA394]/10">
            <p className="text-xs text-[#6B665B] uppercase tracking-wider">{stat.label}</p>
            <p className="text-2xl font-semibold mt-1">{stat.value}</p>
            <p className="text-xs text-[#6B665B] mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="p-5 bg-white/60 rounded-sm border border-[#AAA394]/10">
        <h3 className="text-sm font-semibold mb-4">Product Inventory</h3>
        <div className="space-y-2">
          {state.products.map(p => (
            <div key={p.id} className="flex items-center justify-between py-2 border-b border-[#AAA394]/10 last:border-0">
              <div className="flex items-center gap-3">
                <img src={p.images[0]?.url} alt="" className="w-8 h-10 object-cover rounded-sm" />
                <div>
                  <p className="text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-[#6B665B]">{p.category} · {p.colors.length} colours</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{formatPrice(p.basePrice)}</p>
                <p className="text-xs text-[#6B665B]">{p.stockTotal} units</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 bg-[#214C9A]/5 border border-[#214C9A]/20 rounded-sm">
        <p className="text-xs text-[#303238]"><strong>Admin Tip:</strong> All changes are saved to browser localStorage. Use "Reset All Data" to restore defaults. In production, connect to Supabase for persistent storage.</p>
      </div>
    </div>
  );
}

// ===== Products Admin =====
function AdminProducts() {
  const { state, addProduct, updateProduct, deleteProduct, formatPrice } = useDynamic();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleDelete = (id: string) => {
    if (confirm('Delete this product? This cannot be undone.')) deleteProduct(id);
  };

  const handleCreate = () => {
    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      slug: 'new-product',
      name: 'New Product',
      description: 'Product description',
      shortDescription: 'Short description',
      category: 't-shirts',
      collection: 'core-performance',
      gender: 'unisex',
      fabric: 'Cotton',
      careInstructions: ['Machine wash cold'],
      fit: 'Regular fit',
      seoTitle: '',
      seoDescription: '',
      images: [{ id: `img-${Date.now()}`, url: IMAGES.blackTee.front, alt: 'Product image', order: 1, type: 'front' }],
      variants: SIZES.map(s => ({ id: `var-new-${s}`, sku: `KYV-NEW-${s}`, size: s, color: 'Black', price: 199900, stock: 20, isAvailable: true })),
      basePrice: 199900,
      isFeatured: false,
      isNew: true,
      isPublished: false,
      stockTotal: 100,
      rating: 0,
      reviewCount: 0,
      tags: [],
      colors: ['Black'],
      sizes: SIZES,
    };
    setEditingProduct(newProduct);
    setIsCreating(true);
  };

  const handleSave = (product: Product) => {
    if (isCreating) addProduct(product);
    else updateProduct(product);
    setEditingProduct(null);
    setIsCreating(false);
  };

  if (editingProduct) {
    return <ProductEditor product={editingProduct} onSave={handleSave} onCancel={() => { setEditingProduct(null); setIsCreating(false); }} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Products ({state.products.length})</h2>
        <button onClick={handleCreate} className="flex items-center gap-2 px-4 py-2 bg-[#151515] text-white text-sm font-medium rounded-sm hover:bg-[#303238] transition-colors">
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="bg-white/60 rounded-sm border border-[#AAA394]/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#AAA394]/20 bg-[#AAA394]/5">
                <th className="text-left py-3 px-4 font-medium text-[#6B665B]">Product</th>
                <th className="text-left py-3 px-4 font-medium text-[#6B665B]">Category</th>
                <th className="text-left py-3 px-4 font-medium text-[#6B665B]">Price</th>
                <th className="text-left py-3 px-4 font-medium text-[#6B665B]">Stock</th>
                <th className="text-left py-3 px-4 font-medium text-[#6B665B]">Status</th>
                <th className="text-right py-3 px-4 font-medium text-[#6B665B]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {state.products.map(p => (
                <tr key={p.id} className="border-b border-[#AAA394]/10 hover:bg-[#AAA394]/5">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img src={p.images[0]?.url} alt="" className="w-10 h-12 object-cover rounded-sm" />
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs text-[#6B665B]">/{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 capitalize">{p.category.replace('-', ' ')}</td>
                  <td className="py-3 px-4 font-medium">{formatPrice(p.basePrice)}</td>
                  <td className="py-3 px-4">{p.stockTotal}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 text-xs rounded-sm ${p.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {p.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button onClick={() => setEditingProduct(p)} className="p-1.5 text-[#303238] hover:text-[#214C9A] transition-colors" title="Edit"><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 text-[#303238] hover:text-red-700 transition-colors ml-1" title="Delete"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ===== Product Editor =====
function ProductEditor({ product, onSave, onCancel }: { product: Product; onSave: (p: Product) => void; onCancel: () => void }) {
  const [form, setForm] = useState<Product>({ ...product });
  const { formatPrice } = useDynamic();

  const update = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));
  const updateImage = (index: number, field: string, value: string) => {
    const newImages = [...form.images];
    newImages[index] = { ...newImages[index], [field]: value };
    setForm(prev => ({ ...prev, images: newImages }));
  };
  const addImage = () => {
    setForm(prev => ({ ...prev, images: [...prev.images, { id: `img-${Date.now()}`, url: '', alt: '', order: prev.images.length + 1, type: 'front' }] }));
  };
  const removeImage = (index: number) => {
    setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onCancel} className="p-2 hover:bg-[#AAA394]/10 rounded-sm transition-colors"><ArrowLeft size={18} /></button>
          <h2 className="text-xl font-semibold">{product.name === 'New Product' ? 'Create Product' : 'Edit Product'}</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={onCancel} className="px-4 py-2 border border-[#8A8577] text-sm rounded-sm hover:border-[#303238] transition-colors">Cancel</button>
          <button onClick={() => onSave(form)} className="flex items-center gap-2 px-4 py-2 bg-[#151515] text-white text-sm font-medium rounded-sm hover:bg-[#303238] transition-colors">
            <Save size={14} /> Save
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div className="space-y-4 bg-white/60 rounded-sm border border-[#AAA394]/10 p-5">
          <h3 className="text-sm font-semibold">Basic Information</h3>
          <div>
            <label className="text-xs font-medium text-[#303238] mb-1 block">Product Name</label>
            <input type="text" value={form.name} onChange={(e) => { update('name', e.target.value); update('slug', e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')); }} className="w-full px-3 py-2 border border-[#8A8577] rounded-sm text-sm focus:border-[#214C9A]" />
          </div>
          <div>
            <label className="text-xs font-medium text-[#303238] mb-1 block">Slug (URL)</label>
            <input type="text" value={form.slug} onChange={(e) => update('slug', e.target.value)} className="w-full px-3 py-2 border border-[#8A8577] rounded-sm text-sm focus:border-[#214C9A]" />
          </div>
          <div>
            <label className="text-xs font-medium text-[#303238] mb-1 block">Short Description</label>
            <input type="text" value={form.shortDescription} onChange={(e) => update('shortDescription', e.target.value)} className="w-full px-3 py-2 border border-[#8A8577] rounded-sm text-sm focus:border-[#214C9A]" />
          </div>
          <div>
            <label className="text-xs font-medium text-[#303238] mb-1 block">Full Description</label>
            <textarea value={form.description} onChange={(e) => update('description', e.target.value)} rows={4} className="w-full px-3 py-2 border border-[#8A8577] rounded-sm text-sm focus:border-[#214C9A] resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[#303238] mb-1 block">Category</label>
              <select value={form.category} onChange={(e) => update('category', e.target.value)} className="w-full px-3 py-2 border border-[#8A8577] rounded-sm text-sm focus:border-[#214C9A]">
                {['t-shirts', 'jackets', 'polos', 'joggers', 'hoodies', 'shorts', 'accessories'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-[#303238] mb-1 block">Collection</label>
              <select value={form.collection} onChange={(e) => update('collection', e.target.value)} className="w-full px-3 py-2 border border-[#8A8577] rounded-sm text-sm focus:border-[#214C9A]">
                <option value="core-performance">Core Performance</option>
                <option value="daily-luxury">Daily Luxury</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[#303238] mb-1 block">Gender</label>
              <select value={form.gender} onChange={(e) => update('gender', e.target.value)} className="w-full px-3 py-2 border border-[#8A8577] rounded-sm text-sm focus:border-[#214C9A]">
                <option value="men">Men</option>
                <option value="women">Women</option>
                <option value="unisex">Unisex</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-[#303238] mb-1 block">Fit</label>
              <input type="text" value={form.fit} onChange={(e) => update('fit', e.target.value)} className="w-full px-3 py-2 border border-[#8A8577] rounded-sm text-sm focus:border-[#214C9A]" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-[#303238] mb-1 block">Fabric / Material</label>
            <input type="text" value={form.fabric} onChange={(e) => update('fabric', e.target.value)} className="w-full px-3 py-2 border border-[#8A8577] rounded-sm text-sm focus:border-[#214C9A]" />
          </div>
        </div>

        {/* Pricing & Status */}
        <div className="space-y-4">
          <div className="bg-white/60 rounded-sm border border-[#AAA394]/10 p-5 space-y-4">
            <h3 className="text-sm font-semibold">Pricing</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-[#303238] mb-1 block">Price (₹)</label>
                <input type="number" value={form.basePrice / 100} onChange={(e) => update('basePrice', Math.round(parseFloat(e.target.value) * 100))} className="w-full px-3 py-2 border border-[#8A8577] rounded-sm text-sm focus:border-[#214C9A]" />
                <p className="text-xs text-[#6B665B] mt-1">= {formatPrice(form.basePrice)}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-[#303238] mb-1 block">Compare-at Price (₹)</label>
                <input type="number" value={(form.compareAtPrice || 0) / 100} onChange={(e) => update('compareAtPrice', e.target.value ? Math.round(parseFloat(e.target.value) * 100) : undefined)} className="w-full px-3 py-2 border border-[#8A8577] rounded-sm text-sm focus:border-[#214C9A]" placeholder="Optional" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-[#303238] mb-1 block">Total Stock</label>
              <input type="number" value={form.stockTotal} onChange={(e) => update('stockTotal', parseInt(e.target.value) || 0)} className="w-full px-3 py-2 border border-[#8A8577] rounded-sm text-sm focus:border-[#214C9A]" />
            </div>
          </div>

          <div className="bg-white/60 rounded-sm border border-[#AAA394]/10 p-5 space-y-3">
            <h3 className="text-sm font-semibold">Status & Flags</h3>
            {[
              { key: 'isPublished', label: 'Published' },
              { key: 'isFeatured', label: 'Featured' },
              { key: 'isNew', label: 'New Arrival' },
            ].map(flag => (
              <label key={flag.key} className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-[#303238]">{flag.label}</span>
                <button type="button" onClick={() => update(flag.key, !form[flag.key as keyof Product])} className={`w-10 h-5 rounded-full transition-colors ${(form as any)[flag.key] ? 'bg-[#214C9A]' : 'bg-[#AAA394]/30'}`}>
                  <span className={`block w-4 h-4 bg-white rounded-full shadow transition-transform ${(form as any)[flag.key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </label>
            ))}
          </div>

          <div className="bg-white/60 rounded-sm border border-[#AAA394]/10 p-5 space-y-3">
            <h3 className="text-sm font-semibold">Colours & Sizes</h3>
            <div>
              <label className="text-xs font-medium text-[#303238] mb-1 block">Colours (comma-separated)</label>
              <input type="text" value={form.colors.join(', ')} onChange={(e) => update('colors', e.target.value.split(',').map(c => c.trim()).filter(Boolean))} className="w-full px-3 py-2 border border-[#8A8577] rounded-sm text-sm focus:border-[#214C9A]" />
            </div>
            <div>
              <label className="text-xs font-medium text-[#303238] mb-1 block">Tags (comma-separated)</label>
              <input type="text" value={form.tags.join(', ')} onChange={(e) => update('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))} className="w-full px-3 py-2 border border-[#8A8577] rounded-sm text-sm focus:border-[#214C9A]" />
            </div>
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="bg-white/60 rounded-sm border border-[#AAA394]/10 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Product Images</h3>
          <button onClick={addImage} className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-[#8A8577] rounded-sm hover:border-[#303238] transition-colors">
            <Plus size={12} /> Add Image
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {form.images.map((img, i) => (
            <div key={img.id} className="border border-[#AAA394]/20 rounded-sm p-3 space-y-2">
              {img.url && <img src={img.url} alt={img.alt} className="w-full h-32 object-cover rounded-sm" />}
              <div>
                <label className="text-xs text-[#6B665B]">Image URL</label>
                <input type="text" value={img.url} onChange={(e) => updateImage(i, 'url', e.target.value)} className="w-full px-2 py-1.5 border border-[#8A8577] rounded-sm text-xs focus:border-[#214C9A]" placeholder="https://..." />
              </div>
              <div>
                <label className="text-xs text-[#6B665B]">Alt Text</label>
                <input type="text" value={img.alt} onChange={(e) => updateImage(i, 'alt', e.target.value)} className="w-full px-2 py-1.5 border border-[#8A8577] rounded-sm text-xs focus:border-[#214C9A]" />
              </div>
              <div className="flex items-center justify-between">
                <select value={img.type} onChange={(e) => updateImage(i, 'type', e.target.value)} className="px-2 py-1 border border-[#8A8577] rounded-sm text-xs">
                  <option value="front">Front</option>
                  <option value="back">Back</option>
                  <option value="detail">Detail</option>
                  <option value="lifestyle">Lifestyle</option>
                </select>
                <button onClick={() => removeImage(i)} className="p-1 text-red-500 hover:text-red-700"><Trash2 size={12} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SEO */}
      <div className="bg-white/60 rounded-sm border border-[#AAA394]/10 p-5 space-y-3">
        <h3 className="text-sm font-semibold">SEO</h3>
        <div>
          <label className="text-xs font-medium text-[#303238] mb-1 block">SEO Title</label>
          <input type="text" value={form.seoTitle} onChange={(e) => update('seoTitle', e.target.value)} className="w-full px-3 py-2 border border-[#8A8577] rounded-sm text-sm focus:border-[#214C9A]" />
        </div>
        <div>
          <label className="text-xs font-medium text-[#303238] mb-1 block">SEO Description</label>
          <textarea value={form.seoDescription} onChange={(e) => update('seoDescription', e.target.value)} rows={2} className="w-full px-3 py-2 border border-[#8A8577] rounded-sm text-sm focus:border-[#214C9A] resize-none" />
        </div>
      </div>
    </div>
  );
}

// ===== Collections Admin =====
function AdminCollections() {
  const { state, addCollection, updateCollection, deleteCollection } = useDynamic();
  const [editing, setEditing] = useState<Collection | null>(null);

  const handleCreate = () => {
    setEditing({ id: `col-${Date.now()}`, slug: 'new-collection', name: 'New Collection', description: '', bannerImage: IMAGES.lifestyle, productCount: 0 });
  };

  if (editing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setEditing(null)} className="p-2 hover:bg-[#AAA394]/10 rounded-sm"><ArrowLeft size={18} /></button>
          <h2 className="text-xl font-semibold">{editing.name === 'New Collection' ? 'Create Collection' : 'Edit Collection'}</h2>
        </div>
        <div className="bg-white/60 rounded-sm border border-[#AAA394]/10 p-5 space-y-4 max-w-lg">
          <div>
            <label className="text-xs font-medium mb-1 block">Name</label>
            <input type="text" value={editing.name} onChange={(e) => { setEditing({ ...editing, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') }); }} className="w-full px-3 py-2 border border-[#8A8577] rounded-sm text-sm focus:border-[#214C9A]" />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Slug</label>
            <input type="text" value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} className="w-full px-3 py-2 border border-[#8A8577] rounded-sm text-sm focus:border-[#214C9A]" />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Description</label>
            <textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={3} className="w-full px-3 py-2 border border-[#8A8577] rounded-sm text-sm focus:border-[#214C9A] resize-none" />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Banner Image URL</label>
            <input type="text" value={editing.bannerImage} onChange={(e) => setEditing({ ...editing, bannerImage: e.target.value })} className="w-full px-3 py-2 border border-[#8A8577] rounded-sm text-sm focus:border-[#214C9A]" />
            {editing.bannerImage && <img src={editing.bannerImage} alt="" className="mt-2 w-full h-32 object-cover rounded-sm" />}
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={() => setEditing(null)} className="px-4 py-2 border border-[#8A8577] text-sm rounded-sm">Cancel</button>
            <button onClick={() => { state.collections.find(c => c.id === editing.id) ? updateCollection(editing) : addCollection(editing); setEditing(null); }} className="flex items-center gap-2 px-4 py-2 bg-[#151515] text-white text-sm font-medium rounded-sm"><Save size={14} /> Save</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Collections ({state.collections.length})</h2>
        <button onClick={handleCreate} className="flex items-center gap-2 px-4 py-2 bg-[#151515] text-white text-sm font-medium rounded-sm hover:bg-[#303238]"><Plus size={16} /> Add Collection</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {state.collections.map(col => (
          <div key={col.id} className="bg-white/60 rounded-sm border border-[#AAA394]/10 overflow-hidden">
            <img src={col.bannerImage} alt="" className="w-full h-32 object-cover" />
            <div className="p-4">
              <h3 className="font-medium">{col.name}</h3>
              <p className="text-xs text-[#6B665B] mt-1">/{col.slug}</p>
              <p className="text-sm text-[#303238] mt-2 line-clamp-2">{col.description}</p>
              <div className="flex gap-2 mt-3">
                <button onClick={() => setEditing(col)} className="flex items-center gap-1 px-3 py-1.5 text-xs border border-[#8A8577] rounded-sm hover:border-[#303238]"><Pencil size={12} /> Edit</button>
                <button onClick={() => { if (confirm('Delete?')) deleteCollection(col.id); }} className="flex items-center gap-1 px-3 py-1.5 text-xs border border-red-200 text-red-700 rounded-sm hover:bg-red-50"><Trash2 size={12} /> Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== Homepage Admin =====
function AdminHomepage() {
  const { state, updateHomepage } = useDynamic();
  const [form, setForm] = useState<HomepageContent>({ ...state.homepage });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateHomepage(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Homepage Content</h2>
        <button onClick={handleSave} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-sm transition-colors ${saved ? 'bg-green-600 text-white' : 'bg-[#151515] text-white hover:bg-[#303238]'}`}>
          {saved ? <><Check size={14} /> Saved!</> : <><Save size={14} /> Save Changes</>}
        </button>
      </div>

      {/* Hero Section */}
      <div className="bg-white/60 rounded-sm border border-[#AAA394]/10 p-5 space-y-4">
        <h3 className="text-sm font-semibold flex items-center gap-2"><Home size={16} /> Hero Section</h3>
        <div>
          <label className="text-xs font-medium mb-1 block">Badge Text</label>
          <input type="text" value={form.heroBadge} onChange={(e) => setForm({ ...form, heroBadge: e.target.value })} className="w-full px-3 py-2 border border-[#8A8577] rounded-sm text-sm focus:border-[#214C9A]" />
        </div>
        <div>
          <label className="text-xs font-medium mb-1 block">Hero Title (use \n for line breaks)</label>
          <textarea value={form.heroTitle} onChange={(e) => setForm({ ...form, heroTitle: e.target.value })} rows={3} className="w-full px-3 py-2 border border-[#8A8577] rounded-sm text-sm focus:border-[#214C9A] resize-none" />
        </div>
        <div>
          <label className="text-xs font-medium mb-1 block">Hero Subtitle</label>
          <textarea value={form.heroSubtitle} onChange={(e) => setForm({ ...form, heroSubtitle: e.target.value })} rows={2} className="w-full px-3 py-2 border border-[#8A8577] rounded-sm text-sm focus:border-[#214C9A] resize-none" />
        </div>
        <div>
          <label className="text-xs font-medium mb-1 block">Hero Image URL</label>
          <input type="text" value={form.heroImage} onChange={(e) => setForm({ ...form, heroImage: e.target.value })} className="w-full px-3 py-2 border border-[#8A8577] rounded-sm text-sm focus:border-[#214C9A]" />
          {form.heroImage && <img src={form.heroImage} alt="" className="mt-2 w-full h-40 object-cover rounded-sm" />}
        </div>
      </div>

      {/* Featured Section */}
      <div className="bg-white/60 rounded-sm border border-[#AAA394]/10 p-5 space-y-4">
        <h3 className="text-sm font-semibold">Featured Products Section</h3>
        <div>
          <label className="text-xs font-medium mb-1 block">Section Subtitle</label>
          <input type="text" value={form.featuredSubtitle} onChange={(e) => setForm({ ...form, featuredSubtitle: e.target.value })} className="w-full px-3 py-2 border border-[#8A8577] rounded-sm text-sm focus:border-[#214C9A]" />
        </div>
        <div>
          <label className="text-xs font-medium mb-1 block">Section Title</label>
          <input type="text" value={form.featuredTitle} onChange={(e) => setForm({ ...form, featuredTitle: e.target.value })} className="w-full px-3 py-2 border border-[#8A8577] rounded-sm text-sm focus:border-[#214C9A]" />
        </div>
      </div>

      {/* Performance Banner */}
      <div className="bg-white/60 rounded-sm border border-[#AAA394]/10 p-5 space-y-4">
        <h3 className="text-sm font-semibold">Performance Collection Banner</h3>
        <div>
          <label className="text-xs font-medium mb-1 block">Subtitle</label>
          <input type="text" value={form.performanceSubtitle} onChange={(e) => setForm({ ...form, performanceSubtitle: e.target.value })} className="w-full px-3 py-2 border border-[#8A8577] rounded-sm text-sm focus:border-[#214C9A]" />
        </div>
        <div>
          <label className="text-xs font-medium mb-1 block">Title (use \n for line breaks)</label>
          <textarea value={form.performanceTitle} onChange={(e) => setForm({ ...form, performanceTitle: e.target.value })} rows={2} className="w-full px-3 py-2 border border-[#8A8577] rounded-sm text-sm focus:border-[#214C9A] resize-none" />
        </div>
        <div>
          <label className="text-xs font-medium mb-1 block">Description</label>
          <textarea value={form.performanceDescription} onChange={(e) => setForm({ ...form, performanceDescription: e.target.value })} rows={3} className="w-full px-3 py-2 border border-[#8A8577] rounded-sm text-sm focus:border-[#214C9A] resize-none" />
        </div>
        <div>
          <label className="text-xs font-medium mb-1 block">Banner Image URL</label>
          <input type="text" value={form.performanceImage} onChange={(e) => setForm({ ...form, performanceImage: e.target.value })} className="w-full px-3 py-2 border border-[#8A8577] rounded-sm text-sm focus:border-[#214C9A]" />
          {form.performanceImage && <img src={form.performanceImage} alt="" className="mt-2 w-full h-32 object-cover rounded-sm" />}
        </div>
      </div>

      {/* Brand Story */}
      <div className="bg-white/60 rounded-sm border border-[#AAA394]/10 p-5 space-y-4">
        <h3 className="text-sm font-semibold">Brand Story Section</h3>
        <div>
          <label className="text-xs font-medium mb-1 block">Subtitle</label>
          <input type="text" value={form.storySubtitle} onChange={(e) => setForm({ ...form, storySubtitle: e.target.value })} className="w-full px-3 py-2 border border-[#8A8577] rounded-sm text-sm focus:border-[#214C9A]" />
        </div>
        <div>
          <label className="text-xs font-medium mb-1 block">Title</label>
          <textarea value={form.storyTitle} onChange={(e) => setForm({ ...form, storyTitle: e.target.value })} rows={2} className="w-full px-3 py-2 border border-[#8A8577] rounded-sm text-sm focus:border-[#214C9A] resize-none" />
        </div>
        {form.storyParagraphs.map((para, i) => (
          <div key={i}>
            <label className="text-xs font-medium mb-1 block">Paragraph {i + 1}</label>
            <textarea value={para} onChange={(e) => { const newParas = [...form.storyParagraphs]; newParas[i] = e.target.value; setForm({ ...form, storyParagraphs: newParas }); }} rows={3} className="w-full px-3 py-2 border border-[#8A8577] rounded-sm text-sm focus:border-[#214C9A] resize-none" />
          </div>
        ))}
      </div>

      {/* Newsletter */}
      <div className="bg-white/60 rounded-sm border border-[#AAA394]/10 p-5 space-y-4">
        <h3 className="text-sm font-semibold">Newsletter Section</h3>
        <div>
          <label className="text-xs font-medium mb-1 block">Title</label>
          <input type="text" value={form.newsletterTitle} onChange={(e) => setForm({ ...form, newsletterTitle: e.target.value })} className="w-full px-3 py-2 border border-[#8A8577] rounded-sm text-sm focus:border-[#214C9A]" />
        </div>
        <div>
          <label className="text-xs font-medium mb-1 block">Subtitle</label>
          <input type="text" value={form.newsletterSubtitle} onChange={(e) => setForm({ ...form, newsletterSubtitle: e.target.value })} className="w-full px-3 py-2 border border-[#8A8577] rounded-sm text-sm focus:border-[#214C9A]" />
        </div>
      </div>
    </div>
  );
}

// ===== Journal Admin =====
function AdminJournal() {
  const { state, addJournalPost, updateJournalPost, deleteJournalPost } = useDynamic();
  const [editing, setEditing] = useState<JournalPost | null>(null);

  const handleCreate = () => {
    setEditing({ id: `post-${Date.now()}`, slug: 'new-post', title: 'New Post', excerpt: '', content: '', coverImage: IMAGES.brandStory, author: 'Kyveron Team', publishedAt: new Date().toISOString().split('T')[0], tags: [] });
  };

  if (editing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setEditing(null)} className="p-2 hover:bg-[#AAA394]/10 rounded-sm"><ArrowLeft size={18} /></button>
          <h2 className="text-xl font-semibold">Edit Post</h2>
        </div>
        <div className="bg-white/60 rounded-sm border border-[#AAA394]/10 p-5 space-y-4 max-w-2xl">
          <div>
            <label className="text-xs font-medium mb-1 block">Title</label>
            <input type="text" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') })} className="w-full px-3 py-2 border border-[#8A8577] rounded-sm text-sm focus:border-[#214C9A]" />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Slug</label>
            <input type="text" value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} className="w-full px-3 py-2 border border-[#8A8577] rounded-sm text-sm focus:border-[#214C9A]" />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Excerpt</label>
            <input type="text" value={editing.excerpt} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} className="w-full px-3 py-2 border border-[#8A8577] rounded-sm text-sm focus:border-[#214C9A]" />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Content</label>
            <textarea value={editing.content} onChange={(e) => setEditing({ ...editing, content: e.target.value })} rows={6} className="w-full px-3 py-2 border border-[#8A8577] rounded-sm text-sm focus:border-[#214C9A] resize-none" />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Cover Image URL</label>
            <input type="text" value={editing.coverImage} onChange={(e) => setEditing({ ...editing, coverImage: e.target.value })} className="w-full px-3 py-2 border border-[#8A8577] rounded-sm text-sm focus:border-[#214C9A]" />
            {editing.coverImage && <img src={editing.coverImage} alt="" className="mt-2 w-full h-32 object-cover rounded-sm" />}
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Author</label>
            <input type="text" value={editing.author} onChange={(e) => setEditing({ ...editing, author: e.target.value })} className="w-full px-3 py-2 border border-[#8A8577] rounded-sm text-sm focus:border-[#214C9A]" />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Tags (comma-separated)</label>
            <input type="text" value={editing.tags.join(', ')} onChange={(e) => setEditing({ ...editing, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })} className="w-full px-3 py-2 border border-[#8A8577] rounded-sm text-sm focus:border-[#214C9A]" />
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={() => setEditing(null)} className="px-4 py-2 border border-[#8A8577] text-sm rounded-sm">Cancel</button>
            <button onClick={() => { state.journalPosts.find(p => p.id === editing.id) ? updateJournalPost(editing) : addJournalPost(editing); setEditing(null); }} className="flex items-center gap-2 px-4 py-2 bg-[#151515] text-white text-sm font-medium rounded-sm"><Save size={14} /> Save</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Journal Posts ({state.journalPosts.length})</h2>
        <button onClick={handleCreate} className="flex items-center gap-2 px-4 py-2 bg-[#151515] text-white text-sm font-medium rounded-sm hover:bg-[#303238]"><Plus size={16} /> New Post</button>
      </div>
      <div className="space-y-3">
        {state.journalPosts.map(post => (
          <div key={post.id} className="flex items-center gap-4 p-4 bg-white/60 rounded-sm border border-[#AAA394]/10">
            <img src={post.coverImage} alt="" className="w-16 h-16 object-cover rounded-sm flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium truncate">{post.title}</h3>
              <p className="text-xs text-[#6B665B]">{post.publishedAt} · {post.author}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(post)} className="p-1.5 hover:text-[#214C9A]"><Pencil size={14} /></button>
              <button onClick={() => { if (confirm('Delete?')) deleteJournalPost(post.id); }} className="p-1.5 hover:text-red-700"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== FAQ Admin =====
function AdminFAQs() {
  const { state, addFAQ, updateFAQ, deleteFAQ } = useDynamic();
  const [editing, setEditing] = useState<FAQItem | null>(null);

  const handleCreate = () => setEditing({ id: `faq-${Date.now()}`, question: 'New Question', answer: 'New answer' });

  if (editing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setEditing(null)} className="p-2 hover:bg-[#AAA394]/10 rounded-sm"><ArrowLeft size={18} /></button>
          <h2 className="text-xl font-semibold">Edit FAQ</h2>
        </div>
        <div className="bg-white/60 rounded-sm border border-[#AAA394]/10 p-5 space-y-4 max-w-lg">
          <div>
            <label className="text-xs font-medium mb-1 block">Question</label>
            <input type="text" value={editing.question} onChange={(e) => setEditing({ ...editing, question: e.target.value })} className="w-full px-3 py-2 border border-[#8A8577] rounded-sm text-sm focus:border-[#214C9A]" />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Answer</label>
            <textarea value={editing.answer} onChange={(e) => setEditing({ ...editing, answer: e.target.value })} rows={4} className="w-full px-3 py-2 border border-[#8A8577] rounded-sm text-sm focus:border-[#214C9A] resize-none" />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setEditing(null)} className="px-4 py-2 border border-[#8A8577] text-sm rounded-sm">Cancel</button>
            <button onClick={() => { state.faqs.find(f => f.id === editing.id) ? updateFAQ(editing) : addFAQ(editing); setEditing(null); }} className="flex items-center gap-2 px-4 py-2 bg-[#151515] text-white text-sm font-medium rounded-sm"><Save size={14} /> Save</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">FAQs ({state.faqs.length})</h2>
        <button onClick={handleCreate} className="flex items-center gap-2 px-4 py-2 bg-[#151515] text-white text-sm font-medium rounded-sm hover:bg-[#303238]"><Plus size={16} /> Add FAQ</button>
      </div>
      <div className="space-y-2">
        {state.faqs.map(faq => (
          <div key={faq.id} className="flex items-center gap-4 p-4 bg-white/60 rounded-sm border border-[#AAA394]/10">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{faq.question}</p>
              <p className="text-xs text-[#6B665B] mt-1 truncate">{faq.answer}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(faq)} className="p-1.5 hover:text-[#214C9A]"><Pencil size={14} /></button>
              <button onClick={() => { if (confirm('Delete?')) deleteFAQ(faq.id); }} className="p-1.5 hover:text-red-700"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== Reviews Admin =====
function AdminReviews() {
  const { state, deleteReview } = useDynamic();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Reviews ({state.reviews.length})</h2>
      </div>
      <div className="p-4 bg-[#214C9A]/5 border border-[#214C9A]/20 rounded-sm text-xs space-y-1">
        <p>Reviews can only come from customers who bought the product, once the order system is live. Staff can't write or edit reviews.</p>
        <p>Remove a review only if it is unlawful, abusive, spam or not about the product. Never remove a review for being negative.</p>
      </div>
      {state.reviews.length === 0 && <p className="text-sm text-[#6B665B]">No customer reviews yet.</p>}

      <div className="space-y-2">
        {state.reviews.map(review => (
          <div key={review.id} className="flex items-start gap-4 p-4 bg-white/60 rounded-sm border border-[#AAA394]/10">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">{review.userName}</p>
                <span className="text-xs text-[#6B665B]">{'★'.repeat(review.rating)}</span>
              </div>
              <p className="text-sm font-medium mt-1">{review.title}</p>
              <p className="text-xs text-[#303238] mt-1">{review.body}</p>
            </div>
            <button onClick={() => { if (confirm('Remove this review? Only remove reviews that are unlawful, abusive or spam.')) deleteReview(review.id); }} aria-label={`Remove review by ${review.userName}`} className="p-1.5 hover:text-red-700"><Trash2 size={14} aria-hidden="true" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== Coupons Admin =====
function AdminCoupons() {
  const { state, addCoupon, updateCoupon, deleteCoupon, formatPrice } = useDynamic();
  const [editing, setEditing] = useState<Coupon | null>(null);

  const handleCreate = () => {
    setEditing({ id: `coup-${Date.now()}`, code: '', type: 'percentage', value: 10, minCartValue: 0, startDate: new Date().toISOString().split('T')[0], endDate: '2025-12-31', usageLimit: 100, usedCount: 0, isActive: true });
  };

  if (editing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setEditing(null)} className="p-2 hover:bg-[#AAA394]/10 rounded-sm"><ArrowLeft size={18} /></button>
          <h2 className="text-xl font-semibold">Edit Coupon</h2>
        </div>
        <div className="bg-white/60 rounded-sm border border-[#AAA394]/10 p-5 space-y-4 max-w-lg">
          <div>
            <label className="text-xs font-medium mb-1 block">Code</label>
            <input type="text" value={editing.code} onChange={(e) => setEditing({ ...editing, code: e.target.value.toUpperCase() })} className="w-full px-3 py-2 border border-[#8A8577] rounded-sm text-sm uppercase focus:border-[#214C9A]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium mb-1 block">Type</label>
              <select value={editing.type} onChange={(e) => setEditing({ ...editing, type: e.target.value as 'percentage' | 'fixed' })} className="w-full px-3 py-2 border border-[#8A8577] rounded-sm text-sm">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed (₹)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Value ({editing.type === 'percentage' ? '%' : '₹'})</label>
              <input type="number" value={editing.value} onChange={(e) => setEditing({ ...editing, value: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 border border-[#8A8577] rounded-sm text-sm" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Min Cart Value (₹)</label>
            <input type="number" value={(editing.minCartValue || 0) / 100} onChange={(e) => setEditing({ ...editing, minCartValue: Math.round((parseFloat(e.target.value) || 0) * 100) })} className="w-full px-3 py-2 border border-[#8A8577] rounded-sm text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium mb-1 block">Start Date</label>
              <input type="date" value={editing.startDate} onChange={(e) => setEditing({ ...editing, startDate: e.target.value })} className="w-full px-3 py-2 border border-[#8A8577] rounded-sm text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">End Date</label>
              <input type="date" value={editing.endDate} onChange={(e) => setEditing({ ...editing, endDate: e.target.value })} className="w-full px-3 py-2 border border-[#8A8577] rounded-sm text-sm" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Usage Limit</label>
            <input type="number" value={editing.usageLimit || 0} onChange={(e) => setEditing({ ...editing, usageLimit: parseInt(e.target.value) || undefined })} className="w-full px-3 py-2 border border-[#8A8577] rounded-sm text-sm" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={editing.isActive} onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })} className="w-4 h-4 rounded" />
            <span className="text-sm">Active</span>
          </label>
          <div className="flex gap-2 pt-2">
            <button onClick={() => setEditing(null)} className="px-4 py-2 border border-[#8A8577] text-sm rounded-sm">Cancel</button>
            <button onClick={() => { state.coupons.find(c => c.id === editing.id) ? updateCoupon(editing) : addCoupon(editing); setEditing(null); }} className="flex items-center gap-2 px-4 py-2 bg-[#151515] text-white text-sm font-medium rounded-sm"><Save size={14} /> Save</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Coupons ({state.coupons.length})</h2>
        <button onClick={handleCreate} className="flex items-center gap-2 px-4 py-2 bg-[#151515] text-white text-sm font-medium rounded-sm hover:bg-[#303238]"><Plus size={16} /> Add Coupon</button>
      </div>
      <div className="bg-white/60 rounded-sm border border-[#AAA394]/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#AAA394]/20 bg-[#AAA394]/5">
              <th className="text-left py-3 px-4 font-medium text-[#6B665B]">Code</th>
              <th className="text-left py-3 px-4 font-medium text-[#6B665B]">Type</th>
              <th className="text-left py-3 px-4 font-medium text-[#6B665B]">Value</th>
              <th className="text-left py-3 px-4 font-medium text-[#6B665B]">Used</th>
              <th className="text-left py-3 px-4 font-medium text-[#6B665B]">Status</th>
              <th className="text-right py-3 px-4 font-medium text-[#6B665B]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {state.coupons.map(c => (
              <tr key={c.id} className="border-b border-[#AAA394]/10">
                <td className="py-3 px-4 font-mono font-medium">{c.code}</td>
                <td className="py-3 px-4 capitalize">{c.type}</td>
                <td className="py-3 px-4">{c.type === 'percentage' ? `${c.value}%` : formatPrice(c.value)}</td>
                <td className="py-3 px-4">{c.usedCount}/{c.usageLimit || '∞'}</td>
                <td className="py-3 px-4"><span className={`px-2 py-0.5 text-xs rounded-sm ${c.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{c.isActive ? 'Active' : 'Inactive'}</span></td>
                <td className="py-3 px-4 text-right">
                  <button onClick={() => setEditing(c)} className="p-1.5 hover:text-[#214C9A]"><Pencil size={14} /></button>
                  <button onClick={() => { if (confirm('Delete?')) deleteCoupon(c.id); }} className="p-1.5 hover:text-red-700 ml-1"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ===== Settings Admin =====
function AdminSettings() {
  const { state, updateSettings, formatPrice } = useDynamic();
  const [form, setForm] = useState<SiteSettings>({ ...state.settings });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Site Settings</h2>
        <button onClick={handleSave} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-sm transition-colors ${saved ? 'bg-green-600 text-white' : 'bg-[#151515] text-white hover:bg-[#303238]'}`}>
          {saved ? <><Check size={14} /> Saved!</> : <><Save size={14} /> Save</>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/60 rounded-sm border border-[#AAA394]/10 p-5 space-y-4">
          <h3 className="text-sm font-semibold">Brand</h3>
          <div>
            <label className="text-xs font-medium mb-1 block">Brand Name</label>
            <input type="text" value={form.brandName} onChange={(e) => setForm({ ...form, brandName: e.target.value })} className="w-full px-3 py-2 border border-[#8A8577] rounded-sm text-sm focus:border-[#214C9A]" />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Currency</label>
            <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value as Currency })} className="w-full px-3 py-2 border border-[#8A8577] rounded-sm text-sm">
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
        </div>

        <div className="bg-white/60 rounded-sm border border-[#AAA394]/10 p-5 space-y-4">
          <h3 className="text-sm font-semibold">Contact</h3>
          <div>
            <label className="text-xs font-medium mb-1 block">Support Email</label>
            <input type="email" value={form.supportEmail} onChange={(e) => setForm({ ...form, supportEmail: e.target.value })} className="w-full px-3 py-2 border border-[#8A8577] rounded-sm text-sm focus:border-[#214C9A]" />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Support Phone</label>
            <input type="text" value={form.supportPhone} onChange={(e) => setForm({ ...form, supportPhone: e.target.value })} className="w-full px-3 py-2 border border-[#8A8577] rounded-sm text-sm focus:border-[#214C9A]" />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">WhatsApp</label>
            <input type="text" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className="w-full px-3 py-2 border border-[#8A8577] rounded-sm text-sm focus:border-[#214C9A]" />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Service Hours</label>
            <input type="text" value={form.serviceHours} onChange={(e) => setForm({ ...form, serviceHours: e.target.value })} className="w-full px-3 py-2 border border-[#8A8577] rounded-sm text-sm focus:border-[#214C9A]" />
          </div>
        </div>

        <div className="bg-white/60 rounded-sm border border-[#AAA394]/10 p-5 space-y-4">
          <h3 className="text-sm font-semibold">Shipping</h3>
          <div>
            <label className="text-xs font-medium mb-1 block">Free Shipping Threshold (₹)</label>
            <input type="number" value={form.freeShippingThreshold / 100} onChange={(e) => setForm({ ...form, freeShippingThreshold: Math.round((parseFloat(e.target.value) || 0) * 100) })} className="w-full px-3 py-2 border border-[#8A8577] rounded-sm text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Shipping Charge (₹)</label>
            <input type="number" value={form.shippingCharge / 100} onChange={(e) => setForm({ ...form, shippingCharge: Math.round((parseFloat(e.target.value) || 0) * 100) })} className="w-full px-3 py-2 border border-[#8A8577] rounded-sm text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Cash on Delivery Fee (₹)</label>
            <input type="number" value={form.codFee / 100} onChange={(e) => setForm({ ...form, codFee: Math.round((parseFloat(e.target.value) || 0) * 100) })} className="w-full px-3 py-2 border border-[#8A8577] rounded-sm text-sm" />
            <p className="text-xs text-[#6B665B] mt-1">Shown to customers before they choose cash on delivery.</p>
          </div>
        </div>

        <div className="bg-white/60 rounded-sm border border-[#AAA394]/10 p-5 space-y-4">
          <h3 className="text-sm font-semibold">Policies</h3>
          <div>
            <label className="text-xs font-medium mb-1 block">Return Window (days)</label>
            <input type="number" value={form.returnWindowDays} onChange={(e) => setForm({ ...form, returnWindowDays: parseInt(e.target.value) || 7 })} className="w-full px-3 py-2 border border-[#8A8577] rounded-sm text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">GST Rate (%)</label>
            <input type="number" value={form.gstRate} onChange={(e) => setForm({ ...form, gstRate: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 border border-[#8A8577] rounded-sm text-sm" />
          </div>
        </div>
      </div>

      <div className="p-4 bg-[#214C9A]/5 border border-[#214C9A]/20 rounded-sm">
        <p className="text-xs"><strong>Preview only:</strong> settings saved here apply to this browser alone. Seller, grievance-officer and contact details shown to customers are set in <code>src/lib/business.ts</code>. The admin sign-in ({ADMIN_EMAIL}) is checked in the browser and is not secure. Replace it with server-side authentication before launch.</p>
      </div>
    </div>
  );
}
