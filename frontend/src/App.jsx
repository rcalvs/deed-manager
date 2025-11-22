import React, { useEffect, useState } from 'react'
import { AiOutlineStock } from "react-icons/ai"
import { FaStickyNote } from "react-icons/fa"
import './App.css'
import NotesTab from './components/NotesTab'
import Settings from './components/Settings'
import StockTab from './components/StockTab'
import Tabs from './components/Tabs'

function App() {
  const [activeTab, setActiveTab] = useState('stock')
  const [developerMode, setDeveloperMode] = useState(() => {
    // Carregar do localStorage
    const saved = localStorage.getItem('developerMode')
    return saved === 'true'
  })

  // Salvar no localStorage quando mudar
  useEffect(() => {
    localStorage.setItem('developerMode', developerMode.toString())
  }, [developerMode])

  const tabs = [
    {
      id: 'stock',
      label: 'Estoque',
      icon: <AiOutlineStock />,
    },
    {
      id: 'notes',
      label: 'Notas',
      icon: <FaStickyNote />,
    },
  ]

  // Tratamento de erro para evitar crash da aplicação
  try {
    return (
      <div className="app">
        <header className="app-header">
          <h1>Wurm Manager</h1>
          <div className="header-actions">
            <span className="version">v0.2.1</span>
            <Settings 
              developerMode={developerMode}
              onDeveloperModeChange={setDeveloperMode}
            />
          </div>
        </header>
        <Tabs 
          tabs={tabs} 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
        >
          {activeTab === 'stock' && <StockTab developerMode={developerMode} />}
          {activeTab === 'notes' && <NotesTab />}
        </Tabs>
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

