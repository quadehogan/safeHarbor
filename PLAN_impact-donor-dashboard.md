# Impact / Donor-Facing Dashboard — Component Plan

## Overview

**Route:** `/impact`
**Access:** Public (unauthenticated). Optional personalized section for authenticated
`DonorPortal` role users.
**Layout:** Public layout — `<Navbar />` + `<Footer />` (matches existing `ImpactPage` shell)
**Purpose:** Donor- and public-facing page showing the organization's aggregate impact in
a visually clear, emotionally resonant way. Data is always anonymized — no resident PII.
Designed to build donor trust and communicate outcomes without exposing case-level data.

**ML Pipeline integrated:**
- `/score/impact` → `donor_impact_statements` (program-area-level estimated % change in
  outcomes; personalized statements for logged-in DonorPortal users)

This page replaces and extends the current static `ImpactPage.tsx`. All static hardcoded
numbers are replaced with live data from `PublicImpactSnapshot` and pipeline outputs.

---

## File Structure

New and modified files:

```
frontend/src/
├── pages/
│   └── ImpactPage.tsx                           ← updated (replace static data with live)
│
├── components/
│   ├── analytics/                               ← shared with Reports page (no duplication)
│   │   ├── MetricNumber.tsx                     ← reused from Reports plan
│   │   └── OccupancyBar.tsx                     ← new shared primitive
│   │
│   └── impact/                                  ← donor-dashboard-specific sections
│       ├── ImpactHeroSection.tsx
│       ├── ProgramAreaImpactCard.tsx
│       ├── ProgramImpactSection.tsx
│       ├── SafehouseLocationsGrid.tsx
│       ├── ResidentOutcomesPublic.tsx
│       ├── DonorPersonalizedSection.tsx
│       ├── PersonalizedStatementCard.tsx
│       ├── AnonymizedStoryCard.tsx
│       ├── StoriesSection.tsx
│       └── ImpactCTASection.tsx
│
└── api/
    └── ImpactAPI.ts                             ← extended (add program impact + personal statements)
```

---

## Shared Analytics Primitives (from `components/analytics/`)

Both the Reports page and the Donor Dashboard share these. Define once, import everywhere.

---

### `MetricNumber.tsx` *(defined in Reports plan — reused here)*

Large stat number + label + optional trend delta. Used in the hero stats and outcome panels.

---

### `OccupancyBar.tsx`

A compact capacity fill bar. Used in both the Donor Dashboard's safehouse grid and, if
desired, the admin Safehouse Comparison Table.

```tsx
interface OccupancyBarProps {
  current: number
  capacity: number
  showLabel?: boolean     // "13/15" text suffix, defaults true
}
```

Visual: `h-2 rounded-full bg-muted` track with `bg-primary` fill proportional to
`current / capacity`. Truncated at 100% to handle edge cases. No fractions of percent
shown publicly to avoid leaking occupancy precision.

Uses: pure Tailwind, no external library.

**Reused in:** `SafehouseLocationsGrid`, `SafehouseComparisonTable` (Reports page)

---

## Section Components (`components/impact/`)

Each section component is self-contained and receives all data as props. The page shell
fetches everything and distributes it. Sections do not fetch independently.

---

### `ImpactHeroSection.tsx`

Full-bleed hero with background image, mission headline, and four headline stat cards.
Replaces the static hero in the current `ImpactPage`.

```tsx
interface HeroStat {
  icon: React.ElementType
  value: string
  label: string
}

interface ImpactHeroSectionProps {
  headline: string                 // e.g. "The lives behind the numbers"
  subheadline: string
  stats: HeroStat[]                // 4 items from PublicImpactSnapshot
  backgroundImage: string
}
```

Visual: Same structure as current ImpactPage hero — `relative min-h-[480px]`, full-bleed
`img`, `bg-black/60` overlay, headline text, then a 4-column stat grid.

Stat cards use dark-section overrides from ui-components.md (`bg-black/40 backdrop-blur-sm
border-white/10 text-white`).

Uses: `FadeIn` scroll animation hook (extracted from current ImpactPage into a shared
`useFadeIn` hook in `lib/useFadeIn.ts`)

---

### `ProgramAreaImpactCard.tsx`

Displays one program area's estimated outcome impact from the Impact Attribution Pipeline.
Only rendered when the pipeline has found a statistically significant effect (p < 0.05).

```tsx
interface ProgramAreaImpactCardProps {
  programArea: string              // e.g. "Wellbeing", "Education"
  outcomeMetric: string            // e.g. "health_3m", "education_6m"
  estimatedPctChange: number       // e.g. 9.2
  timeWindowMonths: number         // 3 or 6
  icon: React.ElementType          // lucide-react icon for the program area
  sampleStatement?: string         // optional representative statement_text (anonymized)
}
```

Visual (Card):
- Icon + program area name in the header
- Large number: "+X.X%" in primary color with label "estimated improvement in [outcome]
  over [N] months"
- Optional: a quote-styled excerpt of the `statement_text` in muted italic text
- A subtle footnote: "Based on statistical analysis of donor allocations and resident
  outcomes. Results are estimated and reflect population-level trends."

Uses: `Card`, `CardContent`, `MetricNumber`, lucide-react icon

---

### `ProgramImpactSection.tsx`

Container section that renders a heading, methodology note, and a grid of
`ProgramAreaImpactCard` instances — one per program area with a significant effect.

```tsx
interface ProgramImpactSectionProps {
  programs: ProgramAreaImpactCardProps[]   // only significant results passed in
  loading?: boolean
}
```

If `programs` is empty (no statistically significant effects yet), the section is
**hidden entirely** — it does not render a "no data" state publicly. This avoids
communicating model immaturity to donors. The section only appears when there is
something meaningful to show.

If loading, renders three `Skeleton` card placeholders at the same size.

Visual: `bg-muted/40` background, centered section header, then `grid-cols-1 md:grid-cols-3`
card grid.

Uses: `ProgramAreaImpactCard`, `Skeleton`, `FadeIn`

---

### `SafehouseLocationsGrid.tsx`

Displays all safehouses as location cards with region, city, and occupancy. Public-safe —
no identifying information, no resident counts beyond occupancy ratios.

```tsx
interface SafehouseLocation {
  city: string
  region: string
  current: number
  capacity: number
}

interface SafehouseLocationsGridProps {
  locations: SafehouseLocation[]
  loading?: boolean
}
```

Visual: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` grid. Each card shows `MapPin` icon,
city name, region, and an `OccupancyBar`. No exact resident counts shown — only
`OccupancyBar` visual without the numeric label (privacy).

Uses: `OccupancyBar`, `FadeIn`, lucide-react `MapPin`

> **Privacy note:** Do not show exact occupancy numbers (e.g. "13/15") on the public page.
> Only the visual bar is shown. The numeric variant is used on admin pages only.

---

### `ResidentOutcomesPublic.tsx`

Displays high-level outcome statistics in an emotionally resonant 2x2 or 1x4 grid.
All data is aggregate and anonymized. No case-level data. Pulled from `PublicImpactSnapshot`.

```tsx
interface ResidentOutcomesPublicProps {
  girlsCurrentlyInCare: number
  reintegrationRate: number        // percentage
  inFamilyReunification: number
  livingIndependently: number
  schoolEnrollmentRate: number
  vocationalGraduates: number
  loading?: boolean
}
```

Visual: Two alternating image+stats rows (matches current ImpactPage pattern for
"Rescue & Reintegration" and "Education That Opens Doors"). Stats rendered as 2x2 grids
of `MetricNumber` with icons.

Uses: `MetricNumber`, `FadeIn`, photo assets

---

### `DonorPersonalizedSection.tsx`

**Conditionally rendered.** Only appears when the user is authenticated with the
`DonorPortal` role. Fetches the current user's personalized impact statements from
`donor_impact_statements` filtered by their `supporter_id`.

```tsx
interface DonorPersonalizedSectionProps {
  token: string
  supporterId: number
}
```

Internal behavior:
1. On mount, calls `fetchDonorImpactStatements(token, supporterId)`
2. If no statements returned (donor's allocations didn't reach significance threshold),
   renders a graceful note: "Your impact is being tracked. Personalized results will appear
   here as our data grows — thank you for your continued support."
3. If statements returned, renders a heading and a list of `PersonalizedStatementCard`

Uses: `PersonalizedStatementCard`, `Skeleton`, `useAuth`

---

### `PersonalizedStatementCard.tsx`

Renders a single personalized impact statement for a logged-in donor.

```tsx
interface PersonalizedStatementCardProps {
  statementText: string            // ready-to-read human text from pipeline
  programArea: string
  allocationAmount: number
  estimatedPctChange: number
  timeWindowMonths: number
  safeHouseId: string              // used for display only, not a link
  generatedAt: string              // ISO timestamp for "as of" label
}
```

Visual (Card):
- Left accent bar in primary color
- Program area badge
- `statementText` in `text-sm text-foreground leading-relaxed` (the human-readable sentence
  from the pipeline, e.g. "Your $150 allocated to Wellbeing at Safehouse Cebu was associated
  with a 9.2% improvement...")
- Footer: "Estimated as of [date]" in muted text

Uses: `Card`, `CardContent`, `Badge`

---

### `AnonymizedStoryCard.tsx`

A reusable card for anonymized resident stories. Extracted from the current static
`ImpactPage` into a standalone component.

```tsx
interface AnonymizedStoryCardProps {
  label: string           // "Resident A"
  age: string
  text: string
  status: string          // "Education In Progress", "Reintegration Complete", etc.
  image: string           // photo asset import
}
```

Visual: Card with a photo at top, status badge, age, and story text. Matches current
ImpactPage story card design exactly — this is just extracting what's already there.

Uses: `Card`, `Badge`, `FadeIn`

---

### `StoriesSection.tsx`

Container that renders the section heading and a grid of `AnonymizedStoryCard` instances.

```tsx
interface StoriesSectionProps {
  stories: AnonymizedStoryCardProps[]
}
```

Visual: `bg-muted/30` background, centered heading, `grid-cols-1 md:grid-cols-3` grid.

Uses: `AnonymizedStoryCard`, `FadeIn`

---

### `ImpactCTASection.tsx`

The closing call-to-action section. Reusable — could appear on About and Home pages too.

```tsx
interface ImpactCTASectionProps {
  headline: string
  body: string
  primaryLabel: string
  primaryTo: string
  secondaryLabel?: string
  secondaryTo?: string
}
```

Visual: `bg-primary/10` background, centered text, two buttons (primary `<Button>` +
optional outline `<Button variant="outline">`). Matches current ImpactPage CTA section.

Uses: `Button`, `Link`, `FadeIn`

---

## Schema Reference & Data Notes

Pulled from actual CSV data. Use these for TypeScript interfaces and backend DTOs.

### `public_impact_snapshots`
```
snapshot_id, snapshot_date, headline, summary_text,
metric_payload_json (string — stored as Python dict syntax, NOT valid JSON),
is_published, published_at
```
The `metric_payload_json` field looks like:
```
{'month': '2025-07', 'avg_health_score': 3.33, 'avg_education_progress': 85.87,
 'total_residents': 60, 'donations_total_for_month': 10768.68}
```
**This is Python dict syntax with single quotes — it is not valid JSON.** The backend
must parse this field server-side (e.g., `JsonSerializer.Deserialize` after replacing
single quotes with double quotes) and return typed DTOs. The frontend should never
receive the raw `metric_payload_json` string.

**Future placeholder rows:** Rows from 2026-03 onwards have `avg_health_score: 0` and
`avg_education_progress: 0`. These are empty future-placeholder rows. The backend should
filter to only return rows where `avg_health_score > 0` (i.e., rows with real data).

**Health score scale:** `avg_health_score` is on a **1–5 scale**, not a percentage.
Display as `X.X / 5.0` with a label like "Average Wellbeing Score".

### `safehouses`
```
safehouse_id, safehouse_code, name, region, city, province, country,
open_date, status, capacity_girls, capacity_staff, current_occupancy, notes
```
9 active safehouses across Luzon, Visayas, and Mindanao.

### `donation_allocations`
```
allocation_id, donation_id, safehouse_id, program_area, amount_allocated, allocation_date
```
- `program_area` values observed: `Education`, `Wellbeing`, `Transport`, `Operations`
- Impact Attribution Pipeline operates on this data and writes to `donor_impact_statements`

### Pipeline output table (in Supabase — same DB as the rest)

**`donor_impact_statements`** (from `/score/impact` pipeline):
```
statement_id (uuid), supporter_id, safehouse_id, program_area,
allocation_amount, outcome_metric (e.g. health_3m, education_6m),
time_window_months (3 or 6), estimated_pct_change,
statement_text (ready-to-send human-readable sentence),
generated_at, model_version
```
Per USING_THE_PIPELINES.md: only statements where the underlying statistical effect is
significant (p < 0.05) are written. Currently only `Wellbeing` program area has a
significant effect. More areas will appear as data grows.

---

## Architecture Note — Supabase as the Database

Supabase is the PostgreSQL database for the entire project. The EF Core `SafeHarborDbContext`
connects to it via the Supabase connection string. The ML pipeline's `donor_impact_statements`
table is in the **same Supabase instance** — no secondary connection is needed.

To access `donor_impact_statements` from the backend:
1. Add a `DonorImpactStatement` model class to `Data/`
2. Register it as `DbSet<DonorImpactStatement>` in `SafeHarborDbContext`
3. Query it from `ImpactController` just like any other EF Core entity

---

## Backend Routes — `ImpactController.cs` (extensions)

Extends the existing `ImpactController.cs`. The existing `GET /api/Impact` endpoint
returns raw `PublicImpactSnapshot` entities including the unparseable `metric_payload_json`
string — this needs a new structured endpoint alongside it.

### New model class needed in `Data/`

```csharp
// Data/DonorImpactStatement.cs
public class DonorImpactStatement
{
    [Key] public Guid StatementId { get; set; }
    public int SupporterId { get; set; }
    public string SafehouseId { get; set; } = "";
    public string ProgramArea { get; set; } = "";
    public float AllocationAmount { get; set; }
    public string OutcomeMetric { get; set; } = "";
    public int TimeWindowMonths { get; set; }
    public float EstimatedPctChange { get; set; }
    public string StatementText { get; set; } = "";
    public DateTime? GeneratedAt { get; set; }
    public string? ModelVersion { get; set; }
}
```

Add to `SafeHarborDbContext`:
```csharp
public DbSet<DonorImpactStatement> DonorImpactStatements => Set<DonorImpactStatement>();
```

### Response DTOs

```csharp
// Parsed, typed snapshot — replaces raw metric_payload_json string
public record ImpactSnapshotDto(
    int SnapshotId,
    string Month,           // "2025-07"
    double AvgHealthScore,  // 1–5 scale
    double AvgEducationProgress, // 0–100 percentage
    int TotalResidents,
    double DonationsTotalForMonth
);

// Aggregate program-level effect — for the public ProgramImpactSection
public record ProgramImpactSummaryDto(
    string ProgramArea,
    string OutcomeMetric,
    double EstimatedPctChange,
    int TimeWindowMonths,
    string SampleStatementText  // one representative statement (no PII)
);

// Personal statement — for logged-in DonorPortal users
public record DonorImpactStatementDto(
    Guid StatementId,
    string ProgramArea,
    float AllocationAmount,
    string OutcomeMetric,
    int TimeWindowMonths,
    float EstimatedPctChange,
    string StatementText,
    DateTime? GeneratedAt
);
```

### New Controller Methods

```csharp
// All methods added to existing ImpactController.cs

// GET /api/Impact/snapshots
// Auth: AllowAnonymous (public data)
// Returns parsed snapshots — backend converts metric_payload_json Python dict syntax
// to typed DTOs. Filters out rows where avg_health_score == 0 (future placeholders).
[HttpGet("snapshots")]
[AllowAnonymous]
public async Task<ActionResult<IEnumerable<ImpactSnapshotDto>>> GetSnapshots(
    CancellationToken ct) { ... }

// GET /api/Impact/program-summary
// Auth: AllowAnonymous (aggregate only, no PII)
// Returns one record per program area with a statistically significant effect.
// Groups donor_impact_statements by program_area + outcome_metric,
// returns the average estimated_pct_change and one sample statement_text.
// Filters: only areas with > 0 statements (i.e., ML found significance).
[HttpGet("program-summary")]
[AllowAnonymous]
public async Task<ActionResult<IEnumerable<ProgramImpactSummaryDto>>> GetProgramSummary(
    CancellationToken ct) { ... }

// GET /api/Impact/statements
// Auth: DonorPortal, Admin
// Returns all impact statements for the requesting donor.
// Backend validates that the supporterId query param matches the JWT identity claim —
// a DonorPortal user cannot request another donor's statements.
[HttpGet("statements")]
[Authorize(Roles = "Admin,DonorPortal")]
public async Task<ActionResult<IEnumerable<DonorImpactStatementDto>>> GetStatements(
    [FromQuery] int supporterId, CancellationToken ct) { ... }
```

## API Layer — `ImpactAPI.ts` (extensions)

Two new functions added to the existing file:

```ts
// Already exists (returns raw entity with metric_payload_json string — keep for now):
export async function fetchImpact(token): Promise<PublicImpactSnapshot[]>

// New — parsed snapshots endpoint (structured DTOs, no Python dict strings):
export async function fetchImpactSnapshots(): Promise<ImpactSnapshotDto[]>
// GET /api/Impact/snapshots
// No auth required. Use this for trend charts on the Impact page.

// New — public aggregate program impact (no PII, no auth):
export async function fetchProgramImpactSummary(): Promise<ProgramImpactSummaryDto[]>
// GET /api/Impact/program-summary
// Returns only program areas with statistically significant effects.
// Empty array if pipeline hasn't found significance yet — handled gracefully.

// New — personalized, requires DonorPortal token:
export async function fetchDonorImpactStatements(
  token: string,
  supporterId: number
): Promise<DonorImpactStatementDto[]>
// GET /api/Impact/statements?supporterId={id}
// Requires valid JWT with DonorPortal or Admin role.
```

---

## `useFadeIn` Hook — `lib/useFadeIn.ts`

The scroll fade-in animation logic currently duplicated between `ImpactPage` and
`HomePage` should be extracted into a shared custom hook. Both pages (and future public
pages) import from here.

```ts
export function useFadeIn(): React.RefObject<HTMLDivElement>
```

```tsx
// Usage:
export function FadeIn({ children, className = '' }) {
  const ref = useFadeIn()
  return (
    <div ref={ref} className={`opacity-0 translate-y-6 transition-all duration-700 ease-out ${className}`}>
      {children}
    </div>
  )
}
```

Both `ImpactPage` and `HomePage` should import `FadeIn` from `components/FadeIn.tsx`
rather than defining it locally.

---

## Full Page Composition — `ImpactPage.tsx`

```
ImpactPage (public layout)
├── <Navbar />
├── <main>
│   │
│   ├── <ImpactHeroSection />                  ← live data from PublicImpactSnapshot
│   │   └── 4 headline stats (Girls Rescued, Safe Homes, Partners, Total Raised)
│   │
│   ├── <ProgramImpactSection />               ← Impact Attribution Pipeline output
│   │   └── grid of <ProgramAreaImpactCard />  ← only shows if significant effects exist
│   │
│   ├── <SafehouseLocationsGrid />             ← live data (safehouses list)
│   │
│   ├── <ResidentOutcomesPublic />             ← live data from PublicImpactSnapshot
│   │   ├── Rescue & Reintegration block
│   │   └── Education That Opens Doors block
│   │
│   ├── <DonorPersonalizedSection />           ← only renders if DonorPortal role
│   │   └── list of <PersonalizedStatementCard />
│   │
│   ├── <StoriesSection />                     ← static or CMS-driven anonymized stories
│   │   └── grid of <AnonymizedStoryCard />
│   │
│   ├── [full-width image break]               ← inline, not a component (one-off)
│   │
│   └── <ImpactCTASection />
│
└── <Footer />
```

### Data loading pattern

`ImpactPage` fetches on mount. Public data fetches require no token. Personalized data
fetches are gated on auth state.

```tsx
// Always fetched (public):
const [impactSnapshot, programSummary, safehouses] = await Promise.all([
  fetchImpact(null),
  fetchProgramImpactSummary(),
  fetchSafehouses(),          // existing SafehousesAPI — public read only
])

// Conditionally fetched (DonorPortal only):
if (isDonorPortal && token && supporterId) {
  const statements = await fetchDonorImpactStatements(token, supporterId)
}
```

### Privacy guarantees

- No resident names, internal codes, or case numbers on this page. Ever.
- No exact occupancy numbers in the public locations grid.
- `ProgramImpactSection` only appears when there is a statistically significant effect —
  prevents the page from communicating model uncertainty to donors.
- `DonorPersonalizedSection` only fetches and renders for authenticated DonorPortal users.
  The backend enforces that `supporterId` matches the token's identity claim.
- Resident stories use "Resident A / B / C" labels — extracted `AnonymizedStoryCard`
  makes it structurally enforced (no `name` prop — only `label`).

---

## Design Notes

- This is a **public** page — no Sidebar, no admin chrome. Uses `<Navbar />` + `<Footer />`.
- Scroll-based fade-in (`useFadeIn`) applies to all major sections for visual rhythm.
- `ProgramImpactSection` uses `bg-muted/40` to visually differentiate it as a new section
  type (data-driven, not just static stats).
- `PersonalizedStatementCard` uses a primary-color left border accent to make it feel
  personalized and special — distinct from the generic public content around it.
- The page should feel like a hybrid between the current warm, narrative-driven `ImpactPage`
  and a data transparency report. Sections alternate between story/image and data/metric
  layouts, maintaining the existing emotional tone.
- Follow dark-section override rules from ui-components.md for the hero and any future
  `bg-slate-950` sections.
- All `<img>` elements include meaningful `alt` text for accessibility.
