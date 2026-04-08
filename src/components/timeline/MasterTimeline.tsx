import React, { useRef, useState, useCallback, useLayoutEffect } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { Button } from '../ui/button';
import { useTimelineNavigation, TimelineScope } from '../../hooks/useTimelineNavigation';
import { cn } from '../ui/utils';

export interface MasterTimelineEvent {
  timestamp: number;
  category: string;
  severity: 'critical' | 'major' | 'minor' | 'info';
  message: string;
}

interface MasterTimelineProps {
  scope: TimelineScope;
  /** Full time domain [start, end] in ms — used to position ruler ticks and event markers */
  dataDomain: [number, number];
  events: MasterTimelineEvent[];
  duration: string;
  /** Called when user clicks "Refetch for window" — parent handles the API call */
  onRefetch: (windowStart: number, windowEnd: number) => void;
}

const SEVERITY_COLOR: Record<string, string> = {
  critical: '#ef4444',
  major:    '#f97316',
  minor:    '#eab308',
  info:     '#3b82f6',
};

const RULER_H = 34;
const LANE_H  = 52;
const SVG_H   = RULER_H + LANE_H;
const TICK_COUNT = 7;
const MIN_DRAG_MS = 2000; // minimum selection to commit as zoom

function formatRulerTick(ts: number, duration: string): string {
  const d = new Date(ts);
  if (duration === '3H' || duration === '24H') {
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function MasterTimeline({ scope, dataDomain, events, duration, onRefetch }: MasterTimelineProps) {
  const timeline = useTimelineNavigation(scope);
  const svgRef   = useRef<SVGSVGElement>(null);
  const [svgWidth, setSvgWidth] = useState(800);

  // Observe actual rendered SVG width
  useLayoutEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    setSvgWidth(el.clientWidth);
    const ro = new ResizeObserver(() => setSvgWidth(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const [domainStart, domainEnd] = dataDomain;
  const domainRange = Math.max(domainEnd - domainStart, 1);

  const tsToX = useCallback(
    (ts: number) => ((ts - domainStart) / domainRange) * svgWidth,
    [domainStart, domainRange, svgWidth]
  );

  const xToTs = useCallback(
    (x: number) => domainStart + (Math.max(0, Math.min(x, svgWidth)) / svgWidth) * domainRange,
    [domainStart, domainRange, svgWidth]
  );

  // Drag state (local — mirrors useTimelineNavigation's timeWindow during drag)
  const dragStartTs = useRef<number | null>(null);
  const isDragging  = useRef(false);

  const [popover, setPopover] = useState<{
    event: MasterTimelineEvent;
    x: number;
  } | null>(null);

  // ── Ruler ticks ─────────────────────────────────────────────────────────────
  const ticks = React.useMemo(
    () => Array.from({ length: TICK_COUNT }, (_, i) =>
      domainStart + (i / (TICK_COUNT - 1)) * domainRange
    ),
    [domainStart, domainRange]
  );

  // ── Mouse handlers ───────────────────────────────────────────────────────────
  const getTs = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = svgRef.current!.getBoundingClientRect();
    return xToTs(e.clientX - rect.left);
  };

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const ts = getTs(e);
    isDragging.current = true;
    dragStartTs.current = ts;
    timeline.startTimeWindow(ts);
    setPopover(null);
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDragging.current || !svgRef.current) return;
    timeline.updateTimeWindow(getTs(e));
  };

  const handleMouseUp = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDragging.current || !svgRef.current) return;
    const ts = getTs(e);
    isDragging.current = false;
    timeline.endTimeWindow();

    if (timeline.zoomMode === 'zoom' && dragStartTs.current !== null) {
      const [lo, hi] = dragStartTs.current < ts
        ? [dragStartTs.current, ts]
        : [ts, dragStartTs.current];
      if (hi - lo >= MIN_DRAG_MS) {
        timeline.applyZoom(lo, hi);
      }
    }
    dragStartTs.current = null;
  };

  const handleMouseLeave = () => {
    if (isDragging.current) {
      isDragging.current = false;
      timeline.endTimeWindow();
      dragStartTs.current = null;
    }
  };

  // ── Event marker click ───────────────────────────────────────────────────────
  const handleEventClick = (ev: MasterTimelineEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    timeline.lockAt(ev.timestamp);
    const x = tsToX(ev.timestamp);
    setPopover({ event: ev, x });
  };

  // ── Derived render values ────────────────────────────────────────────────────
  const { timeWindow, zoomDomain, zoomMode, currentTime, isLocked, pendingRefetch } = timeline;

  const hasWindow = timeWindow.start !== null && timeWindow.end !== null;
  const winX1 = hasWindow ? tsToX(Math.min(timeWindow.start!, timeWindow.end!)) : 0;
  const winX2 = hasWindow ? tsToX(Math.max(timeWindow.start!, timeWindow.end!)) : 0;

  const zoomX1 = zoomDomain ? tsToX(zoomDomain[0]) : 0;
  const zoomX2 = zoomDomain ? tsToX(zoomDomain[1]) : 0;

  const cursorX = currentTime !== null ? tsToX(currentTime) : null;

  const hasSelection = hasWindow || !!zoomDomain;

  return (
    <div className="border-b border-border bg-muted/10">
      {/* ── Controls bar ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-3 py-1 border-b border-border/40 h-8">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-muted-foreground tracking-wide uppercase">
            Timeline
          </span>

          {/* Highlight / Zoom toggle */}
          <div className="flex items-center border border-border rounded overflow-hidden h-5 text-[11px]">
            <button
              className={cn(
                'px-2 leading-5 transition-colors',
                zoomMode === 'highlight'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              )}
              onClick={() => timeline.setZoomMode('highlight')}
            >
              Highlight
            </button>
            <button
              className={cn(
                'px-2 leading-5 transition-colors border-l border-border',
                zoomMode === 'zoom'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              )}
              onClick={() => timeline.setZoomMode('zoom')}
            >
              Zoom
            </button>
          </div>

          {events.length > 0 && (
            <span className="text-[11px] text-muted-foreground">
              {events.length} event{events.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {pendingRefetch && zoomDomain && (
            <Button
              variant="outline"
              size="sm"
              className="h-5 text-[11px] gap-1 px-2"
              onClick={() => onRefetch(zoomDomain[0], zoomDomain[1])}
            >
              <RefreshCw className="h-2.5 w-2.5" />
              Refetch for window
            </Button>
          )}
          {hasSelection && (
            <Button
              variant="ghost"
              size="sm"
              className="h-5 text-[11px] gap-1 px-2"
              onClick={() => {
                timeline.clearZoom();
                timeline.clearTimeWindow();
              }}
            >
              <X className="h-2.5 w-2.5" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* ── SVG ruler + swim lane ─────────────────────────────────────────── */}
      <div className="relative w-full" style={{ height: SVG_H }}>
        <svg
          ref={svgRef}
          width="100%"
          height={SVG_H}
          className="cursor-crosshair select-none block"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          {/* Ruler area */}
          <rect x={0} y={0} width="100%" height={RULER_H} className="fill-transparent" />

          {/* Zoom domain band */}
          {zoomDomain && (
            <rect
              x={zoomX1} y={0}
              width={Math.max(zoomX2 - zoomX1, 1)} height={SVG_H}
              fill="hsl(var(--primary))"
              fillOpacity={0.08}
              stroke="hsl(var(--primary))"
              strokeOpacity={0.35}
              strokeWidth={1}
              strokeDasharray="4 3"
            />
          )}

          {/* Live drag selection */}
          {hasWindow && winX2 - winX1 > 1 && (
            <rect
              x={winX1} y={0}
              width={winX2 - winX1} height={SVG_H}
              fill="hsl(var(--primary))"
              fillOpacity={0.15}
            />
          )}

          {/* Tick marks */}
          {ticks.map((ts, i) => {
            const x = tsToX(ts);
            const anchor = i === 0 ? 'start' : i === TICK_COUNT - 1 ? 'end' : 'middle';
            return (
              <g key={i}>
                <line
                  x1={x} y1={RULER_H - 8}
                  x2={x} y2={RULER_H - 1}
                  stroke="hsl(var(--muted-foreground))"
                  strokeOpacity={0.4}
                  strokeWidth={1}
                />
                <text
                  x={x} y={RULER_H - 12}
                  textAnchor={anchor}
                  fontSize={9}
                  fill="hsl(var(--muted-foreground))"
                  fillOpacity={0.65}
                >
                  {formatRulerTick(ts, duration)}
                </text>
              </g>
            );
          })}

          {/* Ruler baseline */}
          <line
            x1={0} y1={RULER_H - 1}
            x2="100%" y2={RULER_H - 1}
            stroke="hsl(var(--border))"
            strokeWidth={1}
          />

          {/* Swim lane background */}
          <rect
            x={0} y={RULER_H}
            width="100%" height={LANE_H}
            fill="hsl(var(--muted))"
            fillOpacity={0.25}
          />

          {/* Event markers */}
          {events.map((ev, i) => {
            const x = tsToX(ev.timestamp);
            if (x < -4 || x > svgWidth + 4) return null;
            const color = SEVERITY_COLOR[ev.severity] ?? SEVERITY_COLOR.info;
            const cy = RULER_H + LANE_H / 2 - 6;
            return (
              <g
                key={i}
                onClick={(e) => handleEventClick(ev, e as unknown as React.MouseEvent)}
                style={{ cursor: 'pointer' }}
              >
                <line
                  x1={x} y1={RULER_H + 3}
                  x2={x} y2={RULER_H + LANE_H - 3}
                  stroke={color}
                  strokeOpacity={0.25}
                  strokeWidth={1}
                />
                <circle
                  cx={x} cy={cy}
                  r={4}
                  fill={color}
                  stroke="white"
                  strokeWidth={1}
                  opacity={0.82}
                />
                <text
                  x={x}
                  y={cy + 16}
                  textAnchor="middle"
                  fontSize={8}
                  fill={color}
                  fillOpacity={0.75}
                >
                  {ev.category.length > 9 ? `${ev.category.slice(0, 9)}…` : ev.category}
                </text>
              </g>
            );
          })}

          {/* Current time cursor */}
          {cursorX !== null && (
            <line
              x1={cursorX} y1={0}
              x2={cursorX} y2={SVG_H}
              stroke="hsl(var(--primary))"
              strokeWidth={isLocked ? 2 : 1.5}
              strokeOpacity={0.75}
              strokeDasharray={isLocked ? undefined : '4 2'}
            />
          )}
        </svg>

        {/* ── Event popover ──────────────────────────────────────────────── */}
        {popover && (
          <div
            className="absolute top-1 z-20 bg-background border border-border rounded-md shadow-md p-2 text-xs max-w-[220px] pointer-events-auto"
            style={{
              left: Math.min(
                Math.max(popover.x + 10, 4),
                svgWidth - 228
              ),
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <span
                className="font-semibold leading-tight"
                style={{ color: SEVERITY_COLOR[popover.event.severity] }}
              >
                {popover.event.category}
              </span>
              <button
                onClick={() => setPopover(null)}
                className="text-muted-foreground hover:text-foreground leading-none mt-0.5 shrink-0"
              >
                ×
              </button>
            </div>
            <p className="text-muted-foreground mt-1 leading-relaxed break-words">
              {popover.event.message}
            </p>
            <p className="text-muted-foreground/70 mt-1 text-[10px]">
              {new Date(popover.event.timestamp).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                second: '2-digit',
              })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
