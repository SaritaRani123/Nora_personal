// Mock reports data - all arrays for frontend

export const reportStats = [
  {
    totalIncome: 142500,
    totalExpenses: 88450,
    netSavings: 54050,
    savingsRate: 37.9,
    avgDailySpend: 2948,
    highestCategory: 'Marketing',
    monthlyAverage: 7370,
    incomeChange: 12.5,
    expenseChange: -8.2,
    savingsChange: 18.4,
  },
];

export const categoryDistribution = [
  { name: 'Food', value: 2850, color: '#22c55e', budget: 3000 },
  { name: 'Travel', value: 4200, color: '#3b82f6', budget: 4000 },
  { name: 'Office', value: 1890, color: '#8b5cf6', budget: 2000 },
  { name: 'Fuel', value: 1650, color: '#f59e0b', budget: 1500 },
  { name: 'Marketing', value: 5800, color: '#ec4899', budget: 5000 },
  { name: 'Bills', value: 3200, color: '#06b6d4', budget: 3500 },
  { name: 'Shopping', value: 1860, color: '#ef4444', budget: 2000 },
];

export const spendingTrend = {
  '7D': [
    { date: 'Mon', amount: 245 },
    { date: 'Tue', amount: 380 },
    { date: 'Wed', amount: 520 },
    { date: 'Thu', amount: 290 },
    { date: 'Fri', amount: 680 },
    { date: 'Sat', amount: 450 },
    { date: 'Sun', amount: 320 },
  ],
  '30D': [
    { date: 'Week 1', amount: 2100 },
    { date: 'Week 2', amount: 2450 },
    { date: 'Week 3', amount: 1980 },
    { date: 'Week 4', amount: 2720 },
  ],
  '3M': [
    { date: 'Nov', amount: 7900 },
    { date: 'Dec', amount: 8500 },
    { date: 'Jan', amount: 7245 },
  ],
  '1Y': [
    { date: 'Feb', amount: 6200 },
    { date: 'Mar', amount: 5800 },
    { date: 'Apr', amount: 6100 },
    { date: 'May', amount: 6800 },
    { date: 'Jun', amount: 7200 },
    { date: 'Jul', amount: 7500 },
    { date: 'Aug', amount: 6200 },
    { date: 'Sep', amount: 7100 },
    { date: 'Oct', amount: 6800 },
    { date: 'Nov', amount: 7900 },
    { date: 'Dec', amount: 8500 },
    { date: 'Jan', amount: 7245 },
  ],
};

export const incomeVsExpenses = [
  { month: 'Aug', income: 9500, expenses: 6200, netProfit: 3300 },
  { month: 'Sep', income: 11200, expenses: 7100, netProfit: 4100 },
  { month: 'Oct', income: 10800, expenses: 6800, netProfit: 4000 },
  { month: 'Nov', income: 12500, expenses: 7900, netProfit: 4600 },
  { month: 'Dec', income: 14200, expenses: 8500, netProfit: 5700 },
  { month: 'Jan', income: 11750, expenses: 7245, netProfit: 4505 },
];

export const budgetComparison = [
  { category: 'Food', budgeted: 3000, spent: 2850, remaining: 150, progress: 95 },
  { category: 'Travel', budgeted: 4000, spent: 4200, remaining: -200, progress: 105 },
  { category: 'Office', budgeted: 2000, spent: 1890, remaining: 110, progress: 94.5 },
  { category: 'Fuel', budgeted: 1500, spent: 1650, remaining: -150, progress: 110 },
  { category: 'Marketing', budgeted: 5000, spent: 5800, remaining: -800, progress: 116 },
  { category: 'Bills', budgeted: 3500, spent: 3200, remaining: 300, progress: 91.4 },
  { category: 'Shopping', budgeted: 2000, spent: 1860, remaining: 140, progress: 93 },
];

export const insights = [
  { id: '1', text: 'You spent 18% more than last month', type: 'warning' },
  { id: '2', text: 'Highest spending day: Friday', type: 'info' },
  { id: '3', text: 'Food accounts for 32% of expenses', type: 'info' },
  { id: '4', text: 'Marketing budget exceeded by 16%', type: 'warning' },
];

export const suggestions = [
  { id: '1', text: 'Set a Food budget cap of $300', type: 'tip' },
  { id: '2', text: 'Reduce subscriptions to increase savings rate', type: 'tip' },
  { id: '3', text: 'Great job keeping Office costs under budget!', type: 'good' },
  { id: '4', text: 'Consider fuel card for 5% savings', type: 'tip' },
];

export const profitLossTrend = {
  '7D': [
    { date: 'Mon', income: 450, expense: 245, netProfitLoss: 205 },
    { date: 'Tue', income: 320, expense: 380, netProfitLoss: -60 },
    { date: 'Wed', income: 680, expense: 520, netProfitLoss: 160 },
    { date: 'Thu', income: 250, expense: 290, netProfitLoss: -40 },
    { date: 'Fri', income: 890, expense: 680, netProfitLoss: 210 },
    { date: 'Sat', income: 420, expense: 450, netProfitLoss: -30 },
    { date: 'Sun', income: 380, expense: 320, netProfitLoss: 60 },
  ],
  '30D': [
    { date: 'Week 1', income: 2800, expense: 2100, netProfitLoss: 700 },
    { date: 'Week 2', income: 2200, expense: 2450, netProfitLoss: -250 },
    { date: 'Week 3', income: 2650, expense: 1980, netProfitLoss: 670 },
    { date: 'Week 4', income: 3100, expense: 2720, netProfitLoss: 380 },
  ],
  '3M': [
    { date: 'Nov', income: 12500, expense: 7900, netProfitLoss: 4600 },
    { date: 'Dec', income: 14200, expense: 8500, netProfitLoss: 5700 },
    { date: 'Jan', income: 11750, expense: 7245, netProfitLoss: 4505 },
  ],
  '1Y': [
    { date: 'Feb', income: 8200, expense: 6200, netProfitLoss: 2000 },
    { date: 'Mar', income: 7500, expense: 5800, netProfitLoss: 1700 },
    { date: 'Apr', income: 6800, expense: 6100, netProfitLoss: 700 },
    { date: 'May', income: 5900, expense: 6800, netProfitLoss: -900 },
    { date: 'Jun', income: 8100, expense: 7200, netProfitLoss: 900 },
    { date: 'Jul', income: 9200, expense: 7500, netProfitLoss: 1700 },
    { date: 'Aug', income: 9500, expense: 6200, netProfitLoss: 3300 },
    { date: 'Sep', income: 11200, expense: 7100, netProfitLoss: 4100 },
    { date: 'Oct', income: 10800, expense: 6800, netProfitLoss: 4000 },
    { date: 'Nov', income: 12500, expense: 7900, netProfitLoss: 4600 },
    { date: 'Dec', income: 14200, expense: 8500, netProfitLoss: 5700 },
    { date: 'Jan', income: 11750, expense: 7245, netProfitLoss: 4505 },
  ],
};

export const topTransactions = [
  { id: '1', date: '2025-01-24', merchant: 'Google Ads', category: 'Marketing', payment: 'Card', amount: 1500, tag: 'high' },
  { id: '2', date: '2025-01-22', merchant: 'AWS Services', category: 'Bills', payment: 'Card', amount: 1200, tag: 'high' },
  { id: '3', date: '2025-01-20', merchant: 'United Airlines', category: 'Travel', payment: 'Card', amount: 950, tag: 'high' },
  { id: '4', date: '2025-01-18', merchant: 'Facebook Ads', category: 'Marketing', payment: 'Card', amount: 850, tag: 'high' },
  { id: '5', date: '2025-01-17', merchant: 'Marriott Hotel', category: 'Travel', payment: 'Card', amount: 680, tag: 'medium' },
  { id: '6', date: '2025-01-15', merchant: 'Amazon', category: 'Office', payment: 'Card', amount: 520, tag: 'medium' },
  { id: '7', date: '2025-01-14', merchant: 'Whole Foods', category: 'Food', payment: 'Card', amount: 380, tag: 'medium' },
  { id: '8', date: '2025-01-12', merchant: 'LinkedIn Ads', category: 'Marketing', payment: 'Card', amount: 350, tag: 'medium' },
  { id: '9', date: '2025-01-10', merchant: 'Staples', category: 'Office', payment: 'Card', amount: 245, tag: 'low' },
  { id: '10', date: '2025-01-08', merchant: 'Shell', category: 'Fuel', payment: 'Card', amount: 78, tag: 'low' },
];

function generateHeatmapData() {
  const data = {};
  const today = new Date();
  const start = new Date(today);
  start.setDate(start.getDate() - 364);
  start.setDate(start.getDate() - start.getDay());

  const seededRandom = (seed) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().split('T')[0];
    const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
    if (seededRandom(seed) < 0.3) {
      data[key] = { amount: 0, intensity: 'none' };
    } else {
      const amount = Math.floor(seededRandom(seed + 1) * 750) + 50;
      data[key] = {
        amount,
        intensity: amount < 150 ? 'low' : amount < 400 ? 'medium' : amount < 600 ? 'high' : 'very-high',
      };
    }
  }
  return data;
}

export const categoryDrilldown = {
  Food: {
    total: 2850,
    avgTransaction: 47.5,
    weeklyData: [
      { week: 'W1', amount: 680 },
      { week: 'W2', amount: 720 },
      { week: 'W3', amount: 650 },
      { week: 'W4', amount: 800 },
    ],
    topMerchants: [
      { name: 'Whole Foods', amount: 890, count: 8 },
      { name: 'Starbucks', amount: 420, count: 15 },
      { name: "McDonald's", amount: 380, count: 12 },
      { name: 'Chipotle', amount: 560, count: 9 },
    ],
  },
  Travel: {
    total: 4200,
    avgTransaction: 350,
    weeklyData: [
      { week: 'W1', amount: 1200 },
      { week: 'W2', amount: 800 },
      { week: 'W3', amount: 1500 },
      { week: 'W4', amount: 700 },
    ],
    topMerchants: [
      { name: 'United Airlines', amount: 1800, count: 3 },
      { name: 'Marriott', amount: 1200, count: 4 },
      { name: 'Uber', amount: 650, count: 18 },
      { name: 'Enterprise', amount: 550, count: 2 },
    ],
  },
};

export function getHeatmapData() {
  return generateHeatmapData();
}
