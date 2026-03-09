/**
 * Utilitários para cálculo de upkeep restante de deeds
 */

const DEED_UPKEEP_NOTIFIED_KEY = 'wurm_deed_upkeep_notified'

export function getNotifiedState() {
  try {
    return JSON.parse(localStorage.getItem(DEED_UPKEEP_NOTIFIED_KEY) || '{}')
  } catch {
    return {}
  }
}

export function setNotifiedState(state) {
  localStorage.setItem(DEED_UPKEEP_NOTIFIED_KEY, JSON.stringify(state))
}

export function clearDeedUpkeepNotified(deedId) {
  if (!deedId) return
  const state = getNotifiedState()
  delete state[String(deedId)]
  setNotifiedState(state)
}

export function getUpkeepTotalMinutes(deed) {
  const d = deed.upkeepDays || 0
  const h = deed.upkeepHours || 0
  const m = deed.upkeepMinutes || 0
  return d * 24 * 60 + h * 60 + m
}

/**
 * Calcula o upkeep restante com base na data de atualização do deed.
 * Usa updatedAt como referência (ou createdAt se não houver updatedAt).
 */
export function getRemainingUpkeep(deed) {
  const totalMinutes = getUpkeepTotalMinutes(deed)
  if (totalMinutes <= 0) return null

  const refDate = deed.updatedAt || deed.createdAt
  if (!refDate) return { days: deed.upkeepDays || 0, hours: deed.upkeepHours || 0, minutes: deed.upkeepMinutes || 0 }

  const ref = new Date(refDate)
  const now = new Date()
  const elapsedMinutes = Math.floor((now - ref) / (60 * 1000))
  const remainingMinutes = Math.max(0, totalMinutes - elapsedMinutes)

  const days = Math.floor(remainingMinutes / (24 * 60))
  const hours = Math.floor((remainingMinutes % (24 * 60)) / 60)
  const minutes = remainingMinutes % 60

  return { days, hours, minutes }
}

/** Retorna o total de dias restantes (número decimal) para uso em comparações. */
export function getRemainingUpkeepTotalDays(deed) {
  const remaining = getRemainingUpkeep(deed)
  if (!remaining) return null
  return remaining.days + remaining.hours / 24 + remaining.minutes / (24 * 60)
}

/**
 * Verifica deeds e envia notificações quando upkeep restante desce de 60 ou 30 dias.
 * @param {Array} deeds - Lista de deeds
 * @param {Function} t - Função de tradução (i18n)
 * @param {Function} createNotification - Função para criar notificação
 */
export function checkDeedUpkeepNotifications(deeds, t, createNotification) {
  if (!deeds || deeds.length === 0) return
  const notified = getNotifiedState()
  let changed = false
  deeds.forEach((deed) => {
    const totalDays = getRemainingUpkeepTotalDays(deed)
    if (totalDays === null) return
    const key = String(deed.id)
    const entry = notified[key] || {}
    if (totalDays < 60 && !entry.below60) {
      createNotification(
        t('deeds.upkeepBelow60Notification', {
          defaultValue: 'Deed "{{name}}": menos de 60 dias de upkeep restante',
          name: deed.name || t('deeds.unnamed', { defaultValue: 'Sem nome' }),
        })
      )
      notified[key] = { ...entry, below60: true }
      changed = true
    }
    if (totalDays < 30 && !entry.below30) {
      createNotification(
        t('deeds.upkeepBelow30Notification', {
          defaultValue: 'Deed "{{name}}": menos de 30 dias de upkeep restante',
          name: deed.name || t('deeds.unnamed', { defaultValue: 'Sem nome' }),
        })
      )
      notified[key] = { ...entry, below30: true }
      changed = true
    }
  })
  if (changed) setNotifiedState(notified)
}
