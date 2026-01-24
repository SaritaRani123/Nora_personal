'use client';

import { useExpenses } from '@/app/context/ExpensesContext';
import CalendarView from '@/components/CalendarView';

export default function CalendarPage() {
  const { expenses, setExpenses } = useExpenses();

  return (
    <div className="min-h-[420px] h-[480px] sm:h-[560px] w-full overflow-hidden">
      <CalendarView
        expenses={expenses}
        onAddExpense={() => {}}
        onEditExpense={() => {}}
        onDeleteExpense={() => {}}
        onExpensesChange={setExpenses}
      />
    </div>
  );
}
