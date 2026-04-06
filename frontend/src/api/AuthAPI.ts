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
