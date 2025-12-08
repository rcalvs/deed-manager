import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FaTimes } from 'react-icons/fa'
import { api } from '../api'
import './LogsConfigModal.css'

const STORAGE_KEY = 'wurm_logs_path'

function LogsConfigModal({ isOpen, onClose, onPathSet }) {
  const { t } = useTranslation()
  const [logsPath, setLogsPath] = useState('')
  const [error, setError] = useState('')

  // Carregar caminho salvo quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      const savedPath = localStorage.getItem(STORAGE_KEY) || ''
      setLogsPath(savedPath)
      setError('')
    }
  }, [isOpen])

  const handlePathChange = (e) => {
    setLogsPath(e.target.value)
    setError('')
  }

  const handleSave = async () => {
    if (!logsPath.trim()) {
      setError(t('logs.pathRequired', { defaultValue: 'Por favor, informe o caminho dos logs' }))
      return
    }

    try {
      // Definir o caminho
      await api.setLogsPath(logsPath.trim())
      
      // Salvar no localStorage
      localStorage.setItem(STORAGE_KEY, logsPath.trim())

      // Chamar callback
      if (onPathSet) {
        onPathSet(logsPath.trim())
      }

      onClose()
    } catch (err) {
      console.error('Erro ao salvar caminho dos logs:', err)
      setError(err.message || t('logs.saveError', { defaultValue: 'Erro ao salvar o caminho dos logs. Verifique se o caminho está correto.' }))
    }
  }

  const handleClose = () => {
    setLogsPath('')
    setError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="logs-modal-overlay" onClick={handleClose}>
      <div className="logs-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="logs-modal-header">
          <h2>{t('logs.configTitle', { defaultValue: 'Configurar Leitura de Logs' })}</h2>
          <button className="logs-modal-close" onClick={handleClose}>
            <FaTimes />
          </button>
        </div>

        <div className="logs-modal-body">
          <div className="logs-instructions">
            <p>{t('logs.instructions', { defaultValue: 'Informe o caminho completo da pasta de logs do Wurm Online. Exemplo: /Users/klever/wurm/players/YourName/logs' })}</p>
          </div>

          <div className="logs-form">
            <div className="logs-form-group">
              <label>{t('logs.pathLabel', { defaultValue: 'Caminho dos Logs' })}</label>
              <input
                type="text"
                value={logsPath}
                onChange={handlePathChange}
                placeholder={t('logs.pathPlaceholder', { defaultValue: '/caminho/para/logs' })}
                className="logs-input"
              />
            </div>

            {error && (
              <div className="logs-error">
                {error}
              </div>
            )}
          </div>
        </div>

        <div className="logs-modal-footer">
          <button 
            className="btn-logs-cancel"
            onClick={handleClose}
          >
            {t('common.cancel', { defaultValue: 'Cancelar' })}
          </button>
          <button 
            className="btn-logs-save"
            onClick={handleSave}
            disabled={!logsPath.trim()}
          >
            {t('common.save', { defaultValue: 'Salvar' })}
          </button>
        </div>
      </div>
    </div>
  )
}

export default LogsConfigModal

