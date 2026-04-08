import type { ProcessRecording } from '@/types/ProcessRecording'

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5046'}/api/ProcessRecordings`

function headers(token: string | null) {
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

// GET /api/ProcessRecordings  or  ?residentId=X
export async function fetchProcessRecordings(
  token: string | null,
  residentId?: number,
): Promise<ProcessRecording[]> {
  const url = residentId ? `${API_BASE_URL}?residentId=${residentId}` : API_BASE_URL
  const res = await fetch(url, { headers: headers(token) })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

// GET /api/ProcessRecordings/{id}
export async function fetchProcessRecording(
  token: string | null,
  id: number,
): Promise<ProcessRecording> {
  const res = await fetch(`${API_BASE_URL}/${id}`, { headers: headers(token) })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

// POST /api/ProcessRecordings
export async function createProcessRecording(
  token: string | null,
  data: Partial<ProcessRecording>,
): Promise<ProcessRecording> {
  const res = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

// PUT /api/ProcessRecordings/{id}
export async function updateProcessRecording(
  token: string | null,
  id: number,
  data: ProcessRecording,
): Promise<ProcessRecording> {
  const res = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: headers(token),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

// DELETE /api/ProcessRecordings/{id}
export async function deleteProcessRecording(
  token: string | null,
  id: number,
): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: headers(token),
  })
  if (!res.ok) throw new Error(await res.text())
}
