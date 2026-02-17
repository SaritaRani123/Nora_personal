# Nora

A full-stack personal finance and business management application. Nora helps you track expenses, manage invoices, organize contacts, and gain insights through dashboards and reports.

---

## Features

| Feature | Description |
|---------|-------------|
| **Dashboard** | Financial overview with stats, income vs expense charts, category breakdown, and payable/owing summary |
| **Invoices** | Create, edit, and manage invoices with customizable templates, PDF export, and payment tracking |
| **Expenses** | Track expenses with filtering by date, category, and status |
| **Contacts** | Manage contacts; use them as "Bill To" when creating invoices |
| **Budget** | Budget overview by category |
| **Bank Statements** | Upload PDF statements, review transactions, and save statements |
| **Reports** | Full reports with stats, trends, and insights |
| **Calendar** | Visual calendar for scheduling and planning |
| **Settings** | User profile and app preferences |

---

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | Next.js 16, React 19, Tailwind CSS, Radix UI, Recharts, Zustand |
| **Backend** | Node.js, Express, REST API |
| **PDF** | jsPDF, html2canvas |

---

## Project Structure

```
Nora_personal/
├── NORA/                 # Frontend (Next.js) — port 3000
│   ├── app/              # App Router pages
│   ├── components/       # UI and feature components
│   ├── lib/              # API client, services, config
│   └── docs/             # Frontend documentation
│
├── Nora-Backend/         # Backend API — port 8080
│   ├── server.js         # Entry point
│   ├── routes/           # API routes
│   ├── controllers/      # Request handlers
│   ├── data/             # Mock data
│   └── docs/             # API documentation
│
└── README.md             # This file
```

---

## Quick Start

### Prerequisites

- **Node.js** 18 or higher
- **npm** or **yarn**

### 1. Start the Backend

```bash
cd Nora-Backend
npm install
npm run dev
```

The API runs at **http://localhost:8080**.

### 2. Start the Frontend

```bash
cd NORA
npm install
npm run dev
```

The app runs at **http://localhost:3000**.

### 3. Configure Environment (Optional)

Create `NORA/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

If omitted, the frontend defaults to `http://localhost:8080` for API calls.

---

## Running in Production

**Backend:**
```bash
cd Nora-Backend
npm start
```

**Frontend:**
```bash
cd NORA
npm run build
npm start
```

---

## API Overview

The backend exposes REST endpoints for:

- **Expenses** — `GET`, `POST`, `PATCH`, `DELETE` `/expenses`
- **Invoices** — `GET`, `POST`, `PATCH`, `DELETE` `/invoices`
- **Contacts** — `GET`, `POST`, `PUT`, `DELETE` `/contacts`
- **Categories** — `GET` `/categories`
- **Budget** — `GET` `/budget`
- **Statements** — `GET`, `POST`, `POST /upload` `/statements`
- **Stats & Charts** — `GET` `/stats`, `GET` `/charts`, `GET` `/reports`
- **Payable Summary** — `GET` `/payable-summary`

All responses use **array format** (even for single items). See [Nora-Backend/docs/](Nora-Backend/docs/) for full API details.

---


