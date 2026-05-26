import { useState } from 'react'
import { AlertTriangle, Package, Search } from 'lucide-react'
import Header from '../components/layout/Header'
import { useApp } from '../context/AppContext'

function fmt(n: number) {
  return `₹${n.toLocaleString('en-IN')}`
}

export default function Products() {
  const { products } = useApp()
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('all')

  const categories = Array.from(new Set(products.map(p => p.category)))

  const filtered = products.filter(p => {
    const ms = search.toLowerCase()
    const matchSearch = p.name.toLowerCase().includes(ms) || p.category.toLowerCase().includes(ms)
    const matchCat = catFilter === 'all' || p.category === catFilter
    return matchSearch && matchCat
  })

  const lowStock = products.filter(p => p.stock <= p.minStock)
  const totalCatalogValue = products.reduce((s, p) => s + p.price * p.stock, 0)
  const avgMargin = products.reduce((s, p) => s + ((p.price - p.cost) / p.price) * 100, 0) / products.length

  return (
    <div>
      <Header title="Products" subtitle="Catalogue, pricing & inventory overview" />
      <div className="p-6 space-y-5">

        <div className="grid grid-cols-3 gap-4">
          <div className="card flex items-center gap-4">
            <div className="p-2.5 bg-purple-600 rounded-xl"><Package size={20} className="text-white" /></div>
            <div>
              <div className="text-xs text-gray-500">Total Products</div>
              <div className="font-bold text-2xl text-white">{products.length}</div>
              <div className="text-gray-500 text-xs">{categories.length} categories</div>
            </div>
          </div>
          <div className="card flex items-center gap-4">
            <div className={`p-2.5 rounded-xl ${lowStock.length > 0 ? 'bg-red-600' : 'bg-emerald-600'}`}>
              <AlertTriangle size={20} className="text-white" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Low Stock Items</div>
              <div className={`font-bold text-2xl ${lowStock.length > 0 ? 'text-red-400' : 'text-emerald-400'}`}>{lowStock.length}</div>
              <div className="text-gray-500 text-xs">below minimum level</div>
            </div>
          </div>
          <div className="card flex items-center gap-4">
            <div className="p-2.5 bg-emerald-600 rounded-xl"><Package size={20} className="text-white" /></div>
            <div>
              <div className="text-xs text-gray-500">Avg Profit Margin</div>
              <div className="font-bold text-2xl text-emerald-400">{avgMargin.toFixed(1)}%</div>
              <div className="text-gray-500 text-xs">across all products</div>
            </div>
          </div>
        </div>

        {lowStock.length > 0 && (
          <div className="card border-red-800 bg-red-950/20">
            <div className="flex items-center gap-2 text-red-400 mb-2 text-sm font-semibold">
              <AlertTriangle size={15} /> Low Stock Alert
            </div>
            <div className="flex gap-3 flex-wrap">
              {lowStock.map(p => (
                <span key={p.id} className="badge-red text-xs">
                  {p.name} — {p.stock}/{p.minStock} units
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products…"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-blue-500" />
          </div>
          <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-blue-500">
            <option value="all">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-800/50">
                  {['Product', 'Category', 'Selling Price', 'Cost', 'Margin', 'Stock', 'Status'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-400 px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const margin = ((p.price - p.cost) / p.price * 100).toFixed(1)
                  const lowStockFlag = p.stock <= p.minStock
                  return (
                    <tr key={p.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-white">{p.name}</div>
                        <div className="text-xs text-gray-500">{p.id} · per {p.unit}</div>
                      </td>
                      <td className="px-4 py-3"><span className="badge-blue">{p.category}</span></td>
                      <td className="px-4 py-3 text-sm font-semibold text-white">{fmt(p.price)}</td>
                      <td className="px-4 py-3 text-sm text-gray-400">{fmt(p.cost)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-700 rounded-full h-1.5 w-16">
                            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${Math.min(parseFloat(margin), 100)}%` }} />
                          </div>
                          <span className="text-xs text-emerald-400 font-medium">{margin}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-sm font-medium ${lowStockFlag ? 'text-red-400' : 'text-gray-300'}`}>
                          {p.stock} / {p.minStock} min
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={lowStockFlag ? 'badge-red' : 'badge-green'}>
                          {lowStockFlag ? 'Low Stock' : 'In Stock'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
