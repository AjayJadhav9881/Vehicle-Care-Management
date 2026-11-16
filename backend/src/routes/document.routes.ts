
import { Router } from 'express';

import {
  createDocument,
  deleteDocument,
  getDocumentById,
  getDocumentsByVehicle,
  updateDocument,
} from '../controllers/document.controller';

import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', createDocument);

router.get(
  '/vehicle/:vehicleId',
  getDocumentsByVehicle
);

router.get('/:id', getDocumentById);

router.put('/:id', updateDocument);

router.delete('/:id', deleteDocument);

export default router;
