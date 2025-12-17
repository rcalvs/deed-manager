// Parser para mensagens de examine de animais do Wurm Online

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
  if (allText.includes(' she ') || allText.includes('she is') || allText.includes('she has') || allText.includes('her ')) {
    return 'female'
  }
  if (allText.includes(' he ') || allText.includes('he is') || allText.includes('he has') || allText.includes('his ')) {
    return 'male'
  }
  return null
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
 * Exemplo: "Her mother is the venerable fat Heartpie. Her father is the venerable fat Eastheart."
 */
export function extractParents(parentsLine) {
  if (!parentsLine) return { mother: '', father: '' }
  
  let mother = ''
  let father = ''
  
  // Extrair mãe
  const motherMatch = parentsLine.match(/(?:Her|His)\s+mother\s+is\s+(?:the\s+)?(?:venerable|old|aged|mature|adolescent|young)?\s*(?:fat\s+)?(.+?)(?:\.|$)/i)
  if (motherMatch) {
    mother = motherMatch[1].trim()
  }
  
  // Extrair pai
  const fatherMatch = parentsLine.match(/(?:Her|His)\s+father\s+is\s+(?:the\s+)?(?:venerable|old|aged|mature|adolescent|young)?\s*(?:fat\s+)?(.+?)(?:\.|$)/i)
  if (fatherMatch) {
    father = fatherMatch[1].trim()
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
  
  // Filtrar apenas mensagens de examine (que começam com timestamp)
  const examineMessages = messages.filter(msg => {
    const trimmed = msg.trim()
    return trimmed.match(/^\[\d{2}:\d{2}:\d{2}\]/) && 
           (trimmed.includes('like this one have many uses') || 
            trimmed.includes('have many uses') ||
            trimmed.includes('mother is') ||
            trimmed.includes('father is') ||
            trimmed.includes('It has') ||
            trimmed.includes('It is') ||
            trimmed.includes('It seems') ||
            trimmed.includes('It looks'))
  })
  
  if (examineMessages.length === 0) {
    return null
  }
  
  // Remover timestamps das mensagens
  const cleanMessages = examineMessages.map(msg => {
    const match = msg.match(/^\[\d{2}:\d{2}:\d{2}\]\s*(.+)$/)
    return match ? match[1] : msg
  })
  
  // Linha 1: Tipo do animal
  const firstLine = cleanMessages[0] || ''
  const animalType = extractAnimalType(firstLine)
  
  if (!animalType) {
    return null // Não é um examine de animal válido
  }
  
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
  
  const traits = extractTraits(traitsLine)
  
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

