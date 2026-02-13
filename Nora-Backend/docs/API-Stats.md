# Stats API

Base path: `/stats`

Dashboard summary statistics. Read-only.

---

## GET /stats

Get dashboard stats: income, expenses, net profit, and percentage changes.

### Request
```
GET /stats
```

### Response (200 OK)
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

| Field | Type | Description |
|-------|------|-------------|
| totalIncome | number | Total income (currently 0; income feature removed) |
| totalExpenses | number | Total of unpaid expenses |
| netProfit | number | totalIncome - totalExpenses |
| incomeChange | string | e.g. `+0%`, `-5.2%` |
| expensesChange | string | Month-over-month expense change |
| profitChange | string | Month-over-month profit change |
