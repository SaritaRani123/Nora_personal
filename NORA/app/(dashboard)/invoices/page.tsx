'use client'

import { useState, useMemo, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Search,
  Download,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  Copy,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  X,
  Building2,
  Mail,
  Calendar,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Checkbox } from '@/components/ui/checkbox'
import useSWR, { mutate } from 'swr'
import { listInvoices, createInvoice, updateInvoice, deleteInvoice as deleteInvoiceApi, type Invoice } from '@/lib/services/invoices'
import { listWorkDone, type WorkDoneEntry } from '@/lib/services/work-done'
import { listTimeEntries, type TimeEntry } from '@/lib/services/time-entries'
import { generateInvoicePDF } from '@/lib/invoices/generateInvoicePDF'

const CURRENCY_SYMBOLS: Record<string, string> = {
  CAD: '$', USD: '$', EUR: '€', INR: '₹', GBP: '£',
}

function getCurrencySymbol(invoice: Invoice): string {
  return CURRENCY_SYMBOLS[invoice.invoiceCurrency ?? 'CAD'] ?? '$'
}

const statusConfig = {
  paid: { label: 'Paid', variant: 'default' as const, icon: CheckCircle2, color: 'text-success bg-success/10' },
  pending: { label: 'Pending', variant: 'secondary' as const, icon: Clock, color: 'text-chart-4 bg-chart-4/10' },
  overdue: { label: 'Overdue', variant: 'destructive' as const, icon: AlertCircle, color: 'text-destructive bg-destructive/10' },
  draft: { label: 'Draft', variant: 'outline' as const, icon: FileText, color: 'text-muted-foreground bg-muted' },
}

const InvoicesPage = () => {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null)
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  
  const { data: invoices = [] } = useSWR<Invoice[]>('invoices', () => listInvoices())
  const { data: unbilledWork = [] } = useSWR<WorkDoneEntry[]>('work-done-unbilled', () =>
    listWorkDone({ unbilledOnly: true })
  )
  const { data: unbilledTimeEntries = [] } = useSWR<TimeEntry[]>('time-entries-unbilled', () =>
    listTimeEntries({ unbilledOnly: true })
  )

  const [selectedUnbilledIds, setSelectedUnbilledIds] = useState<Set<string>>(new Set())

  const unbilledRows = useMemo(() => {
    const workRows = unbilledWork.map((w) => ({
      id: w.id,
      type: 'work' as const,
      date: w.date,
      contact: w.contact || '—',
      description: w.description || '—',
      hours: w.hours,
      rate: w.rate,
      amount: w.amount,
    }))
    const timeRows = unbilledTimeEntries.map((t) => ({
      id: t.id,
      type: 'time' as const,
      date: t.date,
      contact: t.contactId || '—',
      description: t.description || t.invoiceItem || '—',
      hours: Math.round((t.durationMinutes / 60) * 100) / 100,
      rate: t.hourlyRate,
      amount: t.amount,
    }))
    return [...workRows, ...timeRows]
  }, [unbilledWork, unbilledTimeEntries])

  const toggleUnbilledSelection = (id: string) => {
    setSelectedUnbilledIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  const toggleAllUnbilled = () => {
    if (selectedUnbilledIds.size === unbilledRows.length) setSelectedUnbilledIds(new Set())
    else setSelectedUnbilledIds(new Set(unbilledRows.map((r) => r.id)))
  }

  const selectedUnbilledSingleClient = useMemo(() => {
    if (selectedUnbilledIds.size === 0) return true
    const selectedRows = unbilledRows.filter((r) => selectedUnbilledIds.has(r.id))
    const distinctClients = new Set(selectedRows.map((r) => r.contact))
    return distinctClients.size <= 1
  }, [unbilledRows, selectedUnbilledIds])

  const handleCreateInvoiceFromUnbilled = () => {
    const selectedWork = unbilledWork.filter((w) => selectedUnbilledIds.has(w.id))
    const selectedTime = unbilledTimeEntries.filter((t) => selectedUnbilledIds.has(t.id))
    if (selectedWork.length === 0 && selectedTime.length === 0) return
    try {
      sessionStorage.setItem('unbilledWorkEntriesForInvoice', JSON.stringify(selectedWork))
      sessionStorage.setItem('unbilledTimeEntriesForInvoice', JSON.stringify(selectedTime))
    } catch (_) {}
    router.push('/invoices/create?from=unbilled')
  }

  // Calculate stats from invoices
  const stats = useMemo(() => ({
    total: invoices.reduce((sum, inv) => sum + inv.amount, 0),
    paid: invoices.filter((inv) => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0),
    pending: invoices.filter((inv) => inv.status === 'pending').reduce((sum, inv) => sum + inv.amount, 0),
    overdue: invoices.filter((inv) => inv.status === 'overdue').reduce((sum, inv) => sum + inv.amount, 0),
  }), [invoices])

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const matchesSearch =
        invoice.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.id.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [invoices, searchQuery, statusFilter])

  // Format date helper (parse YYYY-MM-DD without timezone shift)
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    const m = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (m) {
      const date = new Date(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10))
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    }
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  // Handle View - opens preview dialog
  const handleView = (invoice: Invoice) => {
    setPreviewInvoice(invoice)
  }

  // Handle Edit - store full invoice in sessionStorage and navigate to create page
  const handleEdit = (invoice: Invoice) => {
    try {
      sessionStorage.setItem('invoiceToEdit', JSON.stringify(invoice))
    } catch (_) { /* ignore */ }
    router.push(`/invoices/create?edit=true&id=${encodeURIComponent(invoice.id)}`)
  }

  // Handle Download PDF - uses shared template-based generation (invoice.template, invoice.colorPalette)
  const handleDownloadPDF = useCallback(async (invoice: Invoice) => {
    await generateInvoicePDF(invoice)
  }, [])

  // Handle Duplicate - include template, colorPalette, invoiceCurrency, lineItems
  const handleDuplicate = (invoice: Invoice) => {
    void (async () => {
      await createInvoice({
        client: invoice.client,
        email: invoice.email,
        amount: invoice.amount,
        status: 'draft',
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: invoice.dueDate,
        paidDate: null,
        template: invoice.template,
        colorPalette: invoice.colorPalette,
        invoiceCurrency: invoice.invoiceCurrency ?? 'CAD',
        lineItems: invoice.lineItems && invoice.lineItems.length > 0
          ? invoice.lineItems.map((li) => ({
              itemType: li.itemType ?? 'item',
              item: li.item,
              quantity: li.quantity ?? 1,
              unit: li.unit ?? 'pcs',
              hours: li.hours ?? 0,
              minutes: li.minutes ?? 0,
              price: li.price,
              taxId: li.taxId ?? null,
              description: li.description ?? '',
            }))
          : undefined,
      })
      await mutate('invoices')
      await mutate('payable-summary')
      await mutate((k: unknown) => Array.isArray(k) && k[0] === 'charts')
    })()
  }

  // Handle Delete
  const handleDelete = () => {
    if (invoiceToDelete) {
      void (async () => {
        await deleteInvoiceApi(invoiceToDelete.id)
        setInvoiceToDelete(null)
        await mutate('invoices')
        await mutate('payable-summary')
        await mutate((k: unknown) => Array.isArray(k) && k[0] === 'charts')
      })()
    }
  }

  type InvoiceStatus = Invoice['status']
  const handleStatusChange = useCallback(async (invoice: Invoice, newStatus: InvoiceStatus) => {
    const paidDate = newStatus === 'paid' ? new Date().toISOString().split('T')[0] : (invoice.paidDate ?? null)
    await updateInvoice(invoice.id, { status: newStatus, paidDate })
    await mutate('invoices')
    await mutate('payable-summary')
    await mutate((k: unknown) => Array.isArray(k) && k[0] === 'charts')
  }, [])

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Invoices</h1>
          <p className="text-muted-foreground">Create beautiful invoices and track their status</p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/invoices/create">
            <Plus className="h-4 w-4" />
            Create Invoice
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Invoiced</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${stats.total.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-success">${stats.paid.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-chart-4">${stats.pending.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-destructive">${stats.overdue.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Unbilled Work */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Unbilled Work</CardTitle>
              <CardDescription>Work done and time entries from Calendar. Select items and create an invoice.</CardDescription>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Button
                onClick={handleCreateInvoiceFromUnbilled}
                disabled={selectedUnbilledIds.size === 0 || !selectedUnbilledSingleClient}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Invoice
              </Button>
              {selectedUnbilledIds.size > 0 && !selectedUnbilledSingleClient && (
                <p className="text-sm text-destructive">Select items for one client only.</p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={unbilledRows.length > 0 && selectedUnbilledIds.size === unbilledRows.length}
                    onCheckedChange={toggleAllUnbilled}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Hours</TableHead>
                <TableHead className="text-right">Rate</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {unbilledRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No unbilled work. Add work or time entries on the Calendar page to see them here.
                  </TableCell>
                </TableRow>
              ) : (
                unbilledRows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedUnbilledIds.has(row.id)}
                        onCheckedChange={() => toggleUnbilledSelection(row.id)}
                        aria-label={`Select ${row.description}`}
                      />
                    </TableCell>
                    <TableCell>
                      <Badge variant={row.type === 'time' ? 'secondary' : 'outline'} className="text-xs">
                        {row.type === 'time' ? 'Time' : 'Work'}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(row.date)}</TableCell>
                    <TableCell>{row.contact}</TableCell>
                    <TableCell>{row.description}</TableCell>
                    <TableCell className="text-right">{row.hours}</TableCell>
                    <TableCell className="text-right">${row.rate.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-medium">${row.amount.toLocaleString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Invoices */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Recent Invoices</CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search invoices..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full sm:w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No invoices found
                  </TableCell>
                </TableRow>
              ) : (
                filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{invoice.client}</p>
                          <p className="text-sm text-muted-foreground">{invoice.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{getCurrencySymbol(invoice)}{invoice.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Select
                          value={invoice.status}
                          onValueChange={(value) => handleStatusChange(invoice, value as InvoiceStatus)}
                        >
                          <SelectTrigger className="w-[120px] h-8 border-0 shadow-none bg-transparent hover:bg-muted/50 p-0 gap-1">
                            <Badge className={`font-normal ${statusConfig[invoice.status].color}`} variant="secondary">
                              {statusConfig[invoice.status].label}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="overdue">Overdue</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleView(invoice)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(invoice)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownloadPDF(invoice)}>
                              <Download className="mr-2 h-4 w-4" />
                              Download PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicate(invoice)}>
                              <Copy className="mr-2 h-4 w-4" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => setInvoiceToDelete(invoice)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={!!previewInvoice} onOpenChange={() => setPreviewInvoice(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Invoice {previewInvoice?.id}
            </DialogTitle>
          </DialogHeader>
          {previewInvoice && (
            <div ref={previewRef} className="space-y-6">
              {/* Status - editable */}
              <div className="flex items-center justify-between">
                <Select
                  value={previewInvoice.status}
                  onValueChange={async (value) => {
                    const newStatus = value as InvoiceStatus
                    await handleStatusChange(previewInvoice, newStatus)
                    setPreviewInvoice({ ...previewInvoice, status: newStatus, paidDate: newStatus === 'paid' ? new Date().toISOString().split('T')[0] : previewInvoice.paidDate })
                  }}
                >
                  <SelectTrigger className="w-[140px] p-0 gap-1">
                    <Badge className={`font-normal ${statusConfig[previewInvoice.status].color}`} variant="secondary">
                      {statusConfig[previewInvoice.status].label}
                    </Badge>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleDownloadPDF(previewInvoice)} className="bg-transparent">
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { setPreviewInvoice(null); handleEdit(previewInvoice) }} className="bg-transparent">
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>

              {/* Invoice Details Card */}
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-6">
                    {/* Bill To */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Bill To
                      </h4>
                      <p className="font-medium text-lg">{previewInvoice.client}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {previewInvoice.email}
                      </p>
                    </div>

                    {/* Dates */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Dates
                      </h4>
                      <div className="space-y-1">
                        <p className="text-sm">
                          <span className="text-muted-foreground">Issue Date:</span>{' '}
                          <span className="font-medium">{formatDate(previewInvoice.issueDate)}</span>
                        </p>
                        <p className="text-sm">
                          <span className="text-muted-foreground">Due Date:</span>{' '}
                          <span className="font-medium">{formatDate(previewInvoice.dueDate)}</span>
                        </p>
                        {previewInvoice.paidDate && (
                          <p className="text-sm">
                            <span className="text-muted-foreground">Paid Date:</span>{' '}
                            <span className="font-medium text-success">{formatDate(previewInvoice.paidDate)}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="mt-6 pt-6 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold">Total Amount</span>
                      <span className="text-3xl font-bold">{getCurrencySymbol(previewInvoice)}{previewInvoice.amount.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-2 justify-end">
                <Button 
                  variant="destructive" 
                  onClick={() => { setPreviewInvoice(null); setInvoiceToDelete(previewInvoice) }}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!invoiceToDelete} onOpenChange={() => setInvoiceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete invoice {invoiceToDelete?.id}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default InvoicesPage
