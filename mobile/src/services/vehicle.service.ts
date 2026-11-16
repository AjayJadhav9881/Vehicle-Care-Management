
import { api } from './api';
import { getToken } from '../storage/authStorage';

export interface Vehicle {
  id: string;
  userId: string;
  vehicleType: string;
  brand: string;
  model: string;
  registrationNo?: string | null;
  purchaseDate?: string | null;
  currentOdometer?: number | null;
  fuelType?: string | null;
  imageUrl?: string | null;
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

export const getVehicles = async (): Promise<Vehicle[]> => {
  const response = await api.get<{
    success: boolean;
    data: {
      vehicles: Vehicle[];
    };
  }>('/vehicles', {
    headers: await getAuthHeaders(),
  });

  return response.data.data.vehicles;
};

export const getVehicleById = async (
  id: string
): Promise<Vehicle> => {
  const response = await api.get<{
    success: boolean;
    data: {
      vehicle: Vehicle;
    };
  }>(`/vehicles/${id}`, {
    headers: await getAuthHeaders(),
  });

  return response.data.data.vehicle;
};

export const createVehicle = async (payload: {
  vehicleType: string;
  brand: string;
  model: string;
  registrationNo?: string;
  purchaseDate?: string;
  currentOdometer?: number;
  fuelType?: string;
  imageUrl?: string;
}): Promise<Vehicle> => {
  const response = await api.post<{
    success: boolean;
    data: {
      vehicle: Vehicle;
    };
  }>('/vehicles', payload, {
    headers: await getAuthHeaders(),
  });

  return response.data.data.vehicle;
};

export const updateVehicle = async (
  id: string,
  payload: Partial<{
    vehicleType: string;
    brand: string;
    model: string;
    registrationNo: string;
    purchaseDate: string;
    currentOdometer: number;
    fuelType: string;
    imageUrl: string;
  }>
): Promise<Vehicle> => {
  const response = await api.put<{
    success: boolean;
    data: {
      vehicle: Vehicle;
    };
  }>(`/vehicles/${id}`, payload, {
    headers: await getAuthHeaders(),
  });

  return response.data.data.vehicle;
};

export const deleteVehicle = async (
  id: string
): Promise<void> => {
  await api.delete(`/vehicles/${id}`, {
    headers: await getAuthHeaders(),
  });
};
