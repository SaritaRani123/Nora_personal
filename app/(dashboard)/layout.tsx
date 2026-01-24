import DashboardLayout from '@/components/DashboardLayout';
import { ExpensesProvider } from '@/app/context/ExpensesContext';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ExpensesProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </ExpensesProvider>
  );
}
