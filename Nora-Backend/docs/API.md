# Nora Backend API Reference

Complete API reference. All endpoints return data in **array format**.

**Base URL**: `http://localhost:8080`

**Health Check**: `GET /health` → `{ "status": "ok", "message": "Nora Backend API is running" }`

---

## Table of Contents

| Resource | Document | Endpoints |
|----------|----------|-----------|
| **Invoices** | [API-Invoices.md](./API-Invoices.md) | GET, POST, PATCH, DELETE |
| **Expenses** | [API-Expenses.md](./API-Expenses.md) | GET, POST, PATCH, DELETE |
| **Contacts** | [API-Contacts.md](./API-Contacts.md) | GET, POST, PUT, DELETE |
| **Categories** | [API-Categories.md](./API-Categories.md) | GET |
| **Budget** | [API-Budget.md](./API-Budget.md) | GET |
| **Statements** | [API-Statements.md](./API-Statements.md) | GET, GET /:id/transactions, POST /upload, POST |
| **Payable Summary** | [API-PayableSummary.md](./API-PayableSummary.md) | GET |
| **Stats** | [API-Stats.md](./API-Stats.md) | GET |
| **Charts** | [API-Charts.md](./API-Charts.md) | GET |
| **Reports** | [API-Reports.md](./API-Reports.md) | GET |

---

## Quick Reference

| Method | Path | Description |
|--------|------|-------------|
| GET | /expenses | List expenses (query: from, to, categoryId, status) |
| POST | /expenses | Create expense |
| PATCH | /expenses/:id | Update expense |
| DELETE | /expenses/:id | Delete expense |
| GET | /categories | List categories |
| GET | /budget | Budget overview |
| GET | /statements | List statements |
| GET | /statements/:id/transactions | Statement transactions |
| POST | /statements/upload | Upload PDF (multipart) |
| POST | /statements | Persist statement |
| GET | /contacts | List contacts |
| POST | /contacts | Create contact |
| PUT | /contacts | Update contact |
| DELETE | /contacts?id= | Delete contact |
| GET | /invoices | List invoices |
| POST | /invoices | Create invoice |
| PATCH | /invoices/:id | Update invoice |
| DELETE | /invoices/:id | Delete invoice |
| GET | /payable-summary | Aging buckets |
| GET | /stats | Dashboard stats |
| GET | /charts?range=12\|24 | Chart data |
| GET | /reports | Full reports |

---

## Error Responses

| Status | Body |
|--------|------|
| 400 | `{ "error": "..." }` |
| 404 | `{ "error": "Invoice not found" }` (or similar) |
| 500 | `{ "error": "Internal server error", "message": "..." }` |
