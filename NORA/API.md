# Nora Frontend API Usage

This document lists every **backend** endpoint the frontend calls, with request and response examples. The backend runs in **Nora-Backend/** at `http://localhost:8080`.

## Base URL

- `NEXT_PUBLIC_API_BASE_URL` (defaults to `http://localhost:8080`)

## Response shape requirement (arrays)

The frontend **enforces array output** when consuming API data.

Supported response shapes:

- Raw array:

```json
[
  { "id": "1" }
]
```

- Envelope:

```json
{ "data": [ { "id": "1" } ] }
```

- Keyed:

```json
{ "expenses": [ { "id": "1" } ] }
```

- Single object (frontend will wrap to array):

```json
{ "id": "1" }
```

## Endpoints used by the frontend

### Expenses

- **GET** `/expenses?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&from=...&to=...&categoryId=...&status=...`

  The frontend sends **startDate** and **endDate** for the date-range filter. The backend must accept these query params, filter expenses by date (inclusive), and return only matching rows. If neither is sent, the backend may apply its own default range or return all; no date filtering is done on the frontend.

Response (array form):

```json
{
  "expenses": [
    {
      "id": "exp-1",
      "date": "2026-01-24",
      "description": "Office Supplies",
      "category": "office",
      "amount": 45.99,
      "paymentMethod": "Credit Card",
      "status": "paid",
      "source": "import"
    }
  ]
}
```

- **POST** `/expenses`

Request:

```json
{
  "date": "2026-02-01",
  "description": "Cloud Hosting",
  "category": "software",
  "amount": 189.5,
  "paymentMethod": "Credit Card",
  "status": "paid",
  "source": "manual"
}
```

Response (array form, even for single created item):

```json
{
  "expenses": [
    {
      "id": "exp-123",
      "date": "2026-02-01",
      "description": "Cloud Hosting",
      "category": "software",
      "amount": 189.5,
      "paymentMethod": "Credit Card",
      "status": "paid",
      "source": "manual"
    }
  ]
}
```

- **PATCH** `/expenses/:id`
- **DELETE** `/expenses/:id`

### Categories

- **GET** `/categories`

```json
{
  "categories": [
    { "id": "office", "name": "Office Expenses", "code": "4053" }
  ]
}
```

### Budget

- **GET** `/budget`

```json
{
  "budget": [
    {
      "year": "2025-2026",
      "totalBudget": 100000,
      "spent": 72450,
      "categories": [
        { "name": "Marketing", "budget": 25000, "spent": 18500 }
      ]
    }
  ]
}
```

### Statements

- **GET** `/statements`

Returns statements with optional `transactionsList` (array of transactions per statement). Response also includes `stats`.

```json
{
  "statements": [
    {
      "id": "st-1",
      "fileName": "scotiabank_jan_2025.pdf",
      "uploadDate": "2026-01-20",
      "status": "completed",
      "transactions": 45,
      "bank": "Scotiabank",
      "accountType": "Chequing",
      "transactionsList": [
        { "id": "st-1-tx-1", "date": "2026-01-15", "description": "Office Supplies", "amount": -89.5, "type": "debit" },
        { "id": "st-1-tx-2", "date": "2026-01-14", "description": "Deposit - Payroll", "amount": 3500.0, "type": "credit" }
      ]
    }
  ],
  "stats": [{ "totalStatements": 3, "totalTransactions": 135, "totalChequingStatements": 2, "totalCreditCardStatements": 1 }]
}
```

- **GET** `/statements/:id/transactions`

Returns the list of transactions for a statement.

```json
{
  "transactions": [
    { "id": "st-1-tx-1", "date": "2026-01-15", "description": "Office Supplies", "amount": -89.5, "type": "debit" },
    { "id": "st-1-tx-2", "date": "2026-01-14", "description": "Deposit - Payroll", "amount": 3500.0, "type": "credit" }
  ]
}
```

- **POST** `/statements/upload` (multipart form-data)
  - form field: `file` (PDF); optional: `bank`, `accountType`

Response (array form); new statement includes `transactionsList` (mock data):

```json
{
  "statements": [
    {
      "id": "st-1234567890",
      "fileName": "uploaded.pdf",
      "uploadDate": "2026-02-01",
      "status": "completed",
      "transactions": 8,
      "bank": "Scotiabank",
      "accountType": "Chequing",
      "transactionsList": [ ... ]
    }
  ],
  "stats": [ ... ]
}
```

### Contacts

- **GET** `/contacts`

```json
{
  "contacts": [
    {
      "id": "c-1",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "phone": "+1 555 111 2222",
      "address": "123 Main St"
    }
  ]
}
```

### Invoices

- **GET** `/invoices`
- **POST** `/invoices`
- **PATCH** `/invoices/:id`
- **DELETE** `/invoices/:id`

Response (array form):

```json
{
  "invoices": [
    {
      "id": "INV-001",
      "client": "ABC Corporation",
      "email": "billing@abccorp.com",
      "amount": 5000,
      "status": "paid",
      "issueDate": "2026-01-10",
      "dueDate": "2026-01-25",
      "paidDate": "2026-01-20"
    }
  ]
}
```

### Payable Summary (Dashboard)

- **GET** `/payable-summary`

Response: `{ "payableSummary": [ { "invoicesPayable", "billsOwing", "totalReceivable", "totalPayable" } ] }`  
Used for overdue invoice totals and expense (bills) totals; bucket links go to Invoices and Expenses pages.

### Stats (Dashboard)

- **GET** `/stats`

Response: `{ "stats": [ { "totalIncome", "totalExpenses", "netProfit", "incomeChange", "expensesChange", "profitChange" } ] }`  
Note: `totalIncome` is 0 (Income feature removed).

### Charts

- **GET** `/charts?range=12|24`

Response: `{ "charts": [ { "incomeExpenseData": [...], "categoryData": [...] } ] }`

### Reports

- **GET** `/reports?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`

  The frontend sends **startDate** and **endDate** for the date-range filter. The backend must accept these query params, filter all report data (stats, topTransactions, charts, etc.) by that date range, and return the filtered result. If neither is sent, the backend should apply its own default range. No date filtering is done on the frontend.

  Response: `{ "reports": [ { "stats", "categoryDistribution", "spendingTrend", "profitLossTrend", "incomeVsExpenses", "budgetComparison", "insights", "suggestions", "categoryDrilldown", "topTransactions", "heatmapData" } ] }`

### Contacts (CRUD)

- **GET** `/contacts` → `{ "contacts": [ { "id", "name", "email", "phone", "address" } ] }`
- **POST** `/contacts` — body: `{ "name", "email", "phone?", "address?" }` → `{ "contacts": [ newContact ] }`
- **PUT** `/contacts` — body: `{ "id", "name?", "email?", "phone?", "address?" }` → `{ "contacts": [ updated ] }`
- **DELETE** `/contacts?id=<id>` → `{ "contacts": [ removed ] }`
