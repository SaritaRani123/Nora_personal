import express from 'express';
import {
  getInvoices,
  createInvoice,
  updateInvoice,
  deleteInvoice
} from '../controllers/invoicesController.js';

const router = express.Router();

router.get('/', getInvoices);
router.post('/', createInvoice);
router.patch('/:id', updateInvoice);
router.delete('/:id', deleteInvoice);

export default router;
