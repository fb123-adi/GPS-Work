import { useState, useId, ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Minus, Plus, Trash2, ArrowRight, Tag, ShoppingBag, Info } from 'lucide-react';
import { Reveal, CartTotals } from '../components/Layout';
import { useStore, MAX_QUANTITY } from '../lib/store';
import { useDynamic } from '../lib/dynamicStore';
import { MINIMUM_AGE } from '../lib/business';
import type { Order } from '../lib/types';

// Shown wherever a visitor might think money is about to move.
function PreviewNotice() {
  return (
    <div role="note" className="flex gap-3 p-4 mb-6 bg-[#214C9A]/5 border border-[#214C9A]/30 rounded-sm text-sm text-[#303238]">
      <Info size={18} className="text-[#214C9A] flex-shrink-0 mt-0.5" aria-hidden="true" />
      <p><strong>Preview store.</strong> Payments are not live yet. Placing an order here does not charge you, and nothing will be delivered.</p>
    </div>
  );
}

export default function CartPage() {
  const { state, removeFromCart, updateQuantity, applyCoupon, removeCoupon, formatPrice } = useStore();
  const { validateCoupon } = useDynamic();
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const couponId = useId();

  const handleApplyCoupon = () => {
    const result = validateCoupon(couponCode, state.cart.subtotal);
    if (result.valid) {
      applyCoupon(couponCode.toUpperCase());
      setCouponError('');
      setCouponCode('');
    } else {
      setCouponError(result.message);
    }
  };

  if (state.cart.items.length === 0) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <ShoppingBag size={64} className="text-[#AAA394] mx-auto mb-6" aria-hidden="true" />
        <h1 className="text-2xl font-semibold mb-3">Your cart is empty</h1>
        <p className="text-[#6B665B] mb-8">Looks like you haven't added anything to your cart yet.</p>
        <Link to="/shop" className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#151515] text-white text-sm font-semibold rounded-sm hover:bg-[#303238] transition-colors">
          Start Shopping <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <Reveal>
        <h1 className="text-2xl lg:text-3xl font-semibold tracking-[-0.02em] mb-8">Shopping Cart</h1>
      </Reveal>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        <ul className="lg:col-span-2 space-y-4" aria-label="Items in your cart">
          {state.cart.items.map((item) => (
            <motion.li key={item.variantId} layout className="flex gap-4 p-4 bg-white/60 rounded-sm border border-[#AAA394]/20">
              <Link to={`/products/${item.product.slug}`} className="flex-shrink-0" tabIndex={-1} aria-hidden="true">
                <img src={item.product.images[0]?.url} alt="" className="w-24 h-32 object-cover rounded-sm" />
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between gap-2">
                  <div>
                    <Link to={`/products/${item.product.slug}`} className="text-sm font-medium hover:text-[#214C9A] transition-colors">{item.product.name}</Link>
                    <p className="text-xs text-[#6B665B] mt-0.5">{item.color} / {item.size}</p>
                  </div>
                  <button onClick={() => removeFromCart(item.variantId)} className="p-1.5 text-[#6B665B] hover:text-red-700 transition-colors self-start" aria-label={`Remove ${item.product.name} from cart`}><Trash2 size={16} aria-hidden="true" /></button>
                </div>
                <div className="flex items-end justify-between mt-4">
                  <div className="flex items-center border border-[#8A8577] rounded-sm">
                    <button onClick={() => updateQuantity(item.variantId, item.quantity - 1)} className="p-2 hover:bg-[#AAA394]/10 transition-colors" aria-label={`Decrease quantity of ${item.product.name}`}><Minus size={14} aria-hidden="true" /></button>
                    <span className="px-3 text-sm font-medium" aria-label={`Quantity ${item.quantity}`}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.variantId, item.quantity + 1)} disabled={item.quantity >= MAX_QUANTITY} className="p-2 hover:bg-[#AAA394]/10 transition-colors disabled:opacity-40" aria-label={`Increase quantity of ${item.product.name}`}><Plus size={14} aria-hidden="true" /></button>
                  </div>
                  <p className="text-sm font-semibold">{formatPrice(item.product.basePrice * item.quantity)}</p>
                </div>
              </div>
            </motion.li>
          ))}
        </ul>

        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white/60 rounded-sm border border-[#AAA394]/20 p-6">
            <h2 className="text-lg font-semibold mb-6">Order Summary</h2>

            <div className="mb-6">
              <label htmlFor={couponId} className="text-xs font-medium text-[#303238] mb-1.5 block">Discount code</label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B665B]" aria-hidden="true" />
                  <input id={couponId} type="text" value={couponCode} onChange={(e) => { setCouponCode(e.target.value); setCouponError(''); }} aria-invalid={!!couponError} aria-describedby={couponError ? `${couponId}-err` : undefined} className="w-full pl-9 pr-3 py-2.5 border border-[#8A8577] rounded-sm text-sm focus:border-[#214C9A]" />
                </div>
                <button onClick={handleApplyCoupon} disabled={!couponCode.trim()} className="px-4 py-2.5 bg-[#151515] text-white text-xs font-medium rounded-sm hover:bg-[#303238] transition-colors disabled:opacity-50">Apply</button>
              </div>
              {couponError && <p id={`${couponId}-err`} className="text-xs text-red-700 mt-1" role="alert">{couponError}</p>}
              {state.cart.couponCode && (
                <p className="text-xs text-green-800 mt-1 flex items-center gap-2">✓ {state.cart.couponCode} applied
                  <button type="button" onClick={removeCoupon} className="underline text-[#303238]">Remove</button>
                </p>
              )}
            </div>

            <CartTotals />

            <Link to="/checkout" className="block w-full text-center mt-6 py-3.5 bg-[#151515] text-white text-sm font-semibold rounded-sm hover:bg-[#303238] transition-colors">
              Proceed to Checkout
            </Link>
            <Link to="/shop" className="block text-center mt-3 text-sm text-[#303238] hover:text-[#151515] transition-colors">
              Continue Shopping
            </Link>
            <p className="text-xs text-[#6B665B] mt-4 text-center">Preview store: payments are not live yet.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== Checkout form field =====
function Field({ label, error, hint, required, children }: { label: string; error?: string; hint?: string; required?: boolean; children: (props: { id: string; 'aria-invalid': boolean; 'aria-describedby'?: string; required?: boolean }) => ReactNode }) {
  const id = useId();
  const describedBy = [hint && `${id}-hint`, error && `${id}-err`].filter(Boolean).join(' ') || undefined;
  return (
    <div>
      <label htmlFor={id} className="text-xs font-medium text-[#303238] mb-1 block">{label}{required && <span aria-hidden="true"> *</span>}</label>
      {children({ id, 'aria-invalid': !!error, 'aria-describedby': describedBy, required })}
      {hint && <p id={`${id}-hint`} className="text-xs text-[#6B665B] mt-1">{hint}</p>}
      {error && <p id={`${id}-err`} className="text-xs text-red-700 mt-1">{error}</p>}
    </div>
  );
}

const PAYMENT_METHODS = [
  { id: 'upi', label: 'UPI' },
  { id: 'card', label: 'Credit / debit card' },
  { id: 'netbanking', label: 'Net banking' },
  { id: 'wallet', label: 'Wallets' },
  { id: 'cod', label: 'Cash on delivery' },
];

// ===== Checkout Page =====
export function CheckoutPage() {
  const navigate = useNavigate();
  const { state, formatPrice, clearCart, dispatch } = useStore();
  const { state: dyn } = useDynamic();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [consents, setConsents] = useState({ terms: false, age: false, marketing: false });
  const [formData, setFormData] = useState({
    email: state.user?.email || '', phone: state.user?.phone || '', firstName: '', lastName: '',
    address1: '', address2: '', city: '', stateName: '', pincode: '', country: 'India',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const codFee = paymentMethod === 'cod' ? dyn.settings.codFee : 0;
  const payableTotal = state.cart.total + codFee;

  if (state.cart.items.length === 0) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h1 className="text-2xl font-semibold mb-3">Your cart is empty</h1>
        <Link to="/shop" className="inline-flex items-center gap-2 px-6 py-3 bg-[#151515] text-white text-sm font-medium rounded-sm">Shop Now</Link>
      </div>
    );
  }

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Enter a valid email address';
    if (!formData.phone.match(/^\d{10}$/)) e.phone = 'Enter a 10-digit mobile number';
    if (!formData.firstName.trim()) e.firstName = 'Enter your first name';
    if (!formData.lastName.trim()) e.lastName = 'Enter your last name';
    if (!formData.address1.trim()) e.address1 = 'Enter your address';
    if (!formData.city.trim()) e.city = 'Enter your city';
    if (!formData.stateName.trim()) e.stateName = 'Enter your state';
    if (!formData.pincode.match(/^\d{6}$/)) e.pincode = 'Enter a 6-digit PIN code';
    setErrors(e);
    if (Object.keys(e).length) requestAnimationFrame(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
    return Object.keys(e).length === 0;
  };

  const handleNext = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (validateStep1()) setStep(2);
  };

  const handlePlaceOrder = (ev: React.FormEvent) => {
    ev.preventDefault();
    const e: Record<string, string> = {};
    if (!consents.terms) e.terms = 'Please accept the Terms of Service and Privacy Policy to place your order';
    if (!consents.age) e.age = `You must be at least ${MINIMUM_AGE} to place an order`;
    setErrors(e);
    if (Object.keys(e).length) { requestAnimationFrame(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()); return; }

    setIsProcessing(true);
    const now = new Date().toISOString();
    const orderNumber = `KYV-${Date.now().toString(36).toUpperCase()}`;
    const address = { firstName: formData.firstName, lastName: formData.lastName, phone: formData.phone, addressLine1: formData.address1, addressLine2: formData.address2, city: formData.city, state: formData.stateName, pincode: formData.pincode, country: formData.country, isDefault: true };
    const order: Order = {
      id: crypto.randomUUID(),
      orderNumber,
      email: formData.email,
      phone: formData.phone,
      items: state.cart.items.map(item => ({
        id: crypto.randomUUID(),
        productId: item.productId,
        variantId: item.variantId,
        productName: item.product.name,
        variantName: `${item.color} / ${item.size}`,
        quantity: item.quantity,
        price: item.product.basePrice,
        image: item.product.images[0]?.url || '',
      })),
      shippingAddress: { id: '1', ...address, type: 'shipping' },
      billingAddress: { id: '2', ...address, type: 'billing' },
      subtotal: state.cart.subtotal,
      discount: state.cart.discount,
      shipping: state.cart.shipping,
      codFee,
      tax: state.cart.tax,
      total: payableTotal,
      currency: 'INR',
      status: 'pending_payment',
      paymentStatus: 'pending',
      paymentMethod: PAYMENT_METHODS.find(m => m.id === paymentMethod)?.label,
      isPreview: true,
      createdAt: now,
      updatedAt: now,
      statusHistory: [{ from: 'pending_payment', to: 'pending_payment', timestamp: now, actor: 'system', note: 'Preview order: no payment taken' }],
    };
    if (state.user && consents.marketing !== !!state.user.marketingOptIn) dispatch({ type: 'UPDATE_USER', payload: { marketingOptIn: consents.marketing } });
    dispatch({ type: 'ADD_ORDER', payload: order });
    clearCart();
    setIsProcessing(false);
    navigate(`/order-confirmation/${orderNumber}`);
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };
  const inputClass = (field: string) => `w-full px-3 py-2.5 border rounded-sm text-sm bg-white/70 focus:border-[#214C9A] ${errors[field] ? 'border-red-700' : 'border-[#8A8577]'}`;

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <h1 className="text-2xl lg:text-3xl font-semibold tracking-[-0.02em] mb-6">Checkout</h1>
      <PreviewNotice />

      <ol className="flex items-center gap-4 mb-8" aria-label="Checkout steps">
        {['Contact & delivery', 'Payment & review'].map((label, i) => (
          <li key={i} className="flex items-center gap-2" aria-current={step === i + 1 ? 'step' : undefined}>
            <span aria-hidden="true" className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${step > i + 1 ? 'bg-green-800 text-white' : step === i + 1 ? 'bg-[#151515] text-white' : 'bg-[#AAA394]/30 text-[#303238]'}`}>
              {step > i + 1 ? '✓' : i + 1}
            </span>
            <span className={`text-sm ${step === i + 1 ? 'font-medium' : 'text-[#6B665B]'}`}>{label}</span>
            {i < 1 && <span className="w-8 h-px bg-[#AAA394]/40 mx-2" aria-hidden="true" />}
          </li>
        ))}
      </ol>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        <div className="lg:col-span-2">
          {step === 1 && (
            <motion.form onSubmit={handleNext} noValidate initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <fieldset>
                <legend className="text-lg font-semibold mb-4">Contact information</legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Email" required error={errors.email} hint="For your order confirmation and updates.">{p => (
                    <input {...p} type="email" autoComplete="email" value={formData.email} onChange={(e) => updateField('email', e.target.value)} className={inputClass('email')} />
                  )}</Field>
                  <Field label="Mobile" required error={errors.phone} hint="Shared with the courier so they can reach you about delivery.">{p => (
                    <input {...p} type="tel" inputMode="numeric" autoComplete="tel-national" value={formData.phone} onChange={(e) => updateField('phone', e.target.value.replace(/\D/g, '').slice(0, 10))} className={inputClass('phone')} />
                  )}</Field>
                </div>
              </fieldset>

              <fieldset>
                <legend className="text-lg font-semibold mb-4">Delivery address</legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="First name" required error={errors.firstName}>{p => <input {...p} type="text" autoComplete="given-name" value={formData.firstName} onChange={(e) => updateField('firstName', e.target.value)} className={inputClass('firstName')} />}</Field>
                  <Field label="Last name" required error={errors.lastName}>{p => <input {...p} type="text" autoComplete="family-name" value={formData.lastName} onChange={(e) => updateField('lastName', e.target.value)} className={inputClass('lastName')} />}</Field>
                  <div className="sm:col-span-2">
                    <Field label="Address line 1" required error={errors.address1} hint="House number, street, area">{p => <input {...p} type="text" autoComplete="address-line1" value={formData.address1} onChange={(e) => updateField('address1', e.target.value)} className={inputClass('address1')} />}</Field>
                  </div>
                  <div className="sm:col-span-2">
                    <Field label="Address line 2 (optional)" hint="Landmark">{p => <input {...p} type="text" autoComplete="address-line2" value={formData.address2} onChange={(e) => updateField('address2', e.target.value)} className={inputClass('address2')} />}</Field>
                  </div>
                  <Field label="City" required error={errors.city}>{p => <input {...p} type="text" autoComplete="address-level2" value={formData.city} onChange={(e) => updateField('city', e.target.value)} className={inputClass('city')} />}</Field>
                  <Field label="State" required error={errors.stateName}>{p => <input {...p} type="text" autoComplete="address-level1" value={formData.stateName} onChange={(e) => updateField('stateName', e.target.value)} className={inputClass('stateName')} />}</Field>
                  <Field label="PIN code" required error={errors.pincode}>{p => <input {...p} type="text" inputMode="numeric" autoComplete="postal-code" value={formData.pincode} onChange={(e) => updateField('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))} className={inputClass('pincode')} />}</Field>
                  <Field label="Country">{p => <input {...p} type="text" value="India" readOnly className="w-full px-3 py-2.5 border border-[#AAA394]/40 rounded-sm text-sm bg-[#AAA394]/10 text-[#303238]" />}</Field>
                </div>
              </fieldset>

              <button type="submit" className="w-full py-3.5 bg-[#151515] text-white text-sm font-semibold rounded-sm hover:bg-[#303238] transition-colors">
                Continue to payment
              </button>
            </motion.form>
          )}

          {step === 2 && (
            <motion.form onSubmit={handlePlaceOrder} noValidate initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <fieldset>
                <legend className="text-lg font-semibold mb-4">Payment method</legend>
                <div className="space-y-3">
                  {PAYMENT_METHODS.map(m => (
                    <label key={m.id} className={`flex items-center gap-3 p-4 border rounded-sm cursor-pointer transition-colors ${paymentMethod === m.id ? 'border-[#151515]' : 'border-[#8A8577]/60 hover:border-[#303238]'}`}>
                      <input type="radio" name="payment" value={m.id} checked={paymentMethod === m.id} onChange={() => setPaymentMethod(m.id)} className="w-4 h-4 accent-[#214C9A]" />
                      <span className="text-sm font-medium">{m.label}</span>
                      {m.id === 'cod' && <span className="text-xs text-[#6B665B] ml-auto">+{formatPrice(dyn.settings.codFee)} fee</span>}
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset className="p-4 bg-white/60 rounded-sm border border-[#AAA394]/20 space-y-3">
                <legend className="sr-only">Agreements</legend>
                <Consent id="consent-terms" checked={consents.terms} error={errors.terms} onChange={(v) => { setConsents(c => ({ ...c, terms: v })); setErrors(({ terms, ...rest }) => rest); }} required>
                  I agree to the <Link to="/terms" className="text-[#214C9A] underline">Terms of Service</Link> and have read the <Link to="/privacy" className="text-[#214C9A] underline">Privacy Policy</Link> and <Link to="/refund-policy" className="text-[#214C9A] underline">Refund Policy</Link>.
                </Consent>
                <Consent id="consent-age" checked={consents.age} error={errors.age} onChange={(v) => { setConsents(c => ({ ...c, age: v })); setErrors(({ age, ...rest }) => rest); }} required>
                  I am {MINIMUM_AGE} years of age or older.
                </Consent>
                <Consent id="consent-marketing" checked={consents.marketing} onChange={(v) => setConsents(c => ({ ...c, marketing: v }))}>
                  Optional: send me occasional emails about new collections and offers. I can unsubscribe at any time.
                </Consent>
                <p className="text-xs text-[#6B665B]">We'll email you about this order whatever you choose. Those messages aren't marketing.</p>
              </fieldset>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="px-6 py-3.5 border border-[#8A8577] text-sm font-medium rounded-sm hover:border-[#303238] transition-colors">Back</button>
                <button type="submit" disabled={isProcessing} className="flex-1 py-3.5 bg-[#151515] text-white text-sm font-semibold rounded-sm hover:bg-[#303238] transition-colors disabled:opacity-70">
                  Place preview order · {formatPrice(payableTotal)}
                </button>
              </div>
              <p className="text-xs text-[#6B665B] text-center">No payment is taken in this preview.</p>
            </motion.form>
          )}
        </div>

        <aside className="lg:col-span-1" aria-labelledby="checkout-summary">
          <div className="sticky top-24 bg-white/60 rounded-sm border border-[#AAA394]/20 p-6">
            <h2 id="checkout-summary" className="text-lg font-semibold mb-4">Order Summary</h2>
            <ul className="space-y-3 mb-4">
              {state.cart.items.map(item => (
                <li key={item.variantId} className="flex gap-3">
                  <img src={item.product.images[0]?.url} alt="" className="w-12 h-14 object-cover rounded-sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{item.product.name}</p>
                    <p className="text-xs text-[#6B665B]">{item.color} / {item.size} × {item.quantity}</p>
                  </div>
                  <p className="text-xs font-medium">{formatPrice(item.product.basePrice * item.quantity)}</p>
                </li>
              ))}
            </ul>
            <div className="border-t border-[#AAA394]/20 pt-4">
              <CartTotals codFee={codFee} totalLabel="Total to pay" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Consent({ id, checked, onChange, error, required, children }: { id: string; checked: boolean; onChange: (v: boolean) => void; error?: string; required?: boolean; children: ReactNode }) {
  return (
    <div>
      <div className="flex items-start gap-2">
        <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} required={required} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} className="w-4 h-4 mt-0.5 accent-[#214C9A]" />
        <label htmlFor={id} className="text-sm text-[#303238]">{children}{required && <span className="sr-only"> (required)</span>}</label>
      </div>
      {error && <p id={`${id}-err`} className="text-xs text-red-700 mt-1 ml-6">{error}</p>}
    </div>
  );
}

// ===== Order Confirmation =====
export function OrderConfirmationPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { state, formatPrice } = useStore();
  const order = state.orders.find(o => o.orderNumber === orderId);

  if (!order) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h1 className="text-2xl font-semibold mb-3">Order not found</h1>
        <p className="text-sm text-[#6B665B] mb-4">Preview orders are kept only in this browser tab.</p>
        <Link to="/shop" className="text-sm text-[#214C9A] hover:underline">Continue shopping</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-24">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <h1 className="text-2xl font-semibold mb-2">Preview order recorded</h1>
        <p className="text-[#6B665B]">This is a preview store, so no payment was taken, no email was sent and nothing will be delivered. The order is kept only in this browser tab.</p>
      </motion.div>

      <div className="bg-white/60 rounded-sm border border-[#AAA394]/20 p-6 space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs text-[#6B665B] uppercase tracking-wider">Order number</p>
            <p className="text-lg font-semibold">{order.orderNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#6B665B] uppercase tracking-wider">Payment</p>
            <p className="text-sm font-medium">{order.paymentMethod} · not charged</p>
          </div>
        </div>

        <div className="border-t border-[#AAA394]/20 pt-4">
          <h2 className="text-sm font-semibold mb-3">Items</h2>
          <ul className="space-y-3">
            {order.items.map(item => (
              <li key={item.id} className="flex gap-3">
                <img src={item.image} alt="" className="w-14 h-16 object-cover rounded-sm" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.productName}</p>
                  <p className="text-xs text-[#6B665B]">{item.variantName} × {item.quantity}</p>
                  <p className="text-sm font-medium mt-1">{formatPrice(item.price * item.quantity)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <dl className="border-t border-[#AAA394]/20 pt-4 space-y-2 text-sm">
          <div className="flex justify-between"><dt>Items</dt><dd>{formatPrice(order.subtotal)}</dd></div>
          {order.discount > 0 && <div className="flex justify-between text-green-800"><dt>Discount</dt><dd>−{formatPrice(order.discount)}</dd></div>}
          <div className="flex justify-between"><dt>Delivery</dt><dd>{order.shipping === 0 ? 'Free' : formatPrice(order.shipping)}</dd></div>
          {!!order.codFee && <div className="flex justify-between"><dt>Cash on delivery fee</dt><dd>{formatPrice(order.codFee)}</dd></div>}
          <div className="flex justify-between text-base font-semibold pt-2 border-t border-[#AAA394]/20"><dt>Total</dt><dd>{formatPrice(order.total)}</dd></div>
          <p className="text-xs text-[#6B665B]">Includes GST of {formatPrice(order.tax)}.</p>
        </dl>

        <div className="border-t border-[#AAA394]/20 pt-4">
          <h2 className="text-sm font-semibold mb-2">Delivery address</h2>
          <p className="text-sm text-[#303238]">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
          <p className="text-sm text-[#303238]">{order.shippingAddress.addressLine1}</p>
          <p className="text-sm text-[#303238]">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-8">
        <Link to="/track-order" className="flex-1 text-center py-3 border border-[#151515] text-[#151515] text-sm font-medium rounded-sm hover:bg-[#151515] hover:text-white transition-colors">Track Order</Link>
        <Link to="/shop" className="flex-1 text-center py-3 bg-[#151515] text-white text-sm font-semibold rounded-sm hover:bg-[#303238] transition-colors">Continue Shopping</Link>
      </div>
    </div>
  );
}
