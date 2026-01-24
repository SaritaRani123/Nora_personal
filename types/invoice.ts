export type ExpenseStatus = 'pending' | 'approved' | 'reimbursed' | 'rejected' | 'cancelled';

export type ExpenseCategory =
  | 'food'
  | 'travel'
  | 'utilities'
  | 'office-supplies'
  | 'entertainment'
  | 'healthcare'
  | 'transportation'
  | 'shopping'
  | 'education'
  | 'other';

export type PaymentMethod =
  | 'cash'
  | 'credit-card'
  | 'debit-card'
  | 'bank-transfer'
  | 'paypal'
  | 'other';

export interface Expense {
  id: string;
  expenseNumber: string;
  vendor: string;
  category: ExpenseCategory;
  date: string;
  amount: number;
  status: ExpenseStatus;
  paymentMethod: PaymentMethod;
  description?: string;
  receipt?: string; // URL or file path for receipt
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue';

export interface InvoiceLineItem {
  description: string;
  amount: number;
  quantity?: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail?: string;
  amount: number;
  status: InvoiceStatus;
  issueDate: string;
  dueDate?: string;
  lineItems: InvoiceLineItem[];
  notes?: string;
  paymentTerms?: string;
}
