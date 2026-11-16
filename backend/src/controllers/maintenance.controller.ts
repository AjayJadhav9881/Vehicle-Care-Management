
import { Response } from 'express';
import { prisma } from '../config/prisma';
import { Prisma } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

const validateDate = (value: string): Date | null => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
};

const validateNonNegativeNumber = (
  value: unknown
): number | null => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const numberValue = Number(value);

  if (Number.isNaN(numberValue) || numberValue < 0) {
    return null;
  }

  return numberValue;
};

export const createMaintenance = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
      return;
    }

    const {
      vehicleId,
      serviceType,
      serviceDate,
      odometer,
      cost,
      notes,
    } = req.body;

    if (!vehicleId) {
      res.status(400).json({
        success: false,
        message: 'Vehicle ID is required.',
      });
      return;
    }

    if (!serviceType || !serviceType.trim()) {
      res.status(400).json({
        success: false,
        message: 'Service type is required.',
      });
      return;
    }

    if (!serviceDate) {
      res.status(400).json({
        success: false,
        message: 'Service date is required.',
      });
      return;
    }

    const parsedDate = validateDate(serviceDate);

    if (!parsedDate) {
      res.status(400).json({
        success: false,
        message: 'Invalid service date.',
      });
      return;
    }

    const vehicle = await prisma.vehicle.findFirst({
      where: {
        id: String(vehicleId),
        userId: req.user.userId,
      },
    });

    if (!vehicle) {
      res.status(404).json({
        success: false,
        message: 'Vehicle not found.',
      });
      return;
    }

    const parsedOdometer = validateNonNegativeNumber(odometer);

    if (
      odometer !== undefined &&
      odometer !== null &&
      odometer !== '' &&
      (parsedOdometer === null ||
        !Number.isInteger(parsedOdometer))
    ) {
      res.status(400).json({
        success: false,
        message: 'Odometer must be a valid whole number.',
      });
      return;
    }

    const parsedCost = validateNonNegativeNumber(cost);

    if (
      cost !== undefined &&
      cost !== null &&
      cost !== '' &&
      parsedCost === null
    ) {
      res.status(400).json({
        success: false,
        message: 'Cost must be a valid non-negative number.',
      });
      return;
    }

    const maintenance = await prisma.maintenanceRecord.create({
      data: {
        vehicleId: String(vehicleId),
        serviceType: serviceType.trim(),
        serviceDate: parsedDate,
        odometer: parsedOdometer,
        cost: parsedCost,
        notes: notes?.trim() || null,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Maintenance record added successfully.',
      data: {
        maintenance,
      },
    });
  } catch (error) {
    console.error('Create maintenance error:', error);

    res.status(500).json({
      success: false,
      message: 'Unable to add maintenance record.',
    });
  }
};

export const getMaintenanceByVehicle = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
      return;
    }

    const vehicleId = String(req.params.vehicleId);

    const vehicle = await prisma.vehicle.findFirst({
      where: {
        id: vehicleId,
        userId: req.user.userId,
      },
    });

    if (!vehicle) {
      res.status(404).json({
        success: false,
        message: 'Vehicle not found.',
      });
      return;
    }

    const maintenanceRecords =
      await prisma.maintenanceRecord.findMany({
        where: {
          vehicleId,
        },
        orderBy: {
          serviceDate: 'desc',
        },
      });

    res.status(200).json({
      success: true,
      data: {
        maintenanceRecords,
      },
    });
  } catch (error) {
    console.error('Get maintenance records error:', error);

    res.status(500).json({
      success: false,
      message: 'Unable to fetch maintenance records.',
    });
  }
};

export const getMaintenanceById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
      return;
    }

    const maintenanceId = String(req.params.id);

    const maintenance =
      await prisma.maintenanceRecord.findFirst({
        where: {
          id: maintenanceId,
          vehicle: {
            userId: req.user.userId,
          },
        },
        include: {
          vehicle: true,
        },
      });

    if (!maintenance) {
      res.status(404).json({
        success: false,
        message: 'Maintenance record not found.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        maintenance,
      },
    });
  } catch (error) {
    console.error('Get maintenance error:', error);

    res.status(500).json({
      success: false,
      message: 'Unable to fetch maintenance record.',
    });
  }
};

export const updateMaintenance = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
      return;
    }

    const maintenanceId = String(req.params.id);

    const existingMaintenance =
      await prisma.maintenanceRecord.findFirst({
        where: {
          id: maintenanceId,
          vehicle: {
            userId: req.user.userId,
          },
        },
      });

    if (!existingMaintenance) {
      res.status(404).json({
        success: false,
        message: 'Maintenance record not found.',
      });
      return;
    }

    const {
      serviceType,
      serviceDate,
      odometer,
      cost,
      notes,
    } = req.body;

    if (
      serviceType !== undefined &&
      !serviceType.trim()
    ) {
      res.status(400).json({
        success: false,
        message: 'Service type cannot be empty.',
      });
      return;
    }

    let parsedDate =
      existingMaintenance.serviceDate;

    if (serviceDate !== undefined) {
      const date = validateDate(serviceDate);

      if (!date) {
        res.status(400).json({
          success: false,
          message: 'Invalid service date.',
        });
        return;
      }

      parsedDate = date;
    }

    let parsedOdometer =
      existingMaintenance.odometer;

    if (odometer !== undefined) {
      parsedOdometer = validateNonNegativeNumber(
        odometer
      );

      if (
        odometer !== null &&
        odometer !== '' &&
        (parsedOdometer === null ||
          !Number.isInteger(parsedOdometer))
      ) {
        res.status(400).json({
          success: false,
          message: 'Odometer must be a valid whole number.',
        });
        return;
      }
    }

    let parsedCost = existingMaintenance.cost;

    if (cost !== undefined) {
      const numericCost =
        validateNonNegativeNumber(cost);

      if (
        cost !== null &&
        cost !== '' &&
        numericCost === null
      ) {
        res.status(400).json({
          success: false,
          message: 'Cost must be a valid non-negative number.',
        });
        return;
      }

      parsedCost =
        numericCost === null
          ? null
          : new Prisma.Decimal(numericCost);
    }

    const maintenance =
      await prisma.maintenanceRecord.update({
        where: {
          id: maintenanceId,
        },
        data: {
          serviceType:
            serviceType !== undefined
              ? serviceType.trim()
              : existingMaintenance.serviceType,

          serviceDate: parsedDate,

          odometer: parsedOdometer,

          cost: parsedCost,

          notes:
            notes !== undefined
              ? notes?.trim() || null
              : existingMaintenance.notes,
        },
      });

    res.status(200).json({
      success: true,
      message: 'Maintenance record updated successfully.',
      data: {
        maintenance,
      },
    });
  } catch (error) {
    console.error('Update maintenance error:', error);

    res.status(500).json({
      success: false,
      message: 'Unable to update maintenance record.',
    });
  }
};

export const deleteMaintenance = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
      return;
    }

    const maintenanceId = String(req.params.id);

    const existingMaintenance =
      await prisma.maintenanceRecord.findFirst({
        where: {
          id: maintenanceId,
          vehicle: {
            userId: req.user.userId,
          },
        },
      });

    if (!existingMaintenance) {
      res.status(404).json({
        success: false,
        message: 'Maintenance record not found.',
      });
      return;
    }

    await prisma.maintenanceRecord.delete({
      where: {
        id: maintenanceId,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Maintenance record deleted successfully.',
    });
  } catch (error) {
    console.error('Delete maintenance error:', error);

    res.status(500).json({
      success: false,
      message: 'Unable to delete maintenance record.',
    });
  }
};
