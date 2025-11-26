import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { IoSettingsOutline } from 'react-icons/io5'
import { api } from '../api'
import LanguageSelector from './LanguageSelector'
import './Settings.css'
import UpdateChecker from './UpdateChecker'

function Settings({ developerMode, onDeveloperModeChange }) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  const handleClearDatabase = async () => {
    const confirmed = confirm(t('settings.clearDatabaseConfirm'))

    if (!confirmed) {
      return
    }

    // Confirmação dupla para segurança
    const doubleConfirmed = confirm(t('settings.clearDatabaseConfirm2'))

    if (!doubleConfirmed) {
      return
    }

    try {
      await api.clearDatabase()
      alert(t('settings.clearDatabaseSuccess'))
      // Recarregar a página para atualizar os dados
      window.location.reload()
    } catch (error) {
      console.error('Erro ao limpar banco:', error)
      alert(t('settings.clearDatabaseError'))
    }
  }

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleToggle = (e) => {
    e.stopPropagation()
    onDeveloperModeChange(!developerMode)
  }

  return (
    <div className="settings-container" ref={dropdownRef}>
      <button
        className="settings-button"
        onClick={() => setIsOpen(!isOpen)}
        title={t('settings.title')}
      >
        <IoSettingsOutline />
      </button>
      {isOpen && (
        <div className="settings-dropdown">
          <div className="settings-item">
            <div className="settings-toggle-container">
              <span className="settings-label">{t('settings.developerMode')}</span>
              <label className="settings-toggle">
                <input
                  type="checkbox"
                  checked={developerMode}
                  onChange={handleToggle}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
          <div className="settings-item">
            {developerMode && (
              <button 
                className="btn-clear-db"
                onClick={handleClearDatabase}
                title={t('settings.clearDatabase')}
              >
                {t('settings.clearDatabase')}
              </button>
            )}
          </div>
          <LanguageSelector />
          <UpdateChecker />
        </div>
      )}
    </div>
  )
}

export default Settings

