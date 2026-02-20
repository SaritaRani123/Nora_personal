# Nora — Frontend

**Frontend only.** This folder contains the React + Next.js UI for **Nora**, an AI-powered business expense and financial management application for small businesses.

- **NORA/** (this folder): frontend — runs on **port 3000**
- **Nora-Backend/**: backend API — runs on **port 8080**

Keep frontend and backend in these two separate folders; the frontend calls the backend API over HTTP.

---

## Tech stack

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19, TypeScript, Tailwind CSS 4
- **Components:** Radix UI primitives, shadcn-style components, Lucide icons
- **Data:** SWR for fetching/caching, centralized API client in `lib/api`
- **State:** React context (e.g. `UserContext`), local state; no global auth (mock login/sign-up)
- **Other:** date-fns, Recharts, react-hook-form + Zod, next-themes (dark/light)

---

## Prerequisites

- Node.js 18+
- npm or yarn

---

## Installation & running locally

1. **Install dependencies**

```bash
npm install
```

2. **Environment (optional but recommended)**

Create `.env.local` in this folder:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

3. **Start the frontend** (default port **3000**)

```bash
npm run dev
```

Open **http://localhost:3000**.

Start the **backend** first (see **Nora-Backend/README.md**). If the backend is not running on port 8080, API calls will fail.

---

## Scripts

| Command        | Description              |
|----------------|--------------------------|
| `npm run dev`  | Start dev server (3000)  |
| `npm run build`| Production build        |
| `npm start`    | Run production server   |
| `npm run lint` | Run ESLint              |

---

## Folder structure

```
NORA/
├── app/                      # Next.js App Router
│   ├── (auth)/               # Auth routes (no protected session)
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── (dashboard)/          # Main app (dashboard layout + sidebar)
│   │   ├── dashboard/        # Home
│   │   ├── expenses/
│   │   ├── invoices/         # List + create
│   │   ├── contacts/
│   │   ├── calendar/
│   │   ├── statements/       # Bank statements
│   │   ├── reports/
│   │   └── settings/
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Entry redirect
├── components/               # Reusable UI
│   ├── ui/                   # Primitives (Button, Card, Input, etc.)
│   ├── app-sidebar.tsx
│   ├── dashboard-header.tsx
│   ├── date-range-filter.tsx
│   └── ...
├── lib/
│   ├── api/                  # HTTP client, array helpers
│   ├── config/               # API base URL etc.
│   ├── contexts/             # e.g. UserContext
│   ├── services/             # Backend-facing modules (expenses, invoices, contacts, etc.)
│   ├── expense-filters.ts
│   ├── calendar-utils.ts
│   └── invoices/             # PDF generation
├── hooks/                    # Shared React hooks
├── types/                    # Shared TypeScript types
├── public/                   # Static assets
├── docs/                     # Frontend docs (API usage, features)
├── package.json
├── tailwind.config.*
└── README.md                 # This file
```

---

## Main features (pages)

- **Dashboard** — Overview, totals, payable summary, category chart
- **Expenses** — List, filters (category, search, status, date range), export
- **Invoices** — List, create/edit, PDF, unbilled work → invoice
- **Contacts** — CRUD for contacts
- **Calendar** — Month/Week/Agenda views, time/work/travel/expense entries, stats
- **Bank statements** — Upload, list, transactions
- **Reports** — Stats, trends, insights
- **Settings** — Profile, avatar (persisted in context/localStorage), notifications, security placeholders

All data is loaded from the **Nora-Backend** API; the frontend expects responses in **array form** (see backend docs).

---

## Backend API

- The frontend uses **`NEXT_PUBLIC_API_BASE_URL`** (default `http://localhost:8080`) for all API requests.
- Services in **`lib/services/`** use the shared client in **`lib/api`**; no hardcoded URLs in pages.
- Backend API details: **Nora-Backend/docs/** (e.g. `API.md`, `API-Expenses.md`, `API-Invoices.md`).
- Frontend API usage: **docs/API-Usage.md**.

Run the backend from **Nora-Backend/**: `npm install` then `npm start` (or `npm run dev`).

---

## License

ISC
