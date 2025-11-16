import React, { useState, useEffect } from 'react'
import StockTable from './StockTable'
import StockForm from './StockForm'
import StockChart from './StockChart'
import { api } from '../api'

function StockTab({ developerMode = false }) {
  const [items, setItems] = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchText, setSearchText] = useState('')

  const loadItems = async () => {
    try {
      const data = await api.getStockItems()
      setItems(data || [])
    } catch (error) {
      console.error('Erro ao carregar itens:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadHistory = async () => {
    try {
      console.log('[StockTab] Carregando histórico...')
      const data = await api.getStockHistory(365)
      console.log('[StockTab] Histórico carregado:', data)
      setHistory(data || [])
    } catch (error) {
      console.error('[StockTab] Erro ao carregar histórico:', error)
    }
  }

  useEffect(() => {
    loadItems()
    loadHistory()
  }, [])

  const handleItemAdded = () => {
    loadItems()
    loadHistory()
  }

  const handleItemRemoved = () => {
    loadItems()
    loadHistory()
  }

  const handleItemDeleted = () => {
    loadItems()
    loadHistory()
  }

  return (
    <div className="stock-tab-content">
      <div className="left-panel">
        <StockForm 
          onItemAdded={handleItemAdded}
          onItemRemoved={handleItemRemoved}
          developerMode={developerMode}
        />
        <StockTable 
          items={items || []}
          loading={loading}
          onItemDeleted={handleItemDeleted}
          selectedCategory={selectedCategory}
          searchText={searchText}
          onCategoryChange={setSelectedCategory}
          onSearchChange={setSearchText}
        />
      </div>
      <div className="right-panel">
        <StockChart 
          history={history || []} 
          items={items || []}
          selectedCategory={selectedCategory}
          searchText={searchText}
        />
      </div>
    </div>
  )
}

export default StockTab

