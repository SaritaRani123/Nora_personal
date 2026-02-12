import express from 'express';
import { getStatements, getStatementTransactions, uploadStatement, saveStatement, upload } from '../controllers/statementsController.js';

const router = express.Router();

router.get('/', getStatements);
router.get('/:id/transactions', getStatementTransactions);
router.post('/upload', upload.single('file'), uploadStatement);
router.post('/', saveStatement);

export default router;
