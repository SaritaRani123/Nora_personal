# Expenses API

APIs used by the Expenses page (`app/(dashboard)/expenses/page.tsx`) and expense workflows: list, create, update, delete expenses; list categories; app config (payment methods, expense status options, defaults). All response shapes match the backend controllers’ `res.json(...)`.

**Base URL**: `http://localhost:8080`

---

# Expenses API

Base path: `/expenses`

CRUD for expenses. Expenses page uses list (with optional date/category/status filters), create, and update. Delete is available for other flows (e.g. Calendar).

---

## GET /expenses

List expenses, optionally filtered by date range, category, and status.

### Request
```
GET /expenses
GET /expenses?from=2026-02-01&to=2026-02-28
GET /expenses?from=2026-02-01&to=2026-02-28&categoryId=food&status=pending
```

| Query | Type | Description |
|-------|------|-------------|
| from | string | Start date (YYYY-MM-DD). Optional. |
| to | string | End date (YYYY-MM-DD). Optional. |
| categoryId | string | Filter by category ID. Optional. |
| status | string | Filter by status. Optional. |

### Response (200 OK)
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
    }
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| expenses | array | List of expense objects. |
| id | string | Expense ID (e.g. `exp-<timestamp>`). |
| date | string | Date (YYYY-MM-DD). |
| description | string | Description. |
| category | string | Category ID. |
| amount | number | Amount. |
| paymentMethod | string | Payment method name. |
| aiSuggested | boolean | Whether AI-suggested. |
| confidence | number | Confidence score. |
| status | string | e.g. `paid`, `pending`, `overdue`. |
| source | string | `manual`, `calendar`, or `import`. |

---

## POST /expenses

Create a new expense. Backend generates `id` (e.g. `exp-<Date.now()>`).

### Request
```
POST /expenses
Content-Type: application/json
```
Body: `date`, `description`, `category`, `amount`, `paymentMethod`; optional: `status`, `source`, `aiSuggested`, `confidence`. Defaults: category `office` if empty, status from app config, source `manual`, aiSuggested `false`, confidence `100`, paymentMethod from default if omitted.

### Response (201 Created)
```json
{
  "expenses": [
    {
      "id": "exp-1739123456789",
      "date": "2026-02-15",
      "description": "Office Supplies",
      "category": "office",
      "amount": 120.5,
      "paymentMethod": "Credit Card",
      "aiSuggested": false,
      "confidence": 100,
      "status": "pending",
      "source": "manual"
    }
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| expenses | array | Single-element array with the created expense. |
| id | string | Assigned expense ID. |

---

## PATCH /expenses/:id

Update an existing expense (full merge with request body).

### Request
```
PATCH /expenses/exp-1
Content-Type: application/json
```
Body: any of `date`, `description`, `category`, `amount`, `paymentMethod`, `status`.

### Response (200 OK)
```json
{
  "expenses": [
    {
      "id": "exp-1",
      "date": "2026-01-24",
      "description": "Updated description",
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

### Error (404)
```json
{ "error": "Expense not found" }
```

---

## DELETE /expenses/:id

Delete an expense.

### Request
```
DELETE /expenses/exp-1
```

### Response (204 No Content)
No body.

### Error (404)
```json
{ "error": "Expense not found" }
```

---

# Categories API

Base path: `/categories`

Expense categories for filters and forms. Expenses page uses this for the category filter and create/edit form.

---

## GET /categories

List all expense categories.

### Request
```
GET /categories
```

### Response (200 OK)
```json
{
  "categories": [
    { "id": "food", "name": "Food & Dining", "code": "7012" },
    { "id": "office", "name": "Office Expenses", "code": "4053" },
    { "id": "fuel", "name": "Fuel & Commute", "code": "3242" },
    { "id": "utilities", "name": "Utilities", "code": "4900" },
    { "id": "software", "name": "Software & Subscriptions", "code": "5045" },
    { "id": "marketing", "name": "Marketing & Advertising", "code": "7311" },
    { "id": "travel", "name": "Travel & Accommodation", "code": "4722" },
    { "id": "insurance", "name": "Insurance", "code": "6300" },
    { "id": "education", "name": "Education & Training", "code": "8299" }
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| categories | array | List of category objects. |
| id | string | Category ID (used in expense `category`). |
| name | string | Display name. |
| code | string | Category code. |

---

# Config API

Base path: `/config`

App config used by the Expenses page for status options (filter and form), default category, and missing-status label. Includes payment methods (used by expense form when provided via config).

---

## GET /config

Get payment methods, expense status options, and app defaults.

### Request
```
GET /config
```

### Response (200 OK)
```json
{
  "paymentMethods": [
    { "id": "credit", "name": "Credit Card" },
    { "id": "debit", "name": "Debit Card" },
    { "id": "cash", "name": "Cash" },
    { "id": "bank", "name": "Bank Transfer" },
    { "id": "cheque", "name": "Cheque" },
    { "id": "etransfer", "name": "E-Transfer" }
  ],
  "expenseStatusOptions": [
    { "value": "paid", "label": "Paid", "color": "bg-green-500/10 text-green-600 border-green-500/20" },
    { "value": "pending", "label": "Pending", "color": "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
    { "value": "overdue", "label": "Overdue", "color": "bg-red-500/10 text-red-600 border-red-500/20" },
    { "value": "review", "label": "Needs Review", "color": "bg-blue-500/10 text-blue-600 border-blue-500/20" }
  ],
  "defaultPaymentMethodId": "credit",
  "defaultExpenseStatus": "pending",
  "defaultCategoryId": "office",
  "missingStatusLabel": "N/A",
  "calendarMinYear": 2020,
  "calendarMaxYear": 2030
}
```

| Field | Type | Description |
|-------|------|-------------|
| paymentMethods | array | List of { id, name } for expense form. |
| expenseStatusOptions | array | Status options (value, label, color) for filter and form. |
| defaultPaymentMethodId | string | Default payment method id. |
| defaultExpenseStatus | string | Default expense status for new expenses. |
| defaultCategoryId | string | Default category id. |
| missingStatusLabel | string | Label when status is missing (e.g. N/A). |
| calendarMinYear | number | Min year for date picker. |
| calendarMaxYear | number | Max year for date picker. |

---

## Error responses (all endpoints)

| Status | Body |
|--------|------|
| 404 | `{ "error": "Expense not found" }` (or resource-specific message) |
| 500 | `{ "error": "Internal server error", "message": "..." }` |

---

## Backend implementation

| API | Routes | Controller |
|-----|--------|------------|
| Expenses | `routes/expenses.js` | `controllers/expensesController.js` |
| Categories | `routes/categories.js` | `controllers/categoriesController.js` |
| Config | `routes/config.js` | `controllers/configController.js` |
