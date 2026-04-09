/**
 * ConfigurationDrift — Global admin view for comparing org-level template
 * configuration against per-site running configuration.
 *
 * State for globalConfig and siteConfigs lives here so adopt/overwrite actions
 * can update both and trigger re-derivation of drift status and summary counts.
 */

import { useState, useMemo, useCallback } from 'react';
import { GitCompare, CheckCircle2, AlertTriangle, ShieldAlert, ClipboardList } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from './ui/table';
import { ConfigurationDriftDetail } from './ConfigurationDriftDetail';
import {
  GLOBAL_TEMPLATE_CONFIG,
  INITIAL_SITE_CONFIGS,
  computeDrift,
  getSiteStatus,
} from '@/data/configDriftMockData';
import type { SiteNetworkConfig, SiteConfig, DriftStatus } from '@/data/configDriftMockData';
import { toast } from 'sonner';

const STATUS_BADGE: Record<DriftStatus, { label: string; variant: 'success' | 'warning' | 'destructive'; icon: typeof CheckCircle2 }> = {
  in_sync: { label: 'In Sync', variant: 'success', icon: CheckCircle2 },
  drift_detected: { label: 'Drift Detected', variant: 'warning', icon: AlertTriangle },
  critical: { label: 'Critical', variant: 'destructive', icon: ShieldAlert },
};

// Simulate a "last checked" timestamp per site (static for mock data)
const LAST_CHECKED: Record<string, string> = {
  'east-campus': '2025-04-08 09:14',
  'west-campus': '2025-04-08 09:14',
  'stadium': '2025-04-08 09:14',
  'north-campus': '2025-04-08 09:14',
  'southbrook-elementary': '2025-04-08 09:14',
};

/** Produces a deep-merged copy of a SiteNetworkConfig with one field updated. */
function patchConfig(
  config: SiteNetworkConfig,
  path: string,
  value: unknown
): SiteNetworkConfig {
  const [ns, key] = path.split('.') as [keyof SiteNetworkConfig, string];
  return {
    ...config,
    [ns]: { ...(config[ns] as unknown as Record<string, unknown>), [key]: value },
  };
}

export function ConfigurationDrift() {
  const [globalConfig, setGlobalConfig] = useState(GLOBAL_TEMPLATE_CONFIG);
  const [sites, setSites] = useState<SiteConfig[]>(INITIAL_SITE_CONFIGS);
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);

  // Derive drift state for all sites
  const sitesWithDrift = useMemo(
    () =>
      sites.map((s) => {
        const drifted = computeDrift(globalConfig, s.config, s.drift_notes);
        return { ...s, drifted, status: getSiteStatus(drifted, s.id) };
      }),
    [globalConfig, sites]
  );

  // Summary counts
  const summary = useMemo(() => {
    const driftCount = sitesWithDrift.filter((s) => s.status !== 'in_sync').length;
    const paramsDrifted = sitesWithDrift.reduce((acc, s) => acc + s.drifted.length, 0);
    return {
      total: sitesWithDrift.length,
      driftCount,
      paramsDrifted,
      pendingReview: paramsDrifted, // each drifted param is "pending review"
    };
  }, [sitesWithDrift]);

  const selectedSite = selectedSiteId
    ? sitesWithDrift.find((s) => s.id === selectedSiteId) ?? null
    : null;

  // ── Adopt: pull site value up into global template ────────────────────────
  const handleAdopt = useCallback(
    (siteId: string, path: string) => {
      const site = sites.find((s) => s.id === siteId);
      if (!site) return;
      const [ns, key] = path.split('.') as [keyof SiteNetworkConfig, string];
      const siteValue = (site.config[ns] as unknown as Record<string, unknown>)[key];

      setGlobalConfig((prev) => patchConfig(prev, path, siteValue));
      // Remove the drift note for this field — it's now canonical
      setSites((prev) =>
        prev.map((s) =>
          s.id === siteId
            ? { ...s, drift_notes: Object.fromEntries(Object.entries(s.drift_notes).filter(([k]) => k !== path)) }
            : s
        )
      );
      toast.success(`Adopted "${path}" into global template`);
    },
    [sites]
  );

  // ── Overwrite: push global value down to site ─────────────────────────────
  const handleOverwrite = useCallback(
    (siteId: string, path: string) => {
      const [ns, key] = path.split('.') as [keyof SiteNetworkConfig, string];
      const globalValue = (globalConfig[ns] as unknown as Record<string, unknown>)[key];

      setSites((prev) =>
        prev.map((s) =>
          s.id === siteId
            ? {
                ...s,
                config: patchConfig(s.config, path, globalValue),
                drift_notes: Object.fromEntries(Object.entries(s.drift_notes).filter(([k]) => k !== path)),
              }
            : s
        )
      );
      toast.success(`Restored global baseline for "${path}" on ${sites.find((s) => s.id === siteId)?.name}`);
    },
    [globalConfig, sites]
  );

  // ── Adopt all drifted params for a site ───────────────────────────────────
  const handleAdoptAll = useCallback(
    (siteId: string) => {
      const siteWithDrift = sitesWithDrift.find((s) => s.id === siteId);
      if (!siteWithDrift) return;
      let nextGlobal = globalConfig;
      for (const param of siteWithDrift.drifted) {
        nextGlobal = patchConfig(nextGlobal, param.path, param.siteValue);
      }
      setGlobalConfig(nextGlobal);
      setSites((prev) =>
        prev.map((s) => (s.id === siteId ? { ...s, drift_notes: {} } : s))
      );
      toast.success(`All ${siteWithDrift.drifted.length} parameters adopted into global template`);
    },
    [globalConfig, sitesWithDrift]
  );

  // ── Overwrite all drifted params for a site ───────────────────────────────
  const handleOverwriteAll = useCallback(
    (siteId: string) => {
      const siteWithDrift = sitesWithDrift.find((s) => s.id === siteId);
      if (!siteWithDrift) return;
      let nextConfig = siteWithDrift.config;
      for (const param of siteWithDrift.drifted) {
        nextConfig = patchConfig(nextConfig, param.path, param.globalValue);
      }
      setSites((prev) =>
        prev.map((s) =>
          s.id === siteId ? { ...s, config: nextConfig, drift_notes: {} } : s
        )
      );
      toast.success(`${siteWithDrift.name} restored to global baseline`);
    },
    [sitesWithDrift]
  );

  return (
    <div className="space-y-5 p-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <GitCompare className="h-6 w-6 text-muted-foreground" />
        <div>
          <h1 className="text-xl font-semibold">Configuration Drift</h1>
          <p className="text-sm text-muted-foreground">
            Compare global template baseline against per-site running configuration
          </p>
        </div>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SummaryCard label="Total Sites" value={summary.total} icon={ClipboardList} />
        <SummaryCard label="Sites with Drift" value={summary.driftCount} icon={AlertTriangle} highlight={summary.driftCount > 0} />
        <SummaryCard label="Parameters Drifted" value={summary.paramsDrifted} icon={GitCompare} highlight={summary.paramsDrifted > 0} />
        <SummaryCard label="Pending Review" value={summary.pendingReview} icon={ShieldAlert} highlight={summary.pendingReview > 0} />
      </div>

      {/* Site list */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Sites</CardTitle>
          <CardDescription>Click a site to review drifted parameters</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Site Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Drifted Params</TableHead>
                <TableHead>Last Checked</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sitesWithDrift.map((site) => {
                const badge = STATUS_BADGE[site.status];
                const Icon = badge.icon;
                return (
                  <TableRow
                    key={site.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedSiteId(site.id)}
                  >
                    <TableCell className="font-medium">{site.name}</TableCell>
                    <TableCell>
                      <Badge variant={badge.variant} className="inline-flex items-center gap-1">
                        <Icon className="h-3 w-3" />
                        {badge.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {site.drifted.length > 0 ? (
                        <span className="font-medium">{site.drifted.length}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {LAST_CHECKED[site.id] ?? '—'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSiteId(site.id);
                        }}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail panel */}
      {selectedSite && (
        <ConfigurationDriftDetail
          site={selectedSite}
          globalConfig={globalConfig}
          onAdopt={handleAdopt}
          onOverwrite={handleOverwrite}
          onAdoptAll={handleAdoptAll}
          onOverwriteAll={handleOverwriteAll}
          onClose={() => setSelectedSiteId(null)}
        />
      )}
    </div>
  );
}

interface SummaryCardProps {
  label: string;
  value: number;
  icon: typeof CheckCircle2;
  highlight?: boolean;
}

function SummaryCard({ label, value, icon: Icon, highlight }: SummaryCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{label}</p>
          <Icon className={`h-4 w-4 ${highlight ? 'text-orange-500' : 'text-muted-foreground'}`} />
        </div>
        <p className={`text-2xl font-bold mt-1 ${highlight && value > 0 ? 'text-orange-500' : ''}`}>
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
