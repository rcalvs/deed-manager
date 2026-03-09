import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '../api'
import HusbandryForm from './HusbandryForm'
import './HusbandryTab.css'
import HusbandryTable from './HusbandryTable'
import BreedingManager from './BreedingManager'
import PregnantAnimalsTable from './PregnantAnimalsTable'

function HusbandryTab() {
  const { t } = useTranslation()
  const [animals, setAnimals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnimals()
  }, [])

  const loadAnimals = async () => {
    try {
      setLoading(true)
      const data = await api.getAllAnimals()
      setAnimals(data || [])
    } catch (error) {
      console.error('Erro ao carregar animais:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAnimalAdded = () => {
    loadAnimals()
  }

  const handleAnimalUpdated = () => {
    loadAnimals()
  }

  const handleAnimalDeleted = () => {
    loadAnimals()
  }

  const [breedingUpdate, setBreedingUpdate] = useState(0)

  const handleBreedingComplete = () => {
    loadAnimals()
    setBreedingUpdate(prev => prev + 1)
  }

  return (
    <div className="husbandry-tab-content">
      <div className="left-panel" >
        <HusbandryForm 
          onAnimalAdded={handleAnimalAdded}
          onAnimalUpdated={handleAnimalUpdated}
        />
        <HusbandryTable 
          animals={animals || []}
          loading={loading}
          onAnimalDeleted={handleAnimalDeleted}
          onAnimalUpdated={handleAnimalUpdated}
        />
      </div>
      <div className="right-panel">
        <BreedingManager 
          animals={animals || []}
          onBreedingComplete={handleBreedingComplete}
        />
        <PregnantAnimalsTable 
          onUpdate={breedingUpdate}
        />
      </div>
    </div>
  )
}

export default HusbandryTab

