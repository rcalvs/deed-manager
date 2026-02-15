// Serviço global de polling de eventos que funciona independente da aba ativa
import { hasExamineTrigger } from '../utils/examineParser'

class EventsPollingService {
  constructor() {
    this.pollingInterval = null
    this.listeners = new Set()
    this.isPolling = false
    this.lastProcessedTimestamp = null // Timestamp da última mensagem processada
  }

  start() {
    if (this.isPolling) {
      return
    }

    console.log('[EventsPollingService] Iniciando polling de eventos')
    this.isPolling = true
    
    // Polling a cada 2 segundos (mesmo intervalo do EventsTab)
    const POLLING_INTERVAL = 2000
    
    const poll = async () => {
      try {
        const logsEnabled = localStorage.getItem('wurm_logs_enabled') === 'true'
        const eventsEnabled = localStorage.getItem('wurm_event_enabled') === 'true'
        
        if (!logsEnabled || !eventsEnabled) {
          console.log('[EventsPollingService] Logs ou eventos não habilitados, pausando polling')
          this.stop()
          return
        }

        // Usar a API através do módulo api
        // Ler apenas as últimas 15 linhas para evitar processar examines muito antigos
        const { api } = await import('../api')
        const lines = await api.readCurrentEventsLogLastNLines(15)
        
        if (lines && lines.length > 0) {
          // Verificar se há algum trigger de examine antes de disparar evento
          // Usar função centralizada do examineParser
          const triggerLine = lines.find(line => {
            if (hasExamineTrigger(line)) {
              const lowerLine = line.toLowerCase()
              // Log específico para alguns animais
              if (lowerLine.includes('unicorn')) {
                console.log('[EventsPollingService] Trigger de unicorn encontrado!', lowerLine.substring(0, 80))
              } else if (lowerLine.includes('deer')) {
                console.log('[EventsPollingService] Trigger de deer encontrado!', lowerLine.substring(0, 80))
              } else if (lowerLine.includes('bison')) {
                console.log('[EventsPollingService] Trigger de bison encontrado!', lowerLine.substring(0, 80))
              }
              return true
            }
            return false
          })
          
          if (triggerLine) {
            // Extrair timestamp da mensagem do trigger
            const timestampMatch = triggerLine.match(/^\[(\d{2}:\d{2}:\d{2})\]/)
            if (timestampMatch) {
              const currentTimestamp = timestampMatch[1]
              
              // Verificar se já processamos esta mensagem
              if (this.lastProcessedTimestamp === currentTimestamp) {
                // Já processamos esta mensagem, ignorar
                return
              }
              
              // Nova mensagem, atualizar timestamp e processar
              this.lastProcessedTimestamp = currentTimestamp
              console.log('[EventsPollingService] Trigger de examine encontrado! Timestamp:', currentTimestamp, 'Disparando evento')
              
              // Disparar evento global para todos os listeners (incluindo HusbandryForm)
              window.dispatchEvent(new CustomEvent('events-message-received', {
                detail: { messages: lines }
              }))
            }
          }
          
          // Também chamar listeners diretos se houver
          this.listeners.forEach(listener => {
            try {
              listener(lines)
            } catch (error) {
              console.error('[EventsPollingService] Erro ao chamar listener:', error)
            }
          })
        }
      } catch (error) {
        console.error('[EventsPollingService] Erro no polling:', error)
      }
    }

    // Executar imediatamente
    poll()
    
    // Configurar intervalo
    this.pollingInterval = setInterval(poll, POLLING_INTERVAL)
  }

  stop() {
    if (this.pollingInterval) {
      console.log('[EventsPollingService] Parando polling de eventos')
      clearInterval(this.pollingInterval)
      this.pollingInterval = null
      this.isPolling = false
    }
  }

  addListener(listener) {
    this.listeners.add(listener)
    console.log('[EventsPollingService] Listener adicionado. Total de listeners:', this.listeners.size)
    
    // Se não está polling e os requisitos estão atendidos, iniciar
    if (!this.isPolling) {
      const logsEnabled = localStorage.getItem('wurm_logs_enabled') === 'true'
      const eventsEnabled = localStorage.getItem('wurm_event_enabled') === 'true'
      
      if (logsEnabled && eventsEnabled) {
        this.start()
      }
    }
  }

  removeListener(listener) {
    this.listeners.delete(listener)
    console.log('[EventsPollingService] Listener removido. Total de listeners:', this.listeners.size)
    
    // Se não há mais listeners, parar polling
    if (this.listeners.size === 0) {
      this.stop()
    }
  }
}

// Exportar instância singleton
export const eventsPollingService = new EventsPollingService()
