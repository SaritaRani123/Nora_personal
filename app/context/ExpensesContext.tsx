'use client';

import React, { createContext, useContext, useCallback } from 'react';
import type { Expense } from '@/types/invoice';
import { useCalendar } from './CalendarContext';

type ExpensesContextValue = {
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  addExpense: (e: Expense) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
};

const ExpensesContext = createContext<ExpensesContextValue | null>(null);

// ExpensesProvider now uses CalendarContext internally for unified state
export function ExpensesProvider({ children }: { children: React.ReactNode }) {
  const calendar = useCalendar();

  const addExpense = useCallback(
    (e: Expense) => {
      calendar.addExpense(e);
    },
    [calendar]
  );

  const updateExpense = useCallback(
    (id: string, updates: Partial<Expense>) => {
      calendar.updateExpense(id, updates);
    },
    [calendar]
  );

  const deleteExpense = useCallback(
    (id: string) => {
      calendar.deleteExpense(id);
    },
    [calendar]
  );

  return (
    <ExpensesContext.Provider
      value={{
        expenses: calendar.expenses,
        setExpenses: calendar.setExpenses,
        addExpense,
        updateExpense,
        deleteExpense,
      }}
    >
      {children}
    </ExpensesContext.Provider>
  );
}

export function useExpenses() {
  const ctx = useContext(ExpensesContext);
  if (!ctx) throw new Error('useExpenses must be used within ExpensesProvider');
  return ctx;
}
