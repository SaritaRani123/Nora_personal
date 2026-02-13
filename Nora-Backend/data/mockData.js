// Mock data for all entities
// All data is stored in arrays to match frontend expectations

export const expenses = [
  {
    id: 'exp-1',
    date: '2026-01-24',
    description: "McDonald's",
    category: 'food',
    amount: 45.99,
    paymentMethod: 'Debit Card',
    aiSuggested: true,
    confidence: 95,
    status: 'paid',
    source: 'import'
  },
  {
    id: 'exp-2',
    date: '2026-01-23',
    description: 'Staples - Office Supplies',
    category: 'office',
    amount: 234.5,
    paymentMethod: 'Credit Card',
    aiSuggested: true,
    confidence: 92,
    status: 'pending',
    source: 'import'
  },
  {
    id: 'exp-3',
    date: '2026-01-22',
    description: 'Shell Gas Station',
    category: 'fuel',
    amount: 78.0,
    paymentMethod: 'Credit Card',
    aiSuggested: true,
    confidence: 98,
    status: 'paid',
    source: 'import'
  },
  {
    id: 'exp-4',
    date: '2026-01-21',
    description: 'Adobe Creative Cloud',
    category: 'software',
    amount: 54.99,
    paymentMethod: 'Credit Card',
    aiSuggested: false,
    confidence: 100,
    status: 'paid',
    source: 'import'
  },
  {
    id: 'exp-5',
    date: '2026-01-20',
    description: 'Hydro One - Electricity',
    category: 'utilities',
    amount: 189.45,
    paymentMethod: 'Bank Transfer',
    aiSuggested: true,
    confidence: 88,
    status: 'overdue',
    source: 'import'
  },
  {
    id: 'exp-6',
    date: '2026-01-19',
    description: 'Google Ads Campaign',
    category: 'marketing',
    amount: 500.0,
    paymentMethod: 'Credit Card',
    aiSuggested: true,
    confidence: 91,
    status: 'pending',
    source: 'import'
  },
  {
    id: 'exp-7',
    date: '2026-01-18',
    description: 'Marriott Hotel - Toronto',
    category: 'travel',
    amount: 325.0,
    paymentMethod: 'Credit Card',
    aiSuggested: true,
    confidence: 94,
    status: 'paid',
    source: 'import'
  },
  {
    id: 'exp-8',
    date: '2026-01-17',
    description: 'Tim Hortons',
    category: 'food',
    amount: 12.5,
    paymentMethod: 'Debit Card',
    aiSuggested: true,
    confidence: 97,
    status: 'paid',
    source: 'import'
  },
  {
    id: 'exp-9',
    date: '2026-01-05',
    description: 'Business Insurance',
    amount: 450.0,
    category: 'insurance',
    paymentMethod: 'Bank Transfer',
    aiSuggested: true,
    confidence: 96,
    status: 'paid',
    source: 'import'
  },
  {
    id: 'exp-10',
    date: '2026-01-04',
    description: 'Employee Training',
    amount: 299.0,
    category: 'education',
    paymentMethod: 'Credit Card',
    aiSuggested: true,
    confidence: 88,
    status: 'paid',
    source: 'import'
  },
  {
    id: 'exp-11',
    date: '2026-01-03',
    description: 'Cloud Hosting - AWS',
    amount: 189.5,
    category: 'software',
    paymentMethod: 'Credit Card',
    aiSuggested: true,
    confidence: 98,
    status: 'paid',
    source: 'import'
  },
  {
    id: 'exp-12',
    date: '2026-01-02',
    description: 'Office Cleaning Service',
    amount: 150.0,
    category: 'utilities',
    paymentMethod: 'Bank Transfer',
    aiSuggested: true,
    confidence: 91,
    status: 'paid',
    source: 'import'
  }
];

export const categories = [
  { id: 'food', name: 'Food & Dining', code: '7012' },
  { id: 'office', name: 'Office Expenses', code: '4053' },
  { id: 'fuel', name: 'Fuel & Commute', code: '3242' },
  { id: 'utilities', name: 'Utilities', code: '4900' },
  { id: 'software', name: 'Software & Subscriptions', code: '5045' },
  { id: 'marketing', name: 'Marketing & Advertising', code: '7311' },
  { id: 'travel', name: 'Travel & Accommodation', code: '4722' },
  { id: 'insurance', name: 'Insurance', code: '6300' },
  { id: 'education', name: 'Education & Training', code: '8299' }
];

export const budget = [
  {
    year: '2025-2026',
    totalBudget: 100000,
    spent: 72450,
    categories: [
      { name: 'Marketing', budget: 25000, spent: 18500 },
      { name: 'Operations', budget: 30000, spent: 24200 },
      { name: 'Travel', budget: 15000, spent: 11800 },
      { name: 'Software', budget: 12000, spent: 8950 },
      { name: 'Office', budget: 10000, spent: 6200 },
      { name: 'Miscellaneous', budget: 8000, spent: 2800 }
    ]
  }
];

// Mock transactions per statement (visible after upload)
const mockTransactionsForStatement = (statementId, count = 10) => {
  const base = [
    { id: 'tx-1', date: '2026-01-15', description: 'Office Supplies', amount: 89.5, type: 'debit' },
    { id: 'tx-2', date: '2026-01-14', description: 'Deposit - Payroll', amount: 3500.0, type: 'credit' },
    { id: 'tx-3', date: '2026-01-13', description: 'Hydro Payment', amount: 189.45, type: 'debit' },
    { id: 'tx-4', date: '2026-01-12', description: 'Client Payment', amount: 1200.0, type: 'credit' },
    { id: 'tx-5', date: '2026-01-11', description: 'Software Subscription', amount: 54.99, type: 'debit' },
    { id: 'tx-6', date: '2026-01-10', description: 'Bank Fee', amount: 4.95, type: 'debit' },
    { id: 'tx-7', date: '2026-01-09', description: 'Transfer In', amount: 500.0, type: 'credit' },
    { id: 'tx-8', date: '2026-01-08', description: 'Gas Station', amount: 78.0, type: 'debit' },
    { id: 'tx-9', date: '2026-01-07', description: 'Consulting Fee', amount: 800.0, type: 'credit' },
    { id: 'tx-10', date: '2026-01-06', description: 'Internet', amount: 79.99, type: 'debit' },
  ];
  return base.slice(0, count).map((t, i) => ({ ...t, id: `${statementId}-tx-${i + 1}` }));
};

export const statements = [
  {
    id: 'st-1',
    fileName: 'scotiabank_jan_2025.pdf',
    uploadDate: '2026-01-20',
    status: 'completed',
    transactions: 45,
    bank: 'Scotiabank',
    accountType: 'Chequing',
    transactionsList: mockTransactionsForStatement('st-1', 12),
  },
  {
    id: 'st-2',
    fileName: 'td_dec_2024.pdf',
    uploadDate: '2026-01-05',
    status: 'completed',
    transactions: 52,
    bank: 'TD',
    accountType: 'Credit Card',
    transactionsList: mockTransactionsForStatement('st-2', 10),
  },
  {
    id: 'st-3',
    fileName: 'bmo_nov_2024.pdf',
    uploadDate: '2025-12-10',
    status: 'completed',
    transactions: 38,
    bank: 'BMO',
    accountType: 'Chequing',
    transactionsList: mockTransactionsForStatement('st-3', 10),
  },
];

export { mockTransactionsForStatement };

// For stats calculation
export const monthlyData = [
  { month: 'Aug', income: 9500, expenses: 6200 },
  { month: 'Sep', income: 11200, expenses: 7100 },
  { month: 'Oct', income: 10800, expenses: 6800 },
  { month: 'Nov', income: 12500, expenses: 7900 },
  { month: 'Dec', income: 14200, expenses: 8500 },
  { month: 'Jan', income: 11750, expenses: 7245 },
];

// Chart data (array form)
export const monthlyData12 = [
  { month: 'Feb', income: 8500, expenses: 5800 },
  { month: 'Mar', income: 9200, expenses: 6100 },
  { month: 'Apr', income: 10100, expenses: 6500 },
  { month: 'May', income: 9800, expenses: 6300 },
  { month: 'Jun', income: 10500, expenses: 6700 },
  { month: 'Jul', income: 9000, expenses: 5900 },
  { month: 'Aug', income: 9500, expenses: 6200 },
  { month: 'Sep', income: 11200, expenses: 7100 },
  { month: 'Oct', income: 10800, expenses: 6800 },
  { month: 'Nov', income: 12500, expenses: 7900 },
  { month: 'Dec', income: 14200, expenses: 8500 },
  { month: 'Jan', income: 11750, expenses: 7245 },
];

export const monthlyData24 = [
  { month: 'Feb 24', income: 7200, expenses: 4900 },
  { month: 'Apr 24', income: 7800, expenses: 5200 },
  { month: 'Jun 24', income: 8500, expenses: 5500 },
  { month: 'Aug 24', income: 9000, expenses: 5800 },
  { month: 'Oct 24', income: 8700, expenses: 5600 },
  { month: 'Dec 24', income: 9500, expenses: 6200 },
  { month: 'Feb 25', income: 8500, expenses: 5800 },
  { month: 'Apr 25', income: 10100, expenses: 6500 },
  { month: 'Jun 25', income: 10500, expenses: 6700 },
  { month: 'Aug 25', income: 9500, expenses: 6200 },
  { month: 'Oct 25', income: 10800, expenses: 6800 },
  { month: 'Jan 26', income: 11750, expenses: 7245 },
];

export const categoryExpenses12 = [
  { name: 'Food & Dining', value: 1250 },
  { name: 'Office Expenses', value: 890 },
  { name: 'Fuel & Commute', value: 650 },
  { name: 'Software', value: 420 },
  { name: 'Marketing', value: 1800 },
  { name: 'Other', value: 2235 },
];

export const categoryExpenses24 = [
  { name: 'Food & Dining', value: 2450 },
  { name: 'Office Expenses', value: 1680 },
  { name: 'Fuel & Commute', value: 1320 },
  { name: 'Software', value: 840 },
  { name: 'Marketing', value: 3500 },
  { name: 'Other', value: 4100 },
];

export const contacts = [
  {
    id: 'c-1',
    name: 'John Smith',
    email: 'john.smith@abccorp.com',
    phone: '+1 (555) 123-4567',
    address: '123 Business Ave, Toronto, ON M5V 2T6'
  },
  {
    id: 'c-2',
    name: 'Sarah Johnson',
    email: 'sarah.j@xyzltd.com',
    phone: '+1 (555) 234-5678',
    address: '456 Commerce St, Vancouver, BC V6B 1A1'
  },
  {
    id: 'c-3',
    name: 'Michael Chen',
    email: 'mchen@techinnovations.com',
    phone: '+1 (555) 345-6789',
    address: '789 Innovation Blvd, Montreal, QC H3B 2Y5'
  },
  {
    id: 'c-4',
    name: 'Emily Davis',
    email: 'emily.d@globalservices.com',
    phone: '+1 (555) 456-7890',
    address: '321 Enterprise Way, Calgary, AB T2P 3N4'
  },
  {
    id: 'c-5',
    name: 'Robert Wilson',
    email: 'rwilson@startupventures.io',
    phone: '+1 (555) 567-8901',
    address: '654 Startup Lane, Ottawa, ON K1P 5G3'
  }
];

const DEFAULT_PALETTE = { name: 'Ocean Blue', header: '#1e40af', accent: '#3b82f6', tableHeader: '#1e3a8a' };

export const invoices = [
  {
    id: 'INV-001',
    client: 'ABC Corporation',
    email: 'billing@abccorp.com',
    amount: 5000.0,
    status: 'paid',
    issueDate: '2026-01-10',
    dueDate: '2026-01-25',
    paidDate: '2026-01-20',
    source: 'manual',
    template: 'modern',
    colorPalette: DEFAULT_PALETTE,
    invoiceCurrency: 'CAD',
    lineItems: [{ itemType: 'item', item: 'Consulting Services', quantity: 1, unit: 'pcs', hours: 0, minutes: 0, price: 5000, taxId: null, description: '' }],
  },
  {
    id: 'INV-002',
    client: 'XYZ Ltd',
    email: 'accounts@xyzltd.com',
    amount: 2500.0,
    status: 'pending',
    issueDate: '2026-01-15',
    dueDate: '2026-01-30',
    paidDate: null,
    source: 'manual',
    template: 'classic',
    colorPalette: { name: 'Forest Green', header: '#166534', accent: '#22c55e', tableHeader: '#15803d' },
    invoiceCurrency: 'USD',
    lineItems: [{ itemType: 'item', item: 'Project Delivery', quantity: 1, unit: 'pcs', hours: 0, minutes: 0, price: 2500, taxId: null, description: '' }],
  },
  {
    id: 'INV-003',
    client: 'Tech Innovations Inc',
    email: 'finance@techinnovations.com',
    amount: 3750.0,
    status: 'overdue',
    issueDate: '2025-12-20',
    dueDate: '2026-01-05',
    paidDate: null,
    source: 'manual',
    template: 'formal',
    colorPalette: DEFAULT_PALETTE,
    invoiceCurrency: 'CAD',
    lineItems: [{ itemType: 'item', item: 'Development Services', quantity: 1, unit: 'pcs', hours: 0, minutes: 0, price: 3750, taxId: null, description: '' }],
  },
  {
    id: 'INV-004',
    client: 'Global Services Co',
    email: 'payments@globalservices.com',
    amount: 1800.0,
    status: 'draft',
    issueDate: '2026-01-22',
    dueDate: '2026-02-06',
    paidDate: null,
    source: 'manual',
    template: 'modern',
    colorPalette: DEFAULT_PALETTE,
    invoiceCurrency: 'CAD',
    lineItems: [{ itemType: 'item', item: 'Support Package', quantity: 1, unit: 'pcs', hours: 0, minutes: 0, price: 1800, taxId: null, description: '' }],
  },
  {
    id: 'INV-005',
    client: 'StartUp Ventures',
    email: 'billing@startupventures.io',
    amount: 4200.0,
    status: 'paid',
    issueDate: '2026-01-05',
    dueDate: '2026-01-20',
    paidDate: '2026-01-18',
    source: 'manual',
    template: 'modern',
    colorPalette: DEFAULT_PALETTE,
    invoiceCurrency: 'CAD',
    lineItems: [{ itemType: 'item', item: 'Advisory Services', quantity: 1, unit: 'pcs', hours: 0, minutes: 0, price: 4200, taxId: null, description: '' }],
  }
];

