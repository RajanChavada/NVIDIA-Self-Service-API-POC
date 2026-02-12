import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface CreateRequestPayload {
  user_id: string;
  gpu_count: number;
  duration_hours: number;
}

export interface RequestResponse {
  request_id: string;
  status: 'pending' | 'provisioning' | 'completed' | 'failed';
  kubeconfig?: string;
  created_at?: string;
  completed_at?: string;
  gpu_count?: number;
  duration_hours?: number;
  user_id?: string;
}

export const api = {
  createRequest: async (payload: CreateRequestPayload): Promise<RequestResponse> => {
    const response = await apiClient.post<RequestResponse>('/api/v1/requests', payload);
    return response.data;
  },

  getRequest: async (requestId: string): Promise<RequestResponse> => {
    const response = await apiClient.get<RequestResponse>(`/api/v1/requests/${requestId}`);
    return response.data;
  },

  getRequests: async (): Promise<RequestResponse[]> => {
    const response = await apiClient.get<RequestResponse[]>('/api/v1/requests');
    return response.data;
  },
};
