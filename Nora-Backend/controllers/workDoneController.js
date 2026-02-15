import { workDoneEntries as initialWorkDone } from '../data/mockData.js';

let workDoneStore = [...initialWorkDone];

function filterWorkDone(list, filters) {
  let result = [...list];
  if (filters.from) {
    result = result.filter((e) => e.date >= filters.from);
  }
  if (filters.to) {
    result = result.filter((e) => e.date <= filters.to);
  }
  if (filters.unbilledOnly === 'true' || filters.unbilledOnly === true) {
    result = result.filter((e) => e.invoiceId == null);
  }
  return result;
}

export const getWorkDone = (req, res) => {
  try {
    const { from, to, unbilledOnly } = req.query;
    const filtered = filterWorkDone(workDoneStore, { from, to, unbilledOnly });
    res.json({ workDone: filtered });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createWorkDone = (req, res) => {
  try {
    const id = `work-${Date.now()}`;
    const entry = {
      id,
      date: req.body.date || new Date().toISOString().split('T')[0],
      contact: req.body.contact || '',
      description: req.body.description || 'Work Done',
      hours: Number(req.body.hours) || 0,
      rate: Number(req.body.rate) || 0,
      amount: Number(req.body.amount) || 0,
      invoiceId: req.body.invoiceId ?? null,
    };
    workDoneStore.unshift(entry);
    res.status(201).json({ workDone: [entry] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const markWorkDoneAsInvoiced = (req, res) => {
  try {
    const { ids, invoiceId } = req.body;
    if (!Array.isArray(ids) || !invoiceId) {
      return res.status(400).json({ error: 'ids (array) and invoiceId are required' });
    }
    const idSet = new Set(ids);
    workDoneStore = workDoneStore.map((e) =>
      idSet.has(e.id) ? { ...e, invoiceId } : e
    );
    res.json({ workDone: workDoneStore.filter((e) => idSet.has(e.id)) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteWorkDone = (req, res) => {
  try {
    const { id } = req.params;
    const index = workDoneStore.findIndex((e) => e.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Work done entry not found' });
    }
    workDoneStore = workDoneStore.filter((e) => e.id !== id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/** Sum of work-done amount and hours in date range [from, to]. For calendar summary. */
export function getWorkDoneSummaryForRange(from, to) {
  if (!from || !to) return { amount: 0, hours: 0 };
  const filtered = filterWorkDone(workDoneStore, { from, to });
  const amount = filtered.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const hours = filtered.reduce((s, e) => s + (Number(e.hours) || 0), 0);
  return { amount, hours };
}
