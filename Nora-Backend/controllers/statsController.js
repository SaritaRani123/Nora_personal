import { expenses, monthlyData } from '../data/mockData.js';
import { getExpenseTotalsForRange } from './expensesController.js';
import { getWorkDoneSummaryForRange } from './workDoneController.js';
import { getIncomeTotalsForRange } from './invoicesController.js';

/**
 * Calendar summary for a date range: work done, expenses, income, net (from backend data only).
 * GET /stats/calendar-summary?from=YYYY-MM-DD&to=YYYY-MM-DD
 */
export const getCalendarSummary = (req, res) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) {
      return res.status(400).json({ error: 'Query params from and to (YYYY-MM-DD) are required' });
    }
    const expensesTotal = getExpenseTotalsForRange(from, to);
    const { amount: workDone, hours: hoursWorked } = getWorkDoneSummaryForRange(from, to);
    const incomeTotal = getIncomeTotalsForRange(from, to);
    const net = workDone + incomeTotal - expensesTotal;
    res.json({
      workDone: Math.round(workDone * 100) / 100,
      expenses: Math.round(expensesTotal * 100) / 100,
      income: Math.round(incomeTotal * 100) / 100,
      hoursWorked: Math.round(hoursWorked * 100) / 100,
      net: Math.round(net * 100) / 100,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Calculate dashboard stats from expenses and monthly data.
 * Income is no longer tracked; totalIncome is 0.
 * Returns array of one object to satisfy "array form" requirement.
 */
export const getStats = (req, res) => {
  try {
    const totalIncome = 0;
    const totalExpenses = expenses
      .filter((e) => e.status !== 'paid')
      .reduce((sum, e) => sum + e.amount, 0);
    const netProfit = totalIncome - totalExpenses;

    const currentMonth = monthlyData[monthlyData.length - 1];
    const previousMonth = monthlyData[monthlyData.length - 2] || currentMonth;

    const incomeChange = '0';
    const expensesChange = previousMonth.expenses > 0
      ? (((currentMonth.expenses - previousMonth.expenses) / previousMonth.expenses) * 100).toFixed(1)
      : '0';
    const currentProfit = currentMonth.income - currentMonth.expenses;
    const previousProfit = previousMonth.income - previousMonth.expenses;
    const profitChange = previousProfit !== 0
      ? (((currentProfit - previousProfit) / Math.abs(previousProfit)) * 100).toFixed(1)
      : '0';

    const stats = [{
      totalIncome: Math.round(totalIncome * 100) / 100,
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      netProfit: Math.round(netProfit * 100) / 100,
      incomeChange: `${Number(incomeChange) >= 0 ? '+' : ''}${incomeChange}%`,
      expensesChange: `${Number(expensesChange) >= 0 ? '+' : ''}${expensesChange}%`,
      profitChange: `${Number(profitChange) >= 0 ? '+' : ''}${profitChange}%`,
    }];

    res.json({ stats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
