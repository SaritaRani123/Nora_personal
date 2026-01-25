'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { Expense } from '@/types/invoice';
import type { Invoice } from '@/types/invoice';
import type { WorkEntry, TravelEntry, NoteEntry } from '@/types/calendar';
import { mockExpenses } from '@/data/mockInvoices';
import { mockInvoicesData } from '@/data/mockInvoicesData';

type CalendarContextValue = {
  // Expenses (money going out)
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  addExpense: (e: Expense) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  
  // Invoices (money coming in)
  invoices: Invoice[];
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
  addInvoice: (i: Invoice) => void;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  
  // Work entries (time-based)
  workEntries: WorkEntry[];
  setWorkEntries: React.Dispatch<React.SetStateAction<WorkEntry[]>>;
  addWorkEntry: (w: WorkEntry) => void;
  updateWorkEntry: (id: string, updates: Partial<WorkEntry>) => void;
  deleteWorkEntry: (id: string) => void;
  
  // Travel entries
  travelEntries: TravelEntry[];
  setTravelEntries: React.Dispatch<React.SetStateAction<TravelEntry[]>>;
  addTravelEntry: (t: TravelEntry) => void;
  updateTravelEntry: (id: string, updates: Partial<TravelEntry>) => void;
  deleteTravelEntry: (id: string) => void;
  
  // Notes
  notes: NoteEntry[];
  setNotes: React.Dispatch<React.SetStateAction<NoteEntry[]>>;
  addNote: (n: NoteEntry) => void;
  updateNote: (id: string, updates: Partial<NoteEntry>) => void;
  deleteNote: (id: string) => void;
};

const CalendarContext = createContext<CalendarContextValue | null>(null);

export function CalendarProvider({ children }: { children: React.ReactNode }) {
  // Initialize with existing data
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses);
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoicesData);
  const [workEntries, setWorkEntries] = useState<WorkEntry[]>([]);
  const [travelEntries, setTravelEntries] = useState<TravelEntry[]>([]);
  const [notes, setNotes] = useState<NoteEntry[]>([]);

  // Expense methods
  const addExpense = useCallback((e: Expense) => {
    setExpenses((prev) => [...prev, e]);
  }, []);

  const updateExpense = useCallback((id: string, updates: Partial<Expense>) => {
    setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
  }, []);

  const deleteExpense = useCallback((id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }, []);

  // Invoice methods
  const addInvoice = useCallback((i: Invoice) => {
    setInvoices((prev) => [...prev, i]);
  }, []);

  const updateInvoice = useCallback((id: string, updates: Partial<Invoice>) => {
    setInvoices((prev) => prev.map((i) => (i.id === id ? { ...i, ...updates } : i)));
  }, []);

  const deleteInvoice = useCallback((id: string) => {
    setInvoices((prev) => prev.filter((i) => i.id !== id));
  }, []);

  // Work entry methods
  const addWorkEntry = useCallback((w: WorkEntry) => {
    setWorkEntries((prev) => [...prev, w]);
  }, []);

  const updateWorkEntry = useCallback((id: string, updates: Partial<WorkEntry>) => {
    setWorkEntries((prev) => prev.map((w) => (w.id === id ? { ...w, ...updates } : w)));
  }, []);

  const deleteWorkEntry = useCallback((id: string) => {
    setWorkEntries((prev) => prev.filter((w) => w.id !== id));
  }, []);

  // Travel entry methods
  const addTravelEntry = useCallback((t: TravelEntry) => {
    setTravelEntries((prev) => [...prev, t]);
  }, []);

  const updateTravelEntry = useCallback((id: string, updates: Partial<TravelEntry>) => {
    setTravelEntries((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  }, []);

  const deleteTravelEntry = useCallback((id: string) => {
    setTravelEntries((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Note methods
  const addNote = useCallback((n: NoteEntry) => {
    setNotes((prev) => [...prev, n]);
  }, []);

  const updateNote = useCallback((id: string, updates: Partial<NoteEntry>) => {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, ...updates } : n)));
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <CalendarContext.Provider
      value={{
        expenses,
        setExpenses,
        addExpense,
        updateExpense,
        deleteExpense,
        invoices,
        setInvoices,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        workEntries,
        setWorkEntries,
        addWorkEntry,
        updateWorkEntry,
        deleteWorkEntry,
        travelEntries,
        setTravelEntries,
        addTravelEntry,
        updateTravelEntry,
        deleteTravelEntry,
        notes,
        setNotes,
        addNote,
        updateNote,
        deleteNote,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar() {
  const ctx = useContext(CalendarContext);
  if (!ctx) throw new Error('useCalendar must be used within CalendarProvider');
  return ctx;
}
