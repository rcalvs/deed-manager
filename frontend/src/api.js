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
  createNote: async (title, description, startDate, endDate) => {
    if (window.go && window.go.main && window.go.main.App) {
      return await window.go.main.App.CreateNote(title, description, startDate || '', endDate || '')
    }
    throw new Error('Backend não disponível')
  },

  getNotes: async () => {
    if (window.go && window.go.main && window.go.main.App) {
      return await window.go.main.App.GetNotes()
    }
    throw new Error('Backend não disponível')
  },

  updateNote: async (id, title, description, startDate, endDate, completed) => {
    if (window.go && window.go.main && window.go.main.App) {
      return await window.go.main.App.UpdateNote(id, title, description, startDate || '', endDate || '', completed)
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

  // ========== LOCALIZAÇÕES ==========
  createLocation: async (name, description, mapType, server, x, y) => {
    if (window.go && window.go.main && window.go.main.App) {
      return await window.go.main.App.CreateLocation(name, description, mapType || 'yaga', server || 'Harmony', x, y)
    }
    throw new Error('Backend não disponível')
  },

  getLocations: async () => {
    if (window.go && window.go.main && window.go.main.App) {
      return await window.go.main.App.GetLocations()
    }
    throw new Error('Backend não disponível')
  },

  updateLocation: async (id, name, description, mapType, server, x, y) => {
    if (window.go && window.go.main && window.go.main.App) {
      return await window.go.main.App.UpdateLocation(id, name, description, mapType || 'yaga', server || 'Harmony', x, y)
    }
    throw new Error('Backend não disponível')
  },

  deleteLocation: async (id) => {
    if (window.go && window.go.main && window.go.main.App) {
      return await window.go.main.App.DeleteLocation(id)
    }
    throw new Error('Backend não disponível')
  },
}


