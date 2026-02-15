import express from 'express';
import { getStats, getCalendarSummary } from '../controllers/statsController.js';

const router = express.Router();

router.get('/', getStats);
router.get('/calendar-summary', getCalendarSummary);

export default router;
