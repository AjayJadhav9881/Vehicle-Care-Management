import { api } from './api';

export interface User {
  id: string;
  fullName: string;
  email: string;
  mobileNumber?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export const registerUser = async (payload: {
  fullName: string;
  email: string;
  mobileNumber?: string;
  password: string;
}): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>(
    '/auth/register',
    payload
  );

  return response.data;
};

export const loginUser = async (payload: {
  email: string;
  password: string;
}): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>(
    '/auth/login',
    payload
  );

  return response.data;
};

export const getCurrentUser = async (
  token: string
): Promise<User> => {
  const response = await api.get<{
    success: boolean;
    data: {
      user: User;
    };
  }>('/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.data.user;
};