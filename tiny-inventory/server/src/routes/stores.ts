import { Router } from 'express';
import * as storeController from '../controllers/store.controller';

const router = Router();

// GET /api/stores
router.get('/', storeController.getAllStores);

// GET /api/stores/:id - Includes non-trivial operation (Aggregation)
router.get('/:id', storeController.getStoreById);

export default router;
