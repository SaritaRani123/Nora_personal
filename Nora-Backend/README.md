# Nora Backend API

**Backend only.** This folder contains the Node.js API server for **Nora**, the business expense and financial management application. The UI runs in a separate project: **NORA/** (frontend).

- **Nora-Backend/** (this folder): backend API — runs on **port 8080**
- **NORA/**: frontend — runs on **port 3000**

Do not mix frontend and backend code; keep them in these two separate folders.

---

## Tech stack

- **Runtime:** Node.js 18+ (ES modules)
- **Framework:** Express
- **CORS:** Enabled for frontend origin (e.g. `http://localhost:3000`)
- **Uploads:** Multer (e.g. statement uploads)
- **Data:** In-memory mock data (see **Data storage** below); ready to swap for a database or AWS

---

## Features

- RESTful API for all frontend features (expenses, invoices, contacts, statements, reports, etc.)
- All responses in **array format** (even single items) to match frontend expectations
- Modular structure: routes, controllers, and data layer
- Health check endpoint
- Ready for AWS or database integration (replace mock data in controllers)

---

## Prerequisites

- Node.js 18+ (ES modules support)
- npm or yarn

---

## Installation

```bash
npm install
```

---

## Running the server

### Development (with auto-reload)

```bash
npm run dev
```

### Production

```bash
npm start
```

Server runs on **port 8080** by default. Override with `PORT`:

```bash
PORT=3001 npm start
```

---

## Health check

```bash
curl http://localhost:8080/health
```

Example response:

```json
{
  "status": "ok",
  "message": "Nora Backend API is running"
}
```

---

## Folder structure

```
Nora-Backend/
├── server.js                 # Main entry point (Express, CORS, routes)
├── package.json
├── data/                     # Mock data
│   ├── mockData.js           # In-memory data for all entities
│   └── ...                   # Other data files as needed
├── controllers/
│   ├── expensesController.js
│   ├── categoriesController.js
│   ├── budgetController.js
│   ├── statementsController.js
│   ├── contactsController.js
│   ├── invoicesController.js
│   ├── payableSummaryController.js
│   ├── statsController.js
│   ├── chartsController.js
│   └── reportsController.js
├── routes/
│   ├── expenses.js
│   ├── categories.js
│   ├── budget.js
│   ├── statements.js
│   ├── contacts.js
│   ├── invoices.js
│   ├── payable-summary.js
│   ├── stats.js
│   ├── charts.js
│   └── reports.js
├── docs/                     # API documentation
│   ├── README.md
│   ├── API.md                # Overview & quick reference
│   ├── API-Invoices.md
│   ├── API-Expenses.md
│   ├── API-Contacts.md
│   ├── API-Categories.md
│   ├── API-Budget.md
│   ├── API-Statements.md
│   ├── API-PayableSummary.md
│   ├── API-Stats.md
│   ├── API-Charts.md
│   └── API-Reports.md
├── README.md                 # This file
└── API.md                    # Legacy API doc (if present)
```

---

## API endpoints (overview)

All endpoints return data in **array format**. See **docs/API.md** and the **docs/API-*.md** files for request/response details.

| Area | Methods | Notes |
|------|---------|--------|
| **Expenses** | GET, POST, PATCH, DELETE | List with filters |
| **Categories** | GET | List categories |
| **Budget** | GET | Budget overview |
| **Statements** | GET, POST | List; upload (multipart); GET transactions by statement |
| **Contacts** | GET, POST, PUT, DELETE | CRUD |
| **Invoices** | GET, POST, PATCH, DELETE | CRUD |
| **Payable summary** | GET | Overdue / owing for dashboard |
| **Stats** | GET | Dashboard stats (income, expenses, net, etc.) |
| **Charts** | GET | Chart data (e.g. `?range=12` or `24`) |
| **Reports** | GET | Full reports (stats, trends, insights, heatmap) |

Example paths: `GET /expenses`, `POST /expenses`, `GET /invoices`, `GET /payable-summary`, `GET /stats`, `GET /charts?range=12`, `GET /reports`.

---

## Running with the frontend

1. Start the backend (this folder): `npm start` or `npm run dev` → http://localhost:8080  
2. Start the frontend (NORA/): `npm run dev` → http://localhost:3000  
3. Use the app at http://localhost:3000; it will call the API on port 8080.

---

## CORS

The server allows requests from the frontend origin (e.g. `http://localhost:3000`). In **server.js**:

```javascript
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

Change `origin` if your frontend runs on a different URL.

---

## Data storage

Data is currently **in-memory** (mock data in **data/** and controllers). As a result:

- Data is lost on server restart
- No persistence

### Moving to a real backend

To use a database or AWS:

1. **Controllers:** Replace mock data access (e.g. `import { expenses } from '../data/mockData.js'`) with DB or AWS SDK calls.
2. **Environment:** Use a `.env` file and something like `dotenv` for credentials; do not commit `.env`.
3. **Examples:**
   - **DynamoDB:** Use `@aws-sdk/client-dynamodb` and `@aws-sdk/lib-dynamodb` (e.g. `ScanCommand`, `PutCommand`).
   - **PostgreSQL:** Use `pg` with a connection pool and `pool.query()`.

---

## Response format

Responses use a single key with an array value, for example:

```json
{ "expenses": [ ... ] }
```

```json
{ "payableSummary": [ ... ] }
```

Single resources are still returned as one-element arrays where the frontend expects an array.

---

## Error handling

- **404** for unknown routes  
- **500** for server errors  
- JSON error body, e.g. `{ "error": "Expense not found" }`

---

## Development tips

- Test with Postman, Insomnia, or `curl`.
- Add validation (e.g. `express-validator`) and rate limiting (e.g. `express-rate-limit`) for production.

---

## License

ISC
