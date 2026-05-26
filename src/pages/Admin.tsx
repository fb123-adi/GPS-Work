import { useState } from 'react'
import { ShieldCheck, TrendingUp, TrendingDown, AlertTriangle, Users, Lock } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Header from '../components/layout/Header'
import { useApp } from '../context/AppContext'

const ADMIN_PASSWORD = 'gpswork2025'

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
          <span className="text-white font-medium">{typeof p.value === 'number' && p.name !== 'Score' ? fmt(p.value) : `${p.value}${p.name === 'Score' ? '%' : ''}`}</span>
        </div>
      ))}
    </div>
  )
}

function LoginGate({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  const attempt = () => {
    if (password === ADMIN_PASSWORD) {
      onLogin()
      setError(false)
    } else {
      setError(true)
      setPassword('')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-96">
      <div className="card max-w-sm w-full text-center">
        <div className="w-14 h-14 bg-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock size={24} className="text-white" />
        </div>
        <h2 className="text-lg font-bold text-white mb-1">Admin Panel</h2>
        <p className="text-sm text-gray-400 mb-5">Enter administrator password to access employee monitoring and anti-plagiarism controls.</p>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && attempt()}
          placeholder="Admin password"
          className={`w-full bg-gray-800 border ${error ? 'border-red-600' : 'border-gray-700'} rounded-lg px-4 py-2.5 text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-blue-500 mb-3`}
        />
        {error && <p className="text-xs text-red-400 mb-3">Incorrect password. Try again.</p>}
        <button onClick={attempt} className="btn-primary w-full">Access Admin Panel</button>
        <p className="text-xs text-gray-600 mt-3">Demo password: gpswork2025</p>
      </div>
    </div>
  )
}

export default function Admin() {
  const { employees, orders, isAdmin, loginAsAdmin } = useApp()
  const [authenticated, setAuthenticated] = useState(isAdmin)

  const handleLogin = () => {
    loginAsAdmin()
    setAuthenticated(true)
  }

  if (!authenticated) {
    return (
      <div>
        <Header title="Admin Panel" subtitle="Restricted access — administrator only" />
        <div className="p-6">
          <LoginGate onLogin={handleLogin} />
        </div>
      </div>
    )
  }

  const salesEmployees = employees.filter(e => e.department === 'Sales')

  const employeeChartData = salesEmployees.map(e => ({
    name: e.name.split(' ')[0],
    'This Month': e.salesThisMonth,
    'Last Month': e.salesLastMonth,
    Performance: e.performance,
  }))

  const plagiarismRisk = employees.filter(e => e.plagiarismScore > 0)
  const totalSalesThisMonth = salesEmployees.reduce((s, e) => s + e.salesThisMonth, 0)
  const avgPerformance = salesEmployees.reduce((s, e) => s + e.performance, 0) / salesEmployees.length

  // Employee order details
  const employeeOrders = (empId: string) =>
    orders.filter(o => o.assignedEmployeeId === empId)

  return (
    <div>
      <Header title="Admin Panel" subtitle="Employee monitoring, sales tracking & plagiarism control" />
      <div className="p-6 space-y-5">

        {/* Admin KPIs */}
        <div className="grid grid-cols-4 gap-4">
          <div className="card flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 rounded-xl"><Users size={18} className="text-white" /></div>
            <div>
              <div className="text-xs text-gray-500">Sales Staff</div>
              <div className="text-2xl font-bold text-white">{salesEmployees.length}</div>
            </div>
          </div>
          <div className="card flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600 rounded-xl"><TrendingUp size={18} className="text-white" /></div>
            <div>
              <div className="text-xs text-gray-500">Total Sales This Month</div>
              <div className="text-lg font-bold text-white">{fmt(totalSalesThisMonth)}</div>
            </div>
          </div>
          <div className="card flex items-center gap-3">
            <div className="p-2.5 bg-purple-600 rounded-xl"><BarChart3 size={18} className="text-white" /></div>
            <div>
              <div className="text-xs text-gray-500">Avg Team Performance</div>
              <div className={`text-2xl font-bold ${avgPerformance >= 80 ? 'text-emerald-400' : 'text-yellow-400'}`}>{avgPerformance.toFixed(0)}%</div>
            </div>
          </div>
          <div className={`card flex items-center gap-3 ${plagiarismRisk.length > 0 ? 'border-orange-800/50' : ''}`}>
            <div className={`p-2.5 rounded-xl ${plagiarismRisk.length > 0 ? 'bg-orange-600' : 'bg-gray-700'}`}>
              <AlertTriangle size={18} className="text-white" />
            </div>
            <div>
              <div className="text-xs text-gray-500">Plagiarism Flags</div>
              <div className={`text-2xl font-bold ${plagiarismRisk.length > 0 ? 'text-orange-400' : 'text-emerald-400'}`}>{plagiarismRisk.length}</div>
              <div className="text-xs text-gray-500">employees flagged</div>
            </div>
          </div>
        </div>

        {/* Plagiarism Monitor */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck size={16} className="text-blue-400" />
            <h3 className="font-semibold text-white">Anti-Plagiarism Monitor</h3>
            <span className="badge-blue ml-2">AI-Powered Report Analysis</span>
          </div>
          <div className="space-y-3">
            {employees.map(e => (
              <div key={e.id} className={`flex items-center gap-4 p-3 rounded-lg ${e.plagiarismScore > 5 ? 'bg-red-900/20 border border-red-800/40' : e.plagiarismScore > 0 ? 'bg-yellow-900/10 border border-yellow-800/30' : 'bg-gray-800/30'}`}>
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                  {e.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">{e.name}</span>
                    <span className="text-xs text-gray-500">{e.role}</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500">Plagiarism Score</div>
                  <div className={`text-lg font-bold ${e.plagiarismScore === 0 ? 'text-emerald-400' : e.plagiarismScore <= 5 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {e.plagiarismScore}%
                  </div>
                </div>
                <div>
                  {e.plagiarismScore === 0 ? (
                    <span className="badge-green">Clean</span>
                  ) : e.plagiarismScore <= 5 ? (
                    <span className="badge-yellow">Review</span>
                  ) : (
                    <span className="badge-red">Action Required</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 p-3 bg-blue-900/20 rounded-lg border border-blue-800/30 text-xs text-blue-300">
            <strong>Policy:</strong> Sales reports with plagiarism score &gt;5% are flagged for HR audit. Target is 0% across all employees. Automated detection runs on every report submission.
          </div>
        </div>

        {/* Sales Performance Chart */}
        <div className="card">
          <h3 className="font-semibold text-white mb-4">Employee Sales — This Month vs Last Month</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={employeeChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}K`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="This Month" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Last Month" fill="#6b7280" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Detailed Employee Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {salesEmployees.map(e => {
            const empOrders = employeeOrders(e.id)
            const growth = e.salesLastMonth > 0 ? ((e.salesThisMonth - e.salesLastMonth) / e.salesLastMonth * 100) : 0
            return (
              <div key={e.id} className="card">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-sm font-bold text-white">
                      {e.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-white text-sm">{e.name}</div>
                      <div className="text-xs text-gray-500">{e.role}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs font-semibold ${e.performance >= 85 ? 'text-emerald-400' : e.performance >= 70 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {e.performance}% performance
                    </div>
                    <div className="flex items-center gap-1 text-xs justify-end mt-0.5">
                      {growth >= 0 ? <TrendingUp size={11} className="text-emerald-400" /> : <TrendingDown size={11} className="text-red-400" />}
                      <span className={growth >= 0 ? 'text-emerald-400' : 'text-red-400'}>{Math.abs(growth).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                  <div className="bg-gray-800/50 rounded-lg p-2">
                    <div className="text-gray-500">This Month</div>
                    <div className="font-bold text-white">{fmt(e.salesThisMonth)}</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-2">
                    <div className="text-gray-500">Last Month</div>
                    <div className="font-bold text-white">{fmt(e.salesLastMonth)}</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-2">
                    <div className="text-gray-500">Total Orders</div>
                    <div className="font-bold text-white">{e.ordersCompleted}</div>
                  </div>
                </div>

                {/* Performance bar */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 bg-gray-700 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${e.performance >= 85 ? 'bg-emerald-500' : e.performance >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${e.performance}%` }} />
                  </div>
                  <span className="text-xs text-gray-500">{e.performance}%</span>
                </div>

                {/* Recent orders */}
                <div className="text-xs text-gray-500 mt-2">
                  Recent orders ({empOrders.slice(0, 2).map(o => o.id).join(', ')})
                </div>
                {e.plagiarismScore > 0 && (
                  <div className={`mt-2 text-xs px-2 py-1.5 rounded ${e.plagiarismScore > 5 ? 'bg-red-900/30 text-red-300' : 'bg-yellow-900/20 text-yellow-300'}`}>
                    Report plagiarism score: {e.plagiarismScore}% — {e.plagiarismScore > 5 ? 'Immediate HR review required' : 'Under monitoring'}
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

function BarChart3({ size, className }: { size?: number; className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width={size ?? 24} height={size ?? 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
}
