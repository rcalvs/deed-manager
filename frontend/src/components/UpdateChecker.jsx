import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FaCheckCircle, FaDownload, FaSpinner, FaTimes, FaTimesCircle } from 'react-icons/fa'
import { api } from '../api'
import './UpdateChecker.css'

function UpdateChecker() {
  const { t } = useTranslation()
  const [updateInfo, setUpdateInfo] = useState(null)
  const [checking, setChecking] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState(null)
  const [canUpdate, setCanUpdate] = useState(false)
  const [showUpdateModal, setShowUpdateModal] = useState(false)

  useEffect(() => {
    // Verificar se auto-update é suportado
    checkCanUpdate()
  }, [])

  const checkCanUpdate = async () => {
    try {
      const supported = await api.canAutoUpdate()
      setCanUpdate(supported)
    } catch (err) {
      console.error('Erro ao verificar suporte de atualização:', err)
      setCanUpdate(false)
    }
  }

  const handleCheckForUpdate = async () => {
    setChecking(true)
    setError(null)
    setUpdateInfo(null)
    setShowUpdateModal(false)

    try {
      const info = await api.checkForUpdate()
      setUpdateInfo(info)
      // Se houver update disponível, mostrar o modal
      if (info && info.available) {
        setShowUpdateModal(true)
      }
    } catch (err) {
      console.error('Erro ao verificar atualizações:', err)
      setError(t('updates.updateError'))
    } finally {
      setChecking(false)
    }
  }

  const handleApplyUpdate = async () => {
    if (!updateInfo || !updateInfo.available) {
      return
    }

    setUpdating(true)
    setError(null)

    try {
      await api.applyUpdate()
      alert(t('updates.updateSuccess'))
      // A aplicação será reiniciada automaticamente pelo Squirrel
      window.location.reload()
    } catch (err) {
      console.error('Erro ao aplicar atualização:', err)
      setError(t('updates.updateApplyError'))
      setUpdating(false)
    }
  }

  const handleCloseModal = () => {
    setShowUpdateModal(false)
  }

  if (!canUpdate) {
    return null // Não mostrar se auto-update não for suportado
  }

  return (
    <div className="update-checker">
      <div className="update-checker-header">
        <h3>{t('updates.title')}</h3>
        <button
          className="btn-check-update"
          onClick={handleCheckForUpdate}
          disabled={checking || updating}
        >
          {checking ? (
            <>
              <FaSpinner className="spinner" />
              {t('updates.checking')}
            </>
          ) : (
            t('updates.checkUpdates')
          )}
        </button>
      </div>

      {error && (
        <div className="update-error">
          <FaTimesCircle />
          <span>{error}</span>
        </div>
      )}

      {updateInfo && !updateInfo.available && (
        <div className="update-info">
          <div className="update-not-available">
            <FaCheckCircle className="icon-info" />
            <p>{t('updates.noUpdate')} ({updateInfo.currentVersion})</p>
          </div>
        </div>
      )}

      {/* Modal de atualização disponível */}
      {showUpdateModal && updateInfo && updateInfo.available && (
        <div className="update-modal-overlay" onClick={handleCloseModal}>
          <div className="update-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="update-modal-header">
              <div className="update-modal-title-section">
                <FaCheckCircle className="icon-success" />
                <h3>{t('updates.updateAvailable')}</h3>
              </div>
              <button className="update-modal-close" onClick={handleCloseModal}>
                <FaTimes />
              </button>
            </div>
            <div className="update-modal-body">
              <div className="update-versions-info">
                <p>
                  {t('updates.currentVersion')}: <strong>{updateInfo.currentVersion}</strong>
                </p>
                <p>
                  {t('updates.latestVersion')}: <strong>{updateInfo.latestVersion}</strong>
                </p>
              </div>
              {updateInfo.releaseNotes && (
                <div className="update-release-notes">
                  <strong>{t('updates.releaseNotes')}:</strong>
                  <div className="release-notes-content">
                    <pre>{updateInfo.releaseNotes}</pre>
                  </div>
                </div>
              )}
            </div>
            <div className="update-modal-footer">
              <button
                className="btn-apply-update"
                onClick={handleApplyUpdate}
                disabled={updating}
              >
                {updating ? (
                  <>
                    <FaSpinner className="spinner" />
                    {t('updates.installing')}
                  </>
                ) : (
                  <>
                    <FaDownload />
                    {t('updates.installUpdate')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UpdateChecker

