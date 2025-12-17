import React, { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { FaChevronDown, FaChevronUp } from 'react-icons/fa'
import { parseExamineMessages } from '../utils/examineParser'
import ExamineConfirmModal from './ExamineConfirmModal'
import './ExamineAnimalManager.css'

const EXAMINE_ENABLED_KEY = 'wurm_examine_enabled'
const EVENTS_ENABLED_KEY = 'wurm_event_enabled'
const LOGS_ENABLED_KEY = 'wurm_logs_enabled'

function ExamineAnimalManager({ onAnimalAdded }) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [examineEnabled, setExamineEnabled] = useState(() => {
    return localStorage.getItem(EXAMINE_ENABLED_KEY) === 'true'
  })
  const [pendingAnimal, setPendingAnimal] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Verificar se Events está habilitado
  const checkEventsEnabled = useCallback(() => {
    const logsEnabled = localStorage.getItem(LOGS_ENABLED_KEY) === 'true'
    const eventsEnabled = localStorage.getItem(EVENTS_ENABLED_KEY) === 'true'
    return logsEnabled && eventsEnabled
  }, [])

  // Listener para mensagens de Events
  useEffect(() => {
    if (!examineEnabled || !checkEventsEnabled()) {
      return
    }

    const handleEventsMessage = (event) => {
      // O evento pode conter uma mensagem ou um array de mensagens
      // Vamos verificar se há novas mensagens de examine
      const messages = event.detail?.messages || []
      
      if (messages.length === 0) {
        return
      }

      // Agrupar mensagens por timestamp (mensagens próximas no tempo são do mesmo examine)
      // Um examine geralmente tem várias mensagens com o mesmo timestamp ou muito próximas
      const groupedMessages = []
      let currentGroup = []
      let lastTimestamp = null

      messages.forEach(msg => {
        const timestampMatch = msg.match(/^\[(\d{2}:\d{2}:\d{2})\]/)
        if (timestampMatch) {
          const timestamp = timestampMatch[1]
          
          // Se a diferença for maior que 2 segundos, é um novo examine
          if (lastTimestamp && getTimeDifference(lastTimestamp, timestamp) > 2) {
            if (currentGroup.length > 0) {
              groupedMessages.push([...currentGroup])
              currentGroup = []
            }
          }
          
          currentGroup.push(msg)
          lastTimestamp = timestamp
        } else {
          // Se não tem timestamp, adicionar ao grupo atual
          if (currentGroup.length > 0) {
            currentGroup.push(msg)
          }
        }
      })

      // Adicionar o último grupo
      if (currentGroup.length > 0) {
        groupedMessages.push(currentGroup)
      }

      // Processar cada grupo de mensagens
      for (const group of groupedMessages) {
        const parsed = parseExamineMessages(group)
        if (parsed) {
          // Encontrar um examine válido, mostrar modal de confirmação
          setPendingAnimal(parsed)
          setIsModalOpen(true)
          break // Processar apenas o primeiro examine válido
        }
      }
    }

    // Escutar eventos customizados do EventsTab
    window.addEventListener('events-message-received', handleEventsMessage)

    return () => {
      window.removeEventListener('events-message-received', handleEventsMessage)
    }
  }, [examineEnabled, checkEventsEnabled, pendingAnimal])

  // Função auxiliar para calcular diferença de tempo em segundos
  const getTimeDifference = (time1, time2) => {
    const [h1, m1, s1] = time1.split(':').map(Number)
    const [h2, m2, s2] = time2.split(':').map(Number)
    
    const seconds1 = h1 * 3600 + m1 * 60 + s1
    const seconds2 = h2 * 3600 + m2 * 60 + s2
    
    return Math.abs(seconds2 - seconds1)
  }

  const handleToggleExamine = (e) => {
    e.stopPropagation()
    if (!checkEventsEnabled()) {
      alert(t('husbandry.examine.eventsRequired', { 
        defaultValue: 'É necessário habilitar os logs e o chat de Eventos na aba de Eventos primeiro.' 
      }))
      return
    }
    
    const newValue = !examineEnabled
    setExamineEnabled(newValue)
    localStorage.setItem(EXAMINE_ENABLED_KEY, newValue.toString())
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setPendingAnimal(null)
  }

  const handleAnimalConfirmed = () => {
    setIsModalOpen(false)
    setPendingAnimal(null)
    if (onAnimalAdded) {
      onAnimalAdded()
    }
  }

  const eventsEnabled = checkEventsEnabled()

  return (
    <>
      <div className="examine-manager-container">
        <button
          type="button"
          className="examine-manager-toggle"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
        >
          <div className="toggle-content">
            <span>{t('husbandry.examine.title', { defaultValue: 'Adicionar por Evento' })}</span>
          </div>
          {isOpen ? <FaChevronUp /> : <FaChevronDown />}
        </button>
        
        {isOpen && (
          <div className="examine-manager-dropdown">
            <div className="examine-toggle-container">
              <label className="examine-toggle-label">
                <input
                  type="checkbox"
                  checked={examineEnabled}
                  onChange={handleToggleExamine}
                  disabled={!eventsEnabled}
                />
                <span>{t('husbandry.examine.addWithExamine', { defaultValue: 'Adicionar com Examine' })}</span>
              </label>
              {!eventsEnabled && (
                <p className="examine-warning">
                  {t('husbandry.examine.eventsRequired', { 
                    defaultValue: 'É necessário habilitar os logs e o chat de Eventos na aba de Eventos primeiro.' 
                  })}
                </p>
              )}
              {examineEnabled && eventsEnabled && (
                <p className="examine-info">
                  {t('husbandry.examine.ready', { 
                    defaultValue: 'Pronto! Examine um animal no jogo para adicioná-lo automaticamente.' 
                  })}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {pendingAnimal && (
        <ExamineConfirmModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          parsedAnimal={pendingAnimal}
          onConfirm={handleAnimalConfirmed}
        />
      )}
    </>
  )
}

export default ExamineAnimalManager

