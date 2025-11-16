import React, { useEffect, useState } from 'react'
import { FaTimes } from 'react-icons/fa'
import { ITEM_TYPE_LABELS } from '../constants'
import './ConvertModal.css'

function ConvertModal({ isOpen, onClose, item, onConvert, maxQuantity }) {
  const [quantity, setQuantity] = useState('')

  useEffect(() => {
    if (isOpen) {
      setQuantity('')
    }
  }, [isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    const qty = parseInt(quantity)
    
    if (isNaN(qty) || qty <= 0) {
      alert('Por favor, insira uma quantidade válida maior que zero.')
      return
    }
    
    if (qty > maxQuantity) {
      alert(`Quantidade não pode ser maior que ${maxQuantity.toLocaleString('pt-BR')}.`)
      return
    }

    onConvert(qty)
    onClose()
  }

  if (!isOpen) return null

  // Determinar o Lump correspondente ao Ore
  const getLumpType = (oreType) => {
    const oreToLump = {
      iron_ore: 'iron_lump',
      copper_ore: 'copper_lump',
      silver_ore: 'silver_lump',
      gold_ore: 'gold_lump',
      tin_ore: 'tin_lump',
      zinc_ore: 'zinc_lump',
      lead_ore: 'lead_lump',
    }
    const lumpType = oreToLump[oreType]
    return lumpType ? ITEM_TYPE_LABELS[lumpType] || lumpType : 'Lump'
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Converter Ore em Lump</h3>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-info">
            <p>
              <strong>Item:</strong> {ITEM_TYPE_LABELS[item?.type] || item?.type || 'N/A'}
            </p>
            <p>
              <strong>Qualidade:</strong> {item?.quality?.toFixed(1) || '0.0'}
            </p>
            <p>
              <strong>Disponível:</strong> {maxQuantity.toLocaleString('pt-BR')}
            </p>
            <p className="convert-info">
              <strong>Será convertido em:</strong> {getLumpType(item?.type)}</p>
          </div>
          <div className="form-group">
            <label htmlFor="convert-quantity">Quantidade a converter:</label>
            <input
              id="convert-quantity"
              type="number"
              min="1"
              max={maxQuantity}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Ex: 100"
              required
              autoFocus
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-confirm">
              Converter
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ConvertModal

