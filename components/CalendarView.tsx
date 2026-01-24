'use client';

import React, { useState, useMemo } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  isSameMonth,
  isToday,
  addDays,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, List, LayoutGrid, X } from 'lucide-react';
import type { Expense, ExpenseCategory, ExpenseStatus, PaymentMethod } from '@/types/invoice';

const categoryLabelsMap: Record<ExpenseCategory, string> = {
  food: 'Food & Dining',
  travel: 'Travel',
  utilities: 'Utilities',
  'office-supplies': 'Office Supplies',
  entertainment: 'Entertainment',
  healthcare: 'Healthcare',
  transportation: 'Transportation',
  shopping: 'Shopping',
  education: 'Education',
  other: 'Other',
};

const statusLabelsMap: Record<ExpenseStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  reimbursed: 'Reimbursed',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
};

const paymentMethodLabelsMap: Record<PaymentMethod, string> = {
  cash: 'Cash',
  'credit-card': 'Credit Card',
  'debit-card': 'Debit Card',
  'bank-transfer': 'Bank Transfer',
  paypal: 'PayPal',
  other: 'Other',
};

interface CalendarViewProps {
  expenses: Expense[];
  onAddExpense: (date: string) => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (expense: Expense) => void;
  onExpensesChange: (expenses: Expense[]) => void;
}

export default function CalendarView({
  expenses,
  onAddExpense,
  onEditExpense,
  onDeleteExpense,
  onExpensesChange,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [formDate, setFormDate] = useState('');
  const [formVendor, setFormVendor] = useState('');
  const [formCategory, setFormCategory] = useState<ExpenseCategory>('other');
  const [formAmount, setFormAmount] = useState('');
  const [formStatus, setFormStatus] = useState<ExpenseStatus>('pending');
  const [formPaymentMethod, setFormPaymentMethod] = useState<PaymentMethod>('credit-card');
  const [formDescription, setFormDescription] = useState('');

  const expensesByDate = useMemo(() => {
    const map: Record<string, Expense[]> = {};
    expenses.forEach((e) => {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    });
    Object.keys(map).forEach((d) => map[d].sort((a, b) => a.amount - b.amount));
    return map;
  }, [expenses]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const monthDays: Date[] = [];
  let d = calendarStart;
  while (d <= calendarEnd) {
    monthDays.push(d);
    d = addDays(d, 1);
  }

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n);

  const openAdd = (date: Date) => {
    setSelectedDate(date);
    setFormDate(format(date, 'yyyy-MM-dd'));
    setFormVendor('');
    setFormCategory('other');
    setFormAmount('');
    setFormStatus('pending');
    setFormPaymentMethod('credit-card');
    setFormDescription('');
    setShowAddModal(true);
  };

  const openEdit = (e: Expense) => {
    setEditingExpense(e);
    setFormDate(e.date);
    setFormVendor(e.vendor);
    setFormCategory(e.category);
    setFormAmount(String(e.amount));
    setFormStatus(e.status);
    setFormPaymentMethod(e.paymentMethod);
    setFormDescription(e.description || '');
    setShowEditModal(true);
  };

  const generateExpenseNumber = () => {
    const year = new Date().getFullYear();
    const max = expenses.reduce((m, ex) => {
      const match = ex.expenseNumber.match(/EXP-(\d+)-(\d+)/);
      if (match && parseInt(match[1]) === year) {
        const n = parseInt(match[2]);
        return n > m ? n : m;
      }
      return m;
    }, 0);
    return `EXP-${year}-${String(max + 1).padStart(3, '0')}`;
  };

  const submitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formVendor.trim() || !formAmount || Number(formAmount) <= 0) return;
    const newExp: Expense = {
      id: String(Date.now()),
      expenseNumber: generateExpenseNumber(),
      vendor: formVendor.trim(),
      category: formCategory,
      date: formDate,
      amount: Number(formAmount),
      status: formStatus,
      paymentMethod: formPaymentMethod,
      description: formDescription.trim() || undefined,
    };
    onExpensesChange([...expenses, newExp]);
    onAddExpense(formDate);
    setShowAddModal(false);
  };

  const submitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense || !formVendor.trim() || !formAmount || Number(formAmount) <= 0) return;
    const updated: Expense = {
      ...editingExpense,
      vendor: formVendor.trim(),
      category: formCategory,
      date: formDate,
      amount: Number(formAmount),
      status: formStatus,
      paymentMethod: formPaymentMethod,
      description: formDescription.trim() || undefined,
    };
    onExpensesChange(expenses.map((ex) => (ex.id === editingExpense.id ? updated : ex)));
    onEditExpense(updated);
    setShowEditModal(false);
    setEditingExpense(null);
  };

  const handleDelete = () => {
    if (!editingExpense) return;
    onDeleteExpense(editingExpense);
    onExpensesChange(expenses.filter((ex) => ex.id !== editingExpense.id));
    setShowEditModal(false);
    setEditingExpense(null);
  };

  const dayEvents = (date: Date) => expensesByDate[format(date, 'yyyy-MM-dd')] || [];

  const formFields = (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
        <input
          type="date"
          value={formDate}
          onChange={(e) => setFormDate(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Vendor *</label>
        <input
          type="text"
          value={formVendor}
          onChange={(e) => setFormVendor(e.target.value)}
          placeholder="e.g. Starbucks, Uber"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <select
          value={formCategory}
          onChange={(e) => setFormCategory(e.target.value as ExpenseCategory)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          {Object.entries(categoryLabelsMap).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($) *</label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={formAmount}
          onChange={(e) => setFormAmount(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select
          value={formStatus}
          onChange={(e) => setFormStatus(e.target.value as ExpenseStatus)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          {Object.entries(statusLabelsMap).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Payment</label>
        <select
          value={formPaymentMethod}
          onChange={(e) => setFormPaymentMethod(e.target.value as PaymentMethod)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          {Object.entries(paymentMethodLabelsMap).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </div>
      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={formDescription}
          onChange={(e) => setFormDescription(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
          placeholder="Optional"
        />
      </div>
    </>
  );

  return (
    <div className="h-full flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setCurrentDate(view === 'month' ? subMonths(currentDate, 1) : subWeeks(currentDate, 1))}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900 min-w-[180px] text-center">
            {view === 'month' ? format(currentDate, 'MMMM yyyy') : `Week of ${format(weekStart, 'MMM d')}`}
          </h2>
          <button
            type="button"
            onClick={() => setCurrentDate(view === 'month' ? addMonths(currentDate, 1) : addWeeks(currentDate, 1))}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1.5 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg"
          >
            Today
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-gray-200 p-0.5">
            <button
              type="button"
              onClick={() => setView('month')}
              className={`p-2 rounded-md transition-colors ${view === 'month' ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100'}`}
              title="Month"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setView('week')}
              className={`p-2 rounded-md transition-colors ${view === 'week' ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100'}`}
              title="Week"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => openAdd(currentDate)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            Add expense
          </button>
        </div>
      </div>

      {/* Calendar */}
      <div className="flex-1 overflow-auto p-4">
        {view === 'month' ? (
          <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="bg-gray-50 px-2 py-2 text-center text-xs font-semibold text-gray-500 uppercase">
                {day}
              </div>
            ))}
            {monthDays.map((day) => {
              const events = dayEvents(day);
              const inMonth = isSameMonth(day, currentDate);
              return (
                <div
                  key={day.toISOString()}
                  className={`min-h-[100px] bg-white p-1.5 flex flex-col ${
                    !inMonth ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => openAdd(day)}
                      className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium ${
                        isToday(day) ? 'bg-primary text-white' : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      {format(day, 'd')}
                    </button>
                    {events.length > 0 && (
                      <span className="text-xs text-gray-500">{events.length} item(s)</span>
                    )}
                  </div>
                  <div className="mt-1 space-y-1 overflow-y-auto flex-1">
                    {events.slice(0, 3).map((ex) => (
                      <button
                        key={ex.id}
                        type="button"
                        onClick={() => openEdit(ex)}
                        className="w-full text-left px-2 py-1 rounded bg-primary-50 hover:bg-primary-100 text-primary-800 text-xs truncate"
                        title={`${ex.vendor} ${formatCurrency(ex.amount)}`}
                      >
                        {ex.vendor} · {formatCurrency(ex.amount)}
                      </button>
                    ))}
                    {events.length > 3 && (
                      <button
                        type="button"
                        onClick={() => openAdd(day)}
                        className="w-full text-left px-2 py-1 text-xs text-gray-500 hover:bg-gray-50 rounded"
                      >
                        +{events.length - 3} more
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-4">
            {weekDays.map((day) => {
              const events = dayEvents(day);
              return (
                <div key={day.toISOString()} className="flex flex-col border border-gray-200 rounded-lg overflow-hidden">
                  <div
                    className={`px-3 py-2 text-sm font-medium ${
                      isToday(day) ? 'bg-primary text-white' : 'bg-gray-50 text-gray-700'
                    }`}
                  >
                    {format(day, 'EEE, MMM d')}
                  </div>
                  <div className="flex-1 p-2 space-y-2 min-h-[120px]">
                    <button
                      type="button"
                      onClick={() => openAdd(day)}
                      className="w-full py-2 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 hover:border-primary hover:text-primary text-sm"
                    >
                      <Plus className="w-4 h-4 mx-auto mb-0.5" />
                      Add
                    </button>
                    {events.map((ex) => (
                      <button
                        key={ex.id}
                        type="button"
                        onClick={() => openEdit(ex)}
                        className="w-full text-left px-3 py-2 rounded-lg bg-primary-50 hover:bg-primary-100 border border-primary-100"
                      >
                        <div className="font-medium text-gray-900 truncate">{ex.vendor}</div>
                        <div className="text-sm text-primary-700">{formatCurrency(ex.amount)}</div>
                        <div className="text-xs text-gray-500">{categoryLabelsMap[ex.category]}</div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Add expense · {selectedDate && format(selectedDate, 'MMM d, yyyy')}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={submitAdd} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{formFields}</div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600">
                  Add expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {showEditModal && editingExpense && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Edit expense · {editingExpense.expenseNumber}</h3>
              <button
                type="button"
                onClick={() => { setShowEditModal(false); setEditingExpense(null); }}
                className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={submitEdit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{formFields}</div>
              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                >
                  Delete
                </button>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setShowEditModal(false); setEditingExpense(null); }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600">
                    Save changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
