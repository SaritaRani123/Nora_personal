import express from 'express';
import { getPayableSummary } from '../controllers/payableSummaryController.js';

const router = express.Router();

router.get('/', getPayableSummary);

export default router;
