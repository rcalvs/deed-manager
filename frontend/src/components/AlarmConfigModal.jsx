import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FaTimes } from 'react-icons/fa'
import './AlarmConfigModal.css'

function AlarmConfigModal({ isOpen, onClose, onSave, storagePrefix = 'wurm_trade_alarm' }) {
  const { t } = useTranslation()
  const [keywords, setKeywords] = useState('')
  const [alarmEnabled, setAlarmEnabled] = useState(false)
  const [volume, setVolume] = useState(50) // 0-100

  // Carregar configurações salvas quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      const STORAGE_KEY = `${storagePrefix}_keywords`
      const STORAGE_ENABLED_KEY = `${storagePrefix}_enabled`
      const STORAGE_VOLUME_KEY = `${storagePrefix}_volume`
      
      const savedKeywords = localStorage.getItem(STORAGE_KEY) || ''
      const savedEnabled = localStorage.getItem(STORAGE_ENABLED_KEY) === 'true'
      const savedVolume = parseInt(localStorage.getItem(STORAGE_VOLUME_KEY) || '50', 10)
      setKeywords(savedKeywords)
      setAlarmEnabled(savedEnabled)
      setVolume(savedVolume)
    }
  }, [isOpen, storagePrefix])

  const handleKeywordsChange = (e) => {
    setKeywords(e.target.value)
  }

  const handleAlarmToggle = (e) => {
    setAlarmEnabled(e.target.checked)
  }

  const handleVolumeChange = (e) => {
    setVolume(parseInt(e.target.value, 10))
  }

  const handleTestAlarm = () => {
    try {
      // Criar um contexto de áudio
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      
      // Criar um oscilador para gerar um bip
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      // Configurar o som (bip agudo)
      oscillator.frequency.value = 800 // Frequência em Hz
      oscillator.type = 'sine'
      
      // Configurar volume baseado no valor do slider (0-100 -> 0-0.3)
      const volumeLevel = (volume / 100) * 0.3
      gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(volumeLevel, audioContext.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
      
      // Tocar o som
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.2)
    } catch (err) {
      console.error('Erro ao tocar alarme de teste:', err)
    }
  }

  const handleSave = () => {
    const STORAGE_KEY = `${storagePrefix}_keywords`
    const STORAGE_ENABLED_KEY = `${storagePrefix}_enabled`
    const STORAGE_VOLUME_KEY = `${storagePrefix}_volume`
    
    // Salvar no localStorage
    localStorage.setItem(STORAGE_KEY, keywords.trim())
    localStorage.setItem(STORAGE_ENABLED_KEY, alarmEnabled.toString())
    localStorage.setItem(STORAGE_VOLUME_KEY, volume.toString())

    // Chamar callback
    if (onSave) {
      onSave({
        keywords: keywords.trim(),
        enabled: alarmEnabled,
        volume: volume
      })
    }

    onClose()
  }

  const handleClose = () => {
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="alarm-modal-overlay" onClick={handleClose}>
      <div className="alarm-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="alarm-modal-header">
          <h2>{t('events.alarm.title', { defaultValue: 'Configurar Alarme de Trade' })}</h2>
          <button className="alarm-modal-close" onClick={handleClose}>
            <FaTimes />
          </button>
        </div>

        <div className="alarm-modal-body">
          <div className="alarm-form">
            <div className="alarm-form-group">
              <label className="alarm-toggle-label">
                <input
                  type="checkbox"
                  checked={alarmEnabled}
                  onChange={handleAlarmToggle}
                />
                <span className="toggle-slider"></span>
                <span className="toggle-label-text">
                  {t('events.alarm.enable', { defaultValue: 'Ativar alarme' })}
                </span>
              </label>
            </div>

            <div className="alarm-form-group">
              <label>{t('events.alarm.keywordsLabel', { defaultValue: 'Quando a Mensagem abaixo for enviada' })}</label>
              <input
                type="text"
                value={keywords}
                onChange={handleKeywordsChange}
                placeholder={t('events.alarm.keywordsPlaceholder', { defaultValue: 'Exemplo: shovel, pickaxe, iron' })}
                className="alarm-input"
                disabled={!alarmEnabled}
              />
              <p className="alarm-hint">
                {t('events.alarm.keywordsHint', { defaultValue: 'Separe múltiplas palavras por vírgula. O alarme será ativado se qualquer uma das palavras aparecer na mensagem.' })}
              </p>
            </div>

            <div className="alarm-form-group">
              <label>{t('events.alarm.volumeLabel', { defaultValue: 'Volume do Alarme' })}</label>
              <div className="alarm-volume-control">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="alarm-volume-slider"
                  disabled={!alarmEnabled}
                />
                <span className="alarm-volume-value">{volume}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="alarm-modal-footer">
          <button 
            className="btn-alarm-test"
            onClick={handleTestAlarm}
            disabled={!alarmEnabled}
            title={t('events.alarm.testTooltip', { defaultValue: 'Testar som do alarme' })}
          >
            {t('events.alarm.test', { defaultValue: 'Testar' })}
          </button>
          <div className="alarm-footer-actions">
            <button 
              className="btn-alarm-cancel"
              onClick={handleClose}
            >
              {t('common.cancel', { defaultValue: 'Cancelar' })}
            </button>
            <button 
              className="btn-alarm-save"
              onClick={handleSave}
            >
              {t('common.save', { defaultValue: 'Salvar' })}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AlarmConfigModal

