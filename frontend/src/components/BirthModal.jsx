import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FaTimes } from 'react-icons/fa'
import { api } from '../api'
import { ANIMAL_AGES, ANIMAL_CONDITIONS, ANIMAL_GENDERS, ANIMAL_TRAITS, ANIMAL_TYPES } from '../constants'
import './BirthModal.css'

function BirthModal({ isOpen, onClose, female, male, onBirthComplete, onCancelPregnancy }) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [type, setType] = useState(female?.type || 'horse')
  const [gender, setGender] = useState('male')
  const [age, setAge] = useState('young')
  const [condition, setCondition] = useState('none')
  const [selectedTraits, setSelectedTraits] = useState([])
  const [traitSearchText, setTraitSearchText] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setName('')
      setType(female?.type || 'horse')
      setGender('male')
      setAge('young')
      setCondition('none')
      setSelectedTraits([])
      setTraitSearchText('')
    }
  }, [isOpen, female])

  const filteredTraits = useMemo(() => {
    if (!traitSearchText.trim()) {
      return ANIMAL_TRAITS
    }
    const searchLower = traitSearchText.toLowerCase()
    return ANIMAL_TRAITS.filter(traitData => {
      return traitData.categories.some(cat => 
        cat.toLowerCase().includes(searchLower)
      )
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

  const handleAddAnimal = async () => {
    if (!name.trim()) {
      alert(t('husbandry.nameRequired', { defaultValue: 'Por favor, preencha o nome' }))
      return
    }

    setLoading(true)
    try {
      await api.createAnimal(
        name,
        type,
        gender,
        age,
        condition,
        male?.name || 'wild',
        female?.name || 'wild',
        selectedTraits,
        ''
      )
      
      // Limpar status de grávida
      await api.clearBreeding(female.id)
      
      onBirthComplete()
      onClose()
    } catch (error) {
      console.error('Erro ao adicionar animal:', error)
      alert(`${t('husbandry.error', { defaultValue: 'Erro' })}: ${error.message || t('common.error')}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelPregnancy = async () => {
    setLoading(true)
    try {
      await api.clearBreeding(female.id)
      onCancelPregnancy()
      onClose()
    } catch (error) {
      console.error('Erro ao cancelar gravidez:', error)
      alert(`${t('husbandry.error', { defaultValue: 'Erro' })}: ${error.message || t('common.error')}`)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  // Função para formatar traits
  const formatTraitsAbbreviation = (traits) => {
    if (!traits || traits.length === 0) return '-'
    
    const categoryMap = {
      'Draft': 'D',
      'Miscellaneous': 'M',
      'Output': 'O',
      'Combat': 'C',
      'Speed': 'S',
      'Negative': 'N'
    }

    const categoryCounts = {}
    traits.forEach((traitName) => {
      const traitData = ANIMAL_TRAITS.find(t => t.trait === traitName)
      if (traitData) {
        traitData.categories.forEach(category => {
          if (category !== 'Rare' && categoryMap[category]) {
            categoryCounts[category] = (categoryCounts[category] || 0) + 1
          }
        })
      } else {
        categoryCounts['Miscellaneous'] = (categoryCounts['Miscellaneous'] || 0) + 1
      }
    })

    const categoryOrder = ['Draft', 'Output', 'Combat', 'Speed', 'Miscellaneous', 'Negative']
    const sortedCategories = categoryOrder.filter(cat => categoryCounts[cat] > 0)

    return sortedCategories
      .map(category => `${categoryCounts[category]}${categoryMap[category]}`)
      .join('') || '-'
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content birth-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{t('husbandry.breeding.birthModalTitle', { defaultValue: 'Gerenciar Nascimento' })}</h3>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-form">
          <div className="parent-info">
            <div className="parent-card">
              <h4>{t('husbandry.mother', { defaultValue: 'Mãe' })}</h4>
              <p><strong>{t('husbandry.name', { defaultValue: 'Nome' })}:</strong> {female?.name || '-'}</p>
              <p><strong>{t('husbandry.traits', { defaultValue: 'Traits' })}:</strong> 
                <span className="traits-badge">{formatTraitsAbbreviation(female?.traits || [])}</span>
              </p>
            </div>
            <div className="parent-card">
              <h4>{t('husbandry.father', { defaultValue: 'Pai' })}</h4>
              <p><strong>{t('husbandry.name', { defaultValue: 'Nome' })}:</strong> {male?.name || '-'}</p>
              <p><strong>{t('husbandry.traits', { defaultValue: 'Traits' })}:</strong> 
                <span className="traits-badge">{formatTraitsAbbreviation(male?.traits || [])}</span>
              </p>
            </div>
          </div>

          <div className="form-section">
            <h4>{t('husbandry.breeding.newAnimalInfo', { defaultValue: 'Informações do Novo Animal' })}</h4>
            
            <div className="form-group">
              <label>{t('husbandry.name', { defaultValue: 'Nome' })} *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('husbandry.namePlaceholder', { defaultValue: 'Nome do animal' })}
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
              <div className="traits-selection" style={{ minWidth: '100%' }}>
                {filteredTraits.length > 0 ? (
                  <>
                    <div className="trait-search-results">
                      {t('husbandry.traitSearchResults', { defaultValue: 'Encontrados' })}: {filteredTraits.length}
                    </div>
                    <div className="traits-list" style={{ minWidth: '100%' }}>
                      {filteredTraits.map((traitData, index) => {
                        const isSelected = selectedTraits.includes(traitData.trait)
                        return (
                          <button
                            key={index}
                            type="button"
                            className={`trait-item ${isSelected ? 'selected' : ''}`}
                            style={{ width: '100%' }}
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
          </div>

          <div className="modal-actions">
            <button
              className="btn-cancel-pregnancy"
              onClick={handleCancelPregnancy}
              disabled={loading}
            >
              {loading ? t('common.loading', { defaultValue: 'Carregando...' }) : t('husbandry.breeding.cancelPregnancy', { defaultValue: 'Cancelar Gravidez' })}
            </button>
            <button
              className="btn-add-animal"
              onClick={handleAddAnimal}
              disabled={loading || !name.trim()}
            >
              {loading ? t('common.loading', { defaultValue: 'Carregando...' }) : t('husbandry.breeding.addNewAnimal', { defaultValue: 'Adicionar Novo Animal' })}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BirthModal

