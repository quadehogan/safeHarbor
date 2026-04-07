import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

// Cookie name — browser-accessible (not httponly) so React reads it directly.
// This satisfies the IS 414 requirement: "browser-accessible cookie for user setting consumed by React"
const COOKIE_NAME = 'safeharbor_theme'

// Read a cookie by name
function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

// Set a cookie (365 days, SameSite=Lax, no HttpOnly — accessible to JS)
function setCookie(name: string, value: string) {
  const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Initialize from cookie, default to light
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = getCookie(COOKIE_NAME)
    return saved === 'dark' ? 'dark' : 'light'
  })

  // Apply .dark class to <html> and persist to cookie whenever theme changes
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    setCookie(COOKIE_NAME, theme)
  }, [theme])

  function toggleTheme() {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
