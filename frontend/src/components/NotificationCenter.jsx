import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaTimes } from 'react-icons/fa';
import { IoIosNotificationsOutline } from "react-icons/io";
import './NotificationCenter.css';
import NotificationModal from './NotificationModal';

const NOTIFICATIONS_STORAGE_KEY = 'wurm_notifications'
const NOTIFICATIONS_READ_KEY = 'wurm_notifications_read_ids'

function NotificationCenter() {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [selectedNotification, setSelectedNotification] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Carregar notificações do localStorage
  useEffect(() => {
    const loadNotifications = () => {
      try {
        const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY)
        if (stored) {
          const parsed = JSON.parse(stored)
          // Ordenar por data (mais recentes primeiro)
          const sorted = parsed.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          setNotifications(sorted)
        }
      } catch (err) {
        console.error('Erro ao carregar notificações:', err)
      }
    }

    loadNotifications()

    // Escutar eventos de nova notificação
    const handleNewNotification = () => {
      loadNotifications()
    }

    window.addEventListener('wurm-new-notification', handleNewNotification)

    return () => {
      window.removeEventListener('wurm-new-notification', handleNewNotification)
    }
  }, [])

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Marcar notificações como lidas quando abrir
  useEffect(() => {
    if (isOpen && notifications.length > 0) {
      const readIds = new Set(
        JSON.parse(localStorage.getItem(NOTIFICATIONS_READ_KEY) || '[]')
      )
      
      const unreadCount = notifications.filter(n => !readIds.has(n.id)).length
      
      if (unreadCount > 0) {
        // Marcar todas como lidas
        const allIds = notifications.map(n => n.id)
        localStorage.setItem(NOTIFICATIONS_READ_KEY, JSON.stringify(allIds))
        
        // Disparar evento para atualizar contador
        window.dispatchEvent(new Event('wurm-notifications-read'))
      }
    }
  }, [isOpen, notifications])

  const getUnreadCount = () => {
    try {
      const readIds = new Set(
        JSON.parse(localStorage.getItem(NOTIFICATIONS_READ_KEY) || '[]')
      )
      return notifications.filter(n => !readIds.has(n.id)).length
    } catch {
      return notifications.length
    }
  }

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification)
    setIsModalOpen(true)
    setIsOpen(false)
  }

  const handleDeleteNotification = (notificationId) => {
    const updated = notifications.filter(n => n.id !== notificationId)
    setNotifications(updated)
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated))
    
    // Remover do set de lidas também
    const readIds = new Set(
      JSON.parse(localStorage.getItem(NOTIFICATIONS_READ_KEY) || '[]')
    )
    readIds.delete(notificationId)
    localStorage.setItem(NOTIFICATIONS_READ_KEY, JSON.stringify(Array.from(readIds)))
    
    // Fechar modal se for a notificação selecionada
    if (selectedNotification && selectedNotification.id === notificationId) {
      setIsModalOpen(false)
      setSelectedNotification(null)
    }
    
    // Disparar evento para atualizar contador
    window.dispatchEvent(new Event('wurm-notifications-read'))
  }

  const handleDeleteAll = () => {
    if (confirm(t('notifications.deleteAllConfirm', { defaultValue: 'Tem certeza que deseja deletar todas as notificações?' }))) {
      setNotifications([])
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify([]))
      localStorage.setItem(NOTIFICATIONS_READ_KEY, JSON.stringify([]))
      window.dispatchEvent(new Event('wurm-notifications-read'))
    }
  }

  const unreadCount = getUnreadCount()

  return (
    <>
      <div className="notification-center-container" ref={dropdownRef}>
        <button
          className="notification-center-button"
          onClick={() => setIsOpen(!isOpen)}
          title={t('notifications.title', { defaultValue: 'Notificações' })}
        >
          <IoIosNotificationsOutline />
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount}</span>
          )}
        </button>
        
        {isOpen && (
          <div className="notification-dropdown">
            <div className="notification-dropdown-header">
              <h3>{t('notifications.title', { defaultValue: 'Notificações' })}</h3>
              {notifications.length > 0 && (
                <button
                  className="notification-delete-all"
                  onClick={handleDeleteAll}
                  title={t('notifications.deleteAll', { defaultValue: 'Deletar todas' })}
                >
                  <FaTimes />
                </button>
              )}
            </div>
            
            <div className="notification-list">
              {notifications.length === 0 ? (
                <div className="notification-empty">
                  {t('notifications.empty', { defaultValue: 'Nenhuma notificação' })}
                </div>
              ) : (
                notifications.map((notification) => {
                  const readIds = new Set(
                    JSON.parse(localStorage.getItem(NOTIFICATIONS_READ_KEY) || '[]')
                  )
                  const isRead = readIds.has(notification.id)
                  
                  return (
                    <div
                      key={notification.id}
                      className={`notification-item ${!isRead ? 'unread' : ''}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="notification-item-content">
                        <div className="notification-message-preview">
                          {notification.message.substring(0, 60)}
                          {notification.message.length > 60 ? '...' : ''}
                        </div>
                        <div className="notification-timestamp">
                          {new Date(notification.timestamp).toLocaleString()}
                        </div>
                      </div>
                      {!isRead && <div className="notification-unread-dot"></div>}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}
      </div>

      <NotificationModal
        isOpen={isModalOpen}
        notification={selectedNotification}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedNotification(null)
        }}
        onDelete={handleDeleteNotification}
      />
    </>
  )
}

export default NotificationCenter

