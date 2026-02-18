import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DATA_FILE = path.join(__dirname, '../data/meetings.json')

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

/**
 * GET /meetings?from=YYYY-MM-DD&to=YYYY-MM-DD
 */
export const getMeetings = (req, res) => {
  try {
    const { from, to } = req.query
    const store = loadStore()
    const filtered = filterByDateRange(store, from, to)
    res.json({ meetings: filtered })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

/**
 * POST /meetings
 * Body: date, startTime, endTime, contactId?, title, notes?
 */
export const createMeeting = (req, res) => {
  try {
    const store = loadStore()
    const id = `meeting-${Date.now()}`
    const now = new Date().toISOString()
    const date = req.body.date || new Date().toISOString().split('T')[0]
    const startTime = req.body.startTime ?? ''
    const endTime = req.body.endTime ?? ''
    const contactId = req.body.contactId ?? ''
    const title = req.body.title ?? ''
    const notes = req.body.notes ?? ''

    const meeting = {
      id,
      date,
      startTime,
      endTime,
      contactId,
      title,
      notes,
      createdAt: now,
      updatedAt: now,
    }
    store.unshift(meeting)
    saveStore(store)
    res.status(201).json({ meetings: [meeting] })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

/**
 * PATCH /meetings/:id
 */
export const updateMeeting = (req, res) => {
  try {
    const { id } = req.params
    const store = loadStore()
    const index = store.findIndex((e) => e.id === id)
    if (index === -1) {
      return res.status(404).json({ error: 'Meeting not found' })
    }
    const current = store[index]
    const body = req.body
    const now = new Date().toISOString()

    const meeting = {
      ...current,
      date: body.date !== undefined ? body.date : current.date,
      startTime: body.startTime !== undefined ? body.startTime : current.startTime,
      endTime: body.endTime !== undefined ? body.endTime : current.endTime,
      contactId: body.contactId !== undefined ? body.contactId : current.contactId,
      title: body.title !== undefined ? body.title : current.title,
      notes: body.notes !== undefined ? body.notes : current.notes,
      updatedAt: now,
    }
    store[index] = meeting
    saveStore(store)
    res.json({ meetings: [meeting] })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

/**
 * DELETE /meetings/:id
 */
export const deleteMeeting = (req, res) => {
  try {
    const { id } = req.params
    const store = loadStore()
    const index = store.findIndex((e) => e.id === id)
    if (index === -1) {
      return res.status(404).json({ error: 'Meeting not found' })
    }
    store.splice(index, 1)
    saveStore(store)
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
