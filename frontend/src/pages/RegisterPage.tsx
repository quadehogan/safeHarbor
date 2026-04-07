import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5046'

const PASSWORD_HINT = 'Password must be at least 14 characters long'

type IdentityErrorJson = { code?: string; description?: string }

function isPasswordRelatedIdentityError(errors: IdentityErrorJson[]) {
  return errors.some(
    e =>
      (e.code?.startsWith('Password') ?? false) ||
      (e.description?.toLowerCase().includes('password') ?? false),
  )
}

export function RegisterPage() {
  const { setAuth } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const passwordsMatch = password === confirmPassword
  const confirmMismatch =
    confirmPassword.length > 0 && !passwordsMatch

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!passwordsMatch) return

    setError(null)
    setLoading(true)

    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          role: 'DonorPortal',
        }),
      })

      if (!res.ok) {
        if (res.status === 400) {
          let payload: unknown
          try {
            payload = await res.json()
          } catch {
            setError('Registration could not be completed. Please try again.')
            return
          }

          const errors: IdentityErrorJson[] = Array.isArray(payload)
            ? (payload as IdentityErrorJson[])
            : []

          if (isPasswordRelatedIdentityError(errors)) {
            setError(PASSWORD_HINT)
            return
          }

          const first = errors[0]?.description?.trim()
          setError(first || 'Registration could not be completed. Please try again.')
          return
        }

        setError('Registration could not be completed. Please try again.')
        return
      }

      const data = await res.json() as { token: string; email: string; roles: string[] }
      setAuth(data.token, data.email, data.roles)
      navigate('/')
    } catch {
      setError('Unable to connect to the server. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const submitDisabled =
    loading || !passwordsMatch || !email.trim() || !password

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl font-bold text-foreground">Create account</CardTitle>
          <p className="text-sm text-muted-foreground">Register as a donor</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="reg-email">Email</Label>
              <Input
                id="reg-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="reg-password">Password</Label>
              <Input
                id="reg-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={14}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••••"
              />
              <p className="text-xs text-muted-foreground">{PASSWORD_HINT}</p>
            </div>

            <div className="space-y-1">
              <Label htmlFor="reg-confirm">Confirm password</Label>
              <Input
                id="reg-confirm"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••••"
              />
              {confirmMismatch && (
                <p className="text-sm text-destructive" role="alert">
                  Passwords do not match.
                </p>
              )}
            </div>

            <p className="text-sm text-muted-foreground">
              You will be registered as a <strong>Donor</strong>.
            </p>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded px-3 py-2">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={submitDisabled}>
              {loading ? 'Creating account…' : 'Register'}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            <Link to="/" className="underline hover:text-foreground">
              Return to home page
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
