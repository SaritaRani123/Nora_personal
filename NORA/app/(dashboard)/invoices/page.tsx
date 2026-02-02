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
import { useDataStore, type Invoice } from '@/lib/data-store'

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
  
  // Use data store for cross-page data consistency
  const { invoices, addInvoice, deleteInvoice } = useDataStore()

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

  // Handle Edit - navigate to create page with invoice data in URL params
  const handleEdit = (invoice: Invoice) => {
    const params = new URLSearchParams({
      edit: 'true',
      id: invoice.id,
      client: invoice.client,
      email: invoice.email,
      amount: invoice.amount.toString(),
      status: invoice.status,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
    })
    router.push(`/invoices/create?${params.toString()}`)
  }

  // Helper to convert hex color to RGB
  const hexToRgb = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result 
      ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
      : [30, 64, 175] // Default blue
  }

  // Handle Download PDF
  const handleDownloadPDF = useCallback(async (invoice: Invoice) => {
    try {
      const { jsPDF } = await import('jspdf')
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      })

      const pageWidth = pdf.internal.pageSize.getWidth()
      
      // Use saved color palette or default
      const headerColor = invoice.colorPalette?.header 
        ? hexToRgb(invoice.colorPalette.header) 
        : [30, 64, 175] as [number, number, number]
      const tableHeaderColor = invoice.colorPalette?.tableHeader 
        ? hexToRgb(invoice.colorPalette.tableHeader) 
        : [30, 58, 138] as [number, number, number]
      
      // Header - using saved or default color
      pdf.setFillColor(headerColor[0], headerColor[1], headerColor[2])
      pdf.rect(0, 0, pageWidth, 40, 'F')
      
      // White text for header
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(24)
      pdf.setFont('helvetica', 'bold')
      pdf.text('INVOICE', 20, 25)
      
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`#${invoice.id}`, pageWidth - 20, 25, { align: 'right' })
      
      // Reset to black text
      pdf.setTextColor(0, 0, 0)
      
      // Invoice details
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Bill To:', 20, 55)
      pdf.setFont('helvetica', 'normal')
      pdf.text(invoice.client || 'N/A', 20, 62)
      pdf.text(invoice.email || 'N/A', 20, 68)
      
      // Dates
      pdf.setFont('helvetica', 'bold')
      pdf.text('Issue Date:', pageWidth - 60, 55)
      pdf.setFont('helvetica', 'normal')
      pdf.text(formatDate(invoice.issueDate), pageWidth - 60, 62)
      
      pdf.setFont('helvetica', 'bold')
      pdf.text('Due Date:', pageWidth - 60, 72)
      pdf.setFont('helvetica', 'normal')
      pdf.text(formatDate(invoice.dueDate), pageWidth - 60, 79)
      
      // Status
      const statusLabel = statusConfig[invoice.status].label
      pdf.setFont('helvetica', 'bold')
      pdf.text('Status:', pageWidth - 60, 89)
      pdf.setFont('helvetica', 'normal')
      pdf.text(statusLabel, pageWidth - 60, 96)
      
      // Line - gray color
      pdf.setDrawColor(200, 200, 200)
      pdf.line(20, 110, pageWidth - 20, 110)
      
      // Table header - using saved or default color
      pdf.setFillColor(tableHeaderColor[0], tableHeaderColor[1], tableHeaderColor[2])
      pdf.rect(20, 115, pageWidth - 40, 10, 'F')
      pdf.setTextColor(255, 255, 255)
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(10)
      pdf.text('Description', 25, 122)
      pdf.text('Amount', pageWidth - 45, 122, { align: 'right' })
      
      // Table content
      pdf.setTextColor(0, 0, 0)
      pdf.setFont('helvetica', 'normal')
      pdf.text('Invoice Amount', 25, 135)
      pdf.text(`$${invoice.amount.toLocaleString()}`, pageWidth - 45, 135, { align: 'right' })
      
      // Total line
      pdf.line(20, 145, pageWidth - 20, 145)
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(12)
      pdf.text('Total:', pageWidth - 70, 155)
      pdf.text(`$${invoice.amount.toLocaleString()}`, pageWidth - 25, 155, { align: 'right' })
      
      // Footer - gray text
      pdf.setFontSize(9)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(128, 128, 128)
      pdf.text('Thank you for your business!', pageWidth / 2, 280, { align: 'center' })
      
      // Save the PDF
      pdf.save(`${invoice.id}.pdf`)
    } catch (error) {
      console.error('Failed to generate PDF:', error)
    }
  }, [])

  // Handle Duplicate
  const handleDuplicate = (invoice: Invoice) => {
    addInvoice({
      client: invoice.client,
      email: invoice.email,
      amount: invoice.amount,
      status: 'draft',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: invoice.dueDate,
      paidDate: null,
    })
  }

  // Handle Delete
  const handleDelete = () => {
    if (invoiceToDelete) {
      deleteInvoice(invoiceToDelete.id)
      setInvoiceToDelete(null)
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
                <TableHead>Client</TableHead>
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
                      <TableCell className="font-medium">${invoice.amount.toLocaleString()}</TableCell>
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
                      <span className="text-3xl font-bold">${previewInvoice.amount.toLocaleString()}</span>
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
