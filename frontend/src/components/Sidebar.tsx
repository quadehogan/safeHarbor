import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  FileText,
  ClipboardList,
  Home,
  Heart,
  LogOut,
  BarChart2,
  Menu,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Residents', icon: Users, href: '/residents' },
  { label: 'Process Recording', icon: ClipboardList, href: '/process-recordings' },
  { label: 'Home Visitation', icon: ClipboardList, href: '/home-visitation' },
  { label: 'Safehouses', icon: Home, href: '/safehouses' },
  { label: 'Donors & Giving', icon: Heart, href: '/donors' },
  { label: 'Social Media', icon: FileText, href: '/social-media' },
  { label: 'Reports', icon: BarChart2, href: '/reports' },
]

const donorNavItems = [{ label: 'My Impact', icon: Heart, href: '/donor' }]

export function Sidebar() {
  const location = useLocation()
  const { clearAuth, isDonor } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  function handleLogout() {
    clearAuth()
    navigate('/login')
  }

  return (
    <>
      {/* Mobile top bar — visible only on small screens */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 z-40 bg-slate-950 border-b border-slate-800 flex items-center px-4 gap-3">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="text-slate-400 hover:text-white p-1 transition-colors rounded-md"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link to="/dashboard" className="flex items-center">
          <img src="/DarkModeSafeHarborLogo.png" alt="Safe Harbor" className="h-8 w-auto" />
        </Link>
      </div>

      {/* Backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          'w-64 bg-slate-950 flex flex-col z-50',
          'fixed inset-y-0 left-0 transition-transform duration-300',
          'lg:static lg:inset-auto lg:z-auto lg:min-h-screen lg:shrink-0 lg:transition-none lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Logo + close button */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center">
            <img
              src="/DarkModeSafeHarborLogo.png"
              alt="Safe Harbor"
              className="h-12 w-auto"
            />
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white p-1 transition-colors rounded-md"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {(isDonor ? donorNavItems : navItems).map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setMobileOpen(false)}
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
    </>
  )
}
