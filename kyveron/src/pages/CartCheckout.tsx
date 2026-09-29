import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Minus, Plus, Trash2, ArrowRight, Tag, ShoppingBag } from 'lucide-react';
import { Reveal } from '../components/Layout';
import { useStore } from '../lib/store';
import { useDynamic } from '../lib/dynamicStore';

export default function CartPage() {
  const { state, removeFromCart, updateQuantity, applyCoupon, formatPrice } = useStore();
  const { validateCoupon } = useDynamic();
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');

  const handleApplyCoupon = () => {
    const result = validateCoupon(couponCode, state.cart.subtotal);
    if (result.valid) {
      applyCoupon(couponCode.toUpperCase());
      setCouponError('');
    } else {
      setCouponError(result.message);
    }
  };

  if (state.cart.items.length === 0) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <ShoppingBag size={64} className="text-[#AAA394] mx-auto mb-6" />
        <h1 className="text-2xl font-semibold mb-3">Your cart is empty</h1>
        <p className="text-[#AAA394] mb-8">Looks like you haven't added anything to your cart yet.</p>
        <Link to="/shop" className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#151515] text-white text-sm font-semibold rounded-sm hover:bg-[#303238] transition-colors">
          Start Shopping <ArrowRight size={16} />
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
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {state.cart.items.map((item) => (
            <motion.div key={item.variantId} layout className="flex gap-4 p-4 bg-white/60 rounded-sm border border-[#AAA394]/10">
              <Link to={`/products/${item.product.slug}`} className="flex-shrink-0">
                <img src={item.product.images[0]?.url} alt={item.product.name} className="w-24 h-32 object-cover rounded-sm" />
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between gap-2">
                  <div>
                    <Link to={`/products/${item.product.slug}`} className="text-sm font-medium hover:text-[#214C9A] transition-colors">{item.product.name}</Link>
                    <p className="text-xs text-[#AAA394] mt-0.5">{item.color} / {item.size}</p>
                  </div>
                  <button onClick={() => removeFromCart(item.variantId)} className="p-1.5 text-[#AAA394] hover:text-red-600 transition-colors self-start" aria-label="Remove item"><Trash2 size={16} /></button>
                </div>
                <div className="flex items-end justify-between mt-4">
                  <div className="flex items-center border border-[#AAA394]/30 rounded-sm">
                    <button onClick={() => updateQuantity(item.variantId, item.quantity - 1)} className="p-2 hover:bg-[#AAA394]/10 transition-colors" aria-label="Decrease"><Minus size={14} /></button>
                    <span className="px-3 text-sm font-medium">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.variantId, item.quantity + 1)} className="p-2 hover:bg-[#AAA394]/10 transition-colors" aria-label="Increase"><Plus size={14} /></button>
                  </div>
                  <p className="text-sm font-semibold">{formatPrice(item.product.basePrice * item.quantity)}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white/60 rounded-sm border border-[#AAA394]/10 p-6">
            <h2 className="text-lg font-semibold mb-6">Order Summary</h2>

            {/* Coupon */}
            <div className="mb-6">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#AAA394]" />
                  <input type="text" value={couponCode} onChange={(e) => { setCouponCode(e.target.value); setCouponError(''); }} placeholder="Coupon code" className="w-full pl-9 pr-3 py-2.5 border border-[#AAA394]/30 rounded-sm text-sm focus:outline-none focus:border-[#214C9A]" />
                </div>
                <button onClick={handleApplyCoupon} className="px-4 py-2.5 bg-[#151515] text-white text-xs font-medium rounded-sm hover:bg-[#303238] transition-colors">Apply</button>
              </div>
              {couponError && <p className="text-xs text-red-600 mt-1">{couponError}</p>}
              {state.cart.couponCode && <p className="text-xs text-green-700 mt-1">✓ {state.cart.couponCode} applied</p>}
            </div>

            {/* Totals */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-[#303238]">Subtotal</span><span className="font-medium">{formatPrice(state.cart.subtotal)}</span></div>
              {state.cart.discount > 0 && <div className="flex justify-between text-green-700"><span>Discount</span><span>-{formatPrice(state.cart.discount)}</span></div>}
              <div className="flex justify-between"><span className="text-[#303238]">Shipping</span><span className="font-medium">{state.cart.shipping === 0 ? 'Free' : formatPrice(state.cart.shipping)}</span></div>
              <div className="flex justify-between"><span className="text-[#303238]">Tax (est.)</span><span className="font-medium">{formatPrice(state.cart.tax)}</span></div>
              <div className="flex justify-between text-base font-semibold pt-3 border-t border-[#AAA394]/20"><span>Total</span><span>{formatPrice(state.cart.total)}</span></div>
            </div>

            <Link to="/checkout" className="block w-full text-center mt-6 py-3.5 bg-[#151515] text-white text-sm font-semibold rounded-sm hover:bg-[#303238] transition-colors">
              Proceed to Checkout
            </Link>
            <Link to="/shop" className="block text-center mt-3 text-sm text-[#303238] hover:text-[#151515] transition-colors">
              Continue Shopping
            </Link>

            <p className="text-xs text-[#AAA394] mt-4 text-center">Secure checkout powered by Razorpay</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== Checkout Page =====
export function CheckoutPage() {
  const navigate = useNavigate();
  const { state, formatPrice, clearCart, showToast, dispatch } = useStore();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    email: '', phone: '', firstName: '', lastName: '',
    address1: '', address2: '', city: '', stateName: '', pincode: '', country: 'India',
    shippingSame: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (state.cart.items.length === 0) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h1 className="text-2xl font-semibold mb-3">Your cart is empty</h1>
        <Link to="/shop" className="inline-flex items-center gap-2 px-6 py-3 bg-[#151515] text-white text-sm font-medium rounded-sm">Shop Now</Link>
      </div>
    );
  }

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = 'Valid email required';
    if (!formData.phone.match(/^\d{10}$/)) newErrors.phone = 'Valid 10-digit mobile required';
    if (!formData.firstName.trim()) newErrors.firstName = 'First name required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name required';
    if (!formData.address1.trim()) newErrors.address1 = 'Address required';
    if (!formData.city.trim()) newErrors.city = 'City required';
    if (!formData.stateName.trim()) newErrors.stateName = 'State required';
    if (!formData.pincode.match(/^\d{6}$/)) newErrors.pincode = 'Valid 6-digit PIN code required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
  };

  const handlePlaceOrder = () => {
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      const orderId = `KYV-${Date.now().toString(36).toUpperCase()}`;
      const order = {
        id: crypto.randomUUID(),
        orderNumber: orderId,
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
        shippingAddress: { id: '1', firstName: formData.firstName, lastName: formData.lastName, phone: formData.phone, addressLine1: formData.address1, addressLine2: formData.address2, city: formData.city, state: formData.stateName, pincode: formData.pincode, country: formData.country, isDefault: true, type: 'shipping' as const },
        billingAddress: { id: '2', firstName: formData.firstName, lastName: formData.lastName, phone: formData.phone, addressLine1: formData.address1, addressLine2: formData.address2, city: formData.city, state: formData.stateName, pincode: formData.pincode, country: formData.country, isDefault: true, type: 'billing' as const },
        subtotal: state.cart.subtotal,
        discount: state.cart.discount,
        shipping: state.cart.shipping,
        tax: state.cart.tax,
        total: state.cart.total,
        currency: 'INR' as const,
        status: 'paid' as const,
        paymentStatus: 'captured' as const,
        paymentId: `pay_${Date.now()}`,
        gatewayOrderId: `order_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        statusHistory: [{ from: 'pending_payment' as const, to: 'paid' as const, timestamp: new Date().toISOString(), actor: 'system', note: 'Payment captured via Razorpay' }],
      };
      dispatch({ type: 'ADD_ORDER', payload: order });
      clearCart();
      setIsProcessing(false);
      navigate(`/order-confirmation/${orderId}`);
    }, 2000);
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <h1 className="text-2xl lg:text-3xl font-semibold tracking-[-0.02em] mb-8">Checkout</h1>

      {/* Steps */}
      <div className="flex items-center gap-4 mb-8">
        {['Contact & Shipping', 'Payment'].map((label, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${step > i + 1 ? 'bg-green-600 text-white' : step === i + 1 ? 'bg-[#151515] text-white' : 'bg-[#AAA394]/20 text-[#AAA394]'}`}>
              {step > i + 1 ? '✓' : i + 1}
            </div>
            <span className={`text-sm ${step === i + 1 ? 'font-medium' : 'text-[#AAA394]'}`}>{label}</span>
            {i < 1 && <div className="w-8 h-px bg-[#AAA394]/30 mx-2" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        <div className="lg:col-span-2">
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-[#303238] mb-1 block">Email *</label>
                    <input type="email" value={formData.email} onChange={(e) => updateField('email', e.target.value)} className={`w-full px-3 py-2.5 border rounded-sm text-sm focus:outline-none focus:border-[#214C9A] ${errors.email ? 'border-red-400' : 'border-[#AAA394]/30'}`} placeholder="your@email.com" />
                    {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#303238] mb-1 block">Mobile *</label>
                    <input type="tel" value={formData.phone} onChange={(e) => updateField('phone', e.target.value.replace(/\D/g, '').slice(0, 10))} className={`w-full px-3 py-2.5 border rounded-sm text-sm focus:outline-none focus:border-[#214C9A] ${errors.phone ? 'border-red-400' : 'border-[#AAA394]/30'}`} placeholder="10-digit mobile" />
                    {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-[#303238] mb-1 block">First Name *</label>
                    <input type="text" value={formData.firstName} onChange={(e) => updateField('firstName', e.target.value)} className={`w-full px-3 py-2.5 border rounded-sm text-sm focus:outline-none focus:border-[#214C9A] ${errors.firstName ? 'border-red-400' : 'border-[#AAA394]/30'}`} />
                    {errors.firstName && <p className="text-xs text-red-600 mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#303238] mb-1 block">Last Name *</label>
                    <input type="text" value={formData.lastName} onChange={(e) => updateField('lastName', e.target.value)} className={`w-full px-3 py-2.5 border rounded-sm text-sm focus:outline-none focus:border-[#214C9A] ${errors.lastName ? 'border-red-400' : 'border-[#AAA394]/30'}`} />
                    {errors.lastName && <p className="text-xs text-red-600 mt-1">{errors.lastName}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-medium text-[#303238] mb-1 block">Address Line 1 *</label>
                    <input type="text" value={formData.address1} onChange={(e) => updateField('address1', e.target.value)} className={`w-full px-3 py-2.5 border rounded-sm text-sm focus:outline-none focus:border-[#214C9A] ${errors.address1 ? 'border-red-400' : 'border-[#AAA394]/30'}`} placeholder="House no., street, area" />
                    {errors.address1 && <p className="text-xs text-red-600 mt-1">{errors.address1}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-medium text-[#303238] mb-1 block">Address Line 2</label>
                    <input type="text" value={formData.address2 || ''} onChange={(e) => updateField('address2', e.target.value)} className="w-full px-3 py-2.5 border border-[#AAA394]/30 rounded-sm text-sm focus:outline-none focus:border-[#214C9A]" placeholder="Landmark (optional)" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#303238] mb-1 block">City *</label>
                    <input type="text" value={formData.city} onChange={(e) => updateField('city', e.target.value)} className={`w-full px-3 py-2.5 border rounded-sm text-sm focus:outline-none focus:border-[#214C9A] ${errors.city ? 'border-red-400' : 'border-[#AAA394]/30'}`} />
                    {errors.city && <p className="text-xs text-red-600 mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#303238] mb-1 block">State *</label>
                    <input type="text" value={formData.stateName} onChange={(e) => updateField('stateName', e.target.value)} className={`w-full px-3 py-2.5 border rounded-sm text-sm focus:outline-none focus:border-[#214C9A] ${errors.stateName ? 'border-red-400' : 'border-[#AAA394]/30'}`} />
                    {errors.stateName && <p className="text-xs text-red-600 mt-1">{errors.stateName}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#303238] mb-1 block">PIN Code *</label>
                    <input type="text" value={formData.pincode} onChange={(e) => updateField('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))} className={`w-full px-3 py-2.5 border rounded-sm text-sm focus:outline-none focus:border-[#214C9A] ${errors.pincode ? 'border-red-400' : 'border-[#AAA394]/30'}`} placeholder="6-digit PIN" />
                    {errors.pincode && <p className="text-xs text-red-600 mt-1">{errors.pincode}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#303238] mb-1 block">Country</label>
                    <input type="text" value="India" disabled className="w-full px-3 py-2.5 border border-[#AAA394]/20 rounded-sm text-sm bg-[#AAA394]/5 text-[#AAA394]" />
                  </div>
                </div>
              </div>

              <button onClick={handleNext} className="w-full py-3.5 bg-[#151515] text-white text-sm font-semibold rounded-sm hover:bg-[#303238] transition-colors">
                Continue to Payment
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
                <div className="space-y-3">
                  {['UPI (GPay, PhonePe, Paytm)', 'Credit / Debit Card', 'Net Banking', 'Wallets', 'Cash on Delivery (₹49 extra)'].map((method, i) => (
                    <label key={i} className="flex items-center gap-3 p-4 border border-[#AAA394]/20 rounded-sm cursor-pointer hover:border-[#303238] transition-colors">
                      <input type="radio" name="payment" defaultChecked={i === 0} className="w-4 h-4 text-[#214C9A]" />
                      <span className="text-sm font-medium">{method}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-white/60 rounded-sm border border-[#AAA394]/10">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 mt-0.5 rounded text-[#214C9A]" />
                  <span className="text-xs text-[#303238]">I agree to the <Link to="/terms" className="text-[#214C9A] underline">Terms & Conditions</Link> and <Link to="/privacy" className="text-[#214C9A] underline">Privacy Policy</Link>.</span>
                </label>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="px-6 py-3.5 border border-[#AAA394]/30 text-sm font-medium rounded-sm hover:border-[#303238] transition-colors">Back</button>
                <button onClick={handlePlaceOrder} disabled={isProcessing} className="flex-1 py-3.5 bg-[#151515] text-white text-sm font-semibold rounded-sm hover:bg-[#303238] transition-colors disabled:opacity-70 flex items-center justify-center gap-2">
                  {isProcessing ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
                  ) : (
                    `Pay ${formatPrice(state.cart.total)}`
                  )}
                </button>
              </div>
              <p className="text-xs text-[#AAA394] text-center">Payments are secured by Razorpay. We never store your card details.</p>
            </motion.div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white/60 rounded-sm border border-[#AAA394]/10 p-6">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4">
              {state.cart.items.map(item => (
                <div key={item.variantId} className="flex gap-3">
                  <img src={item.product.images[0]?.url} alt={item.product.name} className="w-12 h-14 object-cover rounded-sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{item.product.name}</p>
                    <p className="text-xs text-[#AAA394]">{item.color} / {item.size} × {item.quantity}</p>
                  </div>
                  <p className="text-xs font-medium">{formatPrice(item.product.basePrice * item.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2 text-sm border-t border-[#AAA394]/20 pt-4">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(state.cart.subtotal)}</span></div>
              {state.cart.discount > 0 && <div className="flex justify-between text-green-700"><span>Discount</span><span>-{formatPrice(state.cart.discount)}</span></div>}
              <div className="flex justify-between"><span>Shipping</span><span>{state.cart.shipping === 0 ? 'Free' : formatPrice(state.cart.shipping)}</span></div>
              <div className="flex justify-between"><span>Tax</span><span>{formatPrice(state.cart.tax)}</span></div>
              <div className="flex justify-between text-base font-semibold pt-2 border-t border-[#AAA394]/20"><span>Total</span><span>{formatPrice(state.cart.total)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== Order Confirmation =====
export function OrderConfirmationPage() {
  const { state, formatPrice } = useStore();
  const order = state.orders[0];

  if (!order) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h1 className="text-2xl font-semibold mb-3">Order not found</h1>
        <Link to="/shop" className="text-sm text-[#214C9A] hover:underline">Continue shopping</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-24">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h1 className="text-2xl font-semibold mb-2">Order Confirmed!</h1>
        <p className="text-[#AAA394]">Thank you for your order. A confirmation email has been sent to {order.email}.</p>
      </motion.div>

      <div className="bg-white/60 rounded-sm border border-[#AAA394]/10 p-6 space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs text-[#AAA394] uppercase tracking-wider">Order Number</p>
            <p className="text-lg font-semibold">{order.orderNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#AAA394] uppercase tracking-wider">Status</p>
            <span className="inline-block px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-sm capitalize">{order.status.replace('_', ' ')}</span>
          </div>
        </div>

        <div className="border-t border-[#AAA394]/20 pt-4">
          <h3 className="text-sm font-semibold mb-3">Items</h3>
          <div className="space-y-3">
            {order.items.map(item => (
              <div key={item.id} className="flex gap-3">
                <img src={item.image} alt={item.productName} className="w-14 h-16 object-cover rounded-sm" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.productName}</p>
                  <p className="text-xs text-[#AAA394]">{item.variantName} × {item.quantity}</p>
                  <p className="text-sm font-medium mt-1">{formatPrice(item.price * item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-[#AAA394]/20 pt-4 space-y-2 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
          {order.discount > 0 && <div className="flex justify-between text-green-700"><span>Discount</span><span>-{formatPrice(order.discount)}</span></div>}
          <div className="flex justify-between"><span>Shipping</span><span>{order.shipping === 0 ? 'Free' : formatPrice(order.shipping)}</span></div>
          <div className="flex justify-between"><span>Tax</span><span>{formatPrice(order.tax)}</span></div>
          <div className="flex justify-between text-base font-semibold pt-2 border-t border-[#AAA394]/20"><span>Total Paid</span><span>{formatPrice(order.total)}</span></div>
        </div>

        <div className="border-t border-[#AAA394]/20 pt-4">
          <h3 className="text-sm font-semibold mb-2">Shipping To</h3>
          <p className="text-sm text-[#303238]">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
          <p className="text-sm text-[#303238]">{order.shippingAddress.addressLine1}</p>
          <p className="text-sm text-[#303238]">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}</p>
        </div>

        <div className="border-t border-[#AAA394]/20 pt-4">
          <p className="text-sm text-[#AAA394]">Estimated delivery: <span className="text-[#151515] font-medium">3-5 business days</span></p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-8">
        <Link to="/track-order" className="flex-1 text-center py-3 border border-[#151515] text-[#151515] text-sm font-medium rounded-sm hover:bg-[#151515] hover:text-white transition-colors">Track Order</Link>
        <Link to="/shop" className="flex-1 text-center py-3 bg-[#151515] text-white text-sm font-semibold rounded-sm hover:bg-[#303238] transition-colors">Continue Shopping</Link>
      </div>
    </div>
  );
}
