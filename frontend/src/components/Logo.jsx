import React from 'react'

export default function Logo({ size = 'md', showText = true, badge = '', className = '', onClick }) {
  // Dimension scales
  const dimensions = {
    xs: { icon: 20, font: 14, gap: 6, badgeFont: 9 },
    sm: { icon: 26, font: 16, gap: 8, badgeFont: 10 },
    md: { icon: 34, font: 20, gap: 10, badgeFont: 11 },
    lg: { icon: 46, font: 26, gap: 12, badgeFont: 12 },
    xl: { icon: 60, font: 34, gap: 16, badgeFont: 13 }
  }

  const s = dimensions[size] || dimensions.md

  return (
    <div
      className={`opengym-logo ${className}`}
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: s.gap,
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
        textDecoration: 'none'
      }}
    >
      {/* Modern Geometric Vector Icon Mark */}
      <div
        className="logo-mark-wrap"
        style={{
          width: s.icon,
          height: s.icon,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        <svg
          viewBox="0 0 100 100"
          width={s.icon}
          height={s.icon}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ overflow: 'visible', filter: 'drop-shadow(0 2px 8px rgba(163, 230, 53, 0.25))' }}
        >
          <defs>
            <linearGradient id="ogGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a3e635" />
              <stop offset="50%" stopColor="#4ade80" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
            <linearGradient id="glowRing" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#a3e635" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* Background Ambient Aura */}
          <circle cx="50" cy="50" r="44" stroke="url(#glowRing)" strokeWidth="3" opacity="0.4" strokeDasharray="6 4" />

          {/* Left Weight Plate Arc (The "O") */}
          <rect
            x="14"
            y="26"
            width="12"
            height="48"
            rx="6"
            fill="url(#ogGrad)"
          />
          <rect
            x="29"
            y="33"
            width="8"
            height="34"
            rx="4"
            fill="url(#ogGrad)"
            opacity="0.85"
          />

          {/* Barbell Center Shaft */}
          <rect
            x="24"
            y="46"
            width="52"
            height="8"
            rx="4"
            fill="var(--label)"
            opacity="0.9"
          />

          {/* Right Weight Plate Arc (The "G") */}
          <rect
            x="63"
            y="33"
            width="8"
            height="34"
            rx="4"
            fill="url(#ogGrad)"
            opacity="0.85"
          />
          <rect
            x="74"
            y="26"
            width="12"
            height="48"
            rx="6"
            fill="url(#ogGrad)"
          />

          {/* Center Dynamic Core Pulse Dot */}
          <circle cx="50" cy="50" r="7" fill="url(#ogGrad)" />
          <circle cx="50" cy="50" r="11" stroke="#a3e635" strokeWidth="1.5" opacity="0.75" />
        </svg>
      </div>

      {/* Typography Wordmark */}
      {showText && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              fontSize: s.font,
              letterSpacing: '-0.03em',
              lineHeight: 1,
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}
          >
            <span style={{ fontWeight: 400, color: 'var(--label-2)' }}>open</span>
            <span style={{ fontWeight: 800, color: 'var(--label)', marginLeft: 1 }}>Gym</span>
            <span style={{ color: 'var(--acc)', fontWeight: 800, marginLeft: 2 }}>.</span>
          </span>

          {badge && (
            <span
              style={{
                fontSize: s.badgeFont,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                background: 'color-mix(in srgb, var(--acc) 14%, transparent)',
                color: 'var(--acc)',
                border: '1px solid color-mix(in srgb, var(--acc) 30%, transparent)',
                borderRadius: 6,
                padding: '2px 5px',
                lineHeight: 1
              }}
            >
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
