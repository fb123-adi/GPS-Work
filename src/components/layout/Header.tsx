import { Bell, Search } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { companyErrors } from '../../data/mockData'

interface HeaderProps {
  title: string
  subtitle?: string
}

export default function Header({ title, subtitle }: HeaderProps) {
  const { isAdmin } = useApp()
  const openCritical = companyErrors.filter(e => e.severity === 'critical' && e.status !== 'resolved').length

  return (
    <header className="border-b border-gray-800 bg-gray-950 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
      <div>
        <h1 className="text-xl font-bold text-white">{title}</h1>
        {subtitle && <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Quick search…"
            className="bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-blue-500 w-52"
          />
        </div>
        <div className="relative">
          <button className="p-2 rounded-lg bg-gray-800 border border-gray-700 hover:bg-gray-700 transition-colors">
            <Bell size={16} className="text-gray-400" />
          </button>
          {openCritical > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
              {openCritical}
            </span>
          )}
        </div>
        {isAdmin && (
          <span className="badge-blue text-xs px-2 py-1">Admin</span>
        )}
      </div>
    </header>
  )
}
