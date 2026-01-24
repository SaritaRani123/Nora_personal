'use client';

import { useState, useMemo } from 'react';
import { Search, Plus, Filter, Download, Eye, FileText, X } from 'lucide-react';
import type { Invoice, InvoiceStatus, InvoiceLineItem } from '@/types/invoice';
import { mockInvoicesData } from '@/data/mockInvoicesData';

const statusConfig: Record<InvoiceStatus, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-secondary-subtle text-secondary' },
  sent: { label: 'Sent', className: 'bg-info-subtle text-info' },
  paid: { label: 'Paid', className: 'bg-success-subtle text-success' },
  overdue: { label: 'Overdue', className: 'bg-danger-subtle text-danger' },
};

export default function InvoicePage() {
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoicesData);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formClient, setFormClient] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formIssueDate, setFormIssueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [formDueDate, setFormDueDate] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formTerms, setFormTerms] = useState('Net 15');
  const [formItems, setFormItems] = useState<InvoiceLineItem[]>([{ description: '', amount: 0 }]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchSearch =
        inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.clientName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'all' || inv.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [invoices, searchQuery, statusFilter]);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const generateInvoiceNumber = () => {
    const year = new Date().getFullYear();
    const max = invoices.reduce((m, i) => {
      const match = i.invoiceNumber.match(/INV-(\d+)-(\d+)/);
      if (match && parseInt(match[1]) === year) {
        const n = parseInt(match[2]);
        return n > m ? n : m;
      }
      return m;
    }, 0);
    return `INV-${year}-${String(max + 1).padStart(3, '0')}`;
  };

  const handleView = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setShowViewModal(true);
  };

  const handleDownload = (inv: Invoice) => {
    const lines = [
      `INVOICE ${inv.invoiceNumber}`,
      `Client: ${inv.clientName}${inv.clientEmail ? ` (${inv.clientEmail})` : ''}`,
      `Issue date: ${formatDate(inv.issueDate)}`,
      inv.dueDate ? `Due date: ${formatDate(inv.dueDate)}` : '',
      inv.paymentTerms ? `Payment terms: ${inv.paymentTerms}` : '',
      '',
      'Line items:',
      ...inv.lineItems.map((i) => `  ${i.description}: ${formatCurrency(i.amount)}`),
      '',
      `Total: ${formatCurrency(inv.amount)}`,
      inv.notes ? `\nNotes: ${inv.notes}` : '',
    ].filter(Boolean);

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${inv.invoiceNumber}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const addFormItem = () => {
    setFormItems((prev) => [...prev, { description: '', amount: 0 }]);
  };

  const updateFormItem = (index: number, field: 'description' | 'amount', value: string | number) => {
    setFormItems((prev) => {
      const next = [...prev];
      if (field === 'amount') next[index] = { ...next[index], amount: Number(value) || 0 };
      else next[index] = { ...next[index], description: String(value) };
      return next;
    });
  };

  const removeFormItem = (index: number) => {
    if (formItems.length <= 1) return;
    setFormItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formClient.trim()) return;
    const items = formItems.filter((i) => i.description.trim() && i.amount > 0);
    if (items.length === 0) return;
    const amount = items.reduce((s, i) => s + i.amount, 0);
    const due = formDueDate || formIssueDate;

    const newInv: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: generateInvoiceNumber(),
      clientName: formClient.trim(),
      clientEmail: formEmail.trim() || undefined,
      amount,
      status: 'draft',
      issueDate: formIssueDate,
      dueDate: due,
      lineItems: items,
      notes: formNotes.trim() || undefined,
      paymentTerms: formTerms.trim() || undefined,
    };

    setInvoices((prev) => [newInv, ...prev]);
    setShowCreateModal(false);
    setFormClient('');
    setFormEmail('');
    setFormIssueDate(new Date().toISOString().split('T')[0]);
    setFormDueDate('');
    setFormNotes('');
    setFormTerms('Net 15');
    setFormItems([{ description: '', amount: 0 }]);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
  };

  const totalAmount = filteredInvoices.reduce((s, i) => s + i.amount, 0);
  const paidCount = filteredInvoices.filter((i) => i.status === 'paid').length;
  const sentCount = filteredInvoices.filter((i) => i.status === 'sent').length;
  const draftCount = filteredInvoices.filter((i) => i.status === 'draft').length;

  return (
    <div className="min-w-0 w-full">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 sm:mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Create, send, and track invoices — Momenteo-style
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-600 font-medium"
          >
            <Plus className="w-4 h-4" />
            Create invoice
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <p className="text-xs font-medium text-gray-500 uppercase">Total</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(totalAmount)}</p>
            <p className="text-xs text-gray-500 mt-1">{filteredInvoices.length} invoices</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <p className="text-xs font-medium text-gray-500 uppercase">Paid</p>
            <p className="text-xl font-bold text-success mt-1">{paidCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <p className="text-xs font-medium text-gray-500 uppercase">Sent</p>
            <p className="text-xl font-bold text-info mt-1">{sentCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <p className="text-xs font-medium text-gray-500 uppercase">Draft</p>
            <p className="text-xl font-bold text-secondary mt-1">{draftCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-w-0">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-0 sm:min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by invoice # or client..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as InvoiceStatus | 'all')}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="all">All status</option>
              {Object.entries(statusConfig).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={resetFilters}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
            >
              <Filter className="w-4 h-4" /> Reset
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Invoice #</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Issue date</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      No invoices match your filters. Create one to get started.
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{inv.invoiceNumber}</td>
                      <td className="px-6 py-4">
                        <div>{inv.clientName}</div>
                        {inv.clientEmail && (
                          <div className="text-xs text-gray-500">{inv.clientEmail}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900">{formatCurrency(inv.amount)}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-md text-xs font-semibold ${statusConfig[inv.status].className}`}
                        >
                          {statusConfig[inv.status].label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{formatDate(inv.issueDate)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleView(inv)}
                            className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDownload(inv)}
                            className="p-2 text-gray-400 hover:text-info hover:bg-info/10 rounded-lg"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
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

      {/* View modal */}
      {showViewModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                Invoice {selectedInvoice.invoiceNumber}
              </h2>
              <button
                type="button"
                onClick={() => { setShowViewModal(false); setSelectedInvoice(null); }}
                className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Client</p>
                  <p className="font-medium text-gray-900">{selectedInvoice.clientName}</p>
                  {selectedInvoice.clientEmail && (
                    <p className="text-sm text-gray-600">{selectedInvoice.clientEmail}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <span
                    className={`inline-flex px-2.5 py-1 rounded-md text-xs font-semibold ${statusConfig[selectedInvoice.status].className}`}
                  >
                    {statusConfig[selectedInvoice.status].label}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Issue date</p>
                  <p className="font-medium text-gray-900">{formatDate(selectedInvoice.issueDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Due date</p>
                  <p className="font-medium text-gray-900">
                    {selectedInvoice.dueDate ? formatDate(selectedInvoice.dueDate) : '—'}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-2">Line items</p>
                <ul className="border border-gray-200 rounded-lg divide-y divide-gray-200">
                  {selectedInvoice.lineItems.map((item, i) => (
                    <li key={i} className="px-4 py-3 flex justify-between">
                      <span className="text-gray-700">{item.description}</span>
                      <span className="font-medium text-gray-900">{formatCurrency(item.amount)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="text-xl font-bold text-gray-900">
                  {formatCurrency(selectedInvoice.amount)}
                </span>
              </div>
              {selectedInvoice.notes && (
                <div>
                  <p className="text-xs text-gray-500">Notes</p>
                  <p className="text-gray-700">{selectedInvoice.notes}</p>
                </div>
              )}
            </div>
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => { setShowViewModal(false); setSelectedInvoice(null); }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => handleDownload(selectedInvoice)}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Download
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Create invoice</h2>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client name *</label>
                  <input
                    type="text"
                    value={formClient}
                    onChange={(e) => setFormClient(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client email</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Issue date *</label>
                  <input
                    type="date"
                    value={formIssueDate}
                    onChange={(e) => setFormIssueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due date</label>
                  <input
                    type="date"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment terms</label>
                  <input
                    type="text"
                    value={formTerms}
                    onChange={(e) => setFormTerms(e.target.value)}
                    placeholder="e.g. Net 15"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Line items *</label>
                  <button
                    type="button"
                    onClick={addFormItem}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    + Add line
                  </button>
                </div>
                <div className="space-y-2">
                  {formItems.map((item, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateFormItem(i, 'description', e.target.value)}
                        placeholder="Description"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.amount || ''}
                        onChange={(e) => updateFormItem(i, 'amount', e.target.value)}
                        placeholder="Amount"
                        className="w-28 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                      <button
                        type="button"
                        onClick={() => removeFormItem(i)}
                        className="p-2 text-gray-400 hover:text-danger hover:bg-danger/10 rounded-lg"
                        disabled={formItems.length <= 1}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600"
                >
                  Create invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
