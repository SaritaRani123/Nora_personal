'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Expense, ExpenseStatus, ExpenseCategory, PaymentMethod } from '@/types/invoice';
import { Search, Plus, Filter, Download, Eye, Edit, Trash2, X, FileText, ArrowUpRight, ArrowDownRight, Clock, CheckSquare, XOctagon } from 'lucide-react';

interface ExpenseListProps {
  expenses: Expense[];
  onExpensesChange?: (expenses: Expense[]) => void;
  embedded?: boolean;
}

const statusColors: Record<ExpenseStatus, string> = {
  pending: 'bg-warning-subtle text-warning',
  approved: 'bg-info-subtle text-info',
  reimbursed: 'bg-success-subtle text-success',
  rejected: 'bg-danger-subtle text-danger',
  cancelled: 'bg-secondary-subtle text-secondary',
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
        {/* Page Title & Breadcrumb */}
        <div className="mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Expense List</h1>
            <nav className="flex items-center space-x-2 text-sm" aria-label="Breadcrumb">
              <Link href="/" className="text-gray-500 hover:text-primary-600 transition-colors">
                Home
              </Link>
              <span className="text-gray-400">/</span>
              <Link href="/expenses" className="text-gray-500 hover:text-primary-600 transition-colors">
                Expenses
              </Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 font-medium">Expense List</span>
            </nav>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow p-4">
            <div className="flex items-center mb-3">
              <div className="flex-grow">
                <p className="uppercase font-medium text-gray-500 text-xs">Total Expenses</p>
              </div>
              <span className="text-success text-sm flex items-center">
                <ArrowUpRight className="w-3 h-3 inline mr-1" /> +12.5%
              </span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  ${totalAmount >= 1000 ? (totalAmount / 1000).toFixed(2) + 'k' : totalAmount.toFixed(2)}
                </h2>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-warning text-warning-800 mr-1">
                  {filteredExpenses.length}
                </span>
                <span className="text-gray-500 text-sm">Filtered expenses</span>
              </div>
              <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow p-4">
            <div className="flex items-center mb-3">
              <div className="flex-grow">
                <p className="uppercase font-medium text-gray-500 text-xs">Approved Expenses</p>
              </div>
              <span className="text-success text-sm flex items-center">
                <ArrowUpRight className="w-3 h-3 inline mr-1" /> +8.2%
              </span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  $
                  {(
                    filteredExpenses
                      .filter((e) => e.status === 'approved' || e.status === 'reimbursed')
                      .reduce((sum, e) => sum + e.amount, 0) / 1000
                  ).toFixed(2)}
                  k
                </h2>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-warning text-warning-800 mr-1">
                  {approvedCount + reimbursedCount}
                </span>
                <span className="text-gray-500 text-sm">Approved</span>
              </div>
              <div className="w-12 h-12 bg-success-subtle rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckSquare className="w-6 h-6 text-success" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow p-4">
            <div className="flex items-center mb-3">
              <div className="flex-grow">
                <p className="uppercase font-medium text-gray-500 text-xs">Pending Expenses</p>
              </div>
              <span className="text-danger text-sm flex items-center">
                <ArrowDownRight className="w-3 h-3 inline mr-1" /> +5.1%
              </span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  $
                  {(filteredExpenses.filter((e) => e.status === 'pending').reduce((sum, e) => sum + e.amount, 0) / 1000).toFixed(
                    2
                  )}
                  k
                </h2>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-warning text-warning-800 mr-1">
                  {pendingCount}
                </span>
                <span className="text-gray-500 text-sm">Pending</span>
              </div>
              <div className="w-12 h-12 bg-warning-subtle rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-warning" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow p-4">
            <div className="flex items-center mb-3">
              <div className="flex-grow">
                <p className="uppercase font-medium text-gray-500 text-xs">Rejected Expenses</p>
              </div>
              <span className="text-success text-sm flex items-center">
                <ArrowUpRight className="w-3 h-3 inline mr-1" /> +2.3%
              </span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  $
                  {(filteredExpenses.filter((e) => e.status === 'rejected').reduce((sum, e) => sum + e.amount, 0) / 1000).toFixed(
                    2
                  )}
                  k
                </h2>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-warning text-warning-800 mr-1">
                  {rejectedCount}
                </span>
                <span className="text-gray-500 text-sm">Rejected</span>
              </div>
              <div className="w-12 h-12 bg-danger-subtle rounded-lg flex items-center justify-center flex-shrink-0">
                <XOctagon className="w-6 h-6 text-danger" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Expenses</h2>
            <button
              type="button"
              onClick={handleNewExpenseOpen}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Expense
            </button>
          </div>

          {/* Filters */}
          <div className="p-4 bg-gray-50 border-b border-dashed border-gray-300">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
              <div className="lg:col-span-5 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="Search expense, vendor, category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="lg:col-span-2">
                <input
                  type="date"
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
              </div>
              <div className="lg:col-span-2">
                <select
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
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
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
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
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
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

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Expense ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 px-4">
                      <FileText className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                      <h3 className="font-semibold text-gray-900 mb-1">No expenses found</h3>
                      <p className="text-gray-500 text-sm">Try adjusting your filters or add a new expense.</p>
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {expense.expenseNumber}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{expense.vendor}</div>
                          {expense.description && (
                            <div className="text-gray-500 text-sm truncate max-w-[200px]">
                              {expense.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                        {categoryLabels[expense.category]}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                        {formatDate(expense.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-gray-900">
                        {formatCurrencyFull(expense.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                        {paymentMethodLabels[expense.paymentMethod]}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${statusColors[expense.status]}`}
                        >
                          {statusLabels[expense.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleView(expense)}
                            className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEdit(expense)}
                            className="p-2 text-gray-400 hover:text-success hover:bg-success/10 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDownload(expense)}
                            className="p-2 text-gray-400 hover:text-info hover:bg-info/10 rounded-lg transition-colors"
                            title="Download invoice"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(expense)}
                            className="p-2 text-gray-400 hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* View Modal */}
      {showViewModal && selectedExpense && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Expense Details</h2>
              <button
                type="button"
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedExpense(null);
                }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Expense Number</p>
                  <p className="font-semibold text-gray-900">{selectedExpense.expenseNumber}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">Status</p>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${statusColors[selectedExpense.status]}`}
                  >
                    {statusLabels[selectedExpense.status]}
                  </span>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">Date</p>
                  <p className="font-semibold text-gray-900">{formatDate(selectedExpense.date)}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">Category</p>
                  <p className="font-semibold text-gray-900">{categoryLabels[selectedExpense.category]}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">Payment Method</p>
                  <p className="font-semibold text-gray-900">
                    {paymentMethodLabels[selectedExpense.paymentMethod]}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">Vendor</p>
                  <p className="font-semibold text-gray-900">{selectedExpense.vendor}</p>
                </div>
                {selectedExpense.description && (
                  <div className="col-span-2">
                    <p className="text-gray-500 text-sm mb-1">Description</p>
                    <p className="font-semibold text-gray-900">{selectedExpense.description}</p>
                  </div>
                )}
                <div className="col-span-2 border-t border-gray-200 pt-4 flex justify-between items-center">
                  <p className="font-semibold text-gray-900">Total Amount</p>
                  <span className="text-2xl font-bold text-gray-900">
                    {formatCurrencyFull(selectedExpense.amount)}
                  </span>
                </div>
              </div>
            </div>
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedExpense(null);
                }}
              >
                Close
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2"
                onClick={() => handleDownload(selectedExpense)}
              >
                <Download className="w-4 h-4" />
                Download invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteConfirm && expenseToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 text-center">
            <XOctagon className="w-16 h-16 text-danger mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Delete this expense?</h3>
            <p className="text-gray-500 mb-6">
              This will remove the expense from your list. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
                onClick={handleDeleteCancel}
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-danger text-white rounded-lg hover:opacity-90 transition-opacity"
                onClick={handleDeleteConfirm}
              >
                Yes, delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Expense Modal */}
      {showNewExpenseModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Add New Expense</h2>
              <button
                type="button"
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={handleNewExpenseCancel}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleNewExpenseSubmit}>
              <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Expense Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
                    value={newExpense.expenseNumber}
                    onChange={(e) => handleNewExpenseChange('expenseNumber', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
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
                    Vendor / Merchant <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
                    value={newExpense.vendor}
                    onChange={(e) => handleNewExpenseChange('vendor', e.target.value)}
                    placeholder="e.g. Starbucks, Uber, Amazon"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
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
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
                    value={newExpense.date}
                    onChange={(e) => handleNewExpenseChange('date', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Payment Method <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
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
                    Amount ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
                    value={newExpense.amount !== undefined && newExpense.amount !== null ? String(newExpense.amount) : ''}
                    onChange={(e) => handleNewExpenseChange('amount', e.target.value)}
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
                    rows={3}
                    value={newExpense.description}
                    onChange={(e) => handleNewExpenseChange('description', e.target.value)}
                    placeholder="Enter expense description..."
                  />
                </div>
              </div>
              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  onClick={handleNewExpenseCancel}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
                >
                  Add Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
