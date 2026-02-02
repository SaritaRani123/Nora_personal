# Requirements and Prerequisites

This document lists dependencies, libraries, environment setup, and other prerequisites for running the NORA frontend and mock APIs.

---

## 1. Runtime and Package Manager

| Requirement | Version / Notes |
|-------------|-----------------|
| **Node.js** | v18 or later recommended (LTS). |
| **Package manager** | **pnpm** (project has `pnpm-lock.yaml`). npm or yarn can be used but lockfile is pnpm. |

---

## 2. Installing Dependencies

From the project root:

```bash
pnpm install
```

This installs all entries in `package.json` (dependencies and devDependencies). No environment variables are required to install or run the app in development with mock APIs.

---

## 3. Dependencies (Production)

| Package | Purpose |
|--------|---------|
| **next** | Next.js framework (App Router, API routes). |
| **react**, **react-dom** | React 19. |
| **@radix-ui/*** | Accessible UI primitives (accordion, dialog, dropdown, select, tabs, etc.). |
| **class-variance-authority**, **clsx**, **tailwind-merge** | Styling and class composition. |
| **tailwindcss-animate** | Animations for Tailwind. |
| **lucide-react** | Icons. |
| **recharts** | Charts (bar, line, pie, area, etc.). |
| **date-fns** | Date formatting and manipulation. |
| **react-day-picker** | Date picker (e.g. calendar). |
| **react-hook-form**, **@hookform/resolvers**, **zod** | Forms and validation. |
| **swr** | Data fetching and cache (GET + revalidation). |
| **zustand** | Client state store (e.g. invoices, data-store). |
| **sonner** | Toast notifications. |
| **jspdf** | PDF generation (e.g. invoice download). |
| **html2canvas** | Optional; screenshot/canvas for UI. |
| **immer** | Immutable updates (used with store if applicable). |
| **cmdk** | Command palette / combobox. |
| **vaul** | Drawer component. |
| **embla-carousel-react** | Carousel. |
| **react-resizable-panels** | Resizable layout panels. |
| **input-otp** | OTP input (if used in auth). |
| **next-themes** | Theme (light/dark) provider. |
| **@vercel/analytics** | Optional analytics. |
| **use-sync-external-store** | React sync external store (dependency). |

---

## 4. Dev Dependencies

| Package | Purpose |
|--------|---------|
| **typescript** | TypeScript compiler. |
| **@types/node**, **@types/react**, **@types/react-dom** | TypeScript types. |
| **eslint** | Linting (script: `pnpm lint`). |
| **tailwindcss**, **@tailwindcss/postcss**, **postcss** | Tailwind CSS v4 and PostCSS. |
| **autoprefixer** | CSS vendor prefixes. |
| **tw-animate-css** | Tailwind animate utilities. |

---

## 5. Environment Setup

- **No required env vars** for running the app with mock APIs locally.
- Optional (for future backend/AWS integration, not used by current mock):
  - `AWS_REGION`, `AWS_API_KEY`, `AWS_API_URL`, `S3_BUCKET_NAME` — only if you replace mock logic in `lib/api/payable-summary.ts` or statement upload with real AWS calls.
- Next.js public env vars (if any) would use the `NEXT_PUBLIC_` prefix; none are required for the current implementation.

---

## 6. Scripts (package.json)

| Script | Command | Description |
|--------|---------|-------------|
| **dev** | `next dev` | Start dev server (frontend + mock APIs) at http://localhost:3000. |
| **build** | `next build` | Production build. |
| **start** | `next start` | Run production server (after `pnpm build`). |
| **lint** | `eslint .` | Run ESLint. |

---

## 7. Project Structure (Relevant to Requirements)

| Path | Purpose |
|------|---------|
| **app/** | Next.js App Router: pages, layouts, API routes. |
| **app/api/** | Mock API route handlers (see **apis.md**). |
| **components/** | React components (UI primitives in `components/ui/`). |
| **lib/** | Utilities, mock data (`mock-data.ts`), data store (`data-store.ts`), API helpers (`lib/api/payable-summary.ts`, `lib/services/expenses.ts`). |
| **hooks/** | Custom hooks (e.g. `use-toast`, `use-mobile`). |
| **types/** | TypeScript types (e.g. `expense.ts`). |
| **styles/** | Global CSS (e.g. `globals.css`). |
| **public/** | Static assets (icons, images). |
| **next.config.mjs** | Next.js config. |
| **tsconfig.json** | TypeScript config. |
| **postcss.config.mjs** | PostCSS config (Tailwind). |
| **components.json** | shadcn/ui component config. |

---

## 8. Prerequisites Summary

To run the frontend and mock APIs:

1. Install **Node.js** (v18+).
2. Install **pnpm** (or use npm/yarn).
3. Run **`pnpm install`** in the project root.
4. Run **`pnpm dev`** to start the app and APIs.

No database, external API keys, or env files are required for the current mock setup. Data is in-memory and resets when the dev server restarts.
