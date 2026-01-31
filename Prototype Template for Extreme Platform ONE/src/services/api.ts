import axios from 'axios';
import type {
  ConnectedClient,
  AccessPoint,
  AppInsight,
  ContextualInsight,
  DashboardSummary,
  ApiResponse,
} from '../types';

// API Configuration - Configure these for your EDGE endpoints
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login or refresh token
      localStorage.removeItem('auth_token');
    }
    return Promise.reject(error);
  }
);

// Connected Clients API
export const clientsApi = {
  getAll: async (): Promise<ConnectedClient[]> => {
    const response = await api.get<ApiResponse<ConnectedClient[]>>('/clients');
    return response.data.data;
  },

  getById: async (id: string): Promise<ConnectedClient> => {
    const response = await api.get<ApiResponse<ConnectedClient>>(`/clients/${id}`);
    return response.data.data;
  },

  disconnect: async (id: string): Promise<void> => {
    await api.post(`/clients/${id}/disconnect`);
  },

  getByAccessPoint: async (apId: string): Promise<ConnectedClient[]> => {
    const response = await api.get<ApiResponse<ConnectedClient[]>>(`/access-points/${apId}/clients`);
    return response.data.data;
  },
};

// Access Points API
export const accessPointsApi = {
  getAll: async (): Promise<AccessPoint[]> => {
    const response = await api.get<ApiResponse<AccessPoint[]>>('/access-points');
    return response.data.data;
  },

  getById: async (id: string): Promise<AccessPoint> => {
    const response = await api.get<ApiResponse<AccessPoint>>(`/access-points/${id}`);
    return response.data.data;
  },

  reboot: async (id: string): Promise<void> => {
    await api.post(`/access-points/${id}/reboot`);
  },

  getStats: async (id: string): Promise<{ utilization: number; clients: number }> => {
    const response = await api.get<ApiResponse<{ utilization: number; clients: number }>>(`/access-points/${id}/stats`);
    return response.data.data;
  },
};

// App Insights API
export const appInsightsApi = {
  getAll: async (): Promise<AppInsight[]> => {
    const response = await api.get<ApiResponse<AppInsight[]>>('/insights/apps');
    return response.data.data;
  },

  getById: async (id: string): Promise<AppInsight> => {
    const response = await api.get<ApiResponse<AppInsight>>(`/insights/apps/${id}`);
    return response.data.data;
  },

  getTopApps: async (limit?: number): Promise<AppInsight[]> => {
    const response = await api.get<ApiResponse<AppInsight[]>>('/insights/apps/top', {
      params: { limit: limit || 10 },
    });
    return response.data.data;
  },

  getByCategory: async (category: string): Promise<AppInsight[]> => {
    const response = await api.get<ApiResponse<AppInsight[]>>(`/insights/apps/category/${category}`);
    return response.data.data;
  },
};

// Contextual Insights API
export const contextualInsightsApi = {
  getAll: async (): Promise<ContextualInsight[]> => {
    const response = await api.get<ApiResponse<ContextualInsight[]>>('/insights/contextual');
    return response.data.data;
  },

  getById: async (id: string): Promise<ContextualInsight> => {
    const response = await api.get<ApiResponse<ContextualInsight>>(`/insights/contextual/${id}`);
    return response.data.data;
  },

  dismiss: async (id: string): Promise<void> => {
    await api.post(`/insights/contextual/${id}/dismiss`);
  },

  getByType: async (type: ContextualInsight['type']): Promise<ContextualInsight[]> => {
    const response = await api.get<ApiResponse<ContextualInsight[]>>(`/insights/contextual/type/${type}`);
    return response.data.data;
  },

  getBySeverity: async (severity: ContextualInsight['severity']): Promise<ContextualInsight[]> => {
    const response = await api.get<ApiResponse<ContextualInsight[]>>(`/insights/contextual/severity/${severity}`);
    return response.data.data;
  },
};

// Dashboard API
export const dashboardApi = {
  getSummary: async (): Promise<DashboardSummary> => {
    const response = await api.get<ApiResponse<DashboardSummary>>('/dashboard/summary');
    return response.data.data;
  },

  getHealthMetrics: async (): Promise<{ health: number; status: string }> => {
    const response = await api.get<ApiResponse<{ health: number; status: string }>>('/dashboard/health');
    return response.data.data;
  },
};

export default api;
