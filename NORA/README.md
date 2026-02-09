# Nora (Frontend)

**Frontend only.** This folder contains the React + Next.js UI for Nora. The API runs in a separate project: **Nora-Backend/**.

- **Nora/** (this folder): frontend — runs on port **3000**
- **Nora-Backend/**: backend API — runs on port **8080**

## Running locally

1. Install dependencies:

```bash
npm install
```

2. Create an environment file (optional but recommended):

Create `.env.local` in this folder:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

3. Start the frontend (runs on **port 3000** by default):

```bash
npm run dev
```

Open `http://localhost:3000`.

**Note:** Start the backend first (see Nora-Backend/README.md). If the backend is not running on port 8080, API calls will fail.

## Backend API

- The frontend fetches data from the backend at **`http://localhost:8080`** (configurable via `NEXT_PUBLIC_API_BASE_URL`).
- All data consumed by the UI is fetched via `Nora/lib/services/*`.
- All API responses are expected/handled in **array form** (even single items).

See `API.md` for the complete endpoint list and examples.

**Run the backend first** (from `Nora-Backend/`: `npm install` then `npm start`) so the frontend can load data from `http://localhost:8080`.

## Folder structure (high level)

- **`app/`**: Next.js routes (App Router)
  - **`(dashboard)/`**: dashboard pages (URLs reflect feature routes like `/expenses`, `/invoices`, etc.)
- **`components/`**: reusable UI and feature components
  - **`components/ui/`**: shared UI primitives
- **`lib/api/`**: API client helpers (`apiFetch`, array extraction)
- **`lib/services/`**: backend-facing service modules used by pages/components
- **`types/`**: shared TypeScript types

