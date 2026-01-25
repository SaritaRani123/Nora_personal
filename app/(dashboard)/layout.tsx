import DashboardLayout from '@/components/DashboardLayout';
import { CalendarProvider } from '@/app/context/CalendarContext';
import { ExpensesProvider } from '@/app/context/ExpensesContext';
import { ClientsProvider } from '@/app/context/ClientsContext';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <CalendarProvider>
      <ClientsProvider>
        <ExpensesProvider>
          <DashboardLayout>{children}</DashboardLayout>
        </ExpensesProvider>
      </ClientsProvider>
    </CalendarProvider>
  );
}
