import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaCompress, FaExchangeAlt, FaExpand, FaSearch, FaTrashAlt } from "react-icons/fa";
import { api } from '../api';
import { CATEGORIES, ITEM_CATEGORIES, ITEM_TYPE_LABELS, isLog, isOre, isShaft } from '../constants';
import ConvertModal from './ConvertModal';
import './StockTable.css';

function StockTable({ items, loading, onItemDeleted, selectedCategory, searchText, onCategoryChange, onSearchChange }) {
  const { t } = useTranslation()
  const [convertModalOpen, setConvertModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [convertType, setConvertType] = useState(null) // 'ore', 'log-plank', 'log-shaft', 'shaft-peg'
  const [isExpanded, setIsExpanded] = useState(false)
  
  // Filtrar itens por categoria e texto de busca - DEVE estar antes de qualquer return
  const filteredItems = useMemo(() => {
    if (!items || items.length === 0) {
      return []
    }
    
    let filtered = items
    
    // Filtrar por categoria
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => {
        const category = item.category || ITEM_CATEGORIES[item.type]
        return category === selectedCategory
      })
    }
    
    // Filtrar por texto de busca
    if (searchText && searchText.trim() !== '') {
      const searchLower = searchText.toLowerCase().trim()
      filtered = filtered.filter(item => {
        const itemLabel = ITEM_TYPE_LABELS[item.type] || item.type || ''
        return itemLabel.toLowerCase().includes(searchLower)
      })
    }
    
    return filtered
  }, [items, selectedCategory, searchText])
  
  const handleDelete = async (id) => {
    console.log('[StockTable] handleDelete: Iniciando processo de deleção do item ID=', id)
    
    // Encontrar o item para mostrar informações no log
    const item = items.find(i => i.id === id)
    if (item) {
      console.log('[StockTable] handleDelete: Item encontrado:', {
        id: item.id,
        type: item.type,
        quality: item.quality,
        quantity: item.quantity
      })
    } else {
      console.warn('[StockTable] handleDelete: Item ID=', id, 'não encontrado na lista')
    }

    if (!confirm(t('stock.deleteConfirm'))) {
      console.log('[StockTable] handleDelete: Usuário cancelou a deleção do item ID=', id)
      return
    }

    console.log('[StockTable] handleDelete: Usuário confirmou, chamando API para deletar item ID=', id)

    try {
      await api.deleteStockItem(id)
      console.log('[StockTable] handleDelete: Item ID=', id, 'deletado com sucesso, atualizando lista')
      onItemDeleted()
    } catch (error) {
      console.error('[StockTable] handleDelete: Erro ao deletar item ID=', id, ':', error)
      console.error('[StockTable] handleDelete: Detalhes do erro:', {
        message: error.message,
        stack: error.stack,
        error: error
      })
      alert(`${t('stock.error')}: ${error.message || t('common.error')}`)
    }
  }

  const handleConvertClick = (item, type) => {
    setSelectedItem(item)
    setConvertType(type)
    setConvertModalOpen(true)
  }

  const handleConvert = async (quantity) => {
    try {
      switch (convertType) {
        case 'ore':
          await api.convertOreToLump(selectedItem.id, quantity)
          break
        case 'log-plank':
          await api.convertLogToPlank(selectedItem.id, quantity)
          break
        case 'log-shaft':
          await api.convertLogToShaft(selectedItem.id, quantity)
          break
        case 'shaft-peg':
          await api.convertShaftToPeg(selectedItem.id, quantity)
          break
        default:
          throw new Error('Tipo de conversão desconhecido')
      }
      onItemDeleted() // Atualizar lista após conversão
    } catch (error) {
      console.error('[StockTable] Erro ao converter:', error)
      alert(`Erro ao converter: ${error.message || 'Erro desconhecido'}`)
    }
  }

  if (loading) {
    return (
      <div className="stock-table-container">
        <h2>{t('stock.title')}</h2>
        <div className="loading">Carregando...</div>
      </div>
    )
  }

  if (!items || items.length === 0) {
    return (
      <div className="stock-table-container">
        <h2>{t('stock.title')}</h2>
        <div className="empty-state">{t('stock.noItems')}</div>
      </div>
    )
  }

  const renderTableContent = () => (
    <>
      <h2 className="table-title">{t('stock.title')}</h2>
      <div className="table-header">
        <div className="table-header-actions">
          <div className="table-filters">
            <div className="search-filter">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder={t('stock.searchPlaceholder')}
                value={searchText || ''}
                onChange={(e) => onSearchChange(e.target.value)}
                className="search-input"
                style={{ paddingLeft: '2rem' }}
              />
              {searchText && (
                <button
                  className="search-clear"
                  onClick={() => onSearchChange('')}
                  title={t('common.close')}
                >
                  ×
                </button>
              )}
            </div>
            <div className="category-filter">
              <label htmlFor="category-filter">{t('stock.category')}:</label>
              <select
                id="category-filter"
                value={selectedCategory || 'all'}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="category-select"
              >
                <option value="all">{t('stock.allCategories')}</option>
                {CATEGORIES.map(cat => {
                  const categoryKey = cat.toLowerCase()
                  const categoryLabel = t(`stock.categories.${categoryKey}`, { defaultValue: cat })
                  return (
                    <option key={cat} value={cat}>{categoryLabel}</option>
                  )
                })}
              </select>
            </div>
          </div>
          <button
            className="btn-expand"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? t('common.compress', { defaultValue: 'Compress' }) : t('common.expand', { defaultValue: 'Expand to fullscreen' })}
          >
            {isExpanded ? <FaCompress /> : <FaExpand />}
          </button>
        </div>
      </div>
      <div className="table-wrapper">
        <table className="stock-table">
          <thead>
            <tr>
              <th>{t('stock.category')}</th>
              <th>{t('stock.itemType')}</th>
              <th>{t('stock.quality')}</th>
              <th>{t('stock.quantity')}</th>
              <th>{t('common.actions', { defaultValue: 'Actions' })}</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty-state-row">
                  {searchText || selectedCategory !== 'all' 
                    ? t('stock.noItemsFiltered', { defaultValue: 'No items found with applied filters' })
                    : t('stock.noItems')}
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => {
                if (!item) return null
                const category = item.category || ITEM_CATEGORIES[item.type] || 'N/A'
                return (
                  <tr key={item.id}>
                    <td>
                      <span className="category-badge" data-category={category}>
                        {category}
                      </span>
                    </td>
                    <td>{ITEM_TYPE_LABELS[item.type] || item.type || 'N/A'}</td>
                    <td>{item.quality != null ? item.quality.toFixed(1) : '0.0'}</td>
                    <td>{item.quantity != null ? item.quantity.toLocaleString('pt-BR') : '0'}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(item.id)}
                          title={t('stock.removeItem')}
                        >
                          <FaTrashAlt color='#b0b0b0'/>
                        </button>
                        {isOre(item.type) && (
                          <button
                            className="btn-convert"
                            onClick={() => handleConvertClick(item, 'ore')}
                            title={t('convert.toLump', { defaultValue: 'Convert to Lump' })}
                          >
                            <FaExchangeAlt color='#5a9fd4'/>
                          </button>
                        )}
                        {isLog(item.type) && (
                          <>
                            <button
                              className="btn-convert"
                              onClick={() => handleConvertClick(item, 'log-plank')}
                              title={t('convert.toPlank', { defaultValue: 'Convert to Plank (1:6)' })}
                            >
                              <FaExchangeAlt color='#8b4513'/>
                            </button>
                            <button
                              className="btn-convert"
                              onClick={() => handleConvertClick(item, 'log-shaft')}
                              title={t('convert.toShaft', { defaultValue: 'Convert to Shaft (1:12)' })}
                            >
                              <FaExchangeAlt color='#cd853f'/>
                            </button>
                          </>
                        )}
                        {isShaft(item.type) && (
                          <button
                            className="btn-convert"
                            onClick={() => handleConvertClick(item, 'shaft-peg')}
                            title={t('convert.toPeg', { defaultValue: 'Convert to Peg (1:10)' })}
                          >
                            <FaExchangeAlt color='#d2b48c'/>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
      {selectedItem && (
        <ConvertModal
          isOpen={convertModalOpen}
          onClose={() => {
            setConvertModalOpen(false)
            setSelectedItem(null)
            setConvertType(null)
          }}
          item={selectedItem}
          onConvert={handleConvert}
          maxQuantity={selectedItem.quantity || 0}
          convertType={convertType}
        />
      )}
    </>
  )

  if (isExpanded) {
    return (
      <>
        <div className="stock-table-expanded-overlay" onClick={() => setIsExpanded(false)}>
          <div className="stock-table-container stock-table-expanded" onClick={(e) => e.stopPropagation()}>
            {renderTableContent()}
          </div>
        </div>
      </>
    )
  }

  return (
    <div className="stock-table-container">
      {renderTableContent()}
    </div>
  )
}

export default StockTable

