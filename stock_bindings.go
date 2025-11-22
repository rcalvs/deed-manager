package main

import (
	"log"
	"time"
)

// Este arquivo contém os métodos expostos para o frontend via Wails

// AddStockItem adiciona um item ao estoque
// dateString é opcional, formato: "2006-01-02T15:04:05Z07:00" ou "2006-01-02" (usa meia-noite)
// Se dateString for vazio, usa o tempo atual
func (a *App) AddStockItem(itemType string, quality float64, quantity int, dateString string) (*StockItem, error) {
	log.Printf("[App] AddStockItem: Recebida requisição - type=%s, quality=%.1f, quantity=%d, dateString='%s'", 
		itemType, quality, quantity, dateString)
	
	var customTime *time.Time
	
	if dateString != "" {
		// Tentar parsear a data em diferentes formatos
		var parsedTime time.Time
		var err error
		
		// Formato completo: "2006-01-02T15:04:05"
		parsedTime, err = time.Parse("2006-01-02T15:04:05", dateString)
		if err != nil {
			// Formato sem segundos: "2006-01-02T15:04" (formato do datetime-local)
			parsedTime, err = time.Parse("2006-01-02T15:04", dateString)
			if err != nil {
				// Formato apenas com data: "2006-01-02"
				parsedTime, err = time.Parse("2006-01-02", dateString)
				if err != nil {
					log.Printf("[App] AddStockItem: Erro ao parsear data '%s': %v, usando data atual", dateString, err)
					customTime = nil
				} else {
					// Se for apenas data, usar meia-noite
					log.Printf("[App] AddStockItem: Data parseada (formato data apenas): %v", parsedTime)
					customTime = &parsedTime
				}
			} else {
				log.Printf("[App] AddStockItem: Data parseada (formato sem segundos): %v", parsedTime)
				customTime = &parsedTime
			}
		} else {
			log.Printf("[App] AddStockItem: Data parseada (formato completo): %v", parsedTime)
			customTime = &parsedTime
		}
	} else {
		log.Printf("[App] AddStockItem: Nenhuma data customizada fornecida, usando data atual")
	}
	
	result, err := a.stockService.AddItem(ItemType(itemType), quality, quantity, customTime)
	if err != nil {
		log.Printf("[App] AddStockItem: Erro ao adicionar item: %v", err)
	} else {
		log.Printf("[App] AddStockItem: Item adicionado com sucesso")
	}
	return result, err
}

// RemoveStockItem remove quantidade de um item do estoque
func (a *App) RemoveStockItem(itemType string, quality float64, quantity int) error {
	return a.stockService.RemoveItem(ItemType(itemType), quality, quantity)
}

// GetStockItems retorna todos os itens do estoque
func (a *App) GetStockItems() ([]*StockItem, error) {
	return a.stockService.GetAllItems()
}

// GetStockSummary retorna um resumo do estoque
func (a *App) GetStockSummary() ([]*StockSummary, error) {
	return a.stockService.GetStockSummary()
}

// GetStockHistory retorna o histórico de estoque para gráficos
func (a *App) GetStockHistory(days int) ([]*StockHistoryPoint, error) {
	return a.stockService.GetStockHistory(days)
}

// DeleteStockItem remove completamente um item do estoque
func (a *App) DeleteStockItem(id int64) error {
	log.Printf("[App] DeleteStockItem: Recebida requisição para deletar item ID=%d", id)

	err := a.stockService.DeleteItem(id)
	if err != nil {
		log.Printf("[App] DeleteStockItem: Erro ao deletar item ID=%d: %v", id, err)
		return err
	}

	log.Printf("[App] DeleteStockItem: Item ID=%d deletado com sucesso", id)
	return nil
}

// ClearDatabase limpa todo o banco de dados
func (a *App) ClearDatabase() error {
	return a.stockService.ClearDatabase()
}

// ConvertOreToLump converte uma quantidade de Ore em Lump (proporção 1:1)
func (a *App) ConvertOreToLump(oreID int64, quantity int) error {
	log.Printf("[App] ConvertOreToLump: Recebida requisição - oreID=%d, quantity=%d", oreID, quantity)
	
	err := a.stockService.ConvertOreToLump(oreID, quantity)
	if err != nil {
		log.Printf("[App] ConvertOreToLump: Erro ao converter: %v", err)
		return err
	}
	
	log.Printf("[App] ConvertOreToLump: Conversão concluída com sucesso")
	return nil
}

// ConvertLogToPlank converte Log em Plank (proporção 1:6)
func (a *App) ConvertLogToPlank(logID int64, quantity int) error {
	log.Printf("[App] ConvertLogToPlank: Recebida requisição - logID=%d, quantity=%d", logID, quantity)
	
	err := a.stockService.ConvertLogToPlank(logID, quantity)
	if err != nil {
		log.Printf("[App] ConvertLogToPlank: Erro ao converter: %v", err)
		return err
	}
	
	log.Printf("[App] ConvertLogToPlank: Conversão concluída com sucesso")
	return nil
}

// ConvertLogToShaft converte Log em Shaft (proporção 1:12)
func (a *App) ConvertLogToShaft(logID int64, quantity int) error {
	log.Printf("[App] ConvertLogToShaft: Recebida requisição - logID=%d, quantity=%d", logID, quantity)
	
	err := a.stockService.ConvertLogToShaft(logID, quantity)
	if err != nil {
		log.Printf("[App] ConvertLogToShaft: Erro ao converter: %v", err)
		return err
	}
	
	log.Printf("[App] ConvertLogToShaft: Conversão concluída com sucesso")
	return nil
}

// ConvertShaftToPeg converte Shaft em Peg (proporção 1:10)
func (a *App) ConvertShaftToPeg(shaftID int64, quantity int) error {
	log.Printf("[App] ConvertShaftToPeg: Recebida requisição - shaftID=%d, quantity=%d", shaftID, quantity)
	
	err := a.stockService.ConvertShaftToPeg(shaftID, quantity)
	if err != nil {
		log.Printf("[App] ConvertShaftToPeg: Erro ao converter: %v", err)
		return err
	}
	
	log.Printf("[App] ConvertShaftToPeg: Conversão concluída com sucesso")
	return nil
}
