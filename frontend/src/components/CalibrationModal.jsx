import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FaTimes } from 'react-icons/fa'
import { calculateEpochFromCalibration, parseTimeCommand } from '../utils/wurmTime'
import './CalibrationModal.css'

const STORAGE_KEY = 'wurm_calibrated_epoch'

function CalibrationModal({ isOpen, onClose, onCalibrate }) {
  const { t } = useTranslation()
  const [pcDateTime, setPcDateTime] = useState('')
  const [timeCommand, setTimeCommand] = useState('')
  const [error, setError] = useState('')
  const [calibrationResult, setCalibrationResult] = useState(null)

  // Atualizar data/hora do PC quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      updatePcDateTime()
      setTimeCommand('')
      setError('')
      setCalibrationResult(null)
    }
  }, [isOpen])

  const updatePcDateTime = () => {
    const now = new Date()
    // Formato: YYYY-MM-DDTHH:mm:ss
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const seconds = String(now.getSeconds()).padStart(2, '0')
    setPcDateTime(`${year}-${month}-${day}T${hours}:${minutes}:${seconds}`)
  }

  // Formatar data/hora de forma legível
  const formatPcDateTime = () => {
    if (!pcDateTime) return ''
    try {
      const date = new Date(pcDateTime)
      // Formato legível: DD/MM/YYYY HH:mm:ss
      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const year = date.getFullYear()
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')
      return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`
    } catch (e) {
      return pcDateTime
    }
  }

  const handleTimeCommandChange = (e) => {
    const value = e.target.value
    setTimeCommand(value)
    setError('')
    setCalibrationResult(null)

    // Tentar parsear automaticamente quando o usuário colar
    if (value.trim()) {
      try {
        const parsed = parseTimeCommand(value)
        if (parsed) {
          // Calcular nova época
          const newEpoch = calculateEpochFromCalibration(
            new Date(pcDateTime),
            parsed.hour,
            parsed.minute,
            parsed.second,
            parsed.week,
            parsed.starfall,
            parsed.year
          )
          
          setCalibrationResult({
            newEpoch: newEpoch.toISOString(),
            wurmTime: parsed
          })
        }
      } catch (err) {
        setError(err.message)
      }
    }
  }

  const handleCalibrate = () => {
    if (!timeCommand.trim()) {
      setError(t('calendar.calibration.noTimeCommand', { defaultValue: 'Por favor, cole o resultado do comando /time' }))
      return
    }

    try {
      const parsed = parseTimeCommand(timeCommand)
      if (!parsed) {
        setError(t('calendar.calibration.invalidFormat', { defaultValue: 'Formato inválido. Use o formato: [HH:mm:ss] It is HH:mm:ss on day of the Wurm in week X of the starfall of the Y in the year of Z.' }))
        return
      }

      // Calcular nova época
      const newEpoch = calculateEpochFromCalibration(
        new Date(pcDateTime),
        parsed.hour,
        parsed.minute,
        parsed.second,
        parsed.week,
        parsed.starfall,
        parsed.year
      )

      // Salvar no localStorage
      localStorage.setItem(STORAGE_KEY, newEpoch.toISOString())

      // Chamar callback
      if (onCalibrate) {
        onCalibrate(newEpoch)
      }

      onClose()
    } catch (err) {
      setError(err.message || t('calendar.calibration.error', { defaultValue: 'Erro ao calibrar. Verifique os dados inseridos.' }))
    }
  }

  const handleReset = () => {
    if (confirm(t('calendar.calibration.resetConfirm', { defaultValue: 'Deseja resetar a calibração para o valor padrão?' }))) {
      localStorage.removeItem(STORAGE_KEY)
      if (onCalibrate) {
        onCalibrate(null) // null = usar época padrão
      }
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="calibration-modal-overlay" onClick={onClose}>
      <div className="calibration-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="calibration-modal-header">
          <h2>{t('calendar.calibration.title', { defaultValue: 'Calibrar Tempo do Wurm' })}</h2>
          <button className="calibration-modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="calibration-modal-body">
          <div className="calibration-instructions">
            <p>{t('calendar.calibration.instructions', { defaultValue: 'Para calibrar o tempo do Wurm, execute o comando /time no jogo e cole o resultado abaixo.' })}</p>
            <textarea
                value={timeCommand}
                onChange={handleTimeCommandChange}
                placeholder={t('calendar.calibration.example', { defaultValue: 'Cole aqui o resultado do comando /time do jogo...' })}
                className="calibration-textarea"
                rows={3}
              />
          </div>

          <div className="calibration-form">
            <div className="calibration-form-group">
              <label>{t('calendar.calibration.pcDateTime', { defaultValue: 'Data/Hora do PC' })}</label>
              <textarea
                value={formatPcDateTime()}
                disabled
                className="calibration-textarea-disabled"
                rows={1}
              />
            </div>

            {error && (
              <div className="calibration-error">
                {error}
              </div>
            )}

            {calibrationResult && (
              <div className="calibration-result">
                <h4>{t('calendar.calibration.result', { defaultValue: 'Resultado da Calibração' })}</h4>
                <div className="calibration-result-details">
                  <div className="calibration-result-item">
                    <span className="calibration-result-label">{t('calendar.calibration.newEpoch', { defaultValue: 'Nova Época' })}:</span>
                    <span className="calibration-result-value">{calibrationResult.newEpoch}</span>
                  </div>
                  <div className="calibration-result-item">
                    <span className="calibration-result-label">{t('calendar.calibration.wurmTime', { defaultValue: 'Tempo Wurm' })}:</span>
                    <span className="calibration-result-value">
                      {String(calibrationResult.wurmTime.hour).padStart(2, '0')}:
                      {String(calibrationResult.wurmTime.minute).padStart(2, '0')}:
                      {String(calibrationResult.wurmTime.second).padStart(2, '0')} - 
                      Semana {calibrationResult.wurmTime.week} - 
                      {calibrationResult.wurmTime.starfall} - 
                      Ano {calibrationResult.wurmTime.year}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="calibration-modal-footer">
          <div className="calibration-footer-actions">
            <button 
              className="btn-calibration-reset"
              onClick={handleReset}
            >
              {t('calendar.calibration.reset', { defaultValue: 'Resetar' })}
            </button>
            <button 
              type="button" 
              className="btn-calibration-update-time"
              onClick={updatePcDateTime}
            >
              {t('calendar.calibration.updateTime', { defaultValue: 'Atualizar' })}
            </button>
          </div>

          <div className="calibration-footer-actions">
            <button 
              className="btn-calibration-cancel"
              onClick={onClose}
            >
              {t('common.cancel', { defaultValue: 'Cancelar' })}
            </button>
            <button 
              className="btn-calibration-save"
              onClick={handleCalibrate}
              disabled={!timeCommand.trim() || !!error}
            >
              {t('calendar.calibration.calibrate', { defaultValue: 'Calibrar' })}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CalibrationModal

