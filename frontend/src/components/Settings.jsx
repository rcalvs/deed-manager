import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { IoSettingsOutline } from 'react-icons/io5'
import { api } from '../api'
import LanguageSelector from './LanguageSelector'
import LogsConfigModal from './LogsConfigModal'
import './Settings.css'
import UpdateChecker from './UpdateChecker'

const LOGS_ENABLED_KEY = 'wurm_logs_enabled'

function Settings({ developerMode, onDeveloperModeChange }) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const [logsEnabled, setLogsEnabled] = useState(() => {
    return localStorage.getItem(LOGS_ENABLED_KEY) === 'true'
  })
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false)

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

  const handleLogsToggle = async (e) => {
    e.stopPropagation()
    const newValue = !logsEnabled
    
    if (newValue) {
      // Se está ativando, abrir modal
      setIsLogsModalOpen(true)
    } else {
      // Se está desativando, apenas atualizar estado
      setLogsEnabled(false)
      localStorage.setItem(LOGS_ENABLED_KEY, 'false')
    }
  }

  const handleLogsPathSet = () => {
    // Quando o caminho é definido com sucesso, ativar o toggle
    setLogsEnabled(true)
    localStorage.setItem(LOGS_ENABLED_KEY, 'true')
    setIsLogsModalOpen(false)
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
            <div className="settings-toggle-container">
              <span className="settings-label">{t('settings.allowLogsCommunications')}</span>
              <label className="settings-toggle">
                <input
                  type="checkbox"
                  checked={logsEnabled}
                  onChange={handleLogsToggle}
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

      <LogsConfigModal
        isOpen={isLogsModalOpen}
        onClose={() => setIsLogsModalOpen(false)}
        onPathSet={handleLogsPathSet}
      />
    </div>
  )
}

export default Settings

