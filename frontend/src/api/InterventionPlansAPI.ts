import type { InterventionPlan } from '@/types/InterventionPlan'

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5046'}/api/InterventionPlans`

function headers(token: string | null) {
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export async function fetchInterventionPlans(token: string | null): Promise<InterventionPlan[]> {
  const res = await fetch(API_BASE_URL, { headers: headers(token) })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
