export interface Safehouse {
  safehouseId: number
  safehouseCode: string | null
  name: string | null
  region: string | null
  city: string | null
  province: string | null
  country: string | null
  openDate: string | null
  status: string | null
  capacityGirls: number | null
  capacityStaff: number | null
  currentOccupancy: number | null
  notes: string | null
}

export interface ResidentSummaryDto {
  residentId: number
  internalCode: string | null
  caseStatus: string | null
  currentRiskLevel: string | null
  presentAge: string | null
  assignedSocialWorker: string | null
}

export interface IncidentReportDto {
  incidentReportId: number
  residentId: number | null
  safehouseId: number | null
  incidentDate: string | null
  incidentType: string | null
  severity: string | null
  description: string | null
  responseTaken: string | null
  resolved: boolean | null
  resolutionDate: string | null
  reportedBy: string | null
  followUpRequired: boolean | null
}

export interface SafehouseMonthlyMetricDto {
  safehouseMonthlyMetricId: number
  safehouseId: number | null
  monthStart: string | null
  monthEnd: string | null
  activeResidents: number | null
  avgEducationProgress: number | null
  avgHealthScore: number | null
  processRecordingCount: number | null
  homeVisitationCount: number | null
  incidentCount: number | null
  notes: string | null
}

export interface SafehouseDetailDto extends Safehouse {
  residents: ResidentSummaryDto[]
  recentIncidents: IncidentReportDto[]
  monthlyMetrics: SafehouseMonthlyMetricDto[]
}
