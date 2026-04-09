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
  const stations = [];

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

  const events = [];
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
