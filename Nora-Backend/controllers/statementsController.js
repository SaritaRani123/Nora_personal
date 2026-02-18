import { statements, mockTransactionsForStatement } from '../data/mockData.js';
import multer from 'multer';

// Configure multer for file uploads
const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// In-memory store (replace with database in production)
let statementsStore = statements.map((s) => ({ ...s }));

// Helper function to get local date string (YYYY-MM-DD) without timezone conversion issues
function getLocalDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getStats() {
  return [{
    totalStatements: statementsStore.length,
    totalTransactions: statementsStore.reduce((sum, s) => sum + (s.transactions || 0), 0),
    totalChequingStatements: statementsStore.filter((s) => s.accountType === 'Chequing').length,
    totalCreditCardStatements: statementsStore.filter((s) => s.accountType === 'Credit Card').length,
  }];
}

export const getStatements = (req, res) => {
  try {
    // Return statements with transactions array for each (transactionsList or empty)
    const withTransactions = statementsStore.map((s) => ({
      ...s,
      transactionsList: s.transactionsList || [],
    }));
    res.json({ statements: withTransactions, stats: getStats() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getStatementTransactions = (req, res) => {
  try {
    const { id } = req.params;
    const statement = statementsStore.find((s) => s.id === id);
    if (!statement) {
      return res.status(404).json({ error: 'Statement not found' });
    }
    const transactionsList = statement.transactionsList || mockTransactionsForStatement(id, 10);
    res.json({ transactions: transactionsList });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Upload: validate file and return mock statement + transactions (do NOT persist).
// Statement is only persisted when the client calls POST /statements (saveStatement).
export const uploadStatement = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const bank = req.body?.bank || 'Scotiabank';
    const accountType = req.body?.accountType || 'Chequing';
    const newId = `st-${Date.now()}`;
    const transactionsList = mockTransactionsForStatement(newId, 8);

    const newStatement = {
      id: newId,
      fileName: req.file.originalname || 'uploaded.pdf',
      uploadDate: getLocalDateString(),
      status: 'completed',
      transactions: transactionsList.length,
      bank,
      accountType,
      transactionsList,
    };

    // Do not add to statementsStore here; only return for client to review.
    res.status(200).json({ statements: [newStatement], stats: getStats() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Save: persist a statement (called when user clicks Save in the dialog).
export const saveStatement = (req, res) => {
  try {
    const { fileName, bank, accountType, transactionsList } = req.body || {};
    const newId = `st-${Date.now()}`;
    const list = Array.isArray(transactionsList) ? transactionsList : mockTransactionsForStatement(newId, 8);

    const newStatement = {
      id: newId,
      fileName: fileName || 'uploaded.pdf',
      uploadDate: getLocalDateString(),
      status: 'completed',
      transactions: list.length,
      bank: bank || 'Scotiabank',
      accountType: accountType || 'Chequing',
      transactionsList: list,
    };

    statementsStore.unshift(newStatement);
    res.status(201).json({ statements: [newStatement], stats: getStats() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
