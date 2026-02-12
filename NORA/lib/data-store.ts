'use client'

import { create } from 'zustand'

// Types
export interface Expense {
  id: string
  date: string
  description: string
  category: string
  amount: number
  paymentMethod: string
  aiSuggested?: boolean
  confidence?: number
  status?: string
  source?: 'manual' | 'calendar' | 'import'
}

export interface Invoice {
  id: string
  client: string
  email: string
  amount: number
  status: 'paid' | 'pending' | 'overdue' | 'draft'
  issueDate: string
  dueDate: string
  paidDate: string | null
  source?: 'manual' | 'calendar'
  // Template design info
  template?: 'modern' | 'classic' | 'formal'
  colorPalette?: {
    name: string
    header: string
    accent: string
    tableHeader: string
  }
}

export interface Income {
  id: string
  date: string
  description: string
  amount: number
  source: string
  client?: string
}

export interface Contact {
  id: string
  name: string
  email: string
  phone: string
  address: string
}

export interface WorkDoneEntry {
  id: string
  date: string
  contact: string
  description: string
  hours: number
  rate: number
  amount: number
  invoiceId: string | null // null = unbilled, string = linked to invoice
}

interface DataStore {
  // Expenses
  expenses: Expense[]
  addExpense: (expense: Omit<Expense, 'id'>) => string
  updateExpense: (id: string, expense: Partial<Expense>) => void
  deleteExpense: (id: string) => void

  // Invoices
  invoices: Invoice[]
  addInvoice: (invoice: Omit<Invoice, 'id'>) => string
  updateInvoice: (id: string, invoice: Partial<Invoice>) => void
  deleteInvoice: (id: string) => void

  // Income
  income: Income[]
  addIncome: (income: Omit<Income, 'id'>) => string
  updateIncome: (id: string, income: Partial<Income>) => void
  deleteIncome: (id: string) => void

  // Contacts/Clients
  contacts: Contact[]
  addContact: (contact: Omit<Contact, 'id'>) => string
  updateContact: (id: string, contact: Partial<Contact>) => void
  deleteContact: (id: string) => void

  // Work Done entries
  workDoneEntries: WorkDoneEntry[]
  addWorkDoneEntry: (entry: Omit<WorkDoneEntry, 'id'>) => string
  updateWorkDoneEntry: (id: string, entry: Partial<WorkDoneEntry>) => void
  deleteWorkDoneEntry: (id: string) => void
  markWorkDoneAsInvoiced: (ids: string[], invoiceId: string) => void
}

export const useDataStore = create<DataStore>((set, get) => ({
  // Initial state: empty; data is loaded from backend via services
  expenses: [],
  invoices: [],
  income: [],
  contacts: [],
  workDoneEntries: [],

  // Expense actions
  addExpense: (expense) => {
    const id = `exp-${Date.now()}`
    set((state) => ({
      expenses: [{ ...expense, id }, ...state.expenses],
    }))
    return id
  },
  updateExpense: (id, expense) => {
    set((state) => ({
      expenses: state.expenses.map((e) => (e.id === id ? { ...e, ...expense } : e)),
    }))
  },
  deleteExpense: (id) => {
    set((state) => ({
      expenses: state.expenses.filter((e) => e.id !== id),
    }))
  },

  // Invoice actions
  addInvoice: (invoice) => {
    const count = get().invoices.length + 1
    const id = `INV-${String(count).padStart(3, '0')}`
    set((state) => ({
      invoices: [{ ...invoice, id }, ...state.invoices],
    }))
    return id
  },
  updateInvoice: (id, invoice) => {
    set((state) => ({
      invoices: state.invoices.map((i) => (i.id === id ? { ...i, ...invoice } : i)),
    }))
  },
  deleteInvoice: (id) => {
    set((state) => ({
      invoices: state.invoices.filter((i) => i.id !== id),
    }))
  },

  // Income actions
  addIncome: (income) => {
    const id = `inc-${Date.now()}`
    set((state) => ({
      income: [{ ...income, id }, ...state.income],
    }))
    return id
  },
  updateIncome: (id, income) => {
    set((state) => ({
      income: state.income.map((i) => (i.id === id ? { ...i, ...income } : i)),
    }))
  },
  deleteIncome: (id) => {
    set((state) => ({
      income: state.income.filter((i) => i.id !== id),
    }))
  },

  // Contact actions
  addContact: (contact) => {
    const id = `contact-${Date.now()}`
    set((state) => ({
      contacts: [...state.contacts, { ...contact, id }],
    }))
    return id
  },
  updateContact: (id, contact) => {
    set((state) => ({
      contacts: state.contacts.map((c) => (c.id === id ? { ...c, ...contact } : c)),
    }))
  },
  deleteContact: (id) => {
    set((state) => ({
      contacts: state.contacts.filter((c) => c.id !== id),
    }))
  },

  // Work Done entry actions
  addWorkDoneEntry: (entry) => {
    const id = `work-${Date.now()}`
    set((state) => ({
      workDoneEntries: [{ ...entry, id }, ...state.workDoneEntries],
    }))
    return id
  },
  updateWorkDoneEntry: (id, entry) => {
    set((state) => ({
      workDoneEntries: state.workDoneEntries.map((w) =>
        w.id === id ? { ...w, ...entry } : w
      ),
    }))
  },
  deleteWorkDoneEntry: (id) => {
    set((state) => ({
      workDoneEntries: state.workDoneEntries.filter((w) => w.id !== id),
    }))
  },
  markWorkDoneAsInvoiced: (ids, invoiceId) => {
    set((state) => ({
      workDoneEntries: state.workDoneEntries.map((w) =>
        ids.includes(w.id) ? { ...w, invoiceId } : w
      ),
    }))
  },
}))
