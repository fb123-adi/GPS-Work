import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X, ChevronDown, Grid3X3, LayoutGrid } from 'lucide-react';
import { Reveal, ProductCard, ProductCardSkeleton } from '../components/Layout';
import { useDynamic } from '../lib/dynamicStore';
import type { Category } from '../lib/types';

const CATEGORIES: { value: Category | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 't-shirts', label: 'T-Shirts' },
  { value: 'jackets', label: 'Jackets' },
  { value: 'polos', label: 'Polos' },
  { value: 'joggers', label: 'Joggers' },
  { value: 'hoodies', label: 'Hoodies' },
];

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const COLORS = ['Black', 'White', 'Navy', 'Charcoal', 'Stone', 'Cobalt Blue'];

export default function ShopPage() {
  const { state } = useDynamic();
  const products = state.products.filter(p => p.isPublished);
  const [searchParams] = useSearchParams();
  const [category, setCategory] = useState<Category | 'all'>('all');
  const [sort, setSort] = useState('featured');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [gridCols, setGridCols] = useState(3);
  const [isLoading, setIsLoading] = useState(false);

  const showNewOnly = searchParams.get('new') === 'true';

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (showNewOnly) result = result.filter(p => p.isNew);
    if (category !== 'all') result = result.filter(p => p.category === category);
    if (selectedSizes.length > 0) result = result.filter(p => p.sizes.some((s: string) => selectedSizes.includes(s)));
    if (selectedColors.length > 0) result = result.filter(p => p.colors.some((c: string) => selectedColors.includes(c)));
    result = result.filter(p => p.basePrice >= priceRange[0] && p.basePrice <= priceRange[1]);

    switch (sort) {
      case 'newest': result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)); break;
      case 'price-asc': result.sort((a, b) => a.basePrice - b.basePrice); break;
      case 'price-desc': result.sort((a, b) => b.basePrice - a.basePrice); break;
      case 'rating': result.sort((a, b) => b.rating - a.rating); break;
      default: result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }
    return result;
  }, [category, sort, selectedSizes, selectedColors, priceRange, showNewOnly]);

  const toggleSize = (size: string) => setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
  const toggleColor = (color: string) => setSelectedColors(prev => prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]);
  const clearFilters = () => { setCategory('all'); setSelectedSizes([]); setSelectedColors([]); setPriceRange([0, 1000000]); setSort('featured'); };

  const activeFilterCount = [category !== 'all', selectedSizes.length > 0, selectedColors.length > 0, priceRange[0] > 0 || priceRange[1] < 1000000].filter(Boolean).length;

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      {/* Page Header */}
      <Reveal>
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-semibold tracking-[-0.02em] mb-2">{showNewOnly ? 'New Arrivals' : 'Shop All'}</h1>
          <p className="text-[#AAA394] text-sm">{filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}</p>
        </div>
      </Reveal>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          {/* Category Tabs */}
          <div className="hidden md:flex items-center gap-1 bg-white/60 rounded-sm p-1">
            {CATEGORIES.map(cat => (
              <button key={cat.value} onClick={() => setCategory(cat.value)} className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors ${category === cat.value ? 'bg-[#151515] text-white' : 'text-[#303238] hover:bg-[#AAA394]/10'}`}>
                {cat.label}
              </button>
            ))}
          </div>
          {/* Mobile filter button */}
          <button onClick={() => setIsFilterOpen(true)} className="md:hidden flex items-center gap-2 px-3 py-2 border border-[#AAA394]/30 rounded-sm text-sm">
            <SlidersHorizontal size={16} /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>
        </div>
        <div className="flex items-center gap-3">
          {/* Sort */}
          <div className="relative">
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="appearance-none pl-3 pr-8 py-2 bg-white/60 border border-[#AAA394]/30 rounded-sm text-sm cursor-pointer focus:outline-none focus:border-[#214C9A]">
              {SORT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#AAA394]" />
          </div>
          {/* Grid toggle */}
          <div className="hidden lg:flex items-center gap-1">
            <button onClick={() => setGridCols(2)} className={`p-2 rounded-sm ${gridCols === 2 ? 'bg-[#151515] text-white' : 'text-[#AAA394] hover:text-[#151515]'}`} aria-label="2 columns"><LayoutGrid size={16} /></button>
            <button onClick={() => setGridCols(3)} className={`p-2 rounded-sm ${gridCols === 3 ? 'bg-[#151515] text-white' : 'text-[#AAA394] hover:text-[#151515]'}`} aria-label="3 columns"><Grid3X3 size={16} /></button>
          </div>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden md:block w-[220px] flex-shrink-0">
          <div className="sticky top-24 space-y-6">
            {/* Active filters */}
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="text-xs text-[#214C9A] hover:underline font-medium">Clear all filters</button>
            )}
            {/* Size */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-3">Size</h3>
              <div className="flex flex-wrap gap-2">
                {SIZES.map(size => (
                  <button key={size} onClick={() => toggleSize(size)} className={`px-2.5 py-1.5 text-xs border rounded-sm transition-colors ${selectedSizes.includes(size) ? 'bg-[#151515] text-white border-[#151515]' : 'border-[#AAA394]/30 text-[#303238] hover:border-[#303238]'}`}>
                    {size}
                  </button>
                ))}
              </div>
            </div>
            {/* Color */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-3">Colour</h3>
              <div className="space-y-2">
                {COLORS.map(color => (
                  <label key={color} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={selectedColors.includes(color)} onChange={() => toggleColor(color)} className="w-3.5 h-3.5 rounded border-[#AAA394] text-[#214C9A] focus:ring-[#214C9A]" />
                    <span className="text-xs text-[#303238]">{color}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-lg font-medium text-[#303238] mb-2">No products found</p>
              <p className="text-sm text-[#AAA394] mb-4">Try adjusting your filters or browse all products.</p>
              <button onClick={clearFilters} className="text-sm text-[#214C9A] hover:underline font-medium">Clear filters</button>
            </div>
          ) : (
            <motion.div layout className={`grid grid-cols-2 ${gridCols === 2 ? 'lg:grid-cols-2' : 'lg:grid-cols-3'} gap-4 lg:gap-6`}>
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {isFilterOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] md:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setIsFilterOpen(false)} />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'tween', duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="absolute bottom-0 left-0 right-0 bg-[#F2EEE6] rounded-t-xl p-6 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Filters</h2>
                <button onClick={() => setIsFilterOpen(false)}><X size={20} /></button>
              </div>
              {/* Categories */}
              <div className="mb-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider mb-3">Category</h3>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button key={cat.value} onClick={() => setCategory(cat.value)} className={`px-3 py-1.5 text-xs border rounded-sm transition-colors ${category === cat.value ? 'bg-[#151515] text-white border-[#151515]' : 'border-[#AAA394]/30'}`}>
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
              {/* Sizes */}
              <div className="mb-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider mb-3">Size</h3>
                <div className="flex flex-wrap gap-2">
                  {SIZES.map(size => (
                    <button key={size} onClick={() => toggleSize(size)} className={`px-3 py-1.5 text-xs border rounded-sm transition-colors ${selectedSizes.includes(size) ? 'bg-[#151515] text-white border-[#151515]' : 'border-[#AAA394]/30'}`}>
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              {/* Colors */}
              <div className="mb-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider mb-3">Colour</h3>
                <div className="space-y-2">
                  {COLORS.map(color => (
                    <label key={color} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={selectedColors.includes(color)} onChange={() => toggleColor(color)} className="w-4 h-4 rounded" />
                      <span className="text-sm">{color}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={clearFilters} className="flex-1 py-3 border border-[#AAA394]/30 rounded-sm text-sm font-medium">Clear All</button>
                <button onClick={() => setIsFilterOpen(false)} className="flex-1 py-3 bg-[#151515] text-white rounded-sm text-sm font-medium">Apply Filters</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
