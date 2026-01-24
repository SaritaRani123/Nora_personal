'use client';

import { useExpenses } from '@/app/context/ExpensesContext';
import ExpenseList from '@/components/InvoiceList';

export default function ExpensesPage() {
  const { expenses, setExpenses } = useExpenses();

  return (
    <div className="w-full min-w-0">
      <ExpenseList
        expenses={expenses}
        onExpensesChange={setExpenses}
        embedded
      />
    </div>
  );
}
