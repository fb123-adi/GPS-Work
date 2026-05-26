import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, ShoppingCart, Package,
  Cpu, BarChart3, AlertTriangle, Bot, ShieldCheck, LogOut, MapPin
} from 'lucide-react'
import { useApp } from '../../context/AppContext'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/customers', icon: Users, label: 'Customers' },
  { to: '/orders', icon: ShoppingCart, label: 'Orders' },
  { to: '/products', icon: Package, label: 'Products' },
  { to: '/machines', icon: Cpu, label: 'Machines' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/areas', icon: MapPin, label: 'Sales Areas' },
  { to: '/errors', icon: AlertTriangle, label: 'Error Analysis' },
  { to: '/ai-assistant', icon: Bot, label: 'AI Assistant' },
  { to: '/admin', icon: ShieldCheck, label: 'Admin Panel' },
]

export default function Sidebar() {
  const { isAdmin, currentUser, logout } = useApp()

  return (
    <aside className="w-60 bg-gray-900 border-r border-gray-800 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-5 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-lg">G</div>
          <div>
            <div className="font-bold text-white text-sm leading-tight">GPS Work</div>
            <div className="text-gray-500 text-xs">Business Dashboard</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User info */}
      <div className="p-3 border-t border-gray-800">
        <div className="px-3 py-2 rounded-lg bg-gray-800/50 mb-2">
          <div className="text-xs text-gray-500 mb-0.5">Logged in as</div>
          <div className="text-sm font-medium text-white truncate">
            {isAdmin ? 'Administrator' : currentUser?.name ?? 'Guest'}
          </div>
          {(isAdmin || currentUser) && (
            <div className="text-xs text-gray-500">{isAdmin ? 'Full Access' : currentUser?.role}</div>
          )}
        </div>
        {(isAdmin || currentUser) && (
          <button
            onClick={logout}
            className="flex items-center gap-2 text-gray-400 hover:text-white text-xs px-3 py-1.5 w-full rounded hover:bg-gray-800 transition-colors"
          >
            <LogOut size={13} /> Sign Out
          </button>
        )}
      </div>
    </aside>
  )
}
