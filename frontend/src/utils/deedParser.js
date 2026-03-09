/**
 * Parser para informações de deed coladas do Wurm Online
 * Suporta inglês e português
 */

export function convertToIron(gold, silver, copper, iron) {
  return (gold || 0) * 1000000 + (silver || 0) * 10000 + (copper || 0) * 100 + (iron || 0)
}

function parseCurrency(text) {
  let gold = 0,
    silver = 0,
    copper = 0,
    iron = 0
  const patterns = [
    { regex: /(\d+)\s*g\b/gi, type: 'gold' },
    { regex: /(\d+)\s*s\b/gi, type: 'silver' },
    { regex: /(\d+)\s*c\b/gi, type: 'copper' },
    { regex: /(\d+)\s*i\b/gi, type: 'iron' },
    { regex: /(\d+)\s+gold/gi, type: 'gold' },
    { regex: /(\d+)\s+silver/gi, type: 'silver' },
    { regex: /(\d+)\s+copper/gi, type: 'copper' },
    { regex: /(\d+)\s+iron/gi, type: 'iron' },
  ]
  patterns.forEach(({ regex, type }) => {
    const matches = Array.from(text.matchAll(regex))
    matches.forEach((match) => {
      const value = parseInt(match[1], 10)
      if (type === 'gold') gold += value
      else if (type === 'silver') silver += value
      else if (type === 'copper') copper += value
      else if (type === 'iron') iron += value
    })
  })
  return { gold, silver, copper, iron }
}

/**
 * Converte iron para objeto { gold, silver, copper, iron }
 */
export function ironToBreakdown(totalIron) {
  const iron = totalIron || 0
  return {
    gold: Math.floor(iron / 1000000),
    silver: Math.floor((iron % 1000000) / 10000),
    copper: Math.floor((iron % 10000) / 100),
    iron: iron % 100,
  }
}

/**
 * Parseia texto colado do jogo e extrai informações do deed
 * @param {string} text - Texto colado (ex: "The size of Acre is 32 by 23...")
 * @returns {object} Objeto com sizeWidth, sizeHeight, coffers, upkeepChips (breakdown), coffersIron, upkeepChipsIron, monthlyCostIron, upkeepDays, upkeepHours, upkeepMinutes
 */
export function parseDeedInfo(text) {
  const result = {
    sizeWidth: 0,
    sizeHeight: 0,
    coffers: { gold: 0, silver: 0, copper: 0, iron: 0 },
    upkeepChips: { gold: 0, silver: 0, copper: 0, iron: 0 },
    monthlyCost: { gold: 0, silver: 0, copper: 0, iron: 0 },
    coffersIron: 0,
    upkeepChipsIron: 0,
    monthlyCostIron: 0,
    upkeepDays: 0,
    upkeepHours: 0,
    upkeepMinutes: 0,
  }

  if (!text || typeof text !== 'string') return result
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)

  for (const line of lines) {
    const lower = line.toLowerCase()

    // Size: "The size of Acre is 32 by 23" / "O tamanho de X é 32 por 23"
    const sizeMatch = line.match(/(?:size|tamanho)[^\d]*(\d+)\s*(?:by|por|x)\s*(\d+)/i)
    if (sizeMatch) {
      result.sizeWidth = parseInt(sizeMatch[1], 10) || 0
      result.sizeHeight = parseInt(sizeMatch[2], 10) || 0
      continue
    }

    // Coffers: "The settlement has X in its coffers" / "cofre"
    if (lower.includes('coffers') || lower.includes('cofre')) {
      const parsed = parseCurrency(line)
      result.coffers = { gold: parsed.gold, silver: parsed.silver, copper: parsed.copper, iron: parsed.iron }
      result.coffersIron = convertToIron(parsed.gold, parsed.silver, parsed.copper, parsed.iron)
      continue
    }

    // Village upkeep chips: "in the form of village upkeep chips"
    if (lower.includes('village upkeep chips') || lower.includes('chips')) {
      const parsed = parseCurrency(line)
      result.upkeepChips = { gold: parsed.gold, silver: parsed.silver, copper: parsed.copper, iron: parsed.iron }
      result.upkeepChipsIron = convertToIron(parsed.gold, parsed.silver, parsed.copper, parsed.iron)
      continue
    }

    // Monthly cost: "The monthly cost is" / "custo mensal"
    if (lower.includes('monthly cost') || lower.includes('custo mensal')) {
      const parsed = parseCurrency(line)
      result.monthlyCost = { gold: parsed.gold, silver: parsed.silver, copper: parsed.copper, iron: parsed.iron }
      result.monthlyCostIron = convertToIron(parsed.gold, parsed.silver, parsed.copper, parsed.iron)
      continue
    }

    // Duration: "will last approximately 143 days, 20 hours and 16 minutes" / "durar aproximadamente"
    const durationMatch = line.match(
      /(\d+)\s*(?:days?|dias?)[^\d]*(\d+)\s*(?:hours?|horas?)[^\d]*(\d+)\s*(?:minutes?|minutos?)/i
    )
    if (durationMatch) {
      result.upkeepDays = parseInt(durationMatch[1], 10) || 0
      result.upkeepHours = parseInt(durationMatch[2], 10) || 0
      result.upkeepMinutes = parseInt(durationMatch[3], 10) || 0
    }
  }

  return result
}
