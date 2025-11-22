import React, { useState } from 'react'
import NotesSection from './NotesSection'
import LocationsSection from './LocationsSection'
import './NotesTab.css'

function NotesTab() {
  const [activeSection, setActiveSection] = useState('notes')

  return (
    <div className="notes-tab">
      <div className="notes-tab-header">
        <button
          className={`section-tab ${activeSection === 'notes' ? 'active' : ''}`}
          onClick={() => setActiveSection('notes')}
        >
          Notas
        </button>
        <button
          className={`section-tab ${activeSection === 'locations' ? 'active' : ''}`}
          onClick={() => setActiveSection('locations')}
        >
          Locais
        </button>
      </div>
      <div className="notes-tab-content">
        {activeSection === 'notes' && <NotesSection />}
        {activeSection === 'locations' && <LocationsSection />}
      </div>
    </div>
  )
}

export default NotesTab

