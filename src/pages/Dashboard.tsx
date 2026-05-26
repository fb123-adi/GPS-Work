import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingCart,
  Users, Cpu, AlertTriangle, Trophy, Clock
} from 'lucide-react'
import Header from '../components/layout/Header'
import { useApp } from '../context/AppContext'

function fmt(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`
  return `₹${n}`
}

function KPICard({ title, value, sub, icon: Icon, trend, color }: {
  title: string; value: string; sub: string; icon: React.ElementType
  trend?: number; color: string
}) {
  return (
    <div className="card">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon size={18} className="text-white" />
        </div>
        {trend !== undefined && (
          <span className={`flex items-center gap-1 text-xs font-medium ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(trend).toFixed(1)}%
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-gray-400 font-medium">{title}</div>
      <div className="text-xs text-gray-500 mt-1">{sub}</div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-xs">
      <div className="font-semibold text-white mb-2">{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-400">{p.name}:</span>
          <span className="text-white font-medium">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const { monthlyData, lastYearMonthly, orders, customers, machines, companyErrors } = useApp()

  const currentMonth = monthlyData[monthlyData.length - 1]
  const prevMonth = monthlyData[monthlyData.length - 2]
  const avgLastYearProfit = lastYearMonthly.reduce((s, m) => s + m.profit, 0) / lastYearMonthly.length
  const profitVsLastYear = ((currentMonth.profit - avgLastYearProfit) / avgLastYearProfit) * 100

  const revenueGrowth = ((currentMonth.revenue - prevMonth.revenue) / prevMonth.revenue) * 100
  const profitGrowth = ((currentMonth.profit - prevMonth.profit) / prevMonth.profit) * 100

  const activeOrders = orders.filter(o => ['pending', 'in_progress', 'delayed'].includes(o.status))
  const delayedOrders = orders.filter(o => o.status === 'delayed')
  const openErrors = companyErrors.filter(e => e.status !== 'resolved')

  // Top customer
  const topCustomer = [...customers].sort((a, b) => b.totalValue - a.totalValue)[0]

  // Combine chart data
  const combinedData = monthlyData.map((m, i) => ({
    month: m.month,
    revenue: m.revenue,
    profit: m.profit,
    lastYearRevenue: lastYearMonthly[i]?.revenue ?? 0,
    lastYearProfit: lastYearMonthly[i]?.profit ?? 0,
  }))

  const machineData = machines.map(m => ({
    name: m.name.replace('Assembly Line ', 'Asm ').replace(' Station', '').replace(' Unit', ''),
    billing: m.billingThisMonth,
    efficiency: m.efficiency,
  }))

  const upcomingDeadlines = orders
    .filter(o => o.status !== 'completed' && o.status !== 'cancelled')
    .map(o => {
      const due = new Date(o.dueDate)
      const now = new Date()
      const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return { ...o, daysLeft: diffDays }
    })
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 5)

  return (
    <div>
      <Header title="Dashboard" subtitle="GPS Work — Business Overview May 2025" />
      <div className="p-6 space-y-6">

        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard title="Revenue This Month" value={fmt(currentMonth.revenue)} sub={`${revenueGrowth >= 0 ? '+' : ''}${revenueGrowth.toFixed(1)}% vs last month`} icon={DollarSign} trend={revenueGrowth} color="bg-blue-600" />
          <KPICard title="Profit This Month" value={fmt(currentMonth.profit)} sub={`${profitVsLastYear >= 0 ? '+' : ''}${profitVsLastYear.toFixed(1)}% vs avg last year`} icon={TrendingUp} trend={profitGrowth} color="bg-emerald-600" />
          <KPICard title="Active Orders" value={String(activeOrders.length)} sub={`${delayedOrders.length} delayed — needs attention`} icon={ShoppingCart} color="bg-purple-600" />
          <KPICard title="Open Issues" value={String(openErrors.length)} sub={`${openErrors.filter(e => e.severity === 'critical').length} critical requiring action`} icon={AlertTriangle} color="bg-red-600" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard title="Active Customers" value={String(customers.filter(c => c.status === 'active').length)} sub="Total customer base" icon={Users} color="bg-indigo-600" />
          <KPICard title="Top Machine Billing" value={fmt(Math.max(...machines.map(m => m.billingThisMonth)))} sub="Assembly Line Alpha this month" icon={Cpu} color="bg-cyan-600" />
          <KPICard title="Top Customer" value={topCustomer.name.split(' ').slice(0, 2).join(' ')} sub={fmt(topCustomer.totalValue) + ' total value'} icon={Trophy} color="bg-amber-600" />
          <KPICard title="Avg Last Year Profit" value={fmt(avgLastYearProfit)} sub="Monthly average FY 2023-24" icon={BarChart3} color="bg-rose-600" />
        </div>

        {/* Revenue & Profit Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="card lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-white">Revenue & Profit — This Year vs Last Year</h3>
                <p className="text-xs text-gray-500 mt-0.5">Monthly comparison</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={combinedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}K`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, color: '#9ca3af' }} />
                <Line type="monotone" dataKey="revenue" name="Revenue 25" stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="profit" name="Profit 25" stroke="#10b981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="lastYearRevenue" name="Revenue 24" stroke="#6366f1" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                <Line type="monotone" dataKey="lastYearProfit" name="Profit 24" stroke="#34d399" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Upcoming Deadlines */}
          <div className="card">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Clock size={16} className="text-amber-400" /> Upcoming Deadlines
            </h3>
            <div className="space-y-3">
              {upcomingDeadlines.map(o => (
                <div key={o.id} className="flex items-start gap-3 p-2.5 rounded-lg bg-gray-800/50">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    o.daysLeft < 0 ? 'bg-red-900 text-red-300' :
                    o.daysLeft <= 3 ? 'bg-orange-900 text-orange-300' :
                    'bg-gray-700 text-gray-300'
                  }`}>
                    {o.daysLeft < 0 ? `+${Math.abs(o.daysLeft)}d` : `${o.daysLeft}d`}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-white truncate">{o.customerName.split(' ').slice(0, 2).join(' ')}</div>
                    <div className="text-xs text-gray-500">{o.id}</div>
                    <div className={`text-xs mt-0.5 ${
                      o.status === 'delayed' ? 'text-red-400' :
                      o.status === 'in_progress' ? 'text-blue-400' : 'text-yellow-400'
                    }`}>{o.status.replace('_', ' ')}</div>
                  </div>
                  <div className="ml-auto text-xs font-semibold text-emerald-400">{fmt(o.totalAmount)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Machine Billing & Orders Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card">
            <h3 className="font-semibold text-white mb-4">Machine Billing — This Month</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={machineData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 11 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}K`} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="billing" name="Billing" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h3 className="font-semibold text-white mb-4">Monthly Orders Volume</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="ordGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="orders" name="Orders" stroke="#8b5cf6" fill="url(#ordGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Critical Alerts */}
        {openErrors.filter(e => e.severity === 'critical').length > 0 && (
          <div className="card border-red-800 bg-red-950/20">
            <h3 className="font-semibold text-red-400 mb-3 flex items-center gap-2">
              <AlertTriangle size={16} /> Critical Alerts Requiring Immediate Action
            </h3>
            <div className="space-y-2">
              {openErrors.filter(e => e.severity === 'critical').map(e => (
                <div key={e.id} className="flex items-start gap-3 p-3 bg-red-900/20 rounded-lg border border-red-900/40">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-red-300">{e.title}</div>
                    <div className="text-xs text-gray-400 mt-1">{e.description.slice(0, 120)}…</div>
                  </div>
                  <div className="text-xs font-semibold text-red-400">~{fmt(e.estimatedLoss)} loss</div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

function BarChart3({ size, className }: { size?: number; className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width={size ?? 24} height={size ?? 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
}
