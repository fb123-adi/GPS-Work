import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { MapPin, TrendingDown, TrendingUp, Target } from 'lucide-react'
import Header from '../components/layout/Header'
import { useApp } from '../context/AppContext'

function fmt(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`
  return `₹${n}`
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

export default function SalesAreas() {
  const { salesAreas } = useApp()

  const sorted = [...salesAreas].sort((a, b) => b.revenue - a.revenue)

  const chartData = sorted.map(a => ({
    region: a.region,
    Revenue: a.revenue,
    Target: a.target,
    Gap: a.target - a.revenue,
  }))

  const totalRevenue = salesAreas.reduce((s, a) => s + a.revenue, 0)
  const totalTarget = salesAreas.reduce((s, a) => s + a.target, 0)
  const laggingAreas = salesAreas.filter(a => (a.revenue / a.target) < 0.6)

  return (
    <div>
      <Header title="Sales Areas" subtitle="Regional performance — where we're winning and where we're lacking" />
      <div className="p-6 space-y-5">

        <div className="grid grid-cols-3 gap-4">
          <div className="card flex items-center gap-4">
            <div className="p-2.5 bg-blue-600 rounded-xl"><MapPin size={20} className="text-white" /></div>
            <div>
              <div className="text-xs text-gray-500">Total Revenue (All Areas)</div>
              <div className="font-bold text-white text-lg">{fmt(totalRevenue)}</div>
              <div className="text-xs text-gray-500">{salesAreas.length} regions tracked</div>
            </div>
          </div>
          <div className="card flex items-center gap-4">
            <div className="p-2.5 bg-purple-600 rounded-xl"><Target size={20} className="text-white" /></div>
            <div>
              <div className="text-xs text-gray-500">Overall Target Achievement</div>
              <div className="font-bold text-white text-lg">{(totalRevenue / totalTarget * 100).toFixed(1)}%</div>
              <div className="text-gray-500 text-xs">of {fmt(totalTarget)} total target</div>
            </div>
          </div>
          <div className="card flex items-center gap-4">
            <div className={`p-2.5 rounded-xl ${laggingAreas.length > 0 ? 'bg-red-600' : 'bg-emerald-600'}`}>
              {laggingAreas.length > 0 ? <TrendingDown size={20} className="text-white" /> : <TrendingUp size={20} className="text-white" />}
            </div>
            <div>
              <div className="text-xs text-gray-500">Lagging Regions (&lt;60%)</div>
              <div className={`font-bold text-2xl ${laggingAreas.length > 0 ? 'text-red-400' : 'text-emerald-400'}`}>{laggingAreas.length}</div>
              <div className="text-gray-500 text-xs">below target threshold</div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-white mb-4">Revenue vs Target by Region</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="region" tick={{ fill: '#6b7280', fontSize: 11 }} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} tickFormatter={v => `₹${(v / 100000).toFixed(1)}L`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Target" fill="#374151" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {sorted.map((area, i) => {
            const pct = (area.revenue / area.target * 100)
            const isLagging = pct < 60
            const gap = area.target - area.revenue
            return (
              <div key={area.region} className={`card ${isLagging ? 'border-red-800/50 bg-red-950/10' : ''}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 font-mono">#{i + 1}</span>
                    <span className="font-semibold text-white">{area.region}</span>
                    {isLagging && (
                      <span className="badge-red flex items-center gap-1">
                        <TrendingDown size={10} /> Lagging
                      </span>
                    )}
                  </div>
                  <span className={`text-sm font-bold ${pct >= 80 ? 'text-emerald-400' : pct >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {pct.toFixed(0)}%
                  </span>
                </div>
                <div className="bg-gray-700 rounded-full h-2 mb-3">
                  <div className={`h-2 rounded-full transition-all ${pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div>
                    <div className="text-gray-500">Revenue</div>
                    <div className="text-white font-semibold">{fmt(area.revenue)}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Target</div>
                    <div className="text-white font-semibold">{fmt(area.target)}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Gap</div>
                    <div className={`font-semibold ${gap > 0 ? 'text-red-400' : 'text-emerald-400'}`}>{gap > 0 ? `-${fmt(gap)}` : 'Exceeded'}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">YoY Growth</div>
                    <div className={`font-semibold ${area.growth >= 10 ? 'text-emerald-400' : area.growth >= 5 ? 'text-yellow-400' : 'text-red-400'}`}>
                      +{area.growth}%
                    </div>
                  </div>
                </div>
                {isLagging && (
                  <div className="mt-3 p-2 bg-red-900/20 rounded-lg text-xs text-red-300">
                    <strong>Action needed:</strong> Revenue is {(100 - pct).toFixed(0)}% below target. Consider increasing sales visits, regional promotions, or appointing dedicated area representative.
                  </div>
                )}
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}
