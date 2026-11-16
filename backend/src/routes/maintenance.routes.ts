
import { Router } from 'express';

import {
  createMaintenance,
  deleteMaintenance,
  getMaintenanceById,
  getMaintenanceByVehicle,
  updateMaintenance,
} from '../controllers/maintenance.controller';

import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', createMaintenance);

router.get(
  '/vehicle/:vehicleId',
  getMaintenanceByVehicle
);

router.get('/:id', getMaintenanceById);

router.put('/:id', updateMaintenance);

router.delete('/:id', deleteMaintenance);

export default router;