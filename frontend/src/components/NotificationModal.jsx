import React from 'react'
import { useTranslation } from 'react-i18next'
import { FaTimes, FaTrash } from 'react-icons/fa'
import './NotificationModal.css'

function NotificationModal({ isOpen, notification, onClose, onDelete }) {
  const { t } = useTranslation()

  if (!isOpen || !notification) return null

  const handleDelete = () => {
    if (onDelete) {
      onDelete(notification.id)
    }
    onClose()
  }

  return (
    <div className="notification-modal-overlay" onClick={onClose}>
      <div className="notification-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="notification-modal-header">
          <h2>{t('notifications.details', { defaultValue: 'Detalhes da Notificação' })}</h2>
          <button className="notification-modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="notification-modal-body">
          <div className="notification-detail-timestamp">
            {new Date(notification.timestamp).toLocaleString()}
          </div>
          
          <div className="notification-detail-message">
            {notification.message}
          </div>
        </div>

        <div className="notification-modal-footer">
          <button 
            className="btn-notification-delete"
            onClick={handleDelete}
          >
            <FaTrash />
            {t('notifications.delete', { defaultValue: 'Deletar' })}
          </button>
          <button 
            className="btn-notification-close"
            onClick={onClose}
          >
            {t('common.close', { defaultValue: 'Fechar' })}
          </button>
        </div>
      </div>
    </div>
  )
}

export default NotificationModal

