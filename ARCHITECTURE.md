# SafeHarbor — System Architecture

## Overview

SafeHarbor is a full-stack web application with a decoupled backend and frontend. The backend is a RESTful API built with ASP.NET Core on .NET 10, and the frontend is a React application built with Vite and TypeScript. The two communicate exclusively over HTTP using JSON. This mirrors the structure established in the Water Project, updated to .NET 10 and extended to support multiple data domains, role-based access, and security requirements appropriate for sensitive case management data involving minors.

---

## Project Structure

```
SafeHarbor/
├── backend/
│   └── SafeHarbor.API/
│       ├── Controllers/
│       ├── Data/
│       ├── Models/
│       ├── Properties/
│       ├── appsettings.json
│       ├── appsettings.Development.json
│       ├── Program.cs
│       └── SafeHarbor.API.csproj
└── frontend/
    ├── public/
    ├── src/
    │   ├── api/
    │   ├── components/
    │   ├── context/
    │   ├── pages/
    │   ├── types/
    │   ├── App.tsx
    │   ├── main.tsx
    │   └── index.css
    ├── index.html
    ├── vite.config.ts
    ├── tsconfig.json
    └── package.json
```

---

## Backend

### Technology

- Runtime: .NET 10
- Framework: ASP.NET Core Web API
- ORM: Entity Framework Core 10
- Database: PostgreSQL (via `Npgsql.EntityFrameworkCore.PostgreSQL`)
- API Documentation: Swashbuckle / Swagger UI
- Authentication: ASP.NET Core Identity with JWT bearer tokens

### `.csproj` (Key Packages)

```xml
<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.EntityFrameworkCore" Version="10.x.x" />
    <PackageReference Include="Npgsql.EntityFrameworkCore.PostgreSQL" Version="10.x.x" />
    <PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="10.x.x" />
    <PackageReference Include="Microsoft.AspNetCore.Identity.EntityFrameworkCore" Version="10.x.x" />
    <PackageReference Include="Swashbuckle.AspNetCore" Version="x.x.x" />
  </ItemGroup>
</Project>
```

### `Program.cs`

`Program.cs` is the application entry point and composition root. It follows the minimal hosting model introduced in .NET 6 and continued in .NET 10. Services are registered here before the app is built, and middleware is configured after.

```
Program.cs responsibilities:
- Register DbContext with PostgreSQL connection string
- Register ASP.NET Core Identity
- Register JWT authentication and authorization
- Register CORS policy allowing the frontend origin
- Register controllers
- Register Swagger
- Map controller routes
- Apply middleware pipeline in order
```

### `appsettings.json`

Stores non-secret configuration. The database connection string references an environment variable or secrets store in production — never a hardcoded password.

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "SafeHarborConnection": "Host=localhost;Database=safeharbor;Username=...;Password=..."
  },
  "Jwt": {
    "Key": "...",
    "Issuer": "SafeHarbor",
    "Audience": "SafeHarbor"
  }
}
```

### Data Layer — `Data/`

The `Data/` folder holds the EF Core `DbContext` and all entity model classes.

**`SafeHarborDbContext.cs`** inherits from `DbContext` and exposes a `DbSet<T>` for each entity. Each entity corresponds to one of the CSV data domains.

```
SafeHarborDbContext
├── DbSet<Resident>
├── DbSet<Safehouse>
├── DbSet<InterventionPlan>
├── DbSet<ProcessRecording>
├── DbSet<HomeVisitation>
├── DbSet<IncidentReport>
├── DbSet<EducationRecord>
├── DbSet<HealthWellbeingRecord>
├── DbSet<Donation>
├── DbSet<DonationAllocation>
├── DbSet<InKindDonationItem>
├── DbSet<Supporter>
├── DbSet<Partner>
├── DbSet<PartnerAssignment>
├── DbSet<SafehouseMonthlyMetric>
├── DbSet<PublicImpactSnapshot>
└── DbSet<SocialMediaPost>
```

Each model class in `Data/` uses C# data annotations (`[Key]`, `[Required]`, `[MaxLength]`) to define constraints, matching the column structure of the source CSVs.

### Controllers — `Controllers/`

Each controller handles one logical domain. Controllers inherit from `ControllerBase` and are decorated with `[ApiController]` and `[Route("api/[controller]")]`, following the same pattern as `WaterController`. The `DbContext` is injected via constructor injection.

```
Controllers/
├── ResidentsController.cs         — GET, POST, PUT, DELETE for residents
├── SafehousesController.cs        — GET, POST, PUT for safehouses and metrics
├── InterventionPlansController.cs — case plan CRUD
├── ProcessRecordingsController.cs — session documentation CRUD
├── HomeVisitationsController.cs   — visitation records CRUD
├── IncidentReportsController.cs   — incident CRUD
├── EducationController.cs         — education records CRUD
├── HealthController.cs            — health/wellbeing records CRUD
├── DonationsController.cs         — donation + allocation CRUD
├── SupportersController.cs        — supporter CRUD
├── PartnersController.cs          — partner + assignment CRUD
├── ImpactController.cs            — public impact snapshots
├── SocialMediaController.cs       — social media post records
└── AuthController.cs              — login, token issuance
```

Each controller exposes only the HTTP methods appropriate to its domain and the role of the requester. For example, resident data endpoints require an authenticated admin or social worker role — they are never public.

### CORS

CORS is configured in `Program.cs` to allow only the known frontend origin, following the same pattern used in the Water Project:

```csharp
builder.Services.AddCors(options => options.AddPolicy(
    "AllowFrontend",
    policy => policy
        .WithOrigins("http://localhost:3002", "https://<production-frontend-url>")
        .AllowAnyHeader()
        .AllowAnyMethod()
));
```

### Authentication and Authorization

Unlike the Water Project (which had no auth), SafeHarbor requires role-based access control due to the sensitivity of resident data. ASP.NET Core Identity manages users and roles. JWT tokens are issued on login via `AuthController` and validated on subsequent requests.

Roles:
- `Admin` — full access to all data and settings
- `SocialWorker` — access to assigned resident records, session logs, visitations, plans
- `DonorPortal` — read-only access to public impact data and own donation history (future portal)

Controllers protect endpoints with `[Authorize(Roles = "Admin,SocialWorker")]` attributes. Resident PII is never exposed to unauthenticated requests.

---

## Frontend

### Technology

- Build tool: Vite 8
- Framework: React 19 with TypeScript
- Routing: React Router DOM v7
- State: React Context API (for auth state and shared UI state)
- Linting: ESLint + eslint-plugin-react-hooks
- Formatting: Prettier

### `vite.config.ts`

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3002,
  },
})
```

### `src/` Structure

```
src/
├── api/                   — All fetch calls to the backend, one file per domain
│   ├── ResidentsAPI.ts
│   ├── DonationsAPI.ts
│   ├── SupportersAPI.ts
│   ├── SocialMediaAPI.ts
│   ├── ImpactAPI.ts
│   └── AuthAPI.ts
│
├── types/                 — TypeScript interfaces mirroring backend models
│   ├── Resident.ts
│   ├── Donation.ts
│   ├── Supporter.ts
│   ├── InterventionPlan.ts
│   ├── ProcessRecording.ts
│   ├── IncidentReport.ts
│   └── SocialMediaPost.ts
│
├── context/               — React Context for global state
│   ├── AuthContext.tsx     — current user, role, JWT token
│   └── NotificationContext.tsx
│
├── components/            — Reusable UI components
│   ├── Navbar.tsx
│   ├── Sidebar.tsx
│   ├── StatCard.tsx
│   ├── DataTable.tsx
│   ├── ActivityFeed.tsx
│   ├── ProgressBar.tsx
│   └── ProtectedRoute.tsx — wraps routes that require authentication
│
├── pages/                 — One file per route / view
│   ├── LoginPage.tsx
│   ├── OverviewPage.tsx
│   ├── ResidentsPage.tsx
│   ├── ResidentDetailPage.tsx
│   ├── SafehousesPage.tsx
│   ├── CaseActivityPage.tsx
│   ├── DonationsPage.tsx
│   ├── SupportersPage.tsx
│   ├── PartnersPage.tsx
│   ├── SocialMediaPage.tsx
│   └── ImpactPage.tsx
│
├── App.tsx                — Router and top-level layout
├── main.tsx               — React DOM entry point
└── index.css              — Global styles
```

### `App.tsx` and Routing

Routing follows the same pattern as the Water Project — `BrowserRouter` wraps all `Routes`. Protected pages are wrapped in `ProtectedRoute`, which checks `AuthContext` for a valid token and redirects to `/login` if not present.

```tsx
<AuthProvider>
  <Router>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<ProtectedRoute><OverviewPage /></ProtectedRoute>} />
      <Route path="/residents" element={<ProtectedRoute><ResidentsPage /></ProtectedRoute>} />
      <Route path="/residents/:id" element={<ProtectedRoute><ResidentDetailPage /></ProtectedRoute>} />
      <Route path="/safehouses" element={<ProtectedRoute><SafehousesPage /></ProtectedRoute>} />
      <Route path="/donations" element={<ProtectedRoute><DonationsPage /></ProtectedRoute>} />
      <Route path="/social-media" element={<ProtectedRoute><SocialMediaPage /></ProtectedRoute>} />
      <Route path="/impact" element={<ProtectedRoute><ImpactPage /></ProtectedRoute>} />
    </Routes>
  </Router>
</AuthProvider>
```

### `src/api/` — API Layer

All backend communication is centralized in the `api/` folder. No page or component makes direct `fetch` calls — they import from this layer. This mirrors the pattern from `ProjectsAPI.ts` in the Water Project.

Each API file defines an `API_BASE_URL` constant pointing to the backend, and exports async functions for each operation:

```ts
// Example: ResidentsAPI.ts
const API_BASE_URL = 'https://<backend-url>/api/Residents';

export const fetchResidents = async (...): Promise<ResidentResponse> => { ... }
export const addResident = async (resident: Resident): Promise<Resident> => { ... }
export const updateResident = async (id: number, resident: Resident): Promise<Resident> => { ... }
export const deleteResident = async (id: number): Promise<void> => { ... }
```

All API functions include a JWT authorization header pulled from `AuthContext`:

```ts
headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
}
```

### `src/types/` — TypeScript Interfaces

Each file exports one or more interfaces that mirror the backend entity models. This follows the same pattern as `Project.ts` in the Water Project.

```ts
// Example: Resident.ts
export interface Resident {
  residentId: number;
  caseControlNo: string;
  internalCode: string;
  safehouseId: number;
  caseStatus: string;
  sex: string;
  dateOfBirth: string;
  caseCategory: string;
  currentRiskLevel: string;
  reintegrationStatus: string;
  assignedSocialWorker: string;
}
```

---

## Data Flow

A typical user interaction follows this path:

```
User action in browser
  → React page/component calls function from src/api/
    → fetch() sends HTTP request with JWT to ASP.NET Core controller
      → Controller calls DbContext method
        → EF Core executes SQL against PostgreSQL
          → Result returns as JSON up the chain
            → TypeScript interface types the response
              → React renders updated UI
```

---

## Security Considerations

Given that this system stores records for minors who are abuse survivors, the following practices are mandatory at every layer:

**Backend**
- All resident-related endpoints require authentication and appropriate role
- No resident PII is ever returned to `DonorPortal` role users
- Passwords are hashed by ASP.NET Core Identity (PBKDF2)
- JWT tokens are short-lived and must be refreshed
- Connection strings and secrets are stored in environment variables, never in source code
- HTTPS is enforced in all non-development environments

**Frontend**
- JWT is stored in memory (via `AuthContext`), not `localStorage`, to prevent XSS exposure
- `ProtectedRoute` guards all non-public routes
- Resident names and identifying details are never included in URLs or query parameters
- Role checks are performed on the frontend for UX, but always enforced on the backend

**Database**
- PostgreSQL is not publicly accessible — only the backend application server connects to it
- Row-level access patterns are enforced at the controller layer by filtering on `assignedSocialWorker` for the `SocialWorker` role
- No bulk export endpoints exist without Admin authorization

---

## Development Setup

**Backend**
```bash
cd backend/SafeHarbor.API
dotnet restore
dotnet ef database update
dotnet run
# API available at https://localhost:7xxx
# Swagger UI at https://localhost:7xxx/swagger
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
# App available at http://localhost:3002
```
