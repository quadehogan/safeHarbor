# Reports & Analytics Page — Component Plan

## Overview

**Route:** `/reports`
**Access:** `Admin` + `SocialWorker` roles (ProtectedRoute)
**Layout:** Admin sidebar layout (matches OverviewPage, ResidentsPage pattern)
**Purpose:** Internal decision-support tool for staff and leadership. Surfaces aggregated insights across residents, donations, and safehouses. Structured to align with the Philippine DSWD Annual Accomplishment Report (AAR) format, which organizes outputs into three service pillars — Caring, Healing, and Teaching — plus a Reintegration outcome category.

**ML Pipelines integrated:**
- `/score/residents` → `resident_risk_scores` (regression risk tiers, reintegration readiness, concern/strength factors)
- `/score/churn` → `donor_churn_scores` (churn tier distribution, top churn factors per donor)

---

## File Structure

New files this page introduces:

```
frontend/src/
├── pages/
│   └── ReportsPage.tsx                      ← page shell, tab router
│
├── components/
│   ├── analytics/                           ← shared, reusable analytics primitives
│   │   ├── MetricNumber.tsx
│   │   ├── TrendBadge.tsx
│   │   ├── TrendChart.tsx
│   │   ├── RiskTierPills.tsx
│   │   └── SummaryStatRow.tsx
│   │
│   └── reports/                             ← domain-specific section components
│       ├── AARSummaryCard.tsx
│       ├── ResidentRiskWidget.tsx
│       ├── ReintegrationFunnel.tsx
│       ├── EducationProgressSection.tsx
│       ├── HealthOutcomesSection.tsx
│       ├── DonationTrendChart.tsx
│       ├── DonorChurnWidget.tsx
│       └── SafehouseComparisonTable.tsx
│
└── api/
    └── ReportsAPI.ts                        ← new API file for aggregated/pipeline endpoints
```

---

## Shared Analytics Primitives (`components/analytics/`)

These are generic, data-agnostic components. They have no domain knowledge — they accept
typed props and render consistently. They can be reused on any other admin page.

---

### `MetricNumber.tsx`

Renders a large statistic number with an optional label and trend delta.

```tsx
interface MetricNumberProps {
  label: string
  value: string | number
  delta?: number          // e.g. +12 or -3 (raw change)
  deltaLabel?: string     // e.g. "vs last quarter"
  loading?: boolean
}
```

Visual: `text-3xl font-bold` number, `text-sm text-muted-foreground` label below, optional
`TrendBadge` next to value if delta is provided.

**Reused in:** `AARSummaryCard`, `ResidentOutcomesPublic`, `DonorChurnWidget`

---

### `TrendBadge.tsx`

A small colored badge showing directional change.

```tsx
interface TrendBadgeProps {
  delta: number           // positive = up (good or bad depends on context)
  invert?: boolean        // if true, up is red (used for risk/churn where increase is bad)
  label?: string
}
```

Visual: green up-arrow badge for positive, red down-arrow for negative. Uses semantic
status color classes from ui-components.md. No hardcoded hex.

**Reused in:** `MetricNumber`, `DonorChurnWidget`, `SafehouseComparisonTable`

---

### `TrendChart.tsx`

A generic recharts line or bar chart wrapper.

```tsx
interface TrendChartProps {
  data: Record<string, unknown>[]
  xKey: string
  yKey: string
  label: string
  chartType?: 'line' | 'bar'
  height?: number
  color?: string          // defaults to primary
}
```

Uses `recharts` (already available in the project). No direct data fetching — receives
data as props so the parent controls loading/error states.

**Reused in:** `DonationTrendChart`, `EducationProgressSection`, `HealthOutcomesSection`

---

### `RiskTierPills.tsx`

Displays a High / Medium / Low tier breakdown as colored badge + count pairs.

```tsx
interface RiskTierPillsProps {
  high: number
  medium: number
  low: number
  tierLabels?: { high: string; medium: string; low: string }  // defaults to High/Medium/Low
  loading?: boolean
}
```

Visual: three horizontally arranged `Badge` elements using semantic status colors:
- High → `bg-red-100 text-red-800`
- Medium → `bg-amber-100 text-amber-800`
- Low → `bg-emerald-100 text-emerald-800`

**Reused in:** `ResidentRiskWidget`, `DonorChurnWidget`

---

### `SummaryStatRow.tsx`

A horizontal row of up to four `MetricNumber` instances, separated by dividers.
Used to display AAR-style service counts in a single scannable row.

```tsx
interface SummaryStatRowProps {
  metrics: Array<{ label: string; value: string | number; delta?: number }>
  loading?: boolean
}
```

**Reused in:** `AARSummaryCard`, Overview tab header

---

## Section Components (`components/reports/`)

These components are domain-specific but still receive all data as props — they do not fetch
independently. The parent page (or tab) fetches and passes down. This makes each section
independently testable and composable.

---

### `AARSummaryCard.tsx`

Renders an Annual Accomplishment Report summary block aligned with DSWD reporting format.
Presents the three service pillars (Caring, Healing, Teaching) plus total beneficiaries.

```tsx
interface AARSummaryCardProps {
  year: number
  caring: number            // count of residents who received shelter/protective services
  healing: number           // count of residents who received counseling/health services
  teaching: number          // count of residents who received education/vocational services
  totalBeneficiaries: number
  reintegrated: number      // count successfully reintegrated this period
  loading?: boolean
}
```

Visual layout:
- Card header: "Annual Accomplishment Report — [Year]" with a note about DSWD alignment
- `SummaryStatRow` with Caring / Healing / Teaching / Total counts
- A second row with Reintegrated count and reintegration rate

Uses: `Card`, `CardHeader`, `CardContent`, `SummaryStatRow`, `MetricNumber`

---

### `ResidentRiskWidget.tsx`

Displays output from the **Resident Risk Pipeline** (`resident_risk_scores` table).
Shows the distribution of regression risk tiers and reintegration readiness tiers across
all currently scored residents. Also renders the most commonly cited top concern factors
and top strength factors aggregated across the population.

```tsx
interface ResidentRiskWidgetProps {
  regressionRisk: { high: number; medium: number; low: number }
  reintegrationReadiness: { ready: number; inProgress: number; notReady: number }
  topConcernFactors: string[]   // aggregated most frequent factors across all residents
  topStrengthFactors: string[]
  scoredAt: string | null       // ISO timestamp of last scoring run
  loading?: boolean
}
```

Visual layout (Card):
- Header: "Resident Risk Scores" + badge showing "Powered by ML" + last scored timestamp
- Two-column: left = Regression Risk `RiskTierPills`, right = Reintegration Readiness `RiskTierPills`
  (with custom tier labels: Ready / In Progress / Not Ready)
- Below: two lists — "Common Concern Signals" and "Common Strength Signals" as small
  bulleted badge chips

> **Access note:** This component's data comes from a RLS-restricted table. The API endpoint
> serving this data must require Admin or SocialWorker role. Never render this section for
> unauthenticated or DonorPortal users.

Uses: `Card`, `CardHeader`, `CardContent`, `RiskTierPills`, `Badge`

---

### `ReintegrationFunnel.tsx`

Visualizes the resident journey pipeline from intake to successful reintegration.
A horizontal funnel diagram with stage counts.

```tsx
interface ReintegrationFunnelProps {
  active: number
  inFamilyReunification: number
  inIndependentLiving: number
  reintegrated: number
  loading?: boolean
}
```

Visual: Four horizontally connected stage blocks with counts, rendered as a stepped
bar using pure Tailwind (no external chart library needed for this one — widths are
percentage-proportional). Labels: "In Care" → "Reunification Track" → "Independent Living
Track" → "Reintegrated".

Uses: `Card`, `CardContent`

---

### `EducationProgressSection.tsx`

Displays aggregated education metrics derived from `education_records`.

```tsx
interface EducationProgressSectionProps {
  enrollmentRate: number         // percentage 0-100
  attendanceRate: number
  completionRate: number
  vocationalGraduates: number
  trendData: Array<{ month: string; avgProgress: number }>
  loading?: boolean
}
```

Visual: top row of four `MetricNumber` blocks, then a `TrendChart` (line) showing
average education progress score over time.

Uses: `MetricNumber`, `TrendChart`, `Card`, `CardContent`

---

### `HealthOutcomesSection.tsx`

Displays aggregated health and wellbeing metrics from `health_wellbeing_records`.

```tsx
interface HealthOutcomesSectionProps {
  avgHealthScore: number           // current period average
  avgPriorHealthScore: number      // previous period for delta
  mentalHealthFlags: number        // count of active flags
  trendData: Array<{ month: string; avgScore: number }>
  loading?: boolean
}
```

Visual: `MetricNumber` with delta for avg health score, count of active mental health
flags with severity badge, and a `TrendChart` (bar) showing average scores by month.

Uses: `MetricNumber`, `TrendBadge`, `TrendChart`, `Card`, `CardContent`

---

### `DonationTrendChart.tsx`

Wraps `TrendChart` with donation-specific data shaping. Accepts a raw donations array
and groups by month internally before rendering.

```tsx
interface DonationTrendChartProps {
  donations: Donation[]
  loading?: boolean
}
```

Derives monthly totals (cash only, or all types) and renders as a bar chart.
Includes a total raised `MetricNumber` above the chart.

Uses: `TrendChart`, `MetricNumber`, `Card`, `CardContent`, `CardHeader`

---

### `DonorChurnWidget.tsx`

Displays output from the **Donor Churn Pipeline** (`donor_churn_scores` table).
Shows the distribution of churn risk tiers across the active donor base, the count of
high-risk donors requiring outreach, and the most common churn factors.

```tsx
interface DonorChurnWidgetProps {
  churnTiers: { high: number; medium: number; low: number }
  topChurnFactors: string[]      // most frequent factors across high-tier donors
  totalScored: number
  scoredAt: string | null
  loading?: boolean
}
```

Visual layout (Card):
- Header: "Donor Retention Risk" + last run timestamp
- `RiskTierPills` for churn distribution
- Alert box (amber) if `churnTiers.high > 0`: "X donors are at high risk of lapsing.
  Consider a re-engagement campaign."
- Bulleted list of top churn factors labeled "Why donors may be leaving"

> **Access note:** This component requires Admin role — donor churn scores are sensitive
> operational data not appropriate for SocialWorker views.

Uses: `Card`, `CardHeader`, `CardContent`, `RiskTierPills`, `Badge`

---

### `SafehouseComparisonTable.tsx`

A sortable table comparing all safehouses across key performance metrics.

```tsx
interface SafehouseRow {
  safehouseId: string
  name: string
  location: string
  capacity: number
  currentOccupancy: number
  activeIncidents: number
  reintegratedThisYear: number
  avgHealthScore: number | null
}

interface SafehouseComparisonTableProps {
  rows: SafehouseRow[]
  loading?: boolean
}
```

Columns: Safehouse | Location | Occupancy | Active Incidents | Reintegrations YTD | Avg
Health Score. Occupancy renders as an `OccupancyBar` mini-component (reused from the
Donor Dashboard) with numeric overlay.

Sortable by occupancy rate and incident count. Uses shadcn `Table` component.

Uses: `Table`, `TableBody`, `TableCell`, `TableHead`, `TableHeader`, `TableRow`,
`Badge`, `Skeleton`

---

## Schema Reference & Data Notes

Pulled from the actual CSV data. Use these shapes to write TypeScript interfaces and
backend DTOs accurately.

### `safehouse_monthly_metrics`
```
metric_id, safehouse_id, month_start, month_end,
active_residents, avg_education_progress (0–100 float, nullable),
avg_health_score (1–5 float, nullable),
process_recording_count, home_visitation_count, incident_count, notes
```
Early rows may have null `avg_education_progress` and `avg_health_score` — components
must handle nulls gracefully (display `—` not `0`).

### `residents`
```
resident_id, case_control_no, internal_code, safehouse_id, case_status,
sex, date_of_birth, case_category, reintegration_type, reintegration_status,
initial_risk_level, current_risk_level, date_of_admission, date_closed,
assigned_social_worker, ...many boolean sub_cat_* fields
```
- `case_status`: `Active`, `Closed`
- `current_risk_level`: `Critical`, `High`, `Medium`, `Low`
- `reintegration_status`: `In Progress`, `Completed`, `On Hold`
- `reintegration_type`: `Foster Care`, `Family Reunification`, `None`, etc.

### `education_records`
```
education_record_id, resident_id, record_date, education_level,
school_name, enrollment_status, attendance_rate (0.0–1.0 decimal),
progress_percent (0–100), completion_status, notes
```
- `completion_status`: `NotStarted`, `InProgress`, `Completed`
- Aggregate by averaging `progress_percent` and `attendance_rate` across active residents

### `health_wellbeing_records`
```
health_record_id, resident_id, record_date, general_health_score (1–5),
nutrition_score (1–5), sleep_quality_score (1–5), energy_level_score (1–5),
height_cm, weight_kg, bmi, medical_checkup_done, dental_checkup_done,
psychological_checkup_done, notes
```
- Health scores are on a **1–5 scale** (not percentage). Display as `X.X / 5.0`.
- The public snapshot `avg_health_score` is also on the same 1–5 scale.

### `intervention_plans`
```
plan_id, resident_id, plan_category, plan_description,
services_provided (comma-separated), target_value, target_date, status,
case_conference_date
```
- `services_provided` contains comma-separated values from: `Caring`, `Healing`,
  `Teaching`, `Legal Services`, `Transport`, `Operations`
- **AAR Caring/Healing/Teaching mapping:** Count residents with at least one active
  plan whose `services_provided` contains each keyword. A resident may appear in
  multiple categories — that is correct AAR behavior (one beneficiary can receive
  multiple service types).

### `incident_reports`
```
incident_id, resident_id, safehouse_id, incident_date, incident_type,
severity (Low/Medium/High), resolved (bool), resolution_date, follow_up_required
```

### `donations`
```
donation_id, supporter_id, donation_type (Monetary/Time/InKind),
donation_date, is_recurring, campaign_name, channel_source,
currency_code, amount, estimated_value, impact_unit
```
- `amount` is null for non-monetary; use `estimated_value` as the numeric fallback.
- Currency is `PHP` for local monetary donations.

### `donation_allocations`
```
allocation_id, donation_id, safehouse_id, program_area, amount_allocated, allocation_date
```
- `program_area` values: `Education`, `Wellbeing`, `Transport`, `Operations` (and others)

### Pipeline output tables (in Supabase — same DB, accessed via EF Core)

**`resident_risk_scores`** (from `/score/residents` pipeline):
```
resident_id, regression_risk_score (0–1), regression_risk_tier (high/medium/low),
reintegration_score (0–1), reintegration_tier (ready/in_progress/not_ready),
top_concern_factors (jsonb array), top_strength_factors (jsonb array),
scored_at, model_version
```

**`donor_churn_scores`** (from `/score/churn` pipeline):
```
supporter_id, churn_score (0–1), churn_tier (high/medium/low),
top_churn_factors (jsonb array), scored_at, model_version
```

---

## Architecture Note — Supabase as the Database

Supabase is the PostgreSQL database for this project. The EF Core `SafeHarborDbContext`
connects to it via the Supabase connection string. The ML pipeline output tables
(`resident_risk_scores`, `donor_churn_scores`) are in the **same Supabase instance** —
no secondary database connection is needed. The solution is:

1. Add C# model classes for the pipeline tables to `Data/`
2. Register them as `DbSet<T>` in `SafeHarborDbContext`
3. Query them from `ReportsController` just like any other EF Core entity

No separate Supabase client SDK or second connection string required.

---

## Backend Routes — `ReportsController.cs`

New file: `backend/SafeHarbor.API/Controllers/ReportsController.cs`

### New model classes needed in `Data/`

```csharp
// Data/ResidentRiskScore.cs
public class ResidentRiskScore
{
    [Key] public int ResidentId { get; set; }
    public float RegressionRiskScore { get; set; }
    public string RegressionRiskTier { get; set; } = "";
    public float ReintegrationScore { get; set; }
    public string ReintegrationTier { get; set; } = "";
    public string? TopConcernFactors { get; set; }  // stored as JSON string
    public string? TopStrengthFactors { get; set; }
    public DateTime? ScoredAt { get; set; }
    public string? ModelVersion { get; set; }
}

// Data/DonorChurnScore.cs
public class DonorChurnScore
{
    [Key] public int SupporterId { get; set; }
    public float ChurnScore { get; set; }
    public string ChurnTier { get; set; } = "";
    public string? TopChurnFactors { get; set; }  // stored as JSON string
    public DateTime? ScoredAt { get; set; }
    public string? ModelVersion { get; set; }
}
```

Add to `SafeHarborDbContext`:
```csharp
public DbSet<ResidentRiskScore> ResidentRiskScores => Set<ResidentRiskScore>();
public DbSet<DonorChurnScore> DonorChurnScores => Set<DonorChurnScore>();
```

### Response DTOs

```csharp
// DTOs returned by ReportsController — not EF entities, just shaped responses

public record AARSummaryDto(
    int Year,
    int CaringCount,
    int HealingCount,
    int TeachingCount,
    int TotalBeneficiaries,
    int ReintegratedCount
);

public record SafehouseMetricRowDto(
    int SafehouseId,
    string SafehouseCode,
    string Name,
    string Region,
    string City,
    int Capacity,
    int CurrentOccupancy,
    double? AvgHealthScore,
    double? AvgEducationProgress,
    int TotalIncidents,
    int TotalProcessRecordings,
    int TotalHomeVisitations,
    int ReintegrationsYtd
);

public record ResidentRiskSummaryDto(
    int HighRisk,
    int MediumRisk,
    int LowRisk,
    int ReadyForReintegration,
    int ReintegrationInProgress,
    int NotReadyForReintegration,
    IEnumerable<string> TopConcernFactors,
    IEnumerable<string> TopStrengthFactors,
    DateTime? LastScoredAt
);

public record DonorChurnSummaryDto(
    int HighChurn,
    int MediumChurn,
    int LowChurn,
    int TotalScored,
    IEnumerable<string> TopChurnFactors,
    DateTime? LastScoredAt
);
```

### Controller Methods

```csharp
[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,SocialWorker")]
public class ReportsController : ControllerBase
{
    private readonly SafeHarborDbContext _db;
    public ReportsController(SafeHarborDbContext db) => _db = db;

    // GET /api/Reports/aar-summary?year=2025
    // Auth: Admin, SocialWorker
    // Returns Caring/Healing/Teaching counts for the year, derived from
    // intervention_plans.services_provided field (comma-separated values).
    // Caring/Healing/Teaching counts are residents who have at least one
    // plan with that keyword in services_provided, with an active or in-progress plan.
    [HttpGet("aar-summary")]
    public async Task<ActionResult<AARSummaryDto>> GetAARSummary(
        [FromQuery] int year, CancellationToken ct) { ... }

    // GET /api/Reports/safehouse-metrics?year=2025
    // Auth: Admin, SocialWorker
    // Returns per-safehouse aggregate metrics by joining safehouses with
    // safehouse_monthly_metrics for the given year. Also joins residents to
    // count reintegrations (date_closed within year, reintegration_status = Completed).
    [HttpGet("safehouse-metrics")]
    public async Task<ActionResult<IEnumerable<SafehouseMetricRowDto>>> GetSafehouseMetrics(
        [FromQuery] int year, CancellationToken ct) { ... }

    // GET /api/Reports/resident-risk-summary
    // Auth: Admin, SocialWorker
    // Aggregates all rows in resident_risk_scores:
    // counts per regression_risk_tier and reintegration_tier,
    // parses top_concern_factors/top_strength_factors jsonb and returns
    // the N most frequent strings across all residents.
    [HttpGet("resident-risk-summary")]
    public async Task<ActionResult<ResidentRiskSummaryDto>> GetResidentRiskSummary(
        CancellationToken ct) { ... }

    // GET /api/Reports/donor-churn-summary
    // Auth: Admin only (churn data is sensitive donor operational info)
    [HttpGet("donor-churn-summary")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<DonorChurnSummaryDto>> GetDonorChurnSummary(
        CancellationToken ct) { ... }
}
```

## API Layer — `ReportsAPI.ts`

New file in `frontend/src/api/`. All calls include JWT token.

```ts
export async function fetchAARSummary(token: string | null, year: number): Promise<AARSummaryDto>
// GET /api/Reports/aar-summary?year={year}

export async function fetchSafehouseMetrics(token: string | null, year: number): Promise<SafehouseMetricRowDto[]>
// GET /api/Reports/safehouse-metrics?year={year}

export async function fetchResidentRiskSummary(token: string | null): Promise<ResidentRiskSummaryDto>
// GET /api/Reports/resident-risk-summary

export async function fetchDonorChurnSummary(token: string | null): Promise<DonorChurnSummaryDto>
// GET /api/Reports/donor-churn-summary (Admin only — call only when isAdmin)
```

A `ReportsController.cs` will need to be created in the backend to serve these endpoints.
These are read-only aggregation endpoints — no write operations.

---

## Full Page Composition — `ReportsPage.tsx`

```
ReportsPage
├── <Sidebar />
└── main
    ├── page header
    │   ├── h1: "Reports & Analytics"
    │   ├── year filter <Select> (2023, 2024, 2025, 2026)
    │   └── [Export PDF button — future feature, disabled for now]
    │
    └── <Tabs defaultValue="overview">
        ├── <TabsList>
        │   ├── Overview
        │   ├── Resident Outcomes
        │   ├── Donations & Donors
        │   └── Safehouse Performance
        │
        ├── Overview Tab
        │   ├── <AARSummaryCard />                  ← Caring/Healing/Teaching/Reintegrated
        │   └── <SummaryStatRow />                  ← Active residents, total safehouses,
        │                                              total donors, total raised
        │
        ├── Resident Outcomes Tab
        │   ├── <ResidentRiskWidget />               ← Resident Risk Pipeline output
        │   ├── <ReintegrationFunnel />
        │   ├── <EducationProgressSection />
        │   └── <HealthOutcomesSection />
        │
        ├── Donations & Donors Tab
        │   ├── <DonationTrendChart />
        │   └── <DonorChurnWidget />                 ← Donor Churn Pipeline output
        │
        └── Safehouse Performance Tab
            └── <SafehouseComparisonTable />
```

### Data loading pattern

`ReportsPage` fetches all data in parallel on mount using `Promise.all`, following the
same pattern as `OverviewPage`. Each tab's components receive their slice of data as
props — no tab component fetches independently. This keeps fetch logic co-located and
makes loading states predictable.

```tsx
const [riskSummary, churnSummary, safehouses, aarData, donations, residents] =
  await Promise.all([
    fetchResidentRiskSummary(token),
    fetchDonorChurnSummary(token),        // Admin only — guarded by isAdmin check
    fetchSafehouseMetrics(token),
    fetchAARSummary(token, selectedYear),
    fetchDonations(token),
    fetchResidents(token),
  ])
```

### Error handling

If the Resident Risk or Donor Churn pipelines have not been run yet (empty tables),
`ResidentRiskWidget` and `DonorChurnWidget` render a graceful empty state:
"Scores not yet available. Run the ML scoring pipeline to populate this section."

### Access control

The page itself is wrapped in `<ProtectedRoute>`. The `DonorChurnWidget` is additionally
guarded by `isAdmin` — if the logged-in user is a SocialWorker, that section is hidden
and its API call is skipped.

---

## Design Notes

- Follow shadcn Tab component from ui-components.md. Tabs are explicitly called out for
  Reports & Analytics pages.
- All cards follow the `Card` → `CardHeader` → `CardContent` pattern with `p-6` inner padding.
- All loading states use `<Skeleton>` — no spinners.
- Color system: semantic status colors from ui-components.md. No hardcoded hex.
- The pipeline data sections include a small "Powered by ML · Last run [timestamp]" label
  so staff can see how fresh the scores are.
- The AAR format (Caring / Healing / Teaching) mirrors what Philippine DSWD social welfare
  agencies submit in their annual reports, making it easier for staff to cross-reference
  official filings.
