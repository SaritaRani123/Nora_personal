import express from 'express';
import {
  getContacts,
  createContact,
  updateContact,
  deleteContact,
} from '../controllers/contactsController.js';

const router = express.Router();

router.get('/', getContacts);
router.post('/', createContact);
router.put('/', updateContact);
router.delete('/', deleteContact);

export default router;
