interface KpiCardProps {
  icon: string
  value: string
  label: string
  accent?: 'blue' | 'gold' | 'green' | 'orange' | 'cyan' | 'purple'
  topBorder?: boolean
}

const ACCENT_COLORS: Record<string, string> = {
  blue:   '#3b82f6',
  gold:   '#ffd700',
  green:  '#22c55e',
  orange: '#f97316',
  cyan:   '#06b6d4',
  purple: '#a855f7',
}

export default function KpiCard({ icon, value, label, accent = 'gold', topBorder }: KpiCardProps) {
  const color = ACCENT_COLORS[accent] || ACCENT_COLORS.gold
  return (
    <div style={{
      background: 'rgba(255,255,255,.04)',
      border: '1px solid rgba(255,255,255,.08)',
      borderTop: topBorder ? `2px solid ${color}` : '1px solid rgba(255,255,255,.08)',
      borderRadius: 16,
      padding: '24px 28px',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      backdropFilter: 'blur(20px)',
      transition: 'transform .2s ease, box-shadow .2s ease',
      cursor: 'default',
      position: 'relative',
      overflow: 'hidden',
    }}
    onMouseEnter={e => {
      (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'
      ;(e.currentTarget as HTMLDivElement).style.boxShadow = `0 12px 40px ${color}22`
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLDivElement).style.transform = ''
      ;(e.currentTarget as HTMLDivElement).style.boxShadow = ''
    }}
    >
      <div style={{ fontSize: 28 }}>{icon}</div>
      <div style={{
        fontFamily: "'Orbitron', 'Inter', sans-serif",
        fontSize: 'clamp(1.4rem, 3vw, 2.2rem)',
        fontWeight: 900,
        color,
        lineHeight: 1,
        letterSpacing: '-0.5px',
      }}>{value}</div>
      <div style={{
        fontSize: 11,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '1.5px',
        color: 'rgba(255,255,255,.45)',
      }}>{label}</div>
    </div>
  )
}
