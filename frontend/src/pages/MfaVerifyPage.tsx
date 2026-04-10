import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { mfaVerify } from '@/api/AuthAPI'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function MfaVerifyPage() {
  const { setAuth } = useAuth()
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const data = await mfaVerify(code.trim())
      sessionStorage.removeItem('mfa_email')
      setAuth(data.token, data.email, data.roles)

      if (data.roles.includes('Admin') || data.roles.includes('SocialWorker')) {
        navigate('/dashboard', { replace: true })
      } else if (data.roles.includes('DonorPortal')) {
        navigate('/donor', { replace: true })
      } else {
        navigate('/', { replace: true })
      }
    } catch {
      setError('Invalid code. Check your authenticator app and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main id="main-content" className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl font-bold text-foreground">Two-factor authentication</CardTitle>
          <p className="text-sm text-muted-foreground">
            Enter the 6-digit code from your authenticator app
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="code">Authentication code</Label>
              <Input
                id="code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                required
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="text-center text-lg tracking-widest"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded px-3 py-2">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={loading || code.length < 6}>
              {loading ? 'Verifying...' : 'Verify'}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Lost access to your authenticator?{' '}
            <a href="mailto:admin@safeharbor.com" className="underline hover:text-foreground">
              Contact an administrator
            </a>
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
