# Charts API

Base path: `/charts`

Chart data for dashboard. Read-only.

---

## GET /charts

Get chart data (income vs expenses, category breakdown).

### Request
```
GET /charts
GET /charts?range=12
GET /charts?range=24
```

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| range | string | `12` | `12` = 12 months, `24` = 24 months |

### Response (200 OK)
```json
{
  "charts": [
    {
      "incomeExpenseData": [
        {
          "month": "Feb",
          "income": 8500,
          "expenses": 5800
        },
        {
          "month": "Mar",
          "income": 9200,
          "expenses": 6100
        }
      ],
      "categoryData": [
        {
          "name": "Food & Dining",
          "value": 1250
        },
        {
          "name": "Office Expenses",
          "value": 890
        },
        {
          "name": "Fuel & Commute",
          "value": 650
        },
        {
          "name": "Software",
          "value": 420
        },
        {
          "name": "Marketing",
          "value": 1800
        },
        {
          "name": "Other",
          "value": 2235
        }
      ]
    }
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| incomeExpenseData | array | `{ month, income, expenses }` per period |
| categoryData | array | `{ name, value }` per category |
