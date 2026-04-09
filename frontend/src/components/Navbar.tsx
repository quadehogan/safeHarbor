import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, Sun, Moon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/context/ThemeContext'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'

const publicLinks = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Our Impact', to: '/impact' },
  { label: 'Contact', to: '/contact' },
]

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const { token, clearAuth } = useAuth()

  function handleLogout() {
    clearAuth()
    navigate('/', { replace: true })
  }

  return (
    <nav className="bg-white dark:bg-slate-950 border-b border-border dark:border-slate-800 sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img
              src={
                theme === 'dark'
                  ? '/DarkModeSafeHarborLogo.png'
                  : '/LightModeSafeHarbor.png'
              }
              alt="Safe Harbor"
              className="h-12 w-auto"
            />
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {publicLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  'px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  location.pathname === link.to
                    ? 'text-foreground bg-muted dark:bg-slate-800'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-slate-800/50',
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop: theme toggle + login */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="rounded-md p-2 text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-slate-800 transition-colors"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            {token !== null ? (
              <Button type="button" variant="ghost" onClick={handleLogout}>
                Log out
              </Button>
            ) : (
              <Link
                to="/login"
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Log In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden rounded-md p-2 text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-slate-800"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border dark:border-slate-800">
          <div className="px-4 py-3 space-y-1">
            {publicLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'block px-3 py-2 text-sm font-medium rounded-md',
                  location.pathname === link.to
                    ? 'text-foreground bg-muted dark:bg-slate-800'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-slate-800/50',
                )}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-slate-800/50 rounded-md"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>
            {token !== null ? (
              <Button
                type="button"
                variant="outline"
                className="w-full mt-2"
                onClick={() => {
                  setMobileOpen(false)
                  handleLogout()
                }}
              >
                Log out
              </Button>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="block mt-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground text-center hover:bg-primary/90"
              >
                Log In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
