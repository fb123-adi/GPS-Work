import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Share2, Truck, RotateCcw, Shield, Star, Minus, Plus, ChevronRight, Check } from 'lucide-react';
import { Reveal, ProductCard } from '../components/Layout';
import { useDynamic } from '../lib/dynamicStore';
import { useStore } from '../lib/store';
import type { Product } from '../lib/types';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { state: dynState, getProductBySlug } = useDynamic();
  const product = getProductBySlug(slug || '');
  const { addToCart, toggleWishlist, state, formatPrice, showToast } = useStore();

  const [selectedColor, setSelectedColor] = useState(product?.colors[0] || '');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [pincode, setPincode] = useState('');
  const [deliveryEstimate, setDeliveryEstimate] = useState('');

  if (!product) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h1 className="text-2xl font-semibold mb-4">Product not found</h1>
        <p className="text-[#AAA394] mb-6">The product you're looking for doesn't exist or has been removed.</p>
        <Link to="/shop" className="inline-flex items-center gap-2 px-6 py-3 bg-[#151515] text-white text-sm font-medium rounded-sm">Back to Shop</Link>
      </div>
    );
  }

  const isWished = state.wishlist.includes(product.id);
  const selectedVariant = product.variants.find((v: any) => v.color === selectedColor && v.size === selectedSize);
  const isAvailable = selectedVariant?.isAvailable ?? false;
  const relatedProducts = dynState.products.filter((p: any) => p.id !== product.id && (p.category === product.category || p.collection === product.collection) && p.isPublished).slice(0, 4);

  const checkDelivery = () => {
    if (pincode.length === 6) {
      setDeliveryEstimate('3-5 business days');
    } else {
      showToast('Please enter a valid 6-digit PIN code', 'error');
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize) { showToast('Please select a size', 'error'); return; }
    if (!selectedVariant?.isAvailable) { showToast('This variant is currently unavailable', 'error'); return; }
    const variantId = selectedVariant!.id;
    addToCart(product.id, variantId, selectedSize, selectedColor, quantity);
  };

  const handleBuyNow = () => {
    if (!selectedSize) { showToast('Please select a size', 'error'); return; }
    handleAddToCart();
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-[#AAA394] mb-6">
        <Link to="/" className="hover:text-[#151515] transition-colors">Home</Link>
        <ChevronRight size={12} />
        <Link to="/shop" className="hover:text-[#151515] transition-colors">Shop</Link>
        <ChevronRight size={12} />
        <Link to={`/collections/${product.collection}`} className="hover:text-[#151515] transition-colors capitalize">{product.collection.replace('-', ' ')}</Link>
        <ChevronRight size={12} />
        <span className="text-[#151515]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
        {/* Image Gallery */}
        <div className="space-y-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="aspect-[3/4] overflow-hidden rounded-sm bg-[#e8e4dc]">
            <img src={product.images[activeImage]?.url} alt={product.images[activeImage]?.alt} className="w-full h-full object-cover" />
          </motion.div>
          {product.images.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img, i) => (
                <button key={img.id} onClick={() => setActiveImage(i)} className={`w-20 h-24 rounded-sm overflow-hidden border-2 transition-colors ${i === activeImage ? 'border-[#151515]' : 'border-transparent hover:border-[#AAA394]/50'}`}>
                  <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <Reveal>
            <div className="space-y-6">
              {/* Header */}
              <div>
                {product.isNew && <span className="inline-block px-2 py-0.5 bg-[#214C9A] text-white text-[10px] font-semibold uppercase tracking-wider rounded-sm mb-3">New Arrival</span>}
                <h1 className="text-2xl lg:text-3xl font-semibold tracking-[-0.02em] mb-2">{product.name}</h1>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} className={i < Math.floor(product.rating) ? 'fill-[#151515] text-[#151515]' : 'text-[#AAA394]'} />)}
                  </div>
                  <span className="text-sm text-[#AAA394]">{product.rating} ({product.reviewCount} reviews)</span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3">
                <span className="text-2xl font-semibold">{formatPrice(product.basePrice)}</span>
                {product.compareAtPrice && (
                  <>
                    <span className="text-lg text-[#AAA394] line-through">{formatPrice(product.compareAtPrice)}</span>
                    <span className="text-sm font-medium text-green-700">{Math.round((1 - product.basePrice / product.compareAtPrice) * 100)}% off</span>
                  </>
                )}
              </div>
              <p className="text-xs text-[#AAA394]">Inclusive of all taxes. Shipping calculated at checkout.</p>

              {/* Color Selection */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">Colour: <span className="text-[#AAA394]">{selectedColor}</span></span>
                </div>
                <div className="flex gap-2">
                  {product.colors.map(color => (
                    <button key={color} onClick={() => { setSelectedColor(color); setSelectedSize(''); }} className={`px-4 py-2 text-sm border rounded-sm transition-colors ${selectedColor === color ? 'bg-[#151515] text-white border-[#151515]' : 'border-[#AAA394]/30 hover:border-[#303238]'}`}>
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">Size: {selectedSize && <span className="text-[#AAA394]">{selectedSize}</span>}</span>
                  <button onClick={() => setShowSizeGuide(true)} className="text-xs text-[#214C9A] hover:underline">Size Guide</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(size => {
                    const variant = product.variants.find(v => v.color === selectedColor && v.size === size);
                    const available = variant?.isAvailable ?? false;
                    return (
                      <button key={size} onClick={() => available && setSelectedSize(size)} disabled={!available} className={`px-4 py-2.5 text-sm border rounded-sm transition-all ${selectedSize === size ? 'bg-[#151515] text-white border-[#151515]' : available ? 'border-[#AAA394]/30 hover:border-[#303238]' : 'border-[#AAA394]/20 text-[#AAA394] line-through cursor-not-allowed'}`}>
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <span className="text-sm font-medium block mb-3">Quantity</span>
                <div className="inline-flex items-center border border-[#AAA394]/30 rounded-sm">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2.5 hover:bg-[#AAA394]/10 transition-colors" aria-label="Decrease"><Minus size={16} /></button>
                  <span className="px-4 text-sm font-medium min-w-[40px] text-center">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(10, quantity + 1))} className="p-2.5 hover:bg-[#AAA394]/10 transition-colors" aria-label="Increase"><Plus size={16} /></button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button onClick={handleAddToCart} disabled={!selectedSize || !isAvailable} className="flex-1 py-3.5 bg-[#151515] text-white text-sm font-semibold rounded-sm hover:bg-[#303238] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {!selectedSize ? 'Select a Size' : !isAvailable ? 'Unavailable' : 'Add to Cart'}
                </button>
                <button onClick={handleBuyNow} disabled={!selectedSize || !isAvailable} className="flex-1 py-3.5 border-2 border-[#151515] text-[#151515] text-sm font-semibold rounded-sm hover:bg-[#151515] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  Buy Now
                </button>
              </div>

              {/* Secondary Actions */}
              <div className="flex items-center gap-4 pt-2">
                <button onClick={() => toggleWishlist(product.id)} className="flex items-center gap-2 text-sm text-[#303238] hover:text-[#214C9A] transition-colors">
                  <Heart size={18} className={isWished ? 'fill-[#214C9A] text-[#214C9A]' : ''} />
                  {isWished ? 'Saved' : 'Wishlist'}
                </button>
                <button className="flex items-center gap-2 text-sm text-[#303238] hover:text-[#214C9A] transition-colors">
                  <Share2 size={18} /> Share
                </button>
              </div>

              {/* Delivery Check */}
              <div className="p-4 bg-white/60 rounded-sm border border-[#AAA394]/10">
                <div className="flex items-center gap-2 mb-2">
                  <Truck size={16} className="text-[#214C9A]" />
                  <span className="text-sm font-medium">Delivery Estimate</span>
                </div>
                <div className="flex gap-2">
                  <input type="text" value={pincode} onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="Enter PIN code" className="flex-1 px-3 py-2 border border-[#AAA394]/30 rounded-sm text-sm focus:outline-none focus:border-[#214C9A]" />
                  <button onClick={checkDelivery} className="px-4 py-2 bg-[#151515] text-white text-xs font-medium rounded-sm hover:bg-[#303238] transition-colors">Check</button>
                </div>
                {deliveryEstimate && <p className="text-xs text-green-700 mt-2 flex items-center gap-1"><Check size={12} /> Estimated delivery: {deliveryEstimate}</p>}
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="flex flex-col items-center text-center p-3 bg-white/40 rounded-sm">
                  <Truck size={18} className="text-[#214C9A] mb-1" />
                  <span className="text-[10px] text-[#303238]">Free shipping above ₹999</span>
                </div>
                <div className="flex flex-col items-center text-center p-3 bg-white/40 rounded-sm">
                  <RotateCcw size={18} className="text-[#214C9A] mb-1" />
                  <span className="text-[10px] text-[#303238]">7-day easy returns</span>
                </div>
                <div className="flex flex-col items-center text-center p-3 bg-white/40 rounded-sm">
                  <Shield size={18} className="text-[#214C9A] mb-1" />
                  <span className="text-[10px] text-[#303238]">Secure payment</span>
                </div>
              </div>

              {/* Product Details Accordion */}
              <div className="border-t border-[#AAA394]/20 pt-6 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold mb-2">Description</h3>
                  <p className="text-sm text-[#303238] leading-relaxed">{product.description}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-2">Fabric & Care</h3>
                  <p className="text-sm text-[#303238] mb-2">{product.fabric}</p>
                  <ul className="list-disc list-inside text-sm text-[#303238] space-y-1">
                    {product.careInstructions.map((care, i) => <li key={i}>{care}</li>)}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-2">Fit</h3>
                  <p className="text-sm text-[#303238]">{product.fit}</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16 lg:mt-24 pt-12 border-t border-[#AAA394]/20">
          <h2 className="text-xl font-semibold mb-8">You May Also Like</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {relatedProducts.map((p: any, i: number) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </section>
      )}

      {/* Size Guide Modal */}
      {showSizeGuide && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowSizeGuide(false)} />
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-[#F2EEE6] rounded-sm p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Size Guide</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#AAA394]/20">
                    <th className="text-left py-2 pr-4 font-medium">Size</th>
                    <th className="text-left py-2 pr-4 font-medium">Chest (in)</th>
                    <th className="text-left py-2 pr-4 font-medium">Waist (in)</th>
                    <th className="text-left py-2 font-medium">Length (in)</th>
                  </tr>
                </thead>
                <tbody>
                  {[['XS', '34-36', '28-30', '26'], ['S', '36-38', '30-32', '27'], ['M', '38-40', '32-34', '28'], ['L', '40-42', '34-36', '29'], ['XL', '42-44', '36-38', '30'], ['XXL', '44-46', '38-40', '31']].map(([size, chest, waist, length]) => (
                    <tr key={size} className="border-b border-[#AAA394]/10">
                      <td className="py-2 pr-4 font-medium">{size}</td>
                      <td className="py-2 pr-4 text-[#303238]">{chest}</td>
                      <td className="py-2 pr-4 text-[#303238]">{waist}</td>
                      <td className="py-2 text-[#303238]">{length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-[#AAA394] mt-4">Measurements are in inches. If between sizes, we recommend sizing up for a relaxed fit.</p>
            <button onClick={() => setShowSizeGuide(false)} className="mt-4 w-full py-2.5 bg-[#151515] text-white text-sm font-medium rounded-sm">Close</button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
