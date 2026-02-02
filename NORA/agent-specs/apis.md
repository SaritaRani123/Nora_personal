# Mock APIs Reference

This document lists all mock APIs used by the NORA frontend: endpoints, HTTP methods, request/response formats, and example calls. All base paths are relative to the app origin (e.g. `http://localhost:3000`).

---

## 1. Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | List expense categories |

### GET `/api/categories`

**Response**

```json
{
  "categories": [
    { "id": "food", "name": "Food & Dining", "code": "7012" },
    { "id": "office", "name": "Office Expenses", "code": "4053" }
  ]
}
```

**Example**

```bash
curl http://localhost:3000/api/categories
```

---

## 2. Charts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/charts` | Income/expense and category chart data |

### GET `/api/charts`

**Query parameters**

| Name | Type | Description |
|------|------|-------------|
| `range` | string | `"12"` (12 months) or `"24"` (24 months). Default: `"12"`. |

**Response**

```json
{
  "incomeExpenseData": [
    { "month": "Jan", "income": 11750, "expenses": 7245 }
  ],
  "categoryData": [
    { "name": "Food & Dining", "value": 1250 },
    { "name": "Office Expenses", "value": 890 }
  ]
}
```

**Example**

```bash
curl "http://localhost:3000/api/charts?range=12"
```

---

## 3. Contacts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/contacts` | List contacts |
| POST | `/api/contacts` | Create contact |
| PUT | `/api/contacts` | Update contact |
| DELETE | `/api/contacts` | Delete contact |

### GET `/api/contacts`

**Response**

```json
{
  "contacts": [
    {
      "id": "1",
      "name": "John Smith",
      "email": "john.smith@abccorp.com",
      "phone": "+1 (555) 123-4567",
      "address": "123 Business Ave, Toronto, ON M5V 2T6"
    }
  ]
}
```

### POST `/api/contacts`

**Request body**

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+1 (555) 999-0000",
  "address": "456 Main St"
}
```

**Response** (201): the created contact object (with generated `id`).

### PUT `/api/contacts`

**Request body**

```json
{
  "id": "1",
  "name": "John Smith Updated",
  "email": "john.updated@abccorp.com",
  "phone": "+1 (555) 123-4567",
  "address": "123 Business Ave"
}
```

**Response:** updated contact. **404** if not found.

### DELETE `/api/contacts`

**Query parameters**

| Name | Type | Description |
|------|------|-------------|
| `id` | string | Contact ID to delete. |

**Response**

```json
{ "success": true }
```

**Example**

```bash
curl -X DELETE "http://localhost:3000/api/contacts?id=1"
```

---

## 4. Expenses

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/expenses` | List expenses (optional filters) |
| POST | `/api/expenses` | Create expense |
| PUT | `/api/expenses` | Update expense |
| DELETE | `/api/expenses` | Delete expense |

### GET `/api/expenses`

**Query parameters**

| Name | Type | Description |
|------|------|-------------|
| `from` | string | Date from (YYYY-MM-DD). |
| `to` | string | Date to (YYYY-MM-DD). |
| `categoryId` | string | Filter by category id. |
| `status` | string | Filter by status. |

**Response**

```json
{
  "expenses": [
    {
      "id": "1",
      "date": "2026-01-24",
      "description": "McDonald's",
      "category": "food",
      "amount": 45.99,
      "paymentMethod": "Debit Card",
      "aiSuggested": true,
      "confidence": 95,
      "status": "paid",
      "source": "import"
    }
  ]
}
```

### POST `/api/expenses`

**Request body**

```json
{
  "date": "2026-01-25",
  "description": "Office supplies",
  "category": "office",
  "amount": 100,
  "paymentMethod": "Credit Card",
  "status": "pending",
  "source": "manual",
  "aiSuggested": false,
  "confidence": 100
}
```

**Response** (201): created expense object (with generated `id`, e.g. `exp-<timestamp>`).

### PUT `/api/expenses`

**Query parameters**

| Name | Type | Description |
|------|------|-------------|
| `id` | string | Expense ID to update. |

**Request body:** partial expense object (same fields as POST). **400** if `id` missing; **404** if not found.

### DELETE `/api/expenses`

**Query parameters**

| Name | Type | Description |
|------|------|-------------|
| `id` | string | Expense ID to delete. |

**Response**

```json
{ "success": true }
```

**Example**

```bash
curl -X GET "http://localhost:3000/api/expenses?categoryId=food&status=paid"
```

---

## 5. Income

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/income` | List income |
| POST | `/api/income` | Create income |

### GET `/api/income`

**Response**

```json
{
  "income": [
    {
      "id": "1",
      "date": "2025-01-15",
      "description": "Client Payment - ABC Corp",
      "amount": 5000,
      "source": "Invoice",
      "client": "ABC Corporation"
    }
  ]
}
```

### POST `/api/income`

**Request body**

```json
{
  "date": "2026-01-20",
  "description": "Consulting fee",
  "amount": 2000,
  "source": "Invoice",
  "client": "Acme Inc"
}
```

**Response** (201): created income object (with generated `id`).

---

## 6. Invoices

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/invoices` | List invoices and stats |
| POST | `/api/invoices` | Create invoice |
| PUT | `/api/invoices` | Update invoice |
| DELETE | `/api/invoices` | Delete invoice |

### GET `/api/invoices`

**Response**

```json
{
  "invoices": [
    {
      "id": "INV-001",
      "client": "ABC Corporation",
      "email": "billing@abccorp.com",
      "amount": 5000,
      "status": "paid",
      "issueDate": "2025-01-10",
      "dueDate": "2025-01-25",
      "paidDate": "2025-01-20",
      "template": "modern",
      "colorPalette": { "name": "default", "header": "#1e40af", "accent": "#3b82f6", "tableHeader": "#1e3a8a" }
    }
  ],
  "stats": {
    "total": 17250,
    "paid": 9200,
    "pending": 2500,
    "overdue": 3750
  }
}
```

**Status values:** `paid` | `pending` | `overdue` | `draft`.

### POST `/api/invoices`

**Request body**

```json
{
  "client": "New Client Ltd",
  "email": "billing@newclient.com",
  "amount": 3000,
  "status": "draft",
  "issueDate": "2026-01-01",
  "dueDate": "2026-01-31",
  "paidDate": null,
  "template": "modern",
  "colorPalette": { "name": "default", "header": "#1e40af", "accent": "#3b82f6", "tableHeader": "#1e3a8a" }
}
```

**Response** (201): created invoice (with generated `id` like `INV-00N`).

### PUT `/api/invoices`

**Request body**

```json
{
  "id": "INV-001",
  "client": "ABC Corporation",
  "email": "billing@abccorp.com",
  "amount": 5500,
  "status": "pending",
  "issueDate": "2025-01-10",
  "dueDate": "2025-01-25",
  "paidDate": null
}
```

**Response:** updated invoice. **404** if not found.

### DELETE `/api/invoices`

**Query parameters**

| Name | Type | Description |
|------|------|-------------|
| `id` | string | Invoice ID to delete. |

**Response**

```json
{ "success": true }
```

---

## 7. Payable Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/payable-summary` | Aging buckets for receivables and payables |

### GET `/api/payable-summary`

Implemented via `lib/api/payable-summary.ts` (calculates from mock invoice and expense data). No query parameters.

**Response**

```json
{
  "invoicesPayable": [
    { "label": "Coming Due", "key": "coming_due", "amount": 5000, "count": 2, "filterParam": "coming_due" },
    { "label": "1–30 Days Overdue", "key": "1_30", "amount": 2500, "count": 1, "filterParam": "1_30" }
  ],
  "billsOwing": [
    { "label": "Coming Due", "key": "coming_due", "amount": 1200, "count": 1, "filterParam": "coming_due" }
  ],
  "totalReceivable": 7500,
  "totalPayable": 1200
}
```

**Example**

```bash
curl http://localhost:3000/api/payable-summary
```

---

## 8. Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports` | Full reports payload (stats, charts, insights, heatmap) |

### GET `/api/reports`

**Response** (structure; values are mock)

```json
{
  "stats": {
    "totalIncome": 142500,
    "totalExpenses": 88450,
    "netSavings": 54050,
    "savingsRate": 37.9,
    "avgDailySpend": 2948,
    "highestCategory": "Marketing",
    "monthlyAverage": 7370,
    "incomeChange": 12.5,
    "expenseChange": -8.2,
    "savingsChange": 18.4
  },
  "categoryDistribution": [
    { "name": "Food", "value": 2850, "color": "#22c55e", "budget": 3000 }
  ],
  "spendingTrend": { "7D": [...], "30D": [...], "3M": [...], "1Y": [...] },
  "profitLossTrend": { "7D": [...], "30D": [...], "3M": [...], "1Y": [...] },
  "incomeVsExpenses": [...],
  "budgetComparison": [...],
  "insights": [{ "id": "1", "text": "...", "type": "warning" }],
  "suggestions": [...],
  "categoryDrilldown": { "Food": { "total": 2850, "avgTransaction": 47.5, "weeklyData": [...], "topMerchants": [...] } },
  "topTransactions": [...],
  "heatmapData": [{ "date": "2026-01-01", "day": 1, "dayOfWeek": 4, "amount": 320, "intensity": "medium" }]
}
```

**Example**

```bash
curl http://localhost:3000/api/reports
```

---

## 9. Statements

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/statements` | List statements and stats |
| POST | `/api/statements` | Add statement (mock) |
| PATCH | `/api/statements` | Update statement (bank, accountType) |
| DELETE | `/api/statements` | Delete statement |

### GET `/api/statements`

**Response**

```json
{
  "statements": [
    {
      "id": "1",
      "fileName": "scotiabank_jan_2025.pdf",
      "uploadDate": "2025-01-20",
      "transactions": 45,
      "bank": "Scotiabank",
      "accountType": "Chequing"
    }
  ],
  "stats": {
    "totalStatements": 6,
    "totalTransactions": 250,
    "totalChequingStatements": 3,
    "totalCreditCardStatements": 3
  }
}
```

### POST `/api/statements`

**Request body**

```json
{
  "fileName": "rbc_feb_2025.pdf",
  "transactions": 40,
  "bank": "RBC",
  "accountType": "Chequing"
}
```

**Response** (201): created statement object (with generated `id`). `uploadDate` is set server-side.

### PATCH `/api/statements`

**Query parameters**

| Name | Type | Description |
|------|------|-------------|
| `id` | string | Statement ID to update. |

**Request body**

```json
{
  "bank": "TD",
  "accountType": "Credit Card"
}
```

**Response:** updated statement. **404** if not found.

### DELETE `/api/statements`

**Query parameters**

| Name | Type | Description |
|------|------|-------------|
| `id` | string | Statement ID to delete. |

**Response**

```json
{ "success": true }
```

---

## 10. Statement Upload (mock S3)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/statements/upload` | Mock file upload (PDF only, max 10MB) |

### POST `/api/statements/upload`

**Request:** `multipart/form-data` with a single file field named `file` (PDF).

**Validation**

- File must be present; **400** if missing.
- Content type must be `application/pdf`; **400** if not.
- Max size 10MB; **400** if exceeded.

**Response** (success)

```json
{
  "success": true,
  "fileName": "scotiabank_jan.pdf",
  "fileSize": 102400,
  "bank": "Scotia Bank",
  "transactions": 42,
  "s3Key": "statements/1735849200000-scotiabank_jan.pdf",
  "message": "File uploaded successfully"
}
```

Bank is inferred from filename (e.g. `scotia`, `td`, `rbc`); otherwise default `"Scotia Bank"`. No file is persisted; this is a mock.

**Example**

```bash
curl -X POST -F "file=@statement.pdf" http://localhost:3000/api/statements/upload
```

---

## 11. Stats

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stats` | Dashboard stats (income, expenses, net profit, % changes) |

### GET `/api/stats`

Calculated from `lib/mock-data.ts` (income and expenses). No query parameters.

**Response**

```json
{
  "totalIncome": 15950,
  "totalExpenses": 2450.94,
  "netProfit": 13499.06,
  "incomeChange": "+24.5%",
  "expensesChange": "+2.1%",
  "profitChange": "+28.3%"
}
```

**Example**

```bash
curl http://localhost:3000/api/stats
```

---

## Summary Table

| Endpoint | GET | POST | PUT | PATCH | DELETE |
|----------|-----|------|-----|-------|--------|
| `/api/categories` | ✓ | — | — | — | — |
| `/api/charts` | ✓ | — | — | — | — |
| `/api/contacts` | ✓ | ✓ | ✓ | — | ✓ |
| `/api/expenses` | ✓ | ✓ | ✓ | — | ✓ |
| `/api/income` | ✓ | ✓ | — | — | — |
| `/api/invoices` | ✓ | ✓ | ✓ | — | ✓ |
| `/api/payable-summary` | ✓ | — | — | — | — |
| `/api/reports` | ✓ | — | — | — | — |
| `/api/statements` | ✓ | ✓ | — | ✓ | ✓ |
| `/api/statements/upload` | — | ✓ | — | — | — |
| `/api/stats` | ✓ | — | — | — | — |

All responses are JSON. Mock APIs use in-memory state; data resets when the Next.js server restarts.
