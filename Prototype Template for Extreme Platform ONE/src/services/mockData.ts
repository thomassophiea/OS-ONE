import type {
  ConnectedClient,
  AccessPoint,
  AppInsight,
  ContextualInsight,
  DashboardSummary,
} from '../types';

// Mock Connected Clients
export const mockClients: ConnectedClient[] = [
  {
    id: '1',
    macAddress: 'AA:BB:CC:DD:EE:01',
    ipAddress: '192.168.1.101',
    hostname: 'MacBook-Pro-John',
    connectionType: 'wireless',
    ssid: 'Corporate-WiFi',
    accessPointName: 'AP-Floor1-North',
    accessPointMac: '00:11:22:33:44:55',
    signalStrength: -45,
    connectionTime: '2024-01-31T08:30:00Z',
    dataUsage: { upload: 256000000, download: 1024000000 },
    status: 'online',
    os: 'macOS',
    deviceType: 'Laptop',
  },
  {
    id: '2',
    macAddress: 'AA:BB:CC:DD:EE:02',
    ipAddress: '192.168.1.102',
    hostname: 'iPhone-Sarah',
    connectionType: 'wireless',
    ssid: 'Corporate-WiFi',
    accessPointName: 'AP-Floor1-South',
    accessPointMac: '00:11:22:33:44:56',
    signalStrength: -55,
    connectionTime: '2024-01-31T09:15:00Z',
    dataUsage: { upload: 50000000, download: 300000000 },
    status: 'online',
    os: 'iOS',
    deviceType: 'Mobile',
  },
  {
    id: '3',
    macAddress: 'AA:BB:CC:DD:EE:03',
    ipAddress: '192.168.1.103',
    hostname: 'Dell-Workstation-Dev',
    connectionType: 'wired',
    connectionTime: '2024-01-30T14:00:00Z',
    dataUsage: { upload: 5000000000, download: 15000000000 },
    status: 'online',
    os: 'Windows 11',
    deviceType: 'Desktop',
  },
  {
    id: '4',
    macAddress: 'AA:BB:CC:DD:EE:04',
    ipAddress: '192.168.1.104',
    hostname: 'Android-Tablet-Conference',
    connectionType: 'wireless',
    ssid: 'Guest-WiFi',
    accessPointName: 'AP-Conference-Room',
    accessPointMac: '00:11:22:33:44:57',
    signalStrength: -65,
    connectionTime: '2024-01-31T10:00:00Z',
    dataUsage: { upload: 10000000, download: 50000000 },
    status: 'idle',
    os: 'Android',
    deviceType: 'Tablet',
  },
  {
    id: '5',
    macAddress: 'AA:BB:CC:DD:EE:05',
    ipAddress: '192.168.1.105',
    hostname: 'Printer-Floor2',
    connectionType: 'wired',
    connectionTime: '2024-01-15T00:00:00Z',
    dataUsage: { upload: 1000000, download: 5000000 },
    status: 'online',
    deviceType: 'Printer',
  },
  {
    id: '6',
    macAddress: 'AA:BB:CC:DD:EE:06',
    ipAddress: '192.168.1.106',
    hostname: 'ThinkPad-Mark',
    connectionType: 'wireless',
    ssid: 'Corporate-WiFi',
    accessPointName: 'AP-Floor2-East',
    accessPointMac: '00:11:22:33:44:58',
    signalStrength: -50,
    connectionTime: '2024-01-31T07:45:00Z',
    dataUsage: { upload: 150000000, download: 800000000 },
    status: 'online',
    os: 'Ubuntu',
    deviceType: 'Laptop',
  },
];

// Mock Access Points
export const mockAccessPoints: AccessPoint[] = [
  {
    id: '1',
    name: 'AP-Floor1-North',
    macAddress: '00:11:22:33:44:55',
    ipAddress: '192.168.0.10',
    model: 'AP650',
    serialNumber: 'SN-001-2024',
    status: 'online',
    clients: 12,
    channel: 36,
    band: '5GHz',
    utilization: 45,
    uptime: '15d 4h 32m',
    firmware: '8.2.1.0',
    location: 'Building A, Floor 1, North Wing',
    lastSeen: '2024-01-31T14:30:00Z',
  },
  {
    id: '2',
    name: 'AP-Floor1-South',
    macAddress: '00:11:22:33:44:56',
    ipAddress: '192.168.0.11',
    model: 'AP650',
    serialNumber: 'SN-002-2024',
    status: 'online',
    clients: 8,
    channel: 44,
    band: '5GHz',
    utilization: 32,
    uptime: '15d 4h 32m',
    firmware: '8.2.1.0',
    location: 'Building A, Floor 1, South Wing',
    lastSeen: '2024-01-31T14:30:00Z',
  },
  {
    id: '3',
    name: 'AP-Conference-Room',
    macAddress: '00:11:22:33:44:57',
    ipAddress: '192.168.0.12',
    model: 'AP550',
    serialNumber: 'SN-003-2024',
    status: 'online',
    clients: 3,
    channel: 6,
    band: '2.4GHz',
    utilization: 15,
    uptime: '10d 2h 15m',
    firmware: '8.2.0.5',
    location: 'Building A, Conference Room B',
    lastSeen: '2024-01-31T14:30:00Z',
  },
  {
    id: '4',
    name: 'AP-Floor2-East',
    macAddress: '00:11:22:33:44:58',
    ipAddress: '192.168.0.13',
    model: 'AP650',
    serialNumber: 'SN-004-2024',
    status: 'warning',
    clients: 25,
    channel: 149,
    band: '5GHz',
    utilization: 85,
    uptime: '5d 12h 45m',
    firmware: '8.2.1.0',
    location: 'Building A, Floor 2, East Wing',
    lastSeen: '2024-01-31T14:28:00Z',
  },
  {
    id: '5',
    name: 'AP-Lobby',
    macAddress: '00:11:22:33:44:59',
    ipAddress: '192.168.0.14',
    model: 'AP550',
    serialNumber: 'SN-005-2024',
    status: 'offline',
    clients: 0,
    channel: 1,
    band: '2.4GHz',
    utilization: 0,
    uptime: '0d 0h 0m',
    firmware: '8.2.0.5',
    location: 'Building A, Main Lobby',
    lastSeen: '2024-01-31T10:15:00Z',
  },
];

// Mock App Insights
export const mockAppInsights: AppInsight[] = [
  {
    id: '1',
    appName: 'Microsoft Teams',
    category: 'Collaboration',
    totalUsage: 15000000000,
    activeUsers: 145,
    bandwidth: { upload: 5000000000, download: 10000000000 },
    trend: 'up',
    riskLevel: 'low',
    topUsers: [
      { userId: '1', username: 'john.doe', usage: 2500000000 },
      { userId: '2', username: 'sarah.smith', usage: 1800000000 },
      { userId: '3', username: 'mike.wilson', usage: 1200000000 },
    ],
  },
  {
    id: '2',
    appName: 'Zoom',
    category: 'Collaboration',
    totalUsage: 8000000000,
    activeUsers: 89,
    bandwidth: { upload: 3500000000, download: 4500000000 },
    trend: 'stable',
    riskLevel: 'low',
    topUsers: [
      { userId: '4', username: 'lisa.chen', usage: 1500000000 },
      { userId: '5', username: 'alex.kumar', usage: 1100000000 },
    ],
  },
  {
    id: '3',
    appName: 'YouTube',
    category: 'Streaming',
    totalUsage: 25000000000,
    activeUsers: 67,
    bandwidth: { upload: 500000000, download: 24500000000 },
    trend: 'up',
    riskLevel: 'medium',
    topUsers: [
      { userId: '6', username: 'tom.brown', usage: 5000000000 },
      { userId: '7', username: 'emma.davis', usage: 3500000000 },
    ],
  },
  {
    id: '4',
    appName: 'Salesforce',
    category: 'Business',
    totalUsage: 3000000000,
    activeUsers: 52,
    bandwidth: { upload: 1000000000, download: 2000000000 },
    trend: 'stable',
    riskLevel: 'low',
    topUsers: [
      { userId: '8', username: 'james.taylor', usage: 800000000 },
    ],
  },
  {
    id: '5',
    appName: 'Unknown P2P',
    category: 'Unknown',
    totalUsage: 12000000000,
    activeUsers: 5,
    bandwidth: { upload: 6000000000, download: 6000000000 },
    trend: 'up',
    riskLevel: 'high',
    topUsers: [
      { userId: '9', username: 'device_unknown_1', usage: 8000000000 },
    ],
  },
  {
    id: '6',
    appName: 'Slack',
    category: 'Collaboration',
    totalUsage: 2500000000,
    activeUsers: 134,
    bandwidth: { upload: 800000000, download: 1700000000 },
    trend: 'stable',
    riskLevel: 'low',
    topUsers: [
      { userId: '10', username: 'rachel.green', usage: 400000000 },
    ],
  },
];

// Mock Contextual Insights
export const mockContextualInsights: ContextualInsight[] = [
  {
    id: '1',
    type: 'alert',
    title: 'Access Point Offline',
    description: 'AP-Lobby has been offline for over 4 hours. This may impact connectivity in the main lobby area.',
    severity: 'high',
    category: 'Infrastructure',
    timestamp: '2024-01-31T10:15:00Z',
    relatedEntity: { type: 'accessPoint', id: '5', name: 'AP-Lobby' },
    actions: [
      { label: 'View AP Details', action: 'navigate:/access-points/5' },
      { label: 'Create Ticket', action: 'ticket:create' },
    ],
  },
  {
    id: '2',
    type: 'warning',
    title: 'High Utilization Detected',
    description: 'AP-Floor2-East is experiencing 85% utilization. Consider load balancing or adding additional access points.',
    severity: 'medium',
    category: 'Performance',
    timestamp: '2024-01-31T14:00:00Z',
    relatedEntity: { type: 'accessPoint', id: '4', name: 'AP-Floor2-East' },
    actions: [
      { label: 'View Connected Clients', action: 'navigate:/clients?ap=4' },
      { label: 'Configure Load Balancing', action: 'configure:loadbalance' },
    ],
  },
  {
    id: '3',
    type: 'alert',
    title: 'Suspicious Application Detected',
    description: 'Unknown P2P application consuming high bandwidth from 5 devices. This may indicate unauthorized file sharing.',
    severity: 'critical',
    category: 'Security',
    timestamp: '2024-01-31T13:45:00Z',
    relatedEntity: { type: 'network', id: 'network-1', name: 'Corporate Network' },
    actions: [
      { label: 'View App Details', action: 'navigate:/app-insights/5' },
      { label: 'Block Application', action: 'block:app:5' },
    ],
  },
  {
    id: '4',
    type: 'recommendation',
    title: 'Firmware Update Available',
    description: '3 access points are running outdated firmware. Update to version 8.2.1.0 for improved security and performance.',
    severity: 'low',
    category: 'Maintenance',
    timestamp: '2024-01-31T08:00:00Z',
    actions: [
      { label: 'View Outdated APs', action: 'navigate:/access-points?filter=outdated' },
      { label: 'Schedule Update', action: 'schedule:firmware' },
    ],
  },
  {
    id: '5',
    type: 'info',
    title: 'Weekly Summary Available',
    description: 'Your weekly network performance summary is ready. Overall health score improved by 5% compared to last week.',
    severity: 'low',
    category: 'Reports',
    timestamp: '2024-01-31T06:00:00Z',
    actions: [
      { label: 'View Report', action: 'navigate:/reports/weekly' },
    ],
  },
];

// Mock Dashboard Summary
export const mockDashboardSummary: DashboardSummary = {
  totalClients: 156,
  activeClients: 142,
  totalAccessPoints: 5,
  onlineAccessPoints: 4,
  totalBandwidth: {
    upload: 25000000000,
    download: 75000000000,
  },
  alerts: 3,
  health: 87,
};

// Simulate API delay
export const simulateDelay = (ms: number = 500): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// Mock API functions for development
export const mockApi = {
  clients: {
    getAll: async (): Promise<ConnectedClient[]> => {
      await simulateDelay();
      return mockClients;
    },
    getById: async (id: string): Promise<ConnectedClient | undefined> => {
      await simulateDelay();
      return mockClients.find((c) => c.id === id);
    },
  },
  accessPoints: {
    getAll: async (): Promise<AccessPoint[]> => {
      await simulateDelay();
      return mockAccessPoints;
    },
    getById: async (id: string): Promise<AccessPoint | undefined> => {
      await simulateDelay();
      return mockAccessPoints.find((ap) => ap.id === id);
    },
  },
  appInsights: {
    getAll: async (): Promise<AppInsight[]> => {
      await simulateDelay();
      return mockAppInsights;
    },
    getById: async (id: string): Promise<AppInsight | undefined> => {
      await simulateDelay();
      return mockAppInsights.find((app) => app.id === id);
    },
  },
  contextualInsights: {
    getAll: async (): Promise<ContextualInsight[]> => {
      await simulateDelay();
      return mockContextualInsights;
    },
    getById: async (id: string): Promise<ContextualInsight | undefined> => {
      await simulateDelay();
      return mockContextualInsights.find((insight) => insight.id === id);
    },
  },
  dashboard: {
    getSummary: async (): Promise<DashboardSummary> => {
      await simulateDelay();
      return mockDashboardSummary;
    },
  },
};
