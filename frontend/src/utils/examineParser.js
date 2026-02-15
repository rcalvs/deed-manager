// Parser para mensagens de examine de animais do Wurm Online
import { ANIMAL_TRAITS } from '../constants'

/**
 * Triggers que indicam o início de um examine de animal
 * Cada trigger deve corresponder à primeira linha do examine
 * Nota: Os triggers são comparados em lowercase, então podem estar em qualquer case
 */
const EXAMINE_TRIGGERS = {
  'horse': ['horses like this one have many uses'],
  'bison': [
    'bison like this one have many uses',
    'the bison are impressive creatures when moving in hordes'
  ],
  'hell_horse': ['hell horses like this one have many uses', 'hell horse like this one have many uses'],
  'cow': ['cows like this one have many uses'],
  'bull': ['bulls like this one have many uses'],
  'donkey': ['donkeys like this one have many uses'],
  'mule': ['mules like this one have many uses'],
  'ram': ['rams like this one have many uses'],
  'sheep': ['sheep like this one have many uses'],
  'pig': ['pigs like this one have many uses'],
  'deer': ['a fallow deer is here, watching for enemies'],
  'pheasant': ['pheasants like this one have many uses'],
  'hen': ['hens like this one have many uses'],
  'rooster': ['roosters like this one have many uses'],
  'dog': ['dogs like this one have many uses'],
  'unicorn': [
    'a bright white unicorn with a slender twisted horn',
    'a small bright white unicorn foal with a budding horn'
  ]
}

/**
 * Verifica se uma linha contém algum trigger de examine (sem precisar de timestamp)
 * Útil para verificação rápida antes de processar
 */
export function hasExamineTrigger(line) {
  if (!line) return false
  
  const lowerLine = line.toLowerCase()
  
  // Verificar todos os triggers possíveis
  for (const [animalType, triggers] of Object.entries(EXAMINE_TRIGGERS)) {
    for (const trigger of triggers) {
      const triggerLower = trigger.toLowerCase().trim().replace(/\.$/, '')
      if (lowerLine.includes(triggerLower)) {
        return true
      }
    }
  }
  
  return false
}

/**
 * Verifica se uma mensagem é um trigger válido de examine
 */
function isExamineTrigger(message) {
  if (!message) {
    return { isValid: false, animalType: null }
  }
  
  const trimmed = message.trim()
  
  // Verificar se começa com timestamp
  if (!trimmed.match(/^\[\d{2}:\d{2}:\d{2}\]/)) {
    return { isValid: false, animalType: null }
  }
  
  // Remover timestamp e converter para lowercase para comparação
  // Também remover ponto final se houver (a mensagem pode terminar com ponto)
  let content = trimmed.replace(/^\[\d{2}:\d{2}:\d{2}\]\s*/, '').toLowerCase().trim()
  content = content.replace(/\.$/, '') // Remover ponto final se houver
  
  console.log('[examineParser] Verificando trigger. Conteúdo:', content.substring(0, 80))
  
  // Verificar se corresponde a algum trigger (comparação case-insensitive)
  for (const [animalType, triggers] of Object.entries(EXAMINE_TRIGGERS)) {
    for (const trigger of triggers) {
      // Converter trigger para lowercase e remover ponto final se houver
      const triggerLower = trigger.toLowerCase().trim().replace(/\.$/, '')
      
      // Normalizar espaços múltiplos para comparação mais robusta
      const normalizedContent = content.replace(/\s+/g, ' ').trim()
      const normalizedTrigger = triggerLower.replace(/\s+/g, ' ').trim()
      
      // Verificar se o conteúdo contém o trigger (case-insensitive)
      if (normalizedContent.includes(normalizedTrigger)) {
        console.log(`[examineParser] ✓ Trigger encontrado para ${animalType}`)
        console.log(`[examineParser] Conteúdo normalizado: "${normalizedContent}"`)
        console.log(`[examineParser] Trigger normalizado: "${normalizedTrigger}"`)
        return { isValid: true, animalType }
      } else {
        // Log de debug para unicorns
        if (animalType === 'unicorn') {
          console.log(`[examineParser] Comparando unicorn:`)
          console.log(`[examineParser]   Conteúdo: "${normalizedContent}"`)
          console.log(`[examineParser]   Trigger: "${normalizedTrigger}"`)
          console.log(`[examineParser]   Match: ${normalizedContent.includes(normalizedTrigger)}`)
        }
      }
    }
  }
  
  console.log('[examineParser] ✗ Nenhum trigger encontrado. Conteúdo:', content.substring(0, 80))
  return { isValid: false, animalType: null }
}

/**
 * Extrai o tipo do animal da primeira linha do examine
 * Exemplo: "Horses like this one have many uses." -> "horse"
 */
export function extractAnimalType(firstLine) {
  if (!firstLine) return null
  
  const typeMap = {
    'horses': 'horse',
    'bison': 'bison',
    'hell horses': 'hell_horse',
    'hell horse': 'hell_horse',
    'cows': 'cow',
    'bulls': 'bull',
    'donkeys': 'donkey',
    'mules': 'mule',
    'rams': 'ram',
    'sheep': 'sheep',
    'pigs': 'pig',
    'deer': 'deer',
    'pheasants': 'pheasant',
    'hens': 'hen',
    'roosters': 'rooster',
    'dogs': 'dog',
    'unicorns': 'unicorn'
  }
  
  const lineLower = firstLine.toLowerCase()
  for (const [key, value] of Object.entries(typeMap)) {
    if (lineLower.includes(key)) {
      return value
    }
  }
  
  return null
}

/**
 * Extrai o gênero do animal
 * Procura por "She" ou "He" nas mensagens
 */
export function extractGender(messages) {
  const allText = messages.join(' ').toLowerCase()
  
  // Verificar por "She" (feminino) - procurar no início da palavra ou após espaço
  if (allText.match(/\b(she|her)\b/) || 
      allText.includes('she is') || 
      allText.includes('she has') || 
      allText.includes('she was') ||
      allText.includes('her mother') ||
      allText.includes('her father') ||
      allText.includes('her colour')) {
    return 'female'
  }
  
  // Verificar por "He" (masculino) - procurar no início da palavra ou após espaço
  if (allText.match(/\b(he|his)\b/) || 
      allText.includes('he is') || 
      allText.includes('he has') || 
      allText.includes('he was') ||
      allText.includes('his mother') ||
      allText.includes('his father') ||
      allText.includes('his colour')) {
    return 'male'
  }
  
  return null
}

/**
 * Mapeia traits extraídos para os nomes exatos das constantes ANIMAL_TRAITS
 */
function mapTraitsToConstants(extractedTraits) {
  if (!extractedTraits || extractedTraits.length === 0) {
    return []
  }
  
  const mappedTraits = []
  
  for (const extractedTrait of extractedTraits) {
    const extractedLower = extractedTrait.toLowerCase().trim()
    
    // Procurar correspondência exata ou parcial nos traits das constantes
    let matchedTrait = null
    let bestMatch = null
    let bestScore = 0
    
    for (const traitData of ANIMAL_TRAITS) {
      const traitName = traitData.trait.toLowerCase().trim()
      
      // Remover ponto final para comparação
      const traitNameNoDot = traitName.replace(/\.$/, '').trim()
      const extractedNoDot = extractedLower.replace(/\.$/, '').trim()
      
      // Caso especial: "bred in captivity" vs "Bred in captivity."
      if ((extractedNoDot === 'bred in captivity' || extractedNoDot === 'been bred in captivity') &&
          traitNameNoDot === 'bred in captivity') {
        matchedTrait = traitData.trait
        break
      }
      
      // Remover prefixos comuns para comparação
      const traitWithoutPrefix = traitNameNoDot
        .replace(/^(it has|it is|it seems|it looks|it has been|bred in captivity)\s+/i, '')
        .trim()
      
      // Para o trait extraído, remover prefixos como "to be", "been", etc.
      let extractedWithoutPrefix = extractedNoDot
        .replace(/^(it has|it is|it seems|it looks|it has been|to be|been)\s+/i, '')
        .trim()
      
      // Correspondência exata
      if (traitWithoutPrefix === extractedWithoutPrefix) {
        matchedTrait = traitData.trait
        break
      }
      
      // Correspondência parcial - calcular score
      if (traitWithoutPrefix.includes(extractedWithoutPrefix) || 
          extractedWithoutPrefix.includes(traitWithoutPrefix)) {
        const score = Math.min(traitWithoutPrefix.length, extractedWithoutPrefix.length) / 
                     Math.max(traitWithoutPrefix.length, extractedWithoutPrefix.length)
        if (score > bestScore) {
          bestScore = score
          bestMatch = traitData.trait
        }
      }
    }
    
    if (matchedTrait) {
      mappedTraits.push(matchedTrait)
    } else if (bestMatch && bestScore > 0.7) {
      // Usar melhor correspondência se score for alto o suficiente
      mappedTraits.push(bestMatch)
    } else {
      // Se não encontrar correspondência, adicionar o trait original (será tratado como Miscellaneous)
      console.log('[examineParser] Trait não mapeado:', extractedTrait)
      mappedTraits.push(extractedTrait)
    }
  }
  
  return mappedTraits
}

/**
 * Extrai os traits da linha de traits
 * Exemplo: "It has fleeter movement than normal. It has lightning movement. ..."
 */
export function extractTraits(traitsLine) {
  if (!traitsLine) return []
  
  // Separar por ponto e limpar
  const traits = traitsLine
    .split('.')
    .map(t => t.trim())
    .filter(t => {
      const trimmed = t.toLowerCase()
      return t.length > 0 && 
             trimmed !== 'it' && 
             !trimmed.startsWith('it has a total') &&
             !trimmed.startsWith('it is hungry') &&
             !trimmed.startsWith('you can') &&
             !trimmed.startsWith('her colour') &&
             !trimmed.startsWith('her mother') &&
             !trimmed.startsWith('her father') &&
             !trimmed.startsWith('his mother') &&
             !trimmed.startsWith('his father') &&
             !trimmed.startsWith('she has been') &&
             !trimmed.startsWith('she is being') &&
             !trimmed.startsWith('she is very') &&
             !trimmed.startsWith('horses like') &&
             !trimmed.startsWith('cows like') &&
             !trimmed.startsWith('pigs like')
    })
    .map(t => {
      // Remover "It has", "It is", "It seems", "It looks" do início
      let cleaned = t.replace(/^(It has|It is|It seems|It looks)\s+/i, '').trim()
      // Se ainda começar com "It", remover também
      cleaned = cleaned.replace(/^It\s+/i, '').trim()
      return cleaned
    })
    .filter(t => t.length > 0 && t.length > 3) // Filtrar strings muito curtas
  
  return traits
}

/**
 * Extrai o nome da mãe e do pai da última linha
 * Exemplo: "His mother was Hopbella. His father was Rainprancer."
 * ou: "Her mother is the venerable fat Heartpie. Her father is the venerable fat Eastheart."
 * ou: "Her mother is a venerable fat bison 'F-4D-65'. Her father is a venerable fat bison."
 * 
 * Simplificado: pega tudo depois de "was/is" até o ponto, removendo apenas "the/an/a" no início
 */
export function extractParents(parentsLine) {
  if (!parentsLine) return { mother: '', father: '' }
  
  let mother = ''
  let father = ''
  
  // Função auxiliar para extrair nome - pega tudo depois de "was/is" até o ponto
  const extractName = (text) => {
    if (!text) return ''
    
    // Remover ponto final se houver
    let cleaned = text.replace(/\.$/, '').trim()
    
    // Remover "the", "an" ou "a" do início (artigos)
    cleaned = cleaned.replace(/^(the|an|a)\s+/i, '').trim()
    
    // Remover categorias de idade (venerable, old, aged, mature, adolescent, young)
    // Essas palavras mudam conforme o animal envelhece, então não devem ser parte do nome
    cleaned = cleaned.replace(/\b(venerable|old|aged|mature|adolescent|young)\s+/gi, '').trim()
    
    // Se ficou vazio após remover artigo e idade, não há nome
    if (!cleaned) return ''
    
    return cleaned
  }
  
  // Extrair mãe - suporta tanto "was" quanto "is"
  const motherMatch = parentsLine.match(/(?:Her|His)\s+mother\s+(?:was|is)\s+(.+?)(?:\.|$)/i)
  if (motherMatch) {
    mother = extractName(motherMatch[1])
  }
  
  // Extrair pai - mesma lógica
  const fatherMatch = parentsLine.match(/(?:Her|His)\s+father\s+(?:was|is)\s+(.+?)(?:\.|$)/i)
  if (fatherMatch) {
    father = extractName(fatherMatch[1])
  }
  
  return { mother, father }
}

/**
 * Parseia um conjunto de mensagens de examine e retorna os dados extraídos
 */
export function parseExamineMessages(messages) {
  if (!messages || messages.length === 0) {
    return null
  }
  
  // PRIMEIRO: Verificar se a primeira mensagem é um trigger válido
  const firstMessage = messages[0]
  const triggerCheck = isExamineTrigger(firstMessage)
  
  if (!triggerCheck.isValid) {
    console.log('[examineParser] Primeira mensagem não é um trigger válido:', firstMessage?.substring(0, 80))
    return null
  }
  
  console.log('[examineParser] Trigger encontrado! Tipo:', triggerCheck.animalType, '| Mensagens:', messages.length)
  
  // Filtrar apenas mensagens de examine (que começam com timestamp)
  const examineMessages = messages.filter(msg => {
    const trimmed = msg.trim()
    return trimmed.match(/^\[\d{2}:\d{2}:\d{2}\]/)
  })
  
  if (examineMessages.length === 0) {
    return null
  }
  
  // Remover timestamps das mensagens
  const cleanMessages = examineMessages.map(msg => {
    const match = msg.match(/^\[\d{2}:\d{2}:\d{2}\]\s*(.+)$/)
    return match ? match[1] : msg
  })
  
  // Usar o tipo do animal do trigger (mais confiável)
  const animalType = triggerCheck.animalType
  
  // Linha 5: Traits (procurar pela linha que contém múltiplos "It has", "It is", etc.)
  // Pode ser que os traits estejam em múltiplas linhas, então vamos juntar todas as linhas que contêm traits
  let traitsLines = []
  for (const msg of cleanMessages) {
    const traitCount = (msg.match(/\b(It has|It is|It seems|It looks)\b/gi) || []).length
    if (traitCount >= 1) {
      traitsLines.push(msg)
    }
  }
  
  // Juntar todas as linhas de traits em uma só
  const traitsLine = traitsLines.join(' ')
  
  const extractedTraits = extractTraits(traitsLine)
  
  // Mapear traits extraídos para os nomes exatos das constantes
  const traits = mapTraitsToConstants(extractedTraits)
  
  // Linha 11: Mãe e Pai (procurar pela linha que contém "mother" e "father")
  let parentsLine = ''
  for (const msg of cleanMessages) {
    if (msg.toLowerCase().includes('mother') && msg.toLowerCase().includes('father')) {
      parentsLine = msg
      break
    }
  }
  
  const { mother, father } = extractParents(parentsLine)
  
  // Extrair gênero
  const gender = extractGender(cleanMessages)
  
  return {
    type: animalType,
    gender: gender || 'male', // Default para male se não encontrar
    traits: traits,
    mother: mother || 'wild',
    father: father || 'wild'
  }
}

