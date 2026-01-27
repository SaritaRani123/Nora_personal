import { NextResponse } from 'next/server'

// Mock statements data
let statements = [
  { id: '1', fileName: 'scotiabank_jan_2025.pdf', uploadDate: '2025-01-20', transactions: 45, bank: 'Scotiabank' },
  { id: '2', fileName: 'td_dec_2024.pdf', uploadDate: '2025-01-05', transactions: 52, bank: 'TD' },
  { id: '3', fileName: 'rbc_nov_2024.pdf', uploadDate: '2024-12-10', transactions: 38, bank: 'RBC' },
  { id: '4', fileName: 'scotiabank_oct_2024.pdf', uploadDate: '2024-11-01', transactions: 38, bank: 'Scotiabank' },
  { id: '5', fileName: 'td_sep_2024.pdf', uploadDate: '2024-10-01', transactions: 42, bank: 'TD' },
  { id: '6', fileName: 'rbc_aug_2024.pdf', uploadDate: '2024-09-01', transactions: 35, bank: 'RBC' },
]

export async function GET() {
  await new Promise(resolve => setTimeout(resolve, 100))
  
  const stats = {
    totalStatements: statements.length,
    totalTransactions: statements.reduce((sum, s) => sum + s.transactions, 0),
    aiAccuracy: 94.2,
  }
  
  return NextResponse.json({ statements, stats })
}

export async function POST(request: Request) {
  const body = await request.json()
  
  const newStatement = {
    id: String(Date.now()),
    fileName: body.fileName,
    uploadDate: new Date().toISOString().split('T')[0],
    transactions: body.transactions || Math.floor(Math.random() * 30) + 30,
    bank: body.bank,
  }
  
  statements.unshift(newStatement)
  
  return NextResponse.json(newStatement, { status: 201 })
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  
  statements = statements.filter(s => s.id !== id)
  
  return NextResponse.json({ success: true })
}
