# Nora Backend API Documentation

Complete API reference for the Nora Backend server (Nora-Backend/). All endpoints return mock data in **array form**.

**Base URL**: `http://localhost:8080`

**Important**: All responses return data in **array format**, even for single items.

---

## Table of Contents

- [Expenses](#expenses)
- [Categories](#categories)
- [Budget](#budget)
- [Statements](#statements)
- [Contacts](#contacts)
- [Invoices](#invoices)
- [Payable Summary](#payable-summary)
- [Stats](#stats)
- [Charts](#charts)
- [Reports](#reports)

---

## Expenses

### GET /expenses

List all expenses with optional filters.

**Query Parameters**:
- `from` (optional): Start date (YYYY-MM-DD)
- `to` (optional): End date (YYYY-MM-DD)
- `categoryId` (optional): Filter by category ID
- `status` (optional): Filter by status (`paid`, `pending`, `overdue`)

**Example Request**:
```bash
GET /expenses?from=2026-01-01&to=2026-01-31&status=pending
```

**Response** (200 OK):
```json
{
  "expenses": [
    {
      "id": "exp-1",
      "date": "2026-01-24",
      "description": "McDonald's",
      "category": "food",
      "amount": 45.99,
      "paymentMethod": "Debit Card",
      "aiSuggested": true,
      "confidence": 95,
      "status": "paid",
      "source": "import"
    },
    {
      "id": "exp-2",
      "date": "2026-01-23",
      "description": "Staples - Office Supplies",
      "category": "office",
      "amount": 234.5,
      "paymentMethod": "Credit Card",
      "aiSuggested": true,
      "confidence": 92,
      "status": "pending",
      "source": "import"
    }
  ]
}
```

---

### POST /expenses

Create a new expense.

**Request Body**:
```json
{
  "date": "2026-02-01",
  "description": "Cloud Hosting",
  "category": "software",
  "amount": 189.5,
  "paymentMethod": "Credit Card",
  "status": "paid",
  "source": "manual",
  "aiSuggested": false,
  "confidence": 100
}
```

**Response** (201 Created):
```json
{
  "expenses": [
    {
      "id": "exp-1234567890",
      "date": "2026-02-01",
      "description": "Cloud Hosting",
      "category": "software",
      "amount": 189.5,
      "paymentMethod": "Credit Card",
      "status": "paid",
      "source": "manual",
      "aiSuggested": false,
      "confidence": 100
    }
  ]
}
```

---

### PATCH /expenses/:id

Update an existing expense.

**Request Body** (all fields optional):
```json
{
  "description": "Updated description",
  "amount": 200.0,
  "status": "paid"
}
```

**Response** (200 OK):
```json
{
  "expenses": [
    {
      "id": "exp-1",
      "date": "2026-01-24",
      "description": "Updated description",
      "category": "food",
      "amount": 200.0,
      "paymentMethod": "Debit Card",
      "status": "paid",
      "source": "import"
    }
  ]
}
```

---

### DELETE /expenses/:id

Delete an expense.

**Response** (204 No Content):
No response body.

---

## Categories

### GET /categories

List all expense categories.

**Response** (200 OK):
```json
{
  "categories": [
    {
      "id": "food",
      "name": "Food & Dining",
      "code": "7012"
    },
    {
      "id": "office",
      "name": "Office Expenses",
      "code": "4053"
    },
    {
      "id": "software",
      "name": "Software & Subscriptions",
      "code": "5045"
    }
  ]
}
```

---

## Budget

### GET /budget

Get budget overview data.

**Response** (200 OK):
```json
{
  "budget": [
    {
      "year": "2025-2026",
      "totalBudget": 100000,
      "spent": 72450,
      "categories": [
        {
          "name": "Marketing",
          "budget": 25000,
          "spent": 18500
        },
        {
          "name": "Operations",
          "budget": 30000,
          "spent": 24200
        },
        {
          "name": "Travel",
          "budget": 15000,
          "spent": 11800
        }
      ]
    }
  ]
}
```

---

## Statements

### GET /statements

List all uploaded bank statements. Each statement includes a `transactionsList` array so the frontend can show transactions after upload.

**Response** (200 OK):
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
  "stats": [
    {
      "totalStatements": 3,
      "totalTransactions": 135,
      "totalChequingStatements": 2,
      "totalCreditCardStatements": 1
    }
  ]
}
```

---

### GET /statements/:id/transactions

Get the list of transactions for a statement (for viewing after upload).

**Response** (200 OK):
```json
{
  "transactions": [
    { "id": "st-1-tx-1", "date": "2026-01-15", "description": "Office Supplies", "amount": -89.5, "type": "debit" },
    { "id": "st-1-tx-2", "date": "2026-01-14", "description": "Deposit - Payroll", "amount": 3500.0, "type": "credit" }
  ]
}
```

---

### POST /statements/upload

Process a bank statement PDF file. **Does not persist** the statement; returns mock statement and `transactionsList` for the client to show in the review dialog. The statement is only stored when the client calls **POST /statements** (save).

**Content-Type**: `multipart/form-data`

**Form Fields**: `file` (PDF file); optional: `bank`, `accountType`

**Example Request** (using curl):
```bash
curl -X POST http://localhost:8080/statements/upload \
  -F "file=@statement.pdf" -F "bank=Scotiabank" -F "accountType=Chequing"
```

**Response** (200 OK):
```json
{
  "statements": [
    {
      "id": "st-1234567890",
      "fileName": "statement.pdf",
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

---

### POST /statements

Persist a statement (called when the user clicks Save in the Bank Statements dialog).

**Request Body**:
```json
{
  "fileName": "statement.pdf",
  "bank": "Scotiabank",
  "accountType": "Chequing",
  "transactionsList": [
    { "id": "tx-1", "date": "2026-01-15", "description": "Office Supplies", "amount": -89.5, "type": "debit" }
  ]
}
```

**Response** (201 Created):
```json
{
  "statements": [ { "id": "st-...", "fileName": "...", "uploadDate": "...", "transactions": 8, "bank": "...", "accountType": "...", "transactionsList": [ ... ] } ],
  "stats": [ ... ]
}
```

---

## Contacts

### GET /contacts

List all contacts/clients.

**Response** (200 OK):
```json
{
  "contacts": [
    {
      "id": "c-1",
      "name": "John Smith",
      "email": "john.smith@abccorp.com",
      "phone": "+1 (555) 123-4567",
      "address": "123 Business Ave, Toronto, ON M5V 2T6"
    },
    {
      "id": "c-2",
      "name": "Sarah Johnson",
      "email": "sarah.j@xyzltd.com",
      "phone": "+1 (555) 234-5678",
      "address": "456 Commerce St, Vancouver, BC V6B 1A1"
    }
  ]
}
```

### POST /contacts

Create a contact. **Request body**: `{ "name", "email", "phone?", "address?" }`. **Response**: `{ "contacts": [ newContact ] }`.

### PUT /contacts

Update a contact. **Request body**: `{ "id", "name?", "email?", "phone?", "address?" }`. **Response**: `{ "contacts": [ updated ] }`.

### DELETE /contacts?id=&lt;id&gt;

Delete a contact. **Response**: `{ "contacts": [ removed ] }`.

---

## Invoices

### GET /invoices

List all invoices.

**Response** (200 OK):
```json
{
  "invoices": [
    {
      "id": "INV-001",
      "client": "ABC Corporation",
      "email": "billing@abccorp.com",
      "amount": 5000.0,
      "status": "paid",
      "issueDate": "2026-01-10",
      "dueDate": "2026-01-25",
      "paidDate": "2026-01-20",
      "source": "manual"
    },
    {
      "id": "INV-002",
      "client": "XYZ Ltd",
      "email": "accounts@xyzltd.com",
      "amount": 2500.0,
      "status": "pending",
      "issueDate": "2026-01-15",
      "dueDate": "2026-01-30",
      "paidDate": null,
      "source": "manual"
    }
  ]
}
```

---

### POST /invoices

Create a new invoice.

**Request Body**:
```json
{
  "client": "New Client Inc",
  "email": "billing@newclient.com",
  "amount": 3000.0,
  "status": "draft",
  "issueDate": "2026-02-01",
  "dueDate": "2026-02-15",
  "paidDate": null,
  "source": "manual",
  "template": "modern",
  "colorPalette": {
    "name": "Ocean Blue",
    "header": "#1e40af",
    "accent": "#3b82f6",
    "tableHeader": "#1e3a8a"
  }
}
```

**Response** (201 Created):
```json
{
  "invoices": [
    {
      "id": "INV-006",
      "client": "New Client Inc",
      "email": "billing@newclient.com",
      "amount": 3000.0,
      "status": "draft",
      "issueDate": "2026-02-01",
      "dueDate": "2026-02-15",
      "paidDate": null,
      "source": "manual",
      "template": "modern",
      "colorPalette": {
        "name": "Ocean Blue",
        "header": "#1e40af",
        "accent": "#3b82f6",
        "tableHeader": "#1e3a8a"
      }
    }
  ]
}
```

---

### PATCH /invoices/:id

Update an existing invoice.

**Request Body** (all fields optional):
```json
{
  "status": "paid",
  "paidDate": "2026-02-05"
}
```

**Response** (200 OK):
```json
{
  "invoices": [
    {
      "id": "INV-001",
      "client": "ABC Corporation",
      "email": "billing@abccorp.com",
      "amount": 5000.0,
      "status": "paid",
      "issueDate": "2026-01-10",
      "dueDate": "2026-01-25",
      "paidDate": "2026-02-05",
      "source": "manual"
    }
  ]
}
```

---

### DELETE /invoices/:id

Delete an invoice.

**Response** (204 No Content):
No response body.

---

## Payable Summary

### GET /payable-summary

Get summary of invoices payable to you and bills you owe, organized by aging buckets.

**Response** (200 OK):
```json
{
  "payableSummary": [
    {
      "invoicesPayable": [
        {
          "label": "Coming Due",
          "key": "coming_due",
          "amount": 2500,
          "count": 1,
          "filterParam": "coming_due"
        },
        {
          "label": "1–30 Days Overdue",
          "key": "1_30",
          "amount": 3750,
          "count": 1,
          "filterParam": "1_30"
        },
        {
          "label": "31–60 Days Overdue",
          "key": "31_60",
          "amount": 0,
          "count": 0,
          "filterParam": "31_60"
        },
        {
          "label": "61–90 Days Overdue",
          "key": "61_90",
          "amount": 0,
          "count": 0,
          "filterParam": "61_90"
        },
        {
          "label": ">90 Days Overdue",
          "key": "over_90",
          "amount": 0,
          "count": 0,
          "filterParam": "over_90"
        }
      ],
      "billsOwing": [
        {
          "label": "Coming Due",
          "key": "coming_due",
          "amount": 734.5,
          "count": 2,
          "filterParam": "coming_due"
        },
        {
          "label": "1–30 Days Overdue",
          "key": "1_30",
          "amount": 0,
          "count": 0,
          "filterParam": "1_30"
        },
        {
          "label": "31–60 Days Overdue",
          "key": "31_60",
          "amount": 189.45,
          "count": 1,
          "filterParam": "31_60"
        },
        {
          "label": "61–90 Days Overdue",
          "key": "61_90",
          "amount": 0,
          "count": 0,
          "filterParam": "61_90"
        },
        {
          "label": ">90 Days Overdue",
          "key": "over_90",
          "amount": 0,
          "count": 0,
          "filterParam": "over_90"
        }
      ],
      "totalReceivable": 6250,
      "totalPayable": 923.95
    }
  ]
}
```

---

## Stats

### GET /stats

Dashboard summary stats (array of one object). `totalIncome` is 0 (Income feature removed); overdue invoice and expense totals are provided by **GET /payable-summary**.

**Response** (200 OK):
```json
{
  "stats": [
    {
      "totalIncome": 0,
      "totalExpenses": 923.95,
      "netProfit": -923.95,
      "incomeChange": "+0%",
      "expensesChange": "-14.8%",
      "profitChange": "+12.1%"
    }
  ]
}
```

---

## Charts

### GET /charts?range=12|24

Chart data for dashboard (array of one object with `incomeExpenseData` and `categoryData` arrays).

**Response** (200 OK):
```json
{
  "charts": [
    {
      "incomeExpenseData": [ { "month": "Jan", "income": 11750, "expenses": 7245 } ],
      "categoryData": [ { "name": "Food & Dining", "value": 1250 } ]
    }
  ]
}
```

---

## Reports

### GET /reports

Full reports page data (array of one object: stats, categoryDistribution, spendingTrend, profitLossTrend, incomeVsExpenses, budgetComparison, insights, suggestions, categoryDrilldown, topTransactions, heatmapData).

**Response** (200 OK): `{ "reports": [ { ... } ] }`

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Invalid request: ids (array) and invoiceId are required"
}
```

### 404 Not Found
```json
{
  "error": "Expense not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "Detailed error message"
}
```

---

## Notes

1. **Array Format**: All responses wrap data in arrays, even for single items or summary objects.
2. **Date Format**: All dates use `YYYY-MM-DD` format.
3. **IDs**: Auto-generated IDs use timestamps or sequential numbering.
4. **Status Values**: 
   - Expenses: `paid`, `pending`, `overdue`
   - Invoices: `paid`, `pending`, `overdue`, `draft`
5. **CORS**: Server accepts requests from `http://localhost:3000` by default.
