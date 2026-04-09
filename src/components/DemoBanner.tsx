/**
 * DemoBanner — fixed strip shown when VITE_DEMO_MODE=true.
 * Renders above the main content area so the user knows they're in demo mode.
 */

export function DemoBanner() {
  if (import.meta.env.VITE_DEMO_MODE !== 'true') return null;

  return (
    <div
      className="flex items-center justify-center gap-2 px-4 py-1.5 text-xs font-medium"
      style={{
        background: 'linear-gradient(90deg, #92400e 0%, #b45309 50%, #92400e 100%)',
        color: '#fef3c7',
        letterSpacing: '0.04em',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          display: 'inline-block',
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: '#fbbf24',
          boxShadow: '0 0 6px #fbbf24',
          animation: 'pulse 2s infinite',
          flexShrink: 0,
        }}
      />
      DEMO MODE — Meridian Retail Group &nbsp;·&nbsp; All data is simulated &nbsp;·&nbsp; Login: demo / demo
    </div>
  );
}
