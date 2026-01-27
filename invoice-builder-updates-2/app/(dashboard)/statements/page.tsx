'use client'

import React from 'react'
import { useState, useCallback } from 'react'
import useSWR, { mutate } from 'swr'
import { Upload, FileText, CheckCircle, Clock, Trash2, Calendar } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

type Statement = {
  id: string
  fileName: string
  uploadDate: string
  transactions: number
  bank: string
}

interface StatementsData {
  statements: Statement[]
  stats: {
    totalStatements: number
    totalTransactions: number
    aiAccuracy: number
  }
}

export default function StatementsPage() {
  const { data, isLoading } = useSWR<StatementsData>('/api/statements', fetcher)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'completed'>('idle')
  const [bankFilter, setBankFilter] = useState('all')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [statementToDelete, setStatementToDelete] = useState<Statement | null>(null)

  const statements = data?.statements || []
  const stats = data?.stats || { totalStatements: 0, totalTransactions: 0, aiAccuracy: 0 }

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
    simulateUpload()
  }, [])

  const simulateUpload = async () => {
    setUploadStatus('uploading')
    setUploadProgress(0)
    
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev === null) return 0
        if (prev >= 100) {
          clearInterval(interval)
          setUploadStatus('processing')
          setTimeout(async () => {
            setUploadStatus('completed')
            // Add new statement via API
            await fetch('/api/statements', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                fileName: 'scotiabank_jan_2026.pdf',
                bank: 'Scotiabank',
                transactions: 45,
              }),
            })
            mutate('/api/statements')
            setTimeout(() => {
              setUploadStatus('idle')
              setUploadProgress(null)
            }, 2000)
          }, 1500)
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  const handleDeleteClick = (statement: Statement) => {
    setStatementToDelete(statement)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (statementToDelete) {
      await fetch(`/api/statements?id=${statementToDelete.id}`, {
        method: 'DELETE',
      })
      mutate('/api/statements')
    }
    setDeleteDialogOpen(false)
    setStatementToDelete(null)
  }

  const filteredStatements = statements.filter((statement) => {
    // Bank filter
    if (bankFilter !== 'all' && statement.bank.toLowerCase() !== bankFilter.toLowerCase()) {
      return false
    }
    
    // Date range filter
    const uploadDate = new Date(statement.uploadDate)
    if (fromDate) {
      const from = new Date(fromDate)
      if (uploadDate < from) return false
    }
    if (toDate) {
      const to = new Date(toDate)
      to.setHours(23, 59, 59, 999)
      if (uploadDate > to) return false
    }
    
    return true
  })

  const clearDateFilters = () => {
    setFromDate('')
    setToDate('')
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
        <p className="text-muted-foreground">Upload and manage your bank statements for AI-powered categorization</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Upload Statement</CardTitle>
            <CardDescription>Drop your PDF bank statements here for automatic processing</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors
                ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/30'}
                ${uploadStatus !== 'idle' ? 'pointer-events-none' : 'cursor-pointer'}
              `}
              onClick={() => uploadStatus === 'idle' && simulateUpload()}
            >
              {uploadStatus === 'idle' && (
                <>
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                  <p className="mb-2 text-lg font-medium text-foreground">
                    Drop your bank statement here
                  </p>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Supports Scotiabank, TD, and RBC PDF statements
                  </p>
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Browse Files
                  </Button>
                </>
              )}
              
              {uploadStatus === 'uploading' && (
                <div className="w-full max-w-md space-y-4">
                  <div className="flex items-center gap-4">
                    <FileText className="h-12 w-12 text-primary" />
                    <div className="flex-1">
                      <p className="text-lg font-medium text-foreground">Uploading...</p>
                      <p className="text-sm text-muted-foreground">scotiabank_jan_2026.pdf</p>
                    </div>
                  </div>
                  <Progress value={uploadProgress ?? 0} className="h-3" />
                  <p className="text-center text-sm text-muted-foreground">{uploadProgress}% complete</p>
                </div>
              )}
              
              {uploadStatus === 'processing' && (
                <div className="flex flex-col items-center gap-4">
                  <div className="animate-spin">
                    <Clock className="h-12 w-12 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-medium text-foreground">Processing with AI...</p>
                    <p className="text-sm text-muted-foreground">Extracting and categorizing transactions</p>
                  </div>
                </div>
              )}
              
              {uploadStatus === 'completed' && (
                <div className="flex flex-col items-center gap-4">
                  <CheckCircle className="h-12 w-12 text-primary" />
                  <div className="text-center">
                    <p className="text-lg font-medium text-foreground">Upload Complete!</p>
                    <p className="text-sm text-muted-foreground">45 transactions successfully categorized</p>
                  </div>
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
              <p className="text-sm text-muted-foreground">AI Accuracy</p>
              <p className="text-3xl font-bold text-primary">{stats.aiAccuracy}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-card-foreground">All Statements</CardTitle>
              <CardDescription>View and manage your uploaded bank statements</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={bankFilter} onValueChange={setBankFilter}>
                <SelectTrigger className="w-[140px] bg-secondary/50 border-0">
                  <SelectValue placeholder="Filter by bank" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Banks</SelectItem>
                  <SelectItem value="scotiabank">Scotiabank</SelectItem>
                  <SelectItem value="td">TD</SelectItem>
                  <SelectItem value="rbc">RBC</SelectItem>
                </SelectContent>
              </Select>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="bg-transparent">
                    <Calendar className="mr-2 h-4 w-4" />
                    Date Range
                    {(fromDate || toDate) && (
                      <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                        {fromDate || toDate ? '1' : '0'}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Filter by Upload Date</h4>
                      <p className="text-xs text-muted-foreground">
                        Select a date range to filter statements
                      </p>
                    </div>
                    <div className="grid gap-3">
                      <div className="grid gap-1.5">
                        <Label htmlFor="fromDate" className="text-xs">From Date</Label>
                        <Input
                          id="fromDate"
                          type="date"
                          value={fromDate}
                          onChange={(e) => setFromDate(e.target.value)}
                          className="h-9"
                        />
                      </div>
                      <div className="grid gap-1.5">
                        <Label htmlFor="toDate" className="text-xs">To Date</Label>
                        <Input
                          id="toDate"
                          type="date"
                          value={toDate}
                          onChange={(e) => setToDate(e.target.value)}
                          className="h-9"
                        />
                      </div>
                    </div>
                    {(fromDate || toDate) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearDateFilters}
                        className="w-full bg-transparent"
                      >
                        Clear Dates
                      </Button>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="text-muted-foreground">File Name</TableHead>
                  <TableHead className="text-muted-foreground">Bank</TableHead>
                  <TableHead className="text-muted-foreground">Upload Date</TableHead>
                  <TableHead className="text-muted-foreground">Transactions</TableHead>
                  <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStatements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
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
                        <Badge variant="outline" className="font-normal">
                          {statement.bank}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(statement.uploadDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </TableCell>
                      <TableCell className="text-foreground">{statement.transactions}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteClick(statement)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Statement</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{statementToDelete?.fileName}&quot;? This action cannot be undone and will permanently remove the statement and its associated transactions.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="bg-transparent">
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
