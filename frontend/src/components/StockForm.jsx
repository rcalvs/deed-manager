import React, { useState } from 'react'
import { api } from '../api'
import { ITEM_TYPES } from '../constants'
import './StockForm.css'

function StockForm({ onItemAdded, onItemRemoved }) {
  const [itemType, setItemType] = useState('stone_brick')
  const [quality, setQuality] = useState('')
  const [quantity, setQuantity] = useState('')
  const [customDate, setCustomDate] = useState('')
  const [useCustomDate, setUseCustomDate] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const showMessage = (msg, isError = false) => {
    setMessage(msg)
    setTimeout(() => setMessage(''), 3000)
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    
    if (!quality || !quantity) {
      showMessage('Por favor, preencha todos os campos', true)
      return
    }

    const qualityNum = parseFloat(quality)
    const quantityNum = parseInt(quantity)

    if (isNaN(qualityNum) || qualityNum < 0 || qualityNum > 100) {
      showMessage('Qualidade deve ser um número entre 0 e 100', true)
      return
    }

    if (isNaN(quantityNum) || quantityNum <= 0) {
      showMessage('Quantidade deve ser um número positivo', true)
      return
    }

    setLoading(true)
    try {
      // Preparar data customizada se necessário
      // O input datetime-local retorna no formato "YYYY-MM-DDTHH:mm"
      // O backend aceita esse formato diretamente
      const dateString = useCustomDate && customDate ? customDate : ''
      
      await api.addStockItem(itemType, qualityNum, quantityNum, dateString)
      setQuality('')
      setQuantity('')
      setCustomDate('')
      setUseCustomDate(false)
      showMessage('Item adicionado com sucesso!')
      onItemAdded()
    } catch (error) {
      console.error('Erro ao adicionar item:', error)
      showMessage('Erro ao adicionar item', true)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (e) => {
    e.preventDefault()
    
    if (!quality || !quantity) {
      showMessage('Por favor, preencha todos os campos', true)
      return
    }

    const qualityNum = parseFloat(quality)
    const quantityNum = parseInt(quantity)

    if (isNaN(qualityNum) || qualityNum < 0 || qualityNum > 100) {
      showMessage('Qualidade deve ser um número entre 0 e 100', true)
      return
    }

    if (isNaN(quantityNum) || quantityNum <= 0) {
      showMessage('Quantidade deve ser um número positivo', true)
      return
    }

    setLoading(true)
    try {
      await api.removeStockItem(itemType, qualityNum, quantityNum)
      setQuality('')
      setQuantity('')
      showMessage('Item removido com sucesso!')
      onItemRemoved()
    } catch (error) {
      console.error('Erro ao remover item:', error)
      showMessage(error.message || 'Erro ao remover item', true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="stock-form-container">
      <h2>Gerenciar Estoque</h2>
      <form className="stock-form">
        <div className="form-group">
          <label htmlFor="itemType">Tipo de Item</label>
          <select
            id="itemType"
            value={itemType}
            onChange={(e) => setItemType(e.target.value)}
            disabled={loading}
          >
            {ITEM_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="quantity">Quantidade</label>
            <input
              type="number"
              id="quantity"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              disabled={loading}
              placeholder="Ex: 1000"
            />
          </div>

          <div className="form-group">
            <label htmlFor="quality">Qualidade (0-100)</label>
            <input
              type="number"
              id="quality"
              min="0"
              max="100"
              step="0.1"
              value={quality}
              onChange={(e) => setQuality(e.target.value)}
              disabled={loading}
              placeholder="Ex: 53"
            />
          </div>
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={useCustomDate}
              onChange={(e) => setUseCustomDate(e.target.checked)}
              disabled={loading}
            />
            {' '}Usar data customizada (para testar gráfico)
          </label>
          {useCustomDate && (
            <input
              type="datetime-local"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              disabled={loading}
              style={{ marginTop: '0.5rem', width: '100%' }}
            />
          )}
        </div>

        <div className="form-actions">
          <button
            type="submit"
            onClick={handleAdd}
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Processando...' : 'Adicionar'}
          </button>
          <button
            type="button"
            onClick={handleRemove}
            disabled={loading}
            className="btn btn-danger"
          >
            Remover
          </button>
        </div>

        {message && (
          <div className={`message ${message.includes('Erro') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}
      </form>
    </div>
  )
}

export default StockForm

