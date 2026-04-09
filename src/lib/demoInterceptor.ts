/**
 * Demo Mode — Fetch Interceptor
 *
 * Wraps window.fetch to intercept all controller API calls and return mock
 * Meridian Retail Group data. Non-management calls pass through untouched.
 *
 * Installed at app boot when VITE_DEMO_MODE=true. Safe to call multiple times
 * (idempotent — stores original fetch reference so it can be uninstalled).
 *
 * TODO: Remove this file when connecting to a real controller.
 */

import {
  DEMO_SITES,
  getAPsForSiteGroup,
  getAllAPs,
  getStationsForAP,
  getAllStationsForSiteGroup,
  getSLEForSiteGroup,
  getSLEForSite,
  getEvents,
  getAlarms,
  getSecurityData,
} from '@/data/meridianDemoData';

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

/** Extract a path segment after a known prefix from a URL string. */
function pathAfter(url: string, prefix: RegExp): string {
  const match = url.match(prefix);
  return match ? url.slice(match.index! + match[0].length) : '';
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
  const sgId = getCurrentSiteGroupId();
  const sites = DEMO_SITES
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
  const sgId = getCurrentSiteGroupId();
  const aps = getAPsForSiteGroup(sgId);
  return jsonResponse(aps);
}

function handleAllStations(): Response {
  const sgId = getCurrentSiteGroupId();
  const stations = getAllStationsForSiteGroup(sgId);
  return jsonResponse(stations);
}

function handleStationsForAP(url: string): Response {
  // URL pattern: /v1/aps/{serialNumber}/stations
  const match = url.match(/\/aps\/([^/]+)\/stations/);
  if (!match) return jsonResponse([]);
  const serial = match[1];
  const allAPs = getAllAPs();
  const ap = allAPs.find(a => a.serialNumber === serial);
  if (!ap) return jsonResponse([]);
  return jsonResponse(getStationsForAP(ap));
}

function handleSLEOrg(): Response {
  const sgId = getCurrentSiteGroupId();
  return jsonResponse(getSLEForSiteGroup(sgId));
}

function handleSLESite(url: string): Response {
  const match = url.match(/\/sle\/sites?\/([^/?]+)/);
  const siteId = match ? match[1] : '';
  const sle = getSLEForSite(siteId);
  return jsonResponse({
    siteId,
    scores: sle,
    overall: sle['overall'] ?? 90,
    classifiers: sle,
  });
}

function handleSLETimeseries(): Response {
  // Return a 24-hour trend array for SLE charts
  const now = Date.now();
  const points = Array.from({ length: 24 }, (_, i) => ({
    timestamp: now - (23 - i) * 3600000,
    value: 85 + Math.round(Math.random() * 10),
  }));
  return jsonResponse({ data: points });
}

function handleEvents(): Response {
  return jsonResponse(getEvents(getCurrentSiteGroupId()));
}

function handleAlarms(): Response {
  return jsonResponse(getAlarms(getCurrentSiteGroupId()));
}

function handleSecurity(): Response {
  return jsonResponse(getSecurityData(getCurrentSiteGroupId()));
}

function handleAPDetails(url: string): Response {
  const match = url.match(/\/aps\/([^/?]+)(?:$|\?|\/(?!stations))/);
  if (!match) return emptyResponse();
  const serial = match[1];
  const ap = getAllAPs().find(a => a.serialNumber === serial);
  return ap ? jsonResponse(ap) : jsonResponse(null, 404);
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
  { method: 'HEAD',  pattern: /\/aps/,                                           handler: () => new Response(null, { status: 200 }) },
  // Sites
  { method: null,    pattern: /\/(v3|v2|v1|)\/sites/,                           handler: handleSites },
  // Stations for specific AP (before generic APs query)
  { method: null,    pattern: /\/aps\/[^/]+\/stations/,                          handler: handleStationsForAP },
  // All stations / clients
  { method: null,    pattern: /\/stations(?:$|\?|\/)/,                           handler: handleAllStations },
  // AP query / list
  { method: null,    pattern: /\/aps\/query|\/aps(?:$|\?)/,                      handler: handleAPQuery },
  // Single AP details
  { method: null,    pattern: /\/aps\/[^/]+(?:$|\?|\/(?!stations))/,            handler: handleAPDetails },
  // SLE timeseries
  { method: null,    pattern: /\/sle\/.*timeseries|\/sle\/.*history/,            handler: handleSLETimeseries },
  // SLE per site
  { method: null,    pattern: /\/sle\/sites?\/[^/]+/,                            handler: handleSLESite },
  // SLE org / global
  { method: null,    pattern: /\/sle/,                                           handler: handleSLEOrg },
  // Events
  { method: null,    pattern: /\/events|\/muEvent|\/log/,                        handler: handleEvents },
  // Alarms
  { method: null,    pattern: /\/alarms|\/alarm/,                               handler: handleAlarms },
  // Security / rogue APs
  { method: null,    pattern: /\/security|\/rogue|\/threat/,                    handler: handleSecurity },
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

  console.log('[Demo] Fetch interceptor installed — Meridian Retail Group demo active');
}

export function uninstallDemoInterceptor(): void {
  const orig = (window as any)[ORIGINAL_FETCH_KEY];
  if (orig) {
    window.fetch = orig;
    delete (window as any)[ORIGINAL_FETCH_KEY];
    console.log('[Demo] Fetch interceptor removed');
  }
}
