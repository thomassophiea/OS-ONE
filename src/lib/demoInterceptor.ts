/**
 * Demo Mode — Fetch Interceptor
 *
 * Wraps window.fetch to intercept all controller API calls and return mock
 * data from the currently selected vertical demo profile. Non-management
 * calls pass through untouched.
 *
 * Installed at app boot when VITE_DEMO_MODE=true. Safe to call multiple times
 * (idempotent — stores original fetch reference so it can be uninstalled).
 *
 * The active vertical is read from localStorage key `demo_active_vertical`
 * (defaults to 'Retail'). Switching verticals takes effect on the next fetch.
 *
 * TODO: Remove this file when connecting to a real controller.
 */

import { getVerticalProfile } from '@/data/demoVerticals/index';
import type { VerticalKey } from '@/data/demoVerticalTypes';
import {
  getAPsForSiteGroup,
  getAllAPs,
  getStationsForAP,
  getAllStationsForSiteGroup,
  getSLEForSiteGroup,
  getSLEForSite,
  getSLETimeseries,
  getEvents,
  getAlarms,
  getSecurityData,
} from '@/data/demoVerticalGen';

// ── Utilities ─────────────────────────────────────────────────────────────────

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function emptyResponse(): Response {
  return jsonResponse({ data: [], total: 0, results: [] });
}

/** Read the currently selected site group ID from localStorage. */
function getCurrentSiteGroupId(): string {
  try {
    const raw = localStorage.getItem('api_current_controller');
    if (raw) {
      const ctrl = JSON.parse(raw) as { id?: string };
      return ctrl.id ?? 'sg-northeast';
    }
  } catch { /* ignore */ }
  return 'sg-northeast';
}

/** Read the currently active vertical profile from localStorage. */
function getCurrentVertical() {
  const key = localStorage.getItem('demo_active_vertical') ?? 'Retail';
  return getVerticalProfile(key as VerticalKey);
}

// ── Route Handlers ────────────────────────────────────────────────────────────

function handleAuth(): Response {
  return jsonResponse({
    access_token: 'demo-access-token-meridian',
    token_type: 'Bearer',
    expires_in: 86400,
    idle_timeout: 3600,
    refresh_token: 'demo-refresh-token-meridian',
    adminRole: 'READ_WRITE_GUEST_MGMT',
  });
}

function handleSites(): Response {
  const v = getCurrentVertical();
  const sgId = getCurrentSiteGroupId();
  const sites = v.sites
    .filter(s => s.site_group_id === sgId)
    .map(s => ({
      id: s.id,
      name: s.name,
      site_group_id: s.site_group_id,
      org_id: s.org_id,
      location: s.location,
      status: s.status,
      ap_count: s.apCount,
      created_at: s.created_at,
    }));
  return jsonResponse(sites);
}

function handleAPQuery(): Response {
  const v = getCurrentVertical();
  const sgId = getCurrentSiteGroupId();
  return jsonResponse(getAPsForSiteGroup(sgId, v));
}

function handleAllStations(): Response {
  const v = getCurrentVertical();
  const sgId = getCurrentSiteGroupId();
  return jsonResponse(getAllStationsForSiteGroup(sgId, v));
}

function handleStationsForAP(url: string): Response {
  // URL pattern: /v1/aps/{serialNumber}/stations
  const match = url.match(/\/aps\/([^/]+)\/stations/);
  if (!match) return jsonResponse([]);
  const serial = match[1];
  const v = getCurrentVertical();
  const sgId = getCurrentSiteGroupId();
  const ap = getAPsForSiteGroup(sgId, v).find(a => a.serialNumber === serial);
  if (!ap) return jsonResponse([]);
  return jsonResponse(getStationsForAP(ap, v, v.sites));
}

function handleSLEOrg(): Response {
  const v = getCurrentVertical();
  const sgId = getCurrentSiteGroupId();
  return jsonResponse(getSLEForSiteGroup(sgId, v));
}

function handleSLESite(url: string): Response {
  const match = url.match(/\/sle\/sites?\/([^/?]+)/);
  const siteId = match ? match[1] : '';
  const v = getCurrentVertical();
  const sle = getSLEForSite(siteId, v);
  return jsonResponse({
    siteId,
    scores: sle,
    overall: sle['overall'] ?? 90,
    classifiers: sle,
  });
}

function handleSLETimeseries(): Response {
  return jsonResponse({ data: getSLETimeseries() });
}

function handleEvents(): Response {
  const v = getCurrentVertical();
  return jsonResponse(getEvents(getCurrentSiteGroupId(), v));
}

function handleAlarms(): Response {
  const v = getCurrentVertical();
  return jsonResponse(getAlarms(getCurrentSiteGroupId(), v));
}

function handleSecurity(): Response {
  const v = getCurrentVertical();
  return jsonResponse(getSecurityData(v));
}

function handleAPDetails(url: string): Response {
  const match = url.match(/\/aps\/([^/?]+)(?:$|\?|\/(?!stations))/);
  if (!match) return emptyResponse();
  const serial = match[1];
  const v = getCurrentVertical();
  const ap = getAllAPs(v).find(a => a.serialNumber === serial);
  return ap ? jsonResponse(ap) : jsonResponse(null, 404);
}

// ── New Route Handlers (10) ───────────────────────────────────────────────────

function handleServices(): Response {
  const v = getCurrentVertical();
  return jsonResponse(v.services);
}

function handleServiceDetail(url: string): Response {
  const v = getCurrentVertical();
  const id = url.split('/services/')[1]?.split('?')[0];
  const service = v.services.find(s => s.id === id) ?? v.services[0];
  return jsonResponse(service);
}

function handleProfiles(): Response {
  const v = getCurrentVertical();
  return jsonResponse(v.profiles);
}

function handleTopologies(): Response {
  const v = getCurrentVertical();
  return jsonResponse(v.topologies);
}

function handleAAAPolicy(): Response {
  const v = getCurrentVertical();
  return jsonResponse(v.aaaPolicies);
}

function handleGlobalSettings(): Response {
  return jsonResponse({
    id: 'global',
    timezone: 'America/New_York',
    country: 'US',
    ntp_server: 'pool.ntp.org',
    syslog_server: '',
    management_vlan: 1,
    dns_servers: ['8.8.8.8', '8.8.4.4'],
    max_clients: 1024,
    rf_optimization: 'auto',
    mesh_enabled: false,
    client_load_balancing: true,
    band_steering: true,
    fast_roaming: true,
    pmf_mode: 'optional',
    created_at: '2023-01-15T09:00:00Z',
    updated_at: new Date().toISOString(),
  });
}

function handleSiteReport(url: string): Response {
  const v = getCurrentVertical();
  const siteId = url.match(/\/report\/sites\/([^/?]+)/)?.[1] ?? '';
  const site = v.sites.find(s => s.id === siteId);
  const sle = getSLEForSite(siteId, v);
  const ap_count = site?.apCount ?? 0;
  const siteProfile = site ? v.siteTypeProfiles[site.type] : null;
  const clientCount = siteProfile ? ap_count * siteProfile.clientBase : 0;
  return jsonResponse({
    site_id: siteId,
    site_name: site?.name ?? siteId,
    ap_count,
    client_count: clientCount,
    throughput_mbps: Math.round(80 + Math.random() * 120),
    utilization_pct: Math.round(35 + Math.random() * 30),
    sle_scores: sle,
    period: '24h',
    generated_at: new Date().toISOString(),
  });
}

function handleAPReport(url: string): Response {
  const v = getCurrentVertical();
  const sgId = getCurrentSiteGroupId();
  const serial = url.match(/\/report\/aps\/([^/?]+)/)?.[1] ?? '';
  const ap = getAPsForSiteGroup(sgId, v).find(a => a.serialNumber === serial);
  return jsonResponse({
    serial_number: serial,
    display_name: ap?.displayName ?? serial,
    client_count: ap?.clientCount ?? 0,
    throughput_mbps: Math.round(20 + Math.random() * 60),
    utilization_2g_pct: Math.round(15 + Math.random() * 30),
    utilization_5g_pct: Math.round(25 + Math.random() * 45),
    utilization_6g_pct: Math.round(10 + Math.random() * 20),
    cpu_usage: Math.round(15 + Math.random() * 40),
    memory_usage: Math.round(40 + Math.random() * 30),
    tx_power_2g: ap?.txPower ?? 17,
    tx_power_5g: ap?.txPower ?? 20,
    uptime_seconds: ap?.uptime ?? 86400,
    channel_2g: ap?.channel2g ?? 1,
    channel_5g: ap?.channel5g ?? 36,
    firmware: ap?.firmware ?? '10.6.2.0-056R',
    period: '24h',
    generated_at: new Date().toISOString(),
  });
}

function handleStationReport(url: string): Response {
  const mac = url.match(/\/report\/stations\/([^/?]+)/)?.[1] ?? '';
  return jsonResponse({
    mac_address: mac,
    rx_bytes: Math.round(1024 * 1024 * (10 + Math.random() * 500)),
    tx_bytes: Math.round(1024 * 1024 * (5 + Math.random() * 200)),
    rx_packets: Math.round(10000 + Math.random() * 100000),
    tx_packets: Math.round(8000 + Math.random() * 80000),
    rx_rate: Math.round(50 + Math.random() * 400),
    tx_rate: Math.round(20 + Math.random() * 200),
    rssi: Math.round(-70 + Math.random() * 25),
    snr: Math.round(20 + Math.random() * 20),
    latency_ms: Math.round(2 + Math.random() * 15),
    packet_loss_pct: parseFloat((Math.random() * 0.5).toFixed(2)),
    roam_count: Math.round(Math.random() * 8),
    period: '24h',
    generated_at: new Date().toISOString(),
  });
}

function handleStationDetail(url: string): Response {
  const v = getCurrentVertical();
  const sgId = getCurrentSiteGroupId();
  const mac = url.match(/\/stations\/([^/?]+)/)?.[1] ?? '';
  // Try to find the station in existing data
  const allStations = getAllStationsForSiteGroup(sgId, v) as Record<string, unknown>[];
  const station = allStations.find(s => s['macAddress'] === mac);
  return jsonResponse(station ?? { macAddress: mac, status: 'Associated' });
}

// ── Route Table ───────────────────────────────────────────────────────────────

type Handler = (url: string, init?: RequestInit) => Response;

interface Route {
  method: string | null; // null = any method
  pattern: RegExp;
  handler: Handler;
}

const ROUTES: Route[] = [
  // Auth — covers Campus Controller OAuth2 token + legacy patterns
  { method: 'POST',  pattern: /\/oauth2\/token|\/oauth2\/refreshToken|\/authentication\/token|\/auth\/token|\/login/,  handler: handleAuth },
  // HEAD connection test
  { method: 'HEAD',  pattern: /\/aps/,                                                 handler: () => new Response(null, { status: 200 }) },
  // Sites
  { method: null,    pattern: /\/(v3|v2|v1|)\/sites/,                                 handler: handleSites },
  // Stations for specific AP (before generic APs query)
  { method: null,    pattern: /\/aps\/[^/]+\/stations/,                               handler: handleStationsForAP },
  // Single station detail (before /stations list — more specific)
  { method: null,    pattern: /\/stations\/[^/?]+/,                                   handler: handleStationDetail },
  // All stations / clients
  { method: null,    pattern: /\/stations(?:$|\?|\/)/,                                handler: handleAllStations },
  // AP query / list
  { method: null,    pattern: /\/aps\/query|\/aps(?:$|\?)/,                           handler: handleAPQuery },
  // Single AP details
  { method: null,    pattern: /\/aps\/[^/]+(?:$|\?|\/(?!stations))/,                 handler: handleAPDetails },
  // SLE timeseries
  { method: null,    pattern: /\/sle\/.*timeseries|\/sle\/.*history/,                 handler: handleSLETimeseries },
  // SLE per site
  { method: null,    pattern: /\/sle\/sites?\/[^/]+/,                                 handler: handleSLESite },
  // SLE org / global
  { method: null,    pattern: /\/sle/,                                                handler: handleSLEOrg },
  // Events
  { method: null,    pattern: /\/events|\/muEvent|\/log/,                             handler: handleEvents },
  // Alarms
  { method: null,    pattern: /\/alarms|\/alarm/,                                     handler: handleAlarms },
  // Security / rogue APs
  { method: null,    pattern: /\/security|\/rogue|\/threat/,                          handler: handleSecurity },
  // Services — detail before list
  { method: null,    pattern: /\/services\/[^/?]+/,                                   handler: handleServiceDetail },
  { method: null,    pattern: /\/services\b/,                                         handler: handleServices },
  // Profiles
  { method: null,    pattern: /\/profiles\b/,                                         handler: handleProfiles },
  // Topologies
  { method: null,    pattern: /\/topologies\b/,                                       handler: handleTopologies },
  // AAA Policies
  { method: null,    pattern: /\/aaapolicy\b/,                                        handler: handleAAAPolicy },
  // Global settings
  { method: null,    pattern: /\/globalsettings\b/,                                   handler: handleGlobalSettings },
  // Reports — site, AP, station
  { method: null,    pattern: /\/report\/sites\/[^/?]+/,                              handler: handleSiteReport },
  { method: null,    pattern: /\/report\/aps\/[^/?]+/,                                handler: handleAPReport },
  { method: null,    pattern: /\/report\/stations\/[^/?]+/,                           handler: handleStationReport },
];

// ── Interceptor Install / Uninstall ───────────────────────────────────────────

const ORIGINAL_FETCH_KEY = '__demo_original_fetch__';

export function installDemoInterceptor(): void {
  if ((window as any)[ORIGINAL_FETCH_KEY]) return; // already installed
  (window as any)[ORIGINAL_FETCH_KEY] = window.fetch;

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : (input as Request).url;
    const method = (init?.method ?? (input instanceof Request ? input.method : 'GET')).toUpperCase();

    // Only intercept management API calls
    if (!url.includes('/management/') && !url.includes('/api/management')) {
      return (window as any)[ORIGINAL_FETCH_KEY](input, init);
    }

    // Strip query string for route matching
    const urlPath = url.split('?')[0];

    for (const route of ROUTES) {
      if (route.method && route.method !== method) continue;
      if (route.pattern.test(urlPath)) {
        try {
          return route.handler(urlPath, init);
        } catch (e) {
          console.warn('[Demo] Handler error for', urlPath, e);
          return emptyResponse();
        }
      }
    }

    // No route matched — return safe empty response
    return emptyResponse();
  };

  console.log('[Demo] Fetch interceptor installed — vertical-aware demo active');
}

export function uninstallDemoInterceptor(): void {
  const orig = (window as any)[ORIGINAL_FETCH_KEY];
  if (orig) {
    window.fetch = orig;
    delete (window as any)[ORIGINAL_FETCH_KEY];
    console.log('[Demo] Fetch interceptor removed');
  }
}
