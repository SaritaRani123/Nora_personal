# Invoices API

Base path: `/invoices`

All requests/responses use `Content-Type: application/json`.

---

## GET /invoices

List all invoices.

### Request
```
GET /invoices
```

### Response (200 OK)
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
      "source": "manual",
      "template": "modern",
      "colorPalette": {
        "name": "Ocean Blue",
        "header": "#1e40af",
        "accent": "#3b82f6",
        "tableHeader": "#1e3a8a"
      },
      "invoiceCurrency": "CAD",
      "lineItems": [
        {
          "itemType": "item",
          "item": "Consulting Services",
          "quantity": 1,
          "unit": "pcs",
          "hours": 0,
          "minutes": 0,
          "price": 5000,
          "taxId": null,
          "description": ""
        }
      ]
    }
  ]
}
```

---

## POST /invoices

Create a new invoice. Backend auto-generates `id` (e.g. `INV-006`).

### Request
```
POST /invoices
Content-Type: application/json
```

**Body:**
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
  },
  "invoiceCurrency": "CAD",
  "lineItems": [
    {
      "itemType": "item",
      "item": "Consulting",
      "quantity": 1,
      "unit": "pcs",
      "hours": 0,
      "minutes": 0,
      "price": 3000,
      "taxId": null,
      "description": ""
    }
  ]
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| client | string | yes | Client name |
| email | string | yes | Client email |
| amount | number | yes | Total amount |
| status | string | no | `draft` \| `paid` \| `pending` \| `overdue` (default: `draft`) |
| issueDate | string | no | YYYY-MM-DD (default: today) |
| dueDate | string | no | YYYY-MM-DD |
| paidDate | string \| null | no | YYYY-MM-DD when paid |
| source | string | no | `manual` \| `calendar` |
| template | string | no | `modern` \| `classic` \| `formal` |
| colorPalette | object | no | `{ name, header, accent, tableHeader }` (hex colors) |
| invoiceCurrency | string | no | e.g. `CAD`, `USD` (default: `CAD`) |
| lineItems | array | no | Array of `{ itemType, item, quantity, unit, hours, minutes, price, taxId, description }` |

### Response (201 Created)
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
      "colorPalette": { "name": "Ocean Blue", "header": "#1e40af", "accent": "#3b82f6", "tableHeader": "#1e3a8a" },
      "invoiceCurrency": "CAD",
      "lineItems": [ ... ]
    }
  ]
}
```

---

## PATCH /invoices/:id

Update an existing invoice. All body fields are optional; only provided fields are merged.

### Request
```
PATCH /invoices/INV-001
Content-Type: application/json
```

**Body (all optional):**
```json
{
  "status": "paid",
  "paidDate": "2026-02-05",
  "client": "Updated Client",
  "amount": 5500.0,
  "template": "classic",
  "colorPalette": { ... },
  "invoiceCurrency": "USD",
  "lineItems": [ ... ]
}
```

### Response (200 OK)
```json
{
  "invoices": [
    {
      "id": "INV-001",
      "client": "Updated Client",
      "email": "billing@abccorp.com",
      "amount": 5500.0,
      "status": "paid",
      "issueDate": "2026-01-10",
      "dueDate": "2026-01-25",
      "paidDate": "2026-02-05",
      "source": "manual",
      "template": "classic",
      "colorPalette": { ... },
      "invoiceCurrency": "USD",
      "lineItems": [ ... ]
    }
  ]
}
```

### Error Response (404 Not Found)
```json
{
  "error": "Invoice not found"
}
```

---

## DELETE /invoices/:id

Delete an invoice.

### Request
```
DELETE /invoices/INV-001
```

### Response (204 No Content)
No body.

### Error Response (404 Not Found)
```json
{
  "error": "Invoice not found"
}
```

---

## Line Item Schema

| Field | Type | Notes |
|-------|------|-------|
| itemType | `"item"` \| `"hourly"` | Item = quantity×price; Hourly = (hours+minutes/60)×price |
| item | string | Description |
| quantity | number | For item type |
| unit | string | e.g. `pcs`, `hrs`, `kg` |
| hours | number | For hourly type |
| minutes | number | For hourly type |
| price | number | Unit price or hourly rate |
| taxId | string \| null | Tax rate ID if applicable |
| description | string | Optional notes |
