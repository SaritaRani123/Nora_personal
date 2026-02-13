# Nora Frontend Features

Overview of key features and how they work.

---

## Invoices

**Pages**: `/invoices`, `/invoices/create`

### List Page (`/invoices`)
- Lists all invoices with search and status filter
- Actions: View, Edit, Download PDF, Duplicate, Delete
- Stats cards: Total Invoiced, Paid, Pending, Overdue
- View modal shows client, dates, amount (with currency)
- Edit stores full invoice in `sessionStorage` and navigates to create page
- Duplicate creates a new invoice with same template, colors, currency, line items
- Download uses `lib/invoices/generateInvoicePDF.ts` (shared with create page)

### Create/Edit Page (`/invoices/create`)
- **Steps**: Details → Template & Customization → Preview
- **Details**: Business info, contact, invoice details (number, dates, currency), line items, discount, notes
- **Template**: Choose Classic/Modern/Formal; color palette; logo position/size
- **Preview**: Live template preview via `InvoicePreview` component
- **Actions**: Download PDF, Save, Send (email modal), Record Payment
- **Record Payment**: Saves immediately with status `paid` and redirects to list
- **Edit mode**: Loads full invoice from `sessionStorage` (template, colors, line items, currency)
- **404 fallback**: If update fails (e.g. backend restarted), falls back to create

### Invoice PDF Generation
- **File**: `lib/invoices/generateInvoicePDF.ts`
- Uses `invoice.template`, `invoice.colorPalette`, `invoice.lineItems`, `invoice.invoiceCurrency`
- Renders HTML for chosen template, converts to PDF via html2canvas + jsPDF

---

## Expenses

**Pages**: Expenses list, add/edit modals

- CRUD for expenses
- Filter by date range, category, status
- Categories from `/categories` API

---

## Contacts

**Pages**: Contacts list, add/edit

- CRUD for contacts
- Used as "Bill To" in invoice create (contact picker modal)

---

## Dashboard

- Stats: income, expenses, net profit, changes (from `/stats`)
- Charts: income vs expenses, category breakdown (from `/charts?range=12|24`)
- Payable summary: aging buckets for invoices and bills (from `/payable-summary`)

---

## Budget

- Budget overview by category (from `/budget`)

---

## Bank Statements

- Upload PDF statements (POST `/statements/upload`)
- Review transactions, save statement (POST `/statements`)
- List statements and view transactions

---

## Reports

- Full reports page (from `/reports`)

---

## User / Profile

- **Context**: `lib/contexts/UserContext.tsx`
- **Service**: `lib/services/user.ts` (mock data)
- Profile changes in Settings update Sidebar and Header (no backend persistence)
