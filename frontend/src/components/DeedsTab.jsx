import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '../api'
import { checkDeedUpkeepNotifications, clearDeedUpkeepNotified } from '../utils/deedUpkeep'
import { createNotification } from '../utils/messageProcessing'
import DeedForm from './DeedForm'
import DeedList from './DeedList'
import './DeedsTab.css'

function DeedsTab() {
  const { t } = useTranslation()
  const [deeds, setDeeds] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingDeed, setEditingDeed] = useState(null)

  const loadDeeds = async () => {
    try {
      setLoading(true)
      const data = await api.getAllDeeds()
      setDeeds(data || [])
    } catch (error) {
      console.error('Erro ao carregar deeds:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDeeds()
  }, [])

  // Notificar quando upkeep restante desce de 60 ou 30 dias (também via polling no App)
  useEffect(() => {
    checkDeedUpkeepNotifications(deeds, t, createNotification)
  }, [deeds, t])

  const handleDeedAdded = () => {
    loadDeeds()
  }

  const handleDeedUpdated = () => {
    if (editingDeed?.id) clearDeedUpkeepNotified(editingDeed.id)
    loadDeeds()
    setEditingDeed(null)
  }

  const handleDeedDeleted = () => {
    loadDeeds()
  }

  const handleEditDeed = (deed) => {
    setEditingDeed(deed)
  }

  const handleEditCancel = () => {
    setEditingDeed(null)
  }

  return (
    <div className="deeds-tab-content">
      <div className="deeds-panel">
        <div className="deeds-panel-form">
          <DeedForm
            onDeedAdded={handleDeedAdded}
            onDeedUpdated={handleDeedUpdated}
            editingDeed={editingDeed}
            onEditCancel={handleEditCancel}
          />
        </div>
        <div className="deeds-panel-list" style={{ maxHeight: '90%' }}>
          <DeedList
            deeds={deeds}
            loading={loading}
            onDeedDeleted={handleDeedDeleted}
            onDeedUpdated={handleDeedUpdated}
            onEditDeed={handleEditDeed}
          />
        </div>
      </div>
    </div>
  )
}

export default DeedsTab
