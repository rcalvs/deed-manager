import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AiOutlineStock } from "react-icons/ai"
import { FaBell, FaCalendarAlt, FaStickyNote } from "react-icons/fa"
import './App.css'
import { api } from './api'
import CalendarTab from './components/CalendarTab'
import EventsTab from './components/EventsTab'
import NotesTab from './components/NotesTab'
import NotificationCenter from './components/NotificationCenter'
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
  const [balance, setBalance] = useState(() => {
    return localStorage.getItem('wurm_balance') || ''
  })
  const [activeTab, setActiveTab] = useState('stock')
  const [version, setVersion] = useState('v0.2.5') // Fallback
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

  // Atualizar logsEnabled quando mudar no localStorage
  const [logsEnabled, setLogsEnabled] = useState(() => {
    return localStorage.getItem('wurm_logs_enabled') === 'true'
  })

  useEffect(() => {
    const checkLogsEnabled = () => {
      const enabled = localStorage.getItem('wurm_logs_enabled') === 'true'
      setLogsEnabled(enabled)
    }

    // Verificar periodicamente (a cada 1 segundo)
    const interval = setInterval(checkLogsEnabled, 1000)

    return () => clearInterval(interval)
  }, [])

  // Atualizar Balance quando mudar
  useEffect(() => {
    const handleBalanceUpdate = () => {
      console.log('[App] Evento wurm-balance-updated recebido')
      const balanceValue = localStorage.getItem('wurm_balance')
      console.log('[App] Valor do localStorage:', balanceValue)
      
      if (balanceValue && balanceValue !== '') {
        // Verificar se é um número puro (sem letras)
        const isNumericOnly = /^\d+$/.test(balanceValue.trim())
        
        if (isNumericOnly) {
          // Se for um número puro, converter para formato de moeda
          const numValue = parseInt(balanceValue, 10)
          if (!isNaN(numValue)) {
            // Converter para formato legível (assumindo que está em iron)
            const gold = Math.floor(numValue / 1000000)
            const silver = Math.floor((numValue % 1000000) / 10000)
            const copper = Math.floor((numValue % 10000) / 100)
            const iron = numValue % 100
            
            const parts = []
            if (gold > 0) parts.push(`${gold}g`)
            if (silver > 0) parts.push(`${silver}s`)
            if (copper > 0) parts.push(`${copper}c`)
            if (iron > 0) parts.push(`${iron}i`)
            
            const formatted = parts.length > 0 ? parts.join(', ') : '0i'
            console.log('[App] Balance formatado de número:', formatted)
            setBalance(formatted)
            localStorage.setItem('wurm_balance', formatted)
          } else {
            console.log('[App] Balance numérico inválido, usando valor direto:', balanceValue)
            setBalance(balanceValue)
          }
        } else {
          // Já está formatado (ex: "2s, 5c, 41i")
          console.log('[App] Balance já está formatado:', balanceValue)
          setBalance(balanceValue)
        }
      } else {
        console.log('[App] Balance vazio, definindo como string vazia')
        setBalance('')
      }
    }

    window.addEventListener('wurm-balance-updated', handleBalanceUpdate)
    handleBalanceUpdate() // Carregar inicialmente

    return () => {
      window.removeEventListener('wurm-balance-updated', handleBalanceUpdate)
    }
  }, [])

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
    {
      id: 'calendar',
      label: t('app.tabs.calendar', { defaultValue: 'Calendar' }),
      icon: <FaCalendarAlt />,
    },
    {
      id: 'events',
      label: t('app.tabs.events', { defaultValue: 'Events' }),
      icon: <FaBell />,
      disabled: !logsEnabled,
      tooltip: !logsEnabled ? t('events.disabled.tooltip', { defaultValue: 'Habilite "Allow Logs Communications" nas configurações para usar esta aba' }) : null,
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
            <div className="header-info">
              {deedName && (
                <span className="deed-name">{t('app.deed')}: {deedName}</span>
              )}
              {balance && (
                <span className="balance-name">{t('app.balance', { defaultValue: 'Balance' })}: {balance}</span>
              )}
            </div>
          </div>
          <div className="header-actions">
            <span className="version">{version}</span>
            <NotificationCenter />
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
          {activeTab === 'calendar' && <CalendarTab developerMode={developerMode} />}
          {activeTab === 'events' && <EventsTab />}
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

