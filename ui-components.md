# SafeHarbor UI Component Guide

This document defines the component library, color system, and usage rules for the SafeHarbor web application. All pages — public and admin — must follow these conventions. This applies to both human developers and AI-assisted code generation.

---

## Stack

- **Framework**: React + TypeScript (Vite)
- **Component library**: [shadcn/ui](https://ui.shadcn.com)
- **Base theme**: `violet` with `slate` neutral
- **Init command**: `npx shadcn@latest init` → select `violet` theme, `slate` neutral, CSS variables enabled

---

## Color System

All colors come from shadcn CSS variables. Never hardcode hex values.

| Token | Usage |
|---|---|
| `bg-background` | Page background |
| `bg-card` | Card surfaces |
| `bg-muted` | Subtle section backgrounds, table headers |
| `text-foreground` | Primary body text |
| `text-muted-foreground` | Labels, secondary text, placeholders |
| `text-primary-foreground` | Text on violet buttons/badges |
| `border` | All borders — cards, inputs, dividers |
| `primary` / `primary-foreground` | Violet — CTAs, active states, key badges |
| `destructive` | Red — delete actions, error states only |
| `ring` | Focus rings on inputs and buttons |

**Semantic status colors** (use for resident/case status badges):

| Status | Color |
|---|---|
| Active / Completed / Favorable | `bg-emerald-100 text-emerald-800` |
| In Progress / Pending | `bg-violet-100 text-violet-800` |
| At Risk / Needs Improvement | `bg-amber-100 text-amber-800` |
| Critical / Unfavorable / Closed | `bg-red-100 text-red-800` |
| Inactive / On Hold | `bg-slate-100 text-slate-600` |

---

## Typography

Font: **Inter** (shadcn default, loaded via CSS)

| Element | Class |
|---|---|
| Page title (h1) | `text-2xl font-semibold tracking-tight` |
| Section heading (h2) | `text-xl font-semibold` |
| Card title (h3) | `text-base font-medium` |
| Body text | `text-sm text-foreground` |
| Muted / label | `text-sm text-muted-foreground` |
| Stat number (dashboard) | `text-3xl font-bold` |

---

## Navigation

- Dark slate nav bar (`bg-slate-950`) on all pages
- Logo: SafeHarbor wordmark + icon, left-aligned
- Public nav links: Home, About, Our Impact, Contact
- Admin nav links: Dashboard, Caseload, Process Recording, Home Visitation, Donors, Reports
- Active link: `text-primary` (violet underline)
- CTA button in nav: `<Button variant="default">` (violet)
- Footer: `bg-slate-950`, links to Privacy Policy, Contact, About

---

## Components

### Button

```tsx
import { Button } from "@/components/ui/button"
```

| Use case | Variant | Example |
|---|---|---|
| Primary CTA (Donate, Save, Submit) | `default` | `<Button>Save</Button>` |
| Secondary / cancel | `outline` | `<Button variant="outline">Cancel</Button>` |
| Delete / remove | `destructive` | `<Button variant="destructive">Delete</Button>` |
| Low-emphasis action | `ghost` | `<Button variant="ghost">View</Button>` |
| Icon-only action | `ghost` + `size="icon"` | `<Button variant="ghost" size="icon">` |

**Rules:**
- All delete actions use `variant="destructive"` — no exceptions
- All delete actions must trigger a `<AlertDialog>` confirmation before executing
- Never use raw HTML `<button>` elements
- Primary actions are right-aligned in forms and dialogs

---

### Card

```tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
```

Use for: resident profile panels, donor records, stat summary blocks, dashboard sections.

```tsx
<Card>
  <CardHeader>
    <CardTitle>Resident Overview</CardTitle>
    <CardDescription>Active case summary</CardDescription>
  </CardHeader>
  <CardContent>
    {/* content */}
  </CardContent>
</Card>
```

**Rules:**
- All content sections on admin pages live inside Cards
- Dashboard stat cards: omit `CardHeader`, use `text-3xl font-bold` for number, `text-sm text-muted-foreground` for label
- Never nest Cards inside Cards

---

### Badge

```tsx
import { Badge } from "@/components/ui/badge"
```

| Use case | Variant / Class |
|---|---|
| Case status (Active, Closed) | Semantic color classes (see Color System table) |
| Donor type | `variant="outline"` |
| Risk level (Low/Medium/High/Critical) | Semantic color classes |
| Reintegration status | Semantic color classes |

```tsx
<Badge className="bg-emerald-100 text-emerald-800">Active</Badge>
<Badge className="bg-red-100 text-red-800">Critical</Badge>
```

**Rules:**
- Always use semantic status colors from the Color System table — never `variant="default"` for status badges
- Keep badge text to 1-3 words

---

### Table

```tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
```

Use for: Caseload Inventory, Donors & Contributions, donation history, process recording lists.

**Rules:**
- All data tables must include pagination (`<Pagination>` component)
- Table headers use `text-muted-foreground text-xs uppercase tracking-wide`
- Sortable columns get a sort icon (use `lucide-react` `ArrowUpDown`)
- Every table row that opens a detail view uses `cursor-pointer hover:bg-muted`
- No raw HTML `<table>` elements

---

### Form Inputs

```tsx
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
```

**Rules:**
- Every input must have a `<Label>` — never unlabeled inputs
- Required fields get `*` appended to label text
- Validation errors display below the field using `text-sm text-destructive`
- Use `<Select>` for any field with a fixed enum (case_status, risk_level, referral_source, etc.)
- Use `<Textarea>` for narrative fields (session_narrative, observations, notes)
- Never use raw HTML `<input>`, `<select>`, or `<textarea>`

---

### Dialog / AlertDialog

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
```

- `<Dialog>`: create/edit forms (new resident, new donation, process recording entry)
- `<AlertDialog>`: all delete confirmations — required by IS 414

```tsx
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Delete</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
      <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

### Tabs

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
```

Use for: resident detail view (Case Info / Process Recordings / Home Visitations / Education / Health), Reports & Analytics page sections.

---

### Sheet

```tsx
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
```

Use for: slide-out detail panels on Caseload Inventory and Donors pages. Opens from the right (`side="right"`).

---

### Pagination

```tsx
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
```

Required on all tables. Default page size: 10 rows.

---

## Page-Specific Rules

### Public pages (unauthenticated)
- No admin components or data
- Impact stats pull from `public_impact_snapshots` table only — never raw resident data
- Resident stories are always anonymized (Resident A, Resident B — no real names or identifying details)

### Admin pages (authenticated)
- All pages wrapped in authenticated layout with sidebar nav
- Sidebar uses `bg-slate-950` with violet active state indicators
- All CUD operations (create/update/delete) require admin role — enforce on both frontend and API

### Sensitive data display
- `notes_restricted` and `medical_notes_restricted` fields: only render if user has admin role
- Never display `internal_code` or `case_control_no` on public-facing pages
- Resident names never appear on public pages

---

## Spacing Scale

Use Tailwind spacing consistently across all pages. Never use arbitrary values like `p-[13px]`.

| Context | Class |
|---|---|
| Between page sections | `mb-8` |
| Between cards in a grid | `gap-4` |
| Inside card content | `p-6` |
| Inside table cells | `px-4 py-3` |
| Between form fields | `space-y-4` |
| Between label and input | `space-y-2` |
| Page horizontal padding | `px-6` (admin), `px-8` (public) |
| Page top padding | `pt-6` |

---

## Page Layout Template

### Public pages
```tsx
<div className="min-h-screen flex flex-col">
  <Navbar />
  <main className="flex-1">
    {/* sections go here */}
  </main>
  <Footer />
</div>
```

### Admin pages
```tsx
<div className="flex min-h-screen bg-background">
  <Sidebar className="w-64 bg-slate-950 shrink-0" />
  <main className="flex-1 flex flex-col">
    <div className="flex-1 px-6 pt-6 max-w-7xl">
      <h1 className="text-2xl font-semibold tracking-tight mb-6">Page Title</h1>
      {/* page content */}
    </div>
  </main>
</div>
```

**Rules:**
- Admin sidebar is always `w-64` and `bg-slate-950`
- Main content max width is `max-w-7xl`
- Every admin page starts with an `h1` page title using the typography scale
- Never full-bleed content to the edge — always `px-6` minimum

---

## Loading States

Use shadcn `<Skeleton>` for all loading states. Never use spinners, custom CSS loaders, or blank screens.

```tsx
import { Skeleton } from "@/components/ui/skeleton"
```

**Patterns by context:**

Stat card loading:
```tsx
<Card>
  <CardContent className="p-6">
    <Skeleton className="h-8 w-24 mb-2" />
    <Skeleton className="h-4 w-32" />
  </CardContent>
</Card>
```

Table loading (repeat 5 rows):
```tsx
<TableRow>
  <TableCell><Skeleton className="h-4 w-full" /></TableCell>
  <TableCell><Skeleton className="h-4 w-full" /></TableCell>
</TableRow>
```

**Rules:**
- Always show skeletons that match the shape of the content they replace
- Never show a blank page while data loads
- Never use `loading...` text as a substitute for a skeleton

---

## Empty States

When a table or list has no data, show a centered empty state — never just an empty table.

```tsx
<div className="flex flex-col items-center justify-center py-16 text-center">
  <Icon className="h-10 w-10 text-muted-foreground mb-4" />
  <p className="text-sm font-medium text-foreground mb-1">No [items] found</p>
  <p className="text-sm text-muted-foreground mb-4">Get started by adding a new [item].</p>
  {/* optional CTA */}
  <Button variant="outline">Add [Item]</Button>
</div>
```

**Rules:**
- Every table must handle the empty state
- Use a relevant lucide-react icon (e.g. `Users` for residents, `Heart` for donors)
- Include a CTA button only if the user has permission to create that item (admin only)

---

## Toast Notifications

Use shadcn Sonner for all success/error feedback. Never use browser `alert()` or `confirm()`.

```tsx
import { toast } from "sonner"
```

| Event | Call |
|---|---|
| Successful save/create | `toast.success("Resident record saved.")` |
| Successful delete | `toast.success("Record deleted.")` |
| API or validation error | `toast.error("Something went wrong. Please try again.")` |
| Unauthorized action | `toast.error("You don't have permission to do that.")` |

**Rules:**
- Always show a toast after any CUD operation
- Keep toast messages short — one sentence max
- Never use toast for informational content that belongs in the UI
- Position: bottom-right (`position="bottom-right"` on `<Toaster />`)

---

## Icons

Use `lucide-react` exclusively. It is bundled with shadcn — no additional install needed.

```tsx
import { Users, Heart, AlertTriangle, Home, FileText, BarChart2, LogOut } from "lucide-react"
```

**Consistent icon usage across pages:**

| Context | Icon |
|---|---|
| Residents / caseload | `Users` |
| Donors | `Heart` |
| Process recordings | `FileText` |
| Home visitations | `Home` |
| Reports & analytics | `BarChart2` |
| Incident / at-risk flag | `AlertTriangle` |
| Logout | `LogOut` |
| Add / create | `Plus` |
| Edit | `Pencil` |
| Delete | `Trash2` |
| Search | `Search` |
| Filter | `SlidersHorizontal` |

**Rules:**
- All icons are `h-4 w-4` inline with text, `h-5 w-5` standalone in buttons
- Never use emoji as icons
- Never mix lucide-react with other icon libraries

---

## Do / Don't

| Do | Don't |
|---|---|
| Use shadcn components for everything | Use raw HTML form elements |
| Use CSS variable tokens for color | Hardcode hex values |
| Use semantic status colors from the table | Use `variant="default"` for status badges |
| Wrap all delete actions in `<AlertDialog>` | Delete on single click |
| Use `<Select>` for enum fields | Use free-text input for fixed-value fields |
| Pull public stats from `public_impact_snapshots` | Expose resident-level data publicly |
| Keep resident stories anonymized on public pages | Use real names or identifying details publicly |
| Use `<Skeleton>` for all loading states | Use spinners, blank screens, or "loading..." text |
| Show empty state component when tables have no data | Leave tables empty or show nothing |
| Use `toast.success` / `toast.error` after CUD operations | Use `alert()` or silent failures |
| Use lucide-react for all icons | Mix icon libraries or use emoji |
| Use Tailwind spacing scale consistently | Use arbitrary values like `p-[13px]` |
| Wrap admin pages in the standard sidebar layout | Create custom layouts per page |
