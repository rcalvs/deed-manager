import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '../api'
import { convertToIron, ironToBreakdown, parseDeedInfo } from '../utils/deedParser'
import './DeedForm.css'

function DeedForm({ onDeedAdded, onDeedUpdated, editingDeed, onEditCancel, variant, onDeedCreated, onBack, onSkip }) {
  const isWelcome = variant === 'welcome'
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const defaultCoffers = () => ({ gold: 0, silver: 0, copper: 0, iron: 0 })
  const [formData, setFormData] = useState({
    name: '',
    mayor: '',
    location: '',
    rawText: '',
    sizeWidth: 0,
    sizeHeight: 0,
    coffers: defaultCoffers(),
    upkeepChips: defaultCoffers(),
    monthlyCost: defaultCoffers(),
    upkeepDays: 0,
    upkeepHours: 0,
    upkeepMinutes: 0,
  })

  useEffect(() => {
    if (editingDeed) {
      setFormData({
        name: editingDeed.name || '',
        mayor: editingDeed.mayor || '',
        location: editingDeed.location || '',
        rawText: editingDeed.rawText || '',
        sizeWidth: editingDeed.sizeWidth || 0,
        sizeHeight: editingDeed.sizeHeight || 0,
        coffers: ironToBreakdown(editingDeed.coffersIron),
        upkeepChips: ironToBreakdown(editingDeed.upkeepChipsIron),
        monthlyCost: ironToBreakdown(editingDeed.monthlyCostIron),
        upkeepDays: editingDeed.upkeepDays || 0,
        upkeepHours: editingDeed.upkeepHours || 0,
        upkeepMinutes: editingDeed.upkeepMinutes || 0,
      })
    }
  }, [editingDeed])

  const resetForm = () => {
    setFormData({
      name: '',
      mayor: '',
      location: '',
      rawText: '',
      sizeWidth: 0,
      sizeHeight: 0,
      coffers: defaultCoffers(),
      upkeepChips: defaultCoffers(),
      monthlyCost: defaultCoffers(),
      upkeepDays: 0,
      upkeepHours: 0,
      upkeepMinutes: 0,
    })
    onEditCancel?.()
  }

  const showMessage = (msg, isError = false) => {
    setMessage(msg)
    setTimeout(() => setMessage(''), 3000)
  }

  const handleParse = () => {
    const parsed = parseDeedInfo(formData.rawText)
    setFormData((prev) => ({
      ...prev,
      sizeWidth: parsed.sizeWidth,
      sizeHeight: parsed.sizeHeight,
      coffers: parsed.coffers || defaultCoffers(),
      upkeepChips: parsed.upkeepChips || defaultCoffers(),
      monthlyCost: parsed.monthlyCost || defaultCoffers(),
      upkeepDays: parsed.upkeepDays,
      upkeepHours: parsed.upkeepHours,
      upkeepMinutes: parsed.upkeepMinutes,
    }))
    showMessage(t('deeds.parseSuccess', { defaultValue: 'Informações parseadas com sucesso' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      showMessage(t('deeds.nameRequired', { defaultValue: 'Por favor, preencha o nome do deed' }), true)
      return
    }

    setLoading(true)
    try {
      if (editingDeed) {
        await api.updateDeed(
          editingDeed.id,
          formData.name.trim(),
          formData.mayor.trim(),
          formData.location.trim(),
          formData.sizeWidth || 0,
          formData.sizeHeight || 0,
          convertToIron(formData.coffers?.gold, formData.coffers?.silver, formData.coffers?.copper, formData.coffers?.iron) || 0,
          convertToIron(formData.upkeepChips?.gold, formData.upkeepChips?.silver, formData.upkeepChips?.copper, formData.upkeepChips?.iron) || 0,
          convertToIron(formData.monthlyCost?.gold, formData.monthlyCost?.silver, formData.monthlyCost?.copper, formData.monthlyCost?.iron) || 0,
          formData.upkeepDays || 0,
          formData.upkeepHours || 0,
          formData.upkeepMinutes || 0,
          formData.rawText.trim()
        )
        showMessage(t('deeds.updateSuccess', { defaultValue: 'Deed atualizado com sucesso' }))
        onDeedUpdated?.()
      } else {
        const created = await api.createDeed(
          formData.name.trim(),
          formData.mayor.trim(),
          formData.location.trim(),
          formData.sizeWidth || 0,
          formData.sizeHeight || 0,
          convertToIron(formData.coffers?.gold, formData.coffers?.silver, formData.coffers?.copper, formData.coffers?.iron) || 0,
          convertToIron(formData.upkeepChips?.gold, formData.upkeepChips?.silver, formData.upkeepChips?.copper, formData.upkeepChips?.iron) || 0,
          convertToIron(formData.monthlyCost?.gold, formData.monthlyCost?.silver, formData.monthlyCost?.copper, formData.monthlyCost?.iron) || 0,
          formData.upkeepDays || 0,
          formData.upkeepHours || 0,
          formData.upkeepMinutes || 0,
          formData.rawText.trim()
        )
        showMessage(t('deeds.addSuccess', { defaultValue: 'Deed adicionado com sucesso' }))
        onDeedAdded?.()
        onDeedCreated?.(created)
      }
    } catch (error) {
      console.error('Erro ao salvar deed:', error)
      showMessage(error.message || t('deeds.saveError', { defaultValue: 'Erro ao salvar deed' }), true)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (isWelcome && onBack) {
      onBack()
    } else {
      resetForm()
    }
  }

  return (
    <div className="deed-form-container">
      <form className="deed-form" onSubmit={handleSubmit}>
        <div className="deed-form-scroll">
            <div className="form-group" style={{ marginTop: '-10px'}}>
              <label htmlFor="deedName">{t('deeds.name', { defaultValue: 'Nome' })} *</label>
              <input
                id="deedName"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('deeds.namePlaceholder', { defaultValue: 'Nome do deed' })}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="deedMayor">{t('deeds.mayor', { defaultValue: 'Prefeito' })}</label>
                <input
                  id="deedMayor"
                  type="text"
                  value={formData.mayor}
                  onChange={(e) => setFormData({ ...formData, mayor: e.target.value })}
                  placeholder={t('deeds.mayorPlaceholder', { defaultValue: 'Nome do prefeito' })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="deedLocation">{t('deeds.location', { defaultValue: 'Localização' })}</label>
                <input
                  id="deedLocation"
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder={t('deeds.locationPlaceholder', { defaultValue: 'URL Yaga ou Wurmmaps' })}
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="deedRawText">{t('deeds.pasteInfo', { defaultValue: 'Colar informações do deed' })}</label>
              <textarea
                id="deedRawText"
                value={formData.rawText}
                onChange={(e) => setFormData({ ...formData, rawText: e.target.value })}
                placeholder={t('deeds.pastePlaceholder', {
                  defaultValue: 'Cole aqui o texto do jogo (ex: The size of Acre is 32 by 23...)',
                })}
                rows="5"
              />
              <button type="button" className="btn-parse" onClick={handleParse}>
                {t('deeds.parse', { defaultValue: 'Parsear' })}
              </button>
            </div>
            <div className="form-row form-row-2">
              <div className="form-group">
                <label>{t('deeds.sizeWidth', { defaultValue: 'Largura' })}</label>
                <input
                  type="number"
                  min="0"
                  value={formData.sizeWidth || ''}
                  onChange={(e) => setFormData({ ...formData, sizeWidth: parseInt(e.target.value, 10) || 0 })}
                />
              </div>
              <div className="form-group">
                <label>{t('deeds.sizeHeight', { defaultValue: 'Altura' })}</label>
                <input
                  type="number"
                  min="0"
                  value={formData.sizeHeight || ''}
                  onChange={(e) => setFormData({ ...formData, sizeHeight: parseInt(e.target.value, 10) || 0 })}
                />
              </div>
            </div>
            <div className="form-section">
              <h4 className="form-section-title">{t('deeds.coffers', { defaultValue: 'Cofre' })}</h4>
              <div className="form-row form-row-4 currency-row">
                <div className="form-group">
                  <label>{t('deeds.gold', { defaultValue: 'Gold' })}</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.coffers?.gold ?? ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      coffers: { ...formData.coffers, gold: parseInt(e.target.value, 10) || 0 },
                    })}
                  />
                </div>
                <div className="form-group">
                  <label>{t('deeds.silver', { defaultValue: 'Silver' })}</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.coffers?.silver ?? ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      coffers: { ...formData.coffers, silver: parseInt(e.target.value, 10) || 0 },
                    })}
                  />
                </div>
                <div className="form-group">
                  <label>{t('deeds.copper', { defaultValue: 'Copper' })}</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.coffers?.copper ?? ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      coffers: { ...formData.coffers, copper: parseInt(e.target.value, 10) || 0 },
                    })}
                  />
                </div>
                <div className="form-group">
                  <label>{t('deeds.iron', { defaultValue: 'Iron' })}</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.coffers?.iron ?? ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      coffers: { ...formData.coffers, iron: parseInt(e.target.value, 10) || 0 },
                    })}
                  />
                </div>
              </div>
            </div>
            <div className="form-section">
              <h4 className="form-section-title">{t('deeds.upkeepChips', { defaultValue: 'Upkeep chips' })}</h4>
              <div className="form-row form-row-4 currency-row">
                <div className="form-group">
                  <label>{t('deeds.gold', { defaultValue: 'Gold' })}</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.upkeepChips?.gold ?? ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      upkeepChips: { ...formData.upkeepChips, gold: parseInt(e.target.value, 10) || 0 },
                    })}
                  />
                </div>
                <div className="form-group">
                  <label>{t('deeds.silver', { defaultValue: 'Silver' })}</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.upkeepChips?.silver ?? ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      upkeepChips: { ...formData.upkeepChips, silver: parseInt(e.target.value, 10) || 0 },
                    })}
                  />
                </div>
                <div className="form-group">
                  <label>{t('deeds.copper', { defaultValue: 'Copper' })}</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.upkeepChips?.copper ?? ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      upkeepChips: { ...formData.upkeepChips, copper: parseInt(e.target.value, 10) || 0 },
                    })}
                  />
                </div>
                <div className="form-group">
                  <label>{t('deeds.iron', { defaultValue: 'Iron' })}</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.upkeepChips?.iron ?? ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      upkeepChips: { ...formData.upkeepChips, iron: parseInt(e.target.value, 10) || 0 },
                    })}
                  />
                </div>
              </div>
            </div>
            <div className="form-section">
              <h4 className="form-section-title">{t('deeds.monthlyCost', { defaultValue: 'Custo mensal' })}</h4>
              <div className="form-row form-row-4 currency-row">
                <div className="form-group">
                  <label>{t('deeds.gold', { defaultValue: 'Gold' })}</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.monthlyCost?.gold ?? ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      monthlyCost: { ...formData.monthlyCost, gold: parseInt(e.target.value, 10) || 0 },
                    })}
                  />
                </div>
                <div className="form-group">
                  <label>{t('deeds.silver', { defaultValue: 'Silver' })}</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.monthlyCost?.silver ?? ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      monthlyCost: { ...formData.monthlyCost, silver: parseInt(e.target.value, 10) || 0 },
                    })}
                  />
                </div>
                <div className="form-group">
                  <label>{t('deeds.copper', { defaultValue: 'Copper' })}</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.monthlyCost?.copper ?? ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      monthlyCost: { ...formData.monthlyCost, copper: parseInt(e.target.value, 10) || 0 },
                    })}
                  />
                </div>
                <div className="form-group">
                  <label>{t('deeds.iron', { defaultValue: 'Iron' })}</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.monthlyCost?.iron ?? ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      monthlyCost: { ...formData.monthlyCost, iron: parseInt(e.target.value, 10) || 0 },
                    })}
                  />
                </div>
              </div>
            </div>
            <div className="form-row form-row-1">
              <div className="form-group">
                <label>{t('deeds.upkeepDuration', { defaultValue: 'Duração upkeep' })}</label>
                <div className="upkeep-duration-inputs">
                  <input
                    type="number"
                    min="0"
                    placeholder="d"
                    value={formData.upkeepDays || ''}
                    onChange={(e) => setFormData({ ...formData, upkeepDays: parseInt(e.target.value, 10) || 0 })}
                    title={t('deeds.days', { defaultValue: 'Dias' })}
                  />
                  <input
                    type="number"
                    min="0"
                    placeholder="h"
                    value={formData.upkeepHours || ''}
                    onChange={(e) => setFormData({ ...formData, upkeepHours: parseInt(e.target.value, 10) || 0 })}
                    title={t('deeds.hours', { defaultValue: 'Horas' })}
                  />
                  <input
                    type="number"
                    min="0"
                    placeholder="m"
                    value={formData.upkeepMinutes || ''}
                    onChange={(e) => setFormData({ ...formData, upkeepMinutes: parseInt(e.target.value, 10) || 0 })}
                    title={t('deeds.minutes', { defaultValue: 'Minutos' })}
                  />
                </div>
              </div>
            </div>
            <div className={`form-actions ${isWelcome ? 'form-actions-welcome' : ''}`}>
              {isWelcome ? (
                <>
                  <button type="button" className="btn-cancel" onClick={handleCancel} disabled={loading}>
                    {t('common.back')}
                  </button>
                  <button type="button" className="btn-skip" onClick={onSkip} disabled={loading}>
                    {t('welcome.setup.skip', { defaultValue: 'Pular' })}
                  </button>
                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? t('common.processing', { defaultValue: 'Salvando...' }) : t('common.start', { defaultValue: 'Iniciar' })}
                  </button>
                </>
              ) : (
                <>
                  <button type="button" className="btn-cancel" onClick={handleCancel} disabled={loading}>
                    {t('common.cancel', { defaultValue: 'Cancelar' })}
                  </button>
                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? t('common.processing', { defaultValue: 'Salvando...' }) : (editingDeed ? t('common.save', { defaultValue: 'Salvar' }) : t('deeds.addDeed', { defaultValue: 'Adicionar Deed' }))}
                  </button>
                </>
              )}
            </div>
            {message && <div className={`message ${message.includes('Erro') ? 'error' : 'success'}`}>{message}</div>}
        </div>
      </form>
    </div>
  )
}

export default DeedForm
