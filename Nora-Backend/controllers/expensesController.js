import { expenses } from '../data/mockData.js';

// In-memory store (replace with database in production)
let expensesStore = [...expenses];

// Helper to filter expenses
function filterExpenses(expensesList, filters) {
  let filtered = [...expensesList];

  if (filters.from) {
    filtered = filtered.filter(e => e.date >= filters.from);
  }
  if (filters.to) {
    filtered = filtered.filter(e => e.date <= filters.to);
  }
  if (filters.categoryId) {
    filtered = filtered.filter(e => e.category === filters.categoryId);
  }
  if (filters.status) {
    filtered = filtered.filter(e => e.status === filters.status);
  }

  return filtered;
}

export const getExpenses = (req, res) => {
  try {
    const { from, to, categoryId, status } = req.query;
    const filters = { from, to, categoryId, status };
    
    const filteredExpenses = filterExpenses(expensesStore, filters);
    
    // Return in array format
    res.json({ expenses: filteredExpenses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createExpense = (req, res) => {
  try {
    const newExpense = {
      id: `exp-${Date.now()}`,
      date: req.body.date || new Date().toISOString().split('T')[0],
      description: req.body.description || '',
      category: req.body.category || 'office',
      amount: req.body.amount || 0,
      paymentMethod: req.body.paymentMethod || 'Credit Card',
      aiSuggested: req.body.aiSuggested ?? false,
      confidence: req.body.confidence ?? 100,
      status: req.body.status || 'pending',
      source: req.body.source || 'manual'
    };

    expensesStore.unshift(newExpense); // Add to beginning
    
    // Return in array format
    res.status(201).json({ expenses: [newExpense] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateExpense = (req, res) => {
  try {
    const { id } = req.params;
    const index = expensesStore.findIndex(e => e.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    expensesStore[index] = {
      ...expensesStore[index],
      ...req.body
    };

    // Return in array format
    res.json({ expenses: [expensesStore[index]] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteExpense = (req, res) => {
  try {
    const { id } = req.params;
    const index = expensesStore.findIndex(e => e.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    expensesStore = expensesStore.filter(e => e.id !== id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
