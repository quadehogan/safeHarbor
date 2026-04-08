import type { HomeVisitation } from '@/types/HomeVisitation'

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5046'}/api/HomeVisitations`

function headers(token: string | null) {
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export async function fetchHomeVisitations(token: string | null): Promise<HomeVisitation[]> {
  const res = await fetch(API_BASE_URL, { headers: headers(token) })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function createHomeVisitation(token: string | null, data: Partial<HomeVisitation>): Promise<HomeVisitation> {
  const res = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function updateHomeVisitation(token: string | null, id: number, data: HomeVisitation): Promise<HomeVisitation> {
  const res = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: headers(token),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function deleteHomeVisitation(token: string | null, id: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: headers(token),
  })
  if (!res.ok) throw new Error(await res.text())
}
