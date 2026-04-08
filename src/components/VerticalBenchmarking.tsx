/**
 * Vertical Benchmarking & Peer Intelligence
 *
 * Displays anonymized peer comparison data for the customer's selected vertical.
 * All data is currently sourced from mock datasets.
 *
 * TODO: Replace BENCHMARK_DATA import with a real API call to the ExtremeCloud IQ
 * Peer Intelligence endpoint when available.
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  Lightbulb,
  Award,
} from 'lucide-react';
import { BENCHMARK_DATA, VERTICALS, type VerticalKey, type BenchmarkMetric } from '../data/benchmarkData';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getDelta(metric: BenchmarkMetric): number {
  if (metric.higherIsBetter) {
    return ((metric.customerValue - metric.medianValue) / metric.medianValue) * 100;
  }
  return ((metric.medianValue - metric.customerValue) / metric.medianValue) * 100;
}

function formatValue(value: number, unit: string): string {
  if (unit === '%') return `${value.toFixed(1)}%`;
  if (unit === 's') return `${value.toFixed(1)}s`;
  if (unit === 'Mbps') return `${value.toFixed(1)} Mbps`;
  if (unit === 'clients') return value.toFixed(1);
  return `${value}`;
}

type DeltaStatus = 'ahead' | 'behind' | 'neutral';

function getDeltaStatus(delta: number): DeltaStatus {
  if (Math.abs(delta) <= 5) return 'neutral';
  return delta > 0 ? 'ahead' : 'behind';
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface RankScoreArcProps {
  score: number;
}

function RankScoreArc({ score }: RankScoreArcProps) {
  // SVG semicircular arc — radius 54, stroke width 10
  const r = 54;
  const cx = 70;
  const cy = 70;
  const circumference = Math.PI * r; // half circle
  const filled = (score / 100) * circumference;
  const gap = circumference - filled;

  const arcColor =
    score >= 75
      ? 'var(--status-success)'
      : score >= 50
      ? 'var(--status-warning)'
      : 'var(--status-error)';

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="140" height="80" viewBox="0 0 140 80" aria-hidden="true">
        {/* Track */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="var(--border)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        {/* Fill */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke={arcColor}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${gap}`}
          style={{ transition: 'stroke-dasharray 0.6s cubic-bezier(0.4,0,0.2,1)' }}
        />
        <text
          x={cx}
          y={cy - 6}
          textAnchor="middle"
          fontSize="26"
          fontWeight="700"
          fill="var(--foreground)"
        >
          {score}
        </text>
        <text
          x={cx}
          y={cy + 10}
          textAnchor="middle"
          fontSize="11"
          fill="var(--muted-foreground)"
        >
          / 100
        </text>
      </svg>
    </div>
  );
}

interface MetricRowProps {
  metric: BenchmarkMetric;
  animate: boolean;
}

function MetricRow({ metric, animate }: MetricRowProps) {
  const delta = getDelta(metric);
  const status = getDeltaStatus(delta);

  const deltaColor =
    status === 'ahead'
      ? 'text-[color:var(--status-success)]'
      : status === 'behind'
      ? 'text-[color:var(--status-error)]'
      : 'text-muted-foreground';

  const DeltaIcon =
    status === 'ahead' ? TrendingUp : status === 'behind' ? TrendingDown : Minus;

  return (
    <div
      className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-x-6 gap-y-1 py-3 border-b border-border last:border-0"
      style={{
        opacity: animate ? 0 : 1,
        transition: 'opacity 0.25s ease',
      }}
    >
      <span className="text-sm font-medium">{metric.name}</span>

      <span className="text-sm tabular-nums text-right font-semibold">
        {formatValue(metric.customerValue, metric.unit)}
      </span>

      <span className="text-xs tabular-nums text-right text-muted-foreground">
        Median {formatValue(metric.medianValue, metric.unit)}
      </span>

      <span className={`flex items-center gap-1 text-xs font-medium tabular-nums ${deltaColor}`}>
        <DeltaIcon className="h-3.5 w-3.5 shrink-0" />
        {Math.abs(delta) <= 0.5 ? '—' : `${Math.abs(delta).toFixed(1)}%`}
      </span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function VerticalBenchmarking() {
  const [selectedVertical, setSelectedVertical] = useState<VerticalKey>('Education');
  const [animating, setAnimating] = useState(false);

  const dataset = BENCHMARK_DATA[selectedVertical];

  const handleVerticalChange = (vertical: VerticalKey) => {
    if (vertical === selectedVertical) return;
    setAnimating(true);
    // Let fade-out complete before switching data
    setTimeout(() => {
      setSelectedVertical(vertical);
      setAnimating(false);
    }, 220);
  };

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div>
        <h3 className="text-xl font-semibold tracking-tight">Network Performance Intelligence</h3>
        <p className="text-sm text-muted-foreground mt-0.5">
          Benchmarked against anonymized ExtremeCloud IQ customers in your vertical.
        </p>
      </div>

      {/* Vertical pill selector */}
      <div className="flex flex-wrap gap-2">
        {VERTICALS.map((v) => (
          <button
            key={v}
            onClick={() => handleVerticalChange(v)}
            className={[
              'rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              selectedVertical === v
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground',
            ].join(' ')}
          >
            {v}
          </button>
        ))}
      </div>

      {/* Rank card + breakdown row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_1fr]">

        {/* Rank card */}
        <Card className="flex flex-col justify-between">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Peer Rank</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-3 pt-0">
            <div
              style={{
                opacity: animating ? 0 : 1,
                transition: 'opacity 0.25s ease',
              }}
              className="flex flex-col items-center gap-1 w-full"
            >
              <RankScoreArc score={dataset.rankScore} />

              <p
                className="text-2xl font-bold tracking-tight"
                aria-label={`Rank: ${dataset.percentileString}`}
              >
                {dataset.percentileString}
              </p>
              <p className="text-sm text-muted-foreground text-center leading-snug">
                in the {selectedVertical} vertical
              </p>

              <div className="w-full mt-2">
                <Progress value={dataset.rankScore} className="h-2" />
              </div>

              <div className="flex items-center gap-1.5 mt-3">
                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  Compared against{' '}
                  <span className="font-medium text-foreground">
                    {dataset.peerCount.toLocaleString()}
                  </span>{' '}
                  {selectedVertical} deployments
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Performance vs. Peer Median</CardTitle>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-[color:var(--status-success)]" />
                  Ahead
                </span>
                <span className="flex items-center gap-1">
                  <TrendingDown className="h-3 w-3 text-[color:var(--status-error)]" />
                  Behind
                </span>
                <span className="flex items-center gap-1">
                  <Minus className="h-3 w-3 text-muted-foreground" />
                  Within 5%
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div>
              {dataset.metrics.map((metric) => (
                <MetricRow key={metric.key} metric={metric} animate={animating} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Improvement suggestions */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base font-semibold">Where You Can Improve</CardTitle>
            <Badge variant="outline" className="ml-auto text-xs font-normal">
              {dataset.suggestions.length} recommendations
            </Badge>
          </div>
        </CardHeader>
        <CardContent
          className="space-y-4 pt-0"
          style={{
            opacity: animating ? 0 : 1,
            transition: 'opacity 0.25s ease',
          }}
        >
          {dataset.suggestions.map((suggestion, i) => (
            <div
              key={i}
              className="rounded-lg border border-border bg-muted/30 p-4 space-y-2"
            >
              <p className="text-sm font-semibold leading-snug">{suggestion.headline}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{suggestion.context}</p>
              <p className="text-sm leading-relaxed">
                <span className="font-medium">Recommended action: </span>
                {suggestion.action}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
