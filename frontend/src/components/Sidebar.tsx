import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  FileText,
  ClipboardList,
  Home,
  Heart,
  Handshake,
  LogOut,
  Shield,
  BarChart2,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Residents', icon: Users, href: '/residents' },
  { label: 'Process Recording', icon: ClipboardList, href: '/process-recordings' },
  { label: 'Safehouses', icon: Home, href: '/safehouses' },
  { label: 'Donors & Giving', icon: Heart, href: '/donor' },
  { label: 'Partners', icon: Handshake, href: '/partners' },
  { label: 'Social Media', icon: FileText, href: '/social-media' },
  { label: 'Reports', icon: BarChart2, href: '/reports' },
  { label: 'My Impact', icon: Sparkles, href: '/donor/impact' },
]

export function Sidebar() {
  const location = useLocation()
  const { clearAuth } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    clearAuth()
    navigate('/login')
  }

  return (
    <aside className="w-64 bg-slate-950 shrink-0 flex flex-col min-h-screen">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-800">
        <Link to="/dashboard" className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold text-white tracking-tight">
            SafeHarbor
          </span>
        </Link>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors w-full"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  )
}
