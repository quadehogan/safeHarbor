const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5046'}/api/Impact`

function headers(token: string | null) {
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export interface ImpactSnapshotDto {
  snapshotId: number
  month: string
  avgHealthScore: number
  avgEducationProgress: number
  totalResidents: number
  donationsTotalForMonth: number
}

export interface ProgramImpactSummaryDto {
  programArea: string
  outcomeMetric: string
  estimatedPctChange: number
  timeWindowMonths: number
  sampleStatementText: string
}

export interface DonorImpactStatementDto {
  statementId: string
  programArea: string
  allocationAmount: number
  outcomeMetric: string
  timeWindowMonths: number
  estimatedPctChange: number
  statementText: string
  generatedAt: string | null
}

// Legacy — returns raw snapshots with metric_payload_json string
export async function fetchImpact(token: string | null): Promise<unknown[]> {
  const res = await fetch(API_BASE_URL, { headers: headers(token) })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

// Parsed, typed snapshots — filters placeholder rows
export async function fetchImpactSnapshots(): Promise<ImpactSnapshotDto[]> {
  const res = await fetch(`${API_BASE_URL}/snapshots`, { headers: headers(null) })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

// Aggregate program-level impact — public, no auth
export async function fetchProgramImpactSummary(): Promise<ProgramImpactSummaryDto[]> {
  const res = await fetch(`${API_BASE_URL}/program-summary`, { headers: headers(null) })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

// Personalized donor statements — requires DonorPortal or Admin token
export async function fetchDonorImpactStatements(token: string): Promise<DonorImpactStatementDto[]> {
  const res = await fetch(`${API_BASE_URL}/statements`, { headers: headers(token) })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
