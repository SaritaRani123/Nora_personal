import { getInvoicesStore } from './invoicesController.js';
import { getExpensesStore } from './expensesController.js';

// Helper to calculate days difference
function getDaysDifference(date1, date2) {
  const diffTime = date1.getTime() - date2.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

// Helper to determine overdue bucket
function getOverdueBucket(daysOverdue) {
  if (daysOverdue <= 30) return '1_30';
  if (daysOverdue <= 60) return '31_60';
  if (daysOverdue <= 90) return '61_90';
  return 'over_90';
}

// Helper to create empty buckets
function createEmptyBuckets() {
  return {
    coming_due: { amount: 0, count: 0 },
    '1_30': { amount: 0, count: 0 },
    '31_60': { amount: 0, count: 0 },
    '61_90': { amount: 0, count: 0 },
    over_90: { amount: 0, count: 0 }
  };
}

// Helper to convert buckets to array
function bucketRecordToArray(buckets) {
  return [
    { label: 'Coming Due', key: 'coming_due', amount: buckets.coming_due.amount, count: buckets.coming_due.count, filterParam: 'coming_due' },
    { label: '1–30 Days Overdue', key: '1_30', amount: buckets['1_30'].amount, count: buckets['1_30'].count, filterParam: '1_30' },
    { label: '31–60 Days Overdue', key: '31_60', amount: buckets['31_60'].amount, count: buckets['31_60'].count, filterParam: '31_60' },
    { label: '61–90 Days Overdue', key: '61_90', amount: buckets['61_90'].amount, count: buckets['61_90'].count, filterParam: '61_90' },
    { label: '>90 Days Overdue', key: 'over_90', amount: buckets.over_90.amount, count: buckets.over_90.count, filterParam: 'over_90' }
  ];
}

// Calculate invoices payable buckets
function calculateInvoicesPayable(today) {
  const buckets = createEmptyBuckets();
  const invoices = getInvoicesStore();

  invoices.forEach(invoice => {
    if (invoice.status === 'paid') return;

    const dueDate = new Date(invoice.dueDate);

    if (invoice.status === 'pending') {
      buckets.coming_due.amount += invoice.amount;
      buckets.coming_due.count += 1;
    } else if (invoice.status === 'overdue') {
      const daysOverdue = getDaysDifference(today, dueDate);
      const bucket = getOverdueBucket(daysOverdue);
      buckets[bucket].amount += invoice.amount;
      buckets[bucket].count += 1;
    }
  });

  return bucketRecordToArray(buckets);
}

// Calculate bills owing buckets
function calculateBillsOwing(today) {
  const buckets = createEmptyBuckets();
  const expenses = getExpensesStore();

  expenses.forEach(expense => {
    if (expense.status === 'paid') return;

    if (expense.status === 'pending') {
      buckets.coming_due.amount += expense.amount;
      buckets.coming_due.count += 1;
    } else if (expense.status === 'overdue') {
      const dueDate = new Date(expense.date);
      const daysOverdue = getDaysDifference(today, dueDate);
      const bucket = getOverdueBucket(daysOverdue);
      buckets[bucket].amount += expense.amount;
      buckets[bucket].count += 1;
    }
  });

  return bucketRecordToArray(buckets);
}

export const getPayableSummary = (req, res) => {
  try {
    const today = new Date();

    const invoicesPayable = calculateInvoicesPayable(today);
    const billsOwing = calculateBillsOwing(today);

    const totalReceivable = invoicesPayable.reduce((sum, bucket) => sum + bucket.amount, 0);
    const totalPayable = billsOwing.reduce((sum, bucket) => sum + bucket.amount, 0);

    const summary = {
      invoicesPayable,
      billsOwing,
      totalReceivable,
      totalPayable
    };

    // Return in array format
    res.json({ payableSummary: [summary] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
