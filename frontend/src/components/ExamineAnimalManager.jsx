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
    const enabled = localStorage.getItem(EXAMINE_ENABLED_KEY) === 'true'
    console.log('[ExamineAnimalManager] examineEnabled inicial:', enabled)
    return enabled
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
    console.log('[ExamineAnimalManager] useEffect executado')
    console.log('[ExamineAnimalManager] examineEnabled:', examineEnabled)
    console.log('[ExamineAnimalManager] checkEventsEnabled():', checkEventsEnabled())
    
    if (!examineEnabled || !checkEventsEnabled()) {
      console.log('[ExamineAnimalManager] Condições não atendidas - examineEnabled:', examineEnabled, 'eventsEnabled:', checkEventsEnabled())
      return
    }
    
    console.log('[ExamineAnimalManager] Registrando listener para eventos events-message-received')

    const handleEventsMessage = (event) => {
      const messages = event.detail?.messages || []
      
      if (messages.length === 0) {
        return
      }
      
      // Verificar rapidamente se alguma mensagem contém o trigger antes de processar
      const hasTrigger = messages.some(msg => 
        msg.includes('like this one have many uses')
      )
      
      if (!hasTrigger) {
        // Não há trigger, ignorar este evento
        return
      }
      
      console.log('[ExamineAnimalManager] Evento recebido com trigger de examine, processando...')

      // Encontrar a mensagem com o trigger e extrair seu timestamp
      const triggerMsg = messages.find(msg => msg.includes('like this one have many uses'))
      
      if (!triggerMsg) {
        return
      }
      
      const triggerTimestampMatch = triggerMsg.match(/^\[(\d{2}:\d{2}:\d{2})\]/)
      if (!triggerTimestampMatch) {
        return
      }
      
      const triggerTimestamp = triggerTimestampMatch[1]
      console.log(`[ExamineAnimalManager] Trigger encontrado com timestamp: ${triggerTimestamp}`)
      
      // Buscar TODAS as mensagens com o mesmo timestamp
      const examineMessages = messages.filter(msg => {
        const msgTimestampMatch = msg.match(/^\[(\d{2}:\d{2}:\d{2})\]/)
        if (msgTimestampMatch) {
          return msgTimestampMatch[1] === triggerTimestamp
        }
        return false
      })
      
      // Garantir que a mensagem do trigger seja a primeira
      const reorganizedMessages = [triggerMsg]
      examineMessages.forEach(msg => {
        if (msg !== triggerMsg) {
          reorganizedMessages.push(msg)
        }
      })
      
      console.log(`[ExamineAnimalManager] Encontradas ${reorganizedMessages.length} mensagens com timestamp ${triggerTimestamp}`)
      
      const parsed = parseExamineMessages(reorganizedMessages)
      if (parsed) {
        console.log('[ExamineAnimalManager] Animal parseado:', parsed)
        setPendingAnimal(parsed)
        setIsModalOpen(true)
      }
    }

    // Escutar eventos customizados do EventsTab
    console.log('[ExamineAnimalManager] Adicionando event listener')
    window.addEventListener('events-message-received', handleEventsMessage)

    return () => {
      console.log('[ExamineAnimalManager] Removendo event listener (cleanup)')
      window.removeEventListener('events-message-received', handleEventsMessage)
    }
  }, [examineEnabled, checkEventsEnabled, pendingAnimal])

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

