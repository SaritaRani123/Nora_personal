# Budget API

Base path: `/budget`

Budget overview by year and category. Read-only.

---

## GET /budget

Get budget overview data.

### Request
```
GET /budget
```

### Response (200 OK)
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
        },
        {
          "name": "Software",
          "budget": 12000,
          "spent": 8950
        },
        {
          "name": "Office",
          "budget": 10000,
          "spent": 6200
        },
        {
          "name": "Miscellaneous",
          "budget": 8000,
          "spent": 2800
        }
      ]
    }
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| year | string | Budget period (e.g. `2025-2026`) |
| totalBudget | number | Total budget amount |
| spent | number | Total spent |
| categories | array | Per-category budget and spent |
