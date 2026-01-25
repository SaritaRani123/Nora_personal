'use client';

import { useExpenses } from '@/app/context/ExpensesContext';
import { useCalendar } from '@/app/context/CalendarContext';
import StatCard from '@/ui/StatCard';
import { DollarSign, TrendingUp, FileText, Receipt, Calendar, BarChart3 } from 'lucide-react';

export default function DashboardPage() {
  const { expenses } = useExpenses();
  const calendar = useCalendar();
  const invoices = calendar.invoices;

  // Calculate totals
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalInvoices = invoices.reduce((sum, i) => sum + i.amount, 0);
  const paidInvoices = invoices.filter((i) => i.status === 'paid').length;
  const pendingExpenses = expenses.filter((e) => e.status === 'pending').length;

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(n);

  return (
    <div className="w-full min-w-0 space-y-6">
      {/* Premium Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Dashboard</h1>
        <p className="text-sm text-gray-500">Overview of your finances and activity</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(totalInvoices)}
          subtitle={`${invoices.length} invoices`}
          icon={DollarSign}
          iconBg="bg-primary-50"
          trend={{ value: '+12.5%', isPositive: true }}
        />
        <StatCard
          title="Total Expenses"
          value={formatCurrency(totalExpenses)}
          subtitle={`${expenses.length} expenses`}
          icon={Receipt}
          iconBg="bg-warning-subtle"
          trend={{ value: '+8.2%', isPositive: false }}
        />
        <StatCard
          title="Net Income"
          value={formatCurrency(totalInvoices - totalExpenses)}
          subtitle="Revenue - Expenses"
          icon={TrendingUp}
          iconBg="bg-success-subtle"
          trend={{ value: '+5.3%', isPositive: true }}
        />
        <StatCard
          title="Pending Items"
          value={pendingExpenses + (invoices.length - paidInvoices)}
          subtitle={`${pendingExpenses} expenses, ${invoices.length - paidInvoices} invoices`}
          icon={FileText}
          iconBg="bg-info-subtle"
        />
      </div>

      {/* Chart Placeholders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart Placeholder */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Revenue Overview</h2>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64 bg-gray-50 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-200">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Chart visualization</p>
              <p className="text-xs text-gray-400 mt-1">Revenue trends will appear here</p>
            </div>
          </div>
        </div>

        {/* Expenses Chart Placeholder */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Expense Breakdown</h2>
            <Receipt className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64 bg-gray-50 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-200">
            <div className="text-center">
              <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Chart visualization</p>
              <p className="text-xs text-gray-400 mt-1">Expense categories will appear here</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          <Calendar className="w-5 h-5 text-gray-400" />
        </div>
        <div className="space-y-3">
          {invoices.slice(0, 3).map((invoice) => (
            <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{invoice.invoiceNumber}</p>
                  <p className="text-xs text-gray-500">{invoice.clientName}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900 currency">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(invoice.amount)}
                </p>
                <p className="text-xs text-gray-500">{invoice.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
