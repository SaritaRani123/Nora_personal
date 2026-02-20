'use client'

import type React from 'react'
import { useState, useCallback, useRef } from 'react'
import useSWR, { mutate as revalidateKey } from 'swr'
import {
  Upload,
  FileText,
  CheckCircle,
  Clock,
  Calendar,
  AlertCircle,
  X,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DateRangeFilter } from '@/components/date-range-filter'
import { cn } from '@/lib/utils'

import { getStatementsWithStats, uploadStatement, getStatementTransactions, saveStatement, type Statement, type StatementsStats, type StatementTransaction } from '@/lib/services/statements'
import { createInvoice } from '@/lib/services/invoices'
import { createExpense } from '@/lib/services/expenses'

interface StatementsData {
  statements: Statement[]
  stats: StatementsStats
}

type TransactionDetail = {
  category: string
  amount: number
  date: string
  type: 'credit' | 'debit'
}

type UploadStatus = 'idle' | 'selected' | 'uploading' | 'processing' | 'completed' | 'error'

// Helper function to parse date string (YYYY-MM-DD) as local date, not UTC
// This prevents timezone conversion issues when displaying dates
function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export default function StatementsPage() {
  const { data, isLoading, mutate } = useSWR<StatementsData>('statements', getStatementsWithStats)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle')
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadResult, setUploadResult] = useState<{
    transactions: number
    bank: string
    accountType: string
  } | null>(null)
  const [selectedBank, setSelectedBank] = useState<string>('BMO')
  const [selectedAccountType, setSelectedAccountType] = useState<string>('Chequing')
  const [bankFilter, setBankFilter] = useState('all')
  const [accountTypeFilter, setAccountTypeFilter] = useState('all')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  // Transaction review dialog state
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false)
  const [extractedTransactions, setExtractedTransactions] = useState<TransactionDetail[]>([])
  const [pendingStatement, setPendingStatement] = useState<Statement | null>(null)
  const [pendingUploadData, setPendingUploadData] = useState<{
    fileName: string
    bank: string
    accountType: string
    transactions: number
  } | null>(null)

  // View transactions dialog (for viewing statement transactions after upload)
  const [viewTransactionsOpen, setViewTransactionsOpen] = useState(false)
  const [viewTransactionsStatement, setViewTransactionsStatement] = useState<Statement | null>(null)
  const [viewTransactionsList, setViewTransactionsList] = useState<StatementTransaction[]>([])
  const [viewTransactionsLoading, setViewTransactionsLoading] = useState(false)

  const statements = data?.statements || []
  const stats = data?.stats || {
    totalStatements: 0,
    totalTransactions: 0,
    totalChequingStatements: 0,
    totalCreditCardStatements: 0,
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [])

  const handleFileSelect = (file: File) => {
    if (file.type !== 'application/pdf') {
      setUploadError('Only PDF files are supported')
      setUploadStatus('error')
      return
    }

    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      setUploadError('File size exceeds 10MB limit')
      setUploadStatus('error')
      return
    }

    setSelectedFile(file)
    setUploadStatus('selected')
    setUploadError(null)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  const handleClearFile = () => {
    setSelectedFile(null)
    setUploadStatus('idle')
    setUploadError(null)
    setUploadProgress(0)
    setUploadResult(null)
    setSelectedBank('BMO')
    setSelectedAccountType('Chequing')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploadStatus('uploading')
    setUploadProgress(0)
    setUploadError(null)

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 150)

      const uploaded = await uploadStatement(selectedFile, { bank: selectedBank, accountType: selectedAccountType as 'Chequing' | 'Credit Card' })
      // Do not mutate here; statement is only saved when user clicks Save

      clearInterval(progressInterval)

      setUploadProgress(100)
      setUploadStatus('processing')

      await new Promise((resolve) => setTimeout(resolve, 1500))

      const newStatement = uploaded[0]
      setPendingStatement(newStatement ?? null)
      const transactionCount = newStatement?.transactions ?? (newStatement?.transactionsList?.length ?? 0)
      setPendingUploadData({
        fileName: selectedFile.name,
        bank: selectedBank,
        accountType: selectedAccountType,
        transactions: transactionCount,
      })
      setUploadResult({
        transactions: transactionCount,
        bank: selectedBank,
        accountType: selectedAccountType,
      })
      setUploadStatus('completed')

      // Populate dialog with transactions from backend (upload response or fetch by id)
      let list: StatementTransaction[] = newStatement?.transactionsList ?? []
      if (list.length === 0 && newStatement?.id) {
        try {
          list = await getStatementTransactions(newStatement.id)
        } catch {
          list = []
        }
      }
      const mapped: TransactionDetail[] = list.map((txn) => ({
        category: txn.description ?? '',
        amount: txn.amount ?? 0,
        date: txn.date ?? '',
        type: (txn.type === 'credit' ? 'credit' : 'debit') as 'credit' | 'debit',
      }))
      setExtractedTransactions(mapped)

      // Auto-open the transaction review dialog
      setTransactionDialogOpen(true)
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : 'Upload failed. Please try again.'
      )
      setUploadStatus('error')
    }
  }

  const handleSaveTransactions = async () => {
    if (!pendingStatement) return

    // Persist statement to backend (only saved when user clicks Save)
    await saveStatement({
      fileName: pendingStatement.fileName,
      bank: pendingStatement.bank,
      accountType: pendingStatement.accountType,
      transactionsList: pendingStatement.transactionsList ?? [],
    })

    let autoInvoiceCounter = 1
    for (const txn of extractedTransactions) {
      if (txn.type === 'credit') {
        autoInvoiceCounter++
        await createInvoice({
          client: txn.category || 'Bank Credit',
          email: '',
          amount: txn.amount,
          status: 'paid',
          issueDate: txn.date,
          dueDate: txn.date,
          paidDate: txn.date,
        })
      } else {
        await createExpense({
          date: txn.date,
          description: txn.category,
          category: txn.category.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_') || 'office',
          amount: txn.amount,
          paymentMethod: 'Bank Statement',
          source: 'import',
        })
      }
    }

    await mutate()
    revalidateKey('invoices')
    revalidateKey('expenses')

    setTransactionDialogOpen(false)
    setPendingUploadData(null)
    setPendingStatement(null)
    setExtractedTransactions([])
    handleClearFile()
  }

  const handleCloseTransactionDialog = () => {
    setTransactionDialogOpen(false)
    setPendingUploadData(null)
    setPendingStatement(null)
    setExtractedTransactions([])
    handleClearFile()
  }

  const filteredStatements = statements.filter((statement) => {
    if (
      bankFilter !== 'all' &&
      (statement.bank ?? '').toLowerCase() !== bankFilter.toLowerCase()
    ) {
      return false
    }

    if (
      accountTypeFilter !== 'all' &&
      (statement.accountType ?? '').toLowerCase() !== accountTypeFilter.toLowerCase()
    ) {
      return false
    }

    const uploadDate = parseLocalDate(statement.uploadDate)
    if (fromDate) {
      const from = parseLocalDate(fromDate)
      if (uploadDate < from) return false
    }
    if (toDate) {
      const to = parseLocalDate(toDate)
      to.setHours(23, 59, 59, 999)
      if (uploadDate > to) return false
    }

    return true
  })

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const openViewTransactions = async (statement: Statement) => {
    setViewTransactionsStatement(statement)
    setViewTransactionsOpen(true)
    if (statement.transactionsList?.length) {
      setViewTransactionsList(statement.transactionsList)
      return
    }
    setViewTransactionsLoading(true)
    setViewTransactionsList([])
    try {
      const list = await getStatementTransactions(statement.id)
      setViewTransactionsList(list)
    } catch {
      setViewTransactionsList([])
    } finally {
      setViewTransactionsLoading(false)
    }
  }

  const closeViewTransactions = () => {
    setViewTransactionsOpen(false)
    setViewTransactionsStatement(null)
    setViewTransactionsList([])
  }

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-60" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-foreground">Bank Statements</h1>
        <p className="text-muted-foreground">Upload and manage your bank statements</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Upload Statement</CardTitle>
            <CardDescription>Drop your PDF bank statements here for automatic processing</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileInputChange}
              className="hidden"
              aria-label="Select PDF file"
            />

            {/* Drag and drop area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={uploadStatus === 'idle' ? handleBrowseClick : undefined}
              className={cn(
                'relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 md:p-12 transition-all duration-200',
                isDragging && 'border-primary bg-primary/5 scale-[1.01]',
                uploadStatus === 'idle' && !isDragging && 'border-border hover:border-primary/50 hover:bg-muted/30 cursor-pointer',
                uploadStatus !== 'idle' && 'border-border bg-muted/20',
                uploadStatus === 'error' && 'border-destructive/50 bg-destructive/5'
              )}
            >
              {/* Idle State */}
              {uploadStatus === 'idle' && (
                <>
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                  <p className="mb-2 text-lg font-medium text-foreground text-center">
                    Drop your bank statement here
                  </p>
                  <p className="mb-4 text-sm text-muted-foreground text-center">
                    Supports BMO, Scotiabank, TD, and CIBC PDF statements (max 10MB)
                  </p>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleBrowseClick()
                    }}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-transform cursor-pointer"
                  >
                    Select File
                  </Button>
                </>
              )}

              {/* Selected State */}
              {uploadStatus === 'selected' && selectedFile && (
                <div className="w-full max-w-md space-y-4">
                  <div className="flex items-start gap-4 rounded-lg bg-muted/50 p-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleClearFile}
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Bank Selection Dropdown */}
                  <div className="space-y-2">
                    <Label htmlFor="bank-select" className="text-sm font-medium text-foreground">
                      Bank
                    </Label>
                    <Select value={selectedBank} onValueChange={setSelectedBank}>
                      <SelectTrigger id="bank-select" className="w-full bg-background border-input hover:bg-muted/50 cursor-pointer">
                        <SelectValue placeholder="Select a bank" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BMO" className="cursor-pointer">BMO</SelectItem>
                        <SelectItem value="CIBC" className="cursor-pointer">CIBC</SelectItem>
                        <SelectItem value="Scotiabank" className="cursor-pointer">Scotiabank</SelectItem>
                        <SelectItem value="TD" className="cursor-pointer">TD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Account Type Selection Dropdown */}
                  <div className="space-y-2">
                    <Label htmlFor="account-type-select" className="text-sm font-medium text-foreground">
                      Account Type
                    </Label>
                    <Select value={selectedAccountType} onValueChange={setSelectedAccountType}>
                      <SelectTrigger id="account-type-select" className="w-full bg-background border-input hover:bg-muted/50 cursor-pointer">
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Chequing" className="cursor-pointer">Chequing</SelectItem>
                        <SelectItem value="Credit Card" className="cursor-pointer">Credit Card</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={handleBrowseClick}
                      className="flex-1 bg-transparent text-foreground hover:bg-muted/50 hover:text-foreground cursor-pointer"
                    >
                      Change File
                    </Button>
                    <Button
                      onClick={handleUpload}
                      className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                    >
                      Upload Statement
                    </Button>
                  </div>
                </div>
              )}

              {/* Uploading State */}
              {uploadStatus === 'uploading' && selectedFile && (
                <div className="w-full max-w-md space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">Uploading...</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {selectedFile.name}
                      </p>
                    </div>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-center text-sm text-muted-foreground">
                    {uploadProgress}% complete
                  </p>
                </div>
              )}

              {/* Processing State */}
              {uploadStatus === 'processing' && (
                <div className="flex flex-col items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Clock className="h-8 w-8 text-primary animate-spin" />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-medium text-foreground">
                      Processing...
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Extracting and categorizing transactions
                    </p>
                  </div>
                </div>
              )}

              {/* Completed State */}
              {uploadStatus === 'completed' && uploadResult && (
                <div className="flex flex-col items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <CheckCircle className="h-8 w-8 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-medium text-foreground">
                      Upload Complete!
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {uploadResult.transactions} transactions from {uploadResult.bank} ({uploadResult.accountType}) extracted
                    </p>
                  </div>
                </div>
              )}

              {/* Error State */}
              {uploadStatus === 'error' && (
                <div className="flex flex-col items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                    <AlertCircle className="h-8 w-8 text-destructive" />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-medium text-foreground">
                      Upload Failed
                    </p>
                    <p className="text-sm text-destructive">
                      {uploadError}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleClearFile}
                    className="bg-transparent"
                  >
                    Try Again
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Processing Stats</CardTitle>
            <CardDescription>Overview of your uploaded statements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-primary/10 p-4">
              <p className="text-sm text-muted-foreground">Total Statements</p>
              <p className="text-3xl font-bold text-foreground">{stats.totalStatements}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">Total Transactions</p>
              <p className="text-3xl font-bold text-foreground">{stats.totalTransactions}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">Total Chequing Statements</p>
              <p className="text-3xl font-bold text-foreground">{stats.totalChequingStatements}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">Total Credit Card Statements</p>
              <p className="text-3xl font-bold text-foreground">{stats.totalCreditCardStatements}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-card-foreground">All Statements</CardTitle>
              <CardDescription>View your uploaded bank statements</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={bankFilter} onValueChange={setBankFilter}>
                <SelectTrigger className="w-[140px] bg-secondary/50 border-0">
                  <SelectValue placeholder="Filter by bank" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Banks</SelectItem>
                  <SelectItem value="bmo">BMO</SelectItem>
                  <SelectItem value="cibc">CIBC</SelectItem>
                  <SelectItem value="scotiabank">Scotiabank</SelectItem>
                  <SelectItem value="td">TD</SelectItem>
                </SelectContent>
              </Select>
              <Select value={accountTypeFilter} onValueChange={setAccountTypeFilter}>
                <SelectTrigger className="w-[160px] bg-secondary/50 border-0">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="chequing">Chequing</SelectItem>
                  <SelectItem value="credit card">Credit Card</SelectItem>
                </SelectContent>
              </Select>
              <DateRangeFilter
                fromDate={fromDate}
                toDate={toDate}
                onFromDateChange={setFromDate}
                onToDateChange={setToDate}
                title="Filter by Upload Date"
                description="Select a date range to filter statements"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="text-muted-foreground">File Name</TableHead>
                  <TableHead className="text-muted-foreground">Bank Name</TableHead>
                  <TableHead className="text-muted-foreground">Account Type</TableHead>
                  <TableHead className="text-muted-foreground">Upload Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStatements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      No statements found matching your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStatements.map((statement) => (
                    <TableRow key={statement.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium text-foreground">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          {statement.fileName}
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground">
                        {statement.bank}
                      </TableCell>
                      <TableCell className="text-foreground">
                        {statement.accountType}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {parseLocalDate(statement.uploadDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Transactions Dialog */}
      <Dialog open={viewTransactionsOpen} onOpenChange={(open) => !open && closeViewTransactions()}>
        <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              Transactions {viewTransactionsStatement ? `— ${viewTransactionsStatement.fileName}` : ''}
            </DialogTitle>
            <DialogDescription>
              {viewTransactionsStatement?.bank} {viewTransactionsStatement?.accountType}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            {viewTransactionsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Skeleton className="h-48 w-full" />
              </div>
            ) : (
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableHead className="text-muted-foreground">Date</TableHead>
                      <TableHead className="text-muted-foreground">Description</TableHead>
                      <TableHead className="text-muted-foreground text-right">Amount</TableHead>
                      <TableHead className="text-muted-foreground">Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {viewTransactionsList.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                          No transactions for this statement.
                        </TableCell>
                      </TableRow>
                    ) : (
                      viewTransactionsList.map((txn) => (
                        <TableRow key={txn.id} className="hover:bg-muted/30">
                          <TableCell className="text-muted-foreground">
                            {parseLocalDate(txn.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </TableCell>
                          <TableCell className="font-medium text-foreground">
                            {txn.description}
                          </TableCell>
                          <TableCell
                            className={cn(
                              'text-right font-medium tabular-nums',
                              txn.amount >= 0 ? 'text-green-600 dark:text-green-400' : 'text-destructive'
                            )}
                          >
                            {txn.amount >= 0 ? '+' : ''}${Math.abs(txn.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={cn(
                                'capitalize',
                                txn.type === 'credit'
                                  ? 'bg-green-500/15 text-green-600 dark:text-green-400'
                                  : 'bg-red-500/15 text-red-600 dark:text-red-400'
                              )}
                            >
                              {txn.type}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeViewTransactions} className="bg-transparent">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transaction Review Dialog */}
      <Dialog
        open={transactionDialogOpen}
        onOpenChange={(open) => {
          setTransactionDialogOpen(open)
          if (!open) handleCloseTransactionDialog()
        }}
      >
        <DialogContent className="max-w-5xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Extracted Transactions</DialogTitle>
            <DialogDescription>
              Check your transactions before saving. Credits go to invoices, debits go to expenses.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="text-muted-foreground">Category</TableHead>
                    <TableHead className="text-muted-foreground">Amount</TableHead>
                    <TableHead className="text-muted-foreground">Date</TableHead>
                    <TableHead className="text-muted-foreground">Transaction Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {extractedTransactions.map((txn, index) => (
                    <TableRow key={index} className="hover:bg-muted/30">
                      <TableCell className="font-medium text-foreground">
                        {txn.category}
                      </TableCell>
                      <TableCell className="text-foreground">
                        ${txn.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {parseLocalDate(txn.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={cn(
                            'capitalize font-medium',
                            txn.type === 'credit'
                              ? 'bg-green-500/15 text-green-600 dark:text-green-400'
                              : 'bg-red-500/15 text-red-600 dark:text-red-400'
                          )}
                        >
                          {txn.type}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              onClick={handleSaveTransactions}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
