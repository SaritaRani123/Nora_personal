'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Expense, ExpenseStatus, ExpenseCategory, PaymentMethod } from '@/types/invoice';
import { Search, Plus, Filter, Download, Eye, Edit, Trash2, X, FileText, ArrowUpRight, ArrowDownRight, Clock, CheckSquare, XOctagon } from 'lucide-react';
import StatCard from '@/ui/StatCard';
import Modal from '@/ui/Modal';
import { Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '@/ui/Table';

interface ExpenseListProps {
  expenses: Expense[];
  onExpensesChange?: (expenses: Expense[]) => void;
  embedded?: boolean;
}

const statusColors: Record<ExpenseStatus, string> = {
  pending: 'badge bg-warning-subtle text-warning',
  approved: 'badge bg-info-subtle text-info',
  reimbursed: 'badge bg-success-subtle text-success',
  rejected: 'badge bg-danger-subtle text-danger',
  cancelled: 'badge bg-secondary-subtle text-secondary',
};

const statusLabels: Record<ExpenseStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  reimbursed: 'Reimbursed',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
};

const categoryLabels: Record<ExpenseCategory, string> = {
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

const paymentMethodLabels: Record<PaymentMethod, string> = {
  cash: 'Cash',
  'credit-card': 'Credit Card',
  'debit-card': 'Debit Card',
  'bank-transfer': 'Bank Transfer',
  paypal: 'PayPal',
  other: 'Other',
};

export default function ExpenseList({ expenses: initialExpenses, onExpensesChange, embedded }: ExpenseListProps) {
  const [internalExpenses, setInternalExpenses] = useState<Expense[]>(initialExpenses);
  const expenses = onExpensesChange ? initialExpenses : internalExpenses;
  const setExpenses = onExpensesChange
    ? (next: Expense[] | ((prev: Expense[]) => Expense[])) => {
        const v = typeof next === 'function' ? next(initialExpenses) : next;
        onExpensesChange(v);
      }
    : setInternalExpenses;
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ExpenseStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | 'all'>('all');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [showNewExpenseModal, setShowNewExpenseModal] = useState(false);
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    expenseNumber: '',
    vendor: '',
    category: 'other',
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    status: 'pending',
    paymentMethod: 'credit-card',
    description: '',
  });

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const matchesSearch =
        expense.expenseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || expense.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;
      const matchesDate = !dateFilter || expense.date === dateFilter;

      return matchesSearch && matchesStatus && matchesCategory && matchesDate;
    });
  }, [expenses, searchQuery, statusFilter, categoryFilter, dateFilter]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatCurrencyFull = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const pendingCount = filteredExpenses.filter((e) => e.status === 'pending').length;
  const approvedCount = filteredExpenses.filter((e) => e.status === 'approved').length;
  const reimbursedCount = filteredExpenses.filter((e) => e.status === 'reimbursed').length;
  const rejectedCount = filteredExpenses.filter((e) => e.status === 'rejected').length;

  const handleView = (expense: Expense) => {
    setSelectedExpense(expense);
    setShowViewModal(true);
  };

  const handleEdit = (expense: Expense) => {
    alert(`Edit expense: ${expense.expenseNumber}\n\nThis would open an edit form in a real application.`);
  };

  const handleDownload = (expense: Expense) => {
    const expenseContent = `
EXPENSE RECEIPT / INVOICE
${expense.expenseNumber}

Vendor: ${expense.vendor}
Category: ${categoryLabels[expense.category]}
Date: ${formatDate(expense.date)}
Status: ${statusLabels[expense.status]}
Payment Method: ${paymentMethodLabels[expense.paymentMethod]}

Description: ${expense.description || 'N/A'}

Amount: ${formatCurrencyFull(expense.amount)}
    `.trim();

    const blob = new Blob([expenseContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${expense.expenseNumber}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDeleteClick = (expense: Expense) => {
    setExpenseToDelete(expense);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    if (expenseToDelete) {
      setExpenses(expenses.filter((exp) => exp.id !== expenseToDelete.id));
      setShowDeleteConfirm(false);
      setExpenseToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setExpenseToDelete(null);
  };

  const generateExpenseNumber = () => {
    const year = new Date().getFullYear();
    const maxNumber = expenses.reduce((max, exp) => {
      const match = exp.expenseNumber.match(/EXP-(\d+)-(\d+)/);
      if (match && parseInt(match[1]) === year) {
        const num = parseInt(match[2]);
        return num > max ? num : max;
      }
      return max;
    }, 0);
    return `EXP-${year}-${String(maxNumber + 1).padStart(3, '0')}`;
  };

  const handleNewExpenseOpen = () => {
    const expenseNumber = generateExpenseNumber();
    const today = new Date();

    setNewExpense({
      expenseNumber,
      vendor: '',
      category: 'other',
      date: today.toISOString().split('T')[0],
      amount: 0,
      status: 'pending',
      paymentMethod: 'credit-card',
      description: '',
    });
    setShowNewExpenseModal(true);
  };

  const handleNewExpenseChange = (field: keyof Expense, value: string | number) => {
    setNewExpense((prev) => {
      if (field === 'amount') {
        if (typeof value === 'string') {
          const trimmed = value.trim();
          if (trimmed === '') return { ...prev, [field]: undefined };
          const parsed = parseFloat(trimmed);
          return { ...prev, [field]: isNaN(parsed) ? undefined : parsed };
        }
        return { ...prev, [field]: value };
      }
      return { ...prev, [field]: value };
    });
  };

  const handleNewExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newExpense.vendor?.trim() || !newExpense.amount || Number(newExpense.amount) <= 0) {
      alert('Please fill in all required fields (Vendor and Amount greater than 0)');
      return;
    }

    const expense: Expense = {
      id: Date.now().toString(),
      expenseNumber: newExpense.expenseNumber?.trim() || generateExpenseNumber(),
      vendor: newExpense.vendor.trim(),
      category: (newExpense.category as ExpenseCategory) || 'other',
      date: newExpense.date || new Date().toISOString().split('T')[0],
      amount: Number(newExpense.amount),
      status: (newExpense.status as ExpenseStatus) || 'pending',
      paymentMethod: (newExpense.paymentMethod as PaymentMethod) || 'credit-card',
      description: newExpense.description?.trim() || '',
    };

    setExpenses([...expenses, expense]);
    setShowNewExpenseModal(false);
    setNewExpense({
      expenseNumber: '',
      vendor: '',
      category: 'other',
      date: new Date().toISOString().split('T')[0],
      amount: 0,
      status: 'pending',
      paymentMethod: 'credit-card',
      description: '',
    });
  };

  const handleNewExpenseCancel = () => {
    setShowNewExpenseModal(false);
    setNewExpense({
      expenseNumber: '',
      vendor: '',
      category: 'other',
      date: new Date().toISOString().split('T')[0],
      amount: 0,
      status: 'pending',
      paymentMethod: 'credit-card',
      description: '',
    });
  };

  const outerClass = embedded
    ? 'min-w-0 w-full'
    : 'min-h-screen bg-gray-50 pt-16';
  const innerClass = embedded
    ? 'min-w-0 w-full'
    : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8';

  return (
    <div className={outerClass}>
      <div className={innerClass}>
        {/* Premium Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Expenses</h1>
              <p className="text-sm text-gray-500">Track and manage your business expenses</p>
            </div>
          </div>
        </div>

        {/* Premium Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Total Expenses"
            value={formatCurrency(totalAmount)}
            subtitle={`${filteredExpenses.length} expenses`}
            icon={FileText}
            iconBg="bg-primary-50"
            trend={{ value: '+12.5%', isPositive: true }}
          />
          <StatCard
            title="Approved"
            value={formatCurrency(
              filteredExpenses
                .filter((e) => e.status === 'approved' || e.status === 'reimbursed')
                .reduce((sum, e) => sum + e.amount, 0)
            )}
            subtitle={`${approvedCount + reimbursedCount} expenses`}
            icon={CheckSquare}
            iconBg="bg-success-subtle"
            trend={{ value: '+8.2%', isPositive: true }}
          />
          <StatCard
            title="Pending"
            value={formatCurrency(
              filteredExpenses.filter((e) => e.status === 'pending').reduce((sum, e) => sum + e.amount, 0)
            )}
            subtitle={`${pendingCount} expenses`}
            icon={Clock}
            iconBg="bg-warning-subtle"
            trend={{ value: '+5.1%', isPositive: false }}
          />
          <StatCard
            title="Rejected"
            value={formatCurrency(
              filteredExpenses.filter((e) => e.status === 'rejected').reduce((sum, e) => sum + e.amount, 0)
            )}
            subtitle={`${rejectedCount} expenses`}
            icon={XOctagon}
            iconBg="bg-danger-subtle"
            trend={{ value: '+2.3%', isPositive: false }}
          />
        </div>

        {/* Premium Table Card */}
        <div className="card overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Expense Records</h2>
            <button
              type="button"
              onClick={handleNewExpenseOpen}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all font-medium shadow-sm hover:shadow-md"
            >
              <Plus className="w-4 h-4" />
              Add Expense
            </button>
          </div>

          {/* Premium Filters */}
          <div className="p-5 bg-gray-50/50 border-b border-gray-200">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
              <div className="lg:col-span-5 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  placeholder="Search expense, vendor, category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="lg:col-span-2">
                <input
                  type="date"
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
              </div>
              <div className="lg:col-span-2">
                <select
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as ExpenseStatus | 'all')}
                >
                  <option value="all">All Status</option>
                  {Object.entries(statusLabels).map(([status, label]) => (
                    <option key={status} value={status}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="lg:col-span-2">
                <select
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value as ExpenseCategory | 'all')}
                >
                  <option value="all">All Categories</option>
                  {Object.entries(categoryLabels).map(([category, label]) => (
                    <option key={category} value={category}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="lg:col-span-1">
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                  onClick={() => {
                    setSearchQuery('');
                    setDateFilter('');
                    setStatusFilter('all');
                    setCategoryFilter('all');
                  }}
                >
                  <Filter className="w-4 h-4" />
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Premium Table */}
          <Table>
            <TableHeader>
              <TableHeaderCell>Expense ID</TableHeaderCell>
              <TableHeaderCell>Vendor</TableHeaderCell>
              <TableHeaderCell>Category</TableHeaderCell>
              <TableHeaderCell>Date</TableHeaderCell>
              <TableHeaderCell align="right">Amount</TableHeaderCell>
              <TableHeaderCell>Payment</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell align="right">Actions</TableHeaderCell>
            </TableHeader>
            <TableBody>
              {filteredExpenses.length === 0 ? (
                <TableRow hover={false}>
                  <TableCell colSpan={8} className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-1">No expenses found</h3>
                    <p className="text-gray-500 text-sm">Try adjusting your filters or add a new expense.</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredExpenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>
                      <span className="font-semibold text-gray-900">{expense.expenseNumber}</span>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-gray-900">{expense.vendor}</div>
                      {expense.description && (
                        <div className="text-gray-500 text-xs mt-0.5 truncate max-w-[200px]">
                          {expense.description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-700">{categoryLabels[expense.category]}</TableCell>
                    <TableCell className="text-gray-700">{formatDate(expense.date)}</TableCell>
                    <TableCell align="right">
                      <span className="font-semibold text-gray-900 currency">{formatCurrencyFull(expense.amount)}</span>
                    </TableCell>
                    <TableCell className="text-gray-700">{paymentMethodLabels[expense.paymentMethod]}</TableCell>
                    <TableCell>
                      <span className={statusColors[expense.status]}>{statusLabels[expense.status]}</span>
                    </TableCell>
                    <TableCell align="right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleView(expense)}
                          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEdit(expense)}
                          className="p-2 text-gray-400 hover:text-success hover:bg-success-subtle rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownload(expense)}
                          className="p-2 text-gray-400 hover:text-info hover:bg-info-subtle rounded-lg transition-colors"
                          title="Download invoice"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(expense)}
                          className="p-2 text-gray-400 hover:text-danger hover:bg-danger-subtle rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Premium View Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedExpense(null);
        }}
        title={selectedExpense ? 'Expense Details' : ''}
        size="lg"
        footer={
          <>
            <button
              type="button"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-colors"
              onClick={() => {
                setShowViewModal(false);
                setSelectedExpense(null);
              }}
            >
              Close
            </button>
            {selectedExpense && (
              <button
                type="button"
                className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 flex items-center gap-2 font-medium shadow-sm transition-all"
                onClick={() => handleDownload(selectedExpense)}
              >
                <Download className="w-4 h-4" />
                Download invoice
              </button>
            )}
          </>
        }
      >
        {selectedExpense && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1.5">Expense Number</p>
                <p className="font-semibold text-gray-900">{selectedExpense.expenseNumber}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1.5">Status</p>
                <span className={statusColors[selectedExpense.status]}>{statusLabels[selectedExpense.status]}</span>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1.5">Date</p>
                <p className="font-semibold text-gray-900">{formatDate(selectedExpense.date)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1.5">Category</p>
                <p className="font-semibold text-gray-900">{categoryLabels[selectedExpense.category]}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1.5">Payment Method</p>
                <p className="font-semibold text-gray-900">{paymentMethodLabels[selectedExpense.paymentMethod]}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1.5">Vendor</p>
                <p className="font-semibold text-gray-900">{selectedExpense.vendor}</p>
              </div>
              {selectedExpense.description && (
                <div className="col-span-2">
                  <p className="text-xs font-medium text-gray-500 mb-1.5">Description</p>
                  <p className="font-semibold text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedExpense.description}</p>
                </div>
              )}
              <div className="col-span-2 border-t border-gray-200 pt-4 flex justify-between items-center">
                <p className="font-semibold text-gray-900">Total Amount</p>
                <span className="text-2xl font-bold text-gray-900 currency">
                  {formatCurrencyFull(selectedExpense.amount)}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Premium Delete Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={handleDeleteCancel}
        size="sm"
        footer={
          <>
            <button
              type="button"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-colors flex items-center gap-2"
              onClick={handleDeleteCancel}
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-danger text-white rounded-xl hover:opacity-90 transition-opacity font-medium"
              onClick={handleDeleteConfirm}
            >
              Yes, delete
            </button>
          </>
        }
      >
        <div className="text-center py-4">
          <XOctagon className="w-16 h-16 text-danger mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Delete this expense?</h3>
          <p className="text-gray-500">
            This will remove the expense from your list. This action cannot be undone.
          </p>
        </div>
      </Modal>

      {/* Premium New Expense Modal */}
      <Modal
        isOpen={showNewExpenseModal}
        onClose={handleNewExpenseCancel}
        title="Add New Expense"
        size="xl"
        footer={
          <>
            <button
              type="button"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-colors"
              onClick={handleNewExpenseCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="new-expense-form"
              className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-medium shadow-sm transition-all"
            >
              Add Expense
            </button>
          </>
        }
      >
        <form id="new-expense-form" onSubmit={handleNewExpenseSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Expense Number <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                value={newExpense.expenseNumber}
                onChange={(e) => handleNewExpenseChange('expenseNumber', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Status <span className="text-danger">*</span>
              </label>
              <select
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                value={newExpense.status}
                onChange={(e) => handleNewExpenseChange('status', e.target.value)}
                required
              >
                {Object.entries(statusLabels).map(([status, label]) => (
                  <option key={status} value={status}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Vendor / Merchant <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                value={newExpense.vendor}
                onChange={(e) => handleNewExpenseChange('vendor', e.target.value)}
                placeholder="e.g. Starbucks, Uber, Amazon"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category <span className="text-danger">*</span>
              </label>
              <select
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                value={newExpense.category}
                onChange={(e) => handleNewExpenseChange('category', e.target.value)}
                required
              >
                {Object.entries(categoryLabels).map(([category, label]) => (
                  <option key={category} value={category}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date <span className="text-danger">*</span>
              </label>
              <input
                type="date"
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                value={newExpense.date}
                onChange={(e) => handleNewExpenseChange('date', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Payment Method <span className="text-danger">*</span>
              </label>
              <select
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                value={newExpense.paymentMethod}
                onChange={(e) => handleNewExpenseChange('paymentMethod', e.target.value)}
                required
              >
                {Object.entries(paymentMethodLabels).map(([method, label]) => (
                  <option key={method} value={method}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Amount ($) <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all currency"
                value={newExpense.amount !== undefined && newExpense.amount !== null ? String(newExpense.amount) : ''}
                onChange={(e) => handleNewExpenseChange('amount', e.target.value)}
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <textarea
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none"
                rows={3}
                value={newExpense.description}
                onChange={(e) => handleNewExpenseChange('description', e.target.value)}
                placeholder="Enter expense description..."
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
