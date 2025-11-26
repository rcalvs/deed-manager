import React from 'react'
import { useTranslation } from 'react-i18next'
import { FaGlobe } from 'react-icons/fa'
import './LanguageSelector.css'

function LanguageSelector({ variant = 'default' }) {
  const { i18n } = useTranslation()

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'pt', name: 'Português', flag: '🇧🇷' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' }
  ]

  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode)
    localStorage.setItem('language', langCode)
  }

  if (variant === 'compact') {
    return (
      <div className="language-selector-compact">
        <select
          value={i18n.language}
          onChange={(e) => handleLanguageChange(e.target.value)}
          className="language-select"
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.flag} {lang.name}
            </option>
          ))}
        </select>
      </div>
    )
  }

  return (
    <div className="language-selector">
      <div className="language-selector-header">
        <FaGlobe />
        <span>{i18n.t('settings.language')}</span>
      </div>
      <div className="language-options">
        {languages.map((lang) => (
          <button
            key={lang.code}
            className={`language-option ${i18n.language === lang.code ? 'active' : ''}`}
            onClick={() => handleLanguageChange(lang.code)}
          >
            <span className="language-flag">{lang.flag}</span>
            <span className="language-name">{lang.name}</span>
            {i18n.language === lang.code && (
              <span className="language-check">✓</span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

export default LanguageSelector

