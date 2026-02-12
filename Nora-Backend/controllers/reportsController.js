import {
  reportStats,
  categoryDistribution,
  spendingTrend,
  incomeVsExpenses,
  budgetComparison,
  insights,
  suggestions,
  profitLossTrend,
  topTransactions,
  categoryDrilldown,
  getHeatmapData,
} from '../data/reportsData.js';

/**
 * GET /reports
 * Returns all reports data. Top-level keys preserved for FE; arrays used where expected.
 */
export const getReports = (req, res) => {
  try {
    const reports = [{
      stats: reportStats[0],
      categoryDistribution,
      spendingTrend,
      profitLossTrend,
      incomeVsExpenses,
      budgetComparison,
      insights,
      suggestions,
      categoryDrilldown,
      topTransactions,
      heatmapData: getHeatmapData(),
    }];

    res.json({ reports });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
