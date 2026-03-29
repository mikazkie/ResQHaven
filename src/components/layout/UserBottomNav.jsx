export default function UserBottomNav({ activeTab, onTabChange }) {
  const tabs = [
    { key: 'dashboard', label: 'Dashboard', icon: 'bi-grid-1x2' },
    { key: 'qr', label: 'QR', icon: 'bi-qr-code' },
    { key: 'profile', label: 'Profile', icon: 'bi-person' }
  ]

  return (
    <div className='user-bottom-nav'>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type='button'
          className={activeTab === tab.key ? 'active' : ''}
          onClick={() => onTabChange(tab.key)}
        >
          <i className={`bi ${tab.icon}`} />
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  )
}
