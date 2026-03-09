import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AiOutlineStock } from 'react-icons/ai'
import { FaArrowRight, FaBell, FaCalendarAlt, FaHome, FaMapMarkerAlt, FaStickyNote } from 'react-icons/fa'
import { MdShowChart } from 'react-icons/md'
import DeedForm from './DeedForm'
import LanguageSelector from './LanguageSelector'
import './WelcomeScreen.css'

function WelcomeScreen({ onComplete }) {
  const { t } = useTranslation()
  const [step, setStep] = useState(0) // 0 = welcome, 1 = features, 2 = deed setup

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
      icon: <FaHome />,
      title: t('welcome.features.deeds.title'),
      description: t('welcome.features.deeds.description')
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
    },
    {
      icon: <FaCalendarAlt />,
      title: t('welcome.features.calendar.title'),
      description: t('welcome.features.calendar.description')
    },
    {
      icon: <FaBell />,
      title: t('welcome.features.events.title'),
      description: t('welcome.features.events.description')
    }
  ]

  const handleNext = () => {
    if (step === 0) {
      setStep(1) // Ir para features
    } else if (step === 1) {
      setStep(2) // Ir para nome do Deed
    }
  }

  const handleDeedCreated = (deed) => {
    if (deed?.name) {
      localStorage.setItem('deedName', deed.name)
      localStorage.setItem('welcomeCompleted', 'true')
      onComplete(deed.name)
    }
  }

  const handleSkip = () => {
    localStorage.setItem('deedName', '')
    localStorage.setItem('welcomeCompleted', 'true')
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

  // Tela de cadastro do Deed (formulário completo)
  return (
    <div className="welcome-screen welcome-deed-step">
      <div className="welcome-content deed-content deed-content-full">
        <div className="welcome-language-selector">
          <LanguageSelector variant="compact" />
        </div>
        <div className="welcome-header">
          <h2 className="welcome-title">{t('welcome.setup.title')}</h2>
          <p className="welcome-subtitle">
            {t('welcome.setup.subtitle')}
          </p>
        </div>
        <DeedForm
          variant="welcome"
          onDeedCreated={handleDeedCreated}
          onBack={() => setStep(1)}
          onSkip={handleSkip}
        />
      </div>
    </div>
  )
}

export default WelcomeScreen

