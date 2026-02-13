# Payable Summary API

Base path: `/payable-summary`

Aging buckets for invoices receivable and bills owing. Read-only.

---

## GET /payable-summary

Get summary of invoices payable to you and bills you owe, organized by aging buckets.

### Request
```
GET /payable-summary
```

### Response (200 OK)
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

| Field | Type | Description |
|-------|------|-------------|
| invoicesPayable | array | Aging buckets for unpaid invoices (money owed to you) |
| billsOwing | array | Aging buckets for unpaid expenses/bills |
| totalReceivable | number | Sum of all unpaid invoice amounts |
| totalPayable | number | Sum of all unpaid bill amounts |

**Bucket fields:** `label`, `key`, `amount`, `count`, `filterParam`
