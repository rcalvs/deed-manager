/**
 * Serviço global de polling de Trade e Events que funciona independente da aba ativa.
 * Permite que Trade e Events sejam lidos mesmo quando o usuário está em outra aba.
 */
import { hasExamineTrigger } from '../utils/examineParser'
import {
  updateBalance,
  processTimeCommand,
  checkAlarmForMessages,
} from '../utils/messageProcessing'

const LOGS_ENABLED_KEY = 'wurm_logs_enabled'
const TRADE_ENABLED_KEY = 'wurm_trade_enabled'
const EVENTS_ENABLED_KEY = 'wurm_event_enabled'
const TRADE_ALARM_KEYWORDS_KEY = 'wurm_trade_alarm_keywords'
const TRADE_ALARM_ENABLED_KEY = 'wurm_trade_alarm_enabled'
const TRADE_ALARM_VOLUME_KEY = 'wurm_trade_alarm_volume'
const EVENTS_ALARM_KEYWORDS_KEY = 'wurm_event_alarm_keywords'
const EVENTS_ALARM_ENABLED_KEY = 'wurm_event_alarm_enabled'
const EVENTS_ALARM_VOLUME_KEY = 'wurm_event_alarm_volume'
const POLLING_INTERVAL = 2000

function getTradeAlarmConfig() {
  return {
    keywords: localStorage.getItem(TRADE_ALARM_KEYWORDS_KEY) || '',
    enabled: localStorage.getItem(TRADE_ALARM_ENABLED_KEY) === 'true',
    volume: parseInt(localStorage.getItem(TRADE_ALARM_VOLUME_KEY) || '50', 10),
  }
}

function getEventsAlarmConfig() {
  return {
    keywords: localStorage.getItem(EVENTS_ALARM_KEYWORDS_KEY) || '',
    enabled: localStorage.getItem(EVENTS_ALARM_ENABLED_KEY) === 'true',
    volume: parseInt(localStorage.getItem(EVENTS_ALARM_VOLUME_KEY) || '50', 10),
  }
}

class EventsPollingService {
  constructor() {
    this.pollingInterval = null
    this.tradeListeners = new Set()
    this.eventsListeners = new Set()
    this.isPolling = false
    this.lastProcessedExamineTimestamp = null

    // Buffer de mensagens (mantidos pelo serviço, independente da aba)
    this.tradeMessages = []
    this.eventsMessages = []
    this.lastCheckedTradeRef = new Set()
    this.lastCheckedEventsRef = new Set()
  }

  start() {
    if (this.isPolling) return

    const logsEnabled = localStorage.getItem(LOGS_ENABLED_KEY) === 'true'
    const tradeEnabled = localStorage.getItem(TRADE_ENABLED_KEY) === 'true'
    const eventsEnabled = localStorage.getItem(EVENTS_ENABLED_KEY) === 'true'

    if (!logsEnabled || (!tradeEnabled && !eventsEnabled)) {
      return
    }

    console.log('[EventsPollingService] Iniciando polling de Trade e Events (independente da aba)')
    this.isPolling = true

    const poll = async () => {
      try {
        const logsEnabledNow = localStorage.getItem(LOGS_ENABLED_KEY) === 'true'
        const tradeEnabledNow = localStorage.getItem(TRADE_ENABLED_KEY) === 'true'
        const eventsEnabledNow = localStorage.getItem(EVENTS_ENABLED_KEY) === 'true'

        if (!logsEnabledNow || (!tradeEnabledNow && !eventsEnabledNow)) {
          this.stop()
          return
        }

        const { api } = await import('../api')

        if (tradeEnabledNow) {
          await this.pollTrade(api)
        }

        if (eventsEnabledNow) {
          await this.pollEvents(api)
        }
      } catch (error) {
        console.error('[EventsPollingService] Erro no polling:', error)
      }
    }

    poll()
    this.pollingInterval = setInterval(poll, POLLING_INTERVAL)
  }

  async pollTrade(api) {
    try {
      const lines = await api.readCurrentTradeLogLastNLines(10)
      if (!lines || lines.length === 0) {
        this.tradeMessages = []
        this.lastCheckedTradeRef.clear()
        this.notifyTradeListeners([])
        return
      }

      if (this.tradeMessages.length === 0) {
        this.tradeMessages = lines.slice(-50)
        lines.forEach(msg => {
          this.lastCheckedTradeRef.add(msg)
          updateBalance(msg)
        })
        this.notifyTradeListeners(this.tradeMessages)
        return
      }

      const lastKnown = this.tradeMessages[this.tradeMessages.length - 1]
      const lastNew = lines[lines.length - 1]
      if (lastKnown !== lastNew) {
        const lastKnownIndex = lines.findIndex(msg => msg === lastKnown)
        if (lastKnownIndex === -1) {
          this.tradeMessages = lines.slice(-50)
          this.lastCheckedTradeRef.clear()
          lines.forEach(msg => {
            this.lastCheckedTradeRef.add(msg)
            updateBalance(msg)
          })
        } else {
          const newMessages = lines.slice(lastKnownIndex + 1)
          if (newMessages.length > 0) {
            checkAlarmForMessages(newMessages, getTradeAlarmConfig(), getTradeAlarmConfig().volume)
            newMessages.forEach(msg => updateBalance(msg))
            this.tradeMessages = [...this.tradeMessages, ...newMessages].slice(-50)
            newMessages.forEach(msg => this.lastCheckedTradeRef.add(msg))
            this.notifyTradeListeners(this.tradeMessages)
          }
        }
      }
    } catch (err) {
      console.error('[EventsPollingService] Erro ao ler Trade:', err)
    }
  }

  async pollEvents(api) {
    try {
      const lines = await api.readCurrentEventsLogLastNLines(15)
      if (!lines || lines.length === 0) {
        this.eventsMessages = []
        this.lastCheckedEventsRef.clear()
        this.notifyEventsListeners([])
        return
      }

      if (this.eventsMessages.length === 0) {
        this.eventsMessages = lines.slice(-50)
        lines.forEach(msg => {
          this.lastCheckedEventsRef.add(msg)
          updateBalance(msg)
          processTimeCommand(msg)
        })
        const hasExamine = lines.some(l => hasExamineTrigger(l))
        if (hasExamine) this.dispatchExamineEvent(lines)
        this.notifyEventsListeners(this.eventsMessages)
        return
      }

      const lastKnown = this.eventsMessages[this.eventsMessages.length - 1]
      const lastNew = lines[lines.length - 1]
      if (lastKnown !== lastNew) {
        const lastKnownIndex = lines.findIndex(msg => msg === lastKnown)
        if (lastKnownIndex === -1) {
          this.eventsMessages = lines.slice(-50)
          this.lastCheckedEventsRef.clear()
          lines.forEach(msg => {
            this.lastCheckedEventsRef.add(msg)
            updateBalance(msg)
            processTimeCommand(msg)
          })
          this.notifyEventsListeners(this.eventsMessages)
        } else {
          const newMessages = lines.slice(lastKnownIndex + 1)
          if (newMessages.length > 0) {
            checkAlarmForMessages(newMessages, getEventsAlarmConfig(), getEventsAlarmConfig().volume)
            newMessages.forEach(msg => {
              updateBalance(msg)
              processTimeCommand(msg)
            })
            const triggerLine = newMessages.find(l => hasExamineTrigger(l))
            if (triggerLine) {
              const m = triggerLine.match(/^\[(\d{2}:\d{2}:\d{2})\]/)
              const ts = m ? m[1] : null
              if (ts && ts !== this.lastProcessedExamineTimestamp) {
                this.lastProcessedExamineTimestamp = ts
                this.dispatchExamineEvent(lines)
              }
            }
            this.eventsMessages = [...this.eventsMessages, ...newMessages].slice(-50)
            newMessages.forEach(msg => this.lastCheckedEventsRef.add(msg))
            this.notifyEventsListeners(this.eventsMessages)
          }
        }
      }
    } catch (err) {
      console.error('[EventsPollingService] Erro ao ler Events:', err)
    }
  }

  dispatchExamineEvent(lines) {
    window.dispatchEvent(new CustomEvent('events-message-received', { detail: { messages: lines } }))
  }

  notifyTradeListeners(messages) {
    this.tradeListeners.forEach(cb => {
      try { cb(messages) } catch (e) { console.error('[EventsPollingService] Erro no listener Trade:', e) }
    })
  }

  notifyEventsListeners(messages) {
    this.eventsListeners.forEach(cb => {
      try { cb(messages) } catch (e) { console.error('[EventsPollingService] Erro no listener Events:', e) }
    })
  }

  stop() {
    if (this.pollingInterval) {
      console.log('[EventsPollingService] Parando polling')
      clearInterval(this.pollingInterval)
      this.pollingInterval = null
      this.isPolling = false
    }
  }

  getTradeMessages() {
    return [...this.tradeMessages]
  }

  getEventsMessages() {
    return [...this.eventsMessages]
  }

  addTradeListener(callback) {
    this.tradeListeners.add(callback)
    if (!this.isPolling) this.maybeStart()
    callback(this.getTradeMessages())
  }

  removeTradeListener(callback) {
    this.tradeListeners.delete(callback)
  }

  addEventsListener(callback) {
    this.eventsListeners.add(callback)
    if (!this.isPolling) this.maybeStart()
    callback(this.getEventsMessages())
  }

  removeEventsListener(callback) {
    this.eventsListeners.delete(callback)
  }

  maybeStart() {
    const logsEnabled = localStorage.getItem(LOGS_ENABLED_KEY) === 'true'
    const tradeEnabled = localStorage.getItem(TRADE_ENABLED_KEY) === 'true'
    const eventsEnabled = localStorage.getItem(EVENTS_ENABLED_KEY) === 'true'
    if (logsEnabled && (tradeEnabled || eventsEnabled)) {
      this.start()
    }
  }
}

export const eventsPollingService = new EventsPollingService()
