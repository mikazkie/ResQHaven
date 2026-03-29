export default function NeedsPanel({ stats }) {
  const items = [
    {
      icon: 'bi-capsule-pill',
      label: 'Medicine',
      value: stats?.medicineNeeds || 0,
      color: '#c98a2e'
    },
    {
      icon: 'bi-basket2',
      label: 'Special Food',
      value: stats?.specialFoodCount || 0,
      color: '#5f8f55'
    },
    {
      icon: 'bi-shield-exclamation',
      label: 'Allergies',
      value: stats?.allergyCount || 0,
      color: '#b75d5d'
    },
    {
      icon: 'bi-box-seam',
      label: 'Food Supply',
      value: stats?.foodNeeds || 0,
      color: '#5c88c9'
    }
  ]

  const maxValue = Math.max(...items.map((item) => item.value), 1)

  return (
    <div className='card border-0 shadow-sm h-100'>
      <div className='card-body p-4'>
        <h6 className='fw-bold mb-3 border-bottom pb-2'>
          <span className='d-inline-flex align-items-center gap-2'>
            <i className='bi bi-clipboard2-pulse' style={{ color: '#6b7280' }} />
            <span>Needs Summary</span>
          </span>
        </h6>

        <div className='d-flex flex-column gap-3'>
          {items.map((item) => {
            const pct = Math.round((item.value / maxValue) * 100)

            return (
              <div key={item.label}>
                <div className='d-flex justify-content-between align-items-center mb-1'>
                  <span className='d-flex align-items-center gap-2' style={{ fontSize: 13 }}>
                    <i className={`bi ${item.icon}`} style={{ color: item.color, fontSize: 14 }} />
                    <span className='fw-medium'>{item.label}</span>
                  </span>
                  <span
                    className='fw-semibold'
                    style={{
                      fontSize: 13,
                      color: item.color
                    }}
                  >
                    {item.value}
                  </span>
                </div>
                <div className='progress' style={{ height: 8, background: '#eceff3' }}>
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

        <div className='mt-3 pt-2 border-top d-flex justify-content-between' style={{ fontSize: 12 }}>
          <span className='text-muted'>Total needs</span>
          <span className='fw-bold'>{items.reduce((sum, item) => sum + item.value, 0)}</span>
        </div>
      </div>
    </div>
  )
}
