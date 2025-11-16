import React, { useMemo, useState } from 'react';
import { FaTrashAlt } from "react-icons/fa";
import { api } from '../api';
import { CATEGORIES, ITEM_CATEGORIES, ITEM_TYPE_LABELS } from '../constants';
import './StockTable.css';

function StockTable({ items, loading, onItemDeleted }) {
  const [selectedCategory, setSelectedCategory] = useState('all')
  
  // Filtrar itens por categoria - DEVE estar antes de qualquer return
  const filteredItems = useMemo(() => {
    if (!items || items.length === 0) {
      return []
    }
    if (selectedCategory === 'all') {
      return items
    }
    return items.filter(item => {
      const category = item.category || ITEM_CATEGORIES[item.type]
      return category === selectedCategory
    })
  }, [items, selectedCategory])
  
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

    if (!confirm('Tem certeza que deseja remover este item do estoque?')) {
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
      alert(`Erro ao deletar item: ${error.message || 'Erro desconhecido'}`)
    }
  }

  if (loading) {
    return (
      <div className="stock-table-container">
        <h2>Estoque Atual</h2>
        <div className="loading">Carregando...</div>
      </div>
    )
  }

  if (!items || items.length === 0) {
    return (
      <div className="stock-table-container">
        <h2>Estoque Atual</h2>
        <div className="empty-state">Nenhum item no estoque</div>
      </div>
    )
  }

  return (
    <div className="stock-table-container">
      <div className="table-header">
        <h2>Estoque Atual</h2>
        <div className="category-filter">
          <label htmlFor="category-filter">Filtrar por categoria:</label>
          <select
            id="category-filter"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-select"
          >
            <option value="all">Todas</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="table-wrapper">
        <table className="stock-table">
          <thead>
            <tr>
              <th>Categoria</th>
              <th>Tipo</th>
              <th>Qualidade</th>
              <th>Quantidade</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty-state-row">
                  Nenhum item encontrado para a categoria selecionada
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
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(item.id)}
                        title="Remover item"
                      >
                        <FaTrashAlt color='#b0b0b0'/>
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default StockTable

