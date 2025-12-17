import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '../api'
import { ANIMAL_TRAITS } from '../constants'
import './BreedingManager.css'

function BreedingManager({ animals, onBreedingComplete }) {
  const { t } = useTranslation()
  const [selectedMale, setSelectedMale] = useState(null)
  const [selectedFemale, setSelectedFemale] = useState(null)
  const [pregnancyDays, setPregnancyDays] = useState('')
  const [pregnancyHours, setPregnancyHours] = useState('')
  const [loading, setLoading] = useState(false)

  // Filtrar animais elegíveis (Mature ou acima)
  const eligibleAges = ['mature', 'aged', 'old', 'venerable']
  
  const eligibleMales = useMemo(() => {
    if (!animals || !Array.isArray(animals)) return []
    return animals.filter(animal => 
      animal && 
      animal.gender === 'male' && 
      eligibleAges.includes(animal.age) &&
      !animal.isPregnant
    )
  }, [animals])

  const eligibleFemales = useMemo(() => {
    if (!animals || !Array.isArray(animals)) return []
    return animals.filter(animal => 
      animal && 
      animal.gender === 'female' && 
      eligibleAges.includes(animal.age) &&
      !animal.isPregnant
    )
  }, [animals])

  // Função para formatar traits (mesma lógica da tabela)
  const formatTraitsAbbreviation = (traits) => {
    if (!traits || traits.length === 0) {
      return '-'
    }

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

  const handleBreed = async () => {
    if (!selectedMale || !selectedFemale || !pregnancyDays || !pregnancyHours) {
      alert(t('husbandry.breeding.fillAllFields', { defaultValue: 'Por favor, preencha todos os campos' }))
      return
    }

    const days = parseInt(pregnancyDays)
    const hours = parseInt(pregnancyHours)

    if (isNaN(days) || isNaN(hours) || days < 0 || hours < 0 || hours >= 24) {
      alert(t('husbandry.breeding.invalidTime', { defaultValue: 'Por favor, insira valores válidos para dias e horas (0-23)' }))
      return
    }

    setLoading(true)
    try {
      await api.setBreeding(selectedFemale.id, selectedMale.id, days, hours)
      setSelectedMale(null)
      setSelectedFemale(null)
      setPregnancyDays('')
      setPregnancyHours('')
      onBreedingComplete()
    } catch (error) {
      console.error('Erro ao realizar acasalamento:', error)
      alert(`${t('husbandry.error', { defaultValue: 'Erro' })}: ${error.message || t('common.error')}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="breeding-manager">
      <h3>{t('husbandry.breeding.title', { defaultValue: 'Gerenciar Acasalamento' })}</h3>
      
      <div className="breeding-selectors">
        <div className="breeding-selector">
          <label>{t('husbandry.breeding.selectMale', { defaultValue: 'Selecionar Macho' })}</label>
          <select
            value={selectedMale?.id || ''}
            onChange={(e) => {
              const male = eligibleMales.find(m => m.id === parseInt(e.target.value))
              setSelectedMale(male || null)
            }}
          >
            <option value="">{t('husbandry.breeding.selectMale', { defaultValue: 'Selecionar Macho' })}</option>
            {eligibleMales.map(male => (
              <option key={male.id} value={male.id}>
                {male.name} ({formatTraitsAbbreviation(male.traits)})
              </option>
            ))}
          </select>
          {selectedMale && (
            <div className="selected-animal-info">
              <span className="animal-name">{selectedMale.name}</span>
              <span className="animal-traits">{formatTraitsAbbreviation(selectedMale.traits)}</span>
            </div>
          )}
        </div>

        <div className="breeding-selector">
          <label>{t('husbandry.breeding.selectFemale', { defaultValue: 'Selecionar Fêmea' })}</label>
          <select
            value={selectedFemale?.id || ''}
            onChange={(e) => {
              const female = eligibleFemales.find(f => f.id === parseInt(e.target.value))
              setSelectedFemale(female || null)
            }}
          >
            <option value="">{t('husbandry.breeding.selectFemale', { defaultValue: 'Selecionar Fêmea' })}</option>
            {eligibleFemales.map(female => (
              <option key={female.id} value={female.id}>
                {female.name} ({formatTraitsAbbreviation(female.traits)})
              </option>
            ))}
          </select>
          {selectedFemale && (
            <div className="selected-animal-info">
              <span className="animal-name">{selectedFemale.name}</span>
              <span className="animal-traits">{formatTraitsAbbreviation(selectedFemale.traits)}</span>
            </div>
          )}
        </div>
      </div>

      {(selectedMale && selectedFemale) && (
        <div className="pregnancy-time">
          <label>{t('husbandry.breeding.pregnancyTime', { defaultValue: 'Tempo de Gravidez' })}</label>
          <div className="time-inputs">
            <div className="time-input">
              <label>{t('husbandry.breeding.days', { defaultValue: 'Dias' })}</label>
              <input
                type="number"
                min="0"
                value={pregnancyDays}
                onChange={(e) => setPregnancyDays(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="time-input">
              <label>{t('husbandry.breeding.hours', { defaultValue: 'Horas' })}</label>
              <input
                type="number"
                min="0"
                max="23"
                value={pregnancyHours}
                onChange={(e) => setPregnancyHours(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
        </div>
      )}

      <button
        className="btn-breed"
        onClick={handleBreed}
        disabled={!selectedMale || !selectedFemale || !pregnancyDays || !pregnancyHours || loading}
      >
        {loading ? t('common.loading', { defaultValue: 'Carregando...' }) : t('husbandry.breeding.okay', { defaultValue: 'Okay' })}
      </button>
    </div>
  )
}

export default BreedingManager

