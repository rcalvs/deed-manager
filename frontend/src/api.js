// API wrapper para comunicação com o backend Go
// O Wails v2 gera automaticamente o objeto window.go

export const api = {
  // Adicionar item ao estoque
  // dateString é opcional, formato: "YYYY-MM-DDTHH:mm:ss"
  addStockItem: async (itemType, quality, quantity, dateString = '') => {
    if (window.go && window.go.main && window.go.main.App) {
      return await window.go.main.App.AddStockItem(itemType, quality, quantity, dateString)
    }
    throw new Error('Backend não disponível')
  },

  // Remover item do estoque
  removeStockItem: async (itemType, quality, quantity) => {
    if (window.go && window.go.main && window.go.main.App) {
      return await window.go.main.App.RemoveStockItem(itemType, quality, quantity)
    }
    throw new Error('Backend não disponível')
  },

  // Obter todos os itens
  getStockItems: async () => {
    if (window.go && window.go.main && window.go.main.App) {
      return await window.go.main.App.GetStockItems()
    }
    throw new Error('Backend não disponível')
  },

  // Obter resumo do estoque
  getStockSummary: async () => {
    if (window.go && window.go.main && window.go.main.App) {
      return await window.go.main.App.GetStockSummary()
    }
    throw new Error('Backend não disponível')
  },

  // Obter histórico
  getStockHistory: async (days) => {
    if (window.go && window.go.main && window.go.main.App) {
      return await window.go.main.App.GetStockHistory(days)
    }
    throw new Error('Backend não disponível')
  },

  // Deletar item
  deleteStockItem: async (id) => {    
    if (window.go && window.go.main && window.go.main.App) {
      return await window.go.main.App.DeleteStockItem(id)
    }
    throw new Error('Backend não disponível')
  },

  // Limpar banco de dados
  clearDatabase: async () => {
    if (window.go && window.go.main && window.go.main.App) {
      return await window.go.main.App.ClearDatabase()
    }
    throw new Error('Backend não disponível')
  },

  // Converter Ore em Lump
  convertOreToLump: async (oreID, quantity) => {
    if (window.go && window.go.main && window.go.main.App) {
      return await window.go.main.App.ConvertOreToLump(oreID, quantity)
    }
    throw new Error('Backend não disponível')
  },

  // Converter Log em Plank (1:6)
  convertLogToPlank: async (logID, quantity) => {
    if (window.go && window.go.main && window.go.main.App) {
      return await window.go.main.App.ConvertLogToPlank(logID, quantity)
    }
    throw new Error('Backend não disponível')
  },

  // Converter Log em Shaft (1:12)
  convertLogToShaft: async (logID, quantity) => {
    if (window.go && window.go.main && window.go.main.App) {
      return await window.go.main.App.ConvertLogToShaft(logID, quantity)
    }
    throw new Error('Backend não disponível')
  },

  // Converter Shaft em Peg (1:10)
  convertShaftToPeg: async (shaftID, quantity) => {
    if (window.go && window.go.main && window.go.main.App) {
      return await window.go.main.App.ConvertShaftToPeg(shaftID, quantity)
    }
    throw new Error('Backend não disponível')
  },

  // ========== NOTAS ==========
  createNote: async (title, description, category, startDate, endDate) => {
    if (window.go && window.go.main && window.go.main.App) {
      return await window.go.main.App.CreateNote(title, description, category || '', startDate || '', endDate || '')
    }
    throw new Error('Backend não disponível')
  },

  getNotes: async () => {
    if (window.go && window.go.main && window.go.main.App) {
      return await window.go.main.App.GetNotes()
    }
    throw new Error('Backend não disponível')
  },

  updateNote: async (id, title, description, category, startDate, endDate, completed) => {
    if (window.go && window.go.main && window.go.main.App) {
      return await window.go.main.App.UpdateNote(id, title, description, category || '', startDate || '', endDate || '', completed)
    }
    throw new Error('Backend não disponível')
  },

  deleteNote: async (id) => {
    if (window.go && window.go.main && window.go.main.App) {
      return await window.go.main.App.DeleteNote(id)
    }
    throw new Error('Backend não disponível')
  },

  toggleNoteCompleted: async (id) => {
    if (window.go && window.go.main && window.go.main.App) {
      return await window.go.main.App.ToggleNoteCompleted(id)
    }
    throw new Error('Backend não disponível')
  },

  // ========== DEEDS ==========
  createDeed: async (name, mayor, location, sizeWidth, sizeHeight, coffersIron, upkeepChipsIron, monthlyCostIron, upkeepDays, upkeepHours, upkeepMinutes, rawText) => {
    if (window.go && window.go.main && window.go.main.App) {
      return await window.go.main.App.CreateDeed(name, mayor || '', location || '', sizeWidth || 0, sizeHeight || 0,
        coffersIron || 0, upkeepChipsIron || 0, monthlyCostIron || 0, upkeepDays || 0, upkeepHours || 0, upkeepMinutes || 0, rawText || '')
    }
    throw new Error('Backend não disponível')
  },

  getAllDeeds: async () => {
    if (window.go && window.go.main && window.go.main.App) {
      return await window.go.main.App.GetAllDeeds()
    }
    throw new Error('Backend não disponível')
  },

  getDeed: async (id) => {
    if (window.go && window.go.main && window.go.main.App) {
      return await window.go.main.App.GetDeed(id)
    }
    throw new Error('Backend não disponível')
  },

  updateDeed: async (id, name, mayor, location, sizeWidth, sizeHeight, coffersIron, upkeepChipsIron, monthlyCostIron, upkeepDays, upkeepHours, upkeepMinutes, rawText) => {
    if (window.go && window.go.main && window.go.main.App) {
      return await window.go.main.App.UpdateDeed(id, name, mayor || '', location || '', sizeWidth || 0, sizeHeight || 0,
        coffersIron || 0, upkeepChipsIron || 0, monthlyCostIron || 0, upkeepDays || 0, upkeepHours || 0, upkeepMinutes || 0, rawText || '')
    }
    throw new Error('Backend não disponível')
  },

  deleteDeed: async (id) => {
    if (window.go && window.go.main && window.go.main.App) {
      return await window.go.main.App.DeleteDeed(id)
    }
    throw new Error('Backend não disponível')
  },

  addDeedFunds: async (deedId, amountIron, addToCoffers) => {
    if (window.go && window.go.main && window.go.main.App) {
      return await window.go.main.App.AddDeedFunds(deedId, amountIron, addToCoffers)
    }
    throw new Error('Backend não disponível')
  },

  // ========== LOCALIZAÇÕES ==========
  createLocation: async (name, description, category, mapType, server, x, y) => {
    if (window.go && window.go.main && window.go.main.App) {
      return await window.go.main.App.CreateLocation(name, description, category || '', mapType || 'yaga', server || 'Harmony', x, y)
    }
    throw new Error('Backend não disponível')
  },

  getLocations: async () => {
    if (window.go && window.go.main && window.go.main.App) {
      return await window.go.main.App.GetLocations()
    }
    throw new Error('Backend não disponível')
  },

  updateLocation: async (id, name, description, category, mapType, server, x, y) => {
    if (window.go && window.go.main && window.go.main.App) {
      return await window.go.main.App.UpdateLocation(id, name, description, category || '', mapType || 'yaga', server || 'Harmony', x, y)
    }
    throw new Error('Backend não disponível')
  },

  deleteLocation: async (id) => {
    if (window.go && window.go.main && window.go.main.App) {
      return await window.go.main.App.DeleteLocation(id)
    }
    throw new Error('Backend não disponível')
  },

  // ========== ATUALIZAÇÕES ==========
  checkForUpdate: async () => {
    if (window.go && window.go.main && window.go.main.App) {
      return await window.go.main.App.CheckForUpdate()
    }
    throw new Error('Backend não disponível')
  },

  applyUpdate: async () => {
    if (window.go && window.go.main && window.go.main.App) {
      return await window.go.main.App.ApplyUpdate()
    }
    throw new Error('Backend não disponível')
  },

  getCurrentVersion: async () => {
    if (window.go && window.go.main && window.go.main.App) {
      return await window.go.main.App.GetCurrentVersion()
    }
    throw new Error('Backend não disponível')
  },

  canAutoUpdate: async () => {
    if (window.go && window.go.main && window.go.main.App) {
      return await window.go.main.App.CanAutoUpdate()
    }
    return false
  },

  getAppVersion: async () => {
    if (window.go && window.go.main && window.go.main.App) {
      return await window.go.main.App.GetAppVersion()
    }
    return 'unknown'
  },

  // Configurar caminho dos logs
  setLogsPath: async (path) => {
    if (window.go && window.go.main && window.go.main.App) {
      return await window.go.main.App.SetLogsPath(path)
    }
    throw new Error('Backend não disponível')
  },

  // Obter caminho dos logs
  getLogsPath: async () => {
    if (window.go && window.go.main && window.go.main.App) {
      return await window.go.main.App.GetLogsPath()
    }
    throw new Error('Backend não disponível')
  },

  // Ler última linha do arquivo Trade.2025-08
  readTradeLogLastLine: async () => {
    if (window.go && window.go.main && window.go.main.App) {
      return await window.go.main.App.ReadTradeLogLastLine()
    }
    throw new Error('Backend não disponível')
  },

  // Ler últimas N linhas do arquivo Trade atual
  readCurrentTradeLogLastNLines: async (n) => {
    if (window.go && window.go.main && window.go.main.App) {
      return await window.go.main.App.ReadCurrentTradeLogLastNLines(n)
    }
    throw new Error('Backend não disponível')
  },

  readCurrentEventsLogLastNLines: async (n) => {
    if (window.go && window.go.main && window.go.main.App) {
      return await window.go.main.App.ReadCurrentEventsLogLastNLines(n)
    }
    throw new Error('Backend não disponível')
  },

  // ========== HUSBANDRY (Criação de Animais) - DESABILITADO - mudança de escopo ==========
  /*
  createAnimal: async (name, type, gender, age, condition, father, mother, traits, notes) => { ... },
  getAllAnimals: async () => { ... },
  getAnimal: async (id) => { ... },
  updateAnimal: async (...) => { ... },
  deleteAnimal: async (id) => { ... },
  setBreeding: async (femaleID, maleID, days, hours) => { ... },
  clearBreeding: async (animalID) => { ... },
  getPregnantAnimals: async () => { ... },
  */
}


