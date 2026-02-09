'use client'

import React from "react"

import { useState, useCallback } from 'react'
import { Upload, FileText, CheckCircle, Clock, X } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import useSWR, { mutate } from 'swr'
import { listStatements, uploadStatement, type Statement } from '@/lib/services/statements'

export function StatementUpload() {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'completed'>('idle')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const { data: statements = [] } = useSWR<Statement[]>('statements', () => listStatements())

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
    const file = e.dataTransfer.files?.[0]
    if (file) {
      void handleUpload(file)
    }
  }, [])

  const handleUpload = async (file: File) => {
    setUploadStatus('uploading')
    setUploadProgress(0)
    setSelectedFile(file)
    
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev === null) return 0
        if (prev >= 100) {
          clearInterval(interval)
          setUploadStatus('processing')
          void (async () => {
            try {
              await uploadStatement(file)
              await mutate('statements')
              setUploadStatus('completed')
            } finally {
              setTimeout(() => {
                setUploadStatus('idle')
                setUploadProgress(null)
                setSelectedFile(null)
              }, 2000)
            }
          })()
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-card-foreground">Bank Statement Upload</CardTitle>
        <CardDescription>Upload PDF bank statements for AI-powered categorization</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors
            ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/30'}
            ${uploadStatus !== 'idle' ? 'pointer-events-none' : 'cursor-pointer'}
          `}
          onClick={() => {
            if (uploadStatus !== 'idle') return
            // fallback: open file picker via hidden input
            document.getElementById('statement-upload-input')?.click()
          }}
        >
          <input
            id="statement-upload-input"
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void handleUpload(file)
              e.currentTarget.value = ''
            }}
          />
          {uploadStatus === 'idle' && (
            <>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <p className="mb-1 text-sm font-medium text-foreground">
                Drop your bank statement here
              </p>
              <p className="text-xs text-muted-foreground">
                Supports Scotia Bank PDF statements
              </p>
              <Button variant="outline" size="sm" className="mt-4 bg-transparent">
                Browse Files
              </Button>
            </>
          )}
          
          {uploadStatus === 'uploading' && (
            <div className="w-full max-w-xs space-y-3">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Uploading...</p>
                  <p className="text-xs text-muted-foreground">{selectedFile?.name || 'statement.pdf'}</p>
                </div>
              </div>
              <Progress value={uploadProgress ?? 0} className="h-2" />
            </div>
          )}
          
          {uploadStatus === 'processing' && (
            <div className="flex items-center gap-3">
              <div className="animate-spin">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Processing with AI...</p>
                <p className="text-xs text-muted-foreground">Categorizing transactions</p>
              </div>
            </div>
          )}
          
          {uploadStatus === 'completed' && (
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Upload Complete!</p>
                <p className="text-xs text-muted-foreground">45 transactions categorized</p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground">Recent Uploads</h4>
          {statements.map((statement) => (
            <div
              key={statement.id}
              className="flex items-center justify-between rounded-lg bg-muted/30 p-3"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">{statement.fileName}</p>
                  <p className="text-xs text-muted-foreground">
                    {statement.transactions} transactions
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Processed
                </Badge>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
