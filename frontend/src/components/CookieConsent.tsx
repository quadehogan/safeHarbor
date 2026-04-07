import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Cookie, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Cookie name — browser-accessible (not httponly) so React can read it
const COOKIE_NAME = 'safeharbor_consent'

// Read a cookie by name
function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

// Set a cookie (expires in 365 days, SameSite=Lax, accessible to JS)
function setCookie(name: string, value: string) {
  const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Show banner only if user hasn't already responded
    const consent = getCookie(COOKIE_NAME)
    if (!consent) {
      setVisible(true)
    }
  }, [])

  function accept() {
    setCookie(COOKIE_NAME, 'accepted')
    setVisible(false)
  }

  function decline() {
    setCookie(COOKIE_NAME, 'declined')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6">
      <div className="mx-auto max-w-2xl rounded-xl border border-border bg-card shadow-lg p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <Cookie className="h-5 w-5 text-primary mt-0.5 shrink-0" />

          <div className="flex-1 space-y-3">
            <p className="text-sm text-foreground leading-relaxed">
              We use cookies to remember your preferences and improve your
              experience. No personal data is shared with third parties.{' '}
              <Link
                to="/privacy"
                className="underline underline-offset-2 text-primary hover:text-primary/80"
              >
                Privacy Policy
              </Link>
            </p>

            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={accept}>
                Accept Cookies
              </Button>
              <Button size="sm" variant="outline" onClick={decline}>
                Decline
              </Button>
            </div>
          </div>

          <button
            onClick={decline}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Dismiss cookie banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
