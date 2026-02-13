import { invoices } from '../data/mockData.js';

// In-memory store (replace with database in production)
let invoicesStore = [...invoices];

export const getInvoices = (req, res) => {
  try {
    // Return in array format
    res.json({ invoices: invoicesStore });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createInvoice = (req, res) => {
  try {
    // Generate invoice ID
    const count = invoicesStore.length + 1;
    const id = `INV-${String(count).padStart(3, '0')}`;

    const newInvoice = {
      id,
      client: req.body.client || '',
      email: req.body.email || '',
      amount: req.body.amount || 0,
      status: req.body.status || 'draft',
      issueDate: req.body.issueDate || new Date().toISOString().split('T')[0],
      dueDate: req.body.dueDate || '',
      paidDate: req.body.paidDate || null,
      source: req.body.source || 'manual',
      template: req.body.template,
      colorPalette: req.body.colorPalette,
      invoiceCurrency: req.body.invoiceCurrency || 'CAD',
      lineItems: Array.isArray(req.body.lineItems) ? req.body.lineItems : undefined,
    };

    invoicesStore.unshift(newInvoice); // Add to beginning

    // Return in array format
    res.status(201).json({ invoices: [newInvoice] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateInvoice = (req, res) => {
  try {
    const { id } = req.params;
    const index = invoicesStore.findIndex(i => i.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    invoicesStore[index] = {
      ...invoicesStore[index],
      ...req.body
    };

    // Return in array format
    res.json({ invoices: [invoicesStore[index]] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteInvoice = (req, res) => {
  try {
    const { id } = req.params;
    const index = invoicesStore.findIndex(i => i.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    invoicesStore = invoicesStore.filter(i => i.id !== id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
