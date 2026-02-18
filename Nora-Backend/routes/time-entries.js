import express from 'express'
import {
  getTimeEntries,
  createTimeEntry,
  updateTimeEntry,
  deleteTimeEntry,
} from '../controllers/timeEntriesController.js'

const router = express.Router()

router.get('/', getTimeEntries)
router.post('/', createTimeEntry)
router.patch('/:id', updateTimeEntry)
router.delete('/:id', deleteTimeEntry)

export default router
