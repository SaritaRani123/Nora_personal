# Frontend API Usage

This document maps frontend services to backend APIs, including exact endpoints, methods, and request/response handling.

**Base URL**: Configured in `lib/config/api.ts` → `getApiBaseUrl()` (default: `http://localhost:8080`)

All requests use `lib/api/http.ts` → `apiFetch()` with `Content-Type: application/json`.

---

## Invoices

**Service**: `lib/services/invoices.ts`

| Frontend Function | Backend API | Method | Request | Response |
|-------------------|-------------|--------|---------|----------|
| `listInvoices()` | `/invoices` | GET | — | `{ invoices: Invoice[] }` |
| `createInvoice(payload)` | `/invoices` | POST | Body: `CreateInvoicePayload` (client, email, amount, status, issueDate, dueDate, paidDate, template, colorPalette, invoiceCurrency, lineItems) | `{ invoices: [Invoice] }` |
| `updateInvoice(id, payload)` | `/invoices/:id` | PATCH | Body: Partial payload | `{ invoices: [Invoice] }` |
| `deleteInvoice(id)` | `/invoices/:id` | DELETE | — | No body (204) |

**Used by**: `app/(dashboard)/invoices/page.tsx`, `app/(dashboard)/invoices/create/page.tsx`

---

## Expenses

**Service**: `lib/services/expenses.ts`

| Frontend Function | Backend API | Method | Request | Response |
|-------------------|-------------|--------|---------|----------|
| `listExpenses(filters?)` | `/expenses?from=&to=&categoryId=&status=` | GET | Query params | `{ expenses: Expense[] }` |
| `createExpense(payload)` | `/expenses` | POST | Body: Expense | `{ expenses: [Expense] }` |
| `updateExpense(id, payload)` | `/expenses/:id` | PATCH | Body: Partial | `{ expenses: [Expense] }` |
| `deleteExpense(id)` | `/expenses/:id` | DELETE | — | No body (204) |
| `listCategories()` | `/categories` | GET | — | `{ categories: Category[] }` |

**Used by**: Expenses pages, dashboard

---

## Contacts

**Service**: `lib/services/contacts.ts`

| Frontend Function | Backend API | Method | Request | Response |
|-------------------|-------------|--------|---------|----------|
| `listContacts()` | `/contacts` | GET | — | `{ contacts: Contact[] }` |
| `createContact(payload)` | `/contacts` | POST | Body: `{ name, email, phone?, address? }` | `{ contacts: [Contact] }` |
| `updateContact(id, updates)` | `/contacts` | PUT | Body: `{ id, ...updates }` | `{ contacts: [Contact] }` |
| `deleteContact(id)` | `/contacts?id=:id` | DELETE | Query: id | `{ contacts: [...] }` |

**Used by**: Contacts page, invoice create (contact picker)

---

## Stats

**Service**: `lib/services/stats.ts`

| Frontend Function | Backend API | Method | Request | Response |
|-------------------|-------------|--------|---------|----------|
| `fetchStats()` | `/stats` | GET | — | `{ stats: [{ totalIncome, totalExpenses, netProfit, incomeChange, expensesChange, profitChange }] }` |

**Used by**: Dashboard

---

## Budget

**Service**: `lib/services/budget.ts`

| Frontend Function | Backend API | Method | Request | Response |
|-------------------|-------------|--------|---------|----------|
| `fetchBudget()` | `/budget` | GET | — | `{ budget: [{ year, totalBudget, spent, categories }] }` |

**Used by**: Budget page

---

## Payable Summary

**Service**: `lib/services/payable-summary.ts`

| Frontend Function | Backend API | Method | Request | Response |
|-------------------|-------------|--------|---------|----------|
| `fetchPayableSummary()` | `/payable-summary` | GET | — | `{ payableSummary: [{ invoicesPayable, billsOwing, totalReceivable, totalPayable }] }` |

**Used by**: Dashboard, payable/owing widgets

---

## Charts

**Service**: `lib/services/charts.ts`

| Frontend Function | Backend API | Method | Request | Response |
|-------------------|-------------|--------|---------|----------|
| `fetchCharts(range)` | `/charts?range=12` or `range=24` | GET | Query: range | `{ charts: [{ incomeExpenseData, categoryData }] }` |

**Used by**: Dashboard charts

---

## Reports

**Service**: `lib/services/reports.ts`

| Frontend Function | Backend API | Method | Request | Response |
|-------------------|-------------|--------|---------|----------|
| `fetchReports()` | `/reports` | GET | — | `{ reports: [{ stats, categoryDistribution, spendingTrend, ... }] }` |

**Used by**: Reports page

---

## Statements

**Service**: `lib/services/statements.ts`

| Frontend Function | Backend API | Method | Request | Response |
|-------------------|-------------|--------|---------|----------|
| `listStatements()` | `/statements` | GET | — | `{ statements, stats }` |
| `uploadStatement(file)` | `/statements/upload` | POST | multipart/form-data (file) | `{ statements, stats }` |
| `getStatementTransactions(id)` | `/statements/:id/transactions` | GET | — | `{ transactions }` |
| `saveStatement(payload)` | `/statements` | POST | Body: statement object | `{ statements, stats }` |

**Used by**: Bank Statements page

---

## Response Extraction

All services use `extractArray(body, key)` from `lib/api/arrays` to normalize responses (handles `{ invoices: [...] }`, `{ data: [...] }`, etc.).
