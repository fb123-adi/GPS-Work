import { AlertTriangle, CheckCircle, Clock, TrendingDown } from 'lucide-react'
import Header from '../components/layout/Header'
import { useApp } from '../context/AppContext'

function fmt(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`
  return `₹${n}`
}

const severityConfig = {
  critical: { color: 'text-red-400', bg: 'bg-red-900/20 border-red-800/50', badge: 'badge-red', icon: AlertTriangle },
  high: { color: 'text-orange-400', bg: 'bg-orange-900/10 border-orange-800/30', badge: 'badge-yellow', icon: AlertTriangle },
  medium: { color: 'text-yellow-400', bg: 'bg-yellow-900/10 border-yellow-800/30', badge: 'badge-yellow', icon: Clock },
  low: { color: 'text-gray-400', bg: 'bg-gray-800/30 border-gray-700/50', badge: 'bg-gray-700 text-gray-400 text-xs px-2 py-0.5 rounded-full border border-gray-600', icon: Clock },
}

const statusConfig = {
  open: 'badge-red',
  in_progress: 'badge-yellow',
  resolved: 'badge-green',
}

export default function ErrorAnalysis() {
  const { companyErrors } = useApp()

  const totalEstimatedLoss = companyErrors.filter(e => e.status !== 'resolved').reduce((s, e) => s + e.estimatedLoss, 0)
  const openCount = companyErrors.filter(e => e.status === 'open').length
  const inProgressCount = companyErrors.filter(e => e.status === 'in_progress').length
  const resolvedCount = companyErrors.filter(e => e.status === 'resolved').length
  const criticalCount = companyErrors.filter(e => e.severity === 'critical' && e.status !== 'resolved').length

  const sorted = [...companyErrors].sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 }
    return order[a.severity] - order[b.severity]
  })

  return (
    <div>
      <Header title="Error Analysis" subtitle="Company issues, operational gaps & corrective actions" />
      <div className="p-6 space-y-5">

        <div className="grid grid-cols-4 gap-4">
          <div className="card border-red-800/40 bg-red-950/10">
            <div className="text-xs text-gray-500 mb-1">Estimated Monthly Loss</div>
            <div className="text-2xl font-bold text-red-400">{fmt(totalEstimatedLoss)}</div>
            <div className="text-xs text-gray-500 mt-1">from open issues</div>
          </div>
          <div className="card">
            <div className="text-xs text-gray-500 mb-1">Open Issues</div>
            <div className="text-2xl font-bold text-red-400">{openCount}</div>
            <div className="text-xs text-gray-500">{criticalCount} critical</div>
          </div>
          <div className="card">
            <div className="text-xs text-gray-500 mb-1">In Progress</div>
            <div className="text-2xl font-bold text-yellow-400">{inProgressCount}</div>
            <div className="text-xs text-gray-500">being addressed</div>
          </div>
          <div className="card">
            <div className="text-xs text-gray-500 mb-1">Resolved</div>
            <div className="text-2xl font-bold text-emerald-400">{resolvedCount}</div>
            <div className="text-xs text-gray-500">this cycle</div>
          </div>
        </div>

        <div className="space-y-3">
          {sorted.map(err => {
            const cfg = severityConfig[err.severity]
            const Icon = cfg.icon
            return (
              <div key={err.id} className={`card border ${cfg.bg}`}>
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${err.severity === 'critical' ? 'bg-red-900/40' : 'bg-gray-800'} flex-shrink-0 mt-0.5`}>
                    <Icon size={16} className={cfg.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-white text-sm">{err.title}</span>
                      <span className={cfg.badge}>{err.severity}</span>
                      <span className={statusConfig[err.status]}>{err.status.replace('_', ' ')}</span>
                    </div>
                    <div className="text-xs text-gray-400 mb-2 leading-relaxed">{err.description}</div>
                    <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <TrendingDown size={11} className="text-red-400" />
                        Est. loss: <span className="text-red-400 font-medium ml-1">{fmt(err.estimatedLoss)}</span>
                      </span>
                      <span>Impact: <span className="text-gray-300">{err.impactArea}</span></span>
                      <span>Category: <span className="text-gray-300">{err.category}</span></span>
                      <span>Detected: <span className="text-gray-300">{err.detectedDate}</span></span>
                    </div>
                  </div>
                  <div className="text-xs font-mono text-gray-600 flex-shrink-0">{err.id}</div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Resolution roadmap */}
        <div className="card">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <CheckCircle size={16} className="text-emerald-400" /> Recommended Resolution Roadmap
          </h3>
          <div className="space-y-3">
            {[
              { step: 1, action: 'Immediate: Restock GPS Antenna & Power Backup Units (min 50 units each)', deadline: '2–3 days', priority: 'critical' },
              { step: 2, action: 'Contact Shah Industries for payment plan — escalate to management', deadline: '1 week', priority: 'critical' },
              { step: 3, action: 'Expedite Shah Industries order (ORD-2025-0044) — source alternative components', deadline: '3–5 days', priority: 'critical' },
              { step: 4, action: 'Schedule Assembly Line Beta maintenance — book technician', deadline: '2 weeks', priority: 'high' },
              { step: 5, action: 'HR review of Neha Joshi & Rohan Gupta reporting — conduct audit', deadline: '1 week', priority: 'medium' },
              { step: 6, action: 'Laser Engraving Unit: evaluate repurpose vs phase-out decision', deadline: '1 month', priority: 'medium' },
              { step: 7, action: 'Develop Kerala & Punjab regional sales strategy — appoint area reps', deadline: '2 months', priority: 'medium' },
            ].map(r => (
              <div key={r.step} className="flex items-center gap-3 p-3 bg-gray-800/40 rounded-lg">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  r.priority === 'critical' ? 'bg-red-700 text-red-200' :
                  r.priority === 'high' ? 'bg-orange-700 text-orange-200' : 'bg-gray-700 text-gray-300'
                }`}>
                  {r.step}
                </div>
                <span className="text-sm text-gray-300 flex-1">{r.action}</span>
                <span className="text-xs text-gray-500 flex-shrink-0">{r.deadline}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
