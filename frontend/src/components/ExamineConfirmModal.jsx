import React, { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { FaTimes } from 'react-icons/fa'
import { api } from '../api'
import { ANIMAL_TYPES, ANIMAL_AGES, ANIMAL_CONDITIONS, ANIMAL_GENDERS, ANIMAL_TRAITS } from '../constants'
import './ExamineConfirmModal.css'

function ExamineConfirmModal({ isOpen, onClose, parsedAnimal, onConfirm }) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [type, setType] = useState(parsedAnimal?.type || 'horse')
  const [gender, setGender] = useState(parsedAnimal?.gender || 'male')
  const [age, setAge] = useState('young')
  const [condition, setCondition] = useState('none')
  const [father, setFather] = useState(parsedAnimal?.father || '')
  const [mother, setMother] = useState(parsedAnimal?.mother || '')
  const [selectedTraits, setSelectedTraits] = useState(parsedAnimal?.traits || [])
  const [notes, setNotes] = useState('')
  const [traitSearchText, setTraitSearchText] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && parsedAnimal) {
      setName('')
      setType(parsedAnimal.type || 'horse')
      setGender(parsedAnimal.gender || 'male')
      setAge('young')
      setCondition('none')
      setFather(parsedAnimal.father || 'wild')
      setMother(parsedAnimal.mother || 'wild')
      setSelectedTraits(parsedAnimal.traits || [])
      setNotes('')
      setTraitSearchText('')
    }
  }, [isOpen, parsedAnimal])

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

  const toggleTrait = (traitName) => {
    setSelectedTraits(prev => {
      if (prev.includes(traitName)) {
        return prev.filter(t => t !== traitName)
      } else {
        return [...prev, traitName]
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!name.trim()) {
      alert(t('husbandry.nameRequired', { defaultValue: 'Por favor, preencha o nome' }))
      return
    }

    const animalData = {
      name,
      type,
      gender,
      age,
      condition,
      father: father || 'wild',
      mother: mother || 'wild',
      traits: selectedTraits,
      notes
    }
    
    console.log('[ExamineConfirmModal] Iniciando salvamento do animal:', animalData)

    setLoading(true)
    try {
      console.log('[ExamineConfirmModal] Chamando api.createAnimal...')
      const result = await api.createAnimal(
        name,
        type,
        gender,
        age,
        condition,
        father || 'wild',
        mother || 'wild',
        selectedTraits,
        notes
      )
      console.log('[ExamineConfirmModal] Animal salvo com sucesso:', result)
      onConfirm()
    } catch (error) {
      console.error('[ExamineConfirmModal] Erro ao adicionar animal:', error)
      console.error('[ExamineConfirmModal] Detalhes do erro:', {
        message: error.message,
        stack: error.stack,
        error: error
      })
      alert(`${t('husbandry.error', { defaultValue: 'Erro' })}: ${error.message || t('common.error')}`)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content examine-confirm-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{t('husbandry.examine.confirmTitle', { defaultValue: 'Confirmar Animal Examinado' })}</h3>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-form">
          <div className="examine-preview">
            <h4>{t('husbandry.examine.extractedData', { defaultValue: 'Dados Extraídos do Examine' })}</h4>
            <div className="preview-info">
              {parsedAnimal?.examineTimestamp && (
                <p><strong>{t('husbandry.examine.timestamp', { defaultValue: 'Timestamp' })}:</strong> 
                  <span style={{ fontFamily: 'monospace', marginLeft: '8px' }}>[{parsedAnimal.examineTimestamp}]</span>
                </p>
              )}
              <p><strong>{t('husbandry.type', { defaultValue: 'Tipo' })}:</strong> {
                ANIMAL_TYPES.find(t => t.value === parsedAnimal?.type)?.label || parsedAnimal?.type
              }</p>
              <p><strong>{t('husbandry.gender', { defaultValue: 'Sexo' })}:</strong> {
                ANIMAL_GENDERS.find(g => g.value === parsedAnimal?.gender)?.label || parsedAnimal?.gender
              }</p>
              <p><strong>{t('husbandry.traits', { defaultValue: 'Traits' })}:</strong> {
                parsedAnimal?.traits?.length || 0
              } {t('husbandry.examine.traitsFound', { defaultValue: 'traits encontrados' })}</p>
              <p><strong>{t('husbandry.father', { defaultValue: 'Pai' })}:</strong> {parsedAnimal?.father || 'wild'}</p>
              <p><strong>{t('husbandry.mother', { defaultValue: 'Mãe' })}:</strong> {parsedAnimal?.mother || 'wild'}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>{t('husbandry.name', { defaultValue: 'Nome' })} *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('husbandry.namePlaceholder', { defaultValue: 'Nome do animal' })}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>{t('husbandry.type', { defaultValue: 'Tipo' })}</label>
                <select value={type} onChange={(e) => setType(e.target.value)}>
                  {ANIMAL_TYPES.map(animalType => (
                    <option key={animalType.value} value={animalType.value}>
                      {animalType.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>{t('husbandry.gender', { defaultValue: 'Sexo' })}</label>
                <select value={gender} onChange={(e) => setGender(e.target.value)}>
                  {ANIMAL_GENDERS.map(g => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>{t('husbandry.age', { defaultValue: 'Idade' })}</label>
                <select value={age} onChange={(e) => setAge(e.target.value)}>
                  {ANIMAL_AGES.map(a => (
                    <option key={a.value} value={a.value}>
                      {a.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>{t('husbandry.condition', { defaultValue: 'Condição' })}</label>
                <select value={condition} onChange={(e) => setCondition(e.target.value)}>
                  {ANIMAL_CONDITIONS.map(c => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>{t('husbandry.father', { defaultValue: 'Pai' })}</label>
                <input
                  type="text"
                  value={father}
                  onChange={(e) => setFather(e.target.value)}
                  placeholder={t('husbandry.fatherPlaceholder', { defaultValue: 'Nome do pai ou \"wild\"' })}
                />
              </div>

              <div className="form-group">
                <label>{t('husbandry.mother', { defaultValue: 'Mãe' })}</label>
                <input
                  type="text"
                  value={mother}
                  onChange={(e) => setMother(e.target.value)}
                  placeholder={t('husbandry.motherPlaceholder', { defaultValue: 'Nome da mãe ou \"wild\"' })}
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
                  className="trait-search-input"
                />
                {traitSearchText && (
                  <button
                    className="trait-search-clear"
                    onClick={() => setTraitSearchText('')}
                    title={t('common.close')}
                  >
                    ×
                  </button>
                )}
              </div>
              <div className="traits-selection">
                {filteredTraits.length > 0 ? (
                  <>
                    <div className="trait-search-results">
                      {t('husbandry.traitSearchResults', { defaultValue: 'Encontrados' })}: {filteredTraits.length}
                    </div>
                    <div className="traits-list">
                      {filteredTraits.map((traitData, index) => {
                        const isSelected = selectedTraits.includes(traitData.trait)
                        return (
                          <button
                            key={index}
                            type="button"
                            className={`trait-item ${isSelected ? 'selected' : ''}`}
                            onClick={() => toggleTrait(traitData.trait)}
                          >
                            <span className="trait-name">{traitData.trait}</span>
                            <span className="trait-categories">
                              {traitData.categories.join(', ')}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </>
                ) : (
                  <div className="no-traits-found">
                    {t('husbandry.noTraitsFound', { defaultValue: 'Nenhum trait encontrado com essa categoria' })}
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>{t('husbandry.notes', { defaultValue: 'Notas' })}</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('husbandry.notesPlaceholder', { defaultValue: 'Notas adicionais...' })}
                rows="3"
              />
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={onClose}
                disabled={loading}
              >
                {t('common.cancel', { defaultValue: 'Cancelar' })}
              </button>
              <button
                type="submit"
                className="btn-confirm"
                disabled={loading || !name.trim()}
              >
                {loading ? t('common.loading', { defaultValue: 'Carregando...' }) : t('husbandry.addAnimal', { defaultValue: 'Adicionar Animal' })}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ExamineConfirmModal

