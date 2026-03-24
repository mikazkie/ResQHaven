// src/components/panels/StatusBarChart.jsx
// ✅ Reusable bar chart for primary/secondary status
//
// Usage:
// import { SecondaryStatusChart, PrimaryStatusChart }
//   from '../components/panels/StatusBarChart'
//
// <SecondaryStatusChart data={secondaryStatusData} />
// <PrimaryStatusChart data={primaryStatusData} />
//
// data shape: [{ status: 'injured', count: 5 }, ...]

const PRIMARY_CONFIG = {
  safe: {
    label: 'Safe', icon: '✅',
    color: '#22c55e'
  },
  at_risk: {
    label: 'At Risk', icon: '⚠️',
    color: '#f59e0b'
  },
  evacuation_requested: {
    label: 'Evacuation Requested', icon: '🆘',
    color: '#f97316'
  },
  evacuated: {
    label: 'Evacuated', icon: '🚌',
    color: '#3b82f6'
  },
  checked_in: {
    label: 'Checked-in', icon: '🏠',
    color: '#8b5cf6'
  },
  missing: {
    label: 'Missing', icon: '❓',
    color: '#ef4444'
  },
  found: {
    label: 'Found', icon: '🎉',
    color: '#10b981'
  },
  dead: {
    label: 'Dead', icon: '🕊️',
    color: '#6b7280'
  }
}

const SECONDARY_CONFIG = {
  injured: {
    label: 'Injured', icon: '🤕',
    color: '#ef4444'
  },
  chronic_illness: {
    label: 'Chronic Illness', icon: '💊',
    color: '#f59e0b'
  },
  critical_condition: {
    label: 'Critical Condition', icon: '🚨',
    color: '#dc2626'
  },
  senior_citizen: {
    label: 'Senior Citizen', icon: '👴',
    color: '#8b5cf6'
  },
  pwd: {
    label: 'PWD', icon: '♿',
    color: '#3b82f6'
  },
  pregnant: {
    label: 'Pregnant', icon: '🤰',
    color: '#ec4899'
  },
  infant_child: {
    label: 'Infant / Child', icon: '👶',
    color: '#06b6d4'
  },
  lactating: {
    label: 'Lactating', icon: '🍼',
    color: '#f97316'
  },
  others: {
    label: 'Others', icon: '📝',
    color: '#6b7280'
  }
}

// ✅ Base bar chart — internal use
function BarChart({ title, data, configMap }) {

  if (!data || data.length === 0) {
    return (
      <div className='card border-0 shadow-sm h-100'>
        <div className='card-body p-4'>
          <h6 className='fw-bold mb-3 border-bottom pb-2'>
            {title}
          </h6>
          <div className='text-center text-muted py-4'
            style={{ fontSize: 13 }}
          >
            No data yet
          </div>
        </div>
      </div>
    )
  }

  const total = data.reduce(
    (s, d) => s + d.count, 0
  )
  const maxValue = Math.max(
    ...data.map(d => d.count), 1
  )

  return (
    <div className='card border-0 shadow-sm h-100'>
      <div className='card-body p-4'>

        <h6 className='fw-bold mb-3 border-bottom pb-2'>
          {title}
        </h6>

        <div className='d-flex flex-column gap-3'>
          {data.map(item => {
            const config = configMap[item.status] || {
              label: item.status,
              icon: '📊',
              color: '#6b7280'
            }
            const pct = Math.round(
              (item.count / maxValue) * 100
            )
            const totalPct = Math.round(
              (item.count / total) * 100
            )

            return (
              <div key={item.status}>
                <div className='d-flex
                  justify-content-between
                  align-items-center mb-1'
                >
                  <span className='d-flex
                    align-items-center gap-2'
                    style={{ fontSize: 13 }}
                  >
                    <span>{config.icon}</span>
                    <span className='fw-medium'>
                      {config.label}
                    </span>
                  </span>
                  <div className='d-flex
                    align-items-center gap-2'
                  >
                    <span className='fw-bold'
                      style={{
                        fontSize: 13,
                        color: config.color
                      }}
                    >
                      {item.count}
                    </span>
                    <span className='text-muted'
                      style={{ fontSize: 11 }}
                    >
                      {totalPct}%
                    </span>
                  </div>
                </div>
                <div className='progress'
                  style={{ height: 8 }}
                >
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

        {/* Total */}
        <div className='mt-3 pt-2 border-top
          d-flex justify-content-between'
          style={{ fontSize: 12 }}
        >
          <span className='text-muted'>
            Total entries
          </span>
          <span className='fw-bold'>{total}</span>
        </div>

      </div>
    </div>
  )
}

// ✅ Secondary Status Chart
export function SecondaryStatusChart({ data }) {
  return (
    <BarChart
      title='🟡 Special Conditions'
      data={data}
      configMap={SECONDARY_CONFIG}
    />
  )
}

// ✅ Primary Status Chart
export function PrimaryStatusChart({ data }) {
  return (
    <BarChart
      title='🔵 Primary Status'
      data={data}
      configMap={PRIMARY_CONFIG}
    />
  )
}

// ✅ Export base for custom use
export default BarChart
