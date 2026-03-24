import { useState } from 'react'

function PieSlice({
  cx, cy, r,
  startAngle, endAngle,
  color, isHovered,
  onHover, onLeave
}) {
  const toRad = (deg) => (deg * Math.PI) / 180

  const x1 = cx + r * Math.cos(toRad(startAngle))
  const y1 = cy + r * Math.sin(toRad(startAngle))
  const x2 = cx + r * Math.cos(toRad(endAngle))
  const y2 = cy + r * Math.sin(toRad(endAngle))
  const largeArc = endAngle - startAngle > 180 ? 1 : 0

  const d = [
    `M ${cx} ${cy}`,
    `L ${x1} ${y1}`,
    `A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`,
    'Z'
  ].join(' ')

  return (
    <path
      d={d}
      fill={color}
      stroke='#fff'
      strokeWidth={2}
      style={{
        transform: isHovered
          ? 'scale(1.05)'
          : 'scale(1)',
        transformOrigin: `${cx}px ${cy}px`,
        transition: 'transform 0.2s ease',
        cursor: 'pointer',
        filter: isHovered
          ? 'brightness(1.1)'
          : 'none'
      }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    />
  )
}

export default function PieChart({
  title,
  data = [],
  loading = false
}) {
  const [hovered, setHovered] = useState(null)

  const total = data.reduce(
    (sum, d) => sum + (d.value || 0), 0
  )

  // ✅ Build slices
  let currentAngle = -90
  const slices = data.map((item, i) => {
    const angle = total > 0
      ? (item.value / total) * 360
      : 0
    const slice = {
      ...item,
      startAngle: currentAngle,
      endAngle: currentAngle + angle,
      index: i
    }
    currentAngle += angle
    return slice
  })

  const cx = 100
  const cy = 100
  const r = 85

  // ✅ Loading state
  if (loading) {
    return (
      <div className='card border-0 shadow-sm h-100'>
        <div className='card-body p-4
          d-flex align-items-center
          justify-content-center'
          style={{ minHeight: 220 }}
        >
          <div className='spinner-border
            text-danger spinner-border-sm'
          />
        </div>
      </div>
    )
  }

  return (
    <div className='card border-0 shadow-sm h-100'>
      <div className='card-body p-4'>

        {/* Title */}
        <h6 className='fw-bold mb-3
          border-bottom pb-2'
        >
          {title}
        </h6>

        {total === 0 ? (
          // ✅ Empty state
          <div
            className='text-center
              text-muted py-4 rounded'
            style={{
              fontSize: 13,
              background: '#f8f9fa'
            }}
          >
            <div style={{ fontSize: '2rem' }}>
              📭
            </div>
            <div className='mt-1'>
              No data available
            </div>
          </div>
        ) : (
          <>
            {/* ✅ SVG Pie Chart */}
            <div className='d-flex
              justify-content-center mb-3'
            >
              <svg
                viewBox='0 0 200 200'
                width={180}
                height={180}
              >
                {/* Slices */}
                {slices.map((slice, i) => (
                  <PieSlice
                    key={i}
                    cx={cx} cy={cy} r={r}
                    startAngle={slice.startAngle}
                    endAngle={slice.endAngle}
                    color={slice.color}
                    isHovered={hovered === i}
                    onHover={() => setHovered(i)}
                    onLeave={() => setHovered(null)}
                  />
                ))}

                {/* ✅ Donut hole */}
                <circle
                  cx={cx} cy={cy} r={48}
                  fill='white'
                />

                {/* ✅ Center text */}
                {hovered !== null ? (
                  <>
                    <text
                      x={cx} y={cy - 10}
                      textAnchor='middle'
                      fontSize={20}
                      fontWeight='bold'
                      fill={slices[hovered]?.color}
                    >
                      {slices[hovered]?.value}
                    </text>
                    <text
                      x={cx} y={cy + 8}
                      textAnchor='middle'
                      fontSize={8}
                      fill='#6b7280'
                    >
                      {slices[hovered]?.label}
                    </text>
                    <text
                      x={cx} y={cy + 20}
                      textAnchor='middle'
                      fontSize={8}
                      fill='#9ca3af'
                    >
                      {Math.round(
                        (slices[hovered]?.value /
                          total) * 100
                      )}%
                    </text>
                  </>
                ) : (
                  <>
                    <text
                      x={cx} y={cy - 6}
                      textAnchor='middle'
                      fontSize={22}
                      fontWeight='bold'
                      fill='#1f2937'
                    >
                      {total}
                    </text>
                    <text
                      x={cx} y={cy + 12}
                      textAnchor='middle'
                      fontSize={9}
                      fill='#6b7280'
                    >
                      Total
                    </text>
                  </>
                )}
              </svg>
            </div>

            {/* ✅ Legend */}
            <div className='d-flex
              flex-column gap-2'
            >
              {slices.map((item, i) => {
                const pct = total > 0
                  ? Math.round(
                      (item.value / total) * 100
                    )
                  : 0

                return (
                  <div
                    key={i}
                    className='d-flex
                      align-items-center
                      justify-content-between
                      p-2 rounded'
                    style={{
                      cursor: 'pointer',
                      background: hovered === i
                        ? `${item.color}18`
                        : '#f8f9fa',
                      border: hovered === i
                        ? `1px solid ${item.color}40`
                        : '1px solid transparent',
                      transition: 'all 0.15s'
                    }}
                    onMouseEnter={() => setHovered(i)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    <div className='d-flex
                      align-items-center gap-2'
                    >
                      <div style={{
                        width: 12, height: 12,
                        borderRadius: 3,
                        background: item.color,
                        flexShrink: 0
                      }} />
                      <span style={{ fontSize: 13 }}>
                        {item.icon} {item.label}
                      </span>
                    </div>
                    <div className='d-flex
                      align-items-center gap-2'
                    >
                      <span
                        className='fw-bold'
                        style={{
                          fontSize: 14,
                          color: item.color
                        }}
                      >
                        {item.value}
                      </span>
                      <span
                        className='badge'
                        style={{
                          background: `${item.color}20`,
                          color: item.color,
                          fontSize: 10
                        }}
                      >
                        {pct}%
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

          </>
        )}

      </div>
    </div>
  )
}