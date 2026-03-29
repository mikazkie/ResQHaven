const PRIMARY_CONFIG = {
  safe: {
    label: 'Safe',
    icon: 'bi-shield-check',
    color: '#5f8f55'
  },
  at_risk: {
    label: 'At Risk',
    icon: 'bi-exclamation-triangle',
    color: '#c98a2e'
  },
  evacuation_requested: {
    label: 'Evacuation Requested',
    icon: 'bi-megaphone',
    color: '#b98954'
  },
  evacuated: {
    label: 'Evacuated',
    icon: 'bi-house-check',
    color: '#5c88c9'
  },
  checked_in: {
    label: 'Checked-in',
    icon: 'bi-box-arrow-in-right',
    color: '#6b7fa8'
  },
  missing: {
    label: 'Missing',
    icon: 'bi-search',
    color: '#b75d5d'
  },
  found: {
    label: 'Found',
    icon: 'bi-person-check',
    color: '#5f8f55'
  },
  dead: {
    label: 'Dead',
    icon: 'bi-record-circle',
    color: '#7a7f87'
  }
}

const SECONDARY_CONFIG = {
  injured: {
    label: 'Injured',
    icon: 'bi-heart-pulse',
    color: '#b75d5d'
  },
  chronic_illness: {
    label: 'Chronic Illness',
    icon: 'bi-capsule-pill',
    color: '#c98a2e'
  },
  critical_condition: {
    label: 'Critical Condition',
    icon: 'bi-exclamation-octagon',
    color: '#a65858'
  },
  senior_citizen: {
    label: 'Senior Citizen',
    icon: 'bi-person-standing',
    color: '#8a7aa8'
  },
  pwd: {
    label: 'PWD',
    icon: 'bi-universal-access',
    color: '#6b7fa8'
  },
  pregnant: {
    label: 'Pregnant',
    icon: 'bi-person-heart',
    color: '#b78595'
  },
  infant_child: {
    label: 'Infant / Child',
    icon: 'bi-person',
    color: '#6d98a5'
  },
  lactating: {
    label: 'Lactating',
    icon: 'bi-droplet',
    color: '#b98954'
  },
  others: {
    label: 'Others',
    icon: 'bi-three-dots',
    color: '#7a7f87'
  }
}

function BarChart({ title, titleIcon, data, configMap }) {
  if (!data || data.length === 0) {
    return (
      <div className='card border-0 shadow-sm h-100'>
        <div className='card-body p-4'>
          <h6 className='fw-bold mb-3 border-bottom pb-2'>
            <span className='d-inline-flex align-items-center gap-2'>
              <i className={`bi ${titleIcon}`} style={{ color: '#6b7280' }} />
              <span>{title}</span>
            </span>
          </h6>
          <div className='text-center text-muted py-4' style={{ fontSize: 13 }}>
            No data yet
          </div>
        </div>
      </div>
    )
  }

  const total = data.reduce((sum, item) => sum + item.count, 0)
  const maxValue = Math.max(...data.map((item) => item.count), 1)

  return (
    <div className='card border-0 shadow-sm h-100'>
      <div className='card-body p-4'>
        <h6 className='fw-bold mb-3 border-bottom pb-2'>
          <span className='d-inline-flex align-items-center gap-2'>
            <i className={`bi ${titleIcon}`} style={{ color: '#6b7280' }} />
            <span>{title}</span>
          </span>
        </h6>

        <div className='d-flex flex-column gap-3'>
          {data.map((item) => {
            const config = configMap[item.status] || {
              label: item.status,
              icon: 'bi-bar-chart',
              color: '#7a7f87'
            }

            const pct = Math.round((item.count / maxValue) * 100)
            const totalPct = Math.round((item.count / total) * 100)

            return (
              <div key={item.status}>
                <div className='d-flex justify-content-between align-items-center mb-1'>
                  <span className='d-flex align-items-center gap-2' style={{ fontSize: 13 }}>
                    <i className={`bi ${config.icon}`} style={{ color: config.color, fontSize: 14 }} />
                    <span className='fw-medium'>{config.label}</span>
                  </span>
                  <div className='d-flex align-items-center gap-2'>
                    <span
                      className='fw-semibold'
                      style={{
                        fontSize: 13,
                        color: config.color
                      }}
                    >
                      {item.count}
                    </span>
                    <span className='text-muted' style={{ fontSize: 11 }}>
                      {totalPct}%
                    </span>
                  </div>
                </div>
                <div className='progress' style={{ height: 8, background: '#eceff3' }}>
                  <div
                    className='progress-bar'
                    style={{
                      width: `${pct}%`,
                      background: config.color,
                      transition: 'width 0.6s ease'
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        <div className='mt-3 pt-2 border-top d-flex justify-content-between' style={{ fontSize: 12 }}>
          <span className='text-muted'>Total entries</span>
          <span className='fw-bold'>{total}</span>
        </div>
      </div>
    </div>
  )
}

export function SecondaryStatusChart({ data }) {
  return (
    <BarChart
      title='Special Conditions'
      titleIcon='bi-activity'
      data={data}
      configMap={SECONDARY_CONFIG}
    />
  )
}

export function PrimaryStatusChart({ data }) {
  return (
    <BarChart
      title='Primary Status'
      titleIcon='bi-diagram-3'
      data={data}
      configMap={PRIMARY_CONFIG}
    />
  )
}

export default BarChart
