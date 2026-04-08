/**
 * Vertical Benchmarking Mock Data
 *
 * Each vertical dataset contains the customer's own metrics, peer median values,
 * a rank score, percentile string, peer count, and improvement suggestions.
 *
 * TODO: Replace with real API call to ExtremeCloud IQ benchmarking endpoint
 * when the Peer Intelligence API is available.
 */

export type VerticalKey =
  | 'Enterprise'
  | 'Healthcare'
  | 'Education'
  | 'Retail'
  | 'Hospitality'
  | 'Government'
  | 'Manufacturing'
  | 'Logistics';

export const VERTICALS: VerticalKey[] = [
  'Enterprise',
  'Healthcare',
  'Education',
  'Retail',
  'Hospitality',
  'Government',
  'Manufacturing',
  'Logistics',
];

export interface BenchmarkMetric {
  key: string;
  name: string;
  customerValue: number;
  medianValue: number;
  unit: string;
  /** True = higher value is better (throughput, uptime). False = lower is better (latency, assoc time). */
  higherIsBetter: boolean;
}

export interface Suggestion {
  headline: string;
  context: string;
  action: string;
}

export interface VerticalDataset {
  rankScore: number;
  percentileString: string;
  peerCount: number;
  metrics: BenchmarkMetric[];
  suggestions: Suggestion[];
}

export const BENCHMARK_DATA: Record<VerticalKey, VerticalDataset> = {
  Education: {
    rankScore: 71,
    percentileString: 'Top 29%',
    peerCount: 1247,
    metrics: [
      {
        key: 'throughput',
        name: 'Avg client throughput',
        customerValue: 187.4,
        medianValue: 164.2,
        unit: 'Mbps',
        higherIsBetter: true,
      },
      {
        key: 'uptime',
        name: 'AP uptime',
        customerValue: 99.2,
        medianValue: 99.1,
        unit: '%',
        higherIsBetter: true,
      },
      {
        key: 'roaming',
        name: 'Roaming success rate',
        customerValue: 94.7,
        medianValue: 92.3,
        unit: '%',
        higherIsBetter: true,
      },
      {
        key: 'assocTime',
        name: 'Mean time to associate',
        customerValue: 4.1,
        medianValue: 2.6,
        unit: 's',
        higherIsBetter: false,
      },
      {
        key: 'density',
        name: 'Client density per AP (peak)',
        customerValue: 28.3,
        medianValue: 31.4,
        unit: 'clients',
        higherIsBetter: false,
      },
      {
        key: 'sixGhz',
        name: '5GHz / 6GHz adoption',
        customerValue: 61.3,
        medianValue: 78.4,
        unit: '%',
        higherIsBetter: true,
      },
    ],
    suggestions: [
      {
        headline: 'Association time is dragging behind peers',
        context:
          'Your mean association time of 4.1s is 58% slower than the Education median of 2.6s — a lag that affects every student reconnecting between classes.',
        action:
          'Enable 802.11r Fast Transition on your high-school and lecture-hall tag profiles. Pair with OKC pre-authentication to pre-stage keys on neighboring APs before clients roam.',
      },
      {
        headline: '6GHz adoption is 22% below the Education peer median',
        context:
          'At 61.3%, your 5GHz/6GHz adoption rate significantly trails Education peers at 78.4%, leaving capable clients congested on legacy bands during high-density periods.',
        action:
          'Configure a dedicated 6GHz SSID with a -65 dBm band-steering threshold. Ensure WPA3 is mandatory on the 6GHz radio to prevent fallback to 2.4GHz for capable devices.',
      },
    ],
  },

  Healthcare: {
    rankScore: 62,
    percentileString: 'Top 38%',
    peerCount: 892,
    metrics: [
      {
        key: 'throughput',
        name: 'Avg client throughput',
        customerValue: 143.8,
        medianValue: 158.3,
        unit: 'Mbps',
        higherIsBetter: true,
      },
      {
        key: 'uptime',
        name: 'AP uptime',
        customerValue: 99.87,
        medianValue: 99.71,
        unit: '%',
        higherIsBetter: true,
      },
      {
        key: 'roaming',
        name: 'Roaming success rate',
        customerValue: 97.3,
        medianValue: 95.8,
        unit: '%',
        higherIsBetter: true,
      },
      {
        key: 'assocTime',
        name: 'Mean time to associate',
        customerValue: 1.8,
        medianValue: 2.1,
        unit: 's',
        higherIsBetter: false,
      },
      {
        key: 'density',
        name: 'Client density per AP (peak)',
        customerValue: 47.2,
        medianValue: 28.6,
        unit: 'clients',
        higherIsBetter: false,
      },
      {
        key: 'sixGhz',
        name: '5GHz / 6GHz adoption',
        customerValue: 83.1,
        medianValue: 79.4,
        unit: '%',
        higherIsBetter: true,
      },
    ],
    suggestions: [
      {
        headline: 'Client density is 65% above the Healthcare peer median',
        context:
          'Your peak density of 47.2 clients per AP far exceeds the Healthcare median of 28.6 — a pattern consistent with concentrated nursing station zones where mobile carts and infusion pumps cluster.',
        action:
          'Deploy directional APs above nurse stations and medication rooms with 60° beamwidth antennas, reducing effective coverage overlap. Target <30 clients per AP in those zones without increasing interference floors.',
      },
      {
        headline: 'Throughput is 9% below peers despite strong uptime',
        context:
          "Your average throughput of 143.8 Mbps trails the Healthcare median of 158.3 Mbps — the density problem above is the likely cause, not hardware. Clients are competing for airtime, not association slots.",
        action:
          "Enable BSS Coloring on all 6GHz radios and enforce a minimum RSSI threshold of -72 dBm to shed low-signal clients to the correct AP. Don't increase Tx power — that widens the collision domain further.",
      },
    ],
  },

  Enterprise: {
    rankScore: 87,
    percentileString: 'Top 8%',
    peerCount: 2341,
    metrics: [
      {
        key: 'throughput',
        name: 'Avg client throughput',
        customerValue: 241.7,
        medianValue: 197.3,
        unit: 'Mbps',
        higherIsBetter: true,
      },
      {
        key: 'uptime',
        name: 'AP uptime',
        customerValue: 99.94,
        medianValue: 99.78,
        unit: '%',
        higherIsBetter: true,
      },
      {
        key: 'roaming',
        name: 'Roaming success rate',
        customerValue: 98.2,
        medianValue: 96.4,
        unit: '%',
        higherIsBetter: true,
      },
      {
        key: 'assocTime',
        name: 'Mean time to associate',
        customerValue: 1.4,
        medianValue: 2.3,
        unit: 's',
        higherIsBetter: false,
      },
      {
        key: 'density',
        name: 'Client density per AP (peak)',
        customerValue: 22.8,
        medianValue: 31.7,
        unit: 'clients',
        higherIsBetter: false,
      },
      {
        key: 'sixGhz',
        name: '5GHz / 6GHz adoption',
        customerValue: 91.4,
        medianValue: 84.6,
        unit: '%',
        higherIsBetter: true,
      },
    ],
    suggestions: [
      {
        headline: 'Small roaming gap worth closing for VoIP reliability',
        context:
          'Your roaming success rate of 98.2% leads the Enterprise median, but the remaining 1.8% failed roams disproportionately affect active voice and video calls where a sub-200ms reassociation window matters.',
        action:
          'Audit roam failure logs for AP pairs with >0.5% failure rate. Enable 802.11k neighbor reports on those pairs and verify your PMK-R1 key holder list is complete for all APs in open office areas.',
      },
      {
        headline: 'Push 6GHz adoption to reach Wi-Fi 7 readiness',
        context:
          'Your 91.4% 6GHz adoption already beats 93% of Enterprise peers — the final 8.6% of clients still on legacy bands are mostly legacy IoT and shared conference room devices.',
        action:
          'Audit devices on 2.4GHz and 5GHz SSIDs. For conference AV systems that cannot be upgraded, create a dedicated legacy-device SSID with lower minimum data rates and segregate them via VLAN to prevent airtime pollution for Wi-Fi 6/6E/7 clients.',
      },
    ],
  },

  Retail: {
    rankScore: 54,
    percentileString: '3rd quartile',
    peerCount: 1847,
    metrics: [
      {
        key: 'throughput',
        name: 'Avg client throughput',
        customerValue: 118.4,
        medianValue: 127.6,
        unit: 'Mbps',
        higherIsBetter: true,
      },
      {
        key: 'uptime',
        name: 'AP uptime',
        customerValue: 98.9,
        medianValue: 99.2,
        unit: '%',
        higherIsBetter: true,
      },
      {
        key: 'roaming',
        name: 'Roaming success rate',
        customerValue: 89.3,
        medianValue: 91.7,
        unit: '%',
        higherIsBetter: true,
      },
      {
        key: 'assocTime',
        name: 'Mean time to associate',
        customerValue: 2.9,
        medianValue: 2.4,
        unit: 's',
        higherIsBetter: false,
      },
      {
        key: 'density',
        name: 'Client density per AP (peak)',
        customerValue: 38.7,
        medianValue: 34.2,
        unit: 'clients',
        higherIsBetter: false,
      },
      {
        key: 'sixGhz',
        name: '5GHz / 6GHz adoption',
        customerValue: 72.1,
        medianValue: 67.8,
        unit: '%',
        higherIsBetter: true,
      },
    ],
    suggestions: [
      {
        headline: 'Roaming failures are above the Retail peer median',
        context:
          'Your roaming success rate of 89.3% is 2.4 points below the Retail median of 91.7% — in high-mobility store environments, failed roams directly translate to POS terminal disconnections and inventory scanner outages.',
        action:
          'Review AP neighbor lists in stockroom-to-floor transition zones. Retail environments frequently have AP pairs that are physically adjacent but not in each other\'s neighbor report — add them manually and validate with a roam walk-test.',
      },
      {
        headline: 'AP uptime is slightly below sector standard',
        context:
          'Your 98.9% AP uptime trails the Retail peer median of 99.2% — equivalent to roughly 26 additional minutes of AP downtime per device per month, compounding across large store fleets.',
        action:
          'Check your AP restart event logs for the past 30 days. If the majority are firmware OOM crashes, schedule a maintenance window to upgrade to the current recommended firmware build and enable auto-restart recovery.',
      },
    ],
  },

  Hospitality: {
    rankScore: 41,
    percentileString: '3rd quartile',
    peerCount: 634,
    metrics: [
      {
        key: 'throughput',
        name: 'Avg client throughput',
        customerValue: 94.7,
        medianValue: 112.8,
        unit: 'Mbps',
        higherIsBetter: true,
      },
      {
        key: 'uptime',
        name: 'AP uptime',
        customerValue: 98.4,
        medianValue: 98.9,
        unit: '%',
        higherIsBetter: true,
      },
      {
        key: 'roaming',
        name: 'Roaming success rate',
        customerValue: 87.1,
        medianValue: 90.4,
        unit: '%',
        higherIsBetter: true,
      },
      {
        key: 'assocTime',
        name: 'Mean time to associate',
        customerValue: 3.8,
        medianValue: 2.8,
        unit: 's',
        higherIsBetter: false,
      },
      {
        key: 'density',
        name: 'Client density per AP (peak)',
        customerValue: 52.6,
        medianValue: 43.7,
        unit: 'clients',
        higherIsBetter: false,
      },
      {
        key: 'sixGhz',
        name: '5GHz / 6GHz adoption',
        customerValue: 64.3,
        medianValue: 68.9,
        unit: '%',
        higherIsBetter: true,
      },
    ],
    suggestions: [
      {
        headline: 'Client density and throughput are both below Hospitality median',
        context:
          'Your peak density of 52.6 clients per AP and throughput of 94.7 Mbps are linked — corridor APs in multi-floor hotels are absorbing clients intended for in-room APs due to signal bleed-through.',
        action:
          'Lower corridor AP transmit power to -3 dBm and set a minimum RSSI association threshold of -70 dBm. This forces guest devices to associate to the physically closer in-room or per-floor AP rather than the hallway unit.',
      },
      {
        headline: 'Association time 36% above Hospitality peer median',
        context:
          'Your mean association time of 3.8s versus the peer median of 2.8s adds friction at the exact moment guests connect after arrival — a key touchpoint for perceived network quality.',
        action:
          'Enable DHCP server-side lease caching and increase your DHCP pool utilization threshold alert to 85%. Slow association often traces to DHCP exhaustion or broadcast storms on guest VLANs — verify lease expiry times are under 4 hours for guest SSIDs.',
      },
    ],
  },

  Government: {
    rankScore: 68,
    percentileString: 'Top 32%',
    peerCount: 483,
    metrics: [
      {
        key: 'throughput',
        name: 'Avg client throughput',
        customerValue: 168.2,
        medianValue: 152.4,
        unit: 'Mbps',
        higherIsBetter: true,
      },
      {
        key: 'uptime',
        name: 'AP uptime',
        customerValue: 99.6,
        medianValue: 99.3,
        unit: '%',
        higherIsBetter: true,
      },
      {
        key: 'roaming',
        name: 'Roaming success rate',
        customerValue: 93.4,
        medianValue: 91.8,
        unit: '%',
        higherIsBetter: true,
      },
      {
        key: 'assocTime',
        name: 'Mean time to associate',
        customerValue: 2.2,
        medianValue: 2.7,
        unit: 's',
        higherIsBetter: false,
      },
      {
        key: 'density',
        name: 'Client density per AP (peak)',
        customerValue: 19.4,
        medianValue: 22.1,
        unit: 'clients',
        higherIsBetter: false,
      },
      {
        key: 'sixGhz',
        name: '5GHz / 6GHz adoption',
        customerValue: 54.7,
        medianValue: 71.3,
        unit: '%',
        higherIsBetter: true,
      },
    ],
    suggestions: [
      {
        headline: '6GHz adoption is 23% below the Government peer median',
        context:
          'Your 5GHz/6GHz adoption of 54.7% significantly lags the Government sector median of 71.3% — likely caused by conservative FIPS-compliant WLAN profiles that exclude WPA3, which is required for 6GHz operation.',
        action:
          'Engage your security policy team to approve WPA3-Enterprise (CNSA Suite B) for 6GHz SSIDs. Controlled Access Program networks can remain on 5GHz; only classify standard user SSIDs as eligible for 6GHz migration.',
      },
      {
        headline: 'Strong position overall — protect uptime during patch windows',
        context:
          'Your 99.6% AP uptime leads 72% of Government peers. The primary risk to this ranking is uncoordinated firmware updates during business hours, a common pattern in agencies without a formal change window.',
        action:
          'Schedule firmware updates in the ExtremeCloud IQ controller for off-peak windows (02:00–05:00 local) and enable rolling upgrade mode to ensure no more than 20% of APs in a site restart simultaneously.',
      },
    ],
  },

  Manufacturing: {
    rankScore: 63,
    percentileString: 'Top 37%',
    peerCount: 721,
    metrics: [
      {
        key: 'throughput',
        name: 'Avg client throughput',
        customerValue: 132.6,
        medianValue: 118.3,
        unit: 'Mbps',
        higherIsBetter: true,
      },
      {
        key: 'uptime',
        name: 'AP uptime',
        customerValue: 99.1,
        medianValue: 98.7,
        unit: '%',
        higherIsBetter: true,
      },
      {
        key: 'roaming',
        name: 'Roaming success rate',
        customerValue: 91.8,
        medianValue: 90.6,
        unit: '%',
        higherIsBetter: true,
      },
      {
        key: 'assocTime',
        name: 'Mean time to associate',
        customerValue: 3.4,
        medianValue: 2.9,
        unit: 's',
        higherIsBetter: false,
      },
      {
        key: 'density',
        name: 'Client density per AP (peak)',
        customerValue: 24.7,
        medianValue: 26.8,
        unit: 'clients',
        higherIsBetter: false,
      },
      {
        key: 'sixGhz',
        name: '5GHz / 6GHz adoption',
        customerValue: 58.3,
        medianValue: 63.7,
        unit: '%',
        higherIsBetter: true,
      },
    ],
    suggestions: [
      {
        headline: 'Association time is 17% above the Manufacturing peer median',
        context:
          'Your mean association time of 3.4s versus the peer median of 2.9s is consistent with industrial environments that have high RF interference from machinery — AGV scanners and barcode readers often retry association repeatedly.',
        action:
          "Enable Adaptive Radio Management's noise floor threshold at -85 dBm and deploy channel bonding 40MHz-only on 5GHz in production floor zones. Interference-induced retries are inflating your association time, not actual network load.",
      },
      {
        headline: '6GHz adoption below Manufacturing peers',
        context:
          'At 58.3%, your 6GHz adoption trails the Manufacturing median of 63.7% — likely because industrial handhelds and ruggedized scanners on your floors are older 802.11ac or Wi-Fi 5 hardware.',
        action:
          'Prioritize 6GHz migration for office and supervisor workstations on the plant floor where modern laptops dominate. Keep industrial handhelds on dedicated 5GHz SSIDs with quality-of-service policies tuned for bursty scan traffic.',
      },
    ],
  },

  Logistics: {
    rankScore: 74,
    percentileString: 'Top 26%',
    peerCount: 512,
    metrics: [
      {
        key: 'throughput',
        name: 'Avg client throughput',
        customerValue: 156.8,
        medianValue: 134.7,
        unit: 'Mbps',
        higherIsBetter: true,
      },
      {
        key: 'uptime',
        name: 'AP uptime',
        customerValue: 99.4,
        medianValue: 99.1,
        unit: '%',
        higherIsBetter: true,
      },
      {
        key: 'roaming',
        name: 'Roaming success rate',
        customerValue: 96.1,
        medianValue: 93.8,
        unit: '%',
        higherIsBetter: true,
      },
      {
        key: 'assocTime',
        name: 'Mean time to associate',
        customerValue: 2.1,
        medianValue: 2.4,
        unit: 's',
        higherIsBetter: false,
      },
      {
        key: 'density',
        name: 'Client density per AP (peak)',
        customerValue: 29.3,
        medianValue: 27.4,
        unit: 'clients',
        higherIsBetter: false,
      },
      {
        key: 'sixGhz',
        name: '5GHz / 6GHz adoption',
        customerValue: 76.8,
        medianValue: 71.2,
        unit: '%',
        higherIsBetter: true,
      },
    ],
    suggestions: [
      {
        headline: 'Client density is slightly above the Logistics peer median',
        context:
          'Your peak density of 29.3 clients per AP modestly exceeds the Logistics median of 27.4 — driven by dock door APs that absorb both forklift-mounted terminals and handheld scanners simultaneously during shift changes.',
        action:
          'Segment dock door APs onto a separate RF profile with a tighter coverage cell — reduce max EIRP by 3 dB and enable per-client rate limiting at 15 Mbps to ensure scan traffic does not starve other clients during inbound freight surges.',
      },
      {
        headline: 'Strong overall — close the density gap to move into Top 20%',
        context:
          'You are outperforming 74% of Logistics peers. The density issue at dock areas is the primary factor holding the rank score at 74 rather than the 82+ needed for Top 20% placement.',
        action:
          'Adding one directional AP per dock cluster pointed inward at -6 dBm would split the client load evenly and is the single highest-leverage change available given your current configuration baseline.',
      },
    ],
  },
};
