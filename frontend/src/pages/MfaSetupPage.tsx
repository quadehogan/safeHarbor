import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '@/context/AuthContext'
import { getMfaSetup, enableMfa, disableMfa } from '@/api/AuthAPI'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Sidebar } from '@/components/Sidebar'
import { QRCodeSVG } from 'qrcode.react'

export function MfaSetupPage() {
  const { token } = useAuth()
  const [otpAuthUri, setOtpAuthUri] = useState<string | null>(null)
  const [isEnabled, setIsEnabled] = useState(false)
  const [code, setCode] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!token) return
    getMfaSetup(token)
      .then(data => {
        setOtpAuthUri(data.otpAuthUri)
        setIsEnabled(data.isEnabled)
      })
      .catch(() => setError('Failed to load MFA setup.'))
      .finally(() => setLoading(false))
  }, [token])

  async function handleEnable(e: FormEvent) {
    e.preventDefault()
    if (!token) return
    setError(null)
    setMessage(null)
    setSubmitting(true)
    try {
      await enableMfa(token, code.trim())
      setIsEnabled(true)
      setCode('')
      setMessage('MFA enabled. Your account is now protected with two-factor authentication.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDisable() {
    if (!token) return
    setError(null)
    setMessage(null)
    setSubmitting(true)
    try {
      await disableMfa(token)
      setIsEnabled(false)
      setMessage('MFA disabled.')
    } catch {
      setError('Failed to disable MFA.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main id="main-content" className="flex-1 overflow-auto px-6 pb-6 pt-14 lg:p-8">
        <div className="max-w-lg">
          <h1 className="text-2xl font-bold text-foreground mb-1">Two-factor authentication</h1>
          <p className="text-sm text-muted-foreground mb-8">
            Add an extra layer of security to your account using an authenticator app (Google Authenticator, Authy, etc.).
          </p>

          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  {isEnabled ? 'MFA is enabled' : 'Set up MFA'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {message && (
                  <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-3 py-2">
                    {message}
                  </p>
                )}
                {error && (
                  <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded px-3 py-2">
                    {error}
                  </p>
                )}

                {!isEnabled && otpAuthUri && (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground mb-3">
                        1. Scan this QR code with your authenticator app.
                      </p>
                      <div className="inline-block p-3 bg-white rounded-lg border">
                        <QRCodeSVG value={otpAuthUri} size={180} />
                      </div>
                    </div>

                    <form onSubmit={handleEnable} className="space-y-4">
                      <div className="space-y-1">
                        <Label htmlFor="code">
                          2. Enter the 6-digit code from your app to confirm
                        </Label>
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
                          className="w-40 text-center text-lg tracking-widest"
                        />
                      </div>
                      <Button type="submit" disabled={submitting || code.length < 6}>
                        {submitting ? 'Enabling...' : 'Enable MFA'}
                      </Button>
                    </form>
                  </>
                )}

                {isEnabled && (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Your account requires a TOTP code at every login. To disable MFA, click below.
                    </p>
                    <Button variant="destructive" onClick={handleDisable} disabled={submitting}>
                      {submitting ? 'Disabling...' : 'Disable MFA'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
