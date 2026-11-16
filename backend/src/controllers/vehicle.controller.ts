
import { Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export const createVehicle = async (
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
      vehicleType,
      brand,
      model,
      registrationNo,
      purchaseDate,
      currentOdometer,
      fuelType,
      imageUrl,
    } = req.body;

    if (!vehicleType || !brand || !model) {
      res.status(400).json({
        success: false,
        message: 'Vehicle type, brand and model are required.',
      });
      return;
    }

    const normalizedRegistrationNo = registrationNo
      ? registrationNo.trim().toUpperCase()
      : null;

    if (normalizedRegistrationNo) {
      const existingVehicle = await prisma.vehicle.findUnique({
        where: {
          registrationNo: normalizedRegistrationNo,
        },
      });

      if (existingVehicle) {
        res.status(409).json({
          success: false,
          message: 'A vehicle with this registration number already exists.',
        });
        return;
      }
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        userId: req.user.userId,
        vehicleType: vehicleType.trim(),
        brand: brand.trim(),
        model: model.trim(),
        registrationNo: normalizedRegistrationNo,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        currentOdometer:
          currentOdometer !== undefined &&
          currentOdometer !== null &&
          currentOdometer !== ''
            ? Number(currentOdometer)
            : null,
        fuelType: fuelType?.trim() || null,
        imageUrl: imageUrl?.trim() || null,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Vehicle added successfully.',
      data: {
        vehicle,
      },
    });
  } catch (error) {
    console.error('Create vehicle error:', error);

    res.status(500).json({
      success: false,
      message: 'Unable to add vehicle.',
    });
  }
};

export const getVehicles = async (
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

    const vehicles = await prisma.vehicle.findMany({
      where: {
        userId: req.user.userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json({
      success: true,
      data: {
        vehicles,
      },
    });
  } catch (error) {
    console.error('Get vehicles error:', error);

    res.status(500).json({
      success: false,
      message: 'Unable to fetch vehicles.',
    });
  }
};

export const getVehicleById = async (
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

    const vehicleId = String(req.params.id);

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

    res.status(200).json({
      success: true,
      data: {
        vehicle,
      },
    });
  } catch (error) {
    console.error('Get vehicle error:', error);

    res.status(500).json({
      success: false,
      message: 'Unable to fetch vehicle.',
    });
  }
};

export const updateVehicle = async (
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

    const vehicleId = String(req.params.id);

    const existingVehicle = await prisma.vehicle.findFirst({
      where: {
        id: vehicleId,
        userId: req.user.userId,
      },
    });

    if (!existingVehicle) {
      res.status(404).json({
        success: false,
        message: 'Vehicle not found.',
      });
      return;
    }

    const {
      vehicleType,
      brand,
      model,
      registrationNo,
      purchaseDate,
      currentOdometer,
      fuelType,
      imageUrl,
    } = req.body;

    const normalizedRegistrationNo = registrationNo
      ? registrationNo.trim().toUpperCase()
      : null;

    if (normalizedRegistrationNo) {
      const duplicateVehicle = await prisma.vehicle.findFirst({
        where: {
          registrationNo: normalizedRegistrationNo,
          id: {
            not: vehicleId,
          },
        },
      });

      if (duplicateVehicle) {
        res.status(409).json({
          success: false,
          message: 'Another vehicle already uses this registration number.',
        });
        return;
      }
    }

    const vehicle = await prisma.vehicle.update({
      where: {
        id: vehicleId,
      },
      data: {
        vehicleType:
          vehicleType !== undefined
            ? vehicleType.trim()
            : existingVehicle.vehicleType,

        brand:
          brand !== undefined
            ? brand.trim()
            : existingVehicle.brand,

        model:
          model !== undefined
            ? model.trim()
            : existingVehicle.model,

        registrationNo: normalizedRegistrationNo,

        purchaseDate:
          purchaseDate !== undefined
            ? purchaseDate
              ? new Date(purchaseDate)
              : null
            : existingVehicle.purchaseDate,

        currentOdometer:
          currentOdometer !== undefined
            ? currentOdometer !== null && currentOdometer !== ''
              ? Number(currentOdometer)
              : null
            : existingVehicle.currentOdometer,

        fuelType:
          fuelType !== undefined
            ? fuelType?.trim() || null
            : existingVehicle.fuelType,

        imageUrl:
          imageUrl !== undefined
            ? imageUrl?.trim() || null
            : existingVehicle.imageUrl,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Vehicle updated successfully.',
      data: {
        vehicle,
      },
    });
  } catch (error) {
    console.error('Update vehicle error:', error);

    res.status(500).json({
      success: false,
      message: 'Unable to update vehicle.',
    });
  }
};

export const deleteVehicle = async (
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

    const vehicleId = String(req.params.id);

    const existingVehicle = await prisma.vehicle.findFirst({
      where: {
        id: vehicleId,
        userId: req.user.userId,
      },
    });

    if (!existingVehicle) {
      res.status(404).json({
        success: false,
        message: 'Vehicle not found.',
      });
      return;
    }

    await prisma.vehicle.delete({
      where: {
        id: vehicleId,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Vehicle deleted successfully.',
    });
  } catch (error) {
    console.error('Delete vehicle error:', error);

    res.status(500).json({
      success: false,
      message: 'Unable to delete vehicle.',
    });
  }
};
