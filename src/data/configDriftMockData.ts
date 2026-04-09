/**
 * Configuration Drift Mock Data
 *
 * Represents the global template baseline and per-site running configurations
 * for five campus network sites. Drift is computed at render time by comparing
 * site configs against the global template.
 *
 * TODO: Replace GLOBAL_TEMPLATE_CONFIG with a GET /api/management/v1/templates/global/rf-wlan
 * TODO: Replace INITIAL_SITE_CONFIGS with a GET /api/management/v1/sites/configs?include=drift_notes
 */

export interface RFConfig {
  tx_power_2g: number; // dBm
  tx_power_5g: number; // dBm
  channel_width_5g: number; // MHz
  channel_width_6g: number; // MHz
  band_steering: boolean;
  rts_threshold: number; // bytes
  dtim_period: number; // beacon intervals
  beacon_interval: number; // ms
}

export interface WLANConfig {
  ssid_primary: string;
  ssid_guest: string;
  vlan_primary: number;
  vlan_guest: number;
  security_type: string;
  client_isolation: boolean;
  broadcast_ssid: boolean;
  max_clients_ap: number;
  wmm_voice: boolean;
  fast_transition: boolean;
}

export interface ClientPolicyConfig {
  client_idle_timeout: number; // seconds
  reauthentication_interval: number; // seconds
  pmf_mode: string; // 'disabled' | 'optional' | 'required'
  band_steering_delta: number; // dBm
}

export interface SiteNetworkConfig {
  rf: RFConfig;
  wlan: WLANConfig;
  client_policy: ClientPolicyConfig;
}

export interface SiteConfig {
  id: string;
  name: string;
  config: SiteNetworkConfig;
  drift_notes: Record<string, string>; // field path → admin reason string
}

export interface DriftedParam {
  path: string; // e.g. 'rf.tx_power_5g'
  label: string; // human-readable
  globalValue: unknown;
  siteValue: unknown;
  reason: string; // admin note
}

export type DriftStatus = 'in_sync' | 'drift_detected' | 'critical';

// ── Field labels ────────────────────────────────────────────────────────────

const FIELD_LABELS: Record<string, string> = {
  'rf.tx_power_2g': 'TX Power 2.4 GHz',
  'rf.tx_power_5g': 'TX Power 5 GHz',
  'rf.channel_width_5g': 'Channel Width 5 GHz',
  'rf.channel_width_6g': 'Channel Width 6 GHz',
  'rf.band_steering': 'Band Steering',
  'rf.rts_threshold': 'RTS Threshold',
  'rf.dtim_period': 'DTIM Period',
  'rf.beacon_interval': 'Beacon Interval',
  'wlan.ssid_primary': 'Primary SSID',
  'wlan.ssid_guest': 'Guest SSID',
  'wlan.vlan_primary': 'Primary VLAN',
  'wlan.vlan_guest': 'Guest VLAN',
  'wlan.security_type': 'Security Type',
  'wlan.client_isolation': 'Client Isolation',
  'wlan.broadcast_ssid': 'Broadcast SSID',
  'wlan.max_clients_ap': 'Max Clients per AP',
  'wlan.wmm_voice': 'WMM Voice Priority',
  'wlan.fast_transition': 'Fast Transition (802.11r)',
  'client_policy.client_idle_timeout': 'Client Idle Timeout',
  'client_policy.reauthentication_interval': 'Reauthentication Interval',
  'client_policy.pmf_mode': 'PMF Mode',
  'client_policy.band_steering_delta': 'Band Steering Delta',
};

// ── Global template (org-level baseline) ────────────────────────────────────

export const GLOBAL_TEMPLATE_CONFIG: SiteNetworkConfig = {
  rf: {
    tx_power_2g: 17,
    tx_power_5g: 20,
    channel_width_5g: 80,
    channel_width_6g: 160,
    band_steering: true,
    rts_threshold: 2347,
    dtim_period: 1,
    beacon_interval: 100,
  },
  wlan: {
    ssid_primary: 'CORP-WIRELESS',
    ssid_guest: 'CORP-GUEST',
    vlan_primary: 10,
    vlan_guest: 100,
    security_type: 'WPA3-Enterprise',
    client_isolation: false,
    broadcast_ssid: true,
    max_clients_ap: 64,
    wmm_voice: true,
    fast_transition: true,
  },
  client_policy: {
    client_idle_timeout: 1800,
    reauthentication_interval: 86400,
    pmf_mode: 'required',
    band_steering_delta: 5,
  },
};

// ── Per-site running configurations ─────────────────────────────────────────

export const INITIAL_SITE_CONFIGS: SiteConfig[] = [
  {
    id: 'east-campus',
    name: 'East Campus',
    config: {
      rf: { ...GLOBAL_TEMPLATE_CONFIG.rf },
      wlan: { ...GLOBAL_TEMPLATE_CONFIG.wlan },
      client_policy: { ...GLOBAL_TEMPLATE_CONFIG.client_policy },
    },
    drift_notes: {},
  },
  {
    id: 'west-campus',
    name: 'West Campus',
    config: {
      rf: {
        ...GLOBAL_TEMPLATE_CONFIG.rf,
        tx_power_5g: 23, // bumped up
      },
      wlan: {
        ...GLOBAL_TEMPLATE_CONFIG.wlan,
        max_clients_ap: 96, // raised for dense lecture halls
      },
      client_policy: {
        ...GLOBAL_TEMPLATE_CONFIG.client_policy,
        client_idle_timeout: 3600, // extended for long-session labs
      },
    },
    drift_notes: {
      'rf.tx_power_5g':
        'Increased TX power to compensate for concrete walls between floors in West Hall. Signal was dropping below -75 dBm near stairwells. — jmorales, 2024-11-14',
      'wlan.max_clients_ap':
        'Raised client cap during semester peak. Two 200-seat lecture halls share the same AP cluster on the 3rd floor and were hitting the 64-client limit during class changes. — jmorales, 2024-12-02',
      'client_policy.client_idle_timeout':
        'Extended idle timeout for computer science labs. Students run overnight compile jobs via SSH and were getting disconnected mid-session. — jmorales, 2025-01-08',
    },
  },
  {
    id: 'stadium',
    name: 'Stadium',
    config: {
      rf: {
        ...GLOBAL_TEMPLATE_CONFIG.rf,
        beacon_interval: 200, // doubled — high density optimization
        channel_width_6g: 80, // reduced to avoid adjacent channel interference
        band_steering: false, // disabled — event-day override
      },
      wlan: {
        ...GLOBAL_TEMPLATE_CONFIG.wlan,
        max_clients_ap: 200, // game-day high-density profile
      },
      client_policy: {
        ...GLOBAL_TEMPLATE_CONFIG.client_policy,
        pmf_mode: 'optional', // legacy device compatibility
      },
    },
    drift_notes: {
      'rf.beacon_interval':
        'Doubled beacon interval during high-density game events (18,000+ concurrent devices). Reduces management frame overhead on the 6 GHz band. Approved by RF team lead. — tstanley, 2025-02-15',
      'rf.channel_width_6g':
        'Reduced 6 GHz channel width from 160 MHz to 80 MHz after adjacent-channel interference was detected from the press box APs. ACS was flapping every 4 minutes. — tstanley, 2025-02-15',
      'rf.band_steering':
        'Disabled band steering on event days — scoreboard app uses legacy 2.4 GHz-only hardware that cannot be steered. Re-enable after season ends. — tstanley, 2025-03-01',
      'wlan.max_clients_ap':
        'Raised to 200 per AP for high-density events. Stadium uses Extreme AP410C with high-gain antennas rated for 256 associations; 200 is within safe operating margin. — tstanley, 2025-02-15',
      'client_policy.pmf_mode':
        'Dropped PMF to optional — stadium operator tablets running Android 9 cannot authenticate with PMF required (WPA3-Enterprise strict). Vendor firmware update is pending. — tstanley, 2025-03-10',
    },
  },
  {
    id: 'north-campus',
    name: 'North Campus',
    config: {
      rf: {
        ...GLOBAL_TEMPLATE_CONFIG.rf,
        dtim_period: 3, // adjusted for power-saving IoT devices
      },
      wlan: { ...GLOBAL_TEMPLATE_CONFIG.wlan },
      client_policy: {
        ...GLOBAL_TEMPLATE_CONFIG.client_policy,
        reauthentication_interval: 43200, // 12-hour re-auth for IoT sensors
      },
    },
    drift_notes: {
      'rf.dtim_period':
        'Increased DTIM period to 3 for the research wing. Battery-powered environmental sensors (Monnit ALTA) use DTIM-gated sleep mode — DTIM 1 was waking them every 100ms and draining batteries in 2 weeks instead of 6 months. — rpatil, 2025-01-22',
      'client_policy.reauthentication_interval':
        'Reduced re-auth interval to 12 hours for IoT network segment. Research IoT devices lose state on re-authentication and require manual reconfiguration. Approved by security team with compensating controls (VLAN isolation, ACLs). — rpatil, 2025-01-22',
    },
  },
  {
    id: 'southbrook-elementary',
    name: 'Southbrook Elementary',
    config: {
      rf: { ...GLOBAL_TEMPLATE_CONFIG.rf },
      wlan: { ...GLOBAL_TEMPLATE_CONFIG.wlan },
      client_policy: { ...GLOBAL_TEMPLATE_CONFIG.client_policy },
    },
    drift_notes: {},
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Computes the list of drifted parameters between the global template and a
 * site's running configuration. Returns only fields that differ.
 *
 * TODO: In production, replace with a diff returned by the API alongside the
 * site config payload.
 */
export function computeDrift(
  global: SiteNetworkConfig,
  site: SiteNetworkConfig,
  notes: Record<string, string>
): DriftedParam[] {
  const drifted: DriftedParam[] = [];

  const namespaces = ['rf', 'wlan', 'client_policy'] as const;
  for (const ns of namespaces) {
    const globalNs = global[ns] as unknown as Record<string, unknown>;
    const siteNs = site[ns] as unknown as Record<string, unknown>;
    for (const key of Object.keys(globalNs)) {
      const path = `${ns}.${key}`;
      if (globalNs[key] !== siteNs[key]) {
        drifted.push({
          path,
          label: FIELD_LABELS[path] ?? path,
          globalValue: globalNs[key],
          siteValue: siteNs[key],
          reason: notes[path] ?? '',
        });
      }
    }
  }

  return drifted;
}

/**
 * Determines the drift status for a site. Stadium gets 'critical' when it has
 * ≥4 drifted parameters; any other site with drift is 'drift_detected'.
 *
 * TODO: Replace criticality logic with a severity field returned by the API.
 */
export function getSiteStatus(drifted: DriftedParam[], siteId: string): DriftStatus {
  if (drifted.length === 0) return 'in_sync';
  if (siteId === 'stadium' && drifted.length >= 4) return 'critical';
  return 'drift_detected';
}
