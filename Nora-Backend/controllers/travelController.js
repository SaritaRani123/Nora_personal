/** In-memory store for travel entries (persists for session; reset on server restart). */
let travelStore = [];

function filterTravel(list, filters) {
  let result = [...list];
  if (filters.from) {
    result = result.filter((e) => e.date >= filters.from);
  }
  if (filters.to) {
    result = result.filter((e) => e.date <= filters.to);
  }
  return result;
}

/**
 * GET /travel?from=YYYY-MM-DD&to=YYYY-MM-DD
 * Returns travel entries in date range.
 */
export const getTravel = (req, res) => {
  try {
    const { from, to } = req.query;
    const filtered = filterTravel(travelStore, { from, to });
    res.json({ travel: filtered });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /travel
 * Body: date, fromAddress, toAddress, roundTrip, stops[], billTo, distance, rate, taxes?, notes
 * total is computed: distance * rate * (roundTrip ? 2 : 1) + (taxes || 0)
 */
export const createTravel = (req, res) => {
  try {
    const id = `travel-${Date.now()}`;
    const date = req.body.date || new Date().toISOString().split('T')[0];
    const fromAddress = req.body.fromAddress ?? '';
    const toAddress = req.body.toAddress ?? '';
    const roundTrip = Boolean(req.body.roundTrip);
    const stops = Array.isArray(req.body.stops) ? req.body.stops : [];
    const billTo = req.body.billTo ?? '';
    const distance = Number(req.body.distance) || 0;
    const rate = Number(req.body.rate) || 0;
    const taxes = req.body.taxes != null && req.body.taxes !== '' ? Number(req.body.taxes) : 0;
    const notes = req.body.notes ?? '';

    const subtotal = distance * rate * (roundTrip ? 2 : 1);
    const total = subtotal + taxes;

    const entry = {
      id,
      date,
      fromAddress,
      toAddress,
      roundTrip,
      stops,
      billTo,
      distance,
      rate,
      taxes,
      notes,
      total,
    };
    travelStore.unshift(entry);
    res.status(201).json({ travel: [entry] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * PUT /travel/:id
 * Update an existing travel entry. Same body shape as POST.
 */
export const updateTravel = (req, res) => {
  try {
    const { id } = req.params;
    const index = travelStore.findIndex((e) => e.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Travel entry not found' });
    }
    const date = req.body.date ?? travelStore[index].date;
    const fromAddress = req.body.fromAddress !== undefined ? req.body.fromAddress : travelStore[index].fromAddress;
    const toAddress = req.body.toAddress !== undefined ? req.body.toAddress : travelStore[index].toAddress;
    const roundTrip = req.body.roundTrip !== undefined ? Boolean(req.body.roundTrip) : travelStore[index].roundTrip;
    const stops = Array.isArray(req.body.stops) ? req.body.stops : travelStore[index].stops ?? [];
    const billTo = req.body.billTo !== undefined ? req.body.billTo : (travelStore[index].billTo ?? '');
    const distance = req.body.distance !== undefined && req.body.distance !== '' ? Number(req.body.distance) : (travelStore[index].distance ?? 0);
    const rate = req.body.rate !== undefined && req.body.rate !== '' ? Number(req.body.rate) : (travelStore[index].rate ?? 0);
    const taxes = req.body.taxes != null && req.body.taxes !== '' ? Number(req.body.taxes) : (travelStore[index].taxes ?? 0);
    const notes = req.body.notes !== undefined ? req.body.notes : (travelStore[index].notes ?? '');

    const subtotal = distance * rate * (roundTrip ? 2 : 1);
    const total = subtotal + taxes;

    const entry = {
      id,
      date,
      fromAddress,
      toAddress,
      roundTrip,
      stops,
      billTo,
      distance,
      rate,
      taxes,
      notes,
      total,
    };
    travelStore[index] = entry;
    res.json({ travel: [entry] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * DELETE /travel/:id
 */
export const deleteTravel = (req, res) => {
  try {
    const { id } = req.params;
    const index = travelStore.findIndex((e) => e.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Travel entry not found' });
    }
    travelStore = travelStore.filter((e) => e.id !== id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
