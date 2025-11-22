import React, { useEffect, useMemo, useState } from 'react'
import { FaChevronDown, FaChevronUp, FaEdit, FaPlus, FaSearch } from 'react-icons/fa'
import { api } from '../api'
import { ITEM_TYPES } from '../constants'
import QualityModal, { getDefaultQuality, isDefaultQualityEnabled } from './QualityModal'
import './StockForm.css'

function StockForm({ onItemAdded, onItemRemoved, developerMode = false }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isQualityModalOpen, setIsQualityModalOpen] = useState(false)
  const [itemType, setItemType] = useState('stone_brick')
  const [quality, setQuality] = useState('')
  const [quantity, setQuantity] = useState('')
  const [customDate, setCustomDate] = useState('')
  const [useCustomDate, setUseCustomDate] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [searchText, setSearchText] = useState('')

  // Filtrar itens baseado no texto de busca
  const filteredItems = useMemo(() => {
    if (!searchText.trim()) {
      return ITEM_TYPES
    }
    
    const searchLower = searchText.toLowerCase().trim()
    return ITEM_TYPES.filter((type) => {
      const labelLower = type.label.toLowerCase()
      const valueLower = type.value.toLowerCase()
      return labelLower.includes(searchLower) || valueLower.includes(searchLower)
    })
  }, [searchText])

  // Aplicar QL padrão quando o formulário abrir
  useEffect(() => {
    if (isOpen && isDefaultQualityEnabled() && !quality) {
      const defaultQl = getDefaultQuality()
      if (defaultQl !== null) {
        setQuality(defaultQl.toString())
      }
    }
  }, [isOpen, quality])

  const handleQualityModalSave = (useDefault, defaultValue) => {
    // Se o QL padrão foi ativado e não há valor no campo, aplicar
    if (useDefault && defaultValue && !quality) {
      setQuality(defaultValue)
    }
  }

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
      setQuantity('')
      setCustomDate('')
      setUseCustomDate(false)
      setSearchText('')
      // Manter o campo de qualidade se houver QL padrão configurado
      if (isDefaultQualityEnabled()) {
        const defaultQl = getDefaultQuality()
        if (defaultQl !== null) {
          setQuality(defaultQl.toString())
        } else {
          setQuality('')
        }
      } else {
        setQuality('')
      }
      showMessage('Item adicionado com sucesso!')
      onItemAdded()
      // Manter o formulário aberto para facilitar adição de mais itens
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
      setQuantity('')
      setSearchText('')
      // Manter o campo de qualidade se houver QL padrão configurado
      if (isDefaultQualityEnabled()) {
        const defaultQl = getDefaultQuality()
        if (defaultQl !== null) {
          setQuality(defaultQl.toString())
        } else {
          setQuality('')
        }
      } else {
        setQuality('')
      }
      showMessage('Item removido com sucesso!')
      onItemRemoved()
      // Manter o formulário aberto para facilitar novas operações
    } catch (error) {
      console.error('Erro ao remover item:', error)
      showMessage(error.message || 'Erro ao remover item', true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="stock-form-container">
      <button
        type="button"
        className="stock-form-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className="toggle-content">
          <FaPlus className="toggle-icon" />
          <span>Adicionar Estoque</span>
        </div>
        {isOpen ? <FaChevronUp /> : <FaChevronDown />}
      </button>
      
      {isOpen && (
        <div className="stock-form-dropdown">
          <form className="stock-form">
        <div className="form-group">
          <label htmlFor="itemType">Tipo de Item</label>
          <div className="search-select-container">
            <div className="search-input-wrapper">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Buscar item..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="search-input"
                disabled={loading}
              />
              {searchText && (
                <button
                  type="button"
                  className="search-clear"
                  onClick={() => setSearchText('')}
                  title="Limpar busca"
                >
                  ×
                </button>
              )}
            </div>
            <select
              id="itemType"
              value={itemType}
              onChange={(e) => setItemType(e.target.value)}
              disabled={loading}
            >
              {filteredItems.length > 0 ? (
                filteredItems.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))
              ) : (
                <option value="">Nenhum item encontrado</option>
              )}
            </select>
            {searchText && filteredItems.length > 0 && (
              <div className="search-results-count">
                {filteredItems.length} {filteredItems.length === 1 ? 'item encontrado' : 'itens encontrados'}
              </div>
            )}
          </div>
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
            <div className="quality-label-wrapper">
              <label htmlFor="quality">Qualidade (0-100)</label>
              <button
                type="button"
                className="quality-edit-btn"
                onClick={() => setIsQualityModalOpen(true)}
                title="Configurar QL padrão"
                disabled={loading}
              >
                <FaEdit />
              </button>
            </div>
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

        {developerMode && (
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
        )}

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
      )}
      
      <QualityModal
        isOpen={isQualityModalOpen}
        onClose={() => setIsQualityModalOpen(false)}
        onSave={handleQualityModalSave}
      />
    </div>
  )
}

export default StockForm

