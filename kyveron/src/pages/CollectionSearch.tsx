import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search as SearchIcon, X, ChevronRight } from 'lucide-react';
import { Reveal, ProductCard } from '../components/Layout';
import { useDynamic } from '../lib/dynamicStore';

// ===== Collection Page =====
export function CollectionPage() {
  const { slug } = useParams<{ slug: string }>();
  const { state, getCollectionBySlug, getProductsByCollection } = useDynamic();
  const collection = getCollectionBySlug(slug || '');
  const collectionProducts = getProductsByCollection(slug || '').filter(p => p.isPublished);

  if (!collection) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h1 className="text-2xl font-semibold mb-3">Collection not found</h1>
        <Link to="/shop" className="text-sm text-[#214C9A] hover:underline">Browse all products</Link>
      </div>
    );
  }

  return (
    <div>
      {/* Banner */}
      <section className="relative h-[50vh] min-h-[300px] max-h-[500px] overflow-hidden">
        <img src={collection.bannerImage} alt={`${collection.name} collection banner`} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-[#151515]/50" />
        <div className="absolute inset-0 flex items-center justify-center text-center">
          <div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-3xl lg:text-5xl font-semibold text-white tracking-[-0.02em] mb-4">{collection.name}</motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-[#AAA394] max-w-lg mx-auto text-sm lg:text-base">{collection.description}</motion.p>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="flex items-center gap-2 text-xs text-[#AAA394] mb-8">
          <Link to="/" className="hover:text-[#151515] transition-colors">Home</Link>
          <ChevronRight size={12} />
          <Link to="/shop" className="hover:text-[#151515] transition-colors">Shop</Link>
          <ChevronRight size={12} />
          <span className="text-[#151515]">{collection.name}</span>
        </div>
        <p className="text-sm text-[#AAA394] mb-8">{collectionProducts.length} products</p>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {collectionProducts.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </section>
    </div>
  );
}

// ===== Search Page =====
export function SearchPage() {
  const { state } = useDynamic();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [inputValue, setInputValue] = useState(query);

  const results = useMemo(() => {
    if (!query) return [];
    const q = query.toLowerCase();
    return state.products.filter((p: any) =>
      p.isPublished && (
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tags.some((t: string) => t.includes(q))
      )
    );
  }, [query, state.products]);

  const collectionResults = useMemo(() => {
    if (!query) return [];
    const q = query.toLowerCase();
    return state.collections.filter((c: any) => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
  }, [query, state.collections]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ q: inputValue });
  };

  const suggestions = ['Performance Tee', 'Track Jacket', 'Joggers', 'Hoodie', 'Polo'];

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      {/* Search Input */}
      <div className="max-w-2xl mx-auto mb-10">
        <form onSubmit={handleSearch} className="relative">
          <SearchIcon size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#AAA394]" />
          <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Search products, collections..." className="w-full pl-12 pr-12 py-4 bg-white/60 border border-[#AAA394]/20 rounded-sm text-base focus:outline-none focus:border-[#214C9A] transition-colors" autoFocus />
          {inputValue && (
            <button type="button" onClick={() => { setInputValue(''); setSearchParams({}); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#AAA394] hover:text-[#151515]">
              <X size={18} />
            </button>
          )}
        </form>

        {/* Suggestions */}
        {!query && (
          <div className="mt-4">
            <p className="text-xs text-[#AAA394] mb-2">Popular searches:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map(s => (
                <button key={s} onClick={() => { setInputValue(s); setSearchParams({ q: s }); }} className="px-3 py-1.5 bg-white/60 border border-[#AAA394]/20 rounded-sm text-xs text-[#303238] hover:border-[#303238] transition-colors">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {query && (
        <div>
          <p className="text-sm text-[#AAA394] mb-6">
            {results.length + collectionResults.length} result{(results.length + collectionResults.length) !== 1 ? 's' : ''} for "<span className="text-[#151515] font-medium">{query}</span>"
          </p>

          {/* Collection Results */}
          {collectionResults.length > 0 && (
            <div className="mb-8">
              <h2 className="text-sm font-semibold uppercase tracking-wider mb-4">Collections</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {collectionResults.map(col => (
                  <Link key={col.id} to={`/collections/${col.slug}`} className="flex gap-4 p-4 bg-white/60 rounded-sm border border-[#AAA394]/10 hover:border-[#303238] transition-colors">
                    <img src={col.bannerImage} alt={col.name} className="w-20 h-20 object-cover rounded-sm" />
                    <div>
                      <h3 className="text-sm font-medium">{col.name}</h3>
                      <p className="text-xs text-[#AAA394] mt-1">{col.productCount} products</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Product Results */}
          {results.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider mb-4">Products</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {results.map((product, i) => <ProductCard key={product.id} product={product} index={i} />)}
              </div>
            </div>
          )}

          {/* Empty State */}
          {results.length === 0 && collectionResults.length === 0 && (
            <div className="text-center py-16">
              <SearchIcon size={48} className="text-[#AAA394] mx-auto mb-4" />
              <p className="text-lg font-medium text-[#303238] mb-2">No results found</p>
              <p className="text-sm text-[#AAA394] mb-6">Try a different search term or browse our collections.</p>
              <Link to="/shop" className="inline-flex items-center gap-2 px-6 py-3 bg-[#151515] text-white text-sm font-medium rounded-sm hover:bg-[#303238] transition-colors">Browse All Products</Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
