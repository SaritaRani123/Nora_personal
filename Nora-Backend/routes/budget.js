import express from 'express';
import { getBudget } from '../controllers/budgetController.js';

const router = express.Router();

router.get('/', getBudget);

export default router;
