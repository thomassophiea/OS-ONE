/**
 * Generic Demo Data Generators — PRNG-based, vertical-agnostic
 *
 * All generators accept a `VerticalDemoProfile` and produce deterministic
 * mock data seeded from string keys. Results are cached per (vertical, siteGroupId)
 * so re-renders are cheap.
 */

import type { VerticalDemoProfile, DemoSiteConfig } from './demoVerticalTypes';

// ── PRNG Utilities ────────────────────────────────────────────────────────────

export function makePRNG(seedStr: string): () => number {
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

export function rndInt(rnd: () => number, min: number, max: number): number {
  return Math.floor(rnd() * (max - min + 1)) + min;
}

export function pick<T>(rnd: () => number, arr: T[]): T {
  return arr[Math.floor(rnd() * arr.length)];
}

export function mac(rnd: () => number): string {
  const hex = () => rndInt(rnd, 0, 255).toString(16).padStart(2, '0');
  return `02:${hex()}:${hex()}:${hex()}:${hex()}:${hex()}`;
}

export function ip(prefix: string, last: number): string {
  return `${prefix}.${last}`;
}

// ── MockAP Interface ──────────────────────────────────────────────────────────

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

// ── Channel / Firmware Pools ──────────────────────────────────────────────────

const CHANNELS_2G = [1, 6, 11];
const CHANNELS_5G = [36, 40, 44, 48, 52, 56, 60, 64, 100, 104, 108, 112, 116, 149, 153, 157, 161];
const CHANNELS_6G = [1, 5, 9, 13, 17, 21, 25, 29, 33, 37, 41, 45, 49, 53, 57, 61, 65, 69, 73, 77, 81, 85, 89, 93];
const FIRMWARE_VERSIONS = ['10.6.2.0-056R', '10.6.1.0-042R', '10.6.3.0-012R', '10.5.4.0-098R'];
const DATA_RATES = ['54 Mbps', '144 Mbps', '300 Mbps', '450 Mbps', '600 Mbps', '867 Mbps', '1200 Mbps', '2400 Mbps'];
const SLE_CLASSIFIERS = ['throughput', 'capacity', 'coverage', 'roaming', 'dhcp', 'dns', 'auth', 'time_to_connect'];

// ── AP Cache ──────────────────────────────────────────────────────────────────

const _apCache = new Map<string, MockAP[]>(); // key: `${profile.key}:${siteGroupId}`

// ── AP Generation ─────────────────────────────────────────────────────────────

/**
 * Generate all APs for a single site using profile config.
 */
export function generateAPsForSite(site: DemoSiteConfig, profile: VerticalDemoProfile): MockAP[] {
  const rnd = makePRNG(`ap-${profile.key}-${site.id}`);
  const aps: MockAP[] = [];
  const siteAbbr = site.id.toUpperCase().replace(/-/g, '').slice(0, 8);

  // Resolve profile pools for this site type, falling back to first available entry
  const apModelPoolKeys = Object.keys(profile.apModelPools);
  const apModelPool =
    profile.apModelPools[site.type] ??
    profile.apModelPools[apModelPoolKeys[0]] ??
    ['AP305C'];

  const rfPolicyNameKeys = Object.keys(profile.rfPolicyNames);
  const rfMgmtPolicyName =
    profile.rfPolicyNames[site.type] ??
    profile.rfPolicyNames[rfPolicyNameKeys[0]] ??
    'Standard-RRM';

  const profileNameKeys = Object.keys(profile.profileNames);
  const profileName =
    profile.profileNames[site.type] ??
    profile.profileNames[profileNameKeys[0]] ??
    'Standard-Profile';

  const siteTypeProfileKeys = Object.keys(profile.siteTypeProfiles);
  const siteTypeProfile =
    profile.siteTypeProfiles[site.type] ??
    profile.siteTypeProfiles[siteTypeProfileKeys[0]];

  const clientBase = siteTypeProfile?.clientBase ?? 18;
  const clientVariance = siteTypeProfile?.clientVariance ?? 10;
  const floors = siteTypeProfile?.floors ?? 2;

  for (let i = 0; i < site.apCount; i++) {
    const model = pick(rnd, apModelPool);
    const isDown = rnd() < 0.04; // 4% chance down
    const clientCount = isDown
      ? 0
      : rndInt(rnd, Math.max(1, clientBase - clientVariance), clientBase + clientVariance);
    const floor = rndInt(rnd, 1, floors);

    aps.push({
      serialNumber: `${profile.hostnamePrefix}-${siteAbbr}-${String(i + 1).padStart(3, '0')}`,
      displayName: `${site.id.replace(/-/g, '_').toUpperCase()}-AP-${floor}F-${String((i % 12) + 1).padStart(2, '0')}`,
      hostname: `ap-${site.id}-${String(i + 1).padStart(3, '0')}.${profile.internalDomain}`,
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
      channel2g: pick(rnd, CHANNELS_2G),
      channel5g: pick(rnd, CHANNELS_5G),
      channel6g: pick(rnd, CHANNELS_6G),
      txPower: rndInt(rnd, 15, 23),
      uptime: rndInt(rnd, 3600 * 24, 3600 * 24 * 120),
      rfMgmtPolicyName,
      profileName,
      environment: 'Production',
      source: 'controller',
    });
  }

  return aps;
}

/**
 * Get APs for a site group, with per-(vertical, siteGroup) cache.
 */
export function getAPsForSiteGroup(siteGroupId: string, profile: VerticalDemoProfile): MockAP[] {
  const cacheKey = `${profile.key}:${siteGroupId}`;
  if (_apCache.has(cacheKey)) return _apCache.get(cacheKey)!;

  const sites = profile.sites.filter(s => s.site_group_id === siteGroupId);
  const aps = sites.flatMap(site => generateAPsForSite(site, profile));
  _apCache.set(cacheKey, aps);
  return aps;
}

/**
 * Get all APs across every site group in the profile.
 */
export function getAllAPs(profile: VerticalDemoProfile): MockAP[] {
  return profile.siteGroups.flatMap(sg => getAPsForSiteGroup(sg.id, profile));
}

// ── Client (Station) Generation ───────────────────────────────────────────────

/**
 * Get clients for a single AP using the profile's hostname/ssid/vlan/device maps.
 */
export function getStationsForAP(
  ap: MockAP,
  profile: VerticalDemoProfile,
  sites: DemoSiteConfig[],
): object[] {
  if (ap.status !== 'connected' || ap.clientCount === 0) return [];

  const site = sites.find(s => s.name === ap.hostSite);
  const siteType = site?.type ?? Object.keys(profile.hostnamePools)[0] ?? 'default';

  // Resolve hostname pool for this site type
  const hostnamePoolKeys = Object.keys(profile.hostnamePools);
  const pool =
    profile.hostnamePools[siteType] ??
    profile.hostnamePools[hostnamePoolKeys[0]] ??
    ['device-{n}'];

  // Derive the base ssid name from the profile key (for ssidMap lookup)
  const profileBaseName = profile.key;

  const rnd = makePRNG(`sta-${profile.key}-${ap.serialNumber}`);
  const stations: object[] = [];

  for (let i = 0; i < ap.clientCount; i++) {
    const templateName = pick(rnd, pool);
    // Strip trailing -{n} or _{n} suffix to get the device class key
    const baseName = templateName.replace(/[-_]\{n\}$/, '');
    const hostName = templateName.includes('{n}')
      ? templateName.replace('{n}', String(rndInt(rnd, 1, 99)).padStart(2, '0'))
      : templateName;

    // SSID lookup: baseName → ssidMap[baseName] → ssidMap[profileKey] → ssidMap['default']
    const ssid =
      profile.ssidMap[baseName] ??
      profile.ssidMap[profileBaseName] ??
      profile.ssidMap['default'] ??
      'Corp-WiFi';

    const vlan = profile.vlanMap[ssid] ?? 100;

    // Band distribution: 55% 5GHz, 15% 6GHz, 30% 2.4GHz
    const bandRoll = rnd();
    const band = bandRoll < 0.55 ? '5GHz' : bandRoll < 0.70 ? '6GHz' : '2.4GHz';

    const rssi = rndInt(rnd, -74, -42);
    const snr = rssi + rndInt(rnd, 20, 35);

    const authMethod =
      profile.authMap[ssid] ?? 'WPA2-Personal';
    const encryption =
      authMethod === 'WPA3-Enterprise' || authMethod === 'WPA2-Enterprise'
        ? 'AES-256'
        : 'AES';

    const manufacturer = profile.manufacturerMap[baseName] ?? 'Unknown';
    const deviceType = profile.deviceTypeMap[baseName] ?? 'Network Device';

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
      snr,
      band,
      radioType: band,
      manufacturer,
      deviceType,
      apName: ap.displayName,
      apSerial: ap.serialNumber,
      apSn: ap.serialNumber,
      siteName: ap.hostSite,
      associationTime: new Date(Date.now() - rndInt(rnd, 60000, 28800000)).toISOString(),
      lastSeen: new Date().toISOString(),
      dataRate: pick(rnd, DATA_RATES),
      txBytes: rndInt(rnd, 1024 * 100, 1024 * 1024 * 500),
      rxBytes: rndInt(rnd, 1024 * 50, 1024 * 1024 * 200),
      authMethod,
      encryption,
    });
  }

  return stations;
}

/**
 * Get all clients for a site group (flattens across all APs).
 */
export function getAllStationsForSiteGroup(
  siteGroupId: string,
  profile: VerticalDemoProfile,
): object[] {
  const sites = profile.sites.filter(s => s.site_group_id === siteGroupId);
  return getAPsForSiteGroup(siteGroupId, profile).flatMap(ap =>
    getStationsForAP(ap, profile, sites),
  );
}

// ── SLE Metrics ───────────────────────────────────────────────────────────────

/**
 * Get SLE scores for a single site using the profile's siteTypeProfiles sleBand.
 */
export function getSLEForSite(siteId: string, profile: VerticalDemoProfile): Record<string, number> {
  const site = profile.sites.find(s => s.id === siteId);
  if (!site) return {};

  const siteTypeProfileKeys = Object.keys(profile.siteTypeProfiles);
  const siteTypeProfile =
    profile.siteTypeProfiles[site.type] ??
    profile.siteTypeProfiles[siteTypeProfileKeys[0]];

  if (!siteTypeProfile) return {};

  const { base, variance } = siteTypeProfile.sleBand;
  const rnd = makePRNG(`sle-${profile.key}-${siteId}`);
  const result: Record<string, number> = {};

  for (const cls of SLE_CLASSIFIERS) {
    result[cls] = Math.min(100, Math.max(60, Math.round(base + (rnd() - 0.5) * variance * 2)));
  }
  result['overall'] = Math.round(
    Object.values(result).reduce((a, b) => a + b, 0) / SLE_CLASSIFIERS.length,
  );

  return result;
}

/**
 * Get averaged SLE scores across all sites in a site group.
 */
export function getSLEForSiteGroup(siteGroupId: string, profile: VerticalDemoProfile): object {
  const sites = profile.sites.filter(s => s.site_group_id === siteGroupId);
  const scores = sites.map(s => getSLEForSite(s.id, profile));
  const avg = (key: string) =>
    Math.round(scores.reduce((a, s) => a + (s[key] ?? 0), 0) / (scores.length || 1));

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

/**
 * Generate a generic 24-hour SLE timeseries (hour-by-hour buckets).
 * Not vertical-specific — suitable for any vertical's trend charts.
 */
export function getSLETimeseries(hours = 24): object[] {
  const rnd = makePRNG('sle-timeseries-global');
  const now = Date.now();
  const series: object[] = [];

  for (let h = hours; h >= 0; h--) {
    const ts = now - h * 3600000;
    const base = 88 + (rnd() - 0.5) * 10;
    series.push({
      ts,
      timestamp: new Date(ts).toISOString(),
      hour: new Date(ts).getHours(),
      overall: Math.min(100, Math.max(60, Math.round(base))),
      throughput: Math.min(100, Math.max(60, Math.round(base + (rnd() - 0.5) * 8))),
      capacity: Math.min(100, Math.max(60, Math.round(base + (rnd() - 0.5) * 8))),
      coverage: Math.min(100, Math.max(60, Math.round(base + (rnd() - 0.5) * 6))),
      roaming: Math.min(100, Math.max(60, Math.round(base + (rnd() - 0.5) * 10))),
      dhcp: Math.min(100, Math.max(60, Math.round(base + (rnd() - 0.5) * 5))),
      dns: Math.min(100, Math.max(60, Math.round(base + (rnd() - 0.5) * 5))),
      auth: Math.min(100, Math.max(60, Math.round(base + (rnd() - 0.5) * 7))),
      time_to_connect: Math.min(100, Math.max(60, Math.round(base + (rnd() - 0.5) * 9))),
    });
  }

  return series;
}

// ── Events ────────────────────────────────────────────────────────────────────

/**
 * Generate 60 events for a site group using the profile's eventTemplates.
 * Category is derived from the template level and context.
 */
export function getEvents(
  siteGroupId: string | undefined,
  profile: VerticalDemoProfile,
): object[] {
  const rnd = makePRNG(`events-${profile.key}-${siteGroupId ?? 'all'}`);
  const sites = siteGroupId
    ? profile.sites.filter(s => s.site_group_id === siteGroupId)
    : profile.sites;
  const aps = siteGroupId ? getAPsForSiteGroup(siteGroupId, profile) : getAllAPs(profile);

  const events: object[] = [];
  const now = Date.now();

  for (let i = 0; i < 60; i++) {
    const tmpl = pick(rnd, profile.eventTemplates);
    const site = pick(rnd, sites.length > 0 ? sites : profile.sites);
    const ap = pick(rnd, aps.length > 0 ? aps : [{ displayName: 'AP-001', serialNumber: 'SN-001' }] as MockAP[]);
    const ap2 = pick(rnd, aps.length > 0 ? aps : [{ displayName: 'AP-002', serialNumber: 'SN-002' }] as MockAP[]);
    const ts = now - rndInt(rnd, 0, 3600000 * 72);

    const message = tmpl.message
      .replace('{ap}', ap.displayName)
      .replace('{ap2}', ap2.displayName)
      .replace('{site}', site.name)
      .replace('{ch1}', String(pick(rnd, CHANNELS_5G)))
      .replace('{ch2}', String(pick(rnd, CHANNELS_5G)))
      .replace('{rssi}', String(rndInt(rnd, 55, 72)))
      .replace('{n}', String(rndInt(rnd, 1, 30)).padStart(2, '0'));

    const category =
      tmpl.level === 'CRITICAL'
        ? 'Security'
        : tmpl.context === 'FirmwareUpgrade'
          ? 'Maintenance'
          : 'Operations';

    events.push({
      id: `evt-${profile.key}-${siteGroupId ?? 'all'}-${i}`,
      ts,
      timestamp: new Date(ts).toISOString(),
      log: message,
      ApSerial: ap.serialNumber,
      ApName: ap.displayName,
      Id: 1000 + i,
      Context: tmpl.context,
      Category: category,
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

  return events.sort((a, b) => (b as Record<string, unknown>).ts as number - ((a as Record<string, unknown>).ts as number));
}

// ── Alarms ────────────────────────────────────────────────────────────────────

/**
 * Build alarms from down APs (capped at 8), plus a rogue AP alarm.
 */
export function getAlarms(
  siteGroupId: string | undefined,
  profile: VerticalDemoProfile,
): object[] {
  const rnd = makePRNG(`alarms-${profile.key}-${siteGroupId ?? 'all'}`);
  const aps = siteGroupId ? getAPsForSiteGroup(siteGroupId, profile) : getAllAPs(profile);
  const sites = siteGroupId
    ? profile.sites.filter(s => s.site_group_id === siteGroupId)
    : profile.sites;

  const downAPs = aps.filter(a => !a.online);

  const alarms: object[] = downAPs.slice(0, 8).map((ap, i) => ({
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

  // Add a rogue AP alarm if there is any site to attach it to
  const riskySite = sites[0];
  if (riskySite) {
    alarms.push({
      log: `Rogue AP detected near ${riskySite.name} — SSID: "FREE-WIFI" (Uncontained)`,
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

// ── Security Data ─────────────────────────────────────────────────────────────

/**
 * Return 4 static rogue AP entries. These are intentionally generic — rogue
 * detection data does not need to be vertical-specific.
 */
export function getSecurityData(profile: VerticalDemoProfile): object {
  const defaultSiteName = profile.sites[0]?.name ?? 'Primary Site';
  const rogues = [
    {
      id: 'rogue-1',
      ssid: 'FREE-WIFI',
      bssid: '00:1A:2B:3C:4D:5E',
      channel: 6,
      rssi: -68,
      site: defaultSiteName,
      status: 'Uncontained',
      firstSeen: '2026-04-07T14:23:00Z',
    },
    {
      id: 'rogue-2',
      ssid: 'linksys',
      bssid: '00:1A:2B:3C:4D:5F',
      channel: 11,
      rssi: -71,
      site: defaultSiteName,
      status: 'Contained',
      firstSeen: '2026-04-06T09:15:00Z',
    },
    {
      id: 'rogue-3',
      ssid: 'Xfinity',
      bssid: '9C:97:26:AA:BB:CC',
      channel: 1,
      rssi: -74,
      site: profile.sites[1]?.name ?? defaultSiteName,
      status: 'Monitoring',
      firstSeen: '2026-04-05T11:42:00Z',
    },
    {
      id: 'rogue-4',
      ssid: 'ATT-WIFI-FREE',
      bssid: '48:F8:B3:DD:EE:FF',
      channel: 6,
      rssi: -76,
      site: profile.sites[2]?.name ?? defaultSiteName,
      status: 'Contained',
      firstSeen: '2026-04-04T16:55:00Z',
    },
  ];

  return {
    rogueAPs: rogues,
    totalRogues: rogues.length,
    contained: rogues.filter(r => r.status === 'Contained').length,
    uncontained: rogues.filter(r => r.status === 'Uncontained').length,
    monitoring: rogues.filter(r => r.status === 'Monitoring').length,
  };
}
