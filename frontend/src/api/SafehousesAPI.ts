import type { Safehouse, SafehouseDetailDto } from '@/types/Safehouse'

const BASE = `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5046'}/api/Safehouses`

function headers(token: string | null) {
  const h: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) h.Authorization = `Bearer ${token}`
  return h
}

export async function fetchSafehouses(token: string | null): Promise<Safehouse[]> {
  const res = await fetch(BASE, { headers: headers(token) })
  if (!res.ok) throw new Error(`GET /api/Safehouses failed: ${res.status}`)
  return res.json()
}

export async function fetchSafehouseDetail(
  token: string | null,
  id: number,
): Promise<SafehouseDetailDto> {
  const res = await fetch(`${BASE}/${id}`, { headers: headers(token) })
  if (!res.ok) throw new Error(`GET /api/Safehouses/${id} failed: ${res.status}`)
  return res.json()
}
