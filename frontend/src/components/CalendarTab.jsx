import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FaChevronLeft, FaChevronRight, FaCog } from 'react-icons/fa'
import { api } from '../api'
import { calculateWurmTime } from '../utils/wurmTime'
import './CalendarTab.css'
import CalibrationModal from './CalibrationModal'

function CalendarTab({ developerMode = false }) {
  const { t } = useTranslation()
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [wurmTime, setWurmTime] = useState(null)
  const [isCalibrationModalOpen, setIsCalibrationModalOpen] = useState(false)

  // Atualizar tempo do Wurm a cada minuto
  useEffect(() => {
    const updateWurmTime = () => {
      setWurmTime(calculateWurmTime())
    }
    
    updateWurmTime()
    const interval = setInterval(updateWurmTime, 60000) // Atualizar a cada minuto
    
    return () => clearInterval(interval)
  }, [isCalibrationModalOpen]) // Recarregar quando calibrar

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

  // Mapear notas por data
  const notesByDate = useMemo(() => {
    const map = new Map()
    
    notes.forEach(note => {
      // Adicionar data de início
      if (note.startDate) {
        const startDate = note.startDate.split('T')[0] // Pegar apenas a data (YYYY-MM-DD)
        if (!map.has(startDate)) {
          map.set(startDate, [])
        }
        map.get(startDate).push({
          ...note,
          type: 'start',
          isStart: true
        })
      }
      
      // Adicionar data de fim
      if (note.endDate) {
        const endDate = note.endDate.split('T')[0] // Pegar apenas a data (YYYY-MM-DD)
        if (!map.has(endDate)) {
          map.set(endDate, [])
        }
        map.get(endDate).push({
          ...note,
          type: 'end',
          isEnd: true
        })
      }
    })
    
    return map
  }, [notes])

  // Verificar se uma data tem notas
  const getNotesForDate = (date) => {
    const dateStr = formatDateForMap(date)
    return notesByDate.get(dateStr) || []
  }

  // Formatar data para o mapa (YYYY-MM-DD)
  const formatDateForMap = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Navegação do calendário
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Gerar dias do mês
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    // Primeiro dia do mês
    const firstDay = new Date(year, month, 1)
    const firstDayOfWeek = firstDay.getDay() // 0 = Domingo, 6 = Sábado
    
    // Último dia do mês
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    
    // Dias do mês anterior para preencher a primeira semana
    const prevMonth = new Date(year, month, 0)
    const daysInPrevMonth = prevMonth.getDate()
    
    const days = []
    
    // Adicionar dias do mês anterior
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, daysInPrevMonth - i)
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false
      })
    }
    
    // Adicionar dias do mês atual
    const today = new Date()
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      days.push({
        date,
        isCurrentMonth: true,
        isToday: date.toDateString() === today.toDateString()
      })
    }
    
    // Adicionar dias do próximo mês para completar a última semana
    const remainingDays = 42 - days.length // 6 semanas × 7 dias
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day)
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false
      })
    }
    
    return days
  }, [currentDate])

  const monthNames = [
    t('calendar.months.january', { defaultValue: 'January' }),
    t('calendar.months.february', { defaultValue: 'February' }),
    t('calendar.months.march', { defaultValue: 'March' }),
    t('calendar.months.april', { defaultValue: 'April' }),
    t('calendar.months.may', { defaultValue: 'May' }),
    t('calendar.months.june', { defaultValue: 'June' }),
    t('calendar.months.july', { defaultValue: 'July' }),
    t('calendar.months.august', { defaultValue: 'August' }),
    t('calendar.months.september', { defaultValue: 'September' }),
    t('calendar.months.october', { defaultValue: 'October' }),
    t('calendar.months.november', { defaultValue: 'November' }),
    t('calendar.months.december', { defaultValue: 'December' })
  ]

  const weekDays = [
    t('calendar.weekdays.sunday', { defaultValue: 'Sun' }),
    t('calendar.weekdays.monday', { defaultValue: 'Mon' }),
    t('calendar.weekdays.tuesday', { defaultValue: 'Tue' }),
    t('calendar.weekdays.wednesday', { defaultValue: 'Wed' }),
    t('calendar.weekdays.thursday', { defaultValue: 'Thu' }),
    t('calendar.weekdays.friday', { defaultValue: 'Fri' }),
    t('calendar.weekdays.saturday', { defaultValue: 'Sat' })
  ]

  if (loading) {
    return (
      <div className="calendar-container">
        <div className="loading">{t('common.loadingNotes', { defaultValue: 'Loading notes...' })}</div>
      </div>
    )
  }

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <div className="calendar-navigation">
          <button className="btn-nav" onClick={goToPreviousMonth}>
            <FaChevronLeft />
          </button>
          <h2 className="calendar-month-year">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button className="btn-nav" onClick={goToNextMonth}>
            <FaChevronRight />
          </button>
        </div>
        <div className="calendar-header-actions">
          <button className="btn-today" onClick={goToToday}>
            {t('calendar.today', { defaultValue: 'Today' })}
          </button>
          {developerMode && (
            <button 
              className="btn-calibrate" 
              onClick={() => setIsCalibrationModalOpen(true)}
              title={t('calendar.calibration.title', { defaultValue: 'Calibrar Tempo do Wurm' })}
            >
              <FaCog />
              {t('calendar.calibration.button', { defaultValue: 'Calibrar' })}
            </button>
          )}
        </div>
      </div>

      {wurmTime && (
        <div className="wurm-time-info">
          <div className="wurm-time-header">
            <h3>{t('calendar.wurmTime.title', { defaultValue: 'Wurm Time' })}</h3>
            <div className="wurm-time-display">
              <span className="wurm-time">{wurmTime.formattedTime}</span>
            </div>
          </div>
          <div className="wurm-time-details">
            <div className="wurm-detail-item">
              <span className="wurm-label">{t('calendar.wurmTime.season', { defaultValue: 'Season' })}:</span>
              <span className="wurm-value season">{t(`calendar.seasons.${wurmTime.season?.toLowerCase()}`, { defaultValue: wurmTime.season })}</span>
            </div>
            <div className="wurm-detail-item">
              <span className="wurm-label">{t('calendar.wurmTime.starfall', { defaultValue: 'Starfall' })}:</span>
              <span className="wurm-value starfall">{wurmTime.starfall}</span>
            </div>
            <div className="wurm-detail-item">
              <span className="wurm-label">{t('calendar.wurmTime.week', { defaultValue: 'Week' })}:</span>
              <span className="wurm-value">{wurmTime.week}</span>
            </div>
            <div className="wurm-detail-item">
              <span className="wurm-label">{t('calendar.wurmTime.year', { defaultValue: 'Year' })}:</span>
              <span className="wurm-value">{wurmTime.year}</span>
            </div>
          </div>
          {wurmTime.harvestInfo && wurmTime.harvestInfo.harvests.length > 0 && (
            <div className="wurm-harvest-info">
              <div className="harvest-title">
                {t('calendar.wurmTime.harvestSeason', { defaultValue: 'Harvest Season' })}:
              </div>
              <div className="harvest-items">
                {wurmTime.harvestInfo.harvests.map((item, index) => (
                  <span key={index} className="harvest-item">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="calendar-grid">
        {/* Cabeçalho dos dias da semana */}
        <div className="calendar-weekdays">
          {weekDays.map((day, index) => (
            <div key={index} className="weekday-header">
              {day}
            </div>
          ))}
        </div>

        {/* Dias do calendário */}
        <div className="calendar-days">
          {calendarDays.map((dayInfo, index) => {
            const dayNotes = getNotesForDate(dayInfo.date)
            const hasStartNotes = dayNotes.some(n => n.isStart)
            const hasEndNotes = dayNotes.some(n => n.isEnd)
            
            return (
              <div
                key={index}
                className={`calendar-day ${!dayInfo.isCurrentMonth ? 'other-month' : ''} ${dayInfo.isToday ? 'today' : ''} ${hasStartNotes || hasEndNotes ? 'has-notes' : ''}`}
              >
                <div className="day-number">{dayInfo.date.getDate()}</div>
                <div className="day-markers">
                  {hasStartNotes && (
                    <span className="marker marker-start" title={t('calendar.startDate', { defaultValue: 'Start date' })}>
                      ●
                    </span>
                  )}
                  {hasEndNotes && (
                    <span className="marker marker-end" title={t('calendar.endDate', { defaultValue: 'End date' })}>
                      ●
                    </span>
                  )}
                </div>
                {dayNotes.length > 0 && (
                  <div className="day-notes-tooltip">
                    {dayNotes.map((note, noteIndex) => (
                      <div key={noteIndex} className="note-tooltip-item">
                        <strong>{note.title}</strong>
                        {note.isStart && <span className="tooltip-badge start">Início</span>}
                        {note.isEnd && <span className="tooltip-badge end">Fim</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="calendar-legend">
        <div className="legend-item">
          <span className="legend-marker marker-start">●</span>
          <span>{t('calendar.legend.start', { defaultValue: 'Start date' })}</span>
        </div>
        <div className="legend-item">
          <span className="legend-marker marker-end">●</span>
          <span>{t('calendar.legend.end', { defaultValue: 'End date' })}</span>
        </div>
      </div>

      <CalibrationModal
        isOpen={isCalibrationModalOpen}
        onClose={() => setIsCalibrationModalOpen(false)}
        onCalibrate={() => {
          // Forçar atualização do tempo do Wurm
          setWurmTime(calculateWurmTime())
        }}
      />
    </div>
  )
}

export default CalendarTab

