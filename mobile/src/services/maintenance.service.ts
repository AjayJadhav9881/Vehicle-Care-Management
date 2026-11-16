
import { api } from './api';
import { getToken } from '../storage/authStorage';

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  serviceType: string;
  serviceDate: string;
  odometer?: number | null;
  cost?: string | number | null;
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

export const getMaintenanceByVehicle = async (
  vehicleId: string
): Promise<MaintenanceRecord[]> => {
  const response = await api.get<{
    success: boolean;
    data: {
      maintenanceRecords: MaintenanceRecord[];
    };
  }>(`/maintenance/vehicle/${vehicleId}`, {
    headers: await getAuthHeaders(),
  });

  return response.data.data.maintenanceRecords;
};

export const getMaintenanceById = async (
  id: string
): Promise<MaintenanceRecord> => {
  const response = await api.get<{
    success: boolean;
    data: {
      maintenance: MaintenanceRecord;
    };
  }>(`/maintenance/${id}`, {
    headers: await getAuthHeaders(),
  });

  return response.data.data.maintenance;
};

export const createMaintenance = async (payload: {
  vehicleId: string;
  serviceType: string;
  serviceDate: string;
  odometer?: number;
  cost?: number;
  notes?: string;
}): Promise<MaintenanceRecord> => {
  const response = await api.post<{
    success: boolean;
    data: {
      maintenance: MaintenanceRecord;
    };
  }>('/maintenance', payload, {
    headers: await getAuthHeaders(),
  });

  return response.data.data.maintenance;
};

export const updateMaintenance = async (
  id: string,
  payload: Partial<{
    serviceType: string;
    serviceDate: string;
    odometer: number | null;
    cost: number | null;
    notes: string | null;
  }>
): Promise<MaintenanceRecord> => {
  const response = await api.put<{
    success: boolean;
    data: {
      maintenance: MaintenanceRecord;
    };
  }>(`/maintenance/${id}`, payload, {
    headers: await getAuthHeaders(),
  });

  return response.data.data.maintenance;
};

export const deleteMaintenance = async (
  id: string
): Promise<void> => {
  await api.delete(`/maintenance/${id}`, {
    headers: await getAuthHeaders(),
  });
};
