interface ChartProps {
  data: { date: string; value: number }[]
  color: string
  type: 'bar' | 'area'
  label: string
}

export default function Chart({ data, color, type, label }: ChartProps) {
  const max = Math.max(...data.map(d => d.value), 1)
  const w = 300
  const h = 120
  const pad = { top: 12, right: 8, bottom: 28, left: 32 }
  const innerW = w - pad.left - pad.right
  const innerH = h - pad.top - pad.bottom
  const n = data.length

  const xPos = (i: number) => pad.left + (i / (n - 1)) * innerW
  const yPos = (v: number) => pad.top + innerH - (v / max) * innerH

  const points = data.map((d, i) => `${xPos(i)},${yPos(d.value)}`).join(' ')
  const areaPath = `M${xPos(0)},${yPos(data[0]?.value ?? 0)} ` +
    data.map((d, i) => `L${xPos(i)},${yPos(d.value)}`).join(' ') +
    ` L${xPos(n - 1)},${pad.top + innerH} L${xPos(0)},${pad.top + innerH} Z`

  const barW = Math.max(4, (innerW / n) * 0.55)

  return (
    <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 14, padding: '20px 16px 12px' }}>
      <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'rgba(255,255,255,.4)', marginBottom: 12 }}>{label}</p>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
        <defs>
          <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Y grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map(t => {
          const y = pad.top + innerH * (1 - t)
          return (
            <g key={t}>
              <line x1={pad.left} y1={y} x2={pad.left + innerW} y2={y} stroke="rgba(255,255,255,.06)" strokeWidth="1" />
              <text x={pad.left - 4} y={y + 4} textAnchor="end" fontSize="8" fill="rgba(255,255,255,.3)">
                {Math.round(max * t)}
              </text>
            </g>
          )
        })}

        {type === 'area' && (
          <>
            <path d={areaPath} fill={`url(#grad-${label})`} />
            <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
            {data.map((d, i) => (
              <circle key={i} cx={xPos(i)} cy={yPos(d.value)} r="3" fill={color} />
            ))}
          </>
        )}

        {type === 'bar' && data.map((d, i) => {
          const bh = (d.value / max) * innerH
          return (
            <rect
              key={i}
              x={xPos(i) - barW / 2}
              y={pad.top + innerH - bh}
              width={barW}
              height={bh}
              rx="3"
              fill={color}
              opacity="0.8"
            />
          )
        })}

        {/* X labels */}
        {data.map((d, i) => (
          <text key={i} x={xPos(i)} y={h - 4} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,.35)">
            {d.date.slice(5)}
          </text>
        ))}
      </svg>
    </div>
  )
}
