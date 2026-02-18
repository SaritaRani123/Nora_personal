import express from 'express';
import { getTravel, createTravel, updateTravel, deleteTravel } from '../controllers/travelController.js';

const router = express.Router();

router.get('/', getTravel);
router.post('/', createTravel);
router.put('/:id', updateTravel);
router.delete('/:id', deleteTravel);

export default router;
