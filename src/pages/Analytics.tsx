import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts'
import Header from '../components/layout/Header'
import { useApp } from '../context/AppContext'

function fmt(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`
  return `₹${n}`
}

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899']

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-xs">
      <div className="font-semibold text-white mb-2">{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-400">{p.name}:</span>
          <span className="text-white font-medium">
            {typeof p.value === 'number' && p.name !== 'Orders' ? fmt(p.value) : p.value}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function Analytics() {
  const { monthlyData, lastYearMonthly, orders, products } = useApp()

  // YoY comparison
  const yoyData = monthlyData.map((m, i) => ({
    month: m.month.split(' ')[0],
    'Revenue 25': m.revenue,
    'Revenue 24': lastYearMonthly[i]?.revenue ?? 0,
    'Profit 25': m.profit,
    'Profit 24': lastYearMonthly[i]?.profit ?? 0,
    'Margin 25': Math.round(m.profit / m.revenue * 100),
    'Margin 24': Math.round((lastYearMonthly[i]?.profit ?? 0) / (lastYearMonthly[i]?.revenue ?? 1) * 100),
  }))

  // Category revenue
  const catRevenue: Record<string, number> = {}
  orders.forEach(o => {
    o.items.forEach(item => {
      const prod = products.find(p => p.id === item.productId)
      const cat = prod?.category ?? 'Other'
      catRevenue[cat] = (catRevenue[cat] ?? 0) + item.total
    })
  })
  const pieData = Object.entries(catRevenue).map(([name, value]) => ({ name, value }))

  // Monthly expense vs revenue
  const expenseData = monthlyData.map(m => ({
    month: m.month,
    Revenue: m.revenue,
    Expenses: m.expenses,
    Profit: m.profit,
    Orders: m.orders,
  }))

  const totalRevenue = monthlyData.reduce((s, m) => s + m.revenue, 0)
  const totalProfit = monthlyData.reduce((s, m) => s + m.profit, 0)
  const avgMargin = (totalProfit / totalRevenue * 100).toFixed(1)

  const lastYearTotalRevenue = lastYearMonthly.reduce((s, m) => s + m.revenue, 0)
  const yoyGrowth = ((totalRevenue - lastYearTotalRevenue) / lastYearTotalRevenue * 100).toFixed(1)

  return (
    <div>
      <Header title="Analytics" subtitle="Revenue, profit & year-on-year business performance" />
      <div className="p-6 space-y-5">

        {/* Summary KPIs */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'FY 24-25 Revenue', value: fmt(totalRevenue), sub: `+${yoyGrowth}% YoY growth`, color: 'text-blue-400' },
            { label: 'FY 24-25 Profit', value: fmt(totalProfit), sub: `${avgMargin}% overall margin`, color: 'text-emerald-400' },
            { label: 'Last Year Revenue', value: fmt(lastYearTotalRevenue), sub: 'FY 23-24 baseline', color: 'text-gray-300' },
            { label: 'YoY Revenue Growth', value: `+${yoyGrowth}%`, sub: 'vs previous year', color: 'text-purple-400' },
          ].map(k => (
            <div key={k.label} className="card">
              <div className="text-xs text-gray-500 mb-1">{k.label}</div>
              <div className={`text-2xl font-bold ${k.color}`}>{k.value}</div>
              <div className="text-xs text-gray-500 mt-1">{k.sub}</div>
            </div>
          ))}
        </div>

        {/* YoY Comparison Chart */}
        <div className="card">
          <h3 className="font-semibold text-white mb-4">Year-on-Year Revenue & Profit Comparison</h3>
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={yoyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} />
              <YAxis yAxisId="left" tick={{ fill: '#6b7280', fontSize: 11 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}K`} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: '#6b7280', fontSize: 11 }} tickFormatter={v => `${v}%`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#9ca3af' }} />
              <Bar yAxisId="left" dataKey="Revenue 25" fill="#3b82f6" opacity={0.8} radius={[2, 2, 0, 0]} />
              <Bar yAxisId="left" dataKey="Revenue 24" fill="#6366f1" opacity={0.5} radius={[2, 2, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="Margin 25" name="Margin 25%" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 3 }} />
              <Line yAxisId="right" type="monotone" dataKey="Margin 24" name="Margin 24%" stroke="#34d399" strokeWidth={1.5} strokeDasharray="4 3" dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Expense breakdown */}
          <div className="card">
            <h3 className="font-semibold text-white mb-4">Revenue vs Expenses vs Profit</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={expenseData}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="profGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}K`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, color: '#9ca3af' }} />
                <Area type="monotone" dataKey="Revenue" stroke="#3b82f6" fill="url(#revGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="Expenses" stroke="#ef4444" fill="transparent" strokeWidth={1.5} strokeDasharray="3 3" />
                <Area type="monotone" dataKey="Profit" stroke="#10b981" fill="url(#profGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue by Category */}
          <div className="card">
            <h3 className="font-semibold text-white mb-4">Revenue by Product Category</h3>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={2}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {pieData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-xs text-gray-400 flex-1">{d.name}</span>
                    <span className="text-xs font-semibold text-white">{fmt(d.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
