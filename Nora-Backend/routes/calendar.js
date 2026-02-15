import express from 'express';
import { getCalendarConfig } from '../controllers/calendarConfigController.js';

const router = express.Router();

router.get('/config', getCalendarConfig);

export default router;
