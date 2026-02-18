import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DATA_FILE = path.join(__dirname, '../data/time-entries.json')

function loadStore() {
  try {
    const raw = readFileSync(DATA_FILE, 'utf8')
    const data = JSON.parse(raw)
    return Array.isArray(data) ? data : []
  } catch (err) {
    if (err.code === 'ENOENT') return []
    throw err
  }
}

function saveStore(store) {
  writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf8')
}

function filterByDateRange(list, from, to) {
  let result = [...list]
  if (from) result = result.filter((e) => e.date >= from)
  if (to) result = result.filter((e) => e.date <= to)
  return result
}

function filterUnbilledOnly(list, unbilledOnly) {
  if (unbilledOnly === 'true' || unbilledOnly === true) {
    return list.filter((e) => e.invoiceId == null)
  }
  return list
}

/**
 * GET /time-entries?from=YYYY-MM-DD&to=YYYY-MM-DD&unbilledOnly=true
 */
export const getTimeEntries = (req, res) => {
  try {
    const { from, to, unbilledOnly } = req.query
    const store = loadStore()
    let filtered = filterByDateRange(store, from, to)
    filtered = filterUnbilledOnly(filtered, unbilledOnly)
    res.json({ timeEntries: filtered })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

/** Only one timer can run globally: clear timerStartedAt on all entries. */
function clearAllOtherTimers(store) {
  store.forEach((e) => {
    if (e.timerStartedAt) e.timerStartedAt = null
  })
}

/**
 * POST /time-entries
 * Body: date, contactId, invoiceItem?, description?, hourlyRate, durationMinutes?, amount?, invoiceId?, timerStartedAt?
 * When timerStartedAt is set, all other entries get timerStartedAt cleared (single active timer).
 */
export const createTimeEntry = (req, res) => {
  try {
    const store = loadStore()
    if (req.body.timerStartedAt != null && req.body.timerStartedAt !== '') {
      clearAllOtherTimers(store)
      saveStore(store)
    }
    const id = `time-${Date.now()}`
    const date = req.body.date || new Date().toISOString().split('T')[0]
    const contactId = req.body.contactId ?? ''
    const invoiceItem = req.body.invoiceItem ?? ''
    const description = req.body.description ?? ''
    const hourlyRate = Number(req.body.hourlyRate) || 0
    const durationMinutes = Number(req.body.durationMinutes) || 0
    const timerStartedAt = req.body.timerStartedAt ?? null
    const amount = req.body.amount != null ? Number(req.body.amount) : (durationMinutes / 60) * hourlyRate
    const invoiceId = req.body.invoiceId ?? null

    const entry = {
      id,
      date,
      contactId,
      invoiceItem,
      description,
      hourlyRate,
      durationMinutes,
      amount: Math.round(amount * 100) / 100,
      invoiceId,
      timerStartedAt,
    }
    store.unshift(entry)
    saveStore(store)
    res.status(201).json({ timeEntries: [entry] })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

/**
 * PATCH /time-entries/:id
 * When setting timerStartedAt to a non-null value, all other entries get timerStartedAt cleared (single active timer).
 */
export const updateTimeEntry = (req, res) => {
  try {
    const { id } = req.params
    const store = loadStore()
    const index = store.findIndex((e) => e.id === id)
    if (index === -1) {
      return res.status(404).json({ error: 'Time entry not found' })
    }
    const current = store[index]
    const body = req.body
    const newTimerStartedAt = body.timerStartedAt !== undefined ? body.timerStartedAt : current.timerStartedAt
    if (newTimerStartedAt != null && newTimerStartedAt !== '') {
      clearAllOtherTimers(store)
      saveStore(store)
    }

    const date = body.date !== undefined ? body.date : current.date
    const contactId = body.contactId !== undefined ? body.contactId : current.contactId
    const invoiceItem = body.invoiceItem !== undefined ? body.invoiceItem : current.invoiceItem
    const description = body.description !== undefined ? body.description : current.description
    const hourlyRate = body.hourlyRate !== undefined ? Number(body.hourlyRate) : current.hourlyRate
    const durationMinutes = body.durationMinutes !== undefined ? Number(body.durationMinutes) : current.durationMinutes
    const timerStartedAt = newTimerStartedAt
    const invoiceId = body.invoiceId !== undefined ? body.invoiceId : current.invoiceId
    // Persist amount: use client value if sent, otherwise compute from duration and rate
    const amount =
      body.amount !== undefined && body.amount !== null && !Number.isNaN(Number(body.amount))
        ? Math.round(Number(body.amount) * 100) / 100
        : Math.round((durationMinutes / 60) * hourlyRate * 100) / 100

    const entry = {
      ...current,
      date,
      contactId,
      invoiceItem,
      description,
      hourlyRate,
      durationMinutes,
      amount,
      invoiceId,
      timerStartedAt,
    }
    store[index] = entry
    saveStore(store)
    res.json({ timeEntries: [entry] })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

/**
 * DELETE /time-entries/:id
 */
export const deleteTimeEntry = (req, res) => {
  try {
    const { id } = req.params
    const store = loadStore()
    const index = store.findIndex((e) => e.id === id)
    if (index === -1) {
      return res.status(404).json({ error: 'Time entry not found' })
    }
    store.splice(index, 1)
    saveStore(store)
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
