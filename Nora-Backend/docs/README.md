# Nora Backend Documentation

Documentation for the Nora Backend API server.

## Contents

| Document | Description |
|----------|-------------|
| [API Reference](./API.md) | Overview and table of all endpoints |
| [API-Invoices](./API-Invoices.md) | Invoices API (CRUD, template, currency, line items) |
| [API-Expenses](./API-Expenses.md) | Expenses API (CRUD, filters) |
| [API-Contacts](./API-Contacts.md) | Contacts API (CRUD) |
| [API-Categories](./API-Categories.md) | Categories API (read-only) |
| [API-Budget](./API-Budget.md) | Budget API (read-only) |
| [API-Statements](./API-Statements.md) | Bank Statements API (upload, persist, transactions) |
| [API-PayableSummary](./API-PayableSummary.md) | Payable Summary API (aging buckets) |
| [API-Stats](./API-Stats.md) | Stats API (dashboard) |
| [API-Charts](./API-Charts.md) | Charts API (chart data) |
| [API-Reports](./API-Reports.md) | Reports API (full reports data) |

## Quick Start

- **Base URL**: `http://localhost:8080`
- **Health Check**: `GET /health`
- **CORS**: Accepts requests from `http://localhost:3000`

## API Response Format

All endpoints return data in **array format** (e.g. `{ "invoices": [...] }`, `{ "expenses": [...] }`), even for single items.
