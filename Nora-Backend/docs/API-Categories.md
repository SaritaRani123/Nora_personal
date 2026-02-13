# Categories API

Base path: `/categories`

Categories define expense types. Read-only (no create/update/delete).

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
      "id": "fuel",
      "name": "Fuel & Commute",
      "code": "3242"
    },
    {
      "id": "utilities",
      "name": "Utilities",
      "code": "4900"
    },
    {
      "id": "software",
      "name": "Software & Subscriptions",
      "code": "5045"
    },
    {
      "id": "marketing",
      "name": "Marketing & Advertising",
      "code": "7311"
    },
    {
      "id": "travel",
      "name": "Travel & Accommodation",
      "code": "4722"
    },
    {
      "id": "insurance",
      "name": "Insurance",
      "code": "6300"
    },
    {
      "id": "education",
      "name": "Education & Training",
      "code": "8299"
    }
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| id | string | Category ID (used in expense `category` field) |
| name | string | Display name |
| code | string | Category code (e.g. for tax/MCC) |
