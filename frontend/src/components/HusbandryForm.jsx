import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FaChevronDown, FaChevronUp, FaPlus } from 'react-icons/fa'
import { api } from '../api'
import { ANIMAL_AGES, ANIMAL_CONDITIONS, ANIMAL_GENDERS, ANIMAL_TRAITS, ANIMAL_TYPES } from '../constants'
import { parseExamineMessages } from '../utils/examineParser'
import './HusbandryForm.css'

function HusbandryForm({ onAnimalAdded, onAnimalUpdated }) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const [type, setType] = useState('horse')
  const [gender, setGender] = useState('male')
  const [age, setAge] = useState('young')
  const [condition, setCondition] = useState('none')
  const [father, setFather] = useState('')
  const [mother, setMother] = useState('')
  const [selectedTraits, setSelectedTraits] = useState([])
  const [notes, setNotes] = useState('')
  const [traitSearchText, setTraitSearchText] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [editingAnimal, setEditingAnimal] = useState(null)
  
  // Estados para Examine
  const EXAMINE_ENABLED_KEY = 'wurm_examine_enabled'
  const EVENTS_ENABLED_KEY = 'wurm_event_enabled'
  const LOGS_ENABLED_KEY = 'wurm_logs_enabled'
  const [examineEnabled, setExamineEnabled] = useState(() => {
    return localStorage.getItem(EXAMINE_ENABLED_KEY) === 'true'
  })
  const [pendingAnimal, setPendingAnimal] = useState(null)
  const [isExamineModalOpen, setIsExamineModalOpen] = useState(false)

  // Verificar se Events está habilitado
  const checkEventsEnabled = useCallback(() => {
    const logsEnabled = localStorage.getItem(LOGS_ENABLED_KEY) === 'true'
    const eventsEnabled = localStorage.getItem(EVENTS_ENABLED_KEY) === 'true'
    return logsEnabled && eventsEnabled
  }, [])

  // Função auxiliar para calcular diferença de tempo em segundos
  const getTimeDifference = useCallback((time1, time2) => {
    const [h1, m1, s1] = time1.split(':').map(Number)
    const [h2, m2, s2] = time2.split(':').map(Number)
    
    const seconds1 = h1 * 3600 + m1 * 60 + s1
    const seconds2 = h2 * 3600 + m2 * 60 + s2
    
    return Math.abs(seconds2 - seconds1)
  }, [])

  // Listener para editar animal
  useEffect(() => {
    const handleEditAnimal = (event) => {
      if (event.detail && event.detail.animal) {
        const animal = event.detail.animal
        setEditingAnimal(animal)
        setName(animal.name || '')
        setType(animal.type || 'horse')
        setGender(animal.gender || 'male')
        setAge(animal.age || 'young')
        setCondition(animal.condition || 'none')
        setFather(animal.father || '')
        setMother(animal.mother || '')
        setSelectedTraits(animal.traits || [])
        setNotes(animal.notes || '')
        setIsOpen(true)
      }
    }

    window.addEventListener('edit-animal', handleEditAnimal)
    return () => {
      window.removeEventListener('edit-animal', handleEditAnimal)
    }
  }, [])

  // Listener para mensagens de Events (Examine)
  useEffect(() => {
    if (!examineEnabled || !checkEventsEnabled() || pendingAnimal) {
      return
    }

    const handleEventsMessage = (event) => {
      const messages = event.detail?.messages || []
      
      if (messages.length === 0) {
        return
      }

      // Agrupar mensagens por timestamp (mensagens próximas no tempo são do mesmo examine)
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
          setIsExamineModalOpen(true)
          break // Processar apenas o primeiro examine válido
        }
      }
    }

    // Escutar eventos customizados do EventsTab
    window.addEventListener('events-message-received', handleEventsMessage)

    return () => {
      window.removeEventListener('events-message-received', handleEventsMessage)
    }
  }, [examineEnabled, checkEventsEnabled, pendingAnimal, getTimeDifference])

  const showMessage = (msg, isError = false) => {
    setMessage(msg)
    setTimeout(() => setMessage(''), 3000)
  }

  const handleToggleTrait = (traitName) => {
    setSelectedTraits(prev => {
      if (prev.includes(traitName)) {
        return prev.filter(t => t !== traitName)
      } else {
        return [...prev, traitName]
      }
    })
  }

  // Filtrar traits por categoria
  const filteredTraits = useMemo(() => {
    if (!traitSearchText.trim()) {
      return ANIMAL_TRAITS
    }
    
    const searchLower = traitSearchText.toLowerCase().trim()
    return ANIMAL_TRAITS.filter(traitObj => {
      const categories = traitObj.categories || []
      return categories.some(cat => cat.toLowerCase().includes(searchLower))
    })
  }, [traitSearchText])

  const resetForm = () => {
    setName('')
    setType('horse')
    setGender('male')
    setAge('young')
    setCondition('none')
    setFather('')
    setMother('')
    setSelectedTraits([])
    setNotes('')
    setTraitSearchText('')
    setEditingAnimal(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!name.trim()) {
      showMessage(t('husbandry.nameRequired', { defaultValue: 'Por favor, preencha o nome' }), true)
      return
    }

    setLoading(true)
    try {
      if (editingAnimal) {
        await api.updateAnimal(
          editingAnimal.id,
          name,
          type,
          gender,
          age,
          condition,
          father || '',
          mother || '',
          selectedTraits,
          notes
        )
        showMessage(t('husbandry.updateSuccess', { defaultValue: 'Animal atualizado com sucesso' }))
        onAnimalUpdated()
      } else {
        await api.createAnimal(
          name,
          type,
          gender,
          age,
          condition,
          father || '',
          mother || '',
          selectedTraits,
          notes
        )
        showMessage(t('husbandry.addSuccess', { defaultValue: 'Animal adicionado com sucesso' }))
        onAnimalAdded()
      }
      resetForm()
      setIsOpen(false)
    } catch (error) {
      console.error('Erro ao salvar animal:', error)
      showMessage(error.message || t('husbandry.saveError', { defaultValue: 'Erro ao salvar animal' }), true)
    } finally {
      setLoading(false)
    }
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

  const handleExamineModalClose = () => {
    setIsExamineModalOpen(false)
    setPendingAnimal(null)
  }

  const handleExamineAnimalConfirmed = () => {
    setIsExamineModalOpen(false)
    setPendingAnimal(null)
    if (onAnimalAdded) {
      onAnimalAdded()
    }
  }

  const eventsEnabled = checkEventsEnabled()

  return (
    <div className="husbandry-form-container">
      <button
        type="button"
        className="husbandry-form-toggle"
        onClick={() => {
          if (!isOpen) {
            resetForm()
          }
          setIsOpen(!isOpen)
        }}
        aria-expanded={isOpen}
      >
        <div className="toggle-content">
          <FaPlus className="toggle-icon" />
          <span>{editingAnimal ? t('husbandry.editAnimal', { defaultValue: 'Editar Animal' }) : t('husbandry.addAnimal', { defaultValue: 'Adicionar Animal' })}</span>
        </div>
        {isOpen ? <FaChevronUp /> : <FaChevronDown />}
      </button>
      
      {isOpen && (
        <div className="husbandry-form-dropdown">
          <form className="husbandry-form" onSubmit={handleSubmit}>
            <div className="form-group examine-toggle-group">
              <div className="examine-toggle-container">
                <span className="examine-toggle-label-text">{t('husbandry.examine.addWithExamine', { defaultValue: 'Adicionar com Examine' })}</span>
                <label className="examine-toggle">
                  <input
                    type="checkbox"
                    checked={examineEnabled}
                    onChange={handleToggleExamine}
                    disabled={!eventsEnabled}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
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

            <div className="form-group">
              <label htmlFor="animalName">{t('husbandry.name', { defaultValue: 'Nome' })} *</label>
              <input
                type="text"
                id="animalName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                placeholder={t('husbandry.namePlaceholder', { defaultValue: 'Nome do animal' })}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="animalType">{t('husbandry.type', { defaultValue: 'Tipo' })}</label>
                <select
                  id="animalType"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  disabled={loading}
                >
                  {ANIMAL_TYPES.map((animalType) => (
                    <option key={animalType.value} value={animalType.value}>
                      {animalType.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="animalGender">{t('husbandry.gender', { defaultValue: 'Sexo' })}</label>
                <select
                  id="animalGender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  disabled={loading}
                >
                  {ANIMAL_GENDERS.map((animalGender) => (
                    <option key={animalGender.value} value={animalGender.value}>
                      {animalGender.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="animalAge">{t('husbandry.age', { defaultValue: 'Idade' })}</label>
                <select
                  id="animalAge"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  disabled={loading}
                >
                  {ANIMAL_AGES.map((animalAge) => (
                    <option key={animalAge.value} value={animalAge.value}>
                      {animalAge.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="animalCondition">{t('husbandry.condition', { defaultValue: 'Condição' })}</label>
                <select
                  id="animalCondition"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  disabled={loading}
                >
                  {ANIMAL_CONDITIONS.map((animalCondition) => (
                    <option key={animalCondition.value} value={animalCondition.value}>
                      {animalCondition.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="animalFather">{t('husbandry.father', { defaultValue: 'Pai' })}</label>
                <input
                  type="text"
                  id="animalFather"
                  value={father}
                  onChange={(e) => setFather(e.target.value)}
                  disabled={loading}
                  placeholder={t('husbandry.fatherPlaceholder', { defaultValue: 'Nome do pai ou "wild"' })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="animalMother">{t('husbandry.mother', { defaultValue: 'Mãe' })}</label>
                <input
                  type="text"
                  id="animalMother"
                  value={mother}
                  onChange={(e) => setMother(e.target.value)}
                  disabled={loading}
                  placeholder={t('husbandry.motherPlaceholder', { defaultValue: 'Nome da mãe ou "wild"' })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>{t('husbandry.traits', { defaultValue: 'Traits' })}</label>
              <div className="trait-search-container">
                <input
                  type="text"
                  placeholder={t('husbandry.traitSearchPlaceholder', { defaultValue: 'Buscar por categoria...' })}
                  value={traitSearchText}
                  onChange={(e) => setTraitSearchText(e.target.value)}
                  disabled={loading}
                  className="trait-search-input"
                />
                {traitSearchText && (
                  <button
                    type="button"
                    className="trait-search-clear"
                    onClick={() => setTraitSearchText('')}
                    title={t('common.close')}
                  >
                    ×
                  </button>
                )}
              </div>
              {traitSearchText && filteredTraits.length > 0 && (
                <div className="trait-search-results">
                  {t('husbandry.traitSearchResults', { defaultValue: 'Encontrados' })}: {filteredTraits.length} {filteredTraits.length === 1 ? t('husbandry.trait', { defaultValue: 'trait' }) : t('husbandry.traits', { defaultValue: 'traits' })}
                </div>
              )}
              <div className="traits-container">
                {filteredTraits.length === 0 ? (
                  <div className="no-traits-found">
                    {t('husbandry.noTraitsFound', { defaultValue: 'Nenhum trait encontrado com essa categoria' })}
                  </div>
                ) : (
                  filteredTraits.map((traitObj) => {
                    const traitName = typeof traitObj === 'string' ? traitObj : traitObj.trait
                    const categories = typeof traitObj === 'string' ? [] : (traitObj.categories || [])
                    return (
                      <label key={traitName} className="trait-checkbox">
                        <input
                          type="checkbox"
                          checked={selectedTraits.includes(traitName)}
                          onChange={() => handleToggleTrait(traitName)}
                          disabled={loading}
                        />
                        <span>
                          {traitName}
                          {categories.length > 0 && (
                            <span className="trait-categories">
                              {' '}({categories.join(', ')})
                            </span>
                          )}
                        </span>
                      </label>
                    )
                  })
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="animalNotes">{t('husbandry.notes', { defaultValue: 'Notas' })}</label>
              <textarea
                id="animalNotes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={loading}
                placeholder={t('husbandry.notesPlaceholder', { defaultValue: 'Notas adicionais...' })}
                rows="3"
              />
            </div>

            {message && (
              <div className={`form-message ${message.includes('Erro') || message.includes('erro') ? 'error' : 'success'}`}>
                {message}
              </div>
            )}

            <div className="form-actions">
              <button
                type="button"
                onClick={() => {
                  resetForm()
                  setIsOpen(false)
                }}
                disabled={loading}
                className="btn-cancel"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-submit"
              >
                {loading ? t('common.processing') : (editingAnimal ? t('common.save') : t('common.add'))}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default HusbandryForm

