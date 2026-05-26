import { useState } from 'react'
import { Clock, AlertTriangle, CheckCircle, Search } from 'lucide-react'
import Header from '../components/layout/Header'
import { useApp } from '../context/AppContext'

function fmt(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`
  return `₹${n}`
}

function daysLeft(dueDate: string): number {
  const due = new Date(dueDate)
  const now = new Date()
  return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

export default function Orders() {
  const { orders } = useApp()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')

  const filtered = orders.filter(o => {
    const ms = search.toLowerCase()
    const matchSearch = o.id.toLowerCase().includes(ms) ||
      o.customerName.toLowerCase().includes(ms) ||
      o.assignedEmployeeName.toLowerCase().includes(ms)
    const matchStatus = statusFilter === 'all' || o.status === statusFilter
    const matchPriority = priorityFilter === 'all' || o.priority === priorityFilter
    return matchSearch && matchStatus && matchPriority
  })

  const stats = {
    pending: orders.filter(o => o.status === 'pending').length,
    in_progress: orders.filter(o => o.status === 'in_progress').length,
    delayed: orders.filter(o => o.status === 'delayed').length,
    completed: orders.filter(o => o.status === 'completed').length,
  }

  const statusColor = (s: string) => {
    if (s === 'completed') return 'badge-green'
    if (s === 'delayed') return 'badge-red'
    if (s === 'in_progress') return 'badge-blue'
    if (s === 'cancelled') return 'badge-red'
    return 'badge-yellow'
  }

  const priorityColor = (p: string) => {
    if (p === 'urgent') return 'text-red-400'
    if (p === 'high') return 'text-orange-400'
    if (p === 'medium') return 'text-yellow-400'
    return 'text-gray-400'
  }

  return (
    <div>
      <Header title="Orders" subtitle="Track order status, deadlines & profitability" />
      <div className="p-6 space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Pending', count: stats.pending, icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-900/20 border-yellow-800/40' },
            { label: 'In Progress', count: stats.in_progress, icon: Clock, color: 'text-blue-400', bg: 'bg-blue-900/20 border-blue-800/40' },
            { label: 'Delayed', count: stats.delayed, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-900/20 border-red-800/40' },
            { label: 'Completed', count: stats.completed, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-900/20 border-emerald-800/40' },
          ].map(s => (
            <div key={s.label} className={`card border ${s.bg} flex items-center gap-3`}>
              <s.icon size={20} className={s.color} />
              <div>
                <div className={`text-2xl font-bold ${s.color}`}>{s.count}</div>
                <div className="text-xs text-gray-400">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders, customers, employees…"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-blue-500" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-blue-500">
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="delayed">Delayed</option>
            <option value="completed">Completed</option>
          </select>
          <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-blue-500">
            <option value="all">All Priority</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Table */}
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-800/50">
                  {['Order', 'Customer', 'Amount / Profit', 'Due Date', 'Assigned To', 'Machine', 'Priority', 'Status'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-400 px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => {
                  const days = daysLeft(o.dueDate)
                  const isDone = o.status === 'completed' || o.status === 'cancelled'
                  return (
                    <tr key={o.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="text-sm font-mono font-medium text-blue-400">{o.id}</div>
                        <div className="text-xs text-gray-500">{o.orderDate}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-white">{o.customerName}</div>
                        <div className="text-xs text-gray-500">{o.items.length} item{o.items.length !== 1 ? 's' : ''}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-semibold text-white">{fmt(o.totalAmount)}</div>
                        <div className="text-xs text-emerald-400">+{fmt(o.profit)} profit</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-300">{o.dueDate}</div>
                        {!isDone && (
                          <div className={`text-xs ${days < 0 ? 'text-red-400' : days <= 3 ? 'text-orange-400' : 'text-gray-500'}`}>
                            {days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? 'Due today' : `${days}d left`}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">{o.assignedEmployeeName}</td>
                      <td className="px-4 py-3 text-xs text-gray-400">{o.machineName}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold ${priorityColor(o.priority)}`}>
                          {o.priority.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={statusColor(o.status)}>
                          {o.status.replace('_', ' ')}
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
