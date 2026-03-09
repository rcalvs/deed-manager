// Utilitário para calcular o tempo do Wurm Online
// Baseado na wiki: https://www.wurmpedia.com/index.php/Wurm_Universe#Time.2C_Seasons

// Constantes do tempo do Wurm
const WURM_HOUR_MS = 5 * 60 * 1000 // 5 minutos reais = 1 hora Wurm
const WURM_DAY_MS = 2 * 60 * 60 * 1000 // 2 horas reais = 1 dia Wurm
const WURM_WEEK_MS = 7 * WURM_DAY_MS // 7 dias Wurm = 1 semana
const WURM_STARFALL_MS = 4 * WURM_WEEK_MS // 4 semanas = 1 estação (starfall)
const WURM_YEAR_MS = 8 * WURM_STARFALL_MS // 8 estações = 1 ano

// Época de referência do Wurm (padrão)
// Calibrado baseado em: 02/12/2025 23:00 GMT-4 = ano 1140, Leaf, semana 1, 01:49:11
// Esta época foi calculada para corresponder à data de referência fornecida
// Nota: Pequenas diferenças de segundos são aceitáveis e não impactam o jogo
// Para recalibrar: use o comando /time no jogo e calcule uma nova época
const DEFAULT_WURM_EPOCH = new Date('1967-08-27T18:50:57.250Z')

// Chave para armazenar época calibrada no localStorage
const CALIBRATED_EPOCH_KEY = 'wurm_calibrated_epoch'

/**
 * Obtém a época do Wurm (calibrada ou padrão)
 * @returns {Date} Época do Wurm
 */
function getWurmEpoch() {
  const calibrated = localStorage.getItem(CALIBRATED_EPOCH_KEY)
  if (calibrated) {
    try {
      return new Date(calibrated)
    } catch (e) {
      console.warn('Erro ao carregar época calibrada, usando padrão:', e)
      return DEFAULT_WURM_EPOCH
    }
  }
  return DEFAULT_WURM_EPOCH
}

// Offset para ajustar o ano base
// Com a época calibrada, o offset deve ser 0 (ano começa do 0)
// Mas mantemos a flexibilidade para ajustes futuros
const WURM_YEAR_OFFSET = 0

// Nomes das estações (starfalls) em ordem
// Ordem baseada no ciclo anual do Wurm (8 starfalls = 1 ano)
// Baseado em: https://www.wurmpedia.com/index.php/Wurm_Universe#Time.2C_Seasons
const STARFALLS = [
  'Diamond', // Diamante (posição 0) - Winter (semana 2), Spring (semana 3)
  'Leaf',    // Folha (posição 1) - Summer (semana 1)
  'Raven',   // Corvo (posição 2) - Autumn (semana 4)
  'Silent',  // Silencioso (posição 3) - Winter (semana 2)
  'Sun',     // Sol (posição 4) - Summer
  'Bear',    // Urso (posição 5) - Summer
  'Snake',   // Cobra (posição 6) - Autumn
  'Deer'     // Veado (posição 7) - Autumn
]

// Duração de uma colheita em milissegundos (3.5 dias reais = 302400 segundos)
const HARVEST_DURATION_MS = 302400 * 1000 // 3.5 dias em milissegundos

// Calendário de colheita por starfall e semana
// Baseado em: https://www.wurmpedia.com/index.php/Harvest_calendar
// E https://www.wurmnode.com/tool/harvests
// Cada colheita começa no primeiro dia da semana X da starfall Y e dura 3.5 dias reais
// Estrutura: Array de objetos com { harvest, starfall, week, startOffset }
// startOffset: offset em dias Wurm desde o início da semana (0 = primeiro dia)
const HARVEST_SCHEDULE = [
  // Bear Starfall - Semana 2: Lavender flowers
  { harvest: 'Lavender flowers', starfall: 'Bear', week: 2, startOffset: 0 },
  // Bear Starfall - Semana 3: Rose flowers
  { harvest: 'Rose flowers', starfall: 'Bear', week: 3, startOffset: 0 },
  // Bear Starfall - Semana 4: Maple (começa no primeiro dia da semana 4)
  { harvest: 'Maple', starfall: 'Bear', week: 4, startOffset: 0 },
  
  // Snake Starfall - Semana 2: Acorns (começa no primeiro dia da semana 2)
  { harvest: 'Acorns', starfall: 'Snake', week: 2, startOffset: 0 },
  // Snake Starfall - Semana 4: Acorns (segunda ocorrência, começa no primeiro dia da semana 4)
  { harvest: 'Acorns', starfall: 'Snake', week: 4, startOffset: 0 },
  
  // Sun Starfall - Semana 1: Cherry
  { harvest: 'Cherry', starfall: 'Sun', week: 1, startOffset: 0 },
  
  // Fire Starfall - Semana 1: Olives
  { harvest: 'Olives', starfall: 'Fire', week: 1, startOffset: 0 },
  // Fire Starfall - Semana 2: Blueberries
  { harvest: 'Blueberries', starfall: 'Fire', week: 2, startOffset: 0 },
  // Fire Starfall - Semana 3: Hops
  { harvest: 'Hops', starfall: 'Fire', week: 3, startOffset: 0 },
  // Fire Starfall - Semana 4: Oranges
  { harvest: 'Oranges', starfall: 'Fire', week: 4, startOffset: 0 },
  
  // Raven Starfall - Semana 1: Grapes
  { harvest: 'Grapes', starfall: 'Raven', week: 1, startOffset: 0 },
  // Raven Starfall - Semana 2: Lemons
  { harvest: 'Lemons', starfall: 'Raven', week: 2, startOffset: 0 },
  // Raven Starfall - Semana 3: Apples
  { harvest: 'Apples', starfall: 'Raven', week: 3, startOffset: 0 },
  // Raven Starfall - Semana 4: Chestnuts
  { harvest: 'Chestnuts', starfall: 'Raven', week: 4, startOffset: 0 },
  
  // Deer Starfall - Semana 1: Raspberries
  { harvest: 'Raspberries', starfall: 'Deer', week: 1, startOffset: 0 },
  // Deer Starfall - Semana 2: Walnuts
  { harvest: 'Walnuts', starfall: 'Deer', week: 2, startOffset: 0 },
  // Deer Starfall - Semana 3: Hazelnuts
  { harvest: 'Hazelnuts', starfall: 'Deer', week: 3, startOffset: 0 },
  // Deer Starfall - Semana 4: Lingonberries
  { harvest: 'Lingonberries', starfall: 'Deer', week: 4, startOffset: 0 },
  
  // Diamond Starfall - Semana 1: Pinenut
  { harvest: 'Pinenut', starfall: 'Diamond', week: 1, startOffset: 0 },
  
  // Leaf Starfall - Semana 2: Oleander
  { harvest: 'Oleander', starfall: 'Leaf', week: 2, startOffset: 0 },
  // Leaf Starfall - Semana 4: Camellia
  { harvest: 'Camellia', starfall: 'Leaf', week: 4, startOffset: 0 },
]

// Calendário de colheita por starfall e semana (mantido para compatibilidade)
// Baseado em: https://www.wurmpedia.com/index.php/Harvest_calendar
// Estrutura: { starfall: { week: [harvests] } }
const HARVEST_CALENDAR = {
  'Diamond': {
    name: 'Diamond',
    weeks: {
      1: ['Pinenut'],
      2: [],
      3: [],
      4: []
    }
  },
  'Leaf': {
    name: 'Leaf',
    weeks: {
      1: [],
      2: ['Oleander'],
      3: [],
      4: ['Camellia']
    }
  },
  'Bear': {
    name: 'Bear',
    weeks: {
      1: [],
      2: ['Lavender flowers'],
      3: ['Rose flowers'],
      4: ['Maple']
    }
  },
  'Snake': {
    name: 'Snake',
    weeks: {
      1: [],
      2: ['Acorns'],
      3: [],
      4: []
    }
  },
  'Sun': {
    name: 'Sun',
    weeks: {
      1: ['Cherry'],
      2: [],
      3: [],
      4: []
    }
  },
  // Fire (também conhecido como Fires) - colheitas adicionais
  // Mapeado para posição entre Sun e Raven baseado na tabela do Harvest Calendar
  'Fire': {
    name: 'Fire',
    weeks: {
      1: ['Olives'],
      2: ['Blueberries'],
      3: ['Hops'],
      4: ['Oranges']
    }
  },
  'Raven': {
    name: 'Raven',
    weeks: {
      1: ['Grapes'],
      2: ['Lemons'],
      3: ['Apples'],
      4: ['Chestnuts']
    }
  },
  'Deer': {
    name: 'Deer',
    weeks: {
      1: ['Raspberries'],
      2: ['Walnuts'],
      3: ['Hazelnuts'],
      4: ['Lingonberries']
    }
  },
  'Silent': {
    name: 'Silent',
    weeks: {
      1: [],
      2: [],
      3: [],
      4: []
    }
  }
}

// Mapeamento de Starfalls para estações reais baseado nas semanas
// Baseado em: https://www.wurmpedia.com/index.php/Wurm_Universe#Time.2C_Seasons
// Spring: começa na semana 3 do Diamond Starfall
// Summer: começa na semana 1 do Leaf Starfall
// Autumn: começa na semana 4 do Raven Starfall
// Winter: começa na semana 2 do Silent Starfall
const SEASON_MAPPING = {
  'Diamond': {
    1: 'Winter',  // Semana 1 = Winter (continuação do Silent)
    2: 'Winter',  // Semana 2 = Winter
    3: 'Spring',  // Semana 3 = Spring (início oficial)
    4: 'Spring'   // Semana 4 = Spring
  },
  'Leaf': {
    1: 'Summer',  // Semana 1 = Summer (início oficial)
    2: 'Summer',  // Semana 2 = Summer
    3: 'Summer',  // Semana 3 = Summer
    4: 'Summer'   // Semana 4 = Summer
  },
  'Raven': {
    1: 'Summer',  // Semana 1 = Summer (continuação do Leaf/Sun/Bear)
    2: 'Summer',  // Semana 2 = Summer
    3: 'Summer',  // Semana 3 = Summer
    4: 'Autumn'   // Semana 4 = Autumn (início oficial)
  },
  'Silent': {
    1: 'Autumn',  // Semana 1 = Autumn (continuação do Raven)
    2: 'Winter',  // Semana 2 = Winter (início oficial)
    3: 'Winter',  // Semana 3 = Winter
    4: 'Winter'   // Semana 4 = Winter
  },
  // Para os outros starfalls, manter a estação baseada na posição no ciclo
  'Sun': 'Summer',   // Entre Leaf e Bear, continua Summer
  'Bear': 'Summer',  // Continua Summer
  'Snake': 'Autumn', // Entre Raven e Deer, continua Autumn (já começou na semana 4 do Raven)
  'Deer': 'Autumn'   // Continua Autumn
}

/**
 * Calcula o tempo do Wurm baseado no tempo real atual
 * @param {Date} realTime - Tempo real (padrão: agora)
 * @returns {Object} Informações do tempo do Wurm
 */
export function calculateWurmTime(realTime = new Date()) {
  // Obter época (calibrada ou padrão)
  const epoch = getWurmEpoch()
  
  // Calcular diferença desde a época do Wurm
  const timeDiff = realTime.getTime() - epoch.getTime()
  
  // Calcular ano do Wurm (começando do ano 0)
  const wurmYear = Math.floor(timeDiff / WURM_YEAR_MS) + WURM_YEAR_OFFSET
  
  // Calcular estação (starfall) dentro do ano (0-7)
  const timeInYear = timeDiff % WURM_YEAR_MS
  const starfallIndex = Math.floor(timeInYear / WURM_STARFALL_MS)
  const starfall = STARFALLS[starfallIndex]
  
  // Calcular semana dentro da estação (1-4)
  const timeInStarfall = timeInYear % WURM_STARFALL_MS
  const week = Math.floor(timeInStarfall / WURM_WEEK_MS) + 1
  
  // Calcular dia da semana (0-6, onde 0 = primeiro dia)
  const timeInWeek = timeInYear % WURM_WEEK_MS
  const dayOfWeek = Math.floor(timeInWeek / WURM_DAY_MS)
  
  // Dia da semana como número (1-7, onde 1 = primeiro dia)
  const dayOfWeekNumber = dayOfWeek + 1
  
  // Calcular hora do dia (0-23)
  const timeInDay = timeInYear % WURM_DAY_MS
  const hour = Math.floor(timeInDay / WURM_HOUR_MS)
  
  // Calcular minutos (0-59)
  const timeInHour = timeInDay % WURM_HOUR_MS
  const minute = Math.floor((timeInHour / WURM_HOUR_MS) * 60)
  
  // Calcular segundos (0-59)
  const second = Math.floor(((timeInHour % WURM_HOUR_MS) / WURM_HOUR_MS) * 60)
  
  // Determinar nome do dia da semana
  const dayNames = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh']
  const dayName = dayNames[dayOfWeek] || 'Unknown'
  
  // Obter informações de colheita ativas no momento atual (com sobreposição)
  const harvestInfo = getActiveHarvests(timeDiff, wurmYear)
  
  // Determinar estação real baseado no starfall e semana
  let season = 'Unknown'
  if (SEASON_MAPPING[starfall]) {
    if (typeof SEASON_MAPPING[starfall] === 'object') {
      // Mapeamento por semana (Diamond, Leaf, Raven, Silent)
      season = SEASON_MAPPING[starfall][week] || 'Unknown'
    } else {
      // Mapeamento direto (Sun, Bear, Snake, Deer)
      season = SEASON_MAPPING[starfall]
    }
  }
  
  return {
    year: wurmYear,
    starfall: starfall,
    starfallIndex: starfallIndex,
    week: week,
    dayOfWeek: dayOfWeek, // 0-6 (para compatibilidade)
    dayOfWeekNumber: dayOfWeekNumber, // 1-7 (dia da semana como número)
    dayName: dayName,
    hour: hour,
    minute: minute,
    second: second,
    season: season, // Estação real (Spring, Summer, Autumn, Winter)
    harvestInfo: harvestInfo,
    // String formatada similar ao comando /time
    formattedTime: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`,
    formattedDate: `day ${dayName} in week ${week} of the starfall of the ${starfall} in the year of ${wurmYear}`
  }
}

/**
 * Formata o tempo do Wurm para exibição
 * @param {Object} wurmTime - Objeto retornado por calculateWurmTime
 * @returns {string} String formatada
 */
export function formatWurmTime(wurmTime) {
  return `It is ${wurmTime.formattedTime} on ${wurmTime.formattedDate}.`
}

/**
 * Calcula quais colheitas estão ativas no momento atual baseado no tempo absoluto
 * Considera sobreposição de períodos (cada colheita dura 3.5 dias reais)
 * @param {number} timeDiff - Diferença de tempo em milissegundos desde a época do Wurm
 * @param {number} wurmYear - Ano atual do Wurm
 * @returns {Object} Informações de colheita com array de harvests ativas
 */
function getActiveHarvests(timeDiff, wurmYear) {
  const activeHarvests = []
  
  // Calcular tempo dentro do ano atual
  const timeInYear = timeDiff % WURM_YEAR_MS
  
  // Para cada colheita no schedule
  HARVEST_SCHEDULE.forEach(({ harvest, starfall, week, startOffset }) => {
    // Encontrar o índice do starfall
    const starfallIndex = STARFALLS.indexOf(starfall)
    if (starfallIndex === -1) return
    
    // Calcular quando a colheita começa (em milissegundos desde o início do ano)
    // Tempo até o início do starfall
    const timeToStarfall = starfallIndex * WURM_STARFALL_MS
    
    // Tempo até o início da semana (week é 1-4, mas precisamos 0-3)
    const timeToWeek = (week - 1) * WURM_WEEK_MS
    
    // Tempo até o offset do dia (startOffset em dias Wurm)
    const timeToDay = startOffset * WURM_DAY_MS
    
    // Tempo absoluto do início da colheita dentro do ano
    const harvestStartInYear = timeToStarfall + timeToWeek + timeToDay
    
    // Tempo absoluto do fim da colheita (início + duração)
    let harvestEndInYear = harvestStartInYear + HARVEST_DURATION_MS
    
    // Verificar se o tempo atual está dentro do período da colheita
    let isActive = false
    
    // Caso normal: início e fim no mesmo ciclo do ano
    if (harvestEndInYear <= WURM_YEAR_MS) {
      // Colheita não cruza o fim do ano
      isActive = timeInYear >= harvestStartInYear && timeInYear < harvestEndInYear
    } else {
      // Colheita cruza o fim do ano (dura mais que o restante do ano)
      // Verificar se está no início (antes do fim do ano) ou no fim (depois do início do ano)
      const harvestEndInYearWrapped = harvestEndInYear % WURM_YEAR_MS
      isActive = timeInYear >= harvestStartInYear || timeInYear < harvestEndInYearWrapped
    }
    
    if (isActive && !activeHarvests.includes(harvest)) {
      activeHarvests.push(harvest)
    }
  })
  
  return {
    name: 'Active Harvests',
    harvests: activeHarvests
  }
}

/**
 * Obtém informações de colheita para uma estação e semana específicas
 * @param {string} starfall - Nome da estação
 * @param {number} week - Número da semana (1-4), opcional
 * @returns {Object} Informações de colheita com array de harvests
 */
export function getHarvestInfo(starfall, week = null) {
  const starfallData = HARVEST_CALENDAR[starfall]
  
  if (!starfallData) {
    return { name: starfall, harvests: [] }
  }
  
  // Se uma semana específica foi fornecida, retornar colheitas dessa semana
  if (week && starfallData.weeks && starfallData.weeks[week]) {
    return {
      name: starfallData.name,
      harvests: starfallData.weeks[week] || []
    }
  }
  
  // Caso contrário, retornar todas as colheitas do starfall (para compatibilidade)
  const allHarvests = []
  if (starfallData.weeks) {
    for (let w = 1; w <= 4; w++) {
      if (starfallData.weeks[w] && starfallData.weeks[w].length > 0) {
        allHarvests.push(...starfallData.weeks[w])
      }
    }
  }
  
  return {
    name: starfallData.name,
    harvests: allHarvests
  }
}

/**
 * Obtém todas as estações
 * @returns {Array} Lista de estações
 */
export function getAllStarfalls() {
  return STARFALLS
}

/**
 * Parseia o comando /time do jogo
 * Formato esperado: "[HH:mm:ss] It is HH:mm:ss on day of the Wurm in week X of the starfall of the Y in the year of Z."
 * @param {string} timeCommand - String do comando /time
 * @returns {Object|null} Objeto com hour, minute, second, week, starfall, year ou null se inválido
 */
export function parseTimeCommand(timeCommand) {
  if (!timeCommand || typeof timeCommand !== 'string') {
    return null
  }

  // Remover espaços extras e quebras de linha
  const cleaned = timeCommand.trim().replace(/\s+/g, ' ')

  // Regex para extrair informações
  // Aceita múltiplos formatos:
  // 1. [HH:mm:ss] It is HH:mm:ss on day of the Wurm in week X of the starfall of the Y in the year of Z.
  // 2. [HH:mm:ss] It is HH:mm:ss on day of Awakening in week X of the Y's starfall in the year of Z.
  // 3. [HH:mm:ss] It is HH:mm:ss on [Nome] day in week X of the Y's starfall in the year of Z.
  // 4. [HH:mm:ss] It is HH:mm:ss on [Nome] day in week X of the starfall of the Y in the year of Z.
  // Tenta primeiro o formato novo (Y's starfall), depois o formato antigo (starfall of the Y)
  // Aceita "on day of the Wurm", "on day of Awakening", ou "on [Nome] day" (ex: "on Wrath day")
  // O nome do dia é capturado mas não usado (grupo não capturado para não deslocar índices)
  let regex = /\[(\d{2}):(\d{2}):(\d{2})\]\s+It is (\d{2}):(\d{2}):(\d{2}) on (?:day of (?:the Wurm|Awakening)|(?:\w+) day) in week (\d+) of (?:the )?(\w+)'s starfall in the year of (\d+)\./i
  let match = cleaned.match(regex)
  
  let starfall, year
  if (match) {
    // Formato novo: Y's starfall
    starfall = match[8]
    year = parseInt(match[9], 10)
  } else {
    // Tentar formato antigo: starfall of the Y
    regex = /\[(\d{2}):(\d{2}):(\d{2})\]\s+It is (\d{2}):(\d{2}):(\d{2}) on (?:day of (?:the Wurm|Awakening)|(?:\w+) day) in week (\d+) of the starfall of the (\w+) in the year of (\d+)\./i
    match = cleaned.match(regex)
    if (!match) {
      throw new Error('Formato inválido. Use o formato: [HH:mm:ss] It is HH:mm:ss on day of the Wurm/Awakening/[Nome] day in week X of the starfall of the Y / Y\'s starfall in the year of Z.')
    }
    starfall = match[8]
    year = parseInt(match[9], 10)
  }

  // Extrair valores comuns
  const pcHour = parseInt(match[1], 10)
  const pcMinute = parseInt(match[2], 10)
  const pcSecond = parseInt(match[3], 10)
  const wurmHour = parseInt(match[4], 10)
  const wurmMinute = parseInt(match[5], 10)
  const wurmSecond = parseInt(match[6], 10)
  const week = parseInt(match[7], 10)

  // Validar valores
  if (isNaN(wurmHour) || wurmHour < 0 || wurmHour > 23) {
    throw new Error('Hora do Wurm inválida (deve ser 0-23)')
  }
  if (isNaN(wurmMinute) || wurmMinute < 0 || wurmMinute > 59) {
    throw new Error('Minuto do Wurm inválido (deve ser 0-59)')
  }
  if (isNaN(wurmSecond) || wurmSecond < 0 || wurmSecond > 59) {
    throw new Error('Segundo do Wurm inválido (deve ser 0-59)')
  }
  if (isNaN(week) || week < 1 || week > 4) {
    throw new Error('Semana inválida (deve ser 1-4)')
  }
  if (!STARFALLS.includes(starfall)) {
    throw new Error(`Starfall inválido: ${starfall}. Starfalls válidos: ${STARFALLS.join(', ')}`)
  }
  if (isNaN(year) || year < 0) {
    throw new Error('Ano inválido')
  }

  return {
    pcTime: { hour: pcHour, minute: pcMinute, second: pcSecond },
    hour: wurmHour,
    minute: wurmMinute,
    second: wurmSecond,
    week: week,
    starfall: starfall,
    year: year
  }
}

/**
 * Calcula a nova época baseada em uma calibração
 * @param {Date} realTime - Tempo real quando o comando /time foi executado
 * @param {number} wurmHour - Hora do Wurm (0-23)
 * @param {number} wurmMinute - Minuto do Wurm (0-59)
 * @param {number} wurmSecond - Segundo do Wurm (0-59)
 * @param {number} week - Semana do Wurm (1-4)
 * @param {string} starfall - Starfall do Wurm
 * @param {number} year - Ano do Wurm
 * @returns {Date} Nova época calculada
 */
export function calculateEpochFromCalibration(realTime, wurmHour, wurmMinute, wurmSecond, week, starfall, year) {
  // Validar starfall
  const starfallIndex = STARFALLS.indexOf(starfall)
  if (starfallIndex === -1) {
    throw new Error(`Starfall inválido: ${starfall}`)
  }

  // Calcular tempo do Wurm em milissegundos desde o início do ano
  // Ano completo
  const yearsSinceStart = year - WURM_YEAR_OFFSET
  const timeInYears = yearsSinceStart * WURM_YEAR_MS

  // Starfall dentro do ano
  const timeInStarfall = starfallIndex * WURM_STARFALL_MS

  // Semana dentro do starfall (week é 1-4, mas precisamos 0-3)
  const timeInWeek = (week - 1) * WURM_WEEK_MS

  // Hora do dia
  const timeInDay = wurmHour * WURM_HOUR_MS + wurmMinute * (WURM_HOUR_MS / 60) + wurmSecond * (WURM_HOUR_MS / 3600)

  // Tempo total do Wurm desde a época
  const totalWurmTime = timeInYears + timeInStarfall + timeInWeek + timeInDay

  // Calcular nova época: realTime - totalWurmTime
  const newEpoch = new Date(realTime.getTime() - totalWurmTime)

  return newEpoch
}

