import { expenses, monthlyData } from '../data/mockData.js';

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
