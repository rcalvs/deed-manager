import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FaBell, FaChevronDown, FaChevronUp } from 'react-icons/fa'
import { api } from '../api'
import { eventsPollingService } from '../services/EventsPollingService'
import AlarmConfigModal from './AlarmConfigModal'
import './EventsTab.css'
import LogsConfigModal from './LogsConfigModal'

const LOGS_ENABLED_KEY = 'wurm_logs_enabled'
const TRADE_ENABLED_KEY = 'wurm_trade_enabled'
const EVENTS_ENABLED_KEY = 'wurm_event_enabled'
const ALARM_KEYWORDS_KEY = 'wurm_trade_alarm_keywords'
const ALARM_ENABLED_KEY = 'wurm_trade_alarm_enabled'
const ALARM_VOLUME_KEY = 'wurm_trade_alarm_volume'
const EVENTS_ALARM_KEYWORDS_KEY = 'wurm_event_alarm_keywords'
const EVENTS_ALARM_ENABLED_KEY = 'wurm_event_alarm_enabled'
const EVENTS_ALARM_VOLUME_KEY = 'wurm_event_alarm_volume'

function EventsTab() {
  const { t } = useTranslation()
  const [logsEnabled, setLogsEnabled] = useState(() => {
    return localStorage.getItem(LOGS_ENABLED_KEY) === 'true'
  })
  const [tradeEnabled, setTradeEnabled] = useState(() => {
    return localStorage.getItem(TRADE_ENABLED_KEY) === 'true'
  })
  const [tradeExpanded, setTradeExpanded] = useState(false)
  const [eventsExpanded, setEventsExpanded] = useState(false)
  const [tradeMessages, setTradeMessages] = useState([])
  const [eventsEnabled, setEventsEnabled] = useState(() => {
    return localStorage.getItem(EVENTS_ENABLED_KEY) === 'true'
  })
  const [eventsMessages, setEventsMessages] = useState([])
  const [eventsAlarmConfig, setEventsAlarmConfig] = useState(() => {
    return {
      keywords: localStorage.getItem(EVENTS_ALARM_KEYWORDS_KEY) || '',
      enabled: localStorage.getItem(EVENTS_ALARM_ENABLED_KEY) === 'true',
      volume: parseInt(localStorage.getItem(EVENTS_ALARM_VOLUME_KEY) || '50', 10)
    }
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isAlarmModalOpen, setIsAlarmModalOpen] = useState(false)
  const [isEventsAlarmModalOpen, setIsEventsAlarmModalOpen] = useState(false)
  const [isLogsConfigModalOpen, setIsLogsConfigModalOpen] = useState(false)
  const [pendingToggle, setPendingToggle] = useState(null) // 'trade' ou 'events'
  const [alarmConfig, setAlarmConfig] = useState(() => {
    return {
      keywords: localStorage.getItem(ALARM_KEYWORDS_KEY) || '',
      enabled: localStorage.getItem(ALARM_ENABLED_KEY) === 'true',
      volume: parseInt(localStorage.getItem(ALARM_VOLUME_KEY) || '50', 10)
    }
  })
  const messagesEndRef = useRef(null)
  const eventsMessagesEndRef = useRef(null)

  // Assinar serviço de polling global (lê Trade/Events mesmo com aba inativa)
  const onTradeUpdate = useCallback((messages) => setTradeMessages(messages || []), [])
  const onEventsUpdate = useCallback((messages) => setEventsMessages(messages || []), [])

  useEffect(() => {
    if (tradeEnabled) {
      eventsPollingService.addTradeListener(onTradeUpdate)
      return () => eventsPollingService.removeTradeListener(onTradeUpdate)
    } else {
      setTradeMessages([])
    }
  }, [tradeEnabled, onTradeUpdate])

  useEffect(() => {
    if (eventsEnabled) {
      eventsPollingService.addEventsListener(onEventsUpdate)
      return () => eventsPollingService.removeEventsListener(onEventsUpdate)
    } else {
      setEventsMessages([])
    }
  }, [eventsEnabled, onEventsUpdate])

  // Verificar se logs estão habilitados
  useEffect(() => {
    const checkLogsEnabled = () => {
      const enabled = localStorage.getItem(LOGS_ENABLED_KEY) === 'true'
      setLogsEnabled(enabled)
      if (!enabled) {
        if (tradeEnabled) {
          setTradeEnabled(false)
          localStorage.setItem(TRADE_ENABLED_KEY, 'false')
        }
        if (eventsEnabled) {
          setEventsEnabled(false)
          localStorage.setItem(EVENTS_ENABLED_KEY, 'false')
        }
      }
    }

    checkLogsEnabled()
    const interval = setInterval(checkLogsEnabled, 1000)
    return () => clearInterval(interval)
  }, [tradeEnabled, eventsEnabled])

  // Scroll automático
  useEffect(() => {
    if (messagesEndRef.current && tradeExpanded) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [tradeMessages, tradeExpanded])

  useEffect(() => {
    if (eventsMessagesEndRef.current && eventsExpanded) {
      eventsMessagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [eventsMessages, eventsExpanded])

  // Atualizar configurações de alarme
  useEffect(() => {
    const checkAlarmConfig = () => {
      const keywords = localStorage.getItem(ALARM_KEYWORDS_KEY) || ''
      const enabled = localStorage.getItem(ALARM_ENABLED_KEY) === 'true'
      const volume = parseInt(localStorage.getItem(ALARM_VOLUME_KEY) || '50', 10)
      setAlarmConfig({ keywords, enabled, volume })
      
      const eventsKeywords = localStorage.getItem(EVENTS_ALARM_KEYWORDS_KEY) || ''
      const eventsEnabled = localStorage.getItem(EVENTS_ALARM_ENABLED_KEY) === 'true'
      const eventsVolume = parseInt(localStorage.getItem(EVENTS_ALARM_VOLUME_KEY) || '50', 10)
      setEventsAlarmConfig({ keywords: eventsKeywords, enabled: eventsEnabled, volume: eventsVolume })
    }

    const interval = setInterval(checkAlarmConfig, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleTradeToggle = async (e) => {
    e.stopPropagation()
    const newValue = !tradeEnabled
    
    if (newValue) {
      // Verificar se logs estão habilitados
      if (!logsEnabled) {
        setError(t('events.logsNotEnabled', { defaultValue: 'Por favor, habilite "Allow Logs Communications" nas configurações primeiro.' }))
        return
      }
      
      // Verificar se o caminho dos logs está configurado
      try {
        const logsPath = await api.getLogsPath()
        if (!logsPath || logsPath.trim() === '') {
          // Abrir modal de configuração de logs
          setPendingToggle('trade')
          setIsLogsConfigModalOpen(true)
          return
        }
      } catch (err) {
        // Se houver erro ao obter o caminho, abrir modal
        setPendingToggle('trade')
        setIsLogsConfigModalOpen(true)
        return
      }
    }

    setTradeEnabled(newValue)
    localStorage.setItem(TRADE_ENABLED_KEY, newValue.toString())
    if (!newValue) setTradeMessages([])
  }

  const handleEventsToggle = async (e) => {
    e.stopPropagation()
    const newValue = !eventsEnabled
    
    if (newValue) {
      // Verificar se logs estão habilitados
      if (!logsEnabled) {
        setError(t('events.logsNotEnabled', { defaultValue: 'Por favor, habilite "Allow Logs Communications" nas configurações primeiro.' }))
        return
      }
      
      // Verificar se o caminho dos logs está configurado
      try {
        const logsPath = await api.getLogsPath()
        if (!logsPath || logsPath.trim() === '') {
          // Abrir modal de configuração de logs
          setPendingToggle('events')
          setIsLogsConfigModalOpen(true)
          return
        }
      } catch (err) {
        // Se houver erro ao obter o caminho, abrir modal
        setPendingToggle('events')
        setIsLogsConfigModalOpen(true)
        return
      }
    }

    setEventsEnabled(newValue)
    localStorage.setItem(EVENTS_ENABLED_KEY, newValue.toString())
    if (!newValue) setEventsMessages([])
  }

  const handleAlarmConfigSave = (config) => {
    setAlarmConfig(config)
  }

  const handleEventsAlarmConfigSave = (config) => {
    setEventsAlarmConfig(config)
  }

  if (!logsEnabled) {
    return (
      <div className="events-tab-container">
        <div className="events-disabled-message">
          <div className="events-disabled-icon">⚠️</div>
          <h3>{t('events.disabled.title', { defaultValue: 'Aba Events Desabilitada' })}</h3>
          <p>{t('events.disabled.message', { defaultValue: 'Para habilitar esta aba, você precisa:' })}</p>
          <ol>
            <li>{t('events.disabled.step1', { defaultValue: 'Ir em Configurações (ícone de engrenagem no canto superior direito)' })}</li>
            <li>{t('events.disabled.step2', { defaultValue: 'Ativar o toggle "Allow Logs Communications"' })}</li>
            <li>{t('events.disabled.step3', { defaultValue: 'Configurar o caminho dos logs do Wurm Online' })}</li>
          </ol>
        </div>
      </div>
    )
  }

  return (
    <div className="events-tab-container">
      <div className="events-content">
        {/* Bloco Trade - Dropdown */}
        <div className="event-block">
          <div className="event-block-header" onClick={() => setTradeExpanded(!tradeExpanded)}>
            <div className="event-block-title-section">
              <button className="event-expand-button">
                {tradeExpanded ? <FaChevronUp /> : <FaChevronDown />}
              </button>
              <h3>{t('events.trade.title', { defaultValue: 'Chat de Trade' })}</h3>
              {tradeEnabled && (
                <button
                  className="btn-alarm-config"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsAlarmModalOpen(true)
                  }}
                  title={t('events.alarm.configure', { defaultValue: 'Configurar Alarme' })}
                >
                  <FaBell />
                </button>
              )}
            </div>
            <label className="event-toggle" onClick={(e) => e.stopPropagation()}>
              <input
                type="checkbox"
                checked={tradeEnabled}
                onChange={handleTradeToggle}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
          
          {tradeExpanded && tradeEnabled && (
            <div className="event-block-content">
              {error && (
                <div className="event-error">
                  {error}
                </div>
              )}
              
              <div className="trade-messages-container">
                {tradeMessages.length === 0 && !loading && (
                  <div className="no-messages">
                    {t('events.trade.noMessages', { defaultValue: 'Nenhuma mensagem ainda. Aguardando novas mensagens...' })}
                  </div>
                )}
                
                {tradeMessages.map((message, index) => (
                  <div key={index} className="trade-message">
                    {message}
                  </div>
                ))}
                
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}
          
          {tradeExpanded && !tradeEnabled && (
            <div className="event-block-disabled">
              <p>{t('events.trade.disabled', { defaultValue: 'Ative o toggle acima para começar a ler mensagens de Trade em tempo real.' })}</p>
            </div>
          )}
        </div>

        {/* Bloco Events - Dropdown */}
        <div className="event-block">
          <div className="event-block-header" onClick={() => setEventsExpanded(!eventsExpanded)}>
            <div className="event-block-title-section">
              <button className="event-expand-button">
                {eventsExpanded ? <FaChevronUp /> : <FaChevronDown />}
              </button>
              <h3>{t('events.events.title', { defaultValue: 'Chat de Events' })}</h3>
              {eventsEnabled && (
                <button
                  className="btn-alarm-config"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsEventsAlarmModalOpen(true)
                  }}
                  title={t('events.alarm.configure', { defaultValue: 'Configurar Alarme' })}
                >
                  <FaBell />
                </button>
              )}
            </div>
            <label className="event-toggle" onClick={(e) => e.stopPropagation()}>
              <input
                type="checkbox"
                checked={eventsEnabled}
                onChange={handleEventsToggle}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
          
          {eventsExpanded && eventsEnabled && (
            <div className="event-block-content">
              <div className="trade-messages-container">
                {eventsMessages.length === 0 && !loading && (
                  <div className="no-messages">
                    {t('events.events.noMessages', { defaultValue: 'Nenhuma mensagem ainda. Aguardando novas mensagens...' })}
                  </div>
                )}
                
                {eventsMessages.map((message, index) => (
                  <div key={index} className="trade-message">
                    {message}
                  </div>
                ))}
                
                <div ref={eventsMessagesEndRef} />
              </div>
            </div>
          )}
          
          {eventsExpanded && !eventsEnabled && (
            <div className="event-block-disabled">
              <p>{t('events.events.disabled', { defaultValue: 'Ative o toggle acima para começar a ler mensagens de Events em tempo real.' })}</p>
            </div>
          )}
        </div>
      </div>

      <AlarmConfigModal
        isOpen={isAlarmModalOpen}
        onClose={() => setIsAlarmModalOpen(false)}
        onSave={handleAlarmConfigSave}
        storagePrefix="wurm_trade_alarm"
      />
      
      <AlarmConfigModal
        isOpen={isEventsAlarmModalOpen}
        onClose={() => setIsEventsAlarmModalOpen(false)}
        onSave={handleEventsAlarmConfigSave}
        storagePrefix="wurm_event_alarm"
      />

      <LogsConfigModal
        isOpen={isLogsConfigModalOpen}
        onClose={() => {
          setIsLogsConfigModalOpen(false)
          setPendingToggle(null)
        }}
        onPathSet={async () => {
          setIsLogsConfigModalOpen(false)
          // Após configurar o caminho, verificar novamente e ativar o toggle que estava pendente
          try {
            const logsPath = await api.getLogsPath()
            if (logsPath && logsPath.trim() !== '') {
              // Ativar o toggle que estava sendo ativado quando o modal foi aberto
              if (pendingToggle === 'trade' && !tradeEnabled) {
                setTradeEnabled(true)
                localStorage.setItem(TRADE_ENABLED_KEY, 'true')
              } else if (pendingToggle === 'events' && !eventsEnabled) {
                setEventsEnabled(true)
                localStorage.setItem(EVENTS_ENABLED_KEY, 'true')
              }
            }
          } catch (err) {
            console.error('Erro ao verificar caminho dos logs após configuração:', err)
          }
          setPendingToggle(null)
        }}
      />
    </div>
  )
}

export default EventsTab
