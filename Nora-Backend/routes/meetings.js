import express from 'express'
import {
  getMeetings,
  createMeeting,
  updateMeeting,
  deleteMeeting,
} from '../controllers/meetingsController.js'

const router = express.Router()

router.get('/', getMeetings)
router.post('/', createMeeting)
router.patch('/:id', updateMeeting)
router.delete('/:id', deleteMeeting)

export default router
