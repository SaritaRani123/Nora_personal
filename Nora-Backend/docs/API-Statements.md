# Statements API

Base path: `/statements`

Bank statements and transactions. Supports upload (PDF) and persist flow.

---

## GET /statements

List all bank statements. Each includes `transactionsList`.

### Request
```
GET /statements
```

### Response (200 OK)
```json
{
  "statements": [
    {
      "id": "st-1",
      "fileName": "scotiabank_jan_2025.pdf",
      "uploadDate": "2026-01-20",
      "status": "completed",
      "transactions": 45,
      "bank": "Scotiabank",
      "accountType": "Chequing",
      "transactionsList": [
        {
          "id": "st-1-tx-1",
          "date": "2026-01-15",
          "description": "Office Supplies",
          "amount": 89.5,
          "type": "debit"
        },
        {
          "id": "st-1-tx-2",
          "date": "2026-01-14",
          "description": "Deposit - Payroll",
          "amount": 3500.0,
          "type": "credit"
        }
      ]
    }
  ],
  "stats": [
    {
      "totalStatements": 3,
      "totalTransactions": 135,
      "totalChequingStatements": 2,
      "totalCreditCardStatements": 1
    }
  ]
}
```

---

## GET /statements/:id/transactions

Get transactions for a specific statement.

### Request
```
GET /statements/st-1/transactions
```

### Response (200 OK)
```json
{
  "transactions": [
    {
      "id": "st-1-tx-1",
      "date": "2026-01-15",
      "description": "Office Supplies",
      "amount": 89.5,
      "type": "debit"
    },
    {
      "id": "st-1-tx-2",
      "date": "2026-01-14",
      "description": "Deposit - Payroll",
      "amount": 3500.0,
      "type": "credit"
    }
  ]
}
```

### Error (404 Not Found)
```json
{
  "error": "Statement not found"
}
```

---

## POST /statements/upload

Upload a PDF statement. **Does NOT persist** — returns mock statement and transactions for client review. Persist with **POST /statements** when user clicks Save.

### Request
```
POST /statements/upload
Content-Type: multipart/form-data
```

**Form Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file | File | yes | PDF file (max 10MB) |
| bank | string | no | Bank name (default: `Scotiabank`) |
| accountType | string | no | e.g. `Chequing`, `Credit Card` (default: `Chequing`) |

**Example (curl):**
```bash
curl -X POST http://localhost:8080/statements/upload \
  -F "file=@statement.pdf" \
  -F "bank=Scotiabank" \
  -F "accountType=Chequing"
```

### Response (200 OK)
```json
{
  "statements": [
    {
      "id": "st-1739123456789",
      "fileName": "statement.pdf",
      "uploadDate": "2026-02-01",
      "status": "completed",
      "transactions": 8,
      "bank": "Scotiabank",
      "accountType": "Chequing",
      "transactionsList": [ ... ]
    }
  ],
  "stats": [ ... ]
}
```

### Error (400 Bad Request)
```json
{
  "error": "No file uploaded"
}
```

---

## POST /statements

Persist a statement (called when user clicks Save after upload/review).

### Request
```
POST /statements
Content-Type: application/json
```

**Body:**
```json
{
  "fileName": "statement.pdf",
  "bank": "Scotiabank",
  "accountType": "Chequing",
  "transactionsList": [
    {
      "id": "tx-1",
      "date": "2026-01-15",
      "description": "Office Supplies",
      "amount": 89.5,
      "type": "debit"
    }
  ]
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| fileName | string | no | default: `uploaded.pdf` |
| bank | string | no | default: `Scotiabank` |
| accountType | string | no | default: `Chequing` |
| transactionsList | array | no | If omitted, mock transactions are used |

### Response (201 Created)
```json
{
  "statements": [
    {
      "id": "st-1739123456790",
      "fileName": "statement.pdf",
      "uploadDate": "2026-02-01",
      "status": "completed",
      "transactions": 8,
      "bank": "Scotiabank",
      "accountType": "Chequing",
      "transactionsList": [ ... ]
    }
  ],
  "stats": [ ... ]
}
```
