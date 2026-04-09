import type { Supporter } from '../types/Supporter'

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5046'}/api/Supporters`

function headers(token: string | null) {
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

// Get the current logged-in donor's supporter record
export async function fetchMySupporter(token: string | null): Promise<Supporter> {
  const res = await fetch(`${API_BASE_URL}/me`, { headers: headers(token) })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function fetchSupporters(
  token: string | null,
  filters?: { status?: string; type?: string }
): Promise<Supporter[]> {
  const params = new URLSearchParams()
  if (filters?.status) params.set('status', filters.status)
  if (filters?.type) params.set('type', filters.type)
  const qs = params.toString()
  const res = await fetch(`${API_BASE_URL}${qs ? `?${qs}` : ''}`, { headers: headers(token) })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function fetchSupporter(token: string | null, id: number): Promise<Supporter> {
  const res = await fetch(`${API_BASE_URL}/${id}`, { headers: headers(token) })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function createSupporter(token: string | null, data: Partial<Supporter>): Promise<Supporter> {
  const res = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function updateSupporter(token: string | null, id: number, data: Supporter): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: headers(token),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(await res.text())
}

export async function deleteSupporter(token: string | null, id: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: headers(token),
  })
  if (!res.ok) throw new Error(await res.text())
}
