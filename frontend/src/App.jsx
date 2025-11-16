import React, { useEffect, useState } from 'react'
import { api } from './api'
import './App.css'
import StockChart from './components/StockChart'
import StockForm from './components/StockForm'
import StockTable from './components/StockTable'

function App() {
  const [items, setItems] = useState([])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

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
      console.log('[App] Carregando histórico...')
      const data = await api.getStockHistory(365) // Últimos 365 dias (1 ano) para ter mais dados
      console.log('[App] Histórico carregado:', data)
      setHistory(data || [])
    } catch (error) {
      console.error('[App] Erro ao carregar histórico:', error)
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

  const handleClearDatabase = async () => {
    const confirmed = confirm(
      '⚠️ ATENÇÃO: Esta ação irá apagar TODOS os dados do banco de dados!\n\n' +
      'Isso inclui:\n' +
      '- Todos os itens do estoque\n' +
      '- Todo o histórico\n\n' +
      'Esta ação NÃO pode ser desfeita!\n\n' +
      'Tem certeza que deseja continuar?'
    )

    if (!confirmed) {
      return
    }

    // Confirmação dupla para segurança
    const doubleConfirmed = confirm(
      '⚠️ ÚLTIMA CONFIRMAÇÃO ⚠️\n\n' +
      'Você está prestes a apagar TODOS os dados permanentemente.\n\n' +
      'Digite OK para confirmar ou Cancelar para abortar.'
    )

    if (!doubleConfirmed) {
      return
    }

    try {
      await api.clearDatabase()
      alert('✅ Banco de dados limpo com sucesso!')
      loadItems()
      loadHistory()
    } catch (error) {
      console.error('Erro ao limpar banco:', error)
      alert('❌ Erro ao limpar banco de dados')
    }
  }

  // Tratamento de erro para evitar crash da aplicação
  try {
    return (
      <div className="app">
        <header className="app-header">
          <h1>Wurm Manager - Gerenciamento de Estoque</h1>
          <div>
            <button 
              className="btn-clear-db"
              onClick={handleClearDatabase}
              title="Limpar todo o banco de dados"
            >
              Limpar
            </button>
            <span>v0.1.0</span>
          </div>
        </header>
        <div className="app-content">
          <div className="left-panel">
            <StockForm 
              onItemAdded={handleItemAdded}
              onItemRemoved={handleItemRemoved}
            />
            <StockTable 
              items={items || []}
              loading={loading}
              onItemDeleted={handleItemDeleted}
            />
          </div>
          <div className="right-panel">
            <StockChart history={history || []} items={items || []} />
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('[App] Erro ao renderizar:', error)
    return (
      <div className="app">
        <div style={{ padding: '2rem', color: '#ff6b6b', textAlign: 'center' }}>
          <h2>Erro ao carregar aplicação</h2>
          <p>{error.message}</p>
          <p style={{ fontSize: '0.9rem', marginTop: '1rem' }}>
            Verifique o console para mais detalhes.
          </p>
        </div>
      </div>
    )
  }
}

export default App

