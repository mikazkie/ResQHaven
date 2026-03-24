// src/components/panels/NeedsPanel.jsx
// ✅ Reusable — use anywhere you need needs summary
//
// Usage:
// import NeedsPanel from '../components/panels/NeedsPanel'
// <NeedsPanel stats={stats} />
//
// stats shape:
// {
//   medicineNeeds: 5,
//   specialFoodCount: 3,
//   allergyCount: 2,
//   foodNeeds: 10,
// }

export default function NeedsPanel({ stats }) {

  const items = [
    {
      icon: '💊', label: 'Medicine',
      value: stats?.medicineNeeds || 0,
      color: '#f59e0b'
    },
    {
      icon: '🍽️', label: 'Special Food',
      value: stats?.specialFoodCount || 0,
      color: '#22c55e'
    },
    {
      icon: '🤧', label: 'Allergies',
      value: stats?.allergyCount || 0,
      color: '#ef4444'
    },
    {
      icon: '🍚', label: 'Food Supply',
      value: stats?.foodNeeds || 0,
      color: '#3b82f6'
    },
  ]

  const maxValue = Math.max(
    ...items.map(i => i.value), 1
  )

  return (
    <div className='card border-0 shadow-sm h-100'>
      <div className='card-body p-4'>

        <h6 className='fw-bold mb-3 border-bottom pb-2'>
          🆘 Needs Summary
        </h6>

        <div className='d-flex flex-column gap-3'>
          {items.map(item => {
            const pct = Math.round(
              (item.value / maxValue) * 100
            )
            return (
              <div key={item.label}>
                <div className='d-flex
                  justify-content-between
                  align-items-center mb-1'
                >
                  <span className='d-flex
                    align-items-center gap-2'
                    style={{ fontSize: 13 }}
                  >
                    <span>{item.icon}</span>
                    <span className='fw-medium'>
                      {item.label}
                    </span>
                  </span>
                  <span className='fw-bold'
                    style={{
                      fontSize: 13,
                      color: item.color
                    }}
                  >
                    {item.value}
                  </span>
                </div>
                <div className='progress'
                  style={{ height: 8 }}
                >
                  <div
                    className='progress-bar'
                    style={{
                      width: `${pct}%`,
                      background: item.color,
                      transition: 'width 0.5s ease'
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        <div className='mt-3 pt-2 border-top
          d-flex justify-content-between'
          style={{ fontSize: 12 }}
        >
          <span className='text-muted'>
            Total needs
          </span>
          <span className='fw-bold'>
            {items.reduce((s, i) => s + i.value, 0)}
          </span>
        </div>

      </div>
    </div>
  )
}
