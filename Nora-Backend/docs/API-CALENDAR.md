# Calendar APIs

APIs used by the Calendar page (`app/(dashboard)/calendar/page.tsx`): expenses, invoices, work-done, time-entries, travel, meetings, calendar summary, calendar config, categories, app config, payment methods, and contacts. This document describes only the endpoints and response shapes used by the Calendar feature.

**Base URL**: `http://localhost:8080`

---

# Expenses API

Base path: `/expenses`

Expenses in a date range; create, update, delete from Calendar (Add/Edit expense, Track as expense from travel).

---

## GET /expenses

List expenses, optionally filtered by date range (Calendar uses `from`, `to`).

### Request
```
GET /expenses?from=2026-02-01&to=2026-02-28
```

| Query | Type | Description |
|-------|------|-------------|
| from | string | Start date (YYYY-MM-DD). Optional. |
| to | string | End date (YYYY-MM-DD). Optional. |
| categoryId | string | Filter by category. Optional. |
| status | string | Filter by status. Optional. |

### Response (200 OK)
```json
{
  "expenses": [
    {
      "id": "exp-1",
      "date": "2026-01-24",
      "description": "McDonald's",
      "category": "food",
      "amount": 45.99,
      "paymentMethod": "Debit Card",
      "aiSuggested": true,
      "confidence": 95,
      "status": "paid",
      "source": "import"
    }
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| expenses | array | List of expense objects. |
| id | string | Expense ID. |
| date | string | Date (YYYY-MM-DD). |
| description | string | Description. |
| category | string | Category ID. |
| amount | number | Amount. |
| paymentMethod | string | Payment method name. |
| status | string | e.g. `paid`, `pending`, `overdue`. |
| source | string | `manual`, `calendar`, or `import`. |

---

## POST /expenses

Create an expense (Add expense from Calendar or "Track as expense" from travel).

### Request
```
POST /expenses
Content-Type: application/json
```
Body: `date`, `description`, `category`, `amount`, `paymentMethod`, optional: `status`, `source` (e.g. `calendar`).

### Response (201 Created)
```json
{
  "expenses": [
    {
      "id": "exp-1739123456789",
      "date": "2026-02-15",
      "description": "Office Supplies",
      "category": "office",
      "amount": 120.5,
      "paymentMethod": "Credit Card",
      "aiSuggested": false,
      "confidence": 100,
      "status": "pending",
      "source": "calendar"
    }
  ]
}
```

---

## PATCH /expenses/:id

Update an expense (Edit from Calendar).

### Request
```
PATCH /expenses/exp-1
Content-Type: application/json
```
Body: any of `date`, `description`, `category`, `amount`, `paymentMethod`, `status`.

### Response (200 OK)
```json
{
  "expenses": [
    {
      "id": "exp-1",
      "date": "2026-01-24",
      "description": "Updated description",
      "category": "food",
      "amount": 45.99,
      "paymentMethod": "Debit Card",
      "status": "paid",
      "source": "import"
    }
  ]
}
```

### Error (404)
```json
{ "error": "Expense not found" }
```

---

## DELETE /expenses/:id

Delete an expense (Delete from Calendar).

### Request
```
DELETE /expenses/exp-1
```

### Response (204 No Content)
No body.

### Error (404)
```json
{ "error": "Expense not found" }
```

---

# Invoices API (Calendar usage)

Base path: `/invoices`

Calendar page only uses **GET** to list invoices (for upcoming due dates, paid dates as income, and calendar events).

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
      "client": "Acme Corp",
      "email": "billing@acme.com",
      "amount": 1500,
      "status": "paid",
      "issueDate": "2026-01-01",
      "dueDate": "2026-01-31",
      "paidDate": "2026-01-28",
      "source": "manual"
    }
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| invoices | array | List of invoice objects. |
| id | string | Invoice ID. |
| client | string | Client name. |
| amount | number | Invoice amount. |
| status | string | `paid`, `pending`, `overdue`, `draft`. |
| dueDate | string | Due date (YYYY-MM-DD). |
| paidDate | string \| null | Payment date when status is `paid`. |

---

# Work Done API

Base path: `/work-done`

Work-done entries in a date range; create, update, delete from Calendar.

---

## GET /work-done

List work-done entries, optionally filtered by date range.

### Request
```
GET /work-done?from=2026-02-01&to=2026-02-28
```

| Query | Type | Description |
|-------|------|-------------|
| from | string | Start date (YYYY-MM-DD). Optional. |
| to | string | End date (YYYY-MM-DD). Optional. |
| unbilledOnly | string | `true` to return only unbilled. Optional. |

### Response (200 OK)
```json
{
  "workDone": [
    {
      "id": "work-1739123456789",
      "date": "2026-02-10",
      "contact": "Acme Corp",
      "description": "Consulting",
      "hours": 4,
      "rate": 75,
      "amount": 300,
      "invoiceId": null
    }
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| workDone | array | List of work-done entries. |
| id | string | Entry ID (prefix `work-`). |
| date | string | Date (YYYY-MM-DD). |
| contact | string | Client/contact name. |
| description | string | Description. |
| hours | number | Hours worked. |
| rate | number | Hourly rate. |
| amount | number | hours × rate. |
| invoiceId | string \| null | Invoice ID if invoiced; null if unbilled. |

---

## POST /work-done

Create a work-done entry (Add from Calendar).

### Request
```
POST /work-done
Content-Type: application/json
```
Body: `date`, `contact`, `description`, `hours`, `rate`, `amount`. Optional: `invoiceId`.

### Response (201 Created)
```json
{
  "workDone": [
    {
      "id": "work-1739123456789",
      "date": "2026-02-10",
      "contact": "Acme Corp",
      "description": "Consulting",
      "hours": 4,
      "rate": 75,
      "amount": 300,
      "invoiceId": null
    }
  ]
}
```

---

## PATCH /work-done/:id

Update a work-done entry (Edit from Calendar).

### Request
```
PATCH /work-done/work-1739123456789
Content-Type: application/json
```
Body: any of `date`, `contact`, `description`, `hours`, `rate`, `amount`.

### Response (200 OK)
```json
{
  "workDone": [
    {
      "id": "work-1739123456789",
      "date": "2026-02-10",
      "contact": "Acme Corp",
      "description": "Updated description",
      "hours": 5,
      "rate": 75,
      "amount": 375,
      "invoiceId": null
    }
  ]
}
```

### Error (404)
```json
{ "error": "Work done entry not found" }
```

---

## DELETE /work-done/:id

Delete a work-done entry (Delete from Calendar).

### Request
```
DELETE /work-done/work-1739123456789
```

### Response (204 No Content)
No body.

### Error (404)
```json
{ "error": "Work done entry not found" }
```

---

# Time Entries API

Base path: `/time-entries`

Time entries in a date range; create, update, delete from Calendar. Supports timer (`timerStartedAt`); only one timer can be active globally.

---

## GET /time-entries

List time entries. Calendar uses `from`/`to` for view range, or no params for "all" (e.g. timer detection).

### Request
```
GET /time-entries?from=2026-02-01&to=2026-02-28
```
or
```
GET /time-entries
```

| Query | Type | Description |
|-------|------|-------------|
| from | string | Start date (YYYY-MM-DD). Optional. |
| to | string | End date (YYYY-MM-DD). Optional. |
| unbilledOnly | string | `true` for unbilled only. Optional. |

### Response (200 OK)
```json
{
  "timeEntries": [
    {
      "id": "time-1739123456789",
      "date": "2026-02-10",
      "contactId": "c-1",
      "invoiceItem": "Consulting",
      "description": "Project review",
      "hourlyRate": 75,
      "durationMinutes": 120,
      "amount": 150,
      "invoiceId": null,
      "timerStartedAt": null
    }
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| timeEntries | array | List of time entry objects. |
| id | string | Entry ID (prefix `time-`). |
| date | string | Date (YYYY-MM-DD). |
| contactId | string | Contact ID. |
| invoiceItem | string | Line item description. |
| description | string | Description. |
| hourlyRate | number | Hourly rate. |
| durationMinutes | number | Duration in minutes. |
| amount | number | Computed amount. |
| invoiceId | string \| null | Invoice ID if invoiced. |
| timerStartedAt | string \| null | ISO timestamp when timer started; null when stopped. |

---

## POST /time-entries

Create a time entry (Add from Calendar; may include `timerStartedAt` to start timer).

### Request
```
POST /time-entries
Content-Type: application/json
```
Body: `date`, `contactId`, `hourlyRate`; optional: `invoiceItem`, `description`, `durationMinutes`, `amount`, `invoiceId`, `timerStartedAt`.

### Response (201 Created)
```json
{
  "timeEntries": [
    {
      "id": "time-1739123456789",
      "date": "2026-02-10",
      "contactId": "c-1",
      "invoiceItem": "Consulting",
      "description": "",
      "hourlyRate": 75,
      "durationMinutes": 0,
      "amount": 0,
      "invoiceId": null,
      "timerStartedAt": "2026-02-10T14:00:00.000Z"
    }
  ]
}
```

---

## PATCH /time-entries/:id

Update a time entry (Edit from Calendar; set `timerStartedAt` to `null` to stop timer).

### Request
```
PATCH /time-entries/time-1739123456789
Content-Type: application/json
```
Body: any of `date`, `contactId`, `invoiceItem`, `description`, `hourlyRate`, `durationMinutes`, `amount`, `invoiceId`, `timerStartedAt`.

### Response (200 OK)
```json
{
  "timeEntries": [
    {
      "id": "time-1739123456789",
      "date": "2026-02-10",
      "contactId": "c-1",
      "invoiceItem": "Consulting",
      "description": "Project review",
      "hourlyRate": 75,
      "durationMinutes": 120,
      "amount": 150,
      "invoiceId": null,
      "timerStartedAt": null
    }
  ]
}
```

### Error (404)
```json
{ "error": "Time entry not found" }
```

---

## DELETE /time-entries/:id

Delete a time entry (Delete from Calendar).

### Request
```
DELETE /time-entries/time-1739123456789
```

### Response (204 No Content)
No body.

### Error (404)
```json
{ "error": "Time entry not found" }
```

---

# Travel API

Base path: `/travel`

Travel entries in a date range; create, update, delete from Calendar.

---

## GET /travel

List travel entries, optionally filtered by date range.

### Request
```
GET /travel?from=2026-02-01&to=2026-02-28
```

| Query | Type | Description |
|-------|------|-------------|
| from | string | Start date (YYYY-MM-DD). Optional. |
| to | string | End date (YYYY-MM-DD). Optional. |

### Response (200 OK)
```json
{
  "travel": [
    {
      "id": "travel-1739123456789",
      "date": "2026-02-05",
      "fromAddress": "Toronto",
      "toAddress": "Ottawa",
      "roundTrip": true,
      "stops": [],
      "billTo": "c-1",
      "distance": 450,
      "rate": 0.58,
      "taxes": 0,
      "notes": "Client visit",
      "total": 522
    }
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| travel | array | List of travel entries. |
| id | string | Entry ID (prefix `travel-`). |
| date | string | Date (YYYY-MM-DD). |
| fromAddress | string | Origin. |
| toAddress | string | Destination. |
| roundTrip | boolean | If true, distance is doubled for total. |
| stops | array | Array of stop strings. |
| billTo | string | Contact/client ID to bill. |
| distance | number | Distance (km). |
| rate | number | Rate per km. |
| taxes | number | Tax amount. |
| notes | string | Notes. |
| total | number | Computed total (distance × rate × (roundTrip ? 2 : 1) + taxes). |

---

## POST /travel

Create a travel entry (Add from Calendar).

### Request
```
POST /travel
Content-Type: application/json
```
Body: `date`, `fromAddress`, `toAddress`, `roundTrip`, `stops`, `billTo`, `distance`, `rate`; optional: `taxes`, `notes`. Backend computes `total`.

### Response (201 Created)
```json
{
  "travel": [
    {
      "id": "travel-1739123456789",
      "date": "2026-02-05",
      "fromAddress": "Toronto",
      "toAddress": "Ottawa",
      "roundTrip": true,
      "stops": [],
      "billTo": "c-1",
      "distance": 450,
      "rate": 0.58,
      "taxes": 0,
      "notes": "",
      "total": 522
    }
  ]
}
```

---

## PUT /travel/:id

Update a travel entry (Edit from Calendar). Same body shape as POST.

### Request
```
PUT /travel/travel-1739123456789
Content-Type: application/json
```
Body: same fields as POST (date, fromAddress, toAddress, roundTrip, stops, billTo, distance, rate, taxes?, notes).

### Response (200 OK)
```json
{
  "travel": [
    {
      "id": "travel-1739123456789",
      "date": "2026-02-05",
      "fromAddress": "Toronto",
      "toAddress": "Ottawa",
      "roundTrip": false,
      "stops": [],
      "billTo": "c-1",
      "distance": 450,
      "rate": 0.58,
      "taxes": 0,
      "notes": "Updated",
      "total": 261
    }
  ]
}
```

### Error (404)
```json
{ "error": "Travel entry not found" }
```

---

## DELETE /travel/:id

Delete a travel entry (Delete from Calendar).

### Request
```
DELETE /travel/travel-1739123456789
```

### Response (204 No Content)
No body.

### Error (404)
```json
{ "error": "Travel entry not found" }
```

---

# Meetings API

Base path: `/meetings`

Meetings in a date range; create, update, delete from Calendar. Data stored in `data/meetings.json`.

---

## GET /meetings

List meetings, optionally filtered by date range. Calendar uses this for view range and for "upcoming" (from today to today+31 days).

### Request
```
GET /meetings?from=2026-02-01&to=2026-02-28
```

| Query | Type | Description |
|-------|------|-------------|
| from | string | Start date (YYYY-MM-DD). Optional. |
| to | string | End date (YYYY-MM-DD). Optional. |

### Response (200 OK)
```json
{
  "meetings": [
    {
      "id": "meeting-1739123456789",
      "date": "2026-02-12",
      "startTime": "14:00",
      "endTime": "15:00",
      "contactId": "c-1",
      "title": "Client call",
      "notes": "Q1 review",
      "createdAt": "2026-02-01T10:00:00.000Z",
      "updatedAt": "2026-02-01T10:00:00.000Z"
    }
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| meetings | array | List of meeting objects. |
| id | string | Meeting ID (prefix `meeting-`). |
| date | string | Date (YYYY-MM-DD). |
| startTime | string | Start time (e.g. HH:mm). |
| endTime | string | End time (e.g. HH:mm). |
| contactId | string | Contact ID. |
| title | string | Meeting title. |
| notes | string | Notes. |
| createdAt | string | ISO timestamp. |
| updatedAt | string | ISO timestamp. |

---

## POST /meetings

Create a meeting (Add from Calendar).

### Request
```
POST /meetings
Content-Type: application/json
```
Body: `title`, `date`; optional: `startTime`, `endTime`, `contactId`, `notes`.

### Response (201 Created)
```json
{
  "meetings": [
    {
      "id": "meeting-1739123456789",
      "date": "2026-02-12",
      "startTime": "14:00",
      "endTime": "15:00",
      "contactId": "c-1",
      "title": "Client call",
      "notes": "Q1 review",
      "createdAt": "2026-02-01T10:00:00.000Z",
      "updatedAt": "2026-02-01T10:00:00.000Z"
    }
  ]
}
```

---

## PATCH /meetings/:id

Update a meeting (Edit from Calendar).

### Request
```
PATCH /meetings/meeting-1739123456789
Content-Type: application/json
```
Body: any of `date`, `startTime`, `endTime`, `contactId`, `title`, `notes`.

### Response (200 OK)
```json
{
  "meetings": [
    {
      "id": "meeting-1739123456789",
      "date": "2026-02-12",
      "startTime": "15:00",
      "endTime": "16:00",
      "contactId": "c-1",
      "title": "Client call (rescheduled)",
      "notes": "Q1 review",
      "createdAt": "2026-02-01T10:00:00.000Z",
      "updatedAt": "2026-02-02T09:00:00.000Z"
    }
  ]
}
```

### Error (404)
```json
{ "error": "Meeting not found" }
```

---

## DELETE /meetings/:id

Delete a meeting (Delete from Calendar).

### Request
```
DELETE /meetings/meeting-1739123456789
```

### Response (204 No Content)
No body.

### Error (404)
```json
{ "error": "Meeting not found" }
```

---

# Stats API (Calendar Summary)

Base path: `/stats`

Calendar page uses only the calendar-summary endpoint for period totals (work done, expenses, income, hours, net).

---

## GET /stats/calendar-summary

Aggregates for a date range: work-done amount and hours, expense total, income (paid invoices in range), and net. Required query params: `from`, `to`.

### Request
```
GET /stats/calendar-summary?from=2026-02-01&to=2026-02-28
```

| Query | Type | Description |
|-------|------|-------------|
| from | string | **Required.** Start date (YYYY-MM-DD). |
| to | string | **Required.** End date (YYYY-MM-DD). |

### Response (200 OK)
```json
{
  "workDone": 1250.5,
  "expenses": 892.34,
  "income": 2100,
  "hoursWorked": 18.5,
  "net": 2458.16
}
```

| Field | Type | Description |
|-------|------|-------------|
| workDone | number | Sum of work-done amounts in range. |
| expenses | number | Sum of expense amounts in range. |
| income | number | Sum of paid invoice amounts whose paidDate is in range. |
| hoursWorked | number | Sum of work-done hours in range. |
| net | number | workDone + income - expenses. |

### Error (400)
```json
{ "error": "Query params from and to (YYYY-MM-DD) are required" }
```

---

# Calendar Config API

Base path: `/calendar`

Calendar page uses only the config endpoint for entry types and form defaults.

---

## GET /calendar/config

Returns calendar entry types (for Quick Add, legend, filters) and default rates for travel and time entries.

### Request
```
GET /calendar/config
```

### Response (200 OK)
```json
{
  "entryTypes": [
    { "id": "work", "label": "Work Done", "iconKey": "briefcase", "colorKey": "primary" },
    { "id": "time", "label": "Time", "iconKey": "clock", "colorKey": "chart4" },
    { "id": "expense", "label": "Expense", "iconKey": "receipt", "colorKey": "destructive" },
    { "id": "meeting", "label": "Meeting", "iconKey": "users", "colorKey": "chart2" },
    { "id": "travel", "label": "Travels", "iconKey": "car", "colorKey": "chart5" },
    { "id": "note", "label": "Note", "iconKey": "fileText", "colorKey": "muted" }
  ],
  "defaultKmRate": 0.58,
  "defaultHourlyRate": 75
}
```

| Field | Type | Description |
|-------|------|-------------|
| entryTypes | array | Entry type definitions for calendar. |
| entryTypes[].id | string | Type id (work, time, expense, meeting, travel, note). |
| entryTypes[].label | string | Display label. |
| entryTypes[].iconKey | string | Frontend icon key (briefcase, clock, receipt, users, car, fileText). |
| entryTypes[].colorKey | string | Frontend color key (primary, chart4, destructive, chart2, chart5, muted). |
| defaultKmRate | number | Default rate per km for travel form. |
| defaultHourlyRate | number | Default hourly rate for time form. |

---

# Categories API

Base path: `/categories`

Expense categories for Calendar expense form and filters.

---

## GET /categories

List expense categories.

### Request
```
GET /categories
```

### Response (200 OK)
```json
{
  "categories": [
    { "id": "food", "name": "Food & Dining", "code": "7012" },
    { "id": "office", "name": "Office Expenses", "code": "4053" },
    { "id": "travel", "name": "Travel & Accommodation", "code": "4722" }
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| categories | array | List of category objects. |
| id | string | Category ID. |
| name | string | Display name. |
| code | string | Category code. |

---

# Config API

Base path: `/config`

App config: payment methods, expense status options, default payment method/category/status, calendar year range. Used by Calendar for expense form defaults.

---

## GET /config

Get full app config (payment methods, status options, defaults).

### Request
```
GET /config
```

### Response (200 OK)
```json
{
  "paymentMethods": [
    { "id": "credit", "name": "Credit Card" },
    { "id": "debit", "name": "Debit Card" },
    { "id": "cash", "name": "Cash" },
    { "id": "bank", "name": "Bank Transfer" },
    { "id": "cheque", "name": "Cheque" },
    { "id": "etransfer", "name": "E-Transfer" }
  ],
  "expenseStatusOptions": [
    { "value": "paid", "label": "Paid", "color": "bg-green-500/10 text-green-600 border-green-500/20" },
    { "value": "pending", "label": "Pending", "color": "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
    { "value": "overdue", "label": "Overdue", "color": "bg-red-500/10 text-red-600 border-red-500/20" },
    { "value": "review", "label": "Needs Review", "color": "bg-blue-500/10 text-blue-600 border-blue-500/20" }
  ],
  "defaultPaymentMethodId": "credit",
  "defaultExpenseStatus": "pending",
  "defaultCategoryId": "office",
  "missingStatusLabel": "N/A",
  "calendarMinYear": 2020,
  "calendarMaxYear": 2030
}
```

| Field | Type | Description |
|-------|------|-------------|
| paymentMethods | array | Payment method list. |
| expenseStatusOptions | array | Status options (value, label, color). |
| defaultPaymentMethodId | string | Default payment method id. |
| defaultExpenseStatus | string | Default expense status. |
| defaultCategoryId | string | Default category id. |
| calendarMinYear | number | Min year for date picker. |
| calendarMaxYear | number | Max year for date picker. |

---

# Payment Methods API

Base path: `/payment-methods`

Calendar uses this for expense form payment method dropdown (when not using full config).

---

## GET /payment-methods

Get payment methods list and default id.

### Request
```
GET /payment-methods
```

### Response (200 OK)
```json
{
  "paymentMethods": [
    { "id": "credit", "name": "Credit Card" },
    { "id": "debit", "name": "Debit Card" },
    { "id": "cash", "name": "Cash" },
    { "id": "bank", "name": "Bank Transfer" },
    { "id": "cheque", "name": "Cheque" },
    { "id": "etransfer", "name": "E-Transfer" }
  ],
  "defaultPaymentMethodId": "credit"
}
```

| Field | Type | Description |
|-------|------|-------------|
| paymentMethods | array | List of { id, name }. |
| defaultPaymentMethodId | string | Id of default payment method. |

---

# Contacts API (Calendar usage)

Base path: `/contacts`

Calendar page only uses **GET** to list contacts (for client/contact dropdowns in time, work, travel, meeting forms).

---

## GET /contacts

List all contacts.

### Request
```
GET /contacts
```

### Response (200 OK)
```json
{
  "contacts": [
    {
      "id": "c-1",
      "name": "John Smith",
      "email": "john.smith@abccorp.com",
      "phone": "+1 (555) 123-4567",
      "address": "123 Business Ave, Toronto, ON M5V 2T6"
    }
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| contacts | array | List of contact objects. |
| id | string | Contact ID. |
| name | string | Full name. |
| email | string | Email. |
| phone | string | Phone. Optional. |
| address | string | Address. Optional. |

---

## Error responses (all Calendar APIs)

| Status | Body |
|--------|------|
| 400 | `{ "error": "..." }` |
| 404 | `{ "error": "Expense not found" }` (or resource-specific message) |
| 500 | `{ "error": "Internal server error", "message": "..." }` |

---

## Backend implementation reference

| API | Routes | Controller |
|-----|--------|------------|
| Expenses | `routes/expenses.js` | `controllers/expensesController.js` |
| Invoices | `routes/invoices.js` | `controllers/invoicesController.js` |
| Work Done | `routes/work-done.js` | `controllers/workDoneController.js` |
| Time Entries | `routes/time-entries.js` | `controllers/timeEntriesController.js` |
| Travel | `routes/travel.js` | `controllers/travelController.js` |
| Meetings | `routes/meetings.js` | `controllers/meetingsController.js` |
| Calendar summary | `routes/stats.js` (GET /calendar-summary) | `controllers/statsController.js` |
| Calendar config | `routes/calendar.js` (GET /config) | `controllers/calendarConfigController.js` |
| Categories | `routes/categories.js` | `controllers/categoriesController.js` |
| Config | `routes/config.js` | `controllers/configController.js` |
| Payment methods | `routes/payment-methods.js` | `controllers/paymentMethodsController.js` |
| Contacts | `routes/contacts.js` | `controllers/contactsController.js` |

Server mounts: `app.use('/stats', statsRoutes)` → calendar-summary at `GET /stats/calendar-summary`; `app.use('/calendar', calendarRoutes)` → config at `GET /calendar/config`.
