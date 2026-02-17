import { getInvoicesStore } from './invoicesController.js';
import { getExpensesStore } from './expensesController.js';
import { categories, budget } from '../data/mockData.js';

const CHART_COLORS = ['#22c55e', '#3b82f6', '#ef4444', '#eab308', '#a855f7', '#6b7280', '#ec4899', '#06b6d4'];

function toYYYYMMDD(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function startOfMonth(d) {
  const x = new Date(d);
  x.setDate(1);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfMonth(d) {
  const x = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  x.setHours(23, 59, 59, 999);
  return x;
}

function addMonths(d, n) {
  const x = new Date(d);
  x.setMonth(x.getMonth() + n);
  return x;
}

function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function diffDays(a, b) {
  const t = (new Date(b).getTime() - new Date(a).getTime()) / (24 * 60 * 60 * 1000);
  return Math.round(t);
}

/** Get date bounds from query: range=month|last-month|3-months|custom, optional from&to for custom. */
function getDateBounds(range, fromQuery, toQuery) {
  // When from and/or to are provided (custom range), use them with sensible defaults
  if (fromQuery || toQuery) {
    const now = new Date();
    now.setHours(12, 0, 0, 0);
    const todayStr = toYYYYMMDD(now);
    const oneYearAgo = addMonths(now, -12);
    const fromDefault = toYYYYMMDD(oneYearAgo);
    const fromStr = fromQuery || fromDefault;
    const toStr = toQuery || todayStr;
    const numDays = Math.max(1, diffDays(fromStr, toStr) + 1);
    return { fromStr, toStr, numDays };
  }
  const now = new Date();
  now.setHours(12, 0, 0, 0);
  let fromStr;
  let toStr;
  let numDays = 30;
  if (range === 'month') {
    const from = startOfMonth(now);
    const to = endOfMonth(now);
    fromStr = toYYYYMMDD(from);
    toStr = toYYYYMMDD(to);
    numDays = Math.max(1, diffDays(fromStr, toStr) + 1);
  } else if (range === 'last-month') {
    const prev = addMonths(now, -1);
    const from = startOfMonth(prev);
    const to = endOfMonth(prev);
    fromStr = toYYYYMMDD(from);
    toStr = toYYYYMMDD(to);
    numDays = Math.max(1, diffDays(fromStr, toStr) + 1);
  } else if (range === '3-months') {
    const from = startOfMonth(addMonths(now, -2));
    const to = endOfMonth(now);
    fromStr = toYYYYMMDD(from);
    toStr = toYYYYMMDD(to);
    numDays = Math.max(1, diffDays(fromStr, toStr) + 1);
  } else if (range === 'custom' && fromQuery && toQuery) {
    fromStr = fromQuery;
    toStr = toQuery;
    numDays = Math.max(1, diffDays(fromStr, toStr) + 1);
  } else {
    // default or custom without dates: last 365 days
    const to = endOfMonth(now);
    const from = addDays(startOfMonth(addMonths(now, -11)), 0);
    fromStr = toYYYYMMDD(from);
    toStr = toYYYYMMDD(to);
    numDays = Math.max(1, diffDays(fromStr, toStr) + 1);
  }
  return { fromStr, toStr, numDays };
}

function inRange(dateStr, fromStr, toStr) {
  if (!fromStr || !toStr) return true;
  return dateStr >= fromStr && dateStr <= toStr;
}

function getCategoryName(catId) {
  const c = categories.find((x) => x.id === catId);
  return c ? c.name : catId;
}

/** Build spendingTrend buckets: 7D (last 7 days), 30D (4 weeks), 3M (3 months), 1Y (12 months). */
function buildSpendingTrend(expensesInRange, fromStr, toStr) {
  const from = new Date(fromStr);
  const to = new Date(toStr);
  const dayMs = 24 * 60 * 60 * 1000;
  const byDate = {};
  expensesInRange.forEach((e) => {
    byDate[e.date] = (byDate[e.date] || 0) + e.amount;
  });
  const getLabel = (d) => toYYYYMMDD(d);
  const sevenD = [];
  for (let i = 6; i >= 0; i--) {
    const d = addDays(to, -i);
    const key = getLabel(d);
    sevenD.push({ date: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()], amount: byDate[key] || 0 });
  }
  const thirtyD = [];
  const weekStart = new Date(from);
  for (let w = 0; w < 4; w++) {
    const ws = addDays(weekStart, w * 7);
    const we = addDays(ws, 6);
    let sum = 0;
    for (let d = new Date(ws); d <= we; d.setDate(d.getDate() + 1)) {
      sum += byDate[getLabel(d)] || 0;
    }
    thirtyD.push({ date: `Week ${w + 1}`, amount: sum });
  }
  const threeM = [];
  for (let m = 0; m < 3; m++) {
    const monthStart = startOfMonth(addMonths(from, m));
    const monthEnd = endOfMonth(monthStart);
    let sum = 0;
    for (let d = new Date(monthStart); d <= monthEnd; d.setDate(d.getDate() + 1)) {
      sum += byDate[getLabel(d)] || 0;
    }
    threeM.push({
      date: monthStart.toLocaleString('default', { month: 'short' }),
      amount: sum,
    });
  }
  const oneY = [];
  for (let m = 0; m < 12; m++) {
    const monthStart = startOfMonth(addMonths(from, m));
    if (monthStart > to) break;
    const monthEnd = endOfMonth(monthStart);
    let sum = 0;
    for (let d = new Date(monthStart); d <= monthEnd; d.setDate(d.getDate() + 1)) {
      sum += byDate[getLabel(d)] || 0;
    }
    oneY.push({
      date: monthStart.toLocaleString('default', { month: 'short' }),
      amount: sum,
    });
  }
  return { '7D': sevenD, '30D': thirtyD, '3M': threeM, '1Y': oneY };
}

/** Build profitLossTrend: same buckets with income + expense + net. */
function buildProfitLossTrend(invoicesInRange, expensesInRange, fromStr, toStr) {
  const from = new Date(fromStr);
  const to = new Date(toStr);
  const incomeByDate = {};
  invoicesInRange.forEach((inv) => {
    const d = inv.paidDate || inv.issueDate;
    if (d) incomeByDate[d] = (incomeByDate[d] || 0) + (inv.amount || 0);
  });
  const expenseByDate = {};
  expensesInRange.forEach((e) => {
    expenseByDate[e.date] = (expenseByDate[e.date] || 0) + e.amount;
  });
  const getLabel = (d) => toYYYYMMDD(d);
  const sevenD = [];
  for (let i = 6; i >= 0; i--) {
    const d = addDays(to, -i);
    const key = getLabel(d);
    const inc = incomeByDate[key] || 0;
    const exp = expenseByDate[key] || 0;
    sevenD.push({
      date: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()],
      income: inc,
      expense: exp,
      netProfitLoss: inc - exp,
    });
  }
  const thirtyD = [];
  const weekStart = new Date(from);
  for (let w = 0; w < 4; w++) {
    const ws = addDays(weekStart, w * 7);
    const we = addDays(ws, 6);
    let inc = 0, exp = 0;
    for (let d = new Date(ws); d <= we; d.setDate(d.getDate() + 1)) {
      const key = getLabel(d);
      inc += incomeByDate[key] || 0;
      exp += expenseByDate[key] || 0;
    }
    thirtyD.push({ date: `Week ${w + 1}`, income: inc, expense: exp, netProfitLoss: inc - exp });
  }
  const threeM = [];
  for (let m = 0; m < 3; m++) {
    const monthStart = startOfMonth(addMonths(from, m));
    const monthEnd = endOfMonth(monthStart);
    let inc = 0, exp = 0;
    for (let d = new Date(monthStart); d <= monthEnd; d.setDate(d.getDate() + 1)) {
      const key = getLabel(d);
      inc += incomeByDate[key] || 0;
      exp += expenseByDate[key] || 0;
    }
    threeM.push({
      date: monthStart.toLocaleString('default', { month: 'short' }),
      income: inc,
      expense: exp,
      netProfitLoss: inc - exp,
    });
  }
  const oneY = [];
  for (let m = 0; m < 12; m++) {
    const monthStart = startOfMonth(addMonths(from, m));
    if (monthStart > to) break;
    const monthEnd = endOfMonth(monthStart);
    let inc = 0, exp = 0;
    for (let d = new Date(monthStart); d <= monthEnd; d.setDate(d.getDate() + 1)) {
      const key = getLabel(d);
      inc += incomeByDate[key] || 0;
      exp += expenseByDate[key] || 0;
    }
    oneY.push({
      date: monthStart.toLocaleString('default', { month: 'short' }),
      income: inc,
      expense: exp,
      netProfitLoss: inc - exp,
    });
  }
  return { '7D': sevenD, '30D': thirtyD, '3M': threeM, '1Y': oneY };
}

/** Monthly income vs expenses for the range. */
function buildIncomeVsExpenses(invoicesInRange, expensesInRange, fromStr, toStr) {
  const incomeByMonth = {};
  const expenseByMonth = {};
  invoicesInRange.forEach((inv) => {
    const dateToUse = inv.paidDate || inv.issueDate;
    if (dateToUse) {
      const m = dateToUse.slice(0, 7);
      incomeByMonth[m] = (incomeByMonth[m] || 0) + (inv.amount || 0);
    }
  });
  expensesInRange.forEach((e) => {
    const m = e.date.slice(0, 7);
    expenseByMonth[m] = (expenseByMonth[m] || 0) + e.amount;
  });
  const from = new Date(fromStr.slice(0, 7) + '-01');
  const to = new Date(toStr.slice(0, 7) + '-01');
  const result = [];
  for (let d = new Date(from.getFullYear(), from.getMonth(), 1); d <= to; d.setMonth(d.getMonth() + 1)) {
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const inc = incomeByMonth[key] || 0;
    const exp = expenseByMonth[key] || 0;
    result.push({
      month: d.toLocaleString('default', { month: 'short' }),
      income: inc,
      expenses: exp,
      netProfit: inc - exp,
    });
  }
  return result;
}

/** Heatmap: one entry per day in last 365 days from expenses. */
function buildHeatmapData(expensesAll) {
  const byDay = {};
  expensesAll.forEach((e) => {
    byDay[e.date] = (byDay[e.date] || 0) + e.amount;
  });
  const result = {};
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = addDays(today, -i);
    const key = toYYYYMMDD(d);
    const amount = byDay[key] || 0;
    const intensity =
      amount === 0
        ? 'none'
        : amount < 50
          ? 'low'
          : amount < 200
            ? 'medium'
            : amount < 500
              ? 'high'
              : 'very-high';
    result[key] = { amount, intensity };
  }
  return result;
}

/** Simple rule-based insights from real numbers. */
function buildInsights(totalIncome, totalExpenses, netSavings, savingsRate) {
  const list = [];
  if (totalIncome > 0 && savingsRate >= 20) {
    list.push({ id: '1', text: `Savings rate is ${savingsRate.toFixed(0)}% – good progress.`, type: 'positive' });
  }
  if (totalExpenses > 0 && totalIncome > 0 && totalExpenses > totalIncome) {
    list.push({ id: '2', text: 'Expenses exceed income this period. Consider reducing spending.', type: 'warning' });
  }
  if (netSavings > 0) {
    list.push({ id: '3', text: `Net savings: $${netSavings.toLocaleString()} in this period.`, type: 'info' });
  }
  if (list.length === 0) {
    list.push({ id: '1', text: 'Add income and expenses to see insights here.', type: 'info' });
  }
  return list;
}

/** Simple rule-based suggestions. */
function buildSuggestions(totalExpenses, savingsRate) {
  const list = [];
  if (totalExpenses > 0) {
    list.push({ id: '1', text: 'Review top expense categories to find savings.', type: 'tip' });
  }
  if (savingsRate < 10 && savingsRate >= 0) {
    list.push({ id: '2', text: 'Try to save at least 10% of income.', type: 'tip' });
  }
  if (list.length === 0) {
    list.push({ id: '1', text: 'Track expenses to get personalized suggestions.', type: 'tip' });
  }
  return list;
}

/**
 * GET /reports
 * Query: range=month|last-month|3-months|custom, optional from=&to= (YYYY-MM-DD) for custom.
 * Builds response from real invoices and expenses stores.
 */
export const getReports = (req, res) => {
  try {
    const range = req.query.range || 'month';
    const fromQuery = req.query.from;
    const toQuery = req.query.to;
    const { fromStr, toStr, numDays } = getDateBounds(range, fromQuery, toQuery);

    const invoices = getInvoicesStore();
    const expenses = getExpensesStore();

    const invoicesInRange = invoices.filter((i) => {
      if (i.status !== 'paid') return false;
      const dateToUse = i.paidDate || i.issueDate;
      return dateToUse && inRange(dateToUse, fromStr, toStr);
    });
    const expensesInRange = expenses.filter((e) => inRange(e.date, fromStr, toStr));

    const totalIncome = invoicesInRange.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
    const totalExpenses = expensesInRange.reduce((sum, e) => sum + Number(e.amount), 0);
    const netSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;
    const avgDailySpend = numDays > 0 ? totalExpenses / numDays : 0;

    const byCategory = {};
    expensesInRange.forEach((e) => {
      byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
    });
    const highestCategoryId = Object.keys(byCategory).sort((a, b) => byCategory[b] - byCategory[a])[0];
    const highestCategory = highestCategoryId ? getCategoryName(highestCategoryId) : '-';

    const prevFrom = toYYYYMMDD(addMonths(new Date(fromStr), -1));
    const prevTo = toYYYYMMDD(endOfMonth(addMonths(new Date(toStr), -1)));
    const prevInvoices = invoices.filter((i) => {
      if (i.status !== 'paid') return false;
      const dateToUse = i.paidDate || i.issueDate;
      return dateToUse && inRange(dateToUse, prevFrom, prevTo);
    });
    const prevExpenses = expenses.filter((e) => inRange(e.date, prevFrom, prevTo));
    const prevIncome = prevInvoices.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
    const prevExpensesSum = prevExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const prevNet = prevIncome - prevExpensesSum;
    const incomeChange =
      prevIncome > 0 ? ((totalIncome - prevIncome) / prevIncome) * 100 : totalIncome > 0 ? 100 : 0;
    const expenseChange =
      prevExpensesSum > 0 ? ((totalExpenses - prevExpensesSum) / prevExpensesSum) * 100 : totalExpenses > 0 ? 100 : 0;
    const savingsChange = prevNet !== 0 ? ((netSavings - prevNet) / Math.abs(prevNet)) * 100 : netSavings !== 0 ? 100 : 0;

    const stats = {
      totalIncome,
      totalExpenses,
      netSavings,
      savingsRate,
      avgDailySpend,
      highestCategory,
      monthlyAverage: totalExpenses,
      incomeChange,
      expenseChange,
      savingsChange,
    };

    const categoryDistribution = Object.entries(byCategory)
      .sort((a, b) => b[1] - a[1])
      .map(([catId, value], idx) => ({
        name: getCategoryName(catId),
        value,
        color: CHART_COLORS[idx % CHART_COLORS.length],
        budget: 0,
      }));

    const spendingTrend = buildSpendingTrend(expensesInRange, fromStr, toStr);
    const profitLossTrend = buildProfitLossTrend(invoicesInRange, expensesInRange, fromStr, toStr);
    const incomeVsExpenses = buildIncomeVsExpenses(invoicesInRange, expensesInRange, fromStr, toStr);

    const topTransactions = [...expensesInRange]
      .sort((a, b) => Number(b.amount) - Number(a.amount))
      .slice(0, 20)
      .map((e) => ({
        id: e.id,
        date: e.date,
        merchant: e.description || '-',
        category: getCategoryName(e.category),
        payment: e.paymentMethod || '-',
        amount: e.amount,
        tag: e.amount >= 500 ? 'high' : e.amount >= 100 ? 'medium' : 'low',
      }));

    const heatmapData = buildHeatmapData(expenses);

    const insights = buildInsights(totalIncome, totalExpenses, netSavings, savingsRate);
    const suggestions = buildSuggestions(totalExpenses, savingsRate);

    const categoryDrilldown = {};
    Object.entries(byCategory).forEach(([catId, total]) => {
      const catExpenses = expensesInRange.filter((e) => e.category === catId);
      const byDesc = {};
      catExpenses.forEach((e) => {
        const key = e.description || 'Other';
        if (!byDesc[key]) byDesc[key] = { amount: 0, count: 0 };
        byDesc[key].amount += e.amount;
        byDesc[key].count += 1;
      });
      const topMerchants = Object.entries(byDesc)
        .map(([name, o]) => ({ name, amount: o.amount, count: o.count }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);
      const weeklyData = [];
      const weekStart = new Date(fromStr);
      for (let w = 0; w < 4; w++) {
        const ws = addDays(weekStart, w * 7);
        const we = addDays(ws, 6);
        const wsStr = toYYYYMMDD(ws);
        const weStr = toYYYYMMDD(we);
        const sum = catExpenses
          .filter((e) => e.date >= wsStr && e.date <= weStr)
          .reduce((s, e) => s + e.amount, 0);
        weeklyData.push({ week: `W${w + 1}`, amount: sum });
      }
      const avgTransaction = catExpenses.length > 0 ? total / catExpenses.length : 0;
      categoryDrilldown[getCategoryName(catId)] = {
        total,
        avgTransaction,
        weeklyData,
        topMerchants,
      };
    });

    const budgetCategories = budget?.[0]?.categories ?? [];
    const budgetByName = Object.fromEntries(budgetCategories.map((b) => [b.name, b]));
    const expenseToBudgetMap = {
      'Marketing & Advertising': 'Marketing',
      'Office Expenses': 'Office',
      'Software & Subscriptions': 'Software',
      'Travel & Accommodation': 'Travel',
      'Food & Dining': 'Miscellaneous',
      'Fuel & Commute': 'Miscellaneous',
      'Utilities': 'Miscellaneous',
      'Insurance': 'Miscellaneous',
      'Education & Training': 'Miscellaneous',
    };
    const budgetComparison = categoryDistribution.map((c) => {
      const budgetCat = budgetByName[expenseToBudgetMap[c.name] || c.name] || budgetByName[c.name];
      const budgeted = budgetCat ? budgetCat.budget : 0;
      const spent = c.value;
      const remaining = budgeted - spent;
      const progress = budgeted > 0 ? (spent / budgeted) * 100 : 0;
      return { category: c.name, budgeted, spent, remaining, progress };
    });

    const reports = [
      {
        stats,
        categoryDistribution,
        spendingTrend,
        profitLossTrend,
        incomeVsExpenses,
        budgetComparison,
        insights,
        suggestions,
        categoryDrilldown,
        topTransactions,
        heatmapData,
      },
    ];

    res.json({ reports });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
