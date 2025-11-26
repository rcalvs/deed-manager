import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FaCheckCircle, FaDownload, FaSpinner, FaTimesCircle } from 'react-icons/fa'
import { api } from '../api'
import './UpdateChecker.css'

function UpdateChecker() {
  const { t } = useTranslation()
  const [updateInfo, setUpdateInfo] = useState(null)
  const [checking, setChecking] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState(null)
  const [canUpdate, setCanUpdate] = useState(false)

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

    try {
      const info = await api.checkForUpdate()
      setUpdateInfo(info)
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

    const confirmed = confirm(
      t('updates.updateConfirm', {
        current: updateInfo.currentVersion,
        latest: updateInfo.latestVersion
      })
    )

    if (!confirmed) {
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

      {updateInfo && (
        <div className="update-info">
          {updateInfo.available ? (
            <>
              <div className="update-available">
                <FaCheckCircle className="icon-success" />
                <div className="update-details">
                  <p className="update-title">{t('updates.updateAvailable')}</p>
                  <p className="update-versions">
                    {t('updates.currentVersion')}: <strong>{updateInfo.currentVersion}</strong>
                    <br />
                    {t('updates.latestVersion')}: <strong>{updateInfo.latestVersion}</strong>
                  </p>
                  {updateInfo.releaseNotes && (
                    <div className="release-notes">
                      <strong>{t('updates.releaseNotes')}:</strong>
                      <pre>{updateInfo.releaseNotes}</pre>
                    </div>
                  )}
                </div>
              </div>
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
            </>
          ) : (
            <div className="update-not-available">
              <FaCheckCircle className="icon-info" />
              <p>{t('updates.noUpdate')} ({updateInfo.currentVersion})</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default UpdateChecker

