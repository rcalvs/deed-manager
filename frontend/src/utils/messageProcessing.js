/**
 * Utilitários de processamento de mensagens de log (Trade/Events).
 * Usados pelo EventsPollingService (polling global) e pela EventsTab.
 */
import { parseTimeCommand } from './wurmTime'
import { calculateEpochFromCalibration } from './wurmTime'

function convertToIron(gold, silver, copper, iron) {
  return (gold || 0) * 1000000 + (silver || 0) * 10000 + (copper || 0) * 100 + (iron || 0)
}

function formatBalance(totalIron) {
  const gold = Math.floor(totalIron / 1000000)
  const silver = Math.floor((totalIron % 1000000) / 10000)
  const copper = Math.floor((totalIron % 10000) / 100)
  const iron = totalIron % 100
  const parts = []
  if (gold > 0) parts.push(`${gold}g`)
  if (silver > 0) parts.push(`${silver}s`)
  if (copper > 0) parts.push(`${copper}c`)
  if (iron > 0) parts.push(`${iron}i`)
  return parts.length > 0 ? parts.join(', ') : '0i'
}

function parseCurrency(text) {
  let gold = 0, silver = 0, copper = 0, iron = 0
  const abbreviatedPatterns = [
    { regex: /(\d+)\s*g\b/gi, type: 'gold' },
    { regex: /(\d+)\s*s\b/gi, type: 'silver' },
    { regex: /(\d+)\s*c\b/gi, type: 'copper' },
    { regex: /(\d+)\s*i\b/gi, type: 'iron' }
  ]
  const fullPatterns = [
    { regex: /(\d+)\s+gold/gi, type: 'gold' },
    { regex: /(\d+)\s+silver/gi, type: 'silver' },
    { regex: /(\d+)\s+copper/gi, type: 'copper' },
    { regex: /(\d+)\s+iron/gi, type: 'iron' }
  ]
  abbreviatedPatterns.forEach(({ regex, type }) => {
    const matches = Array.from(text.matchAll(regex))
    matches.forEach(match => {
      const value = parseInt(match[1], 10)
      if (type === 'gold') gold += value
      else if (type === 'silver') silver += value
      else if (type === 'copper') copper += value
      else if (type === 'iron') iron += value
    })
  })
  if (gold === 0 && silver === 0 && copper === 0 && iron === 0) {
    fullPatterns.forEach(({ regex, type }) => {
      const matches = Array.from(text.matchAll(regex))
      matches.forEach(match => {
        const value = parseInt(match[1], 10)
        if (type === 'gold') gold += value
        else if (type === 'silver') silver += value
        else if (type === 'copper') copper += value
        else if (type === 'iron') iron += value
      })
    })
  }
  return { gold, silver, copper, iron }
}

function getCurrentBalance() {
  const balanceStr = localStorage.getItem('wurm_balance') || '0i'
  const parsed = parseCurrency(balanceStr)
  return convertToIron(parsed.gold, parsed.silver, parsed.copper, parsed.iron)
}

export function createNotification(message) {
  try {
    const notifications = JSON.parse(localStorage.getItem('wurm_notifications') || '[]')
    const newNotification = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      message: message,
      timestamp: new Date().toISOString()
    }
    notifications.unshift(newNotification)
    const limited = notifications.slice(0, 100)
    localStorage.setItem('wurm_notifications', JSON.stringify(limited))
    window.dispatchEvent(new Event('wurm-new-notification'))
  } catch (err) {
    console.error('Erro ao criar notificação:', err)
  }
}

export function playAlarmSound(volume) {
  try {
    const volumeLevel = ((volume || 50) / 100) * 0.3
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    oscillator.frequency.value = 800
    oscillator.type = 'sine'
    gainNode.gain.setValueAtTime(0, audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(volumeLevel, audioContext.currentTime + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.2)
  } catch (err) {
    console.error('Erro ao tocar alarme:', err)
  }
}

export function updateBalance(message) {
  let newBalance = null
  let shouldNotify = false

  const bankBalanceMatch = message.match(/[Bb]ank\s+balance[:\s]+(.+?)(?:\.|$)/i)
  if (bankBalanceMatch) {
    const parsed = parseCurrency(bankBalanceMatch[1])
    newBalance = convertToIron(parsed.gold, parsed.silver, parsed.copper, parsed.iron)
  }
  if (newBalance === null) {
    const youNowHaveMatch = message.match(/[Yy]ou\s+now\s+have\s+(.+?)\s+in\s+the\s+bank/i)
    if (youNowHaveMatch) {
      const parsed = parseCurrency(youNowHaveMatch[1])
      newBalance = convertToIron(parsed.gold, parsed.silver, parsed.copper, parsed.iron)
    }
  }
  if (newBalance === null) {
    const availableMoneyMatch = message.match(/[Yy]our\s+available\s+money\s+in\s+the\s+bank\s+is\s+now\s+(.+?)(?:\.|$)/i)
    if (availableMoneyMatch) {
      const parsed = parseCurrency(availableMoneyMatch[1])
      newBalance = convertToIron(parsed.gold, parsed.silver, parsed.copper, parsed.iron)
      shouldNotify = true
    }
  }
  if (newBalance === null) {
    const newBalanceMatch = message.match(/[Nn]ew\s+balance[:\s]+(.+?)(?:\.|$)/i)
    if (newBalanceMatch) {
      const parsed = parseCurrency(newBalanceMatch[1])
      newBalance = convertToIron(parsed.gold, parsed.silver, parsed.copper, parsed.iron)
    }
  }
  if (newBalance === null) {
    const chargedMatch = message.match(/[Yy]ou\s+have\s+been\s+charged\s+(.+?)(?:\.|$)/i)
    if (chargedMatch && !message.toLowerCase().includes('the items are now available')) {
      const parsed = parseCurrency(chargedMatch[1])
      const chargeAmount = convertToIron(parsed.gold, parsed.silver, parsed.copper, parsed.iron)
      newBalance = Math.max(0, getCurrentBalance() - chargeAmount)
    }
  }
  if (newBalance === null) {
    const itemsAvailableMatch = message.match(/[Tt]he\s+items\s+are\s+now\s+available\s+and\s+you\s+have\s+been\s+charged\s+(.+?)(?:\.|$)/i)
    if (itemsAvailableMatch) {
      const parsed = parseCurrency(itemsAvailableMatch[1])
      const chargeAmount = convertToIron(parsed.gold, parsed.silver, parsed.copper, parsed.iron)
      newBalance = Math.max(0, getCurrentBalance() - chargeAmount)
      shouldNotify = true
    }
  }

  if (newBalance !== null && !isNaN(newBalance)) {
    const formattedBalance = formatBalance(newBalance)
    localStorage.setItem('wurm_balance', String(formattedBalance))
    window.dispatchEvent(new Event('wurm-balance-updated'))
    if (shouldNotify) createNotification(message)
  }

  const affinityMatch = message.match(/[Yy]ou\s+realize\s+that\s+you\s+have\s+developed\s+an\s+affinity\s+for\s+(.+?)(?:\.|$)/i)
  if (affinityMatch) createNotification(message)
}

export function processTimeCommand(message) {
  try {
    if (!message.includes('It is') || !message.includes('starfall')) return
    const parsed = parseTimeCommand(message)
    if (!parsed) return
    const pcTimeMatch = message.match(/\[(\d{2}):(\d{2}):(\d{2})\]/)
    if (!pcTimeMatch) return

    const now = new Date()
    const pcHour = parseInt(pcTimeMatch[1], 10)
    const pcMinute = parseInt(pcTimeMatch[2], 10)
    const pcSecond = parseInt(pcTimeMatch[3], 10)
    const pcDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), pcHour, pcMinute, pcSecond)

    const newEpoch = calculateEpochFromCalibration(
      pcDateTime,
      parsed.hour,
      parsed.minute,
      parsed.second,
      parsed.week,
      parsed.starfall,
      parsed.year
    )

    localStorage.setItem('wurm_calibrated_epoch', newEpoch.toISOString())
    window.dispatchEvent(new Event('wurm-epoch-updated'))
    createNotification(`Calibração automática realizada: ${parsed.starfall}, semana ${parsed.week}, ano ${parsed.year}`)
  } catch (err) {
    console.debug('[messageProcessing] Erro ao processar /time:', err)
  }
}

export function checkAlarmForMessages(messages, config, volume) {
  if (!config.enabled || !config.keywords.trim()) return
  const keywords = config.keywords
    .split(',')
    .map(k => k.trim().toLowerCase())
    .filter(k => k.length > 0)
  if (keywords.length === 0) return

  messages.forEach(message => {
    const messageLower = message.toLowerCase()
    const foundKeyword = keywords.find(keyword => messageLower.includes(keyword))
    if (foundKeyword) {
      playAlarmSound(volume)
      createNotification(message)
    }
  })
}
