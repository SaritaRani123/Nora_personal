# NORA — Business Tracker

## Project Overview and Purpose

NORA is an AI-powered business expense and finance tracking application. It provides a frontend UI for managing expenses, invoices, contacts, bank statements, income, and reports. The application uses **Next.js** with **mock APIs** (Next.js API routes backed by in-memory or mock data) so the frontend can be developed and tested without a real backend.

The project is structured as a single Next.js app: the frontend and mock API routes run together. There is no separate backend server; all API endpoints live under `/api/*` and are served by the same Next.js process.

---

## Main Features

| Feature | Description |
|--------|-------------|
| **Dashboard** | Overview with stats (income, expenses, net profit), payable/owing summary, income vs expense chart, and category distribution chart. |
| **Bank Statements** | Upload PDF statements (mock), list statements with bank/account type, filter by bank/account/date. |
| **Expenses** | List, filter (category, status, date range), add, edit expenses; category chart; export to CSV. |
| **Invoices** | List invoices, create/edit with templates and color palettes, view preview, download PDF, duplicate, delete. |
| **Contacts** | CRUD for contacts (name, email, phone, address). |
| **Calendar** | Calendar view of expenses, income, invoices, and events; create/edit/delete events; filter by type. |
| **Reports** | Analytics: stats, category distribution, spending trends, profit/loss, budget comparison, insights, heatmap. |
| **Settings** | App settings page (placeholder). |
| **Auth (mock)** | Sign-in / sign-up and onboarding flow (no real authentication; redirects to dashboard). |

---

## How to Run the Frontend and Mock APIs

The frontend and mock APIs run together as one Next.js application.

### Prerequisites

- **Node.js** (v18+ recommended)
- **pnpm** (or npm/yarn — the project uses `pnpm-lock.yaml`)

### Install Dependencies

```bash
pnpm install
```

### Development (frontend + mock APIs)

```bash
pnpm dev
```

- App: **http://localhost:3000**
- Root (`/`) redirects to **/dashboard**
- All mock APIs are under **http://localhost:3000/api/** (e.g. `/api/expenses`, `/api/invoices`).

### Production Build and Run

```bash
pnpm build
pnpm start
```

- Serves the built app and API routes on port **3000** (or `PORT` if set).

### Lint

```bash
pnpm lint
```

---

## Dependencies and Notes

- **Framework:** Next.js 16 (App Router).
- **UI:** React 19, Radix UI components, Tailwind CSS, shadcn/ui-style components in `components/ui/`.
- **Data fetching:** SWR for client-side API calls; some pages use Zustand (`lib/data-store.ts`) for client state (e.g. invoices list).
- **Mock data:** Seeded in `lib/mock-data.ts` and in-memory in API route handlers; data does not persist across server restarts.
- **Charts:** Recharts.
- **Forms:** React Hook Form, Zod, `@hookform/resolvers`.
- **PDF:** jsPDF for invoice PDF download; html2canvas available.
- **Package manager:** pnpm (see `pnpm-lock.yaml`).

For a full list of dependencies, environment setup, and prerequisites, see **agent-specs/requirements.md**.  
For API endpoints and request/response formats, see **agent-specs/apis.md**.  
For pages, components, and navigation, see **agent-specs/frontend.md**.
