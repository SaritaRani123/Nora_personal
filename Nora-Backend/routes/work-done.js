import express from 'express';
import {
  getWorkDone,
  createWorkDone,
  markWorkDoneAsInvoiced,
  updateWorkDone,
  deleteWorkDone,
} from '../controllers/workDoneController.js';

const router = express.Router();

router.get('/', getWorkDone);
router.post('/', createWorkDone);
router.patch('/mark-invoiced', markWorkDoneAsInvoiced);
router.patch('/:id', updateWorkDone);
router.delete('/:id', deleteWorkDone);

export default router;
