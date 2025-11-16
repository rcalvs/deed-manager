import React, { useEffect, useRef, useState } from 'react'
import { IoSettingsOutline } from 'react-icons/io5'
import './Settings.css'

function Settings({ developerMode, onDeveloperModeChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  const handleClearDatabase = async () => {
    const confirmed = confirm(
      '⚠️ ATENÇÃO: Esta ação irá apagar TODOS os dados do banco de dados!\n\n' +
      'Isso inclui:\n' +
      '- Todos os itens do estoque\n' +
      '- Todo o histórico\n\n' +
      'Esta ação NÃO pode ser desfeita!\n\n' +
      'Tem certeza que deseja continuar?'
    )

    if (!confirmed) {
      return
    }

    // Confirmação dupla para segurança
    const doubleConfirmed = confirm(
      '⚠️ ÚLTIMA CONFIRMAÇÃO ⚠️\n\n' +
      'Você está prestes a apagar TODOS os dados permanentemente.\n\n' +
      'Digite OK para confirmar ou Cancelar para abortar.'
    )

    if (!doubleConfirmed) {
      return
    }

    try {
      await api.clearDatabase()
      alert('✅ Banco de dados limpo com sucesso!')
      // Recarregar a página para atualizar os dados
      window.location.reload()
    } catch (error) {
      console.error('Erro ao limpar banco:', error)
      alert('❌ Erro ao limpar banco de dados')
    }
  }

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
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

  const handleToggle = (e) => {
    e.stopPropagation()
    onDeveloperModeChange(!developerMode)
  }

  return (
    <div className="settings-container" ref={dropdownRef}>
      <button
        className="settings-button"
        onClick={() => setIsOpen(!isOpen)}
        title="Configurações"
      >
        <IoSettingsOutline />
      </button>
      {isOpen && (
        <div className="settings-dropdown">
          <div className="settings-item">
            <div className="settings-toggle-container">
              <span className="settings-label">Modo Desenvolvedor</span>
              <label className="settings-toggle">
                <input
                  type="checkbox"
                  checked={developerMode}
                  onChange={handleToggle}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <p className="settings-description">
              Ativa recursos avançados como limpeza de banco e data customizada
            </p>
          </div>
          <div className="settings-item">
            {developerMode && (
              <button 
                className="btn-clear-db"
                onClick={handleClearDatabase}
                title="Limpar todo o banco de dados"
              >
                Limpar Banco
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Settings

