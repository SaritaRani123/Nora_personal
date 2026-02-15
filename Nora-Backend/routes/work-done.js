import express from 'express';
import {
  getWorkDone,
  createWorkDone,
  markWorkDoneAsInvoiced,
  deleteWorkDone,
} from '../controllers/workDoneController.js';

const router = express.Router();

router.get('/', getWorkDone);
router.post('/', createWorkDone);
router.patch('/mark-invoiced', markWorkDoneAsInvoiced);
router.delete('/:id', deleteWorkDone);

export default router;
