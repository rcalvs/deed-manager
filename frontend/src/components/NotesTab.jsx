import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import LocationsSection from './LocationsSection'
import NotesSection from './NotesSection'
import './NotesTab.css'

function NotesTab() {
  const { t } = useTranslation()
  const [activeSection, setActiveSection] = useState('notes')

  return (
    <div className="notes-tab">
      <div className="notes-tab-header">
        <button
          className={`section-tab ${activeSection === 'notes' ? 'active' : ''}`}
          onClick={() => setActiveSection('notes')}
        >
          {t('notes.sections.notes')}
        </button>
        <button
          className={`section-tab ${activeSection === 'locations' ? 'active' : ''}`}
          onClick={() => setActiveSection('locations')}
        >
          {t('notes.sections.locations')}
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

