import { NextResponse } from 'next/server'

// Mock statements data with accountType
let statements = [
  { id: '1', fileName: 'scotiabank_jan_2025.pdf', uploadDate: '2025-01-20', transactions: 45, bank: 'Scotiabank', accountType: 'Chequing' },
  { id: '2', fileName: 'td_dec_2024.pdf', uploadDate: '2025-01-05', transactions: 52, bank: 'TD', accountType: 'Credit Card' },
  { id: '3', fileName: 'bmo_nov_2024.pdf', uploadDate: '2024-12-10', transactions: 38, bank: 'BMO', accountType: 'Chequing' },
  { id: '4', fileName: 'scotiabank_oct_2024.pdf', uploadDate: '2024-11-01', transactions: 38, bank: 'Scotiabank', accountType: 'Credit Card' },
  { id: '5', fileName: 'td_sep_2024.pdf', uploadDate: '2024-10-01', transactions: 42, bank: 'TD', accountType: 'Chequing' },
  { id: '6', fileName: 'cibc_aug_2024.pdf', uploadDate: '2024-09-01', transactions: 35, bank: 'CIBC', accountType: 'Credit Card' },
]

export async function GET() {
  await new Promise(resolve => setTimeout(resolve, 100))
  
  const stats = {
    totalStatements: statements.length,
    totalTransactions: statements.reduce((sum, s) => sum + s.transactions, 0),
    totalChequingStatements: statements.filter((s) => s.accountType === 'Chequing').length,
    totalCreditCardStatements: statements.filter((s) => s.accountType === 'Credit Card').length,
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
    accountType: body.accountType || 'Chequing',
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

export async function PATCH(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const body = await request.json()
  
  const statementIndex = statements.findIndex(s => s.id === id)
  
  if (statementIndex === -1) {
    return NextResponse.json({ error: 'Statement not found' }, { status: 404 })
  }
  
  // Update the bank and/or accountType fields
  statements[statementIndex] = {
    ...statements[statementIndex],
    ...(body.bank && { bank: body.bank }),
    ...(body.accountType && { accountType: body.accountType }),
  }
  
  return NextResponse.json(statements[statementIndex])
}
