const SECONDARY_STATUS = [
  { value: 'injured',
    label: 'Injured', icon: '🤕' },
  { value: 'chronic_illness',
    label: 'With Chronic Illness', icon: '💊' },
  { value: 'critical_condition',
    label: 'Critical Condition', icon: '🚨' },
  { value: 'senior_citizen',
    label: 'Senior Citizen', icon: '👴' },
  { value: 'pwd',
    label: 'Person with Disability', icon: '♿' },
  { value: 'pregnant',
    label: 'Pregnant Woman', icon: '🤰' },
  { value: 'infant_child',
    label: 'Infant / Child', icon: '👶' },
  { value: 'lactating',
    label: 'Lactating Mother', icon: '🍼' },
  { value: 'others',
    label: 'Others...', icon: '📝' }
]

export default function SecondaryStatus({
  selected,
  setSelected,
  othersText,
  setOthersText
}) {
  const toggle = (value) => {
    if (selected.includes(value)) {
      setSelected(
        selected.filter(s => s !== value)
      )
    } else {
      setSelected([...selected, value])
    }
  }

  return (
    <div>
      <label className='form-label fw-medium'
        style={{ fontSize: 13 }}
      >
        🟡 Special Conditions
        <span className='text-muted ms-1'
          style={{ fontSize: 11 }}
        >
          (select all that apply)
        </span>
      </label>

      {/* ✅ None option */}
      <div
        className={`px-3 py-2 rounded
          border mb-2 d-flex
          align-items-center gap-2`}
        style={{
          cursor: 'pointer',
          fontSize: 13,
          background: selected.length === 0
            ? '#d1fae5' : '#f8f9fa',
          borderColor: selected.length === 0
            ? '#22c55e' : '#dee2e6',
          color: selected.length === 0
            ? '#15803d' : '#6c757d',
        }}
        onClick={() => {
          setSelected([])
          setOthersText('')
        }}
      >
        <span>✅</span>
        <span className='fw-medium'>
          None — No special condition
        </span>
        {selected.length === 0 && (
          <span className='ms-auto
            fw-bold text-success'
          >
            ✓
          </span>
        )}
      </div>

      {/* Status options */}
      <div className='d-flex flex-wrap gap-2'>
        {SECONDARY_STATUS.map(status => {
          const isSelected =
            selected.includes(status.value)
          return (
            <div
              key={status.value}
              className='px-3 py-2 rounded
                border d-flex
                align-items-center gap-1'
              style={{
                cursor: 'pointer',
                fontSize: 12,
                background: isSelected
                  ? '#fff3cd' : '#f8f9fa',
                borderColor: isSelected
                  ? '#ffc107' : '#dee2e6',
                color: isSelected
                  ? '#856404' : '#6c757d',
                transition: 'all 0.15s'
              }}
              onClick={() =>
                toggle(status.value)
              }
            >
              <span>{status.icon}</span>
              <span>{status.label}</span>
              {isSelected && (
                <span className='ms-1
                  fw-bold'
                >
                  ✓
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* Others text */}
      {selected.includes('others') && (
        <div className='mt-2'>
          <input
            type='text'
            className='form-control
              form-control-sm'
            placeholder='Please specify...'
            value={othersText}
            onChange={(e) =>
              setOthersText(e.target.value)
            }
          />
        </div>
      )}

      {/* Selected summary */}
      {selected.length > 0 && (
        <div className='mt-2 p-2
          bg-warning bg-opacity-10
          rounded border
          border-warning-subtle'
        >
          <div className='text-muted mb-1'
            style={{ fontSize: 11 }}
          >
            Selected conditions:
          </div>
          <div className='d-flex
            flex-wrap gap-1'
          >
            {selected.map(s => {
              const found = SECONDARY_STATUS
                .find(x => x.value === s)
              return (
                <span
                  key={s}
                  className='badge
                    bg-warning text-dark'
                >
                  {found?.icon} {found?.label}
                  {s === 'others' &&
                   othersText
                    ? `: ${othersText}`
                    : ''
                  }
                </span>
              )
            })}
          </div>
        </div>
      )}

    </div>
  )
}