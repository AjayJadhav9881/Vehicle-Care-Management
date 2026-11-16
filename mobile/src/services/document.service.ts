
import { api } from './api';
import { getToken } from '../storage/authStorage';

export interface VehicleDocument {
  id: string;
  vehicleId: string;
  documentType: string;
  documentNumber?: string | null;
  issueDate?: string | null;
  expiryDate: string;
  fileUrl?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

const getAuthHeaders = async () => {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication token not found.');
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};

export const getDocumentsByVehicle = async (
  vehicleId: string
): Promise<VehicleDocument[]> => {
  const response = await api.get<{
    success: boolean;
    data: {
      documents: VehicleDocument[];
    };
  }>(`/documents/vehicle/${vehicleId}`, {
    headers: await getAuthHeaders(),
  });

  return response.data.data.documents;
};

export const getDocumentById = async (
  id: string
): Promise<VehicleDocument> => {
  const response = await api.get<{
    success: boolean;
    data: {
      document: VehicleDocument;
    };
  }>(`/documents/${id}`, {
    headers: await getAuthHeaders(),
  });

  return response.data.data.document;
};

export const createDocument = async (payload: {
  vehicleId: string;
  documentType: string;
  documentNumber?: string;
  issueDate?: string;
  expiryDate: string;
  fileUrl?: string;
  notes?: string;
}): Promise<VehicleDocument> => {
  const response = await api.post<{
    success: boolean;
    data: {
      document: VehicleDocument;
    };
  }>('/documents', payload, {
    headers: await getAuthHeaders(),
  });

  return response.data.data.document;
};

export const updateDocument = async (
  id: string,
  payload: Partial<{
    documentType: string;
    documentNumber: string | null;
    issueDate: string | null;
    expiryDate: string;
    fileUrl: string | null;
    notes: string | null;
  }>
): Promise<VehicleDocument> => {
  const response = await api.put<{
    success: boolean;
    data: {
      document: VehicleDocument;
    };
  }>(`/documents/${id}`, payload, {
    headers: await getAuthHeaders(),
  });

  return response.data.data.document;
};

export const deleteDocument = async (
  id: string
): Promise<void> => {
  await api.delete(`/documents/${id}`, {
    headers: await getAuthHeaders(),
  });
};
