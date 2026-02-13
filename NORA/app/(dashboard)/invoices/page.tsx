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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { listInvoices, createInvoice, deleteInvoice as deleteInvoiceApi, type Invoice } from '@/lib/services/invoices'
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

  // Format date helper
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
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
    })()
  }

  // Handle Delete
  const handleDelete = () => {
    if (invoiceToDelete) {
      void (async () => {
        await deleteInvoiceApi(invoiceToDelete.id)
        setInvoiceToDelete(null)
        await mutate('invoices')
      })()
    }
  }

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
                filteredInvoices.map((invoice) => {
                  const status = statusConfig[invoice.status]
                  const StatusIcon = status.icon
                  return (
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
                        <Badge variant={status.variant} className={`gap-1 ${status.color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </Badge>
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
                  )
                })
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
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <Badge 
                  variant={statusConfig[previewInvoice.status].variant} 
                  className={`gap-1 ${statusConfig[previewInvoice.status].color}`}
                >
                  {(() => {
                    const StatusIcon = statusConfig[previewInvoice.status].icon
                    return <StatusIcon className="h-3 w-3" />
                  })()}
                  {statusConfig[previewInvoice.status].label}
                </Badge>
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
