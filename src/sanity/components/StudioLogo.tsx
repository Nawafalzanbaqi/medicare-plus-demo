'use client'

/**
 * Studio header logo — replaces the default Sanity wordmark.
 * Rendered inside the Studio toolbar, so it stays compact.
 */
export function StudioLogo() {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #0d3e3e 0%, #2a7373 100%)',
          border: '2px solid #c9a961',
          display: 'grid',
          placeItems: 'center',
          color: '#ffffff',
          fontSize: 16,
          fontWeight: 700,
          lineHeight: 1,
        }}
      >
        ن
      </span>
      <span
        style={{
          fontWeight: 600,
          fontSize: 14,
          color: '#0d3e3e',
          letterSpacing: '0.01em',
        }}
      >
        لوحة تحكم ميديكير بلس
      </span>
    </span>
  )
}
