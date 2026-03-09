import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FaTimes } from 'react-icons/fa'
import { ITEM_TYPE_LABELS } from '../constants'
import './DeleteStockModal.css'

function DeleteStockModal({ isOpen, onClose, item, onConfirm }) {
  const { t } = useTranslation()
  const [newQuantity, setNewQuantity] = useState('0')

  useEffect(() => {
    if (isOpen && item) {
      setNewQuantity('0')
    }
  }, [isOpen, item])

  const handleSubmit = (e) => {
    e.preventDefault()
    const qty = parseInt(newQuantity, 10)

    if (isNaN(qty) || qty < 0) {
      alert(t('stock.deleteModal.invalidQuantity', { defaultValue: 'Insira uma quantidade válida (0 ou maior).' }))
      return
    }

    const currentQty = item?.quantity || 0
    if (qty > currentQty) {
      alert(t('stock.deleteModal.exceedsCurrent', { defaultValue: 'A nova quantidade não pode ser maior que o estoque atual.' }))
      return
    }

    onConfirm(qty)
    onClose()
  }

  if (!isOpen) return null

  const currentQty = item?.quantity || 0
  const itemLabel = ITEM_TYPE_LABELS[item?.type] || item?.type || 'N/A'

  return (
    <div className="modal-overlay delete-stock-modal-overlay" onClick={onClose}>
      <div className="modal-content delete-stock-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{t('stock.deleteModal.title', { defaultValue: 'Ajustar Estoque' })}</h3>
          <button type="button" className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-info">
            <p>
              <strong>{t('stock.itemType', { defaultValue: 'Item' })}:</strong> {itemLabel}
            </p>
            <p>
              <strong>{t('stock.quality', { defaultValue: 'Qualidade' })}:</strong> {item?.quality?.toFixed(1) || '0.0'}
            </p>
            <p>
              <strong>{t('stock.deleteModal.currentStock', { defaultValue: 'Estoque atual' })}:</strong> {currentQty.toLocaleString('pt-BR')}
            </p>
          </div>
          <div className="form-group">
            <label htmlFor="new-quantity">
              {t('stock.deleteModal.newStock', { defaultValue: 'Novo estoque' })}:
            </label>
            <input
              id="new-quantity"
              type="number"
              min="0"
              max={currentQty}
              value={newQuantity}
              onChange={(e) => setNewQuantity(e.target.value)}
              placeholder="0"
              required
              autoFocus
            />
            <span className="form-hint">
              {t('stock.deleteModal.hint', { defaultValue: 'Digite 0 para remover o item completamente.' })}
            </span>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              {t('common.cancel', { defaultValue: 'Cancelar' })}
            </button>
            <button type="submit" className="btn-confirm btn-confirm-delete">
              {t('stock.deleteModal.confirm', { defaultValue: 'Confirmar' })}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default DeleteStockModal
