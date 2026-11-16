
import { Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

const parseDate = (value: unknown): Date | null => {
  if (!value || typeof value !== 'string') {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
};

export const createDocument = async (
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
      documentType,
      documentNumber,
      issueDate,
      expiryDate,
      fileUrl,
      notes,
    } = req.body;

    if (!vehicleId) {
      res.status(400).json({
        success: false,
        message: 'Vehicle ID is required.',
      });
      return;
    }

    if (!documentType || !documentType.trim()) {
      res.status(400).json({
        success: false,
        message: 'Document type is required.',
      });
      return;
    }

    if (!expiryDate) {
      res.status(400).json({
        success: false,
        message: 'Expiry date is required.',
      });
      return;
    }

    const parsedExpiryDate = parseDate(expiryDate);

    if (!parsedExpiryDate) {
      res.status(400).json({
        success: false,
        message: 'Invalid expiry date.',
      });
      return;
    }

    const parsedIssueDate = issueDate
      ? parseDate(issueDate)
      : null;

    if (issueDate && !parsedIssueDate) {
      res.status(400).json({
        success: false,
        message: 'Invalid issue date.',
      });
      return;
    }

    if (
      parsedIssueDate &&
      parsedIssueDate > parsedExpiryDate
    ) {
      res.status(400).json({
        success: false,
        message: 'Issue date cannot be after expiry date.',
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

    const document = await prisma.vehicleDocument.create({
      data: {
        vehicleId: String(vehicleId),
        documentType: documentType.trim(),
        documentNumber:
          documentNumber?.trim() || null,
        issueDate: parsedIssueDate,
        expiryDate: parsedExpiryDate,
        fileUrl: fileUrl?.trim() || null,
        notes: notes?.trim() || null,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Document added successfully.',
      data: {
        document,
      },
    });
  } catch (error) {
    console.error('Create document error:', error);

    res.status(500).json({
      success: false,
      message: 'Unable to add document.',
    });
  }
};

export const getDocumentsByVehicle = async (
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

    const documents = await prisma.vehicleDocument.findMany({
      where: {
        vehicleId,
      },
      orderBy: {
        expiryDate: 'asc',
      },
    });

    res.status(200).json({
      success: true,
      data: {
        documents,
      },
    });
  } catch (error) {
    console.error('Get documents error:', error);

    res.status(500).json({
      success: false,
      message: 'Unable to fetch documents.',
    });
  }
};

export const getDocumentById = async (
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

    const documentId = String(req.params.id);

    const document = await prisma.vehicleDocument.findFirst({
      where: {
        id: documentId,
        vehicle: {
          userId: req.user.userId,
        },
      },
      include: {
        vehicle: true,
      },
    });

    if (!document) {
      res.status(404).json({
        success: false,
        message: 'Document not found.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        document,
      },
    });
  } catch (error) {
    console.error('Get document error:', error);

    res.status(500).json({
      success: false,
      message: 'Unable to fetch document.',
    });
  }
};

export const updateDocument = async (
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

    const documentId = String(req.params.id);

    const existingDocument =
      await prisma.vehicleDocument.findFirst({
        where: {
          id: documentId,
          vehicle: {
            userId: req.user.userId,
          },
        },
      });

    if (!existingDocument) {
      res.status(404).json({
        success: false,
        message: 'Document not found.',
      });
      return;
    }

    const {
      documentType,
      documentNumber,
      issueDate,
      expiryDate,
      fileUrl,
      notes,
    } = req.body;

    if (
      documentType !== undefined &&
      !documentType.trim()
    ) {
      res.status(400).json({
        success: false,
        message: 'Document type cannot be empty.',
      });
      return;
    }

    const parsedIssueDate =
      issueDate !== undefined
        ? issueDate
          ? parseDate(issueDate)
          : null
        : existingDocument.issueDate;

    if (issueDate && !parsedIssueDate) {
      res.status(400).json({
        success: false,
        message: 'Invalid issue date.',
      });
      return;
    }

    const parsedExpiryDate =
      expiryDate !== undefined
        ? parseDate(expiryDate)
        : existingDocument.expiryDate;

    if (!parsedExpiryDate) {
      res.status(400).json({
        success: false,
        message: 'Invalid expiry date.',
      });
      return;
    }

    if (
      parsedIssueDate &&
      parsedIssueDate > parsedExpiryDate
    ) {
      res.status(400).json({
        success: false,
        message: 'Issue date cannot be after expiry date.',
      });
      return;
    }

    const document = await prisma.vehicleDocument.update({
      where: {
        id: documentId,
      },
      data: {
        documentType:
          documentType !== undefined
            ? documentType.trim()
            : existingDocument.documentType,

        documentNumber:
          documentNumber !== undefined
            ? documentNumber?.trim() || null
            : existingDocument.documentNumber,

        issueDate: parsedIssueDate,

        expiryDate: parsedExpiryDate,

        fileUrl:
          fileUrl !== undefined
            ? fileUrl?.trim() || null
            : existingDocument.fileUrl,

        notes:
          notes !== undefined
            ? notes?.trim() || null
            : existingDocument.notes,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Document updated successfully.',
      data: {
        document,
      },
    });
  } catch (error) {
    console.error('Update document error:', error);

    res.status(500).json({
      success: false,
      message: 'Unable to update document.',
    });
  }
};

export const deleteDocument = async (
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

    const documentId = String(req.params.id);

    const existingDocument =
      await prisma.vehicleDocument.findFirst({
        where: {
          id: documentId,
          vehicle: {
            userId: req.user.userId,
          },
        },
      });

    if (!existingDocument) {
      res.status(404).json({
        success: false,
        message: 'Document not found.',
      });
      return;
    }

    await prisma.vehicleDocument.delete({
      where: {
        id: documentId,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully.',
    });
  } catch (error) {
    console.error('Delete document error:', error);

    res.status(500).json({
      success: false,
      message: 'Unable to delete document.',
    });
  }
};
