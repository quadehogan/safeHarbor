import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

// Cookie names — browser-accessible (not httponly) so React reads them directly.
// Theme cookie satisfies IS 414: "browser-accessible cookie for user setting consumed by React"
const THEME_COOKIE = 'safeharbor_theme'
const CONSENT_COOKIE = 'safeharbor_consent'

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

// Delete a cookie by setting it expired
function deleteCookie(name: string) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
}

// Check if the user accepted ALL cookies (including preferences like theme)
function hasPreferenceConsent(): boolean {
  return getCookie(CONSENT_COOKIE) === 'all'
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Initialize from cookie only if consent was accepted, otherwise default to light
  const [theme, setTheme] = useState<Theme>(() => {
    if (hasPreferenceConsent()) {
      const saved = getCookie(THEME_COOKIE)
      return saved === 'dark' ? 'dark' : 'light'
    }
    return 'light'
  })

  // Apply .dark class to <html> and persist to cookie only if consent accepted
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    // Only write the theme cookie if the user accepted cookies
    if (hasPreferenceConsent()) {
      setCookie(THEME_COOKIE, theme)
    } else {
      // If consent was declined or not yet given, remove any existing theme cookie
      deleteCookie(THEME_COOKIE)
    }
  }, [theme])

  // Listen for consent changes so the theme cookie is saved after accepting
  useEffect(() => {
    const interval = setInterval(() => {
      if (hasPreferenceConsent() && !getCookie(THEME_COOKIE)) {
        setCookie(THEME_COOKIE, theme)
      }
    }, 1000)
    return () => clearInterval(interval)
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
