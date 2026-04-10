/**
 * Vertical Benchmarking & Peer Intelligence
 *
 * Compact peer comparison panel for the selected industry vertical.
 * All data is currently sourced from mock datasets.
 *
 * TODO: Replace BENCHMARK_DATA import with a real API call to the ExtremeCloud IQ
 * Peer Intelligence endpoint when available.
 */

import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp, Award } from 'lucide-react';
import { BENCHMARK_DATA, VERTICALS, type VerticalKey, type BenchmarkMetric } from '../data/benchmarkData';
import { isDemoActive, bootstrapDemo, teardownDemo } from '@/lib/demoSeed';

function getDelta(metric: BenchmarkMetric): number {
  return metric.higherIsBetter
    ? ((metric.customerValue - metric.medianValue) / metric.medianValue) * 100
    : ((metric.medianValue - metric.customerValue) / metric.medianValue) * 100;
}

function formatValue(value: number, unit: string): string {
  if (unit === '%') return `${value.toFixed(1)}%`;
  if (unit === 's') return `${value.toFixed(1)}s`;
  if (unit === 'Mbps') return `${value.toFixed(1)} Mbps`;
  return value.toFixed(1);
}

export function VerticalBenchmarking() {
  const [selectedVertical, setSelectedVertical] = useState<VerticalKey>(() => {
    const stored = localStorage.getItem('demo_active_vertical') as VerticalKey | null;
    return stored ?? 'Education';
  });
  const [animating, setAnimating] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const dataset = BENCHMARK_DATA[selectedVertical];

  const handleVerticalChange = (vertical: VerticalKey) => {
    if (vertical === selectedVertical) return;
    setAnimating(true);
    setTimeout(() => {
      setSelectedVertical(vertical);
      setAnimating(false);
      if (isDemoActive()) {
        teardownDemo();
        bootstrapDemo(vertical);
        window.location.reload();
      }
    }, 200);
  };

  const rankColor =
    dataset.rankScore >= 75
      ? 'text-[color:var(--status-success)]'
      : dataset.rankScore >= 50
      ? 'text-[color:var(--status-warning)]'
      : 'text-[color:var(--status-error)]';

  return (
    <Card>
      <CardContent className="p-4 space-y-3">

        {/* Header row: title + rank + pills */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex items-center gap-1.5 shrink-0">
            <Award className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold">Peer Benchmarking</span>
          </div>

          {/* Rank inline */}
          <div
            className="flex items-center gap-2 shrink-0"
            style={{ opacity: animating ? 0 : 1, transition: 'opacity 0.2s ease' }}
          >
            <span className={`text-sm font-bold tabular-nums ${rankColor}`}>
              {dataset.percentileString}
            </span>
            <span className="text-xs text-muted-foreground tabular-nums">
              {dataset.rankScore}/100 · {dataset.peerCount.toLocaleString()} {selectedVertical} peers
            </span>
          </div>

          {/* Vertical pills — pushed to the right */}
          <div className="flex flex-wrap gap-1.5 ml-auto">
            {VERTICALS.map((v) => (
              <button
                key={v}
                onClick={() => handleVerticalChange(v)}
                className={[
                  'rounded-full px-3 py-0.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  selectedVertical === v
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground',
                ].join(' ')}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* 2-column metric grid */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-x-6"
          style={{ opacity: animating ? 0 : 1, transition: 'opacity 0.2s ease' }}
        >
          {dataset.metrics.map((metric) => {
            const delta = getDelta(metric);
            const abs = Math.abs(delta);
            const status = abs <= 5 ? 'neutral' : delta > 0 ? 'ahead' : 'behind';
            const deltaColor =
              status === 'ahead'
                ? 'text-[color:var(--status-success)]'
                : status === 'behind'
                ? 'text-[color:var(--status-error)]'
                : 'text-muted-foreground';
            const Icon = status === 'ahead' ? TrendingUp : status === 'behind' ? TrendingDown : Minus;

            return (
              <div
                key={metric.key}
                className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0 sm:[&:nth-last-child(2)]:border-0"
              >
                <span className="text-xs text-muted-foreground truncate mr-2">{metric.name}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-semibold tabular-nums">
                    {formatValue(metric.customerValue, metric.unit)}
                  </span>
                  <span className="text-xs text-muted-foreground tabular-nums hidden sm:inline">
                    vs {formatValue(metric.medianValue, metric.unit)}
                  </span>
                  <span className={`flex items-center gap-0.5 text-xs font-medium tabular-nums ${deltaColor}`}>
                    <Icon className="h-3 w-3 shrink-0" />
                    {abs <= 0.5 ? '—' : `${abs.toFixed(1)}%`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Suggestions toggle */}
        <div style={{ opacity: animating ? 0 : 1, transition: 'opacity 0.2s ease' }}>
          <button
            onClick={() => setShowSuggestions((p) => !p)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {showSuggestions ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            {showSuggestions ? 'Hide' : 'Show'} {dataset.suggestions.length} improvement recommendations
          </button>

          {showSuggestions && (
            <div className="mt-2 space-y-2">
              {dataset.suggestions.map((s, i) => (
                <div key={i} className="rounded-md border border-border bg-muted/30 px-3 py-2 space-y-1">
                  <p className="text-xs font-semibold leading-snug">{s.headline}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{s.context}</p>
                  <p className="text-xs leading-relaxed">
                    <span className="font-medium">Action: </span>{s.action}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </CardContent>
    </Card>
  );
}
