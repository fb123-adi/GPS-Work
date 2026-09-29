import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Share2, Truck, RotateCcw, Receipt, Minus, Plus, ChevronRight, X } from 'lucide-react';
import { Reveal, ProductCard, Rating, useDialog } from '../components/Layout';
import { SizeTable } from './Legal';
import { useDynamic } from '../lib/dynamicStore';
import { useStore, MAX_QUANTITY } from '../lib/store';
import { BUSINESS } from '../lib/business';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { state: dynState, getProductBySlug } = useDynamic();
  const product = getProductBySlug(slug || '');
  const { addToCart, toggleWishlist, state, formatPrice, showToast } = useStore();
  const navigate = useNavigate();

  const [selectedColor, setSelectedColor] = useState(product?.colors[0] || '');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [pincode, setPincode] = useState('');
  const [deliveryEstimate, setDeliveryEstimate] = useState('');
  const sizeGuideRef = useDialog(showSizeGuide, () => setShowSizeGuide(false));

  if (!product) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h1 className="text-2xl font-semibold mb-4">Product not found</h1>
        <p className="text-[#6B665B] mb-6">The product you're looking for doesn't exist or has been removed.</p>
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
      // No courier serviceability lookup exists yet, so show the general estimate honestly.
      setDeliveryEstimate("We can't check individual PIN codes yet. Delivery usually takes 3–5 business days to metro cities and 5–7 elsewhere.");
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
    if (!selectedVariant?.isAvailable) { showToast('This variant is currently unavailable', 'error'); return; }
    addToCart(product.id, selectedVariant.id, selectedSize, selectedColor, quantity);
    navigate('/checkout');
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: product.name, url });
      else { await navigator.clipboard.writeText(url); showToast('Link copied', 'success'); }
    } catch { /* user cancelled the share sheet */ }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex flex-wrap items-center gap-2 text-xs text-[#6B665B]">
          <li><Link to="/" className="hover:text-[#151515] transition-colors">Home</Link></li>
          <li aria-hidden="true"><ChevronRight size={12} /></li>
          <li><Link to="/shop" className="hover:text-[#151515] transition-colors">Shop</Link></li>
          <li aria-hidden="true"><ChevronRight size={12} /></li>
          <li><Link to={`/collections/${product.collection}`} className="hover:text-[#151515] transition-colors capitalize">{product.collection.replace('-', ' ')}</Link></li>
          <li aria-hidden="true"><ChevronRight size={12} /></li>
          <li aria-current="page" className="text-[#151515]">{product.name}</li>
        </ol>
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
                <button key={img.id} onClick={() => setActiveImage(i)} aria-label={`Show image ${i + 1} of ${product.images.length}: ${img.alt}`} aria-pressed={i === activeImage} className={`w-20 h-24 rounded-sm overflow-hidden border-2 transition-colors ${i === activeImage ? 'border-[#151515]' : 'border-transparent hover:border-[#AAA394]/50'}`}>
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
          <p className="text-xs text-[#6B665B]">Images are AI-generated illustrations, not photographs of the actual garment.</p>
        </div>

        {/* Product Info */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <Reveal>
            <div className="space-y-6">
              {/* Header */}
              <div>
                {product.isNew && <span className="inline-block px-2 py-0.5 bg-[#214C9A] text-white text-[10px] font-semibold uppercase tracking-wider rounded-sm mb-3">New Arrival</span>}
                <h1 className="text-2xl lg:text-3xl font-semibold tracking-[-0.02em] mb-2">{product.name}</h1>
                {product.reviewCount > 0
                  ? <Rating rating={product.rating} count={product.reviewCount} size={14} />
                  : <p className="text-sm text-[#6B665B]">No reviews yet</p>}
              </div>

              {/* Price */}
              <div className="flex items-center gap-3">
                <span className="text-2xl font-semibold">{formatPrice(product.basePrice)}</span>
                {product.compareAtPrice && (
                  <>
                    <span className="text-lg text-[#6B665B] line-through"><span className="sr-only">Was </span>{formatPrice(product.compareAtPrice)}</span>
                    <span className="text-sm font-medium text-green-800">{Math.round((1 - product.basePrice / product.compareAtPrice) * 100)}% off</span>
                  </>
                )}
              </div>
              <p className="text-xs text-[#6B665B]">Price includes GST. Delivery is free on orders of {formatPrice(dynState.settings.freeShippingThreshold)} or more, otherwise {formatPrice(dynState.settings.shippingCharge)}.</p>

              {/* Color Selection */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span id="colour-label" className="text-sm font-medium">Colour: <span className="text-[#6B665B]">{selectedColor}</span></span>
                </div>
                <div className="flex flex-wrap gap-2" role="group" aria-labelledby="colour-label">
                  {product.colors.map(color => (
                    <button key={color} aria-pressed={selectedColor === color} onClick={() => { setSelectedColor(color); setSelectedSize(''); }} className={`px-4 py-2 text-sm border rounded-sm transition-colors ${selectedColor === color ? 'bg-[#151515] text-white border-[#151515]' : 'border-[#8A8577] hover:border-[#303238]'}`}>
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span id="size-label" className="text-sm font-medium">Size: {selectedSize && <span className="text-[#6B665B]">{selectedSize}</span>}</span>
                  <button onClick={() => setShowSizeGuide(true)} aria-haspopup="dialog" className="text-xs text-[#214C9A] hover:underline">Size Guide</button>
                </div>
                <div className="flex flex-wrap gap-2" role="group" aria-labelledby="size-label">
                  {product.sizes.map(size => {
                    const variant = product.variants.find(v => v.color === selectedColor && v.size === size);
                    const available = variant?.isAvailable ?? false;
                    return (
                      <button key={size} onClick={() => available && setSelectedSize(size)} disabled={!available} aria-pressed={selectedSize === size} aria-label={available ? size : `${size}, sold out`} className={`px-4 py-2.5 text-sm border rounded-sm transition-all ${selectedSize === size ? 'bg-[#151515] text-white border-[#151515]' : available ? 'border-[#8A8577] hover:border-[#303238]' : 'border-[#8A8577] text-[#6B665B] line-through cursor-not-allowed'}`}>
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <span id="qty-label" className="text-sm font-medium block mb-3">Quantity</span>
                <div className="inline-flex items-center border border-[#8A8577] rounded-sm" role="group" aria-labelledby="qty-label">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1} className="p-2.5 hover:bg-[#AAA394]/10 transition-colors disabled:opacity-40" aria-label="Decrease quantity"><Minus size={16} aria-hidden="true" /></button>
                  <span className="px-4 text-sm font-medium min-w-[40px] text-center" aria-live="polite">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(MAX_QUANTITY, quantity + 1))} disabled={quantity >= MAX_QUANTITY} className="p-2.5 hover:bg-[#AAA394]/10 transition-colors disabled:opacity-40" aria-label="Increase quantity"><Plus size={16} aria-hidden="true" /></button>
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
                <button onClick={() => toggleWishlist(product.id)} aria-pressed={isWished} className="flex items-center gap-2 text-sm text-[#303238] hover:text-[#214C9A] transition-colors">
                  <Heart size={18} aria-hidden="true" className={isWished ? 'fill-[#214C9A] text-[#214C9A]' : ''} />
                  {isWished ? 'Saved' : 'Wishlist'}
                </button>
                <button onClick={handleShare} className="flex items-center gap-2 text-sm text-[#303238] hover:text-[#214C9A] transition-colors">
                  <Share2 size={18} aria-hidden="true" /> Share
                </button>
              </div>

              {/* Delivery Check */}
              <div className="p-4 bg-white/60 rounded-sm border border-[#AAA394]/10">
                <div className="flex items-center gap-2 mb-2">
                  <Truck size={16} className="text-[#214C9A]" aria-hidden="true" />
                  <label htmlFor="pincode" className="text-sm font-medium">Delivery estimate</label>
                </div>
                <div className="flex gap-2">
                  <input id="pincode" type="text" inputMode="numeric" autoComplete="postal-code" value={pincode} onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="6-digit PIN code" className="flex-1 px-3 py-2 border border-[#8A8577] rounded-sm text-sm bg-white/70 focus:border-[#214C9A]" />
                  <button onClick={checkDelivery} className="px-4 py-2 bg-[#151515] text-white text-xs font-medium rounded-sm hover:bg-[#303238] transition-colors">Check</button>
                </div>
                <p role="status" aria-live="polite" className="text-xs text-[#303238] mt-2">{deliveryEstimate}</p>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="flex flex-col items-center text-center p-3 bg-white/40 rounded-sm">
                  <Truck size={18} className="text-[#214C9A] mb-1" aria-hidden="true" />
                  <span className="text-xs text-[#303238]">Free delivery from {formatPrice(dynState.settings.freeShippingThreshold)}</span>
                </div>
                <div className="flex flex-col items-center text-center p-3 bg-white/40 rounded-sm">
                  <RotateCcw size={18} className="text-[#214C9A] mb-1" aria-hidden="true" />
                  <span className="text-xs text-[#303238]">Free returns within {dynState.settings.returnWindowDays} days</span>
                </div>
                <div className="flex flex-col items-center text-center p-3 bg-white/40 rounded-sm">
                  <Receipt size={18} className="text-[#214C9A] mb-1" aria-hidden="true" />
                  <span className="text-xs text-[#303238]">GST included, no hidden fees</span>
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
                <div>
                  <h3 className="text-sm font-semibold mb-2">Product information</h3>
                  <dl className="text-sm text-[#303238] grid grid-cols-[auto,1fr] gap-x-4 gap-y-1">
                    <dt className="text-[#6B665B]">Country of origin</dt><dd>{BUSINESS.countryOfOrigin}</dd>
                    <dt className="text-[#6B665B]">Sold by</dt><dd>{BUSINESS.legalName}</dd>
                    <dt className="text-[#6B665B]">Returns</dt><dd>Returnable within {dynState.settings.returnWindowDays} days if unused with tags</dd>
                  </dl>
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
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowSizeGuide(false)} aria-hidden="true" />
          <motion.div ref={sizeGuideRef} role="dialog" aria-modal="true" aria-labelledby="size-guide-title" tabIndex={-1} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-[#F2EEE6] rounded-sm p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 id="size-guide-title" className="text-lg font-semibold">Size Guide</h2>
              <button onClick={() => setShowSizeGuide(false)} aria-label="Close size guide" className="p-1"><X size={18} aria-hidden="true" /></button>
            </div>
            <SizeTable />
            <p className="text-xs text-[#6B665B] mt-4">Measurements are in inches. If you are between sizes, size up for a relaxed fit.</p>
          </motion.div>
        </div>
      )}
    </div>
  );
}
