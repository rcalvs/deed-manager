import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FaBell, FaChevronDown, FaChevronUp } from 'react-icons/fa'
import { api } from '../api'
import { calculateEpochFromCalibration, parseTimeCommand } from '../utils/wurmTime'
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
const POLLING_INTERVAL = 2000 // 2 segundos

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
  const pollingIntervalRef = useRef(null)
  const eventsPollingIntervalRef = useRef(null)
  const lastMessageCountRef = useRef(0)
  const lastCheckedMessagesRef = useRef(new Set())
  const lastEventsMessageCountRef = useRef(0)
  const lastCheckedEventsMessagesRef = useRef(new Set())

  // Função para tocar som de alarme
  const playAlarmSound = React.useCallback((volume) => {
    try {
      const volumeLevel = ((volume || 50) / 100) * 0.3
      
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = 800
      oscillator.type = 'sine'
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(volumeLevel, audioContext.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.2)
    } catch (err) {
      console.error('Erro ao tocar alarme:', err)
    }
  }, [])

  // Função para criar notificação
  const createNotification = React.useCallback((message) => {
    try {
      const notifications = JSON.parse(
        localStorage.getItem('wurm_notifications') || '[]'
      )
      
      const newNotification = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        message: message,
        timestamp: new Date().toISOString()
      }
      
      notifications.unshift(newNotification)
      const limited = notifications.slice(0, 100)
      
      localStorage.setItem('wurm_notifications', JSON.stringify(limited))
      window.dispatchEvent(new Event('wurm-new-notification'))
    } catch (err) {
      console.error('Erro ao criar notificação:', err)
    }
  }, [])

  // Função para converter moedas para iron (base)
  const convertToIron = React.useCallback((gold, silver, copper, iron) => {
    return (gold || 0) * 1000000 + (silver || 0) * 10000 + (copper || 0) * 100 + (iron || 0)
  }, [])

  // Função para converter iron para formato legível
  const formatBalance = React.useCallback((totalIron) => {
    const gold = Math.floor(totalIron / 1000000)
    const silver = Math.floor((totalIron % 1000000) / 10000)
    const copper = Math.floor((totalIron % 10000) / 100)
    const iron = totalIron % 100
    
    const parts = []
    if (gold > 0) parts.push(`${gold}g`)
    if (silver > 0) parts.push(`${silver}s`)
    if (copper > 0) parts.push(`${copper}c`)
    if (iron > 0) parts.push(`${iron}i`)
    
    return parts.length > 0 ? parts.join(', ') : '0i'
  }, [])

  // Função para parsear valores de moedas de uma string
  const parseCurrency = React.useCallback((text) => {
    let gold = 0, silver = 0, copper = 0, iron = 0
    
    // Padrões para formato abreviado: "1g, 32s, 45c, 21i"
    const abbreviatedPatterns = [
      { regex: /(\d+)\s*g\b/gi, type: 'gold' },
      { regex: /(\d+)\s*s\b/gi, type: 'silver' },
      { regex: /(\d+)\s*c\b/gi, type: 'copper' },
      { regex: /(\d+)\s*i\b/gi, type: 'iron' }
    ]
    
    // Padrões para formato por extenso: "1 gold, 32 silver, 45 copper, 21 iron"
    const fullPatterns = [
      { regex: /(\d+)\s+gold/gi, type: 'gold' },
      { regex: /(\d+)\s+silver/gi, type: 'silver' },
      { regex: /(\d+)\s+copper/gi, type: 'copper' },
      { regex: /(\d+)\s+iron/gi, type: 'iron' }
    ]
    
    // Tentar primeiro formato abreviado
    abbreviatedPatterns.forEach(({ regex, type }) => {
      const matches = Array.from(text.matchAll(regex))
      matches.forEach(match => {
        const value = parseInt(match[1], 10)
        if (type === 'gold') gold += value
        else if (type === 'silver') silver += value
        else if (type === 'copper') copper += value
        else if (type === 'iron') iron += value
      })
    })
    
    // Se não encontrou nada no formato abreviado, tentar formato por extenso
    if (gold === 0 && silver === 0 && copper === 0 && iron === 0) {
      fullPatterns.forEach(({ regex, type }) => {
        const matches = Array.from(text.matchAll(regex))
        matches.forEach(match => {
          const value = parseInt(match[1], 10)
          if (type === 'gold') gold += value
          else if (type === 'silver') silver += value
          else if (type === 'copper') copper += value
          else if (type === 'iron') iron += value
        })
      })
    }
    
    return { gold, silver, copper, iron }
  }, [])

  // Função para obter balance atual do localStorage
  const getCurrentBalance = React.useCallback(() => {
    const balanceStr = localStorage.getItem('wurm_balance') || '0i'
    const parsed = parseCurrency(balanceStr)
    return convertToIron(parsed.gold, parsed.silver, parsed.copper, parsed.iron)
  }, [parseCurrency, convertToIron])

  // Função para atualizar Balance no header
  const updateBalance = React.useCallback((message) => {
    let newBalance = null
    let shouldNotify = false
    
    // Padrão 1: "Bank balance: 1g, 32s, 45c, 21i"
    const bankBalanceMatch = message.match(/[Bb]ank\s+balance[:\s]+(.+?)(?:\.|$)/i)
    if (bankBalanceMatch) {
      const currencyStr = bankBalanceMatch[1]
      const parsed = parseCurrency(currencyStr)
      newBalance = convertToIron(parsed.gold, parsed.silver, parsed.copper, parsed.iron)
    }
    
    // Padrão 2: "You now have 1 gold, 32 silver, 43 copper and 21 iron in the bank."
    if (newBalance === null) {
      const youNowHaveMatch = message.match(/[Yy]ou\s+now\s+have\s+(.+?)\s+in\s+the\s+bank/i)
      if (youNowHaveMatch) {
        const currencyStr = youNowHaveMatch[1]
        const parsed = parseCurrency(currencyStr)
        newBalance = convertToIron(parsed.gold, parsed.silver, parsed.copper, parsed.iron)
      }
    }
    
    // Padrão 2b: "Your available money in the bank is now 2 silver, 5 copper and 41 iron."
    if (newBalance === null) {
      const availableMoneyMatch = message.match(/[Yy]our\s+available\s+money\s+in\s+the\s+bank\s+is\s+now\s+(.+?)(?:\.|$)/i)
      if (availableMoneyMatch) {
        const currencyStr = availableMoneyMatch[1]
        const parsed = parseCurrency(currencyStr)
        // Sempre atualizar, mesmo se não encontrar moedas (pode ser que o parseCurrency precise melhorar)
        newBalance = convertToIron(parsed.gold, parsed.silver, parsed.copper, parsed.iron)
        shouldNotify = true // Enviar notificação para este tipo de atualização
      }
    }
    
    // Padrão 2c: "New balance: 1 silver, 5 copper and 41 iron."
    if (newBalance === null) {
      const newBalanceMatch = message.match(/[Nn]ew\s+balance[:\s]+(.+?)(?:\.|$)/i)
      if (newBalanceMatch) {
        const currencyStr = newBalanceMatch[1]
        const parsed = parseCurrency(currencyStr)
        newBalance = convertToIron(parsed.gold, parsed.silver, parsed.copper, parsed.iron)
      }
    }
    
    // Padrão 3: "You have been charged 1 copper."
    if (newBalance === null) {
      const chargedMatch = message.match(/[Yy]ou\s+have\s+been\s+charged\s+(.+?)(?:\.|$)/i)
      if (chargedMatch && !message.toLowerCase().includes('the items are now available')) {
        const currencyStr = chargedMatch[1]
        const parsed = parseCurrency(currencyStr)
        const chargeAmount = convertToIron(parsed.gold, parsed.silver, parsed.copper, parsed.iron)
        const currentBalance = getCurrentBalance()
        newBalance = Math.max(0, currentBalance - chargeAmount)
      }
    }
    
    // Padrão 4: "The items are now available and you have been charged 1 silver and 1 copper."
    if (newBalance === null) {
      const itemsAvailableMatch = message.match(/[Tt]he\s+items\s+are\s+now\s+available\s+and\s+you\s+have\s+been\s+charged\s+(.+?)(?:\.|$)/i)
      if (itemsAvailableMatch) {
        const currencyStr = itemsAvailableMatch[1]
        const parsed = parseCurrency(currencyStr)
        const chargeAmount = convertToIron(parsed.gold, parsed.silver, parsed.copper, parsed.iron)
        const currentBalance = getCurrentBalance()
        newBalance = Math.max(0, currentBalance - chargeAmount)
        shouldNotify = true // Notificar para este tipo de cobrança
      }
    }
    
    if (newBalance !== null && !isNaN(newBalance)) {
      const formattedBalance = formatBalance(newBalance)
      // Garantir que seja uma string
      const balanceString = String(formattedBalance)
      localStorage.setItem('wurm_balance', balanceString)
      window.dispatchEvent(new Event('wurm-balance-updated'))
      
      // Criar notificação se necessário
      if (shouldNotify) {
        createNotification(message)
      }
    }
    
    // Verificar mensagens que precisam de notificação mas não atualizam balance
    // Padrão: "You realize that you have developed an affinity for XXXX."
    const affinityMatch = message.match(/[Yy]ou\s+realize\s+that\s+you\s+have\s+developed\s+an\s+affinity\s+for\s+(.+?)(?:\.|$)/i)
    if (affinityMatch) {
      createNotification(message)
    }
  }, [parseCurrency, convertToIron, formatBalance, getCurrentBalance, createNotification])

  // Função para detectar e processar comando /time para calibração automática
  const processTimeCommand = React.useCallback((message) => {
    try {
      // Verificar se a mensagem contém o padrão do comando /time
      // Formato: "[HH:mm:ss] It is HH:mm:ss on day of ..."
      if (!message.includes('It is') || !message.includes('starfall')) {
        return
      }

      // Tentar parsear o comando /time
      const parsed = parseTimeCommand(message)
      if (!parsed) {
        return
      }

      // Extrair timestamp do PC da mensagem (o que está entre colchetes)
      const pcTimeMatch = message.match(/\[(\d{2}):(\d{2}):(\d{2})\]/)
      if (!pcTimeMatch) {
        return
      }

      // Usar a data/hora atual do PC (assumindo que a mensagem foi recebida agora)
      // Ou podemos usar o timestamp extraído da mensagem com a data atual
      const now = new Date()
      const pcHour = parseInt(pcTimeMatch[1], 10)
      const pcMinute = parseInt(pcTimeMatch[2], 10)
      const pcSecond = parseInt(pcTimeMatch[3], 10)
      
      // Criar data com o horário do timestamp e a data atual
      const pcDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), pcHour, pcMinute, pcSecond)

      // Calcular nova época
      const newEpoch = calculateEpochFromCalibration(
        pcDateTime,
        parsed.hour,
        parsed.minute,
        parsed.second,
        parsed.week,
        parsed.starfall,
        parsed.year
      )

      // Salvar no localStorage (mesma chave usada pelo CalibrationModal)
      const STORAGE_KEY = 'wurm_calibrated_epoch'
      localStorage.setItem(STORAGE_KEY, newEpoch.toISOString())

      // Disparar evento para atualizar o calendário
      window.dispatchEvent(new Event('wurm-epoch-updated'))

      // Criar notificação informando que a calibração foi feita
      createNotification(`Calibração automática realizada: ${parsed.starfall}, semana ${parsed.week}, ano ${parsed.year}`)
    } catch (err) {
      // Silenciosamente ignorar erros de parsing (pode não ser um comando /time válido)
      console.debug('[EventsTab] Erro ao processar comando /time:', err)
    }
  }, [createNotification])

  // Função para verificar alarme em mensagens
  const checkAlarmForMessages = React.useCallback((messages, config, volume) => {
    if (!config.enabled || !config.keywords.trim()) {
      return
    }

    const keywords = config.keywords
      .split(',')
      .map(k => k.trim().toLowerCase())
      .filter(k => k.length > 0)

    if (keywords.length === 0) {
      return
    }

    messages.forEach(message => {
      const messageLower = message.toLowerCase()
      const foundKeyword = keywords.find(keyword => messageLower.includes(keyword))
      
      if (foundKeyword) {
        playAlarmSound(volume)
        createNotification(message)
      }
    })
  }, [playAlarmSound, createNotification])

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

  // Polling de mensagens de Trade
  useEffect(() => {
    if (!logsEnabled || !tradeEnabled) {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
      return
    }

    const pollTradeMessages = async () => {
      try {
        setLoading(true)
        setError('')
        
        const lines = await api.readCurrentTradeLogLastNLines(10)
        
        if (lines && lines.length > 0) {
          if (tradeMessages.length === 0) {
            setTradeMessages(lines)
            lastMessageCountRef.current = lines.length
            lines.forEach(msg => {
              lastCheckedMessagesRef.current.add(msg)
              updateBalance(msg)
            })
          } else {
            const lastKnownMessage = tradeMessages[tradeMessages.length - 1]
            const lastNewMessage = lines[lines.length - 1]
            
            if (lastKnownMessage !== lastNewMessage) {
              const lastKnownIndex = lines.findIndex(msg => msg === lastKnownMessage)
              
              if (lastKnownIndex === -1) {
                setTradeMessages(lines)
                lastMessageCountRef.current = lines.length
                lastCheckedMessagesRef.current.clear()
                lines.forEach(msg => {
                  lastCheckedMessagesRef.current.add(msg)
                  updateBalance(msg)
                })
              } else {
                const newMessages = lines.slice(lastKnownIndex + 1)
                if (newMessages.length > 0) {
                  checkAlarmForMessages(newMessages, alarmConfig, alarmConfig.volume)
                  
                  newMessages.forEach(msg => updateBalance(msg))
                  
                  setTradeMessages(prev => {
                    const combined = [...prev, ...newMessages]
                    return combined.slice(-50)
                  })
                  lastMessageCountRef.current = lines.length
                  newMessages.forEach(msg => lastCheckedMessagesRef.current.add(msg))
                }
              }
            }
          }
        } else if (lines && lines.length === 0) {
          setTradeMessages([])
          lastMessageCountRef.current = 0
          lastCheckedMessagesRef.current.clear()
        }
      } catch (err) {
        console.error('Erro ao ler mensagens de Trade:', err)
        setError(err.message || t('events.trade.readError', { defaultValue: 'Erro ao ler mensagens de Trade' }))
      } finally {
        setLoading(false)
      }
    }

    pollTradeMessages()
    pollingIntervalRef.current = setInterval(pollTradeMessages, POLLING_INTERVAL)

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
    }
  }, [logsEnabled, tradeEnabled, t, checkAlarmForMessages, alarmConfig, tradeMessages, updateBalance])

  // Polling de mensagens de Events
  useEffect(() => {
    if (!logsEnabled || !eventsEnabled) {
      if (eventsPollingIntervalRef.current) {
        clearInterval(eventsPollingIntervalRef.current)
        eventsPollingIntervalRef.current = null
      }
      return
    }

    const pollEventsMessages = async () => {
      try {
        const lines = await api.readCurrentEventsLogLastNLines(10)
        
        if (lines && lines.length > 0) {
          if (eventsMessages.length === 0) {
            setEventsMessages(lines)
            lastEventsMessageCountRef.current = lines.length
            lines.forEach(msg => {
              lastCheckedEventsMessagesRef.current.add(msg)
              updateBalance(msg)
              processTimeCommand(msg)
            })
          } else {
            const lastKnownMessage = eventsMessages[eventsMessages.length - 1]
            const lastNewMessage = lines[lines.length - 1]
            
            if (lastKnownMessage !== lastNewMessage) {
              const lastKnownIndex = lines.findIndex(msg => msg === lastKnownMessage)
              
              if (lastKnownIndex === -1) {
                setEventsMessages(lines)
                lastEventsMessageCountRef.current = lines.length
                lastCheckedEventsMessagesRef.current.clear()
                lines.forEach(msg => {
                  lastCheckedEventsMessagesRef.current.add(msg)
                  updateBalance(msg)
                  processTimeCommand(msg)
                })
              } else {
                const newMessages = lines.slice(lastKnownIndex + 1)
                if (newMessages.length > 0) {
                  checkAlarmForMessages(newMessages, eventsAlarmConfig, eventsAlarmConfig.volume)
                  
                  newMessages.forEach(msg => {
                    updateBalance(msg)
                    processTimeCommand(msg)
                  })
                  
                  setEventsMessages(prev => {
                    const combined = [...prev, ...newMessages]
                    return combined.slice(-50)
                  })
                  lastEventsMessageCountRef.current = lines.length
                  newMessages.forEach(msg => lastCheckedEventsMessagesRef.current.add(msg))
                }
              }
            }
          }
        } else if (lines && lines.length === 0) {
          setEventsMessages([])
          lastEventsMessageCountRef.current = 0
          lastCheckedEventsMessagesRef.current.clear()
        }
      } catch (err) {
        console.error('Erro ao ler mensagens de Events:', err)
      }
    }

    pollEventsMessages()
    eventsPollingIntervalRef.current = setInterval(pollEventsMessages, POLLING_INTERVAL)

    return () => {
      if (eventsPollingIntervalRef.current) {
        clearInterval(eventsPollingIntervalRef.current)
        eventsPollingIntervalRef.current = null
      }
    }
  }, [logsEnabled, eventsEnabled, checkAlarmForMessages, eventsAlarmConfig, eventsMessages, updateBalance, processTimeCommand])

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
    
    if (!newValue) {
      setTradeMessages([])
      lastMessageCountRef.current = 0
      lastCheckedMessagesRef.current.clear()
    }
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
    
    if (!newValue) {
      setEventsMessages([])
      lastEventsMessageCountRef.current = 0
      lastCheckedEventsMessagesRef.current.clear()
    }
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
