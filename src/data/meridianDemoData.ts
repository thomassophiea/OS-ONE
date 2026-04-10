/**
 * Meridian Retail Group — Demo Mock Data
 *
 * Full org hierarchy, APs, clients, SLE metrics, events, and alarms for a
 * fictional multi-region retail chain. All data is generated deterministically
 * from a seeded PRNG so the app looks the same on every page load.
 *
 * TODO: Replace with real API calls when connected to a live controller.
 */

// ── Seeded PRNG ──────────────────────────────────────────────────────────────

function makePRNG(seedStr: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  return function () {
    h ^= h << 13;
    h ^= h >> 17;
    h ^= h << 5;
    h = h >>> 0;
    return h / 0xffffffff;
  };
}

function rndInt(rnd: () => number, min: number, max: number) {
  return Math.floor(rnd() * (max - min + 1)) + min;
}

function pick<T>(rnd: () => number, arr: T[]): T {
  return arr[Math.floor(rnd() * arr.length)];
}

function mac(rnd: () => number): string {
  const hex = () => rndInt(rnd, 0, 255).toString(16).padStart(2, '0');
  return `02:${hex()}:${hex()}:${hex()}:${hex()}:${hex()}`;
}

function ip(prefix: string, last: number): string {
  return `${prefix}.${last}`;
}

// ── Organization ─────────────────────────────────────────────────────────────

export const DEMO_ORG = {
  id: 'meridian-org',
  name: 'Meridian Retail Group',
  slug: 'meridian-retail',
  description: 'Enterprise retail WiFi — 22 locations across 4 regions',
  logo_url: null,
  settings: {},
  created_at: '2023-01-15T09:00:00Z',
};

// ── Site Groups (Regional Controllers) ───────────────────────────────────────

export const DEMO_SITE_GROUPS = [
  {
    id: 'sg-northeast',
    org_id: 'meridian-org',
    name: 'Northeast Region',
    description: 'NY, MA, PA, NJ, CT, RI — 6 retail locations',
    controller_url: 'https://ctrl-ne.meridian.internal',
    controller_port: 443,
    connection_status: 'connected' as const,
    last_connected_at: new Date().toISOString(),
    is_default: true,
    region: 'Northeast',
    tags: ['retail', 'northeast'],
    site_count: 6,
    created_at: '2023-01-15T09:00:00Z',
  },
  {
    id: 'sg-southeast',
    org_id: 'meridian-org',
    name: 'Southeast Region',
    description: 'GA, FL, NC, TN — 6 retail locations',
    controller_url: 'https://ctrl-se.meridian.internal',
    controller_port: 443,
    connection_status: 'connected' as const,
    last_connected_at: new Date().toISOString(),
    is_default: false,
    region: 'Southeast',
    tags: ['retail', 'southeast'],
    site_count: 6,
    created_at: '2023-01-15T09:00:00Z',
  },
  {
    id: 'sg-west',
    org_id: 'meridian-org',
    name: 'West Coast Region',
    description: 'CA, WA, OR, NV — 6 retail locations',
    controller_url: 'https://ctrl-wc.meridian.internal',
    controller_port: 443,
    connection_status: 'connected' as const,
    last_connected_at: new Date().toISOString(),
    is_default: false,
    region: 'West Coast',
    tags: ['retail', 'westcoast'],
    site_count: 6,
    created_at: '2023-01-15T09:00:00Z',
  },
  {
    id: 'sg-corporate',
    org_id: 'meridian-org',
    name: 'Corporate & Logistics',
    description: 'HQ, distribution centers, warehouse',
    controller_url: 'https://ctrl-corp.meridian.internal',
    controller_port: 443,
    connection_status: 'connected' as const,
    last_connected_at: new Date().toISOString(),
    is_default: false,
    region: 'Corporate',
    tags: ['corporate', 'logistics'],
    site_count: 4,
    created_at: '2023-01-15T09:00:00Z',
  },
];

// ── Sites ─────────────────────────────────────────────────────────────────────

interface DemoSite {
  id: string;
  name: string;
  site_group_id: string;
  org_id: string;
  type: 'flagship' | 'standard' | 'outlet' | 'hq' | 'dc' | 'warehouse';
  apCount: number;
  ipPrefix: string; // e.g. "10.10.1"
  location: string;
  status: 'active';
  created_at: string;
}

export const DEMO_SITES: DemoSite[] = [
  // Northeast
  { id: 'ne-nyc-flagship',   name: 'NYC Flagship — 5th Ave',           site_group_id: 'sg-northeast', org_id: 'meridian-org', type: 'flagship',  apCount: 24, ipPrefix: '10.10.1', location: 'New York, NY',          status: 'active', created_at: '2023-02-01T10:00:00Z' },
  { id: 'ne-boston-std',     name: 'Boston — Prudential Center',        site_group_id: 'sg-northeast', org_id: 'meridian-org', type: 'standard',  apCount: 10, ipPrefix: '10.10.2', location: 'Boston, MA',            status: 'active', created_at: '2023-02-01T10:00:00Z' },
  { id: 'ne-philly-std',     name: 'Philadelphia — King of Prussia',    site_group_id: 'sg-northeast', org_id: 'meridian-org', type: 'standard',  apCount: 11, ipPrefix: '10.10.3', location: 'King of Prussia, PA',   status: 'active', created_at: '2023-02-01T10:00:00Z' },
  { id: 'ne-newark-outlet',  name: 'Newark Outlet',                     site_group_id: 'sg-northeast', org_id: 'meridian-org', type: 'outlet',    apCount: 12, ipPrefix: '10.10.4', location: 'Newark, NJ',            status: 'active', created_at: '2023-03-01T10:00:00Z' },
  { id: 'ne-hartford-std',   name: 'Hartford — Westfarms Mall',         site_group_id: 'sg-northeast', org_id: 'meridian-org', type: 'standard',  apCount:  9, ipPrefix: '10.10.5', location: 'Farmington, CT',        status: 'active', created_at: '2023-03-01T10:00:00Z' },
  { id: 'ne-providence-std', name: 'Providence — Providence Place',     site_group_id: 'sg-northeast', org_id: 'meridian-org', type: 'standard',  apCount:  8, ipPrefix: '10.10.6', location: 'Providence, RI',        status: 'active', created_at: '2023-04-01T10:00:00Z' },
  // Southeast
  { id: 'se-atl-flagship',   name: 'Atlanta Flagship — Lenox Square',   site_group_id: 'sg-southeast', org_id: 'meridian-org', type: 'flagship',  apCount: 26, ipPrefix: '10.20.1', location: 'Atlanta, GA',           status: 'active', created_at: '2023-02-01T10:00:00Z' },
  { id: 'se-miami-flagship', name: 'Miami Flagship — Brickell City',    site_group_id: 'sg-southeast', org_id: 'meridian-org', type: 'flagship',  apCount: 22, ipPrefix: '10.20.2', location: 'Miami, FL',             status: 'active', created_at: '2023-02-01T10:00:00Z' },
  { id: 'se-charlotte-std',  name: 'Charlotte — SouthPark Mall',        site_group_id: 'sg-southeast', org_id: 'meridian-org', type: 'standard',  apCount: 10, ipPrefix: '10.20.3', location: 'Charlotte, NC',         status: 'active', created_at: '2023-03-01T10:00:00Z' },
  { id: 'se-nashville-std',  name: 'Nashville — Cool Springs',          site_group_id: 'sg-southeast', org_id: 'meridian-org', type: 'standard',  apCount:  9, ipPrefix: '10.20.4', location: 'Franklin, TN',          status: 'active', created_at: '2023-03-01T10:00:00Z' },
  { id: 'se-tampa-outlet',   name: 'Tampa Outlet',                      site_group_id: 'sg-southeast', org_id: 'meridian-org', type: 'outlet',    apCount: 13, ipPrefix: '10.20.5', location: 'Tampa, FL',             status: 'active', created_at: '2023-04-01T10:00:00Z' },
  { id: 'se-savannah-std',   name: 'Savannah — Oglethorpe Mall',        site_group_id: 'sg-southeast', org_id: 'meridian-org', type: 'standard',  apCount:  8, ipPrefix: '10.20.6', location: 'Savannah, GA',          status: 'active', created_at: '2023-04-01T10:00:00Z' },
  // West Coast
  { id: 'wc-la-flagship',    name: 'LA Flagship — Beverly Center',      site_group_id: 'sg-west',      org_id: 'meridian-org', type: 'flagship',  apCount: 28, ipPrefix: '10.30.1', location: 'Los Angeles, CA',       status: 'active', created_at: '2023-02-01T10:00:00Z' },
  { id: 'wc-sf-flagship',    name: 'SF Flagship — Union Square',        site_group_id: 'sg-west',      org_id: 'meridian-org', type: 'flagship',  apCount: 25, ipPrefix: '10.30.2', location: 'San Francisco, CA',     status: 'active', created_at: '2023-02-01T10:00:00Z' },
  { id: 'wc-seattle-std',    name: 'Seattle — University Village',      site_group_id: 'sg-west',      org_id: 'meridian-org', type: 'standard',  apCount: 11, ipPrefix: '10.30.3', location: 'Seattle, WA',           status: 'active', created_at: '2023-03-01T10:00:00Z' },
  { id: 'wc-portland-std',   name: 'Portland — Lloyd Center',           site_group_id: 'sg-west',      org_id: 'meridian-org', type: 'standard',  apCount:  9, ipPrefix: '10.30.4', location: 'Portland, OR',          status: 'active', created_at: '2023-03-01T10:00:00Z' },
  { id: 'wc-sandiego-outlet',name: 'San Diego Outlet — Las Americas',   site_group_id: 'sg-west',      org_id: 'meridian-org', type: 'outlet',    apCount: 14, ipPrefix: '10.30.5', location: 'San Diego, CA',         status: 'active', created_at: '2023-04-01T10:00:00Z' },
  { id: 'wc-lasvegas-std',   name: 'Las Vegas — Fashion Show Mall',     site_group_id: 'sg-west',      org_id: 'meridian-org', type: 'standard',  apCount: 12, ipPrefix: '10.30.6', location: 'Las Vegas, NV',         status: 'active', created_at: '2023-04-01T10:00:00Z' },
  // Corporate
  { id: 'corp-hq',           name: 'Meridian HQ — Atlanta Campus',      site_group_id: 'sg-corporate', org_id: 'meridian-org', type: 'hq',        apCount: 48, ipPrefix: '10.40.1', location: 'Atlanta, GA',           status: 'active', created_at: '2023-01-15T09:00:00Z' },
  { id: 'corp-ne-dc',        name: 'Northeast Distribution Center',     site_group_id: 'sg-corporate', org_id: 'meridian-org', type: 'dc',        apCount: 62, ipPrefix: '10.40.2', location: 'Edison, NJ',            status: 'active', created_at: '2023-01-15T09:00:00Z' },
  { id: 'corp-wc-dc',        name: 'West Coast Distribution Center',    site_group_id: 'sg-corporate', org_id: 'meridian-org', type: 'dc',        apCount: 58, ipPrefix: '10.40.3', location: 'Fontana, CA',           status: 'active', created_at: '2023-01-15T09:00:00Z' },
  { id: 'corp-warehouse',    name: 'Central Warehouse — Memphis',       site_group_id: 'sg-corporate', org_id: 'meridian-org', type: 'warehouse', apCount: 44, ipPrefix: '10.40.4', location: 'Memphis, TN',           status: 'active', created_at: '2023-01-15T09:00:00Z' },
];

// ── AP Model pools by site type ───────────────────────────────────────────────

const AP_MODELS: Record<DemoSite['type'], string[]> = {
  flagship:  ['AP460C', 'AP460C', 'AP460C', 'AP410C', 'AP410C', 'AP305C'],
  standard:  ['AP305C', 'AP305C', 'AP305C', 'AP410C', 'AP305CX'],
  outlet:    ['AP305C', 'AP305C', 'AP302i', 'AP302i', 'AP305C'],
  hq:        ['AP460C', 'AP460C', 'AP410C', 'AP410C', 'AP305C'],
  dc:        ['AP410i', 'AP410i', 'AP410C', 'AP410C', 'AP460i'],
  warehouse: ['AP410i', 'AP410i', 'AP410C', 'AP302i', 'AP410i'],
};

const FIRMWARE_VERSIONS = [
  '10.6.2.0-056R',
  '10.6.1.0-042R',
  '10.6.3.0-012R',
  '10.5.4.0-098R',
];

const CHANNELS_5G = [36, 40, 44, 48, 52, 56, 60, 64, 100, 104, 108, 112, 116, 149, 153, 157, 161];
const CHANNELS_6G = [1, 5, 9, 13, 17, 21, 25, 29, 33, 37, 41, 45, 49, 53, 57, 61, 65, 69, 73, 77, 81, 85, 89, 93];

// ── AP Generation ─────────────────────────────────────────────────────────────

export interface MockAP {
  serialNumber: string;
  displayName: string;
  hostname: string;
  model: string;
  hardwareType: string;
  apModel: string;
  status: string;
  connectionState: string;
  online: boolean;
  ipAddress: string;
  macAddress: string;
  location: string;
  site: string;
  hostSite: string;
  firmware: string;
  softwareVersion: string;
  clientCount: number;
  channel2g: number;
  channel5g: number;
  channel6g: number;
  txPower: number;
  uptime: number;
  rfMgmtPolicyName: string;
  profileName: string;
  environment: string;
  source: string;
}

function generateAPsForSite(site: DemoSite): MockAP[] {
  const rnd = makePRNG(`ap-${site.id}`);
  const aps: MockAP[] = [];
  const siteAbbr = site.id.toUpperCase().replace(/-/g, '').slice(0, 8);

  for (let i = 0; i < site.apCount; i++) {
    const model = pick(rnd, AP_MODELS[site.type]);
    const isDown = rnd() < 0.04; // 4% chance down
    const clientBase = site.type === 'flagship' ? 32 : site.type === 'hq' ? 28 : site.type === 'dc' || site.type === 'warehouse' ? 6 : 18;
    const clientCount = isDown ? 0 : rndInt(rnd, Math.max(1, clientBase - 12), clientBase + 14);
    const floor = rndInt(rnd, 1, site.type === 'hq' ? 6 : site.type === 'flagship' ? 3 : 2);

    aps.push({
      serialNumber: `MRD-${siteAbbr}-${String(i + 1).padStart(3, '0')}`,
      displayName: `${site.id.replace(/-/g, '_').toUpperCase()}-AP-${floor}F-${String((i % 12) + 1).padStart(2, '0')}`,
      hostname: `ap-${site.id}-${String(i + 1).padStart(3, '0')}.meridian.internal`,
      model,
      hardwareType: model,
      apModel: model,
      status: isDown ? (rnd() < 0.5 ? 'disconnected' : 'error') : 'connected',
      connectionState: isDown ? 'Disconnected' : 'Connected',
      online: !isDown,
      ipAddress: ip(site.ipPrefix, 10 + i),
      macAddress: mac(rnd),
      location: `${site.location} — Floor ${floor}`,
      site: site.name,
      hostSite: site.name,
      firmware: pick(rnd, FIRMWARE_VERSIONS),
      softwareVersion: pick(rnd, FIRMWARE_VERSIONS),
      clientCount,
      channel2g: pick(rnd, [1, 6, 11]),
      channel5g: pick(rnd, CHANNELS_5G),
      channel6g: pick(rnd, CHANNELS_6G),
      txPower: rndInt(rnd, 15, 23),
      uptime: rndInt(rnd, 3600 * 24, 3600 * 24 * 120),
      rfMgmtPolicyName: site.type === 'dc' || site.type === 'warehouse' ? 'Retail-Industrial-RRM' : 'Retail-Standard-RRM',
      profileName: site.type === 'hq' ? 'Corporate-Profile' : site.type === 'dc' || site.type === 'warehouse' ? 'Logistics-Profile' : 'Retail-Profile',
      environment: 'Production',
      source: 'controller',
    });
  }

  return aps;
}

// Build AP map per site group (lazy — generated on first access)
const _apCache = new Map<string, MockAP[]>();

export function getAPsForSiteGroup(siteGroupId: string): MockAP[] {
  if (_apCache.has(siteGroupId)) return _apCache.get(siteGroupId)!;
  const sites = DEMO_SITES.filter(s => s.site_group_id === siteGroupId);
  const aps = sites.flatMap(generateAPsForSite);
  _apCache.set(siteGroupId, aps);
  return aps;
}

export function getAllAPs(): MockAP[] {
  return DEMO_SITE_GROUPS.flatMap(sg => getAPsForSiteGroup(sg.id));
}

// ── Station (Client) Generation ───────────────────────────────────────────────

const RETAIL_HOSTNAMES = [
  'POS-TERM-{n}', 'POS-TERM-{n}', 'POS-TERM-{n}',
  'SCAN-GUN-{n}', 'SCAN-GUN-{n}',
  'TAG-PRN-{n}',
  'CCTV-CAM-{n}',
  'iPad-Staff-{n}', 'iPhone-Staff-{n}',
  'android-guest', 'iPhone', 'samsung-galaxy-{n}', 'iPhone', 'iPhone',
];

const DC_HOSTNAMES = [
  'SCAN-HH-{n}', 'SCAN-HH-{n}', 'SCAN-HH-{n}',
  'FRKLFT-{n}', 'FRKLFT-{n}',
  'PICK-TAB-{n}', 'PICK-TAB-{n}',
  'CONVEYOR-CTL-{n}',
  'MRD-LAPTOP-{n}',
];

const HQ_HOSTNAMES = [
  'MRD-LAPTOP-{n}', 'MRD-LAPTOP-{n}', 'MRD-LAPTOP-{n}',
  'MacBook-{n}',
  'MRD-PHONE-{n}', 'iPhone-{n}',
  'CONF-ROOM-{n}',
  'android-guest', 'iPhone-guest',
];

const MANUFACTURERS: Record<string, string> = {
  'POS-TERM': 'Ingenico',
  'SCAN-GUN': 'Zebra Technologies',
  'TAG-PRN': 'Zebra Technologies',
  'CCTV-CAM': 'Axis Communications',
  'iPad-Staff': 'Apple',
  'iPhone-Staff': 'Apple',
  'iPhone': 'Apple',
  'android-guest': 'Samsung',
  'samsung-galaxy': 'Samsung',
  'FRKLFT': 'Toyota Industries',
  'SCAN-HH': 'Zebra Technologies',
  'PICK-TAB': 'Zebra Technologies',
  'CONVEYOR-CTL': 'Honeywell',
  'MRD-LAPTOP': 'Dell Technologies',
  'MacBook': 'Apple',
  'MRD-PHONE': 'Apple',
  'CONF-ROOM': 'Logitech',
  'iPhone-guest': 'Apple',
};

const SSID_BY_TYPE: Record<string, string> = {
  'POS-TERM': 'Meridian-POS',
  'SCAN-GUN': 'Meridian-IoT',
  'TAG-PRN': 'Meridian-IoT',
  'CCTV-CAM': 'Meridian-IoT',
  'CONVEYOR-CTL': 'Meridian-IoT',
  'FRKLFT': 'Meridian-Staff',
  'PICK-TAB': 'Meridian-Staff',
  'iPad-Staff': 'Meridian-Staff',
  'iPhone-Staff': 'Meridian-Staff',
  'MRD-LAPTOP': 'Meridian-Staff',
  'MacBook': 'Meridian-Staff',
  'MRD-PHONE': 'Meridian-Staff',
  'CONF-ROOM': 'Meridian-Staff',
  'default': 'Meridian-Guest',
};

const VLAN_BY_SSID: Record<string, number> = {
  'Meridian-POS': 10,
  'Meridian-Staff': 20,
  'Meridian-Guest': 100,
  'Meridian-IoT': 200,
};

export function getStationsForAP(ap: MockAP): object[] {
  if (ap.status !== 'connected' || ap.clientCount === 0) return [];

  const site = DEMO_SITES.find(s => s.name === ap.hostSite);
  const siteType = site?.type ?? 'standard';
  const pool = siteType === 'dc' || siteType === 'warehouse' ? DC_HOSTNAMES
    : siteType === 'hq' ? HQ_HOSTNAMES : RETAIL_HOSTNAMES;

  const rnd = makePRNG(`sta-${ap.serialNumber}`);
  const stations: object[] = [];

  for (let i = 0; i < ap.clientCount; i++) {
    const templateName = pick(rnd, pool);
    const baseName = templateName.replace(/-\{n\}$/, '');
    const hostName = templateName.includes('{n}')
      ? templateName.replace('{n}', String(rndInt(rnd, 1, 99)).padStart(2, '0'))
      : templateName;
    const ssid = SSID_BY_SSID_LOOKUP(baseName);
    const vlan = VLAN_BY_SSID[ssid] ?? 100;
    const band = rnd() < 0.55 ? '5GHz' : rnd() < 0.85 ? '6GHz' : '2.4GHz';
    const rssi = rndInt(rnd, -74, -42);

    stations.push({
      macAddress: mac(rnd),
      ipAddress: ip(site?.ipPrefix ?? '10.0.1', 50 + i),
      hostName,
      status: 'Associated',
      ssid,
      essid: ssid,
      network: ssid,
      vlan: String(vlan),
      vlanId: vlan,
      signalStrength: rssi,
      rssi,
      band,
      radioType: band,
      manufacturer: MANUFACTURERS[baseName] ?? 'Unknown',
      deviceType: baseName.startsWith('POS') ? 'Point of Sale Terminal'
        : baseName.startsWith('SCAN') ? 'Barcode Scanner'
        : baseName.startsWith('iPad') || baseName.startsWith('MacBook') ? 'Tablet'
        : baseName.startsWith('iPhone') || baseName.startsWith('MRD-PHONE') ? 'Smartphone'
        : baseName.startsWith('CCTV') ? 'IP Camera'
        : baseName.startsWith('MRD-LAPTOP') ? 'Laptop'
        : baseName.startsWith('FRKLFT') ? 'Forklift Terminal'
        : 'IoT Device',
      apName: ap.displayName,
      apSerial: ap.serialNumber,
      apSn: ap.serialNumber,
      siteName: ap.hostSite,
      associationTime: new Date(Date.now() - rndInt(rnd, 60000, 28800000)).toISOString(),
      lastSeen: new Date().toISOString(),
      dataRate: pick(rnd, ['54 Mbps', '144 Mbps', '300 Mbps', '450 Mbps', '600 Mbps', '867 Mbps', '1200 Mbps']),
      txBytes: rndInt(rnd, 1024 * 100, 1024 * 1024 * 500),
      rxBytes: rndInt(rnd, 1024 * 50, 1024 * 1024 * 200),
      authMethod: ssid === 'Meridian-Guest' ? 'WPA2-Personal' : 'WPA3-Enterprise',
      encryption: ssid === 'Meridian-Guest' ? 'AES' : 'AES-256',
    });
  }

  return stations;
}

function SSID_BY_SSID_LOOKUP(baseName: string): string {
  return SSID_BY_TYPE[baseName] ?? SSID_BY_TYPE['default'];
}

// ── All stations (for Connected Clients page) ─────────────────────────────────

export function getAllStationsForSiteGroup(siteGroupId: string): object[] {
  return getAPsForSiteGroup(siteGroupId).flatMap(ap => getStationsForAP(ap));
}

// ── SLE Metrics ───────────────────────────────────────────────────────────────

const SLE_PROFILES: Record<DemoSite['type'], { base: number; variance: number }> = {
  flagship:  { base: 93, variance: 4 },
  standard:  { base: 90, variance: 5 },
  outlet:    { base: 87, variance: 6 },
  hq:        { base: 94, variance: 3 },
  dc:        { base: 83, variance: 7 },
  warehouse: { base: 80, variance: 8 },
};

const SLE_CLASSIFIERS = ['throughput', 'capacity', 'coverage', 'roaming', 'dhcp', 'dns', 'auth', 'time_to_connect'];

export function getSLEForSite(siteId: string): Record<string, number> {
  const site = DEMO_SITES.find(s => s.id === siteId);
  if (!site) return {};
  const rnd = makePRNG(`sle-${siteId}`);
  const { base, variance } = SLE_PROFILES[site.type];
  const result: Record<string, number> = {};
  for (const cls of SLE_CLASSIFIERS) {
    result[cls] = Math.min(100, Math.max(60, Math.round(base + (rnd() - 0.5) * variance * 2)));
  }
  result['overall'] = Math.round(Object.values(result).reduce((a, b) => a + b, 0) / SLE_CLASSIFIERS.length);
  return result;
}

export function getSLEForSiteGroup(siteGroupId: string): object {
  const sites = DEMO_SITES.filter(s => s.site_group_id === siteGroupId);
  const scores = sites.map(s => getSLEForSite(s.id));
  const avg = (key: string) => Math.round(scores.reduce((a, s) => a + (s[key] ?? 0), 0) / scores.length);
  return {
    overall: avg('overall'),
    throughput: avg('throughput'),
    capacity: avg('capacity'),
    coverage: avg('coverage'),
    roaming: avg('roaming'),
    dhcp: avg('dhcp'),
    dns: avg('dns'),
    auth: avg('auth'),
    time_to_connect: avg('time_to_connect'),
  };
}

// ── Events ────────────────────────────────────────────────────────────────────

const EVENT_TEMPLATES = [
  { level: 'INFO',     context: 'ConnectDetails',   message: 'AP {ap} successfully adopted and connected' },
  { level: 'INFO',     context: 'FirmwareUpgrade',   message: 'AP {ap} upgraded to firmware 10.6.2.0-056R' },
  { level: 'MINOR',    context: 'ChannelChange',     message: 'AP {ap} automatic channel change: 5GHz {ch1} → {ch2} (interference mitigation)' },
  { level: 'MINOR',    context: 'ClientStorm',       message: 'AP {ap} at {site}: client association rate spike (pre-store-open rush)' },
  { level: 'INFO',     context: 'RoamEvent',         message: 'POS-TERM-{n} roamed from {ap} to {ap2} (RSSI: -{rssi} dBm)' },
  { level: 'MAJOR',    context: 'APDown',            message: 'AP {ap} at {site} disconnected — PoE budget exceeded on switch port' },
  { level: 'INFO',     context: 'ConfigPush',        message: 'Template "Retail-RF-Policy" applied to {site} — 0 conflicts' },
  { level: 'MINOR',    context: 'TxPowerAdjust',     message: 'AP {ap}: TX power auto-adjusted 5GHz 20 dBm → 17 dBm (coverage overlap)' },
  { level: 'INFO',     context: 'ClientAssoc',       message: 'POS-TERM-{n} (Ingenico) associated on Meridian-POS VLAN 10 at {site}' },
  { level: 'CRITICAL', context: 'RogueAP',           message: 'Rogue AP detected near {site} loading dock — SSID: "FREE-WIFI" (00:1A:2B:3C:4D:5E)' },
  { level: 'INFO',     context: 'AlarmCleared',      message: 'AP {ap} at {site}: PoE issue resolved — normal operation resumed' },
  { level: 'MINOR',    context: 'HighRetry',         message: 'AP {ap}: 2.4GHz retry rate elevated (14%) — co-channel interference suspected' },
];

export function getEvents(siteGroupId?: string): object[] {
  const rnd = makePRNG(`events-${siteGroupId ?? 'all'}`);
  const sites = siteGroupId
    ? DEMO_SITES.filter(s => s.site_group_id === siteGroupId)
    : DEMO_SITES;
  const aps = siteGroupId ? getAPsForSiteGroup(siteGroupId) : getAllAPs();

  const events: object[] = [];
  const now = Date.now();

  for (let i = 0; i < 60; i++) {
    const tmpl = pick(rnd, EVENT_TEMPLATES);
    const site = pick(rnd, sites);
    const ap = pick(rnd, aps);
    const ap2 = pick(rnd, aps);
    const ts = now - rndInt(rnd, 0, 3600000 * 72);

    const message = tmpl.message
      .replace('{ap}', ap.displayName)
      .replace('{ap2}', ap2.displayName)
      .replace('{site}', site.name)
      .replace('{ch1}', String(pick(rnd, CHANNELS_5G)))
      .replace('{ch2}', String(pick(rnd, CHANNELS_5G)))
      .replace('{rssi}', String(rndInt(rnd, 55, 72)))
      .replace('{n}', String(rndInt(rnd, 1, 30)).padStart(2, '0'));

    events.push({
      id: `evt-${siteGroupId ?? 'all'}-${i}`,
      ts,
      timestamp: new Date(ts).toISOString(),
      log: message,
      ApSerial: ap.serialNumber,
      ApName: ap.displayName,
      Id: 1000 + i,
      Context: tmpl.context,
      Category: tmpl.level === 'CRITICAL' ? 'Security' : tmpl.context === 'FirmwareUpgrade' ? 'Maintenance' : 'Operations',
      Level: tmpl.level,
      pos: i,
      level: tmpl.level.toLowerCase(),
      message,
      eventType: tmpl.context,
      type: tmpl.context,
      category: tmpl.context === 'RogueAP' ? 'Security' : 'System',
      siteName: site.name,
      details: message,
    });
  }

  return events.sort((a: any, b: any) => b.ts - a.ts);
}

// ── Alarms ────────────────────────────────────────────────────────────────────

export function getAlarms(siteGroupId?: string): object[] {
  const rnd = makePRNG(`alarms-${siteGroupId ?? 'all'}`);
  const aps = siteGroupId ? getAPsForSiteGroup(siteGroupId) : getAllAPs();
  const sites = siteGroupId
    ? DEMO_SITES.filter(s => s.site_group_id === siteGroupId)
    : DEMO_SITES;
  const downAPs = aps.filter(a => a.status !== 'connected');

  const alarms = downAPs.slice(0, 8).map((ap, i) => ({
    log: `AP ${ap.displayName} is ${ap.status} — check PoE and uplink switch port`,
    ts: Date.now() - rndInt(rnd, 60000, 7200000),
    pos: i,
    ApSerial: ap.serialNumber,
    ApName: ap.displayName,
    Id: 2000 + i,
    Context: 'APDown',
    Category: 'Connectivity',
    Level: 'MAJOR',
  }));

  // Add a rogue AP alarm if we have sites with dc/outlet types
  const riskyKsite = sites.find(s => s.type === 'dc' || s.type === 'outlet');
  if (riskyKsite) {
    alarms.push({
      log: `Rogue AP detected near ${riskyKsite.name} — SSID: "FREE-WIFI" (Uncontained)`,
      ts: Date.now() - rndInt(rnd, 3600000, 14400000),
      pos: alarms.length,
      ApSerial: 'ROGUE-001',
      ApName: 'ROGUE-AP-001',
      Id: 2999,
      Context: 'RogueAP',
      Category: 'Security',
      Level: 'CRITICAL',
    });
  }

  return alarms;
}

// ── Security data ─────────────────────────────────────────────────────────────

export function getSecurityData(siteGroupId?: string): object {
  const rogues = [
    { id: 'rogue-1', ssid: 'FREE-WIFI',          bssid: '00:1A:2B:3C:4D:5E', channel: 6,  rssi: -68, site: 'Northeast Distribution Center', status: 'Uncontained', firstSeen: '2026-04-07T14:23:00Z' },
    { id: 'rogue-2', ssid: 'linksys',             bssid: '00:1A:2B:3C:4D:5F', channel: 11, rssi: -71, site: 'Northeast Distribution Center', status: 'Contained',   firstSeen: '2026-04-06T09:15:00Z' },
    { id: 'rogue-3', ssid: 'Xfinity',             bssid: '9C:97:26:AA:BB:CC', channel: 1,  rssi: -74, site: 'Miami Flagship — Brickell City', status: 'Monitoring',  firstSeen: '2026-04-05T11:42:00Z' },
    { id: 'rogue-4', ssid: 'ATT-WIFI-FREE',        bssid: '48:F8:B3:DD:EE:FF', channel: 6,  rssi: -76, site: 'Tampa Outlet',                  status: 'Contained',   firstSeen: '2026-04-04T16:55:00Z' },
  ];

  const filtered = siteGroupId
    ? rogues.filter(r => {
        const site = DEMO_SITES.find(s => s.name === r.site);
        return site?.site_group_id === siteGroupId;
      })
    : rogues;

  return {
    rogueAPs: filtered,
    totalRogues: filtered.length,
    contained: filtered.filter(r => r.status === 'Contained').length,
    uncontained: filtered.filter(r => r.status === 'Uncontained').length,
    monitoring: filtered.filter(r => r.status === 'Monitoring').length,
  };
}

// ── Variable Definitions ──────────────────────────────────────────────────────

export const DEMO_VARIABLE_DEFINITIONS = [
  { id: 'vd-01', org_id: 'meridian-org', name: 'POS Terminal VLAN',          token: 'pos_vlan',              type: 'vlan',   default_value: '10',              description: 'VLAN for point-of-sale terminals' },
  { id: 'vd-02', org_id: 'meridian-org', name: 'Staff Network VLAN',          token: 'staff_vlan',            type: 'vlan',   default_value: '20',              description: 'VLAN for employee devices' },
  { id: 'vd-03', org_id: 'meridian-org', name: 'IoT Devices VLAN',            token: 'iot_vlan',              type: 'vlan',   default_value: '200',             description: 'VLAN for printers, cameras, scanners' },
  { id: 'vd-04', org_id: 'meridian-org', name: 'Guest Network VLAN',          token: 'guest_vlan',            type: 'vlan',   default_value: '100',             description: 'VLAN for shopper guest WiFi' },
  { id: 'vd-05', org_id: 'meridian-org', name: 'Guest SSID Name',             token: 'guest_ssid',            type: 'string', default_value: 'Meridian-Guest',  description: 'Broadcast SSID for guest shoppers' },
  { id: 'vd-06', org_id: 'meridian-org', name: 'Staff SSID Name',             token: 'staff_ssid',            type: 'string', default_value: 'Meridian-Staff',  description: 'Internal SSID for store employees' },
  { id: 'vd-07', org_id: 'meridian-org', name: 'POS SSID Name',               token: 'pos_ssid',              type: 'string', default_value: 'Meridian-POS',    description: 'Dedicated SSID for POS terminals' },
  { id: 'vd-08', org_id: 'meridian-org', name: 'Guest Bandwidth Limit (Mbps)',token: 'guest_bw_limit',        type: 'number', default_value: '25',              description: 'Per-client downstream bandwidth cap for guest' },
  { id: 'vd-09', org_id: 'meridian-org', name: 'POS Bandwidth Limit (Mbps)',  token: 'pos_bw_limit',          type: 'number', default_value: '50',              description: 'Per-terminal bandwidth for POS systems' },
  { id: 'vd-10', org_id: 'meridian-org', name: 'Client Idle Timeout (sec)',   token: 'client_idle_timeout',   type: 'number', default_value: '1800',            description: 'Session idle expiry in seconds' },
  { id: 'vd-11', org_id: 'meridian-org', name: 'PMK Cache Timeout (sec)',     token: 'pmk_cache_timeout',     type: 'number', default_value: '43200',           description: 'PMK cache duration for fast roaming (12h)' },
  { id: 'vd-12', org_id: 'meridian-org', name: 'Max Clients per AP',          token: 'max_clients_ap',        type: 'number', default_value: '64',              description: 'Maximum concurrent client associations per radio' },
  { id: 'vd-13', org_id: 'meridian-org', name: 'Store Identifier',            token: 'store_id',              type: 'string', default_value: 'STORE-XXX',       description: 'Unique store code for POS transaction routing' },
  { id: 'vd-14', org_id: 'meridian-org', name: 'Region Code',                 token: 'region_code',           type: 'string', default_value: 'NE',              description: 'Two-letter regional identifier' },
];

// ── Variable Values (per site group / per site overrides) ─────────────────────

export const DEMO_VARIABLE_VALUES = [
  // Site-group level overrides
  { id: 'vv-sg-ne-01', org_id: 'meridian-org', variable_id: 'vd-05', scope_type: 'site_group', scope_id: 'sg-northeast', value: 'Meridian-Guest-NE', source_type: 'override' },
  { id: 'vv-sg-ne-02', org_id: 'meridian-org', variable_id: 'vd-14', scope_type: 'site_group', scope_id: 'sg-northeast', value: 'NE',                source_type: 'override' },
  { id: 'vv-sg-se-01', org_id: 'meridian-org', variable_id: 'vd-05', scope_type: 'site_group', scope_id: 'sg-southeast', value: 'Meridian-Guest-SE', source_type: 'override' },
  { id: 'vv-sg-se-02', org_id: 'meridian-org', variable_id: 'vd-14', scope_type: 'site_group', scope_id: 'sg-southeast', value: 'SE',                source_type: 'override' },
  { id: 'vv-sg-wc-01', org_id: 'meridian-org', variable_id: 'vd-05', scope_type: 'site_group', scope_id: 'sg-west',      value: 'Meridian-Guest-WC', source_type: 'override' },
  { id: 'vv-sg-wc-02', org_id: 'meridian-org', variable_id: 'vd-14', scope_type: 'site_group', scope_id: 'sg-west',      value: 'WC',                source_type: 'override' },
  { id: 'vv-sg-corp-01', org_id: 'meridian-org', variable_id: 'vd-05', scope_type: 'site_group', scope_id: 'sg-corporate', value: 'Meridian-Corporate', source_type: 'override' },
  { id: 'vv-sg-corp-02', org_id: 'meridian-org', variable_id: 'vd-14', scope_type: 'site_group', scope_id: 'sg-corporate', value: 'CORP',             source_type: 'override' },
  { id: 'vv-sg-corp-03', org_id: 'meridian-org', variable_id: 'vd-12', scope_type: 'site_group', scope_id: 'sg-corporate', value: '96',               source_type: 'override' },
  // Site-level store_id overrides
  ...DEMO_SITES.map((site, i) => ({
    id: `vv-site-${site.id}`,
    org_id: 'meridian-org',
    variable_id: 'vd-13',
    scope_type: 'site',
    scope_id: site.id,
    value: `MRD-${String(1001 + i).padStart(4, '0')}`,
    source_type: 'override',
  })),
];

// ── Config Templates ──────────────────────────────────────────────────────────

export const DEMO_TEMPLATES = [
  {
    id: 'tpl-guest-ssid',
    org_id: 'meridian-org',
    name: 'Retail Guest SSID',
    element_type: 'service',
    config_payload: {
      name: '{{guest_ssid}}',
      enabled: true,
      broadcast: true,
      vlan: '{{guest_vlan}}',
      security: 'WPA2-Personal',
      passphrase: 'ShopMeridian2024',
      rateLimit: { downstream: '{{guest_bw_limit}}', upstream: 10 },
      clientIsolation: true,
      maxClients: 128,
    },
    version: 3,
    is_active: true,
    tags: ['retail', 'guest', 'public'],
    created_by: 'admin@meridian.com',
    created_at: '2024-01-10T12:00:00Z',
    updated_at: '2025-11-01T08:30:00Z',
  },
  {
    id: 'tpl-pos-network',
    org_id: 'meridian-org',
    name: 'POS Network',
    element_type: 'service',
    config_payload: {
      name: '{{pos_ssid}}',
      enabled: true,
      broadcast: false,
      vlan: '{{pos_vlan}}',
      security: 'WPA3-Enterprise',
      rateLimit: { downstream: '{{pos_bw_limit}}', upstream: 25 },
      clientIsolation: false,
      pmkCacheTimeout: '{{pmk_cache_timeout}}',
      fastRoaming: true,
    },
    version: 4,
    is_active: true,
    tags: ['retail', 'pos', 'critical'],
    created_by: 'admin@meridian.com',
    created_at: '2024-01-10T12:00:00Z',
    updated_at: '2026-02-14T10:00:00Z',
  },
  {
    id: 'tpl-staff-network',
    org_id: 'meridian-org',
    name: 'Staff Network',
    element_type: 'service',
    config_payload: {
      name: '{{staff_ssid}}',
      enabled: true,
      broadcast: false,
      vlan: '{{staff_vlan}}',
      security: 'WPA3-Enterprise',
      clientIsolation: false,
      fastRoaming: true,
      idleTimeout: '{{client_idle_timeout}}',
    },
    version: 2,
    is_active: true,
    tags: ['retail', 'staff', 'internal'],
    created_by: 'admin@meridian.com',
    created_at: '2024-01-10T12:00:00Z',
    updated_at: '2025-09-20T09:00:00Z',
  },
  {
    id: 'tpl-iot-network',
    org_id: 'meridian-org',
    name: 'IoT / Label Printers',
    element_type: 'service',
    config_payload: {
      name: 'Meridian-IoT',
      enabled: true,
      broadcast: false,
      vlan: '{{iot_vlan}}',
      security: 'WPA2-Enterprise',
      clientIsolation: true,
      dtimPeriod: 3,
      maxClients: 128,
    },
    version: 2,
    is_active: true,
    tags: ['retail', 'iot', 'scanners', 'cameras'],
    created_by: 'admin@meridian.com',
    created_at: '2024-01-10T12:00:00Z',
    updated_at: '2025-07-15T14:30:00Z',
  },
  {
    id: 'tpl-rf-policy',
    org_id: 'meridian-org',
    name: 'Retail RF Policy',
    element_type: 'rf_policy',
    config_payload: {
      maxClientsPerAP: '{{max_clients_ap}}',
      bandSteering: true,
      bandSteeringDelta: 5,
      beaconInterval: 100,
      dtimPeriod: 1,
      rtsThreshold: 2347,
      txPower2g: 17,
      txPower5g: 20,
      channelWidth5g: 80,
      channelWidth6g: 160,
    },
    version: 5,
    is_active: true,
    tags: ['retail', 'rf', 'radio'],
    created_by: 'admin@meridian.com',
    created_at: '2024-01-10T12:00:00Z',
    updated_at: '2026-01-08T16:00:00Z',
  },
];

// ── Template Assignments ──────────────────────────────────────────────────────

export const DEMO_TEMPLATE_ASSIGNMENTS = DEMO_TEMPLATES.map(t => ({
  id: `ta-${t.id}`,
  template_id: t.id,
  scope_type: 'organization',
  scope_id: 'meridian-org',
  is_active: true,
  created_at: t.created_at,
}));

// ── Administrators ────────────────────────────────────────────────────────────

export function getAdministrators(): object[] {
  return [
    { id: 'admin-001', userId: 'jmorales', email: 'j.morales@meridian.com', adminRole: 'FULL', accountState: 'ENABLED', createdAt: '2023-01-15T09:00:00Z', lastLogin: new Date(Date.now() - 3600000 * 2).toISOString(), twoFactorEnabled: true },
    { id: 'admin-002', userId: 'tstanley', email: 't.stanley@meridian.com', adminRole: 'NETWORK_ADMIN', accountState: 'ENABLED', createdAt: '2023-02-01T10:00:00Z', lastLogin: new Date(Date.now() - 3600000 * 8).toISOString(), twoFactorEnabled: true },
    { id: 'admin-003', userId: 'rpatil', email: 'r.patil@meridian.com', adminRole: 'NETWORK_ADMIN', accountState: 'ENABLED', createdAt: '2023-02-15T10:00:00Z', lastLogin: new Date(Date.now() - 86400000).toISOString(), twoFactorEnabled: false },
    { id: 'admin-004', userId: 'lchen', email: 'l.chen@meridian.com', adminRole: 'NETWORK_OPERATOR', accountState: 'ENABLED', createdAt: '2023-03-01T10:00:00Z', lastLogin: new Date(Date.now() - 86400000 * 2).toISOString(), twoFactorEnabled: true },
    { id: 'admin-005', userId: 'mkumar', email: 'm.kumar@meridian.com', adminRole: 'NETWORK_OPERATOR', accountState: 'ENABLED', createdAt: '2023-04-01T10:00:00Z', lastLogin: new Date(Date.now() - 86400000 * 3).toISOString(), twoFactorEnabled: false },
    { id: 'admin-006', userId: 'agarcia', email: 'a.garcia@meridian.com', adminRole: 'READ_ONLY', accountState: 'ENABLED', createdAt: '2023-05-01T10:00:00Z', lastLogin: new Date(Date.now() - 86400000 * 7).toISOString(), twoFactorEnabled: false },
    { id: 'admin-007', userId: 'bwilliams', email: 'b.williams@meridian.com', adminRole: 'READ_ONLY', accountState: 'ENABLED', createdAt: '2024-01-10T10:00:00Z', lastLogin: new Date(Date.now() - 86400000 * 14).toISOString(), twoFactorEnabled: false },
    { id: 'admin-008', userId: 'svc-monitoring', email: 'svc-monitoring@meridian.com', adminRole: 'READ_ONLY', accountState: 'ENABLED', createdAt: '2023-01-15T09:00:00Z', lastLogin: new Date(Date.now() - 3600000 * 0.5).toISOString(), twoFactorEnabled: true },
  ];
}

// ── Certificates / Trustpoints ────────────────────────────────────────────────

export function getCertificates(): object[] {
  return [
    {
      id: 'tp-001',
      name: 'Meridian Root CA',
      type: 'ca',
      subject: 'CN=Meridian Root CA, O=Meridian Retail Group, C=US',
      issuer: 'CN=Meridian Root CA, O=Meridian Retail Group, C=US',
      serialNumber: '01',
      notBefore: '2023-01-01T00:00:00Z',
      notAfter: '2033-01-01T00:00:00Z',
      status: 'valid',
      fingerprint: 'SHA256:AB:12:CD:34:EF:56:78:90:AB:CD:EF:12:34:56:78:90:AB:CD:EF:12:34:56:78:90:AB:CD:EF:12:34:56:78',
      privateKeyPresent: false,
    },
    {
      id: 'tp-002',
      name: 'Meridian Intermediate CA',
      type: 'ca',
      subject: 'CN=Meridian Intermediate CA, O=Meridian Retail Group, C=US',
      issuer: 'CN=Meridian Root CA, O=Meridian Retail Group, C=US',
      serialNumber: '02',
      notBefore: '2023-01-15T00:00:00Z',
      notAfter: '2028-01-15T00:00:00Z',
      status: 'valid',
      fingerprint: 'SHA256:BC:23:DE:45:F0:67:89:01:BC:DE:F0:23:45:67:89:01:BC:DE:F0:23:45:67:89:01:BC:DE:F0:23:45:67:89',
      privateKeyPresent: false,
    },
    {
      id: 'tp-003',
      name: 'Campus Controller — Browser TLS',
      type: 'browser',
      subject: 'CN=ctrl-ne.meridian.internal, O=Meridian Retail Group, C=US',
      issuer: 'CN=Meridian Intermediate CA, O=Meridian Retail Group, C=US',
      serialNumber: '1001',
      notBefore: '2025-01-01T00:00:00Z',
      notAfter: '2026-01-01T00:00:00Z',
      status: 'valid',
      fingerprint: 'SHA256:CD:34:EF:56:01:23:45:67:CD:EF:01:34:56:78:90:12:CD:EF:01:34:56:78:90:12:CD:EF:01:34:56:78:90',
      privateKeyPresent: true,
    },
    {
      id: 'tp-004',
      name: 'RADIUS Server Certificate',
      type: 'radius',
      subject: 'CN=radius.meridian.internal, O=Meridian Retail Group, C=US',
      issuer: 'CN=Meridian Intermediate CA, O=Meridian Retail Group, C=US',
      serialNumber: '1002',
      notBefore: '2025-01-01T00:00:00Z',
      notAfter: '2026-06-30T00:00:00Z',
      status: 'valid',
      fingerprint: 'SHA256:DE:45:F0:67:12:34:56:78:DE:F0:12:45:67:89:01:23:DE:F0:12:45:67:89:01:23:DE:F0:12:45:67:89:01',
      privateKeyPresent: true,
    },
    {
      id: 'tp-005',
      name: 'AP EAP Certificate (Expired)',
      type: 'radius',
      subject: 'CN=ap-eap.meridian.internal, O=Meridian Retail Group, C=US',
      issuer: 'CN=Meridian Intermediate CA, O=Meridian Retail Group, C=US',
      serialNumber: '0999',
      notBefore: '2022-07-01T00:00:00Z',
      notAfter: '2024-07-01T00:00:00Z',
      status: 'expired',
      fingerprint: 'SHA256:EF:56:01:78:23:45:67:89:EF:01:23:56:78:90:12:34:EF:01:23:56:78:90:12:34:EF:01:23:56:78:90:12',
      privateKeyPresent: false,
    },
    {
      id: 'tp-006',
      name: 'Captive Portal Certificate',
      type: 'browser',
      subject: 'CN=portal.meridian.com, O=Meridian Retail Group, C=US',
      issuer: 'CN=Meridian Intermediate CA, O=Meridian Retail Group, C=US',
      serialNumber: '1003',
      notBefore: '2025-03-01T00:00:00Z',
      notAfter: new Date(Date.now() + 86400000 * 22).toISOString(),
      status: 'expiring-soon',
      fingerprint: 'SHA256:F0:67:12:89:34:56:78:90:F0:12:34:67:89:01:23:45:F0:12:34:67:89:01:23:45:F0:12:34:67:89:01:23',
      privateKeyPresent: true,
    },
  ];
}

// ── Guest Accounts ────────────────────────────────────────────────────────────

export function getGuests(): object[] {
  const now = Date.now();
  return [
    { id: 'guest-001', name: 'Marcus Thompson',   email: 'mthompson@vendor.com',   company: 'Accenture', status: 'active',  createdAt: new Date(now - 86400000 * 1).toISOString(), expiresAt: new Date(now + 86400000 * 1).toISOString(), ssid: 'Meridian-Guest', vlan: 100, macAddress: '00:1A:2B:3C:01:01', site: 'Meridian HQ — Atlanta Campus', accessCode: 'MRDG-7X4K' },
    { id: 'guest-002', name: 'Priya Nair',         email: 'p.nair@deloitte.com',     company: 'Deloitte',  status: 'active',  createdAt: new Date(now - 86400000 * 2).toISOString(), expiresAt: new Date(now + 86400000 * 2).toISOString(), ssid: 'Meridian-Guest', vlan: 100, macAddress: '00:1A:2B:3C:02:02', site: 'Meridian HQ — Atlanta Campus', accessCode: 'MRDG-9N2P' },
    { id: 'guest-003', name: 'David Kim',          email: 'dkim@zebra.com',          company: 'Zebra Technologies', status: 'active', createdAt: new Date(now - 3600000 * 6).toISOString(), expiresAt: new Date(now + 3600000 * 18).toISOString(), ssid: 'Meridian-Guest', vlan: 100, macAddress: '00:1A:2B:3C:03:03', site: 'Northeast Distribution Center', accessCode: 'MRDG-3Q8R' },
    { id: 'guest-004', name: 'Sarah Okonkwo',      email: 'sokonkwo@cisco.com',      company: 'Cisco',     status: 'active',  createdAt: new Date(now - 3600000 * 3).toISOString(), expiresAt: new Date(now + 3600000 * 21).toISOString(), ssid: 'Meridian-Guest', vlan: 100, macAddress: '00:1A:2B:3C:04:04', site: 'Meridian HQ — Atlanta Campus', accessCode: 'MRDG-5M1T' },
    { id: 'guest-005', name: 'Carlos Reyes',       email: 'creyes@paloalto.com',     company: 'Palo Alto Networks', status: 'expired', createdAt: new Date(now - 86400000 * 3).toISOString(), expiresAt: new Date(now - 86400000 * 1).toISOString(), ssid: 'Meridian-Guest', vlan: 100, macAddress: '00:1A:2B:3C:05:05', site: 'Meridian HQ — Atlanta Campus', accessCode: 'MRDG-2W6U' },
    { id: 'guest-006', name: 'Jennifer Walsh',     email: 'jwalsh@kpmg.com',         company: 'KPMG',      status: 'active',  createdAt: new Date(now - 86400000 * 0.5).toISOString(), expiresAt: new Date(now + 86400000 * 3).toISOString(), ssid: 'Meridian-Guest', vlan: 100, macAddress: '00:1A:2B:3C:06:06', site: 'Meridian HQ — Atlanta Campus', accessCode: 'MRDG-8B3V' },
    { id: 'guest-007', name: 'Ahmed Al-Hassan',    email: 'ahassan@extreme.com',     company: 'Extreme Networks', status: 'active', createdAt: new Date(now - 3600000 * 1).toISOString(), expiresAt: new Date(now + 3600000 * 23).toISOString(), ssid: 'Meridian-Guest', vlan: 100, macAddress: '00:1A:2B:3C:07:07', site: 'Meridian HQ — Atlanta Campus', accessCode: 'MRDG-4J9W' },
    { id: 'guest-008', name: 'Lisa Nakamura',      email: 'l.nakamura@fujitsu.com',  company: 'Fujitsu',   status: 'active',  createdAt: new Date(now - 86400000 * 1.5).toISOString(), expiresAt: new Date(now + 3600000 * 12).toISOString(), ssid: 'Meridian-Guest', vlan: 100, macAddress: '00:1A:2B:3C:08:08', site: 'West Coast Distribution Center', accessCode: 'MRDG-6C5X' },
    { id: 'guest-009', name: 'Robert Martinez',    email: 'rmartinez@pwc.com',       company: 'PwC',       status: 'expired', createdAt: new Date(now - 86400000 * 5).toISOString(), expiresAt: new Date(now - 86400000 * 2).toISOString(), ssid: 'Meridian-Guest', vlan: 100, macAddress: '00:1A:2B:3C:09:09', site: 'Atlanta Flagship — Lenox Square', accessCode: 'MRDG-1L7Y' },
    { id: 'guest-010', name: 'Sophie Bergmann',    email: 's.bergmann@sap.com',      company: 'SAP',       status: 'active',  createdAt: new Date(now - 86400000 * 0.25).toISOString(), expiresAt: new Date(now + 86400000 * 2).toISOString(), ssid: 'Meridian-Guest', vlan: 100, macAddress: '00:1A:2B:3C:0A:0A', site: 'Meridian HQ — Atlanta Campus', accessCode: 'MRDG-0D8Z' },
    { id: 'guest-011', name: 'Kevin Park',         email: 'kpark@oracle.com',        company: 'Oracle',    status: 'active',  createdAt: new Date(now - 3600000 * 4).toISOString(), expiresAt: new Date(now + 3600000 * 20).toISOString(), ssid: 'Meridian-Guest', vlan: 100, macAddress: '00:1A:2B:3C:0B:0B', site: 'Meridian HQ — Atlanta Campus', accessCode: 'MRDG-7E4A' },
    { id: 'guest-012', name: 'Maria Gonzalez',     email: 'm.gonzalez@ibm.com',      company: 'IBM',       status: 'active',  createdAt: new Date(now - 86400000 * 1).toISOString(), expiresAt: new Date(now + 86400000 * 1).toISOString(), ssid: 'Meridian-Guest', vlan: 100, macAddress: '00:1A:2B:3C:0C:0C', site: 'Meridian HQ — Atlanta Campus', accessCode: 'MRDG-3F2B' },
  ];
}

// ── Firmware Images ───────────────────────────────────────────────────────────

export function getFirmwareImages(): object {
  return {
    'AP460C': ['AP460C-10.6.3.0-012R.img', 'AP460C-10.6.2.0-056R.img', 'AP460C-10.6.1.0-042R.img'],
    'AP410C': ['AP410C-10.6.3.0-012R.img', 'AP410C-10.6.2.0-056R.img', 'AP410C-10.6.1.0-042R.img'],
    'AP410i': ['AP410i-10.6.3.0-012R.img', 'AP410i-10.6.2.0-056R.img', 'AP410i-10.6.1.0-042R.img'],
    'AP305C': ['AP305C-10.6.3.0-012R.img', 'AP305C-10.6.2.0-056R.img', 'AP305C-10.6.1.0-042R.img'],
    'AP305CX': ['AP305CX-10.6.3.0-012R.img', 'AP305CX-10.6.2.0-056R.img'],
    'AP302i': ['AP302i-10.6.3.0-012R.img', 'AP302i-10.6.2.0-056R.img'],
    'AP460i': ['AP460i-10.6.3.0-012R.img', 'AP460i-10.6.2.0-056R.img'],
  };
}

// ── License Info & Usage ──────────────────────────────────────────────────────

export function getLicenseInfo(): object {
  return {
    licenses: [
      {
        type: 'ExtremeCloud IQ - Pilot',
        status: 'active',
        serialNumber: 'PILOT-MRD-20230115-ENT',
        expirationDate: '2027-01-14T23:59:59Z',
        capacity: 500,
        usedCapacity: 353,
        features: ['Advanced RF Management', 'AI/ML Insights', 'Network Policy', 'API Access', 'Reporting'],
      },
      {
        type: 'ExtremeCloud IQ - Navigator',
        status: 'active',
        serialNumber: 'NAV-MRD-20230115-ENT',
        expirationDate: '2027-01-14T23:59:59Z',
        capacity: 500,
        usedCapacity: 353,
        features: ['Service Level Experience', 'Benchmark Analytics', 'Advanced Insights'],
      },
      {
        type: 'Extreme Networks SpectraLink Integration',
        status: 'active',
        serialNumber: 'SPEC-MRD-ADN-001',
        expirationDate: '2026-07-31T23:59:59Z',
        capacity: 100,
        usedCapacity: 44,
        features: ['Location Analytics', 'Presence Detection', 'Dwell Time Analytics'],
      },
    ],
    totalLicenses: 3,
    activeLicenses: 3,
    expiringLicenses: 1,
    warrantyStatus: 'covered',
    supportContract: 'ExtremeWorks Premier 24x7',
    supportExpiry: '2027-01-14T23:59:59Z',
  };
}

export function getLicenseUsage(): object {
  const totalAPs = getAllAPs().length;
  return {
    totalDevices: totalAPs,
    licensedDevices: totalAPs,
    unlicensedDevices: 0,
    utilizationPercentage: Math.round((totalAPs / 500) * 100),
    deviceBreakdown: {
      accessPoints: totalAPs,
      switches: 0,
      routers: 0,
    },
    pilotUsed: totalAPs,
    pilotTotal: 500,
    navigatorUsed: totalAPs,
    navigatorTotal: 500,
  };
}

// ── Config Backups ────────────────────────────────────────────────────────────

export function getConfigBackups(): object[] {
  const now = Date.now();
  return [
    { id: 'bkp-001', name: 'Pre-firmware-upgrade-10.6.3', type: 'manual', status: 'completed', createdAt: new Date(now - 86400000 * 2).toISOString(), size: 2847291, sizeFormatted: '2.72 MB', createdBy: 'jmorales', description: 'Backup before rolling out 10.6.3 firmware to all APs' },
    { id: 'bkp-002', name: 'Scheduled Daily Backup',       type: 'scheduled', status: 'completed', createdAt: new Date(now - 3600000 * 6).toISOString(), size: 2851034, sizeFormatted: '2.72 MB', createdBy: 'system', description: 'Automated daily configuration backup' },
    { id: 'bkp-003', name: 'Pre-holiday-config-push',      type: 'manual', status: 'completed', createdAt: new Date(now - 86400000 * 7).toISOString(), size: 2764891, sizeFormatted: '2.64 MB', createdBy: 'tstanley', description: 'Backup before holiday season RF config adjustments' },
    { id: 'bkp-004', name: 'Scheduled Daily Backup',       type: 'scheduled', status: 'completed', createdAt: new Date(now - 3600000 * 30).toISOString(), size: 2849203, sizeFormatted: '2.72 MB', createdBy: 'system', description: 'Automated daily configuration backup' },
    { id: 'bkp-005', name: 'Scheduled Daily Backup',       type: 'scheduled', status: 'completed', createdAt: new Date(now - 3600000 * 54).toISOString(), size: 2844711, sizeFormatted: '2.71 MB', createdBy: 'system', description: 'Automated daily configuration backup' },
    { id: 'bkp-006', name: 'Post-rogue-AP-containment',    type: 'manual', status: 'completed', createdAt: new Date(now - 86400000 * 5).toISOString(), size: 2842019, sizeFormatted: '2.71 MB', createdBy: 'jmorales', description: 'Backup after security policy update for rogue AP containment' },
    { id: 'bkp-007', name: 'Q1-2026-quarterly-snapshot',   type: 'manual', status: 'completed', createdAt: new Date(now - 86400000 * 10).toISOString(), size: 2798341, sizeFormatted: '2.67 MB', createdBy: 'jmorales', description: 'Q1 2026 quarterly configuration snapshot for compliance' },
  ];
}

// ── Services / WLANs ──────────────────────────────────────────────────────────

export function getServices(): object[] {
  return [
    {
      id: 'svc-guest',
      name: 'Meridian-Guest',
      type: 'wlan',
      ssid: 'Meridian-Guest',
      enabled: true,
      broadcast: true,
      vlan: '100',
      vlanId: 100,
      security: 'WPA2-Personal',
      encryption: 'AES',
      band: 'dual',
      clientCount: 0,
      maxClients: 128,
      rateLimit: { downstream: 25, upstream: 10 },
      clientIsolation: true,
      pmf: 'optional',
      fastRoaming: false,
      hidden: false,
      createdAt: '2024-01-10T12:00:00Z',
      updatedAt: '2025-11-01T08:30:00Z',
      tags: ['retail', 'guest'],
    },
    {
      id: 'svc-staff',
      name: 'Meridian-Staff',
      type: 'wlan',
      ssid: 'Meridian-Staff',
      enabled: true,
      broadcast: false,
      vlan: '20',
      vlanId: 20,
      security: 'WPA3-Enterprise',
      encryption: 'AES-256',
      band: 'dual',
      clientCount: 0,
      maxClients: 64,
      rateLimit: null,
      clientIsolation: false,
      pmf: 'required',
      fastRoaming: true,
      hidden: true,
      createdAt: '2024-01-10T12:00:00Z',
      updatedAt: '2025-09-20T09:00:00Z',
      tags: ['retail', 'staff'],
    },
    {
      id: 'svc-pos',
      name: 'Meridian-POS',
      type: 'wlan',
      ssid: 'Meridian-POS',
      enabled: true,
      broadcast: false,
      vlan: '10',
      vlanId: 10,
      security: 'WPA3-Enterprise',
      encryption: 'AES-256',
      band: '5GHz',
      clientCount: 0,
      maxClients: 32,
      rateLimit: { downstream: 50, upstream: 25 },
      clientIsolation: false,
      pmf: 'required',
      fastRoaming: true,
      hidden: true,
      createdAt: '2024-01-10T12:00:00Z',
      updatedAt: '2026-02-14T10:00:00Z',
      tags: ['retail', 'pos', 'critical'],
    },
    {
      id: 'svc-iot',
      name: 'Meridian-IoT',
      type: 'wlan',
      ssid: 'Meridian-IoT',
      enabled: true,
      broadcast: false,
      vlan: '200',
      vlanId: 200,
      security: 'WPA2-Enterprise',
      encryption: 'AES',
      band: '2.4GHz',
      clientCount: 0,
      maxClients: 128,
      rateLimit: null,
      clientIsolation: true,
      pmf: 'optional',
      fastRoaming: false,
      hidden: true,
      createdAt: '2024-01-10T12:00:00Z',
      updatedAt: '2025-07-15T14:30:00Z',
      tags: ['retail', 'iot', 'scanners', 'cameras'],
    },
    {
      id: 'svc-corporate',
      name: 'Meridian-Corporate',
      type: 'wlan',
      ssid: 'Meridian-Corporate',
      enabled: true,
      broadcast: false,
      vlan: '30',
      vlanId: 30,
      security: 'WPA3-Enterprise',
      encryption: 'AES-256',
      band: 'dual',
      clientCount: 0,
      maxClients: 96,
      rateLimit: null,
      clientIsolation: false,
      pmf: 'required',
      fastRoaming: true,
      hidden: true,
      createdAt: '2024-01-10T12:00:00Z',
      updatedAt: '2025-12-05T11:00:00Z',
      tags: ['corporate', 'hq', 'dc'],
    },
  ];
}

// ── Profiles ──────────────────────────────────────────────────────────────────

export function getProfiles(): object[] {
  return [
    {
      id: 'prof-retail',
      name: 'Retail-Profile',
      description: 'Standard configuration profile for retail store APs',
      deviceType: 'AP',
      createdAt: '2024-01-10T12:00:00Z',
      updatedAt: '2026-01-08T16:00:00Z',
      apCount: 0,
      services: ['svc-guest', 'svc-staff', 'svc-pos', 'svc-iot'],
      rfPolicy: 'Retail-Standard-RRM',
      version: 5,
      isDefault: false,
      tags: ['retail'],
    },
    {
      id: 'prof-flagship',
      name: 'Retail-Flagship-Profile',
      description: 'High-density profile for flagship store locations with AP460C deployments',
      deviceType: 'AP',
      createdAt: '2024-02-15T10:00:00Z',
      updatedAt: '2026-02-20T09:30:00Z',
      apCount: 0,
      services: ['svc-guest', 'svc-staff', 'svc-pos', 'svc-iot'],
      rfPolicy: 'Retail-HighDensity-RRM',
      version: 3,
      isDefault: false,
      tags: ['retail', 'flagship', 'high-density'],
    },
    {
      id: 'prof-corporate',
      name: 'Corporate-Profile',
      description: 'Enterprise profile for HQ campus with voice/video priority and fast roaming',
      deviceType: 'AP',
      createdAt: '2024-01-10T12:00:00Z',
      updatedAt: '2025-11-30T14:00:00Z',
      apCount: 0,
      services: ['svc-corporate', 'svc-guest', 'svc-iot'],
      rfPolicy: 'Corporate-RRM',
      version: 4,
      isDefault: true,
      tags: ['corporate', 'enterprise'],
    },
    {
      id: 'prof-logistics',
      name: 'Logistics-Profile',
      description: 'Industrial-grade profile for distribution centers and warehouses',
      deviceType: 'AP',
      createdAt: '2024-03-01T10:00:00Z',
      updatedAt: '2025-09-15T08:00:00Z',
      apCount: 0,
      services: ['svc-staff', 'svc-iot'],
      rfPolicy: 'Retail-Industrial-RRM',
      version: 2,
      isDefault: false,
      tags: ['logistics', 'dc', 'warehouse', 'industrial'],
    },
    {
      id: 'prof-outlet',
      name: 'Retail-Outlet-Profile',
      description: 'Budget-conscious profile for outlet stores with reduced feature set',
      deviceType: 'AP',
      createdAt: '2024-04-01T10:00:00Z',
      updatedAt: '2025-08-10T11:00:00Z',
      apCount: 0,
      services: ['svc-guest', 'svc-staff', 'svc-pos'],
      rfPolicy: 'Retail-Standard-RRM',
      version: 2,
      isDefault: false,
      tags: ['retail', 'outlet'],
    },
  ];
}

// ── Roles ─────────────────────────────────────────────────────────────────────

export function getRoles(): object[] {
  return [
    { id: 'role-corp-employee', name: 'Corp-Employee', description: 'Full corporate network access with internet', vlan: 30, qosPolicy: 'employee-qos', enabled: true, clientCount: 0 },
    { id: 'role-retail-staff', name: 'Retail-Staff', description: 'Store employee access — POS and staff networks', vlan: 20, qosPolicy: 'staff-qos', enabled: true, clientCount: 0 },
    { id: 'role-guest', name: 'Guest', description: 'Internet-only guest access with rate limiting', vlan: 100, qosPolicy: 'guest-qos', enabled: true, clientCount: 0 },
    { id: 'role-pos', name: 'POS-Terminal', description: 'Point-of-sale terminal — PCI DSS compliant VLAN', vlan: 10, qosPolicy: 'pos-qos', enabled: true, clientCount: 0 },
    { id: 'role-iot', name: 'IoT-Device', description: 'Scanner, camera, printer — isolated VLAN 200', vlan: 200, qosPolicy: 'iot-qos', enabled: true, clientCount: 0 },
    { id: 'role-logistics', name: 'Logistics-Device', description: 'Forklift terminals, handheld scanners in DC/Warehouse', vlan: 20, qosPolicy: 'staff-qos', enabled: true, clientCount: 0 },
  ];
}

// ── Audit Logs ────────────────────────────────────────────────────────────────

export function getAuditLogs(): object[] {
  const now = Date.now();
  const entries = [
    { action: 'UPDATE_AP_CONFIG',     resource: 'ap', detail: 'Updated TX power on NE-NYCFLAGSHIP-AP-3F-04 to 20 dBm', userId: 'jmorales', severity: 'info' },
    { action: 'PUSH_TEMPLATE',        resource: 'template', detail: 'Applied "Retail RF Policy" v5 to Northeast Region (74 APs)', userId: 'tstanley', severity: 'info' },
    { action: 'DELETE_GUEST',         resource: 'guest', detail: 'Deleted expired guest account: creyes@paloalto.com', userId: 'system', severity: 'info' },
    { action: 'FIRMWARE_UPGRADE',     resource: 'firmware', detail: 'Initiated firmware upgrade to 10.6.3.0-012R on 24 APs at NYC Flagship', userId: 'jmorales', severity: 'info' },
    { action: 'CREATE_ADMIN',         resource: 'admin', detail: 'Created administrator account: bwilliams (READ_ONLY)', userId: 'jmorales', severity: 'info' },
    { action: 'ROGUE_CONTAINED',      resource: 'security', detail: 'Rogue AP contained: SSID "FREE-WIFI" (00:1A:2B:3C:4D:5E) near Northeast DC', userId: 'tstanley', severity: 'warning' },
    { action: 'BACKUP_CREATED',       resource: 'backup', detail: 'Manual config backup created: Pre-firmware-upgrade-10.6.3 (2.72 MB)', userId: 'jmorales', severity: 'info' },
    { action: 'WLAN_MODIFIED',        resource: 'service', detail: 'Updated Meridian-Guest passphrase and bandwidth limits', userId: 'lchen', severity: 'warning' },
    { action: 'AP_ADOPTED',           resource: 'ap', detail: 'New AP adopted: NE-NYCFLAGSHIP-AP-2F-09 (AP460C, s/n MRD-NENYCFLAG-025)', userId: 'system', severity: 'info' },
    { action: 'RADIUS_CERT_RENEWED',  resource: 'certificate', detail: 'Certificate "RADIUS Server Certificate" renewed — new expiry 2027-06-30', userId: 'jmorales', severity: 'info' },
    { action: 'POLICY_UPDATE',        resource: 'policy', detail: 'Updated POS network rate limit: 50 Mbps downstream (was 40 Mbps)', userId: 'tstanley', severity: 'info' },
    { action: 'CONFIG_RESTORED',      resource: 'backup', detail: 'Restored configuration from: Q1-2026-quarterly-snapshot', userId: 'jmorales', severity: 'warning' },
    { action: 'ALARM_CLEARED',        resource: 'alarm', detail: 'AP SE-ATLFLAGSHIP-AP-1F-03 back online after PoE switch port reset', userId: 'system', severity: 'info' },
    { action: 'GUEST_CREATED',        resource: 'guest', detail: 'Guest account created: a.garcia.vendor@sap.com — 48h access', userId: 'mkumar', severity: 'info' },
    { action: 'AP_DEAUTH',            resource: 'station', detail: 'Deauthenticated POS-TERM-07 from Meridian-POS (suspected rogue device)', userId: 'tstanley', severity: 'warning' },
    { action: 'FIRMWARE_UPGRADE',     resource: 'firmware', detail: 'Completed firmware upgrade 10.6.3.0-012R on 22/24 APs (2 offline)', userId: 'system', severity: 'info' },
    { action: 'CHANNEL_CHANGE',       resource: 'ap', detail: 'RRM triggered channel change on WC-SFLAGSHIP-AP-2F-11 (149→157)', userId: 'system', severity: 'info' },
    { action: 'VLAN_CHANGE',          resource: 'service', detail: 'VLAN ID for Meridian-IoT changed from 200 to 201 (reverted after 1h)', userId: 'rpatil', severity: 'warning' },
    { action: 'ADMIN_LOGIN',          resource: 'admin', detail: 'Administrator jmorales logged in from 198.51.100.42', userId: 'jmorales', severity: 'info' },
    { action: 'ADMIN_LOGOUT',         resource: 'admin', detail: 'Administrator tstanley session ended after 4h 22m', userId: 'tstanley', severity: 'info' },
    { action: 'LICENSE_INSTALL',      resource: 'license', detail: 'License installed: Extreme Networks SpectraLink Integration (100 APs)', userId: 'jmorales', severity: 'info' },
    { action: 'ADOPTION_RULE',        resource: 'adoption', detail: 'Updated adoption rule "SE-Region-Auto-Adopt" — added Tampa Outlet site', userId: 'lchen', severity: 'info' },
    { action: 'PROFILE_UPDATE',       resource: 'profile', detail: 'Updated Logistics-Profile: DTIM period 1→3 for IoT device battery life', userId: 'rpatil', severity: 'info' },
    { action: 'WIDS_ALERT',           resource: 'security', detail: 'WIDS: Deauth flood detected near WC-SANDIEGO-AP-1F-06 — mitigation applied', userId: 'system', severity: 'critical' },
    { action: 'SYSTEM_REBOOT',        resource: 'system', detail: 'Controller planned reboot for maintenance window (02:00 UTC)', userId: 'system', severity: 'warning' },
    { action: 'CREATE_GUEST',         resource: 'guest', detail: 'Guest account created: m.thompson@accenture.com — 24h access, HQ site', userId: 'mkumar', severity: 'info' },
    { action: 'AP_FIRMWARE_SCHEDULE', resource: 'firmware', detail: 'Scheduled firmware upgrade for SE Region: 2026-04-12 02:00 local', userId: 'tstanley', severity: 'info' },
    { action: 'DELETE_ADMIN',         resource: 'admin', detail: 'Removed administrator account: former.employee (READ_ONLY)', userId: 'jmorales', severity: 'warning' },
    { action: 'QOS_POLICY_UPDATE',    resource: 'policy', detail: 'Updated guest-qos: downstream cap 20→25 Mbps, enabled DSCP marking', userId: 'tstanley', severity: 'info' },
    { action: 'TEMPLATE_SYNC',        resource: 'template', detail: 'Synced Global Elements templates to 22 sites — 0 conflicts', userId: 'system', severity: 'info' },
  ];

  return entries.map((e, i) => ({
    id: `audit-${String(i + 1).padStart(4, '0')}`,
    ...e,
    timestamp: new Date(now - i * 3600000 * 1.5).toISOString(),
    ipAddress: '198.51.100.' + (40 + (i % 20)),
    success: e.severity !== 'critical' || i > 3,
    category: e.resource,
  })).reverse();
}

// ── QoS Statistics ────────────────────────────────────────────────────────────

export function getQoSStatistics(): object {
  const sgId = 'sg-northeast';
  const aps = getAPsForSiteGroup(sgId);
  const totalClients = aps.reduce((a: number, ap: { clientCount: number }) => a + ap.clientCount, 0);
  return {
    totalClients,
    voiceClients: Math.round(totalClients * 0.05),
    videoClients: Math.round(totalClients * 0.12),
    bestEffortClients: Math.round(totalClients * 0.67),
    backgroundClients: Math.round(totalClients * 0.16),
    voiceBandwidth: '2.4 Mbps',
    videoBandwidth: '18.7 Mbps',
    bestEffortBandwidth: '312.1 Mbps',
    backgroundBandwidth: '28.4 Mbps',
    totalBandwidth: '361.6 Mbps',
    policyApplied: 'Retail-QoS-Policy',
    dscpMappings: [
      { dscp: 46, description: 'Expedited Forwarding — VoIP', trafficClass: 'voice' },
      { dscp: 34, description: 'AF41 — Interactive Video', trafficClass: 'video' },
      { dscp: 0,  description: 'Best Effort', trafficClass: 'best-effort' },
      { dscp: 10, description: 'AF11 — Background', trafficClass: 'background' },
    ],
  };
}

// ── Applications (AppsManager) ────────────────────────────────────────────────

export function getInstalledApplications(): object[] {
  return [
    { id: 'app-airdefense', name: 'AirDefense', version: '10.6.3.1', status: 'running', description: 'Wireless intrusion prevention and rogue AP containment', vendor: 'Extreme Networks', installedAt: '2024-03-01T10:00:00Z', port: 8443, memoryUsageMB: 512, cpuPercent: 3.2, containerName: 'airdefense-svc' },
    { id: 'app-analytics', name: 'ExtremeAnalytics', version: '22.4.2', status: 'running', description: 'Application visibility and deep packet inspection analytics', vendor: 'Extreme Networks', installedAt: '2024-03-01T10:00:00Z', port: 8444, memoryUsageMB: 1024, cpuPercent: 8.7, containerName: 'extreme-analytics' },
    { id: 'app-location', name: 'ExtremeLocation', version: '5.1.0', status: 'running', description: 'Real-time RTLS and presence analytics', vendor: 'Extreme Networks', installedAt: '2024-06-15T10:00:00Z', port: 8445, memoryUsageMB: 768, cpuPercent: 4.1, containerName: 'extreme-location' },
    { id: 'app-eguest', name: 'ExtremeGuest', version: '9.1.4', status: 'running', description: 'Captive portal, guest self-registration and social login', vendor: 'Extreme Networks', installedAt: '2024-01-10T12:00:00Z', port: 8080, memoryUsageMB: 384, cpuPercent: 1.8, containerName: 'extreme-guest' },
    { id: 'app-report', name: 'ExtremeReports', version: '6.2.1', status: 'stopped', description: 'Scheduled compliance and executive reporting engine', vendor: 'Extreme Networks', installedAt: '2024-09-01T10:00:00Z', port: null, memoryUsageMB: 0, cpuPercent: 0, containerName: 'extreme-reports' },
  ];
}

export function getApplicationStorage(): object {
  return {
    total: 500 * 1024 * 1024 * 1024,
    used: 87.3 * 1024 * 1024 * 1024,
    free: 412.7 * 1024 * 1024 * 1024,
    usagePercent: 17.5,
    breakdown: [
      { name: 'AirDefense', sizeBytes: 18.2 * 1024 * 1024 * 1024 },
      { name: 'ExtremeAnalytics', sizeBytes: 42.1 * 1024 * 1024 * 1024 },
      { name: 'ExtremeLocation', sizeBytes: 14.8 * 1024 * 1024 * 1024 },
      { name: 'ExtremeGuest', sizeBytes: 7.3 * 1024 * 1024 * 1024 },
      { name: 'System', sizeBytes: 4.9 * 1024 * 1024 * 1024 },
    ],
  };
}

// ── Network Analytics ─────────────────────────────────────────────────────────

export function getInterferenceAnalytics(): object[] {
  const sgId = 'sg-northeast';
  const aps = getAPsForSiteGroup(sgId).slice(0, 15);
  const rnd = makePRNG('interference');
  return aps.map((ap: { serialNumber: string; displayName: string; site: string }) => ({
    apSerial: ap.serialNumber,
    apName: ap.displayName,
    site: ap.site,
    band: '5GHz',
    interferenceLevel: rndInt(rnd, 5, 42),
    noiseFloor: rndInt(rnd, -95, -82),
    channelUtilization: rndInt(rnd, 12, 74),
    coChannelInterference: rndInt(rnd, 2, 28),
    adjacentChannelInterference: rndInt(rnd, 1, 15),
  }));
}

export function getCoverageAnalytics(): object[] {
  const sgId = 'sg-northeast';
  const sites = DEMO_SITES.filter(s => s.site_group_id === sgId);
  return sites.map(site => {
    const rnd = makePRNG(`coverage-${site.id}`);
    return {
      siteId: site.id,
      siteName: site.name,
      coverageScore: rndInt(rnd, 78, 98),
      deadZones: rndInt(rnd, 0, 3),
      avgRSSI: rndInt(rnd, -68, -52),
      clientsAboveMinus67: rndInt(rnd, 80, 99),
      apCount: site.apCount,
    };
  });
}

export function getRoamingAnalytics(): object[] {
  const sgId = 'sg-northeast';
  const sites = DEMO_SITES.filter(s => s.site_group_id === sgId);
  return sites.map(site => {
    const rnd = makePRNG(`roaming-${site.id}`);
    return {
      siteId: site.id,
      siteName: site.name,
      totalRoamingEvents: rndInt(rnd, 120, 2400),
      fastBSSTransition: rndInt(rnd, 65, 94),
      opportunisticKeyCache: rndInt(rnd, 72, 96),
      avgRoamTime: rndInt(rnd, 40, 180),
      successRate: rndInt(rnd, 88, 99),
    };
  });
}

// ── Adoption Rules ────────────────────────────────────────────────────────────

export function getAdoptionRules(): object[] {
  return [
    {
      id: 'rule-ne-auto',
      name: 'NE-Region-Auto-Adopt',
      description: 'Auto-adopt APs in the 10.10.x.x subnet to the Northeast Region site group',
      status: 'active',
      priority: 1,
      conditions: [
        { field: 'ipAddress', operator: 'startsWith', value: '10.10.' },
        { field: 'model', operator: 'in', value: 'AP460C,AP410C,AP305C,AP305CX' },
      ],
      actions: [
        { type: 'assignSiteGroup', value: 'sg-northeast' },
        { type: 'assignProfile',   value: 'Retail-Profile' },
      ],
      apCount: 74,
      createdAt: '2023-02-01T10:00:00Z',
      updatedAt: '2025-10-15T09:00:00Z',
      createdBy: 'jmorales',
    },
    {
      id: 'rule-se-auto',
      name: 'SE-Region-Auto-Adopt',
      description: 'Auto-adopt APs in the 10.20.x.x subnet to the Southeast Region site group',
      status: 'active',
      priority: 2,
      conditions: [
        { field: 'ipAddress', operator: 'startsWith', value: '10.20.' },
      ],
      actions: [
        { type: 'assignSiteGroup', value: 'sg-southeast' },
        { type: 'assignProfile',   value: 'Retail-Profile' },
      ],
      apCount: 88,
      createdAt: '2023-02-01T10:00:00Z',
      updatedAt: '2026-01-20T11:00:00Z',
      createdBy: 'jmorales',
    },
    {
      id: 'rule-wc-auto',
      name: 'WC-Region-Auto-Adopt',
      description: 'Auto-adopt APs in the 10.30.x.x subnet to the West Coast Region site group',
      status: 'active',
      priority: 3,
      conditions: [
        { field: 'ipAddress', operator: 'startsWith', value: '10.30.' },
      ],
      actions: [
        { type: 'assignSiteGroup', value: 'sg-west' },
        { type: 'assignProfile',   value: 'Retail-Profile' },
      ],
      apCount: 99,
      createdAt: '2023-02-01T10:00:00Z',
      updatedAt: '2026-01-20T11:00:00Z',
      createdBy: 'jmorales',
    },
    {
      id: 'rule-corp-hq',
      name: 'Corporate-HQ-Adopt',
      description: 'Auto-adopt HQ campus APs with AP460C/AP410C to the corporate site group',
      status: 'active',
      priority: 4,
      conditions: [
        { field: 'ipAddress', operator: 'startsWith', value: '10.40.1.' },
        { field: 'model', operator: 'in', value: 'AP460C,AP410C' },
      ],
      actions: [
        { type: 'assignSiteGroup', value: 'sg-corporate' },
        { type: 'assignProfile',   value: 'Corporate-Profile' },
      ],
      apCount: 48,
      createdAt: '2023-01-15T09:00:00Z',
      updatedAt: '2025-09-01T10:00:00Z',
      createdBy: 'jmorales',
    },
    {
      id: 'rule-dc-logistics',
      name: 'DC-Logistics-Adopt',
      description: 'Auto-adopt distribution center and warehouse APs to logistics profile',
      status: 'active',
      priority: 5,
      conditions: [
        { field: 'ipAddress', operator: 'startsWith', value: '10.40.' },
        { field: 'model', operator: 'in', value: 'AP410i,AP460i' },
      ],
      actions: [
        { type: 'assignSiteGroup', value: 'sg-corporate' },
        { type: 'assignProfile',   value: 'Logistics-Profile' },
      ],
      apCount: 164,
      createdAt: '2023-01-15T09:00:00Z',
      updatedAt: '2025-07-20T08:00:00Z',
      createdBy: 'rpatil',
    },
    {
      id: 'rule-default',
      name: 'Default-Catch-All',
      description: 'Catch-all rule: unmatched APs are placed in quarantine for manual review',
      status: 'active',
      priority: 99,
      conditions: [],
      actions: [
        { type: 'assignSiteGroup', value: 'sg-northeast' },
        { type: 'quarantine',      value: 'true' },
      ],
      apCount: 0,
      createdAt: '2023-01-15T09:00:00Z',
      updatedAt: '2023-01-15T09:00:00Z',
      createdBy: 'jmorales',
    },
  ];
}

// ── Flash / Platform Storage ──────────────────────────────────────────────────

export function getFlashFiles(): object[] {
  return [
    { name: 'AP460C-10.6.3.0-012R.img', size: 48291840, sizeFormatted: '46.1 MB', type: 'firmware', uploadedAt: '2026-03-15T08:00:00Z' },
    { name: 'AP410C-10.6.3.0-012R.img', size: 44040192, sizeFormatted: '42.0 MB', type: 'firmware', uploadedAt: '2026-03-15T08:00:00Z' },
    { name: 'AP305C-10.6.3.0-012R.img', size: 38797312, sizeFormatted: '37.0 MB', type: 'firmware', uploadedAt: '2026-03-15T08:00:00Z' },
    { name: 'AP460C-10.6.2.0-056R.img', size: 47710208, sizeFormatted: '45.5 MB', type: 'firmware', uploadedAt: '2025-11-20T08:00:00Z' },
    { name: 'backup-pre-firmware-10.6.3.tar.gz', size: 2847291, sizeFormatted: '2.72 MB', type: 'backup', uploadedAt: '2026-04-08T10:00:00Z' },
    { name: 'captive-portal-branding.zip', size: 3145728, sizeFormatted: '3.0 MB', type: 'config', uploadedAt: '2025-12-01T14:30:00Z' },
  ];
}

export function getFlashUsage(): object {
  return {
    totalBytes: 2 * 1024 * 1024 * 1024,
    usedBytes: 183 * 1024 * 1024,
    freeBytes: (2 * 1024 * 1024 * 1024) - (183 * 1024 * 1024),
    usagePercent: 8.9,
  };
}
