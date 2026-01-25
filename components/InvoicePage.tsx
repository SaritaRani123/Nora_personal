'use client';

import { useState, useMemo } from 'react';
import React from 'react';
import { Search, Plus, Filter, Download, Eye, FileText, X, DollarSign, CheckCircle, Send, FileEdit, Share2, Save } from 'lucide-react';
import type { Invoice, InvoiceStatus, InvoiceLineItem } from '@/types/invoice';
import { useCalendar } from '@/app/context/CalendarContext';
import { useClients } from '@/app/context/ClientsContext';
import { computeInvoiceTotals } from '@/lib/invoiceTotals';
import { downloadInvoicePDF, shareInvoice, sendInvoice, applyLateFees } from '@/lib/invoiceActions';
import StatCard from '@/ui/StatCard';
import Modal from '@/ui/Modal';
import { Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '@/ui/Table';

const statusConfig: Record<InvoiceStatus, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'badge bg-secondary-subtle text-secondary' },
  sent: { label: 'Sent', className: 'badge bg-info-subtle text-info' },
  paid: { label: 'Paid', className: 'badge bg-success-subtle text-success' },
  overdue: { label: 'Overdue', className: 'badge bg-danger-subtle text-danger' },
};

export default function InvoicePage() {
  const calendar = useCalendar();
  const clients = useClients();
  const invoices = calendar.invoices;
  const setInvoices = calendar.setInvoices;
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [formClientId, setFormClientId] = useState('');
  const [formClient, setFormClient] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formIssueDate, setFormIssueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [formDueDate, setFormDueDate] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formTerms, setFormTerms] = useState('Net 15');
  const [formItems, setFormItems] = useState<InvoiceLineItem[]>([{ description: '', amount: 0 }]);
  // Discount and late fee fields
  const [formDiscountEnabled, setFormDiscountEnabled] = useState(false);
  const [formDiscountPercent, setFormDiscountPercent] = useState(0);
  const [formLateFeeEnabled, setFormLateFeeEnabled] = useState(false);
  const [formFeePercent, setFormFeePercent] = useState(0);
  const [formApplyEveryXDays, setFormApplyEveryXDays] = useState(30);
  
  // Check for calendar pre-fill
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const calendarDate = urlParams.get('date');
    const shouldCreate = urlParams.get('create') === 'true';
    
    if (shouldCreate && calendarDate) {
      setFormIssueDate(calendarDate);
      setShowCreateModal(true);
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

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

  const handleDownloadText = (inv: Invoice) => {
    const totals = computeInvoiceTotals(inv);
    const lines = [
      `INVOICE ${inv.invoiceNumber}`,
      `Client: ${inv.clientName}${inv.clientEmail ? ` (${inv.clientEmail})` : ''}`,
      `Issue date: ${formatDate(inv.issueDate)}`,
      inv.dueDate ? `Due date: ${formatDate(inv.dueDate)}` : '',
      inv.paymentTerms ? `Payment terms: ${inv.paymentTerms}` : '',
      '',
      'Line items:',
      ...inv.lineItems.map((i) => {
        const lineTotal = (i.quantity || 1) * (i.unitPrice || i.amount || 0);
        return `  ${i.description}: ${formatCurrency(lineTotal)}${i.taxPercent ? ` (Tax: ${i.taxPercent}%)` : ''}`;
      }),
      '',
      `Subtotal: ${formatCurrency(totals.subtotal)}`,
      totals.discountAmount > 0 ? `Discount: -${formatCurrency(totals.discountAmount)}` : '',
      totals.taxTotal > 0 ? `Tax: ${formatCurrency(totals.taxTotal)}` : '',
      totals.lateFeeAccrued > 0 ? `Late Fee: ${formatCurrency(totals.lateFeeAccrued)}` : '',
      `Grand Total: ${formatCurrency(totals.grandTotal)}`,
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
    setFormItems((prev) => [...prev, { description: '', amount: 0, quantity: 1, unitPrice: 0, taxPercent: 0 }]);
  };

  const updateFormItem = (index: number, field: keyof InvoiceLineItem, value: string | number) => {
    setFormItems((prev) => {
      const next = [...prev];
      const item = next[index];
      
      if (field === 'quantity' || field === 'unitPrice' || field === 'taxPercent') {
        next[index] = { ...item, [field]: Number(value) || 0 };
        // Auto-calculate amount if quantity and unitPrice are set
        if (field === 'quantity' || field === 'unitPrice') {
          const qty = field === 'quantity' ? Number(value) || 0 : (item.quantity || 1);
          const price = field === 'unitPrice' ? Number(value) || 0 : (item.unitPrice || 0);
          next[index] = { ...item, [field]: Number(value) || 0, amount: qty * price };
        }
      } else if (field === 'amount') {
        next[index] = { ...item, amount: Number(value) || 0 };
      } else {
        next[index] = { ...item, [field]: String(value) };
      }
      return next;
    });
  };

  const removeFormItem = (index: number) => {
    if (formItems.length <= 1) return;
    setFormItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Compute totals for current form
  const formTotals = useMemo(() => {
    const tempInvoice: Invoice = {
      id: 'temp',
      invoiceNumber: 'TEMP',
      clientName: formClient,
      amount: 0,
      status: 'draft',
      issueDate: formIssueDate,
      dueDate: formDueDate || formIssueDate,
      lineItems: formItems,
      discountEnabled: formDiscountEnabled,
      discountPercent: formDiscountPercent,
      lateFeeEnabled: formLateFeeEnabled,
      feePercent: formFeePercent,
      applyEveryXDays: formApplyEveryXDays,
    };
    return computeInvoiceTotals(tempInvoice);
  }, [formItems, formDiscountEnabled, formDiscountPercent, formLateFeeEnabled, formFeePercent, formApplyEveryXDays, formDueDate, formIssueDate, formClient]);

  const handleCreateSubmit = async (e: React.FormEvent, action: 'draft' | 'send' = 'draft') => {
    e.preventDefault();
    
    // Validate client - require either selected client or manual entry
    if (!formClientId && !formClient.trim()) {
      if (clients.clients.length === 0) {
        alert('Please add at least one client before creating an invoice. You can add clients from the Clients page.');
      } else {
        alert('Please select a client or enter a client name.');
      }
      return;
    }
    
    // Validate line items
    const items = formItems.filter((i) => {
      if (i.quantity && i.unitPrice) {
        return i.description.trim() && i.quantity > 0 && i.unitPrice > 0;
      }
      return i.description.trim() && i.amount > 0;
    });
    
    if (items.length === 0) {
      alert('Please add at least one line item');
      return;
    }

    const due = formDueDate || formIssueDate;
    const selectedClient = formClientId ? clients.getClientById(formClientId) : null;

    // Check if coming from calendar (URL params)
    const urlParams = new URLSearchParams(window.location.search);
    const calendarDate = urlParams.get('date');
    const isFromCalendar = urlParams.get('create') === 'true';
    
    const newInv: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: generateInvoiceNumber(),
      clientId: formClientId || undefined,
      clientName: selectedClient?.name || formClient.trim(),
      clientEmail: selectedClient?.email || formEmail.trim() || undefined,
      amount: formTotals.grandTotal, // Use computed grand total
      status: action === 'send' ? 'sent' : 'draft',
      issueDate: calendarDate || formIssueDate, // Use calendar date if provided
      dueDate: due,
      lineItems: items,
      notes: formNotes.trim() || undefined,
      paymentTerms: formTerms.trim() || undefined,
      discountEnabled: formDiscountEnabled,
      discountPercent: formDiscountPercent || undefined,
      lateFeeEnabled: formLateFeeEnabled,
      feePercent: formFeePercent || undefined,
      applyEveryXDays: formApplyEveryXDays || undefined,
    };
    
    // Create calendar event linked to invoice if created from calendar
    if (isFromCalendar) {
      const calendarEventId = `cal-event-${Date.now()}`;
      newInv.calendarEventId = calendarEventId;
      // Note: Calendar event creation would be handled by CalendarContext
      // For now, the invoice is linked via calendarEventId field
    }

    // If sending, call send API
    if (action === 'send') {
      try {
        await sendInvoice(newInv.id, newInv.clientEmail);
      } catch (error) {
        console.error('Failed to send invoice:', error);
        alert('Invoice saved but failed to send. Please try again.');
      }
    }

    setInvoices([newInv, ...invoices]);
    
    // Create calendar event for invoice
    if (newInv.status === 'sent' || newInv.status === 'paid') {
      // Calendar will automatically show invoices based on status
      // Income entry is created when invoice status is 'paid'
    }
    
    setShowCreateModal(false);
    resetForm();
  };

  const resetForm = () => {
    setFormClientId('');
    setFormClient('');
    setFormEmail('');
    setFormIssueDate(new Date().toISOString().split('T')[0]);
    setFormDueDate('');
    setFormNotes('');
    setFormTerms('Net 15');
    setFormItems([{ description: '', amount: 0 }]);
    setFormDiscountEnabled(false);
    setFormDiscountPercent(0);
    setFormLateFeeEnabled(false);
    setFormFeePercent(0);
    setFormApplyEveryXDays(30);
  };

  const handleDownloadPDF = async (invoice: Invoice) => {
    try {
      await downloadInvoicePDF(invoice.id);
    } catch (error) {
      console.error('PDF download failed:', error);
      alert('Failed to download PDF. Please try again.');
    }
  };

  const handleShare = async (invoice: Invoice) => {
    try {
      const shareUrl = await shareInvoice(invoice.id, invoice.clientEmail);
      navigator.clipboard.writeText(shareUrl);
      alert('Share link copied to clipboard!');
    } catch (error) {
      console.error('Share failed:', error);
      alert('Failed to generate share link. Please try again.');
    }
  };

  const handleApplyFees = (invoice: Invoice) => {
    if (!confirm('Apply late fees to this invoice? This will add a late fee line item.')) {
      return;
    }
    
    const totals = computeInvoiceTotals(invoice);
    const updated = applyLateFees(invoice, totals);
    setInvoices(invoices.map((inv) => (inv.id === invoice.id ? updated : inv)));
    setSelectedInvoice(updated);
    alert('Late fees applied successfully.');
  };

  const handleCreateClick = () => {
    if (clients.clients.length === 0) {
      alert('Please add at least one client before creating an invoice. You can add clients from the Clients page.');
      // Optionally redirect to clients page
      // window.location.href = '/clients';
      return;
    }
    setShowCreateModal(true);
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
    <div className="min-w-0 w-full space-y-6">
      {/* Premium Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Invoices</h1>
          <p className="text-sm text-gray-500">
            Create, send, and track your invoices with ease
          </p>
        </div>
        <button
          type="button"
          onClick={handleCreateClick}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-medium shadow-sm hover:shadow-md transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          Create invoice
        </button>
      </div>

      {/* Premium Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Value"
          value={formatCurrency(totalAmount)}
          subtitle={`${filteredInvoices.length} invoices`}
          icon={DollarSign}
          iconBg="bg-primary-50"
        />
        <StatCard
          title="Paid"
          value={paidCount}
          subtitle="Completed invoices"
          icon={CheckCircle}
          iconBg="bg-success-subtle"
        />
        <StatCard
          title="Sent"
          value={sentCount}
          subtitle="Awaiting payment"
          icon={Send}
          iconBg="bg-info-subtle"
        />
        <StatCard
          title="Draft"
          value={draftCount}
          subtitle="In progress"
          icon={FileEdit}
          iconBg="bg-secondary-subtle"
        />
      </div>

      {/* Premium Table Card */}
      <div className="card overflow-hidden">
        {/* Premium Filters */}
        <div className="p-5 bg-gray-50/50 border-b border-gray-200 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-0 sm:min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by invoice # or client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as InvoiceStatus | 'all')}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
          >
            <option value="all">All status</option>
            {Object.entries(statusConfig).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={resetFilters}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm hover:bg-gray-50 transition-colors font-medium"
          >
            <Filter className="w-4 h-4" /> Reset
          </button>
        </div>

        {/* Premium Table */}
        <Table>
          <TableHeader>
            <TableHeaderCell>Invoice #</TableHeaderCell>
            <TableHeaderCell>Client</TableHeaderCell>
            <TableHeaderCell align="right">Amount</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell>Issue date</TableHeaderCell>
            <TableHeaderCell align="right">Actions</TableHeaderCell>
          </TableHeader>
          <TableBody>
            {filteredInvoices.length === 0 ? (
              <TableRow hover={false}>
                <TableCell colSpan={6} className="text-center py-12">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500 font-medium">No invoices match your filters.</p>
                  <p className="text-sm text-gray-400 mt-1">Create one to get started.</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredInvoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell>
                    <span className="font-semibold text-gray-900">{inv.invoiceNumber}</span>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-gray-900">{inv.clientName}</div>
                    {inv.clientEmail && (
                      <div className="text-xs text-gray-500 mt-0.5">{inv.clientEmail}</div>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <span className="font-semibold text-gray-900 currency">{formatCurrency(inv.amount)}</span>
                  </TableCell>
                  <TableCell>
                    <span className={statusConfig[inv.status].className}>
                      {statusConfig[inv.status].label}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-600">{formatDate(inv.issueDate)}</TableCell>
                  <TableCell align="right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => handleView(inv)}
                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadPDF(inv)}
                        className="p-2 text-gray-400 hover:text-info hover:bg-info-subtle rounded-lg transition-colors"
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleShare(inv)}
                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Share"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Premium View Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => { setShowViewModal(false); setSelectedInvoice(null); }}
        title={selectedInvoice ? `Invoice ${selectedInvoice.invoiceNumber}` : ''}
        size="lg"
        footer={
          <>
            <button
              type="button"
              onClick={() => { setShowViewModal(false); setSelectedInvoice(null); }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-colors"
            >
              Close
            </button>
            {selectedInvoice && (
              <>
                <button
                  type="button"
                  onClick={() => handleDownloadPDF(selectedInvoice)}
                  className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 flex items-center gap-2 font-medium shadow-sm transition-all"
                >
                  <Download className="w-4 h-4" /> Download PDF
                </button>
                <button
                  type="button"
                  onClick={() => handleShare(selectedInvoice)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 flex items-center gap-2 font-medium transition-all"
                >
                  <Share2 className="w-4 h-4" /> Share
                </button>
                {selectedInvoice.status === 'draft' && (
                  <button
                    type="button"
                    onClick={async () => {
                      const updated = { ...selectedInvoice, status: 'sent' as const };
                      setInvoices(invoices.map((inv) => (inv.id === selectedInvoice.id ? updated : inv)));
                      try {
                        await sendInvoice(selectedInvoice.id, selectedInvoice.clientEmail);
                        setSelectedInvoice(updated);
                        setShowViewModal(false);
                      } catch (error) {
                        console.error('Failed to send invoice:', error);
                        alert('Failed to send invoice. Please try again.');
                      }
                    }}
                    className="px-4 py-2 bg-success text-white rounded-xl hover:bg-green-600 flex items-center gap-2 font-medium transition-all"
                  >
                    <Send className="w-4 h-4" /> Save & Send
                  </button>
                )}
                {selectedInvoice.lateFeeEnabled && computeInvoiceTotals(selectedInvoice).lateFeeAccrued > 0 && (
                  <button
                    type="button"
                    onClick={() => handleApplyFees(selectedInvoice)}
                    className="px-4 py-2 bg-warning text-white rounded-xl hover:bg-amber-600 flex items-center gap-2 font-medium transition-all"
                  >
                    Apply Fees Now
                  </button>
                )}
              </>
            )}
          </>
        }
      >
        {selectedInvoice && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1.5">Client</p>
                <p className="font-semibold text-gray-900">{selectedInvoice.clientName}</p>
                {selectedInvoice.clientEmail && (
                  <p className="text-sm text-gray-600 mt-0.5">{selectedInvoice.clientEmail}</p>
                )}
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1.5">Status</p>
                <span className={statusConfig[selectedInvoice.status].className}>
                  {statusConfig[selectedInvoice.status].label}
                </span>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1.5">Issue date</p>
                <p className="font-semibold text-gray-900">{formatDate(selectedInvoice.issueDate)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1.5">Due date</p>
                <p className="font-semibold text-gray-900">
                  {selectedInvoice.dueDate ? formatDate(selectedInvoice.dueDate) : '—'}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-3">Line items</p>
              <div className="border border-gray-200 rounded-xl divide-y divide-gray-100 overflow-hidden">
                {selectedInvoice.lineItems.map((item, i) => {
                  const lineTotal = (item.quantity || 1) * (item.unitPrice || item.amount || 0);
                  return (
                    <div key={i} className="px-4 py-3 flex justify-between items-center bg-white hover:bg-gray-50 transition-colors">
                      <div>
                        <span className="text-gray-700">{item.description}</span>
                        {(item.quantity || item.unitPrice) && (
                          <span className="text-xs text-gray-500 ml-2">
                            ({item.quantity || 1} × {formatCurrency(item.unitPrice || item.amount || 0)})
                          </span>
                        )}
                        {item.taxPercent && (
                          <span className="text-xs text-gray-500 ml-2">Tax: {item.taxPercent}%</span>
                        )}
                      </div>
                      <span className="font-semibold text-gray-900 currency">{formatCurrency(lineTotal)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            {(() => {
              const totals = computeInvoiceTotals(selectedInvoice);
              return (
                <div className="space-y-2 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-semibold">{formatCurrency(totals.subtotal)}</span>
                  </div>
                  {totals.discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount:</span>
                      <span className="font-semibold">-{formatCurrency(totals.discountAmount)}</span>
                    </div>
                  )}
                  {totals.taxTotal > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax:</span>
                      <span className="font-semibold">{formatCurrency(totals.taxTotal)}</span>
                    </div>
                  )}
                  {totals.lateFeeAccrued > 0 && (
                    <div className="flex justify-between text-sm text-amber-600">
                      <span>Late Fee:</span>
                      <span className="font-semibold">{formatCurrency(totals.lateFeeAccrued)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <span className="font-semibold text-gray-900">Grand Total</span>
                    <span className="text-2xl font-bold text-gray-900 currency">
                      {formatCurrency(totals.grandTotal)}
                    </span>
                  </div>
                </div>
              );
            })()}
            {selectedInvoice.notes && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1.5">Notes</p>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedInvoice.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Premium Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create invoice"
        size="lg"
        footer={
          <>
            <button
              type="button"
              onClick={() => {
                setShowCreateModal(false);
                resetForm();
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={(e) => handleCreateSubmit(e, 'draft')}
              form="create-invoice-form"
              className="px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 flex items-center gap-2 font-medium shadow-sm transition-all"
            >
              <Save className="w-4 h-4" /> Save Draft
            </button>
            <button
              type="button"
              onClick={(e) => handleCreateSubmit(e, 'send')}
              form="create-invoice-form"
              className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 flex items-center gap-2 font-medium shadow-sm transition-all"
            >
              <Send className="w-4 h-4" /> Save & Send
            </button>
          </>
        }
      >
        <form id="create-invoice-form" onSubmit={(e) => handleCreateSubmit(e, 'draft')} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Client <span className="text-danger">*</span>
              </label>
              {clients.clients.length > 0 ? (
                <select
                  value={formClientId}
                  onChange={(e) => {
                    const clientId = e.target.value;
                    setFormClientId(clientId);
                    const client = clients.getClientById(clientId);
                    if (client) {
                      setFormClient(client.name);
                      setFormEmail(client.email || '');
                    }
                  }}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-white"
                  required
                >
                  <option value="">Select a client</option>
                  {clients.clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">No clients found. Please add a client first.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setShowClientModal(true);
                    }}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    + Add Client
                  </button>
                </div>
              )}
              {formClientId && (
                <input
                  type="text"
                  value={formClient}
                  onChange={(e) => setFormClient(e.target.value)}
                  placeholder="Or enter client name manually"
                  className="w-full mt-2 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-white"
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Client email</label>
              <input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Issue date <span className="text-danger">*</span>
              </label>
              <input
                type="date"
                value={formIssueDate}
                onChange={(e) => setFormIssueDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Due date</label>
              <input
                type="date"
                value={formDueDate}
                onChange={(e) => setFormDueDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-white"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Payment terms</label>
              <input
                type="text"
                value={formTerms}
                onChange={(e) => setFormTerms(e.target.value)}
                placeholder="e.g. Net 15"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-white"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-semibold text-gray-700">
                Line items <span className="text-danger">*</span>
              </label>
              <button
                type="button"
                onClick={addFormItem}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                + Add line
              </button>
            </div>
            <div className="space-y-2">
              {formItems.map((item, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center p-3 bg-gray-50 rounded-xl">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateFormItem(i, 'description', e.target.value)}
                    placeholder="Description"
                    className="col-span-4 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-white text-sm"
                  />
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={item.quantity || ''}
                    onChange={(e) => updateFormItem(i, 'quantity', e.target.value)}
                    placeholder="Qty"
                    className="col-span-2 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-white text-sm"
                  />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.unitPrice || ''}
                    onChange={(e) => updateFormItem(i, 'unitPrice', e.target.value)}
                    placeholder="Unit Price"
                    className="col-span-2 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-white text-sm currency"
                  />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={item.taxPercent || ''}
                    onChange={(e) => updateFormItem(i, 'taxPercent', e.target.value)}
                    placeholder="Tax %"
                    className="col-span-2 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-white text-sm"
                  />
                  <div className="col-span-1 text-sm font-semibold text-gray-700">
                    {formatCurrency((item.quantity || 1) * (item.unitPrice || item.amount || 0))}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFormItem(i)}
                    className="col-span-1 p-2 text-gray-400 hover:text-danger hover:bg-danger-subtle rounded-lg transition-colors"
                    disabled={formItems.length <= 1}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            
            {/* Totals Preview */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold">{formatCurrency(formTotals.subtotal)}</span>
              </div>
              {formDiscountEnabled && formTotals.discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount ({formDiscountPercent}%):</span>
                  <span className="font-semibold">-{formatCurrency(formTotals.discountAmount)}</span>
                </div>
              )}
              {formTotals.taxTotal > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax:</span>
                  <span className="font-semibold">{formatCurrency(formTotals.taxTotal)}</span>
                </div>
              )}
              {formLateFeeEnabled && formTotals.lateFeeAccrued > 0 && (
                <div className="flex justify-between text-sm text-amber-600">
                  <span>Accrued Late Fee:</span>
                  <span className="font-semibold">{formatCurrency(formTotals.lateFeeAccrued)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-gray-300">
                <span className="font-bold text-gray-900">Grand Total:</span>
                <span className="text-xl font-bold text-gray-900 currency">{formatCurrency(formTotals.grandTotal)}</span>
              </div>
            </div>
            
            {/* Discount Toggle */}
            <div className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <input
                    type="checkbox"
                    checked={formDiscountEnabled}
                    onChange={(e) => setFormDiscountEnabled(e.target.checked)}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  Apply Discount
                </label>
              </div>
              {formDiscountEnabled && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Discount Percentage</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formDiscountPercent}
                    onChange={(e) => setFormDiscountPercent(Number(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-white"
                  />
                </div>
              )}
            </div>
            
            {/* Late Fee Toggle */}
            <div className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <input
                    type="checkbox"
                    checked={formLateFeeEnabled}
                    onChange={(e) => setFormLateFeeEnabled(e.target.checked)}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  Enable Late Fees
                </label>
              </div>
              {formLateFeeEnabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fee Percentage</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formFeePercent}
                      onChange={(e) => setFormFeePercent(Number(e.target.value) || 0)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Apply Every (Days)</label>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      value={formApplyEveryXDays}
                      onChange={(e) => setFormApplyEveryXDays(Number(e.target.value) || 30)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-white"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
            <textarea
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-white resize-none"
            />
          </div>
        </form>
      </Modal>

      {/* Add Client Modal */}
      <Modal
        isOpen={showClientModal}
        onClose={() => setShowClientModal(false)}
        title="Add Client"
        size="md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setShowClientModal(false)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                // Simple client creation - in production, use proper form
                const newClient = {
                  id: `client-${Date.now()}`,
                  name: formClient.trim(),
                  email: formEmail.trim() || undefined,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                };
                clients.addClient(newClient);
                setFormClientId(newClient.id);
                setShowClientModal(false);
                setShowCreateModal(true);
              }}
              disabled={!formClient.trim()}
              className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-medium transition-colors disabled:opacity-50"
            >
              Add Client
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Client Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={formClient}
              onChange={(e) => setFormClient(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-white"
              placeholder="Enter client name"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-white"
              placeholder="client@example.com"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
