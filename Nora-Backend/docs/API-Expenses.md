# Expenses API

Base path: `/expenses`

All requests/responses use `Content-Type: application/json`.

---

## GET /expenses

List all expenses with optional filters.

### Request
```
GET /expenses
GET /expenses?from=2026-01-01&to=2026-01-31&categoryId=food&status=pending
```

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| from | string | Start date (YYYY-MM-DD) |
| to | string | End date (YYYY-MM-DD) |
| categoryId | string | Filter by category ID (e.g. `food`, `office`) |
| status | string | Filter by status: `paid`, `pending`, `overdue` |

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

---

## POST /expenses

Create a new expense. Backend auto-generates `id` (e.g. `exp-1739123456789`).

### Request
```
POST /expenses
Content-Type: application/json
```

**Body:**
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

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| date | string | no | today | YYYY-MM-DD |
| description | string | no | `""` | |
| category | string | no | `office` | Must match category ID |
| amount | number | no | `0` | |
| paymentMethod | string | no | `Credit Card` | |
| status | string | no | `pending` | `paid`, `pending`, `overdue` |
| source | string | no | `manual` | `manual`, `import` |
| aiSuggested | boolean | no | `false` | |
| confidence | number | no | `100` | 0–100 |

### Response (201 Created)
```json
{
  "expenses": [
    {
      "id": "exp-1739123456789",
      "date": "2026-02-01",
      "description": "Cloud Hosting",
      "category": "software",
      "amount": 189.5,
      "paymentMethod": "Credit Card",
      "aiSuggested": false,
      "confidence": 100,
      "status": "paid",
      "source": "manual"
    }
  ]
}
```

---

## PATCH /expenses/:id

Update an existing expense. All body fields are optional.

### Request
```
PATCH /expenses/exp-1
Content-Type: application/json
```

**Body (all optional):**
```json
{
  "description": "Updated description",
  "amount": 200.0,
  "status": "paid",
  "category": "office"
}
```

### Response (200 OK)
```json
{
  "expenses": [
    {
      "id": "exp-1",
      "date": "2026-01-24",
      "description": "Updated description",
      "category": "office",
      "amount": 200.0,
      "paymentMethod": "Debit Card",
      "status": "paid",
      "source": "import"
    }
  ]
}
```

### Error (404 Not Found)
```json
{
  "error": "Expense not found"
}
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

### Error (404 Not Found)
```json
{
  "error": "Expense not found"
}
```
