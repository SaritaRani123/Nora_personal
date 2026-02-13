# Reports API

Base path: `/reports`

Full reports page data. Read-only.

---

## GET /reports

Get all reports data: stats, trends, insights, suggestions, etc.

### Request
```
GET /reports
```

### Response (200 OK)
```json
{
  "reports": [
    {
      "stats": { ... },
      "categoryDistribution": [ ... ],
      "spendingTrend": [ ... ],
      "profitLossTrend": [ ... ],
      "incomeVsExpenses": { ... },
      "budgetComparison": { ... },
      "insights": [ ... ],
      "suggestions": [ ... ],
      "categoryDrilldown": [ ... ],
      "topTransactions": [ ... ],
      "heatmapData": [ ... ]
    }
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| stats | object | Summary statistics |
| categoryDistribution | array | Spending by category |
| spendingTrend | array | Spending over time |
| profitLossTrend | array | Profit/loss over time |
| incomeVsExpenses | object | Income vs expenses comparison |
| budgetComparison | object | Budget vs actual |
| insights | array | Generated insights |
| suggestions | array | Recommendations |
| categoryDrilldown | array | Category breakdown |
| topTransactions | array | Top transactions |
| heatmapData | array | Heatmap visualization data |
