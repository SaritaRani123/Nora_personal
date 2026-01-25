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
  unitPrice?: number;
  taxPercent?: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId?: string; // new: reference to client
  clientName: string; // kept for backward compatibility
  clientEmail?: string;
  amount: number; // legacy: computed grandTotal for backward compatibility
  status: InvoiceStatus;
  issueDate: string;
  dueDate?: string;
  lineItems: InvoiceLineItem[];
  notes?: string;
  paymentTerms?: string;
  // New fields for discount and late fees
  discountEnabled?: boolean;
  discountPercent?: number;
  lateFeeEnabled?: boolean;
  feePercent?: number;
  applyEveryXDays?: number;
  calendarEventId?: string; // link to calendar event
}
