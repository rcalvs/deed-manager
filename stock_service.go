package main

import (
	"database/sql"
	"log"
	"time"

	_ "modernc.org/sqlite"
)

// StockService gerencia operações de estoque
type StockService struct {
	db *sql.DB
}

// NewStockService cria uma nova instância do serviço de estoque
func NewStockService() *StockService {
	return &StockService{}
}

// Initialize inicializa o banco de dados
func (s *StockService) Initialize() error {
	db, err := sql.Open("sqlite", "wurm_stock.db")
	if err != nil {
		return err
	}
	s.db = db

	// Criar tabelas
	if err := s.createTables(); err != nil {
		return err
	}

	return nil
}

// createTables cria as tabelas necessárias
func (s *StockService) createTables() error {
	// Tabela de itens de estoque
	createStockTable := `
	CREATE TABLE IF NOT EXISTS stock_items (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		type TEXT NOT NULL,
		quality REAL NOT NULL,
		quantity INTEGER NOT NULL DEFAULT 0,
		created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
		updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
		UNIQUE(type, quality)
	);`

	// Tabela de histórico de estoque
	createHistoryTable := `
	CREATE TABLE IF NOT EXISTS stock_history (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		item_id INTEGER,
		type TEXT NOT NULL,
		quality REAL NOT NULL,
		quantity INTEGER NOT NULL,
		change INTEGER NOT NULL,
		timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (item_id) REFERENCES stock_items(id)
	);`

	// Criar índices para melhor performance
	createIndexes := `
	CREATE INDEX IF NOT EXISTS idx_stock_type_quality ON stock_items(type, quality);
	CREATE INDEX IF NOT EXISTS idx_history_timestamp ON stock_history(timestamp);
	CREATE INDEX IF NOT EXISTS idx_history_type ON stock_history(type);
	`

	if _, err := s.db.Exec(createStockTable); err != nil {
		return err
	}

	if _, err := s.db.Exec(createHistoryTable); err != nil {
		return err
	}

	if _, err := s.db.Exec(createIndexes); err != nil {
		return err
	}

	return nil
}

// Close fecha a conexão com o banco de dados
func (s *StockService) Close() error {
	if s.db != nil {
		return s.db.Close()
	}
	return nil
}

// AddItem adiciona ou atualiza um item no estoque
// Se customTime for nil, usa o tempo atual
func (s *StockService) AddItem(itemType ItemType, quality float64, quantity int, customTime *time.Time) (*StockItem, error) {
	var now time.Time
	if customTime != nil {
		now = *customTime
	} else {
		now = time.Now()
	}

	// Verificar se o item já existe
	var existingID int64
	var existingQuantity int
	err := s.db.QueryRow(
		"SELECT id, quantity FROM stock_items WHERE type = ? AND quality = ?",
		itemType, quality,
	).Scan(&existingID, &existingQuantity)

	if err == sql.ErrNoRows {
		// Item não existe, criar novo
		result, err := s.db.Exec(
			"INSERT INTO stock_items (type, quality, quantity, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
			itemType, quality, quantity, now, now,
		)
		if err != nil {
			return nil, err
		}

		id, err := result.LastInsertId()
		if err != nil {
			return nil, err
		}

		// Registrar no histórico
		change := quantity
		s.recordHistoryWithTime(id, itemType, quality, quantity, change, now)

		return &StockItem{
			ID:        id,
			Type:      itemType,
			Category:  GetCategory(itemType),
			Quality:   quality,
			Quantity:  quantity,
			CreatedAt: now,
			UpdatedAt: now,
		}, nil
	} else if err != nil {
		return nil, err
	}

	// Item existe, atualizar quantidade
	newQuantity := existingQuantity + quantity
	change := quantity

	_, err = s.db.Exec(
		"UPDATE stock_items SET quantity = ?, updated_at = ? WHERE id = ?",
		newQuantity, now, existingID,
	)
	if err != nil {
		return nil, err
	}

	// Registrar no histórico
	s.recordHistoryWithTime(existingID, itemType, quality, newQuantity, change, now)

	item := &StockItem{
		ID:        existingID,
		Type:      itemType,
		Category:  GetCategory(itemType),
		Quality:   quality,
		Quantity:  newQuantity,
		UpdatedAt: now,
	}

	return item, nil
}

// RemoveItem remove quantidade de um item do estoque
func (s *StockService) RemoveItem(itemType ItemType, quality float64, quantity int) error {
	// Verificar se o item existe e tem quantidade suficiente
	var existingID int64
	var existingQuantity int
	err := s.db.QueryRow(
		"SELECT id, quantity FROM stock_items WHERE type = ? AND quality = ?",
		itemType, quality,
	).Scan(&existingID, &existingQuantity)

	if err == sql.ErrNoRows {
		return ErrItemNotFound
	} else if err != nil {
		return err
	}

	if existingQuantity < quantity {
		return ErrInsufficientQuantity
	}

	newQuantity := existingQuantity - quantity
	change := -quantity
	now := time.Now()

	_, err = s.db.Exec(
		"UPDATE stock_items SET quantity = ?, updated_at = ? WHERE id = ?",
		newQuantity, now, existingID,
	)
	if err != nil {
		return err
	}

	// Registrar no histórico
	s.recordHistory(existingID, itemType, quality, newQuantity, change)

	return nil
}

// GetAllItems retorna todos os itens do estoque
func (s *StockService) GetAllItems() ([]*StockItem, error) {
	rows, err := s.db.Query(
		"SELECT id, type, quality, quantity, created_at, updated_at FROM stock_items ORDER BY type, quality DESC",
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []*StockItem
	for rows.Next() {
		var item StockItem
		err := rows.Scan(
			&item.ID,
			&item.Type,
			&item.Quality,
			&item.Quantity,
			&item.CreatedAt,
			&item.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		// Calcular categoria baseada no tipo
		item.Category = GetCategory(item.Type)
		items = append(items, &item)
	}

	return items, nil
}

// GetStockSummary retorna um resumo do estoque agrupado por tipo e qualidade
func (s *StockService) GetStockSummary() ([]*StockSummary, error) {
	rows, err := s.db.Query(
		"SELECT type, quality, SUM(quantity) as total FROM stock_items GROUP BY type, quality ORDER BY type, quality DESC",
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var summaries []*StockSummary
	for rows.Next() {
		var summary StockSummary
		err := rows.Scan(&summary.Type, &summary.Quality, &summary.Quantity)
		if err != nil {
			return nil, err
		}
		summaries = append(summaries, &summary)
	}

	return summaries, nil
}

// GetStockHistory retorna o histórico de estoque para gráficos
func (s *StockService) GetStockHistory(days int) ([]*StockHistoryPoint, error) {
	log.Printf("[StockService] GetStockHistory: Buscando histórico dos últimos %d dias", days)
	
	// Usar strftime para calcular a data limite
	// SQLite não suporta concatenação direta com placeholders, então vamos usar uma abordagem diferente
	var query string
	var rows *sql.Rows
	var err error
	
	if days > 0 {
		// Calcular a data limite
		cutoffDate := time.Now().AddDate(0, 0, -days)
		cutoffDateStr := cutoffDate.Format("2006-01-02 15:04:05")
		
		log.Printf("[StockService] GetStockHistory: Data limite: %s", cutoffDateStr)
		
		query = `
			SELECT 
				COALESCE(DATE(timestamp), '') as date,
				type,
				quality,
				quantity
			FROM stock_history
			WHERE timestamp IS NOT NULL AND timestamp >= ?
			ORDER BY timestamp ASC, type, quality
		`
		rows, err = s.db.Query(query, cutoffDateStr)
	} else {
		// Se days <= 0, retornar tudo
		query = `
			SELECT 
				COALESCE(DATE(timestamp), '') as date,
				type,
				quality,
				quantity
			FROM stock_history
			WHERE timestamp IS NOT NULL
			ORDER BY timestamp ASC, type, quality
		`
		rows, err = s.db.Query(query)
	}
	
	if err != nil {
		log.Printf("[StockService] GetStockHistory: Erro na query: %v", err)
		return nil, err
	}
	defer rows.Close()

	var points []*StockHistoryPoint
	count := 0
	for rows.Next() {
		var point StockHistoryPoint
		var dateStr sql.NullString
		err := rows.Scan(&dateStr, &point.Type, &point.Quality, &point.Quantity)
		if err != nil {
			log.Printf("[StockService] GetStockHistory: Erro ao escanear linha: %v", err)
			return nil, err
		}
		
		// Tratar valores NULL ou strings vazias
		if dateStr.Valid && dateStr.String != "" {
			point.Date = dateStr.String
		} else {
			log.Printf("[StockService] GetStockHistory: Data inválida ou vazia encontrada, pulando registro")
			continue
		}
		
		points = append(points, &point)
		count++
	}
	
	log.Printf("[StockService] GetStockHistory: Retornando %d pontos de histórico", count)
	return points, nil
}

// recordHistory registra uma entrada no histórico com o tempo atual
func (s *StockService) recordHistory(itemID int64, itemType ItemType, quality float64, quantity int, change int) {
	s.recordHistoryWithTime(itemID, itemType, quality, quantity, change, time.Now())
}

// recordHistoryWithTime registra uma entrada no histórico com timestamp customizado
func (s *StockService) recordHistoryWithTime(itemID int64, itemType ItemType, quality float64, quantity int, change int, timestamp time.Time) {
	// Formatar timestamp para o formato ISO 8601 que o SQLite aceita
	// SQLite aceita: "YYYY-MM-DD HH:MM:SS" ou "YYYY-MM-DDTHH:MM:SS"
	timestampStr := timestamp.Format("2006-01-02 15:04:05")
	
	log.Printf("[StockService] recordHistoryWithTime: Registrando histórico - itemID=%d, type=%s, quality=%.1f, quantity=%d, change=%d, timestamp=%s",
		itemID, itemType, quality, quantity, change, timestampStr)
	
	result, err := s.db.Exec(
		"INSERT INTO stock_history (item_id, type, quality, quantity, change, timestamp) VALUES (?, ?, ?, ?, ?, ?)",
		itemID, itemType, quality, quantity, change, timestampStr,
	)
	
	if err != nil {
		log.Printf("[StockService] recordHistoryWithTime: ERRO ao inserir histórico: %v", err)
		return
	}
	
	rowsAffected, _ := result.RowsAffected()
	log.Printf("[StockService] recordHistoryWithTime: Histórico inserido com sucesso (%d linha(s) afetada(s))", rowsAffected)
}

// ConvertOreToLump converte uma quantidade de Ore em Lump (proporção 1:1)
func (s *StockService) ConvertOreToLump(oreID int64, quantity int) error {
	log.Printf("[StockService] ConvertOreToLump: Iniciando conversão - oreID=%d, quantity=%d", oreID, quantity)

	// Buscar o item Ore
	var oreType ItemType
	var oreQuality float64
	var oreQuantity int
	err := s.db.QueryRow(
		"SELECT type, quality, quantity FROM stock_items WHERE id = ?",
		oreID,
	).Scan(&oreType, &oreQuality, &oreQuantity)

	if err == sql.ErrNoRows {
		log.Printf("[StockService] ConvertOreToLump: Ore ID=%d não encontrado", oreID)
		return ErrItemNotFound
	} else if err != nil {
		log.Printf("[StockService] ConvertOreToLump: Erro ao buscar Ore: %v", err)
		return err
	}

	// Verificar se é realmente um Ore
	lumpType, ok := GetLumpFromOre(oreType)
	if !ok {
		log.Printf("[StockService] ConvertOreToLump: Item ID=%d não é um Ore (type=%s)", oreID, oreType)
		return ErrInsufficientQuantity // Usando erro existente, mas poderia criar um específico
	}

	// Verificar se há quantidade suficiente
	if oreQuantity < quantity {
		log.Printf("[StockService] ConvertOreToLump: Quantidade insuficiente - disponível: %d, solicitada: %d", oreQuantity, quantity)
		return ErrInsufficientQuantity
	}

	now := time.Now()

	// Iniciar transação para garantir atomicidade
	tx, err := s.db.Begin()
	if err != nil {
		log.Printf("[StockService] ConvertOreToLump: Erro ao iniciar transação: %v", err)
		return err
	}
	defer tx.Rollback()

	// 1. Reduzir quantidade do Ore
	newOreQuantity := oreQuantity - quantity
	_, err = tx.Exec(
		"UPDATE stock_items SET quantity = ?, updated_at = ? WHERE id = ?",
		newOreQuantity, now, oreID,
	)
	if err != nil {
		log.Printf("[StockService] ConvertOreToLump: Erro ao atualizar Ore: %v", err)
		return err
	}

	// Registrar remoção do Ore no histórico
	s.recordHistoryWithTimeInTx(tx, oreID, oreType, oreQuality, newOreQuantity, -quantity, now)

	// 2. Adicionar quantidade ao Lump (usar AddItem logic dentro da transação)
	// Verificar se o Lump já existe
	var lumpID int64
	var existingLumpQuantity int
	err = tx.QueryRow(
		"SELECT id, quantity FROM stock_items WHERE type = ? AND quality = ?",
		lumpType, oreQuality,
	).Scan(&lumpID, &existingLumpQuantity)

	if err == sql.ErrNoRows {
		// Lump não existe, criar novo
		result, err := tx.Exec(
			"INSERT INTO stock_items (type, quality, quantity, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
			lumpType, oreQuality, quantity, now, now,
		)
		if err != nil {
			log.Printf("[StockService] ConvertOreToLump: Erro ao criar Lump: %v", err)
			return err
		}

		lumpID, err = result.LastInsertId()
		if err != nil {
			log.Printf("[StockService] ConvertOreToLump: Erro ao obter ID do Lump: %v", err)
			return err
		}

		// Registrar no histórico
		s.recordHistoryWithTimeInTx(tx, lumpID, lumpType, oreQuality, quantity, quantity, now)
	} else if err != nil {
		log.Printf("[StockService] ConvertOreToLump: Erro ao verificar Lump: %v", err)
		return err
	} else {
		// Lump existe, atualizar quantidade
		newLumpQuantity := existingLumpQuantity + quantity
		_, err = tx.Exec(
			"UPDATE stock_items SET quantity = ?, updated_at = ? WHERE id = ?",
			newLumpQuantity, now, lumpID,
		)
		if err != nil {
			log.Printf("[StockService] ConvertOreToLump: Erro ao atualizar Lump: %v", err)
			return err
		}

		// Registrar no histórico
		s.recordHistoryWithTimeInTx(tx, lumpID, lumpType, oreQuality, newLumpQuantity, quantity, now)
	}

	// Comitar transação
	if err = tx.Commit(); err != nil {
		log.Printf("[StockService] ConvertOreToLump: Erro ao commitar transação: %v", err)
		return err
	}

	log.Printf("[StockService] ConvertOreToLump: Conversão concluída com sucesso - %d %s -> %d %s", 
		quantity, oreType, quantity, lumpType)
	return nil
}

// recordHistoryWithTimeInTx registra histórico dentro de uma transação
func (s *StockService) recordHistoryWithTimeInTx(tx *sql.Tx, itemID int64, itemType ItemType, quality float64, quantity int, change int, timestamp time.Time) {
	timestampStr := timestamp.Format("2006-01-02 15:04:05")
	
	_, err := tx.Exec(
		"INSERT INTO stock_history (item_id, type, quality, quantity, change, timestamp) VALUES (?, ?, ?, ?, ?, ?)",
		itemID, itemType, quality, quantity, change, timestampStr,
	)
	
	if err != nil {
		log.Printf("[StockService] recordHistoryWithTimeInTx: ERRO ao inserir histórico: %v", err)
	}
}

// ConvertLogToPlank converte Log em Plank (proporção 1:6)
func (s *StockService) ConvertLogToPlank(logID int64, quantity int) error {
	log.Printf("[StockService] ConvertLogToPlank: Iniciando conversão - logID=%d, quantity=%d", logID, quantity)

	// Buscar o item Log
	var logType ItemType
	var logQuality float64
	var logQuantity int
	err := s.db.QueryRow(
		"SELECT type, quality, quantity FROM stock_items WHERE id = ?",
		logID,
	).Scan(&logType, &logQuality, &logQuantity)

	if err == sql.ErrNoRows {
		log.Printf("[StockService] ConvertLogToPlank: Log ID=%d não encontrado", logID)
		return ErrItemNotFound
	} else if err != nil {
		log.Printf("[StockService] ConvertLogToPlank: Erro ao buscar Log: %v", err)
		return err
	}

	// Verificar se é realmente um Log
	plankType, ok := GetPlankFromLog(logType)
	if !ok {
		log.Printf("[StockService] ConvertLogToPlank: Item ID=%d não é um Log (type=%s)", logID, logType)
		return ErrInsufficientQuantity
	}

	// Verificar se há quantidade suficiente
	if logQuantity < quantity {
		log.Printf("[StockService] ConvertLogToPlank: Quantidade insuficiente - disponível: %d, solicitada: %d", logQuantity, quantity)
		return ErrInsufficientQuantity
	}

	now := time.Now()
	plankQuantity := quantity * 6 // 1 Log = 6 Planks

	// Iniciar transação
	tx, err := s.db.Begin()
	if err != nil {
		log.Printf("[StockService] ConvertLogToPlank: Erro ao iniciar transação: %v", err)
		return err
	}
	defer tx.Rollback()

	// 1. Reduzir quantidade do Log
	newLogQuantity := logQuantity - quantity
	_, err = tx.Exec(
		"UPDATE stock_items SET quantity = ?, updated_at = ? WHERE id = ?",
		newLogQuantity, now, logID,
	)
	if err != nil {
		log.Printf("[StockService] ConvertLogToPlank: Erro ao atualizar Log: %v", err)
		return err
	}

	s.recordHistoryWithTimeInTx(tx, logID, logType, logQuality, newLogQuantity, -quantity, now)

	// 2. Adicionar Planks
	var plankID int64
	var existingPlankQuantity int
	err = tx.QueryRow(
		"SELECT id, quantity FROM stock_items WHERE type = ? AND quality = ?",
		plankType, logQuality,
	).Scan(&plankID, &existingPlankQuantity)

	if err == sql.ErrNoRows {
		result, err := tx.Exec(
			"INSERT INTO stock_items (type, quality, quantity, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
			plankType, logQuality, plankQuantity, now, now,
		)
		if err != nil {
			log.Printf("[StockService] ConvertLogToPlank: Erro ao criar Plank: %v", err)
			return err
		}

		plankID, err = result.LastInsertId()
		if err != nil {
			log.Printf("[StockService] ConvertLogToPlank: Erro ao obter ID do Plank: %v", err)
			return err
		}

		s.recordHistoryWithTimeInTx(tx, plankID, plankType, logQuality, plankQuantity, plankQuantity, now)
	} else if err != nil {
		log.Printf("[StockService] ConvertLogToPlank: Erro ao verificar Plank: %v", err)
		return err
	} else {
		newPlankQuantity := existingPlankQuantity + plankQuantity
		_, err = tx.Exec(
			"UPDATE stock_items SET quantity = ?, updated_at = ? WHERE id = ?",
			newPlankQuantity, now, plankID,
		)
		if err != nil {
			log.Printf("[StockService] ConvertLogToPlank: Erro ao atualizar Plank: %v", err)
			return err
		}

		s.recordHistoryWithTimeInTx(tx, plankID, plankType, logQuality, newPlankQuantity, plankQuantity, now)
	}

	if err = tx.Commit(); err != nil {
		log.Printf("[StockService] ConvertLogToPlank: Erro ao commitar transação: %v", err)
		return err
	}

	log.Printf("[StockService] ConvertLogToPlank: Conversão concluída - %d %s -> %d %s", 
		quantity, logType, plankQuantity, plankType)
	return nil
}

// ConvertLogToShaft converte Log em Shaft (proporção 1:12)
func (s *StockService) ConvertLogToShaft(logID int64, quantity int) error {
	log.Printf("[StockService] ConvertLogToShaft: Iniciando conversão - logID=%d, quantity=%d", logID, quantity)

	var logType ItemType
	var logQuality float64
	var logQuantity int
	err := s.db.QueryRow(
		"SELECT type, quality, quantity FROM stock_items WHERE id = ?",
		logID,
	).Scan(&logType, &logQuality, &logQuantity)

	if err == sql.ErrNoRows {
		return ErrItemNotFound
	} else if err != nil {
		return err
	}

	shaftType, ok := GetShaftFromLog(logType)
	if !ok {
		return ErrInsufficientQuantity
	}

	if logQuantity < quantity {
		return ErrInsufficientQuantity
	}

	now := time.Now()
	shaftQuantity := quantity * 12 // 1 Log = 12 Shafts

	tx, err := s.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	newLogQuantity := logQuantity - quantity
	_, err = tx.Exec(
		"UPDATE stock_items SET quantity = ?, updated_at = ? WHERE id = ?",
		newLogQuantity, now, logID,
	)
	if err != nil {
		return err
	}

	s.recordHistoryWithTimeInTx(tx, logID, logType, logQuality, newLogQuantity, -quantity, now)

	var shaftID int64
	var existingShaftQuantity int
	err = tx.QueryRow(
		"SELECT id, quantity FROM stock_items WHERE type = ? AND quality = ?",
		shaftType, logQuality,
	).Scan(&shaftID, &existingShaftQuantity)

	if err == sql.ErrNoRows {
		result, err := tx.Exec(
			"INSERT INTO stock_items (type, quality, quantity, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
			shaftType, logQuality, shaftQuantity, now, now,
		)
		if err != nil {
			return err
		}

		shaftID, err = result.LastInsertId()
		if err != nil {
			return err
		}

		s.recordHistoryWithTimeInTx(tx, shaftID, shaftType, logQuality, shaftQuantity, shaftQuantity, now)
	} else if err != nil {
		return err
	} else {
		newShaftQuantity := existingShaftQuantity + shaftQuantity
		_, err = tx.Exec(
			"UPDATE stock_items SET quantity = ?, updated_at = ? WHERE id = ?",
			newShaftQuantity, now, shaftID,
		)
		if err != nil {
			return err
		}

		s.recordHistoryWithTimeInTx(tx, shaftID, shaftType, logQuality, newShaftQuantity, shaftQuantity, now)
	}

	if err = tx.Commit(); err != nil {
		return err
	}

	log.Printf("[StockService] ConvertLogToShaft: Conversão concluída - %d %s -> %d %s", 
		quantity, logType, shaftQuantity, shaftType)
	return nil
}

// ConvertShaftToPeg converte Shaft em Peg (proporção 1:10)
func (s *StockService) ConvertShaftToPeg(shaftID int64, quantity int) error {
	log.Printf("[StockService] ConvertShaftToPeg: Iniciando conversão - shaftID=%d, quantity=%d", shaftID, quantity)

	var shaftType ItemType
	var shaftQuality float64
	var shaftQuantity int
	err := s.db.QueryRow(
		"SELECT type, quality, quantity FROM stock_items WHERE id = ?",
		shaftID,
	).Scan(&shaftType, &shaftQuality, &shaftQuantity)

	if err == sql.ErrNoRows {
		return ErrItemNotFound
	} else if err != nil {
		return err
	}

	pegType, ok := GetPegFromShaft(shaftType)
	if !ok {
		return ErrInsufficientQuantity
	}

	if shaftQuantity < quantity {
		return ErrInsufficientQuantity
	}

	now := time.Now()
	pegQuantity := quantity * 10 // 1 Shaft = 10 Pegs

	tx, err := s.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	newShaftQuantity := shaftQuantity - quantity
	_, err = tx.Exec(
		"UPDATE stock_items SET quantity = ?, updated_at = ? WHERE id = ?",
		newShaftQuantity, now, shaftID,
	)
	if err != nil {
		return err
	}

	s.recordHistoryWithTimeInTx(tx, shaftID, shaftType, shaftQuality, newShaftQuantity, -quantity, now)

	var pegID int64
	var existingPegQuantity int
	err = tx.QueryRow(
		"SELECT id, quantity FROM stock_items WHERE type = ? AND quality = ?",
		pegType, shaftQuality,
	).Scan(&pegID, &existingPegQuantity)

	if err == sql.ErrNoRows {
		result, err := tx.Exec(
			"INSERT INTO stock_items (type, quality, quantity, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
			pegType, shaftQuality, pegQuantity, now, now,
		)
		if err != nil {
			return err
		}

		pegID, err = result.LastInsertId()
		if err != nil {
			return err
		}

		s.recordHistoryWithTimeInTx(tx, pegID, pegType, shaftQuality, pegQuantity, pegQuantity, now)
	} else if err != nil {
		return err
	} else {
		newPegQuantity := existingPegQuantity + pegQuantity
		_, err = tx.Exec(
			"UPDATE stock_items SET quantity = ?, updated_at = ? WHERE id = ?",
			newPegQuantity, now, pegID,
		)
		if err != nil {
			return err
		}

		s.recordHistoryWithTimeInTx(tx, pegID, pegType, shaftQuality, newPegQuantity, pegQuantity, now)
	}

	if err = tx.Commit(); err != nil {
		return err
	}

	log.Printf("[StockService] ConvertShaftToPeg: Conversão concluída - %d %s -> %d %s", 
		quantity, shaftType, pegQuantity, pegType)
	return nil
}

// DeleteItem remove completamente um item do estoque
func (s *StockService) DeleteItem(id int64) error {
	log.Printf("[StockService] DeleteItem: Iniciando deleção do item ID=%d", id)

	// Verificar se o item existe antes de deletar
	var exists bool
	err := s.db.QueryRow("SELECT EXISTS(SELECT 1 FROM stock_items WHERE id = ?)", id).Scan(&exists)
	if err != nil {
		log.Printf("[StockService] DeleteItem: Erro ao verificar existência do item ID=%d: %v", id, err)
		return err
	}

	if !exists {
		log.Printf("[StockService] DeleteItem: Item ID=%d não encontrado", id)
		return ErrItemNotFound
	}

	log.Printf("[StockService] DeleteItem: Item ID=%d encontrado, deletando histórico relacionado...", id)

	// Deletar histórico relacionado primeiro (devido à foreign key)
	historyResult, err := s.db.Exec("DELETE FROM stock_history WHERE item_id = ?", id)
	if err != nil {
		log.Printf("[StockService] DeleteItem: Erro ao deletar histórico do item ID=%d: %v", id, err)
		return err
	}
	historyRows, _ := historyResult.RowsAffected()
	log.Printf("[StockService] DeleteItem: %d entradas de histórico deletadas para o item ID=%d", historyRows, id)

	// Deletar o item
	log.Printf("[StockService] DeleteItem: Deletando item ID=%d...", id)
	result, err := s.db.Exec("DELETE FROM stock_items WHERE id = ?", id)
	if err != nil {
		log.Printf("[StockService] DeleteItem: Erro ao deletar item ID=%d: %v", id, err)
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		log.Printf("[StockService] DeleteItem: Erro ao obter linhas afetadas para item ID=%d: %v", id, err)
		return err
	}

	if rowsAffected == 0 {
		log.Printf("[StockService] DeleteItem: Nenhuma linha afetada ao deletar item ID=%d", id)
		return ErrItemNotFound
	}

	log.Printf("[StockService] DeleteItem: Item ID=%d deletado com sucesso (%d linha(s) afetada(s))", id, rowsAffected)
	return nil
}

// ClearDatabase limpa todo o banco de dados (remove todos os itens e histórico)
func (s *StockService) ClearDatabase() error {
	// Deletar histórico primeiro (devido à foreign key)
	_, err := s.db.Exec("DELETE FROM stock_history")
	if err != nil {
		return err
	}

	// Deletar todos os itens
	_, err = s.db.Exec("DELETE FROM stock_items")
	if err != nil {
		return err
	}

	return nil
}
