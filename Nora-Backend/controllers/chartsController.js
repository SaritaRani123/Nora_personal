import {
  monthlyData12,
  monthlyData24,
  categoryExpenses12,
  categoryExpenses24,
} from '../data/mockData.js';

/**
 * GET /charts?range=12|24
 * Returns chart data in array form: { charts: [ { incomeExpenseData, categoryData } ] }
 */
export const getCharts = (req, res) => {
  try {
    const range = req.query.range || '12';
    const incomeExpenseData = range === '24' ? monthlyData24 : monthlyData12;
    const categoryData = range === '24' ? categoryExpenses24 : categoryExpenses12;

    const charts = [{
      incomeExpenseData,
      categoryData,
    }];

    res.json({ charts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
