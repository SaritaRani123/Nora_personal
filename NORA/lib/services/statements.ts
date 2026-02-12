import { apiFetch, extractArray } from '@/lib/api/http'
import { getApiBaseUrl } from '@/lib/config/api'

export interface StatementTransaction {
  id: string
  date: string
  description: string
  amount: number
  type: 'credit' | 'debit'
}

export interface Statement {
  id: string
  fileName: string
  uploadDate: string
  status: string
  transactions: number
  bank?: string
  accountType?: 'Chequing' | 'Credit Card'
  transactionsList?: StatementTransaction[]
}

export interface StatementsStats {
  totalStatements: number
  totalTransactions: number
  totalChequingStatements: number
  totalCreditCardStatements: number
}

export async function listStatements(): Promise<Statement[]> {
  const body = await apiFetch('/statements')
  return extractArray<Statement>(body, 'statements')
}

export async function getStatementsWithStats(): Promise<{ statements: Statement[]; stats: StatementsStats }> {
  const body = await apiFetch('/statements') as { statements?: Statement[]; stats?: StatementsStats[] }
  const statements = extractArray<Statement>(body, 'statements')
  const statsArr = Array.isArray((body as { stats?: unknown }).stats) ? (body as { stats: StatementsStats[] }).stats : []
  const stats: StatementsStats = statsArr[0] ?? {
    totalStatements: 0,
    totalTransactions: 0,
    totalChequingStatements: 0,
    totalCreditCardStatements: 0,
  }
  return { statements, stats }
}

export async function uploadStatement(
  file: File,
  options?: { bank?: string; accountType?: string }
): Promise<Statement[]> {
  const url = `${getApiBaseUrl()}/statements/upload`
  const formData = new FormData()
  formData.append('file', file)
  if (options?.bank) formData.append('bank', options.bank)
  if (options?.accountType) formData.append('accountType', options.accountType)

  const res = await fetch(url, { method: 'POST', body: formData })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Failed to upload statement: ${res.status} ${res.statusText} - ${text}`)
  }
  const data = await res.json()
  return extractArray<Statement>(data, 'statements')
}

export async function getStatementTransactions(statementId: string): Promise<StatementTransaction[]> {
  const body = await apiFetch(`/statements/${statementId}/transactions`)
  const obj = body as { transactions?: StatementTransaction[] }
  return Array.isArray(obj?.transactions) ? obj.transactions : []
}

export interface SaveStatementPayload {
  fileName: string
  bank?: string
  accountType?: string
  transactionsList?: StatementTransaction[]
}

export async function saveStatement(payload: SaveStatementPayload): Promise<Statement[]> {
  const body = await apiFetch('/statements', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return extractArray<Statement>(body, 'statements')
}

