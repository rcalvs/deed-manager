import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FaEdit, FaExternalLinkAlt, FaPlus, FaSearch, FaTrashAlt } from 'react-icons/fa'
import { api } from '../api'
import { getRemainingUpkeep, getRemainingUpkeepTotalDays } from '../utils/deedUpkeep'
import AddFundsModal from './AddFundsModal'
import './DeedList.css'

function getUpkeepBorderClass(deed) {
  const totalDays = getRemainingUpkeepTotalDays(deed)
  if (totalDays === null) return 'deed-card'
  if (totalDays <= 0) return 'deed-card upkeep-critical'
  if (totalDays < 30) return 'deed-card upkeep-critical'
  if (totalDays < 60) return 'deed-card upkeep-warning'
  return 'deed-card'
}

function formatIron(iron) {
  if (!iron && iron !== 0) return '-'
  const gold = Math.floor(iron / 1000000)
  const silver = Math.floor((iron % 1000000) / 10000)
  const copper = Math.floor((iron % 10000) / 100)
  const i = iron % 100
  const parts = []
  if (gold > 0) parts.push(`${gold}g`)
  if (silver > 0) parts.push(`${silver}s`)
  if (copper > 0) parts.push(`${copper}c`)
  if (i > 0) parts.push(`${i}i`)
  return parts.length > 0 ? parts.join(', ') : '0i'
}

function DeedList({ deeds, loading, onDeedDeleted, onEditDeed, onDeedUpdated }) {
  const { t } = useTranslation()
  const [searchText, setSearchText] = useState('')
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deedToDelete, setDeedToDelete] = useState(null)
  const [addFundsDeed, setAddFundsDeed] = useState(null)

  const filteredDeeds = React.useMemo(() => {
    if (!deeds || deeds.length === 0) return []
    if (!searchText.trim()) return deeds
    const q = searchText.toLowerCase().trim()
    return deeds.filter(
      (d) =>
        (d.name || '').toLowerCase().includes(q) ||
        (d.mayor || '').toLowerCase().includes(q) ||
        (d.location || '').toLowerCase().includes(q)
    )
  }, [deeds, searchText])

  const handleDeleteClick = (deed) => {
    setDeedToDelete(deed)
    setDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deedToDelete) return
    try {
      await api.deleteDeed(deedToDelete.id)
      onDeedDeleted?.()
      setDeleteModalOpen(false)
      setDeedToDelete(null)
    } catch (error) {
      console.error('Erro ao deletar deed:', error)
      alert(`${t('deeds.error', { defaultValue: 'Erro' })}: ${error.message || t('common.error')}`)
    }
  }

  const handleOpenLocation = (deed) => {
    const loc = (deed.location || '').trim()
    if (!loc) return
    let url = loc
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url
    }
    window.open(url, '_blank')
  }

  if (loading) {
    return (
      <div className="deed-list-container">
        <div className="loading">{t('common.loading')}</div>
      </div>
    )
  }

  if (!deeds || deeds.length === 0) {
    return (
      <div className="deed-list-container">
        <h2>{t('deeds.title')}</h2>
        <div className="empty-state">{t('deeds.noDeeds', { defaultValue: 'Nenhum deed cadastrado' })}</div>
      </div>
    )
  }

  return (
    <div className="deed-list-container">
      <h2>{t('deeds.title')}</h2>
      <div className="deed-list-header">
        <div className="search-filter">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder={t('deeds.searchPlaceholder', { defaultValue: 'Buscar deeds...' })}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="search-input"
            style={{ paddingLeft: '2rem' }}
          />
        </div>
      </div>
      <div className="deed-list">
        {filteredDeeds.length === 0 ? (
          <div className="empty-state">{t('deeds.noDeedsFiltered', { defaultValue: 'Nenhum deed encontrado' })}</div>
        ) : (
          filteredDeeds.map((deed) => (
            <div key={deed.id} className={getUpkeepBorderClass(deed)}>
              <div className="deed-card-header">
                <h3>{deed.name || t('deeds.unnamed', { defaultValue: 'Sem nome' })}</h3>
                <div className="deed-card-actions">
                  <button
                    className="btn-add-funds"
                    onClick={() => setAddFundsDeed(deed)}
                    title={t('deeds.addFunds', { defaultValue: 'Adicionar fundos' })}
                  >
                    <FaPlus />
                  </button>
                  <button
                    className="btn-edit"
                    onClick={() => onEditDeed?.(deed)}
                    title={t('common.edit')}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDeleteClick(deed)}
                    title={t('common.delete')}
                  >
                    <FaTrashAlt />
                  </button>
                  {deed.location && (
                    <button
                      className="btn-link"
                      onClick={() => handleOpenLocation(deed)}
                      title={t('deeds.openMap')}
                    >
                      <FaExternalLinkAlt />
                    </button>
                  )}
                </div>
              </div>
              <div className="deed-card-body">
                {deed.mayor && (
                  <p>
                    <strong>{t('deeds.mayor')}:</strong> {deed.mayor}
                  </p>
                )}
                {deed.sizeWidth > 0 && deed.sizeHeight > 0 && (
                  <p>
                    <strong>{t('deeds.size', { defaultValue: 'Tamanho' })}:</strong> {deed.sizeWidth} x {deed.sizeHeight}
                  </p>
                )}
                {(deed.coffersIron > 0 || deed.upkeepChipsIron > 0) && (
                  <p>
                    <strong>{t('deeds.coffers', { defaultValue: 'Cofre' })}:</strong> {formatIron(deed.coffersIron)}
                    {deed.upkeepChipsIron > 0 && (
                      <span className="deed-upkeep-chips"> ({formatIron(deed.upkeepChipsIron)} chips)</span>
                    )}
                  </p>
                )}
                {deed.monthlyCostIron > 0 && (
                  <p>
                    <strong>{t('deeds.monthlyCost', { defaultValue: 'Custo mensal' })}:</strong> {formatIron(deed.monthlyCostIron)}
                  </p>
                )}
                {(deed.upkeepDays > 0 || deed.upkeepHours > 0 || deed.upkeepMinutes > 0) && (() => {
                  const remaining = getRemainingUpkeep(deed)
                  const display = remaining
                    ? remaining.days === 0 && remaining.hours === 0 && remaining.minutes === 0
                      ? t('deeds.upkeepExpired', { defaultValue: 'Expirado' })
                      : `${remaining.days}d ${remaining.hours}h ${remaining.minutes}m`
                    : `${deed.upkeepDays}d ${deed.upkeepHours}h ${deed.upkeepMinutes}m`
                  return (
                    <p>
                      <strong>{t('deeds.upkeepDuration')}:</strong> {display}
                    </p>
                  )
                })()}
              </div>
            </div>
          ))
        )}
      </div>

      <AddFundsModal
        deed={addFundsDeed}
        isOpen={!!addFundsDeed}
        onClose={() => setAddFundsDeed(null)}
        onSuccess={onDeedUpdated}
      />
      {deleteModalOpen && deedToDelete && (
        <div className="modal-overlay deed-delete-overlay" onClick={() => setDeleteModalOpen(false)}>
          <div className="modal-content deed-delete-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{t('deeds.deleteConfirm', { defaultValue: 'Excluir este deed?' })}</h3>
            <p>
              {t('deeds.name')}: {deedToDelete.name}
            </p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setDeleteModalOpen(false)}>
                {t('common.cancel')}
              </button>
              <button className="btn-confirm-delete" onClick={handleConfirmDelete}>
                {t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DeedList
