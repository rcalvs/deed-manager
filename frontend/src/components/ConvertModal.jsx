import React, { useEffect, useState } from 'react'
import { FaTimes } from 'react-icons/fa'
import { ITEM_TYPE_LABELS } from '../constants'
import './ConvertModal.css'

function ConvertModal({ isOpen, onClose, item, onConvert, maxQuantity, convertType = 'ore' }) {
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

  // Determinar o tipo de destino e informações da conversão
  const getConversionInfo = () => {
    const itemType = item?.type || ''
    
    switch (convertType) {
      case 'ore': {
        const oreToLump = {
          iron_ore: 'iron_lump',
          copper_ore: 'copper_lump',
          silver_ore: 'silver_lump',
          gold_ore: 'gold_lump',
          tin_ore: 'tin_lump',
          zinc_ore: 'zinc_lump',
          lead_ore: 'lead_lump',
        }
        const lumpType = oreToLump[itemType]
        return {
          title: 'Converter Ore em Lump',
          targetType: lumpType ? ITEM_TYPE_LABELS[lumpType] || lumpType : 'Lump',
          ratio: '1:1',
          targetQuantity: quantity ? parseInt(quantity) : 0
        }
      }
      case 'log-plank': {
        const woodType = itemType.replace('_log', '')
        return {
          title: 'Converter Log em Plank',
          targetType: ITEM_TYPE_LABELS[`${woodType}_plank`] || `${woodType} Plank`,
          ratio: '1:6',
          targetQuantity: quantity ? parseInt(quantity) * 6 : 0
        }
      }
      case 'log-shaft': {
        const woodType = itemType.replace('_log', '')
        return {
          title: 'Converter Log em Shaft',
          targetType: ITEM_TYPE_LABELS[`${woodType}_shaft`] || `${woodType} Shaft`,
          ratio: '1:12',
          targetQuantity: quantity ? parseInt(quantity) * 12 : 0
        }
      }
      case 'shaft-peg': {
        const woodType = itemType.replace('_shaft', '')
        return {
          title: 'Converter Shaft em Peg',
          targetType: ITEM_TYPE_LABELS[`${woodType}_peg`] || `${woodType} Peg`,
          ratio: '1:10',
          targetQuantity: quantity ? parseInt(quantity) * 10 : 0
        }
      }
      default:
        return {
          title: 'Converter Item',
          targetType: 'Item',
          ratio: '1:1',
          targetQuantity: quantity ? parseInt(quantity) : 0
        }
    }
  }

  const conversionInfo = getConversionInfo()

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{conversionInfo.title}</h3>
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
              <strong>Será convertido em:</strong> {conversionInfo.targetType}
            </p>
            <p className="convert-info">
              <strong>Proporção:</strong> {conversionInfo.ratio}
            </p>
            {quantity && parseInt(quantity) > 0 && (
              <p className="convert-info">
                <strong>Quantidade resultante:</strong> {conversionInfo.targetQuantity.toLocaleString('pt-BR')}
              </p>
            )}
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

