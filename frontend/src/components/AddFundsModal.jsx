import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FaTimes } from 'react-icons/fa'
import { convertToIron } from '../utils/deedParser'
import './AddFundsModal.css'

function AddFundsModal({ deed, isOpen, onClose, onSuccess }) {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [funds, setFunds] = useState({ gold: 0, silver: 0, copper: 0, iron: 0 })
  const [addToCoffers, setAddToCoffers] = useState(true)

  if (!isOpen || !deed) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    const amountIron = convertToIron(funds.gold, funds.silver, funds.copper, funds.iron)
    if (amountIron <= 0) return
    setLoading(true)
    try {
      const { api } = await import('../api')
      await api.addDeedFunds(deed.id, amountIron, addToCoffers)
      onSuccess?.()
      setFunds({ gold: 0, silver: 0, copper: 0, iron: 0 })
      onClose()
    } catch (err) {
      console.error('Erro ao adicionar fundos:', err)
      alert(err.message || t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className="add-funds-overlay" onClick={handleOverlayClick}>
      <div className="add-funds-modal" onClick={(e) => e.stopPropagation()}>
        <div className="add-funds-header">
          <h3>{t('deeds.addFundsTitle', { defaultValue: 'Adicionar fundos' })} – {deed.name || t('deeds.unnamed')}</h3>
          <button type="button" className="add-funds-close" onClick={onClose} aria-label={t('common.close')}>
            <FaTimes />
          </button>
        </div>
        <form className="add-funds-form" onSubmit={handleSubmit}>
          <div className="add-funds-row">
            <label>{t('deeds.gold')}</label>
            <input
              type="number"
              min="0"
              value={funds.gold || ''}
              onChange={(e) => setFunds((f) => ({ ...f, gold: parseInt(e.target.value, 10) || 0 }))}
            />
          </div>
          <div className="add-funds-row">
            <label>{t('deeds.silver')}</label>
            <input
              type="number"
              min="0"
              value={funds.silver || ''}
              onChange={(e) => setFunds((f) => ({ ...f, silver: parseInt(e.target.value, 10) || 0 }))}
            />
          </div>
          <div className="add-funds-row">
            <label>{t('deeds.copper')}</label>
            <input
              type="number"
              min="0"
              value={funds.copper || ''}
              onChange={(e) => setFunds((f) => ({ ...f, copper: parseInt(e.target.value, 10) || 0 }))}
            />
          </div>
          <div className="add-funds-row">
            <label>{t('deeds.iron')}</label>
            <input
              type="number"
              min="0"
              value={funds.iron || ''}
              onChange={(e) => setFunds((f) => ({ ...f, iron: parseInt(e.target.value, 10) || 0 }))}
            />
          </div>
          <div className="add-funds-destination">
            <label>{t('deeds.addFundsDestination', { defaultValue: 'Destino' })}</label>
            <div className="add-funds-radio-group">
              <label className="add-funds-radio">
                <input
                  type="radio"
                  name="destination"
                  checked={addToCoffers}
                  onChange={() => setAddToCoffers(true)}
                />
                {t('deeds.coffers')}
              </label>
              <label className="add-funds-radio">
                <input
                  type="radio"
                  name="destination"
                  checked={!addToCoffers}
                  onChange={() => setAddToCoffers(false)}
                />
                {t('deeds.upkeepChips')}
              </label>
            </div>
          </div>
          <div className="add-funds-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="btn-confirm"
              disabled={loading || (funds.gold === 0 && funds.silver === 0 && funds.copper === 0 && funds.iron === 0)}
            >
              {loading ? t('common.processing') : t('deeds.addFundsConfirm', { defaultValue: 'Adicionar' })}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddFundsModal
