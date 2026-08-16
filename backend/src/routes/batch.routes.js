import { Router } from 'express';
import batchController from '../controllers/batch.controller.js';
import { validateBatchesQuery, validateBatchId, validateBatchCreate, validateBatchUpdate } from '../middlewares/validate.js';
import authenticate from '../middlewares/authenticate.js';
import authorize from '../middlewares/authorize.js';

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/', validateBatchesQuery, batchController.getBatches);
router.post('/', validateBatchCreate, batchController.createBatch);
router.get('/:id', validateBatchId, batchController.getBatchById);
router.put('/:id', validateBatchUpdate, batchController.updateBatch);
router.delete('/:id', validateBatchId, batchController.deleteBatch);

export default router;
