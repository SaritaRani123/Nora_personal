import express from 'express';
import {
  changePassword,
  enable2FA,
  get2FAStatus,
  deleteAccount,
} from '../controllers/securityController.js';

const router = express.Router();

router.post('/change-password', changePassword);
router.post('/enable-2fa', enable2FA);
router.get('/2fa-status', get2FAStatus);
router.delete('/account', deleteAccount);

export default router;
