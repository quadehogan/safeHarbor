import type { Donation } from '../types/Donation'

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5046'}/api/Donations`

function headers(token: string | null) {
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export async function fetchDonations(
  token: string | null,
  filters?: { type?: string; campaign?: string; channel?: string }
): Promise<Donation[]> {
  const params = new URLSearchParams()
  if (filters?.type) params.set('type', filters.type)
  if (filters?.campaign) params.set('campaign', filters.campaign)
  if (filters?.channel) params.set('channel', filters.channel)
  const qs = params.toString()
  const res = await fetch(`${API_BASE_URL}${qs ? `?${qs}` : ''}`, { headers: headers(token) })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function fetchDonation(token: string | null, id: number): Promise<Donation> {
  const res = await fetch(`${API_BASE_URL}/${id}`, { headers: headers(token) })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function createDonation(token: string | null, data: Partial<Donation>): Promise<Donation> {
  const res = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function updateDonation(token: string | null, id: number, data: Donation): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: headers(token),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(await res.text())
}

export async function deleteDonation(token: string | null, id: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: headers(token),
  })
  if (!res.ok) throw new Error(await res.text())
}
