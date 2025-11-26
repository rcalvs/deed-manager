import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FaCheck, FaEdit, FaPlus, FaTimes, FaTrashAlt } from 'react-icons/fa'
import { api } from '../api'
import './NotesSection.css'

function NotesSection() {
  const { t } = useTranslation()
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingNote, setEditingNote] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
  })

  useEffect(() => {
    loadNotes()
  }, [])

  const loadNotes = async () => {
    try {
      setLoading(true)
      const data = await api.getNotes()
      setNotes(data || [])
    } catch (error) {
      console.error('Erro ao carregar notas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      alert(t('notes.note.titleRequired'))
      return
    }

    try {
      if (editingNote) {
        await api.updateNote(
          editingNote.id,
          formData.title,
          formData.description,
          formData.startDate,
          formData.endDate,
          editingNote.completed
        )
      } else {
        await api.createNote(
          formData.title,
          formData.description,
          formData.startDate,
          formData.endDate
        )
      }
      
      resetForm()
      loadNotes()
    } catch (error) {
      console.error('Erro ao salvar nota:', error)
      alert(`${t('notes.note.saveError')}: ${error.message || t('common.error')}`)
    }
  }

  const handleEdit = (note) => {
    setEditingNote(note)
    
    // Formatar datas para o input date (YYYY-MM-DD)
    const formatDateForInput = (dateString) => {
      if (!dateString) return ''
      // Se já está no formato correto, retornar
      if (dateString.includes('T')) {
        return dateString.split('T')[0]
      }
      // Se é uma data ISO completa, extrair apenas a parte da data
      const date = new Date(dateString)
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0]
      }
      return dateString
    }
    
    setFormData({
      title: note.title || '',
      description: note.description || '',
      startDate: formatDateForInput(note.startDate),
      endDate: formatDateForInput(note.endDate),
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    try {
      await api.deleteNote(id)
      loadNotes()
    } catch (error) {
      console.error('Erro ao deletar nota:', error)
      alert(`${t('notes.note.saveError')}: ${error.message || t('common.error')}`)
    }
  }

  const handleToggleCompleted = async (id) => {
    try {
      await api.toggleNoteCompleted(id)
      loadNotes()
    } catch (error) {
      console.error('Erro ao alternar status:', error)
      alert(`Erro ao alternar status: ${error.message || 'Erro desconhecido'}`)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
    })
    setEditingNote(null)
    setShowForm(false)
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  if (loading) {
    return <div className="loading">{t('common.loading')}</div>
  }

  return (
    <div className="notes-section">
      <div className="notes-header">
        <h2>{t('notes.title')}</h2>
        <button
          className="btn-add"
          onClick={() => {
            resetForm()
            setShowForm(true)
          }}
        >
          <FaPlus /> {t('notes.newNote')}
        </button>
      </div>

      {showForm && (
        <div className="note-form-container">
          <form className="note-form" onSubmit={handleSubmit}>
            <div className="form-header">
              <h3>{editingNote ? t('notes.note.editNote') : t('notes.newNote')}</h3>
              <button type="button" className="btn-close" onClick={resetForm}>
                <FaTimes />
              </button>
            </div>
            <div className="form-group">
              <label htmlFor="title">{t('notes.note.title')} *</label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder={t('notes.note.title')}
              />
            </div>
            <div className="form-group">
              <label htmlFor="description">{t('notes.note.description')}</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detalhes da nota..."
                rows="3"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startDate">{t('notes.note.startDate')}</label>
                <input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="endDate">{t('notes.note.endDate')}</label>
                <input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={resetForm}>
                {t('common.cancel')}
              </button>
              <button type="submit" className="btn-save">
                {editingNote ? t('common.save') : t('common.add')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="notes-list">
        {notes.length === 0 ? (
          <div className="empty-state">{t('notes.note.noNotes')}</div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className={`note-item ${note.completed ? 'completed' : ''}`}>
              <div className="note-content">
                <div className="note-header">
                  <h3 className="note-title">{note.title}</h3>
                  <div className="note-actions">
                    <button
                      className="btn-icon"
                      onClick={() => handleToggleCompleted(note.id)}
                      title={note.completed ? t('notes.note.markIncomplete', { defaultValue: 'Mark as incomplete' }) : t('notes.note.markComplete', { defaultValue: 'Mark as complete' })}
                    >
                      <FaCheck className={note.completed ? 'checked' : ''} />
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => handleEdit(note)}
                      title={t('common.edit')}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => {
                        if (confirm(t('notes.note.deleteConfirm'))) {
                          handleDelete(note.id)
                        }
                      }}
                      title={t('common.delete')}
                    >
                      <FaTrashAlt />
                    </button>
                  </div>
                </div>
                {note.description && (
                  <p className="note-description">{note.description}</p>
                )}
                <div className="note-dates">
                  {note.startDate && (
                    <span className="date-badge">
                      {t('notes.note.startDate')}: {formatDate(note.startDate)}
                    </span>
                  )}
                  {note.endDate && (
                    <span className="date-badge">
                      {t('notes.note.endDate')}: {formatDate(note.endDate)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default NotesSection

