"use client";

import { motion } from "framer-motion";
import { Heart, ShoppingBag, Eye } from "lucide-react";
import { useState } from "react";

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice: number | null;
  badge: string;
  colors: string[];
  image: string;
  hoverImage: string;
  rating: number;
  reviews: number;
  isNew: boolean;
  isLimited: boolean;
}

export default function ProductCard({ product }: { product: Product }) {
  const [hovered, setHovered] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const badgeColor =
    product.badge === "Limited Edition"
      ? "bg-aurum-gold text-aurum-black"
      : product.badge === "New Arrival"
      ? "bg-aurum-ivory/10 text-aurum-ivory border border-aurum-ivory/20"
      : product.badge === "Best Seller"
      ? "bg-aurum-gold/10 text-aurum-gold border border-aurum-gold/30"
      : "bg-aurum-gold/10 text-aurum-gold border border-aurum-gold/30";

  return (
    <motion.div
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="group relative bg-aurum-dark overflow-hidden cursor-pointer"
      whileHover={{ y: -6 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Image container */}
      <div className="relative aspect-[3/4] overflow-hidden product-img-wrap">
        <img
          src={hovered ? product.hoverImage : product.image}
          alt={product.name}
          className="w-full h-full object-cover object-top transition-all duration-700"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-aurum-dark/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Badge */}
        {product.badge && (
          <div className={`absolute top-4 left-4 px-3 py-1 text-[10px] font-jost tracking-[0.12em] uppercase font-semibold ${badgeColor}`}>
            {product.badge}
          </div>
        )}

        {/* Actions */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <motion.button
            initial={{ opacity: 0, x: 10 }}
            animate={hovered ? { opacity: 1, x: 0 } : { opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => {
              e.preventDefault();
              setWishlisted(!wishlisted);
            }}
            className={`w-9 h-9 flex items-center justify-center transition-colors ${
              wishlisted
                ? "bg-aurum-gold text-aurum-black"
                : "bg-aurum-black/60 text-aurum-ivory hover:bg-aurum-gold hover:text-aurum-black"
            }`}
          >
            <Heart className={`w-4 h-4 ${wishlisted ? "fill-current" : ""}`} />
          </motion.button>

          <motion.button
            initial={{ opacity: 0, x: 10 }}
            animate={hovered ? { opacity: 1, x: 0 } : { opacity: 0, x: 10 }}
            transition={{ duration: 0.2, delay: 0.05 }}
            className="w-9 h-9 flex items-center justify-center bg-aurum-black/60 text-aurum-ivory hover:bg-aurum-gold hover:text-aurum-black transition-colors"
          >
            <Eye className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Add to cart overlay */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={hovered ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          onClick={handleAddToCart}
          className="absolute bottom-4 left-4 right-4 flex items-center justify-center gap-2 py-3 bg-aurum-gold text-aurum-black font-jost text-xs font-semibold tracking-[0.15em] uppercase transition-colors hover:bg-aurum-gold-light"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          {addedToCart ? "Added!" : "Add to Cart"}
        </motion.button>
      </div>

      {/* Product info */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-1">
          <p className="font-jost text-[10px] tracking-[0.2em] uppercase text-aurum-gold">
            {product.category}
          </p>
          {/* Stars */}
          <div className="flex items-center gap-1">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`w-2.5 h-2.5 ${
                    star <= Math.floor(product.rating)
                      ? "text-aurum-gold fill-current"
                      : "text-aurum-gray/30 fill-current"
                  }`}
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
            <span className="font-jost text-[10px] text-aurum-gray">
              ({product.reviews})
            </span>
          </div>
        </div>

        <h3 className="font-bodoni text-lg font-medium text-aurum-ivory mb-2 leading-snug">
          {product.name}
        </h3>

        {/* Color swatches */}
        <div className="flex items-center gap-1.5 mb-3">
          {product.colors.map((color, i) => (
            <button
              key={i}
              className="w-3.5 h-3.5 rounded-full border border-aurum-gold/20 hover:border-aurum-gold/60 transition-colors"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        {/* Price */}
        <div className="flex items-center gap-3">
          <span className="font-jost text-lg font-semibold text-aurum-ivory">
            £{product.price}
          </span>
          {product.originalPrice && (
            <span className="font-jost text-sm text-aurum-gray line-through">
              £{product.originalPrice}
            </span>
          )}
          {product.originalPrice && (
            <span className="font-jost text-xs text-aurum-gold">
              Save £{product.originalPrice - product.price}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
