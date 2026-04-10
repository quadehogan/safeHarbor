import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Heart, X } from 'lucide-react'

/**
 * Sticky bottom banner encouraging donations.
 * Appears after the user scrolls 400px on public pages.
 * Can be dismissed (stays hidden for the session via sessionStorage).
 */
export function DonateBanner() {
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(() =>
    sessionStorage.getItem('donate_banner_dismissed') === '1',
  )

  useEffect(() => {
    if (dismissed) return

    function onScroll() {
      setVisible(window.scrollY > 400)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [dismissed])

  function handleDismiss() {
    setDismissed(true)
    setVisible(false)
    sessionStorage.setItem('donate_banner_dismissed', '1')
  }

  if (dismissed || !visible) return null

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 animate-card-in">
      <div className="bg-pink-600 text-white shadow-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <p className="text-sm font-medium flex items-center gap-2">
            <Heart className="h-4 w-4 shrink-0" />
            <span>
              <span className="hidden sm:inline">Your gift can change a girl's life. </span>
              Help a girl find safety today.
            </span>
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/register"
              className="inline-flex items-center gap-1.5 rounded-md bg-white text-pink-700 px-4 py-1.5 text-sm font-semibold hover:bg-pink-50 transition-colors"
            >
              Donate Now
            </Link>
            <button
              onClick={handleDismiss}
              className="rounded-md p-1 text-white/70 hover:text-white hover:bg-pink-700 transition-colors"
              aria-label="Dismiss donate banner"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
