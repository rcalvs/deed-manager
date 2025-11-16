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
}


