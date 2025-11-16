import React from 'react'
import './Tabs.css'

function Tabs({ tabs, activeTab, onTabChange, children }) {
  return (
    <div className="tabs-container">
      <div className="tabs-header">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.icon}
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>
      <div className="tabs-content">
        {children}
      </div>
    </div>
  )
}

export default Tabs

