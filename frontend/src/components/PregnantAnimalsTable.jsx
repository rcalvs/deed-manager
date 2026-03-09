import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FaEllipsisV } from 'react-icons/fa'
import { api } from '../api'
import { ANIMAL_TRAITS } from '../constants'
import BirthModal from './BirthModal'
import './PregnantAnimalsTable.css'

function PregnantAnimalsTable({ onUpdate }) {
  const { t } = useTranslation()
  const [pregnantAnimals, setPregnantAnimals] = useState([])
  const [loading, setLoading] = useState(true)
  const [maleCache, setMaleCache] = useState({})
  const [selectedAnimal, setSelectedAnimal] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    loadPregnantAnimals()
  }, [])

  const loadPregnantAnimals = async () => {
    try {
      setLoading(true)
      const data = await api.getPregnantAnimals()
      setPregnantAnimals(data || [])
      
      // Carregar informações dos machos
      const maleIds = [...new Set(data.filter(a => a.breedingMaleId).map(a => a.breedingMaleId).filter(id => id != null))]
      const males = {}
      for (const maleId of maleIds) {
        try {
          const male = await api.getAnimal(maleId)
          if (male) {
            males[maleId] = male
          }
        } catch (error) {
          console.error(`Erro ao carregar macho ${maleId}:`, error)
        }
      }
      setMaleCache(males)
    } catch (error) {
      console.error('Erro ao carregar fêmeas grávidas:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPregnantAnimals()
  }, [onUpdate])

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

  const formatTimeUntilBirth = (dueDate) => {
    if (!dueDate) return '-'
    
    const now = new Date()
    const due = new Date(dueDate)
    const diff = due - now

    if (diff <= 0) {
      return t('husbandry.breeding.due', { defaultValue: 'Vencido' })
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) {
      return `${days}d ${hours}h`
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `${minutes}m`
    }
  }

  const handleOpenModal = (animal) => {
    setSelectedAnimal(animal)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedAnimal(null)
  }

  const handleBirthComplete = () => {
    loadPregnantAnimals()
  }

  const handleCancelPregnancy = () => {
    loadPregnantAnimals()
  }

  if (loading) {
    return (
      <div className="pregnant-animals-table">
        <h3>{t('husbandry.breeding.pregnantAnimals', { defaultValue: 'Fêmeas Grávidas' })}</h3>
        <div className="loading">{t('common.loading', { defaultValue: 'Carregando...' })}</div>
      </div>
    )
  }

  if (pregnantAnimals.length === 0) {
    return (
      <div className="pregnant-animals-table">
        <h3>{t('husbandry.breeding.pregnantAnimals', { defaultValue: 'Fêmeas Grávidas' })}</h3>
        <div className="empty-state">{t('husbandry.breeding.noPregnant', { defaultValue: 'Nenhuma fêmea grávida' })}</div>
      </div>
    )
  }

  return (
    <div className="pregnant-animals-table">
      <h3>{t('husbandry.breeding.pregnantAnimals', { defaultValue: 'Fêmeas Grávidas' })}</h3>
      <div className="table-wrapper">
        <table className="pregnant-table">
          <thead>
            <tr>
              <th>{t('husbandry.name', { defaultValue: 'Nome' })}</th>
              <th>{t('husbandry.traits', { defaultValue: 'Traits' })}</th>
              <th>{t('husbandry.breeding.male', { defaultValue: 'Macho' })}</th>
              <th>{t('husbandry.breeding.maleTraits', { defaultValue: 'Traits do Macho' })}</th>
              <th>{t('husbandry.breeding.timeUntilBirth', { defaultValue: 'Tempo para Nascimento' })}</th>
              <th>{t('common.actions', { defaultValue: 'Ações' })}</th>
            </tr>
          </thead>
          <tbody>
            {pregnantAnimals.map((animal) => {
              const male = animal.breedingMaleId ? maleCache[animal.breedingMaleId] : null
              return (
                <tr key={animal.id}>
                  <td>{animal.name}</td>
                  <td>
                    <span className="traits-badge">
                      {formatTraitsAbbreviation(animal.traits)}
                    </span>
                  </td>
                  <td>{male ? male.name : '-'}</td>
                  <td>
                    {male ? (
                      <span className="traits-badge">
                        {formatTraitsAbbreviation(male.traits)}
                      </span>
                    ) : '-'}
                  </td>
                  <td>{formatTimeUntilBirth(animal.breedingDueDate)}</td>
                  <td>
                    <button
                      className="btn-options"
                      onClick={() => handleOpenModal(animal)}
                      title={t('husbandry.breeding.options', { defaultValue: 'Opções' })}
                    >
                      <FaEllipsisV />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {selectedAnimal && (
        <BirthModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          female={selectedAnimal}
          male={selectedAnimal.breedingMaleId ? maleCache[selectedAnimal.breedingMaleId] : null}
          onBirthComplete={handleBirthComplete}
          onCancelPregnancy={handleCancelPregnancy}
        />
      )}
    </div>
  )
}

export default PregnantAnimalsTable

