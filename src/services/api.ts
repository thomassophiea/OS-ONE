import axios from 'axios';
import type {
  ConnectedClient,
  AccessPoint,
  AppInsight,
  ContextualInsight,
  DashboardSummary,
} from '../types';

// Campus Controller Configuration
const CAMPUS_CONTROLLER_URL = import.meta.env.VITE_CAMPUS_CONTROLLER_URL || '';
const CAMPUS_CONTROLLER_USER = import.meta.env.VITE_CAMPUS_CONTROLLER_USER || 'admin';
const CAMPUS_CONTROLLER_PASSWORD = import.meta.env.VITE_CAMPUS_CONTROLLER_PASSWORD || '';

// Create axios instance for Campus Controller
const campusApi = axios.create({
  baseURL: CAMPUS_CONTROLLER_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Handle self-signed certificates in development
  httpsAgent: typeof window === 'undefined' ? undefined : undefined,
});

// Add basic auth to requests
campusApi.interceptors.request.use(
  (config) => {
    const credentials = btoa(`${CAMPUS_CONTROLLER_USER}:${CAMPUS_CONTROLLER_PASSWORD}`);
    config.headers.Authorization = `Basic ${credentials}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
campusApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Campus Controller API Error:', error.message);
    if (error.response?.status === 401) {
      console.error('Authentication failed - check credentials');
    }
    return Promise.reject(error);
  }
);

// Helper to transform Campus Controller data to our types
const transformClient = (data: any): ConnectedClient => ({
  id: data.id || data.macAddress || String(Math.random()),
  macAddress: data.macAddress || data.mac || '',
  ipAddress: data.ipAddress || data.ip || '',
  hostname: data.hostname || data.name || 'Unknown',
  connectionType: data.connectionType || (data.ssid ? 'wireless' : 'wired'),
  ssid: data.ssid,
  accessPointName: data.accessPointName || data.apName,
  accessPointMac: data.accessPointMac || data.apMac,
  signalStrength: data.signalStrength || data.rssi,
  connectionTime: data.connectionTime || data.connectedAt || new Date().toISOString(),
  dataUsage: {
    upload: data.txBytes || data.upload || 0,
    download: data.rxBytes || data.download || 0,
  },
  status: data.status || 'online',
  os: data.os || data.operatingSystem,
  deviceType: data.deviceType || data.type,
});

const transformAccessPoint = (data: any): AccessPoint => ({
  id: data.id || data.serial || String(Math.random()),
  name: data.name || data.hostname || 'Unknown AP',
  macAddress: data.macAddress || data.mac || '',
  ipAddress: data.ipAddress || data.ip || '',
  model: data.model || data.deviceModel || 'Unknown',
  serialNumber: data.serialNumber || data.serial || '',
  status: data.status === 'up' || data.status === 'online' ? 'online' :
          data.status === 'warning' ? 'warning' : 'offline',
  clients: data.clientCount || data.clients || 0,
  channel: data.channel || 0,
  band: data.band || data.radioMode || '5GHz',
  utilization: data.utilization || data.channelUtilization || 0,
  uptime: data.uptime || '0d 0h 0m',
  firmware: data.firmware || data.softwareVersion || '',
  location: data.location || data.siteName,
  lastSeen: data.lastSeen || data.lastContact || new Date().toISOString(),
});

// Connected Clients API
export const clientsApi = {
  getAll: async (): Promise<ConnectedClient[]> => {
    try {
      // Try Campus Controller endpoint for clients
      const response = await campusApi.get('/api/v1/clients');
      const clients = Array.isArray(response.data) ? response.data :
                      response.data?.data || response.data?.clients || [];
      return clients.map(transformClient);
    } catch (error) {
      console.error('Failed to fetch clients from Campus Controller:', error);
      // Return empty array on error - mock data will be used as fallback in components
      return [];
    }
  },

  getById: async (id: string): Promise<ConnectedClient | null> => {
    try {
      const response = await campusApi.get(`/api/v1/clients/${id}`);
      return transformClient(response.data);
    } catch (error) {
      console.error('Failed to fetch client:', error);
      return null;
    }
  },

  disconnect: async (id: string): Promise<void> => {
    await campusApi.post(`/api/v1/clients/${id}/disconnect`);
  },
};

// Access Points API
export const accessPointsApi = {
  getAll: async (): Promise<AccessPoint[]> => {
    try {
      // Try Campus Controller endpoint for APs
      const response = await campusApi.get('/api/v1/devices');
      const devices = Array.isArray(response.data) ? response.data :
                      response.data?.data || response.data?.devices || [];
      // Filter for APs only
      const aps = devices.filter((d: any) =>
        d.deviceType === 'AP' || d.type === 'accessPoint' || d.model?.includes('AP')
      );
      return aps.map(transformAccessPoint);
    } catch (error) {
      console.error('Failed to fetch access points from Campus Controller:', error);
      return [];
    }
  },

  getById: async (id: string): Promise<AccessPoint | null> => {
    try {
      const response = await campusApi.get(`/api/v1/devices/${id}`);
      return transformAccessPoint(response.data);
    } catch (error) {
      console.error('Failed to fetch access point:', error);
      return null;
    }
  },

  reboot: async (id: string): Promise<void> => {
    await campusApi.post(`/api/v1/devices/${id}/reboot`);
  },

  getStats: async (id: string): Promise<{ utilization: number; clients: number }> => {
    try {
      const response = await campusApi.get(`/api/v1/devices/${id}/stats`);
      return {
        utilization: response.data.utilization || 0,
        clients: response.data.clientCount || 0,
      };
    } catch (error) {
      console.error('Failed to fetch AP stats:', error);
      return { utilization: 0, clients: 0 };
    }
  },
};

// App Insights API
export const appInsightsApi = {
  getAll: async (): Promise<AppInsight[]> => {
    try {
      const response = await campusApi.get('/api/v1/analytics/applications');
      const apps = Array.isArray(response.data) ? response.data :
                   response.data?.data || response.data?.applications || [];
      return apps.map((app: any) => ({
        id: app.id || app.name || String(Math.random()),
        appName: app.name || app.appName || 'Unknown',
        category: app.category || 'Uncategorized',
        totalUsage: app.totalBytes || app.bandwidth || 0,
        activeUsers: app.userCount || app.activeUsers || 0,
        bandwidth: {
          upload: app.txBytes || app.upload || 0,
          download: app.rxBytes || app.download || 0,
        },
        trend: app.trend || 'stable',
        riskLevel: app.riskLevel || app.risk || 'low',
        topUsers: app.topUsers || [],
      }));
    } catch (error) {
      console.error('Failed to fetch app insights:', error);
      return [];
    }
  },

  getById: async (id: string): Promise<AppInsight | null> => {
    try {
      const response = await campusApi.get(`/api/v1/analytics/applications/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch app insight:', error);
      return null;
    }
  },
};

// Contextual Insights API
export const contextualInsightsApi = {
  getAll: async (): Promise<ContextualInsight[]> => {
    try {
      const response = await campusApi.get('/api/v1/alerts');
      const alerts = Array.isArray(response.data) ? response.data :
                     response.data?.data || response.data?.alerts || [];
      return alerts.map((alert: any) => ({
        id: alert.id || String(Math.random()),
        type: alert.type || alert.severity === 'critical' ? 'alert' : 'info',
        title: alert.title || alert.name || 'Alert',
        description: alert.description || alert.message || '',
        severity: alert.severity || 'low',
        category: alert.category || 'General',
        timestamp: alert.timestamp || alert.createdAt || new Date().toISOString(),
        relatedEntity: alert.relatedEntity,
        actions: alert.actions || [],
        dismissed: alert.dismissed || false,
      }));
    } catch (error) {
      console.error('Failed to fetch contextual insights:', error);
      return [];
    }
  },

  getById: async (id: string): Promise<ContextualInsight | null> => {
    try {
      const response = await campusApi.get(`/api/v1/alerts/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch insight:', error);
      return null;
    }
  },

  dismiss: async (id: string): Promise<void> => {
    await campusApi.post(`/api/v1/alerts/${id}/acknowledge`);
  },
};

// Dashboard API
export const dashboardApi = {
  getSummary: async (): Promise<DashboardSummary> => {
    try {
      // Aggregate data from multiple endpoints
      const [clientsResponse, devicesResponse, alertsResponse] = await Promise.allSettled([
        campusApi.get('/api/v1/clients'),
        campusApi.get('/api/v1/devices'),
        campusApi.get('/api/v1/alerts'),
      ]);

      const clients = clientsResponse.status === 'fulfilled'
        ? (Array.isArray(clientsResponse.value.data) ? clientsResponse.value.data :
           clientsResponse.value.data?.data || [])
        : [];

      const devices = devicesResponse.status === 'fulfilled'
        ? (Array.isArray(devicesResponse.value.data) ? devicesResponse.value.data :
           devicesResponse.value.data?.data || [])
        : [];

      const alerts = alertsResponse.status === 'fulfilled'
        ? (Array.isArray(alertsResponse.value.data) ? alertsResponse.value.data :
           alertsResponse.value.data?.data || [])
        : [];

      const aps = devices.filter((d: any) =>
        d.deviceType === 'AP' || d.type === 'accessPoint' || d.model?.includes('AP')
      );

      return {
        totalClients: clients.length,
        activeClients: clients.filter((c: any) => c.status === 'online' || c.status === 'active').length,
        totalAccessPoints: aps.length,
        onlineAccessPoints: aps.filter((ap: any) => ap.status === 'up' || ap.status === 'online').length,
        totalBandwidth: {
          upload: clients.reduce((sum: number, c: any) => sum + (c.txBytes || 0), 0),
          download: clients.reduce((sum: number, c: any) => sum + (c.rxBytes || 0), 0),
        },
        alerts: alerts.filter((a: any) => !a.acknowledged && !a.dismissed).length,
        health: Math.round((aps.filter((ap: any) => ap.status === 'up' || ap.status === 'online').length / Math.max(aps.length, 1)) * 100),
      };
    } catch (error) {
      console.error('Failed to fetch dashboard summary:', error);
      return {
        totalClients: 0,
        activeClients: 0,
        totalAccessPoints: 0,
        onlineAccessPoints: 0,
        totalBandwidth: { upload: 0, download: 0 },
        alerts: 0,
        health: 0,
      };
    }
  },

  getHealthMetrics: async (): Promise<{ health: number; status: string }> => {
    try {
      const response = await campusApi.get('/api/v1/health');
      return {
        health: response.data.health || response.data.score || 100,
        status: response.data.status || 'healthy',
      };
    } catch (error) {
      console.error('Failed to fetch health metrics:', error);
      return { health: 0, status: 'unknown' };
    }
  },
};

export { campusApi };
export default campusApi;
