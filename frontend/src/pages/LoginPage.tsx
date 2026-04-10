import { useState, useEffect, type FormEvent } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5046'

export function LoginPage() {
  const { setAuth } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Handle Google OAuth callback -- token comes back as a query param
  useEffect(() => {
    const token = searchParams.get('token')
    const googleEmail = searchParams.get('email')
    const rolesParam = searchParams.get('roles')

    if (token && googleEmail) {
      const roles = rolesParam ? rolesParam.split(',') : []
      setAuth(token, googleEmail, roles)

      if (roles.includes('Admin') || roles.includes('SocialWorker')) {
        navigate('/dashboard', { replace: true })
      } else if (roles.includes('DonorPortal')) {
        navigate('/donor', { replace: true })
      } else {
        navigate('/', { replace: true })
      }
    }
  }, [searchParams, setAuth, navigate])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // credentials:'include' is required so the browser stores the httpOnly
        // mfa_pending cookie that the server sets when 2FA is enabled.
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        setError('Invalid email or password.')
        return
      }

      const data = await res.json() as { token: string; email: string; roles: string[]; requiresMfa?: boolean }

      // MFA gate: if the server requires a TOTP code, redirect to the verify page.
      // The mfa_pending cookie is already set; sessionStorage carries the email across.
      if (data.requiresMfa) {
        sessionStorage.setItem('mfa_email', email)
        navigate('/mfa-verify', { replace: true })
        return
      }

      setAuth(data.token, data.email, data.roles)

      // Route based on role
      if (data.roles.includes('Admin') || data.roles.includes('SocialWorker')) {
        navigate('/dashboard')
      } else if (data.roles.includes('DonorPortal')) {
        navigate('/donor')
      } else {
        navigate('/')
      }
    } catch {
      setError('Unable to connect to the server. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Redirect to backend Google OAuth endpoint
  function handleGoogleLogin() {
    window.location.href = `${API_BASE}/api/auth/google-login`
  }

  return (
    <main id="main-content" className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl font-bold text-foreground">Sign in</CardTitle>
          <p className="text-sm text-muted-foreground">Safe Harbor staff and donor portal</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded px-3 py-2">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or continue with</span>
            </div>
          </div>

          {/* Google OAuth button */}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleLogin}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Sign in with Google
          </Button>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            <Link to="/" className="underline hover:text-foreground">
              Return to home page
            </Link>
          </p>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            <Link to="/register" className="underline hover:text-foreground">
              Don&apos;t have an account? Register as a donor
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
