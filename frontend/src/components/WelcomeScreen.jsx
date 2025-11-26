import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AiOutlineStock } from 'react-icons/ai'
import { FaArrowRight, FaCheckCircle, FaMapMarkerAlt, FaStickyNote } from 'react-icons/fa'
import { MdShowChart } from 'react-icons/md'
import LanguageSelector from './LanguageSelector'
import './WelcomeScreen.css'

function WelcomeScreen({ onComplete }) {
  const { t } = useTranslation()
  const [step, setStep] = useState(0) // 0 = welcome, 1 = features, 2 = deed name
  const [deedName, setDeedName] = useState('')

  const features = [
    {
      icon: <AiOutlineStock />,
      title: t('welcome.features.stock.title'),
      description: t('welcome.features.stock.description')
    },
    {
      icon: <MdShowChart />,
      title: t('welcome.features.charts.title'),
      description: t('welcome.features.charts.description')
    },
    {
      icon: <FaStickyNote />,
      title: t('welcome.features.notes.title'),
      description: t('welcome.features.notes.description')
    },
    {
      icon: <FaMapMarkerAlt />,
      title: t('welcome.features.locations.title'),
      description: t('welcome.features.locations.description')
    }
  ]

  const handleNext = () => {
    if (step === 0) {
      setStep(1) // Ir para features
    } else if (step === 1) {
      setStep(2) // Ir para nome do Deed
    }
  }

  const handleDeedSubmit = (e) => {
    e.preventDefault()
    if (deedName.trim()) {
      localStorage.setItem('deedName', deedName.trim())
      onComplete(deedName.trim())
    }
  }

  const handleSkip = () => {
    localStorage.setItem('deedName', '')
    onComplete('')
  }

  if (step === 0) {
    // Tela de boas-vindas
    return (
      <div className="welcome-screen">
        <div className="welcome-content">
          <div className="welcome-language-selector">
            <LanguageSelector variant="compact" />
          </div>
          <div className="welcome-header">
            <h1 className="welcome-title">{t('welcome.title')}</h1>
            <p className="welcome-subtitle">
              {t('welcome.subtitle')}
            </p>
          </div>
          <button className="btn-welcome-primary" onClick={handleNext}>
            {t('welcome.start')}
            <FaArrowRight />
          </button>
        </div>
      </div>
    )
  }

  if (step === 1) {
    // Tela de funcionalidades
    return (
      <div className="welcome-screen">
        <div className="welcome-content features-content">
          <div className="welcome-language-selector">
            <LanguageSelector variant="compact" />
          </div>
          <div className="welcome-header">
            <h2 className="welcome-title">{t('welcome.features.title')}</h2>
            <p className="welcome-subtitle">
              {t('welcome.features.subtitle')}
            </p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
          <div className="welcome-actions">
            <button className="btn-welcome-secondary" onClick={() => setStep(0)}>
              {t('common.back')}
            </button>
            <button className="btn-welcome-primary" onClick={handleNext}>
              {t('common.continue')}
              <FaArrowRight />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Tela de nome do Deed
  return (
    <div className="welcome-screen">
      <div className="welcome-content deed-content">
        <div className="welcome-language-selector">
          <LanguageSelector variant="compact" />
        </div>
        <div className="welcome-header">
          <h2 className="welcome-title">{t('welcome.setup.title')}</h2>
          <p className="welcome-subtitle">
            {t('welcome.setup.subtitle')}
          </p>
        </div>
        <form className="deed-form" onSubmit={handleDeedSubmit}>
          <div className="form-group">
            <label htmlFor="deedName">{t('welcome.setup.deedName')}</label>
            <input
              id="deedName"
              type="text"
              value={deedName}
              onChange={(e) => setDeedName(e.target.value)}
              placeholder={t('welcome.setup.deedNamePlaceholder')}
              autoFocus
              maxLength={50}
            />
            <small className="form-hint">
              {t('welcome.setup.deedNameHint')}
            </small>
          </div>
          <div className="welcome-actions">
            <button 
              type="button" 
              className="btn-welcome-secondary" 
              onClick={() => setStep(1)}
            >
              {t('common.back')}
            </button>
            <button 
              type="button" 
              className="btn-welcome-link" 
              onClick={handleSkip}
            >
              {t('common.skip')}
            </button>
            <button 
              type="submit" 
              className="btn-welcome-primary" 
              disabled={!deedName.trim()}
            >
              <FaCheckCircle />
              {t('common.start')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default WelcomeScreen

