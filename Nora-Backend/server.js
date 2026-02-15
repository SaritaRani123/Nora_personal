import express from 'express';
import cors from 'cors';
import expensesRoutes from './routes/expenses.js';
import categoriesRoutes from './routes/categories.js';
import budgetRoutes from './routes/budget.js';
import statementsRoutes from './routes/statements.js';
import contactsRoutes from './routes/contacts.js';
import invoicesRoutes from './routes/invoices.js';
import payableSummaryRoutes from './routes/payable-summary.js';
import statsRoutes from './routes/stats.js';
import chartsRoutes from './routes/charts.js';
import reportsRoutes from './routes/reports.js';
import configRoutes from './routes/config.js';
import paymentMethodsRoutes from './routes/payment-methods.js';
import workDoneRoutes from './routes/work-done.js';
import calendarRoutes from './routes/calendar.js';

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Frontend URL
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Nora Backend API is running' });
});

// API Routes
app.use('/expenses', expensesRoutes);
app.use('/categories', categoriesRoutes);
app.use('/budget', budgetRoutes);
app.use('/statements', statementsRoutes);
app.use('/contacts', contactsRoutes);
app.use('/invoices', invoicesRoutes);
app.use('/payable-summary', payableSummaryRoutes);
app.use('/stats', statsRoutes);
app.use('/charts', chartsRoutes);
app.use('/reports', reportsRoutes);
app.use('/config', configRoutes);
app.use('/payment-methods', paymentMethodsRoutes);
app.use('/work-done', workDoneRoutes);
app.use('/calendar', calendarRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Nora Backend API server running on http://localhost:${PORT}`);
  console.log(`📚 Health check: http://localhost:${PORT}/health`);
});
