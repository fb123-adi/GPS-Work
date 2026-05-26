import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Cpu, Wrench, AlertTriangle, TrendingUp } from 'lucide-react'
import Header from '../components/layout/Header'
import { useApp } from '../context/AppContext'

function fmt(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`
  return `₹${n}`
}

const statusColor = (s: string) => {
  if (s === 'operational') return 'badge-green'
  if (s === 'maintenance') return 'badge-yellow'
  if (s === 'faulty') return 'badge-red'
  return 'bg-gray-700 text-gray-400 text-xs px-2 py-0.5 rounded-full border border-gray-600'
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
          <span className="text-white font-medium">{p.name.includes('Eff') ? `${p.value}%` : fmt(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function Machines() {
  const { machines } = useApp()

  const totalBillingMonth = machines.reduce((s, m) => s + m.billingThisMonth, 0)
  const avgEfficiency = machines.reduce((s, m) => s + m.efficiency, 0) / machines.length
  const needsMaintenance = machines.filter(m => {
    const next = new Date(m.nextMaintenanceDate)
    const now = new Date()
    return (next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24) <= 30
  })

  const chartData = machines.map(m => ({
    name: m.name.replace('Assembly Line ', 'Asm ').replace(' Station', '').replace(' Unit', ''),
    'This Month': m.billingThisMonth,
    'Last Month': m.billingLastMonth,
    Efficiency: m.efficiency,
  }))

  return (
    <div>
      <Header title="Machines" subtitle="Production machines — billing, efficiency & maintenance" />
      <div className="p-6 space-y-5">

        <div className="grid grid-cols-3 gap-4">
          <div className="card flex items-center gap-4">
            <div className="p-2.5 bg-cyan-600 rounded-xl"><Cpu size={20} className="text-white" /></div>
            <div>
              <div className="text-xs text-gray-500">Total Billing This Month</div>
              <div className="font-bold text-white text-lg">{fmt(totalBillingMonth)}</div>
              <div className="text-gray-500 text-xs">{machines.length} machines</div>
            </div>
          </div>
          <div className="card flex items-center gap-4">
            <div className="p-2.5 bg-emerald-600 rounded-xl"><TrendingUp size={20} className="text-white" /></div>
            <div>
              <div className="text-xs text-gray-500">Avg Efficiency</div>
              <div className={`font-bold text-2xl ${avgEfficiency >= 80 ? 'text-emerald-400' : avgEfficiency >= 65 ? 'text-yellow-400' : 'text-red-400'}`}>
                {avgEfficiency.toFixed(0)}%
              </div>
              <div className="text-gray-500 text-xs">fleet average</div>
            </div>
          </div>
          <div className="card flex items-center gap-4">
            <div className={`p-2.5 rounded-xl ${needsMaintenance.length > 0 ? 'bg-orange-600' : 'bg-gray-700'}`}>
              <Wrench size={20} className="text-white" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Maintenance Due Soon</div>
              <div className={`font-bold text-2xl ${needsMaintenance.length > 0 ? 'text-orange-400' : 'text-gray-300'}`}>
                {needsMaintenance.length}
              </div>
              <div className="text-gray-500 text-xs">within 30 days</div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="card">
          <h3 className="font-semibold text-white mb-4">Machine Billing — This Month vs Last Month</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}K`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#9ca3af' }} />
              <Bar dataKey="This Month" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Last Month" fill="#6b7280" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Machine Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {machines.map(m => {
            const daysToMaint = Math.ceil((new Date(m.nextMaintenanceDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
            const billingChange = m.billingLastMonth > 0 ? ((m.billingThisMonth - m.billingLastMonth) / m.billingLastMonth * 100) : 0
            return (
              <div key={m.id} className="card">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-semibold text-white text-sm">{m.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{m.type} · {m.id}</div>
                  </div>
                  <span className={statusColor(m.status)}>{m.status}</span>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div>
                    <div className="text-xs text-gray-500">This Month</div>
                    <div className="text-sm font-bold text-white">{fmt(m.billingThisMonth)}</div>
                    <div className={`text-xs ${billingChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {billingChange >= 0 ? '+' : ''}{billingChange.toFixed(1)}% vs last
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Hours Used</div>
                    <div className="text-sm font-bold text-white">{m.hoursThisMonth}h</div>
                    <div className="text-xs text-gray-500">{m.ordersCompleted} orders</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Efficiency</div>
                    <div className={`text-sm font-bold ${m.efficiency >= 80 ? 'text-emerald-400' : m.efficiency >= 65 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {m.efficiency}%
                    </div>
                  </div>
                </div>
                <div className="bg-gray-700 rounded-full h-1.5 mb-3">
                  <div className={`h-1.5 rounded-full ${m.efficiency >= 80 ? 'bg-emerald-500' : m.efficiency >= 65 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${m.efficiency}%` }} />
                </div>
                <div className={`text-xs flex items-center gap-1.5 ${daysToMaint <= 0 ? 'text-red-400' : daysToMaint <= 14 ? 'text-orange-400' : 'text-gray-500'}`}>
                  <Wrench size={11} />
                  {daysToMaint <= 0 ? 'Maintenance overdue' : `Next maintenance in ${daysToMaint} days (${m.nextMaintenanceDate})`}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
