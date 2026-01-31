// API Response Types
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

// Connected Client Types
export interface ConnectedClient {
  id: string;
  macAddress: string;
  ipAddress: string;
  hostname: string;
  connectionType: 'wireless' | 'wired';
  ssid?: string;
  accessPointName?: string;
  accessPointMac?: string;
  signalStrength?: number;
  connectionTime: string;
  dataUsage: {
    upload: number;
    download: number;
  };
  status: 'online' | 'offline' | 'idle';
  os?: string;
  deviceType?: string;
}

// Access Point Types
export interface AccessPoint {
  id: string;
  name: string;
  macAddress: string;
  ipAddress: string;
  model: string;
  serialNumber: string;
  status: 'online' | 'offline' | 'warning';
  clients: number;
  channel: number;
  band: '2.4GHz' | '5GHz' | '6GHz';
  utilization: number;
  uptime: string;
  firmware: string;
  location?: string;
  lastSeen: string;
}

// App Insights Types
export interface AppInsight {
  id: string;
  appName: string;
  category: string;
  totalUsage: number;
  activeUsers: number;
  bandwidth: {
    upload: number;
    download: number;
  };
  trend: 'up' | 'down' | 'stable';
  riskLevel: 'low' | 'medium' | 'high';
  topUsers: {
    userId: string;
    username: string;
    usage: number;
  }[];
}

// Contextual Insights Types
export interface ContextualInsight {
  id: string;
  type: 'alert' | 'recommendation' | 'info' | 'warning';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  timestamp: string;
  relatedEntity?: {
    type: 'client' | 'accessPoint' | 'network';
    id: string;
    name: string;
  };
  actions?: {
    label: string;
    action: string;
  }[];
  dismissed?: boolean;
}

// Dashboard Summary Types
export interface DashboardSummary {
  totalClients: number;
  activeClients: number;
  totalAccessPoints: number;
  onlineAccessPoints: number;
  totalBandwidth: {
    upload: number;
    download: number;
  };
  alerts: number;
  health: number;
}

// Chart Data Types
export interface TimeSeriesData {
  timestamp: string;
  value: number;
}

export interface ChartData {
  name: string;
  data: TimeSeriesData[];
}
