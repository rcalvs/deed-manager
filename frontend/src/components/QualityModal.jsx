import React, { useEffect, useState } from 'react'
import { FaTimes } from 'react-icons/fa'
import './ConvertModal.css'
import './QualityModal.css'

const STORAGE_KEY = 'stock_default_quality'
const STORAGE_ENABLED_KEY = 'stock_use_default_quality'

function QualityModal({ isOpen, onClose, onSave }) {
  const [useDefault, setUseDefault] = useState(false)
  const [defaultQuality, setDefaultQuality] = useState('')

  useEffect(() => {
    if (isOpen) {
      // Carregar configurações salvas
      const savedUseDefault = localStorage.getItem(STORAGE_ENABLED_KEY) === 'true'
      const savedQuality = localStorage.getItem(STORAGE_KEY) || ''
      
      setUseDefault(savedUseDefault)
      setDefaultQuality(savedQuality)
    }
  }, [isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (useDefault) {
      const qualityNum = parseFloat(defaultQuality)
      
      if (isNaN(qualityNum) || qualityNum < 0 || qualityNum > 100) {
        alert('Qualidade deve ser um número entre 0 e 100')
        return
      }
      
      // Salvar no localStorage
      localStorage.setItem(STORAGE_KEY, defaultQuality)
      localStorage.setItem(STORAGE_ENABLED_KEY, 'true')
    } else {
      // Desabilitar QL padrão
      localStorage.setItem(STORAGE_ENABLED_KEY, 'false')
    }
    
    onSave(useDefault, useDefault ? defaultQuality : '')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content quality-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Configurar Qualidade Padrão</h3>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={useDefault}
                onChange={(e) => setUseDefault(e.target.checked)}
              />
              <span>Usar QL Padrão</span>
            </label>
            <p className="toggle-description">
              Quando ativado, o campo de qualidade será preenchido automaticamente com o valor padrão.
            </p>
          </div>
          
          {useDefault && (
            <div className="form-group">
              <label htmlFor="default-quality">Valor Padrão de Qualidade (0-100):</label>
              <input
                id="default-quality"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={defaultQuality}
                onChange={(e) => setDefaultQuality(e.target.value)}
                placeholder="Ex: 53.0"
                required={useDefault}
                autoFocus
              />
            </div>
          )}
          
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-confirm">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Função helper para obter o QL padrão do localStorage
export function getDefaultQuality() {
  const useDefault = localStorage.getItem(STORAGE_ENABLED_KEY) === 'true'
  if (!useDefault) return null
  
  const quality = localStorage.getItem(STORAGE_KEY)
  return quality ? parseFloat(quality) : null
}

// Função helper para verificar se o QL padrão está ativo
export function isDefaultQualityEnabled() {
  return localStorage.getItem(STORAGE_ENABLED_KEY) === 'true'
}

export default QualityModal

