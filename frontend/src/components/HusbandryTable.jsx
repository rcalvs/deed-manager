import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FaCompress, FaEdit, FaExpand, FaSearch, FaTrashAlt } from 'react-icons/fa'
import { api } from '../api'
import { ANIMAL_AGES, ANIMAL_CONDITIONS, ANIMAL_GENDERS, ANIMAL_TYPES, ANIMAL_TRAITS } from '../constants'
import './HusbandryTable.css'

function HusbandryTable({ animals, loading, onAnimalDeleted, onAnimalUpdated }) {
  const { t } = useTranslation()
  const [searchText, setSearchText] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [editingAnimal, setEditingAnimal] = useState(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [tooltipState, setTooltipState] = useState({ visible: false, text: '', x: 0, y: 0 })

  // Filtrar animais por tipo e texto de busca
  const filteredAnimals = useMemo(() => {
    if (!animals || animals.length === 0) {
      return []
    }
    
    let filtered = animals
    
    // Filtrar por tipo
    if (selectedType !== 'all') {
      filtered = filtered.filter(animal => animal.type === selectedType)
    }
    
    // Filtrar por texto de busca (nome)
    if (searchText && searchText.trim() !== '') {
      const searchLower = searchText.toLowerCase().trim()
      filtered = filtered.filter(animal => {
        const name = (animal.name || '').toLowerCase()
        return name.includes(searchLower)
      })
    }
    
    return filtered
  }, [animals, selectedType, searchText])

  const handleDelete = async (id) => {
    if (!confirm(t('husbandry.deleteConfirm', { defaultValue: 'Tem certeza que deseja excluir este animal?' }))) {
      return
    }

    try {
      await api.deleteAnimal(id)
      onAnimalDeleted()
    } catch (error) {
      console.error('Erro ao deletar animal:', error)
      alert(`${t('husbandry.error', { defaultValue: 'Erro' })}: ${error.message || t('common.error')}`)
    }
  }

  const handleEdit = (animal) => {
    setEditingAnimal(animal)
    // Disparar evento para abrir o formulário com dados do animal
    const event = new CustomEvent('edit-animal', {
      detail: { animal }
    })
    window.dispatchEvent(event)
  }

  const getAnimalTypeLabel = (type) => {
    const animalType = ANIMAL_TYPES.find(at => at.value === type)
    return animalType ? animalType.label : type
  }

  const getAnimalAgeLabel = (age) => {
    const animalAge = ANIMAL_AGES.find(aa => aa.value === age)
    return animalAge ? animalAge.label : age
  }

  const getAnimalConditionLabel = (condition) => {
    const animalCondition = ANIMAL_CONDITIONS.find(ac => ac.value === condition)
    return animalCondition ? animalCondition.label : condition
  }

  const getAnimalGenderLabel = (gender) => {
    const animalGender = ANIMAL_GENDERS.find(ag => ag.value === gender)
    return animalGender ? animalGender.label : gender
  }

  const handleTraitsMouseEnter = (e, tooltipText) => {
    if (!tooltipText) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    setTooltipState({
      visible: true,
      text: tooltipText,
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    })
  }

  const handleTraitsMouseLeave = () => {
    setTooltipState({ visible: false, text: '', x: 0, y: 0 })
  }

  // Mapeamento de categorias para letras
  const categoryMap = {
    'Draft': 'D',
    'Miscellaneous': 'M',
    'Output': 'O',
    'Combat': 'C',
    'Speed': 'S',
    'Negative': 'N'
  }

  // Função para formatar traits em formato abreviado (ex: "4D2M")
  const formatTraitsAbbreviation = (traits) => {
    if (!traits || traits.length === 0) {
      return { abbreviation: '-', fullList: [] }
    }

    // Contar traits por categoria
    const categoryCounts = {}
    const traitDetails = []

    traits.forEach((traitName) => {
      // Encontrar o trait na lista de constantes
      const traitData = ANIMAL_TRAITS.find(t => t.trait === traitName)
      
      if (traitData) {
        traitDetails.push({
          name: traitName,
          categories: traitData.categories
        })

        // Contar por categoria (ignorar 'Rare' que é uma subcategoria)
        traitData.categories.forEach(category => {
          if (category !== 'Rare' && categoryMap[category]) {
            categoryCounts[category] = (categoryCounts[category] || 0) + 1
          }
        })
      } else {
        // Se não encontrar, adiciona como Miscellaneous
        traitDetails.push({
          name: traitName,
          categories: ['Miscellaneous']
        })
        categoryCounts['Miscellaneous'] = (categoryCounts['Miscellaneous'] || 0) + 1
      }
    })

    // Ordenar categorias na ordem: D, O, C, S, M, N
    const categoryOrder = ['Draft', 'Output', 'Combat', 'Speed', 'Miscellaneous', 'Negative']
    const sortedCategories = categoryOrder.filter(cat => categoryCounts[cat] > 0)

    // Gerar string abreviada
    const abbreviation = sortedCategories
      .map(category => `${categoryCounts[category]}${categoryMap[category]}`)
      .join('')

    return {
      abbreviation: abbreviation || '-',
      fullList: traitDetails
    }
  }


  if (loading) {
    return (
      <div className="husbandry-table-container">
        <h2>{t('husbandry.title', { defaultValue: 'Animais' })}</h2>
        <div className="loading">{t('common.loading')}</div>
      </div>
    )
  }

  if (!animals || animals.length === 0) {
    return (
      <div className="husbandry-table-container">
        <h2>{t('husbandry.title', { defaultValue: 'Animais' })}</h2>
        <div className="empty-state">{t('husbandry.noAnimals', { defaultValue: 'Nenhum animal cadastrado' })}</div>
      </div>
    )
  }

  const renderTableContent = () => (
    <>
      <h2 className="table-title" style={{ marginBottom: '0' }}>{t('husbandry.title', { defaultValue: 'Animais' })}</h2>
      <div className="table-header">
        <div className="table-header-actions">
          <div className="table-filters">
            <div className="search-filter">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder={t('husbandry.searchPlaceholder', { defaultValue: 'Buscar animais...' })}
                value={searchText || ''}
                onChange={(e) => setSearchText(e.target.value)}
                className="search-input"
                style={{ paddingLeft: '2rem' }}
              />
              {searchText && (
                <button
                  className="search-clear"
                  onClick={() => setSearchText('')}
                  title={t('common.close')}
                >
                  ×
                </button>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="category-filter"
              >
                <option value="all">{t('husbandry.allTypes', { defaultValue: 'Todos os Tipos' })}</option>
                {ANIMAL_TYPES.map((animalType) => (
                  <option key={animalType.value} value={animalType.value}>
                    {animalType.label}
                  </option>
                ))}
              </select>
              <button
                className="btn-expand"
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? t('common.compress', { defaultValue: 'Comprimir' }) : t('common.expand', { defaultValue: 'Expandir para tela cheia' })}
              >
                {isExpanded ? <FaCompress /> : <FaExpand />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="husbandry-table">
          <thead>
            <tr>
              <th>{t('husbandry.name', { defaultValue: 'Nome' })}</th>
              <th>{t('husbandry.type', { defaultValue: 'Tipo' })}</th>
              <th>{t('husbandry.gender', { defaultValue: 'Sexo' })}</th>
              <th>{t('husbandry.age', { defaultValue: 'Idade' })}</th>
              <th>{t('husbandry.condition', { defaultValue: 'Condição' })}</th>
              <th>{t('husbandry.father', { defaultValue: 'Pai' })}</th>
              <th>{t('husbandry.mother', { defaultValue: 'Mãe' })}</th>
              <th>{t('husbandry.traits', { defaultValue: 'Traits' })}</th>
              <th>{t('husbandry.notes', { defaultValue: 'Notas' })}</th>
              <th>{t('common.actions', { defaultValue: 'Ações' })}</th>
            </tr>
          </thead>
          <tbody>
            {filteredAnimals.length === 0 ? (
              <tr>
                <td colSpan="10" className="empty-state">
                  {searchText || selectedType !== 'all'
                    ? t('husbandry.noAnimalsFiltered', { defaultValue: 'Nenhum animal encontrado com os filtros aplicados' })
                    : t('husbandry.noAnimals', { defaultValue: 'Nenhum animal cadastrado' })}
                </td>
              </tr>
            ) : (
              filteredAnimals.map((animal) => (
                <tr key={animal.id}>
                  <td>{animal.name}</td>
                  <td>{getAnimalTypeLabel(animal.type)}</td>
                  <td>{getAnimalGenderLabel(animal.gender)}</td>
                  <td>{getAnimalAgeLabel(animal.age)}</td>
                  <td>
                    {(() => {
                      const traitsInfo = formatTraitsAbbreviation(animal.traits)
                      const tooltipText = traitsInfo.fullList.length > 0
                        ? traitsInfo.fullList.map(t => t.name).join('\n')
                        : ''
                      
                      return (
                        <div className="traits-cell-container">
                          <span 
                            className="traits-abbreviation"
                            onMouseEnter={(e) => handleTraitsMouseEnter(e, tooltipText)}
                            onMouseLeave={handleTraitsMouseLeave}
                          >
                            {traitsInfo.abbreviation}
                          </span>
                        </div>
                      )
                    })()}
                  </td>
                  <td>{getAnimalConditionLabel(animal.condition)}</td>
                  <td>{animal.father || '-'}</td>
                  <td>{animal.mother || '-'}</td>
                  <td>{animal.notes || '-'}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn-edit"
                        onClick={() => handleEdit(animal)}
                        title={t('common.edit')}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(animal.id)}
                        title={t('common.delete')}
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {tooltipState.visible && (
        <div 
          className="traits-tooltip-fixed"
          style={{
            left: `${tooltipState.x}px`,
            top: `${tooltipState.y}px`,
            transform: 'translate(-50%, -100%)'
          }}
        >
          {tooltipState.text}
        </div>
      )}
    </>
  )

  if (isExpanded) {
    return (
      <>
        <div className="husbandry-table-expanded-overlay" onClick={() => setIsExpanded(false)}>
          <div className="husbandry-table-container husbandry-table-expanded" onClick={(e) => e.stopPropagation()}>
            {renderTableContent()}
          </div>
        </div>
      </>
    )
  }

  return (
    <div className="husbandry-table-container">
      {renderTableContent()}
    </div>
  )
}

export default HusbandryTable

