/**
 * ConfigurationDriftDetail — Side-by-side diff panel for a single site.
 *
 * Shows only drifted parameters (not identical keys). Each row has per-field
 * Adopt and Overwrite actions. A Collapsible at the bottom exposes the full
 * raw JSON for both sides.
 */

import { useState } from 'react';
import { ArrowUp, ArrowDown, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { DetailSlideOut } from './DetailSlideOut';
import type { SiteConfig, SiteNetworkConfig, DriftedParam, DriftStatus } from '@/data/configDriftMockData';

interface SiteWithDrift extends SiteConfig {
  drifted: DriftedParam[];
  status: DriftStatus;
}

interface ConfigurationDriftDetailProps {
  site: SiteWithDrift;
  globalConfig: SiteNetworkConfig;
  onAdopt: (siteId: string, path: string) => void;
  onOverwrite: (siteId: string, path: string) => void;
  onAdoptAll: (siteId: string) => void;
  onOverwriteAll: (siteId: string) => void;
  onClose: () => void;
}

const STATUS_BADGE: Record<DriftStatus, { label: string; variant: 'success' | 'warning' | 'destructive' }> = {
  in_sync: { label: 'In Sync', variant: 'success' },
  drift_detected: { label: 'Drift Detected', variant: 'warning' },
  critical: { label: 'Critical', variant: 'destructive' },
};

function formatValue(value: unknown): string {
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (value === null || value === undefined) return '—';
  return String(value);
}

export function ConfigurationDriftDetail({
  site,
  globalConfig,
  onAdopt,
  onOverwrite,
  onAdoptAll,
  onOverwriteAll,
  onClose,
}: ConfigurationDriftDetailProps) {
  const [rawJsonOpen, setRawJsonOpen] = useState(false);
  const badge = STATUS_BADGE[site.status];
  const hasDrift = site.drifted.length > 0;

  return (
    <DetailSlideOut
      isOpen
      onClose={onClose}
      title={site.name}
      description={`${site.drifted.length} parameter${site.drifted.length !== 1 ? 's' : ''} differ from global template`}
      width="4xl"
    >
      <div className="space-y-6">
        {/* Status header */}
        <div className="flex items-center gap-3">
          <Badge variant={badge.variant}>{badge.label}</Badge>
          {hasDrift && (
            <span className="text-xs text-muted-foreground">
              Review each parameter below and choose to adopt the site change into the global template,
              or restore the global baseline.
            </span>
          )}
        </div>

        {/* Diff table */}
        {hasDrift ? (
          <div className="rounded-md border border-border overflow-hidden">
            {/* Column headers */}
            <div className="grid grid-cols-[1fr_1fr_1fr_1.5fr_auto] gap-0 bg-muted/50 border-b border-border px-4 py-2 text-xs font-medium text-muted-foreground">
              <span>Field</span>
              <span>Global Template</span>
              <span>Site Running Value</span>
              <span>Admin Note</span>
              <span>Actions</span>
            </div>

            {site.drifted.map((param) => (
              <div
                key={param.path}
                className="grid grid-cols-[1fr_1fr_1fr_1.5fr_auto] gap-0 items-start px-4 py-3 border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
              >
                {/* Field name */}
                <div>
                  <span className="text-sm font-medium">{param.label}</span>
                  <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{param.path}</p>
                </div>

                {/* Global value */}
                <div className="pr-3">
                  <span className="inline-block bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20 rounded px-2 py-0.5 text-xs font-mono">
                    {formatValue(param.globalValue)}
                  </span>
                </div>

                {/* Site value */}
                <div className="pr-3">
                  <span className="inline-block bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-500/20 rounded px-2 py-0.5 text-xs font-mono">
                    {formatValue(param.siteValue)}
                  </span>
                </div>

                {/* Admin note */}
                <div className="pr-3">
                  {param.reason ? (
                    <p className="text-xs text-muted-foreground leading-relaxed">{param.reason}</p>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">No note provided</span>
                  )}
                </div>

                {/* Per-field actions */}
                <div className="flex flex-col gap-1 min-w-[90px]">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs justify-start gap-1 text-green-700 dark:text-green-400 hover:text-green-800 hover:bg-green-500/10"
                    onClick={() => onAdopt(site.id, param.path)}
                    title="Adopt site value into global template"
                  >
                    <ArrowUp className="h-3 w-3" />
                    Adopt
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs justify-start gap-1 text-orange-700 dark:text-orange-400 hover:text-orange-800 hover:bg-orange-500/10"
                    onClick={() => onOverwrite(site.id, param.path)}
                    title="Overwrite site value with global template"
                  >
                    <ArrowDown className="h-3 w-3" />
                    Overwrite
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-border bg-muted/30 px-6 py-8 text-center">
            <p className="text-sm text-muted-foreground">This site is fully in sync with the global template.</p>
          </div>
        )}

        {/* Bulk actions */}
        {hasDrift && (
          <div className="flex items-center gap-3 pt-1">
            <Button
              variant="default"
              size="sm"
              onClick={() => onAdoptAll(site.id)}
            >
              <ArrowUp className="h-3.5 w-3.5 mr-1.5" />
              Adopt All into Global
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOverwriteAll(site.id)}
            >
              <ArrowDown className="h-3.5 w-3.5 mr-1.5" />
              Overwrite All with Global
            </Button>
          </div>
        )}

        {/* Raw JSON toggle */}
        <Collapsible open={rawJsonOpen} onOpenChange={setRawJsonOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
              {rawJsonOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
              {rawJsonOpen ? 'Hide' : 'Show'} Raw JSON Diff
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            {/* TODO: replace static JSON with live API snapshot from GET /api/management/v1/sites/{id}/config */}
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">Global Template</p>
                <pre className="bg-muted rounded p-3 text-xs overflow-auto max-h-72 font-mono leading-relaxed">
                  {JSON.stringify(globalConfig, null, 2)}
                </pre>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">{site.name} — Running Config</p>
                <pre className="bg-muted rounded p-3 text-xs overflow-auto max-h-72 font-mono leading-relaxed">
                  {JSON.stringify(site.config, null, 2)}
                </pre>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </DetailSlideOut>
  );
}
