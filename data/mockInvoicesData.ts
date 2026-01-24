import type { Invoice } from '@/types/invoice';

export const mockInvoicesData: Invoice[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-2024-001',
    clientName: 'Acme Corp',
    clientEmail: 'billing@acme.com',
    amount: 1250,
    status: 'paid',
    issueDate: '2024-01-05',
    dueDate: '2024-01-20',
    lineItems: [
      { description: 'Consulting - Project Alpha', amount: 800 },
      { description: 'Expense reimbursement', amount: 450 },
    ],
    notes: 'Thank you for your business.',
    paymentTerms: 'Net 15',
  },
  {
    id: 'inv-2',
    invoiceNumber: 'INV-2024-002',
    clientName: 'TechStart Inc',
    clientEmail: 'accounts@techstart.io',
    amount: 3200,
    status: 'sent',
    issueDate: '2024-01-18',
    dueDate: '2024-02-02',
    lineItems: [
      { description: 'Development services - Phase 1', amount: 2500 },
      { description: 'Design & UX review', amount: 700 },
    ],
    paymentTerms: 'Net 15',
  },
  {
    id: 'inv-3',
    invoiceNumber: 'INV-2024-003',
    clientName: 'Green Solutions Ltd',
    amount: 580,
    status: 'draft',
    issueDate: '2024-01-22',
    dueDate: '2024-02-06',
    lineItems: [
      { description: 'Consulting hours', amount: 580 },
    ],
    paymentTerms: 'Due on receipt',
  },
  {
    id: 'inv-4',
    invoiceNumber: 'INV-2023-028',
    clientName: 'Global Media',
    amount: 890,
    status: 'overdue',
    issueDate: '2023-12-10',
    dueDate: '2023-12-25',
    lineItems: [
      { description: 'Content creation', amount: 890 },
    ],
    paymentTerms: 'Net 15',
  },
];
