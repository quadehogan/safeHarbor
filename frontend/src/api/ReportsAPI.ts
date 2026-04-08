const BASE = `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5046'}/api/Reports`

function headers(token: string | null) {
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export interface AARSummaryDto {
  year: number
  caringCount: number
  healingCount: number
  teachingCount: number
  totalBeneficiaries: number
  reintegratedCount: number
}

export interface SafehouseMetricRowDto {
  safehouseId: number
  safehouseCode: string
  name: string
  region: string
  city: string
  capacity: number
  currentOccupancy: number
  avgHealthScore: number | null
  avgEducationProgress: number | null
  totalIncidents: number
  totalProcessRecordings: number
  totalHomeVisitations: number
  reintegrationsYtd: number
}

export interface ResidentRiskSummaryDto {
  highRisk: number
  mediumRisk: number
  lowRisk: number
  readyForReintegration: number
  reintegrationInProgress: number
  notReadyForReintegration: number
  topConcernFactors: string[]
  topStrengthFactors: string[]
  lastScoredAt: string | null
}

export interface DonorChurnSummaryDto {
  highChurn: number
  mediumChurn: number
  lowChurn: number
  totalScored: number
  topChurnFactors: string[]
  lastScoredAt: string | null
}

export async function fetchAARSummary(token: string | null, year: number): Promise<AARSummaryDto> {
  const res = await fetch(`${BASE}/aar-summary?year=${year}`, { headers: headers(token) })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function fetchSafehouseMetrics(token: string | null, year: number): Promise<SafehouseMetricRowDto[]> {
  const res = await fetch(`${BASE}/safehouse-metrics?year=${year}`, { headers: headers(token) })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function fetchResidentRiskSummary(token: string | null): Promise<ResidentRiskSummaryDto> {
  const res = await fetch(`${BASE}/resident-risk-summary`, { headers: headers(token) })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function fetchDonorChurnSummary(token: string | null): Promise<DonorChurnSummaryDto> {
  const res = await fetch(`${BASE}/donor-churn-summary`, { headers: headers(token) })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
