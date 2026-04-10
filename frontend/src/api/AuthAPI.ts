const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5046'}/api/Auth`

export async function login(email: string, password: string): Promise<{ token: string }> {
  const res = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

// MFA: complete a pending MFA login with a TOTP code.
// credentials:'include' is required so the mfa_pending httpOnly cookie is sent.
export async function mfaVerify(code: string): Promise<{ token: string; email: string; roles: string[] }> {
  const res = await fetch(`${API_BASE_URL}/mfa-verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ code }),
  })
  if (!res.ok) throw new Error('Invalid code')
  return res.json()
}

// MFA setup: get the otpauth URI and current enabled state.
export async function getMfaSetup(token: string): Promise<{ otpAuthUri: string; isEnabled: boolean }> {
  const res = await fetch(`${API_BASE_URL}/mfa-setup`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

// MFA setup: verify the TOTP code and enable 2FA on the account.
export async function enableMfa(token: string, code: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/mfa-setup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ code }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string }
    throw new Error(body.error ?? 'Failed to enable MFA')
  }
}

// MFA disable: turn off 2FA and reset the authenticator key.
export async function disableMfa(token: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/mfa-disable`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(await res.text())
}
