import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AiOutlineStock } from "react-icons/ai"
import { FaStickyNote } from "react-icons/fa"
import './App.css'
import { api } from './api'
import NotesTab from './components/NotesTab'
import Settings from './components/Settings'
import StockTab from './components/StockTab'
import Tabs from './components/Tabs'
import WelcomeScreen from './components/WelcomeScreen'

function App() {
  const { t } = useTranslation()
  const [showWelcome, setShowWelcome] = useState(() => {
    // Verificar se já foi configurado (nome do Deed ou skip)
    const deedName = localStorage.getItem('deedName')
    const welcomeCompleted = localStorage.getItem('welcomeCompleted')
    return !welcomeCompleted && deedName === null
  })
  const [deedName, setDeedName] = useState(() => {
    return localStorage.getItem('deedName') || ''
  })
  const [activeTab, setActiveTab] = useState('stock')
  const [version, setVersion] = useState('v0.2.3') // Fallback
  const [developerMode, setDeveloperMode] = useState(() => {
    // Carregar do localStorage
    const saved = localStorage.getItem('developerMode')
    return saved === 'true'
  })

  // Carregar versão do backend
  useEffect(() => {
    const loadVersion = async () => {
      try {
        const v = await api.getAppVersion()
        if (v && v !== 'unknown') {
          setVersion(`v${v}`)
        }
      } catch (error) {
        console.error('Erro ao carregar versão:', error)
      }
    }
    loadVersion()
  }, [])

  // Salvar no localStorage quando mudar
  useEffect(() => {
    localStorage.setItem('developerMode', developerMode.toString())
  }, [developerMode])

  const handleWelcomeComplete = (name) => {
    setDeedName(name)
    localStorage.setItem('deedName', name)
    localStorage.setItem('welcomeCompleted', 'true')
    setShowWelcome(false)
  }

  const tabs = [
    {
      id: 'stock',
      label: t('app.tabs.stock'),
      icon: <AiOutlineStock />,
    },
    {
      id: 'notes',
      label: t('app.tabs.notes'),
      icon: <FaStickyNote />,
    },
  ]

  // Tratamento de erro para evitar crash da aplicação
  try {
    // Mostrar tela de boas-vindas se ainda não foi completada
    if (showWelcome) {
      return <WelcomeScreen onComplete={handleWelcomeComplete} />
    }

    return (
      <div className="app">
        <header className="app-header">
          <div className="header-title">
            <h1>{t('app.title')}</h1>
            {deedName && (
              <span className="deed-name">{t('app.deed')}: {deedName}</span>
            )}
          </div>
          <div className="header-actions">
            <span className="version">{version}</span>
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

