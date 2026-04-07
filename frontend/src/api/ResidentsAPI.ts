import type { Resident } from '@/types/Resident'

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5046'}/api/Residents`

function headers(token: string | null) {
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

// GET /api/Residents
export async function fetchResidents(token: string | null): Promise<Resident[]> {
  const res = await fetch(API_BASE_URL, { headers: headers(token) })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

// GET /api/Residents/{id}
export async function fetchResident(token: string | null, id: number): Promise<Resident> {
  const res = await fetch(`${API_BASE_URL}/${id}`, { headers: headers(token) })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

// POST /api/Residents
export async function createResident(token: string | null, data: Partial<Resident>): Promise<Resident> {
  const res = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

// PUT /api/Residents/{id}
export async function updateResident(token: string | null, id: number, data: Resident): Promise<Resident> {
  const res = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: headers(token),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

// DELETE /api/Residents/{id}
export async function deleteResident(token: string | null, id: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: headers(token),
  })
  if (!res.ok) throw new Error(await res.text())
}
