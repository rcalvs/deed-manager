import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import pt from './locales/pt.json'
import ru from './locales/ru.json'

// Detectar idioma salvo ou usar padrão
const getSavedLanguage = () => {
  const saved = localStorage.getItem('language')
  if (saved && ['en', 'pt', 'ru'].includes(saved)) {
    return saved
  }
  // Detectar idioma do navegador
  const browserLang = navigator.language.split('-')[0]
  if (['en', 'pt', 'ru'].includes(browserLang)) {
    return browserLang
  }
  return 'en' // Padrão: Inglês
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      pt: { translation: pt },
      ru: { translation: ru }
    },
    lng: getSavedLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  })

export default i18n

