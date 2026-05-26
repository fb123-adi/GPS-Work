import { useState } from 'react'
import { Search, Trophy, TrendingUp, AlertCircle } from 'lucide-react'
import Header from '../components/layout/Header'
import { useApp } from '../context/AppContext'

function fmt(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`
  return `₹${n}`
}

export default function Customers() {
  const { customers } = useApp()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = customers.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.location.toLowerCase().includes(search.toLowerCase()) ||
      c.industry.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || c.status === statusFilter
    return matchSearch && matchStatus
  })

  const topCustomer = [...customers].sort((a, b) => b.totalValue - a.totalValue)[0]
  const totalRevenue = customers.reduce((s, c) => s + c.totalValue, 0)
  const totalOutstanding = customers.reduce((s, c) => s + c.outstandingBalance, 0)

  return (
    <div>
      <Header title="Customers" subtitle={`${customers.length} total customers in database`} />
      <div className="p-6 space-y-5">

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="card flex items-center gap-4">
            <div className="p-2.5 bg-amber-600 rounded-xl"><Trophy size={20} className="text-white" /></div>
            <div>
              <div className="text-xs text-gray-500">Most Valuable Customer</div>
              <div className="font-bold text-white text-sm">{topCustomer.name}</div>
              <div className="text-emerald-400 text-xs">{fmt(topCustomer.totalValue)} lifetime value</div>
            </div>
          </div>
          <div className="card flex items-center gap-4">
            <div className="p-2.5 bg-blue-600 rounded-xl"><TrendingUp size={20} className="text-white" /></div>
            <div>
              <div className="text-xs text-gray-500">Total Revenue Generated</div>
              <div className="font-bold text-white">{fmt(totalRevenue)}</div>
              <div className="text-gray-500 text-xs">across all customers</div>
            </div>
          </div>
          <div className="card flex items-center gap-4">
            <div className={`p-2.5 rounded-xl ${totalOutstanding > 200000 ? 'bg-red-600' : 'bg-orange-600'}`}>
              <AlertCircle size={20} className="text-white" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Outstanding Balances</div>
              <div className={`font-bold text-sm ${totalOutstanding > 200000 ? 'text-red-400' : 'text-orange-400'}`}>{fmt(totalOutstanding)}</div>
              <div className="text-gray-500 text-xs">pending collection</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, location, industry…"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <select
            value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {/* Table */}
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-800/50">
                  {['Customer', 'Location / Industry', 'Orders', 'Total Value', 'Outstanding', 'Last Order', 'Status'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-400 px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr key={c.id} className={`border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors ${i === 0 && statusFilter === 'all' && !search ? 'bg-amber-950/10' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-xs font-bold text-white">
                          {c.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white flex items-center gap-1.5">
                            {c.name}
                            {c.id === topCustomer.id && <Trophy size={12} className="text-amber-400" />}
                          </div>
                          <div className="text-xs text-gray-500">{c.id} · {c.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-300">{c.location}</div>
                      <div className="text-xs text-gray-500">{c.industry}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">{c.totalOrders}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-emerald-400">{fmt(c.totalValue)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-medium ${c.outstandingBalance > 0 ? 'text-red-400' : 'text-gray-500'}`}>
                        {c.outstandingBalance > 0 ? fmt(c.outstandingBalance) : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">{c.lastOrderDate}</td>
                    <td className="px-4 py-3">
                      <span className={c.status === 'active' ? 'badge-green' : c.status === 'inactive' ? 'badge-red' : 'badge-yellow'}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
