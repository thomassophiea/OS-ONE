# Meridian Retail Group — Demo Mode Design

**Date:** 2026-04-08  
**Status:** Approved  
**Scope:** Full-stack mock data for retail vertical demo

---

## Overview

A self-contained demo mode activated by a single Railway environment variable (`VITE_DEMO_MODE=true`). When active, a fetch interceptor catches every controller API call before it hits the network and returns realistic mock data for the Meridian Retail Group — a fictional multi-region retail chain. No production code paths are modified. Removing the flag restores normal operation completely.

---

## Meridian Retail Group — Org Hierarchy

### Organization
- **Name:** Meridian Retail Group
- **ID:** `meridian-org`
- **Slug:** `meridian-retail`

### Site Groups (4 regional controllers)

| ID | Name | Controller URL (fake) | Sites |
|---|---|---|---|
| `sg-northeast` | Northeast Region | `https://ctrl-ne.meridian.internal` | 6 |
| `sg-southeast` | Southeast Region | `https://ctrl-se.meridian.internal` | 6 |
| `sg-west` | West Coast Region | `https://ctrl-wc.meridian.internal` | 6 |
| `sg-corporate` | Corporate & Logistics | `https://ctrl-corp.meridian.internal` | 4 |

### Sites (22 total)

**Northeast Region**
| ID | Name | Type | APs | Avg Clients |
|---|---|---|---|---|
| `ne-nyc-flagship` | NYC Flagship — 5th Ave | Flagship | 24 | 520 |
| `ne-boston-std` | Boston — Prudential Center | Standard | 10 | 180 |
| `ne-philly-std` | Philadelphia — King of Prussia | Standard | 11 | 195 |
| `ne-newark-outlet` | Newark Outlet | Outlet | 12 | 160 |
| `ne-hartford-std` | Hartford — Westfarms Mall | Standard | 9 | 145 |
| `ne-providence-std` | Providence — Providence Place | Standard | 8 | 130 |

**Southeast Region**
| ID | Name | Type | APs | Avg Clients |
|---|---|---|---|---|
| `se-atl-flagship` | Atlanta Flagship — Lenox Square | Flagship | 26 | 560 |
| `se-miami-flagship` | Miami Flagship — Brickell City | Flagship | 22 | 490 |
| `se-charlotte-std` | Charlotte — SouthPark Mall | Standard | 10 | 170 |
| `se-nashville-std` | Nashville — Cool Springs | Standard | 9 | 155 |
| `se-tampa-outlet` | Tampa Outlet | Outlet | 13 | 175 |
| `se-savannah-std` | Savannah — Oglethorpe Mall | Standard | 8 | 120 |

**West Coast Region**
| ID | Name | Type | APs | Avg Clients |
|---|---|---|---|---|
| `wc-la-flagship` | LA Flagship — Beverly Center | Flagship | 28 | 610 |
| `wc-sf-flagship` | San Francisco Flagship — Union Square | Flagship | 25 | 580 |
| `wc-seattle-std` | Seattle — University Village | Standard | 11 | 190 |
| `wc-portland-std` | Portland — Lloyd Center | Standard | 9 | 150 |
| `wc-sandiego-outlet` | San Diego Outlet — Las Americas | Outlet | 14 | 185 |
| `wc-lasvegas-std` | Las Vegas — Fashion Show Mall | Standard | 12 | 210 |

**Corporate & Logistics**
| ID | Name | Type | APs | Avg Clients |
|---|---|---|---|---|
| `corp-hq` | Meridian HQ — Atlanta Campus | HQ | 48 | 720 |
| `corp-ne-dc` | Northeast Distribution Center | DC | 62 | 95 |
| `corp-wc-dc` | West Coast Distribution Center | DC | 58 | 88 |
| `corp-warehouse` | Central Warehouse — Memphis | Warehouse | 44 | 65 |

---

## Architecture

### Files to Create

```
src/
  data/
    meridianDemoData.ts          # All mock data — org, sites, APs, clients, variables, templates
  lib/
    demoInterceptor.ts           # Fetch wrapper + route table + all mock handlers
    demoSeed.ts                  # Seeds localStorage with org/sitegroup/variables/templates
  components/
    DemoBanner.tsx               # Fixed banner strip showing "Demo Mode — Meridian Retail Group"
```

### Files to Modify

```
src/main.tsx                     # Install interceptor + seed if VITE_DEMO_MODE
src/components/LoginForm.tsx     # Accept demo/demo credentials, skip real auth
src/App.tsx                      # Render DemoBanner when demo mode active
vite.config.ts                   # Ensure VITE_DEMO_MODE is passed through
```

---

## Interceptor Architecture

`demoInterceptor.ts` wraps `window.fetch` once. The wrapper:

1. Extracts the URL and method from each fetch call
2. Checks if URL contains `/management/` — if not, passes through to real fetch
3. Matches against a route table of `[method, RegExp] → handler` pairs
4. Calls the matched handler, which reads `getDemoSiteGroupId()` (from localStorage) to return region-appropriate data
5. Returns a synthetic `Response` object with the correct status, headers, and JSON body
6. Unmatched management calls return `{ data: [], total: 0 }` with status 200

```
window.fetch (wrapped)
  ├── Non-management URL → pass through (real fetch)
  └── /management/ URL → route table
       ├── POST **/authentication/token → mockAuth()
       ├── HEAD **/aps → mock200()
       ├── GET **/v3/sites OR /v1/sites → mockSites()
       ├── GET/POST **/aps/query → mockAccessPoints()
       ├── GET **/aps/:serial/stations → mockStations(serial)
       ├── GET **/sle/** → mockSLE()
       ├── GET **/events/** → mockEvents()
       ├── GET **/alarms/** → mockAlarms()
       └── * → mockEmpty()
```

---

## Data Layer (`meridianDemoData.ts`)

### Access Points

APs are generated deterministically using a seeded pseudo-random function. Each AP has:
- `serialNumber`: `MRD-{siteId}-{index:03}` (e.g., `MRD-NE-NYC-001`)
- `displayName`: `{SiteAbbr}-AP-{floor}{room}` (e.g., `NYC-AP-1F-01`)
- `model`: Mix of `AP410C`, `AP460C`, `AP410i` (flagship), `AP305C` (standard), `AP302i` (outlet)
- `status`: 95% `connected`, 3% `disconnected`, 2% `error`
- `hostSite`: site name
- `ipAddress`: `10.{regionOctet}.{siteOctet}.{apIndex}`
- `channel2g`: 1, 6, or 11 (distributed)
- `channel5g`: 36, 40, 44, 48, 100, 104, 149, 153, 157, 161 (distributed)
- `txPower`: 17–23 dBm
- `clientCount`: realistic per site type (store: 15–45, DC: 3–12, HQ: 20–35)
- `uptime`: 1–180 days

### Clients (Stations)

Per-AP station list generated on demand from serial number seed. Each station:
- `macAddress`: deterministic fake MAC
- `hostname`: retail-realistic names (e.g., `POS-TERM-04`, `iphone-guest`, `SCAN-GUN-12`, `CCTV-CAM-03`, `MRD-LAPTOP-07`)
- `ipAddress`: site subnet
- `rssi`: -45 to -78 dBm
- `band`: 60% 5GHz, 30% 2.4GHz, 10% 6GHz
- `os`: iOS, Android, Windows, Linux (scanner), embedded
- `vlan`: POS (10), Staff (20), Guest (100), IoT (200) — mixed per site type

### SLE Metrics

Per-site SLE scores (0–100):
- Flagships: 88–97% across all classifiers
- Standard: 85–94%
- Outlets: 80–92%  
- DC/Warehouse: 78–90% (RF challenging, high ceilings, metal shelving)
- HQ: 90–97%

Classifiers: Throughput, Capacity, Coverage, Roaming, DHCP, DNS, Auth, Time-to-Connect

### Events Feed

~40 realistic retail events:
- AP reboots, firmware upgrades, new AP onboarding
- Client association storms (pre-open rush)
- POS terminal roaming events
- Rogue AP detected near loading dock
- Config push completions

### Security Alerts

~8 rogue APs detected:
- 2 near Northeast DC loading dock (SSID: `linksys`, `FREE-WIFI`)
- 1 near Miami Flagship (SSID: `Xfinity`)
- Containment status: 2 contained, rest monitoring

---

## Variable Definitions (Retail-Specific)

| Token | Name | Type | Default |
|---|---|---|---|
| `pos_vlan` | POS Terminal VLAN | vlan | 10 |
| `staff_vlan` | Staff Network VLAN | vlan | 20 |
| `iot_vlan` | IoT Devices VLAN | vlan | 200 |
| `guest_vlan` | Guest Network VLAN | vlan | 100 |
| `guest_ssid` | Guest SSID Name | string | `Meridian-Guest` |
| `staff_ssid` | Staff SSID Name | string | `Meridian-Staff` |
| `pos_ssid` | POS SSID Name | string | `Meridian-POS` |
| `guest_bw_limit` | Guest Bandwidth Limit (Mbps) | number | 25 |
| `pos_bw_limit` | POS Bandwidth Limit (Mbps) | number | 50 |
| `client_idle_timeout` | Client Idle Timeout (sec) | number | 1800 |
| `pmk_cache_timeout` | PMK Cache Timeout (sec) | number | 43200 |
| `max_clients_ap` | Max Clients per AP | number | 64 |
| `store_id` | Store Identifier | string | (per site) |
| `region_code` | Region Code | string | (per site group) |

Site-group-level overrides:
- `guest_ssid`: `Meridian-Guest-NE` / `Meridian-Guest-SE` / `Meridian-Guest-WC` / `Meridian-Corporate`
- `region_code`: `NE` / `SE` / `WC` / `CORP`

Site-level overrides: `store_id` set per site.

---

## Config Templates (5)

1. **Guest SSID** (`service`): Uses `{{guest_ssid}}`, `{{guest_vlan}}`, `{{guest_bw_limit}}`
2. **POS Network** (`service`): Uses `{{pos_ssid}}`, `{{pos_vlan}}`, `{{pos_bw_limit}}`
3. **Staff Network** (`service`): Uses `{{staff_ssid}}`, `{{staff_vlan}}`
4. **IoT / Label Printers** (`service`): Uses `{{iot_vlan}}`, fixed SSID `Meridian-IoT`
5. **Retail RF Policy** (`rf_policy`): Uses `{{max_clients_ap}}`, `{{client_idle_timeout}}`

All 5 templates assigned to org scope. Each site group has variable value overrides.

---

## Demo Login Flow

1. User enters `demo` / `demo` in LoginForm
2. LoginForm detects credentials match demo pair (only when `VITE_DEMO_MODE=true`)
3. Calls `demoSeed.bootstrap()` which:
   - Writes Meridian org to `api_current_org`
   - Writes 4 site groups to `api_controllers`
   - Sets Northeast as default to `api_current_controller`
   - Writes templates, variable defs, variable values to `ge_*` localStorage keys
4. Sets a synthetic auth token in localStorage
5. Calls the app's existing `onSuccess` callback — normal app boot continues

---

## Demo Banner

A fixed horizontal strip at the top of the authenticated app shell (above the main content area, below the top nav). Shows:
- Orange/amber indicator dot
- "Demo Mode — Meridian Retail Group"
- Does not obstruct navigation

Only renders when `import.meta.env.VITE_DEMO_MODE === 'true'`.

---

## Railway Deployment

Two env vars needed on the Railway demo service:
```
VITE_DEMO_MODE=true
CAMPUS_CONTROLLER_URL=https://demo.meridian.internal  # Fake — interceptor catches all calls
```

`VITE_SUPABASE_URL` left unset → forces localStorage-only fallback in tenantService and globalElementsService.

---

## Verification

1. Deploy to Railway with `VITE_DEMO_MODE=true`
2. Visit app → DemoBanner visible
3. Login with `demo` / `demo` → app boots, Northeast Region selected
4. Sidebar shows org "Meridian Retail Group"
5. Access Points page → shows APs for Northeast sites
6. Switch site group to Southeast → APs change to Southeast data
7. Config Drift → shows 5 Meridian sites with realistic RF/WLAN drift
8. Global Templates → 5 retail templates visible
9. Global Variables → 14 retail variable definitions visible
10. Events & Alarms → retail event feed visible
11. Security Dashboard → rogue AP alerts visible
12. Remove `VITE_DEMO_MODE` → app behaves normally, no mock data
