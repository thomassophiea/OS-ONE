import type { VerticalKey } from './benchmarkData';
import type { VariableType, VariableScope } from '@/types/siteVariables';
import type { GlobalElementType } from '@/types/globalElements';
import type { AccountingType, CalledStationIdFormat } from '@/types/network';

export type { VerticalKey };

export interface DemoOrg {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo_url: string | null;
  settings: Record<string, unknown>;
  created_at: string;
}

export interface DemoSiteGroup {
  id: string;
  org_id: string;
  name: string;
  description: string;
  controller_url: string;
  controller_port: number;
  connection_status: 'connected' | 'disconnected' | 'error' | 'unknown';
  last_connected_at: string;
  is_default: boolean;
  region: string;
  tags: string[];
  site_count: number;
  created_at: string;
}

export interface DemoSiteConfig {
  id: string;
  name: string;
  site_group_id: string;
  org_id: string;
  type: string;
  apCount: number;
  ipPrefix: string;
  location: string;
  status: string;
  created_at: string;
}

export interface SiteTypeProfile {
  clientBase: number;
  clientVariance: number;
  floors: number;
  sleBand: { base: number; variance: number };
}

export interface EventTemplateConfig {
  level: 'INFO' | 'MINOR' | 'MAJOR' | 'CRITICAL';
  context: string;
  message: string;
}

export interface DemoTemplate {
  id: string;
  org_id: string;
  name: string;
  description: string;
  element_type: GlobalElementType;
  config_payload: Record<string, unknown>;
  version: number;
  is_active: boolean;
  tags: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface DemoVariable {
  id: string;
  org_id: string;
  name: string;
  token: string;
  description: string;
  type: VariableType;
  default_value: string;
  validation_rules?: {
    pattern?: string;
    min?: number;
    max?: number;
    required?: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface DemoVariableValueEntry {
  variable_id: string;
  value: string;
}

export interface DemoVariableValues {
  org: DemoVariableValueEntry[];
  siteGroups: Record<string, DemoVariableValueEntry[]>;
  sites: Record<string, DemoVariableValueEntry[]>;
}

export interface DemoTemplateAssignment {
  template_id: string;
  scope: VariableScope;
  scope_id: string;
}

export interface DemoService {
  id: string;
  serviceName: string;
  ssid: string;
  enabled: boolean;
  description: string;
  band: 'all' | '2.4' | '5' | '6' | 'dual';
  vlan: number;
  maxClients: number;
  maxClientsPer24?: number;
  maxClientsPer5?: number;
  hidden: boolean;
  suppressSsid?: boolean;
  captivePortal: boolean;
  guestAccess: boolean;
  canEdit: boolean;
  canDelete: boolean;
  defaultVlanId: string;
  defaultAuthRoleId?: string;
  defaultUnauthRoleId?: string;
  proxied: 'Local' | 'Centralized';
  security: {
    type: string;
    authType?: string;
    authMethod?: string;
    encryption?: string;
    passphrase?: string;
    privacyType?: string;
  };
  WpaPskElement?: {
    mode: string;
    pmfMode: string;
    presharedKey: string;
    keyHexEncoded: boolean;
  };
  WpaEnterpriseElement?: {
    mode: string;
    pmfMode: string;
    fastTransitionEnabled: boolean;
    fastTransitionMdId: number;
  };
  WpaSaeElement?: {
    pmfMode: string;
    presharedKey?: string;
    keyHexEncoded?: boolean;
    saeMethod?: string;
    encryption?: string;
    akmSuiteSelector?: string;
  };
  mbaEnabled?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DemoProfile {
  id: string;
  name: string;
  description: string;
  siteId?: string;
  services: string[];
  apCount: number;
  clientCount: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DemoTopology {
  id: string;
  name: string;
  description: string;
  type: 'bridged' | 'routed' | 'tunneled';
  vlanId: number;
  vlanName: string;
  dhcpMode: 'relay' | 'local' | 'external';
  dhcpServer?: string;
  gatewayIp?: string;
  subnetMask?: string;
  mtu: number;
  createdAt: string;
  updatedAt: string;
}

export interface DemoAAAPolicy {
  id: string;
  name: string;
  naiRouting: boolean;
  authenticationProtocol: 'PAP' | 'CHAP' | 'MS-CHAP' | 'MS-CHAP2';
  nasIpAddress: string;
  nasId: string;
  calledStationId: CalledStationIdFormat;
  accountingType: AccountingType;
  accountingInterimInterval: number;
  radiusAuthServersMode: 'Failover' | 'Load-Balance' | 'Broadcast';
  radiusAcctServersMode: 'Failover' | 'Load-Balance' | 'Broadcast';
  eventTimestamp: boolean;
  includeFramedIp: boolean;
  reportNasLocation: boolean;
  includeMessageAuthenticator: boolean;
  operatorName: 'None' | 'Custom';
  operatorNameValue?: string;
  radiusAuthServers: {
    order: number;
    host: string;
    port: number;
    secret: string;
    retries: number;
    timeout: number;
    serverType: 'Standard' | 'RFC5765';
  }[];
  radiusAcctServers: {
    order: number;
    host: string;
    port: number;
    secret: string;
    retries: number;
    timeout: number;
    serverType: 'Standard' | 'RFC5765';
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface VerticalDemoProfile {
  key: VerticalKey;
  org: DemoOrg;
  siteGroups: DemoSiteGroup[];
  sites: DemoSiteConfig[];

  // AP generation
  apModelPools: Record<string, string[]>;
  hostnamePrefix: string;
  internalDomain: string;
  rfPolicyNames: Record<string, string>;
  profileNames: Record<string, string>;

  // Client generation
  hostnamePools: Record<string, string[]>;
  manufacturerMap: Record<string, string>;
  deviceTypeMap: Record<string, string>;
  ssidMap: Record<string, string>;
  vlanMap: Record<string, number>;
  authMap: Record<string, 'WPA2-Personal' | 'WPA3-Enterprise' | 'WPA2-Enterprise'>;

  // Per-site-type behavior
  siteTypeProfiles: Record<string, SiteTypeProfile>;

  // Global Elements
  templates: DemoTemplate[];
  variableDefinitions: DemoVariable[];
  variableValues: DemoVariableValues;
  templateAssignments: DemoTemplateAssignment[];

  // API responses
  services: DemoService[];
  profiles: DemoProfile[];
  topologies: DemoTopology[];
  aaaPolicies: DemoAAAPolicy[];

  // Events
  eventTemplates: EventTemplateConfig[];
}
