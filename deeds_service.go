package main

import (
	"database/sql"
	"time"

	_ "modernc.org/sqlite"
)

// DeedsService gerencia deeds (settlements)
type DeedsService struct {
	db *sql.DB
}

// NewDeedsService cria uma nova instância do serviço de deeds
func NewDeedsService() *DeedsService {
	return &DeedsService{}
}

// Initialize inicializa o banco de dados
func (s *DeedsService) Initialize() error {
	db, err := sql.Open("sqlite", "wurm_stock.db")
	if err != nil {
		return err
	}
	s.db = db
	return s.initDatabase()
}

// initDatabase cria a tabela de deeds
func (s *DeedsService) initDatabase() error {
	_, err := s.db.Exec(`
		CREATE TABLE IF NOT EXISTS deeds (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			mayor TEXT,
			location TEXT,
			size_width INTEGER DEFAULT 0,
			size_height INTEGER DEFAULT 0,
			coffers_iron INTEGER DEFAULT 0,
			upkeep_chips_iron INTEGER DEFAULT 0,
			monthly_cost_iron INTEGER DEFAULT 0,
			upkeep_days INTEGER DEFAULT 0,
			upkeep_hours INTEGER DEFAULT 0,
			upkeep_minutes INTEGER DEFAULT 0,
			raw_text TEXT,
			created_at TEXT NOT NULL,
			updated_at TEXT NOT NULL,
			last_upkeep_debit_at TEXT
		)
	`)
	if err != nil {
		return err
	}
	// Migração: adicionar coluna para tabelas existentes
	_, _ = s.db.Exec("ALTER TABLE deeds ADD COLUMN last_upkeep_debit_at TEXT")
	return nil
}

// Close fecha a conexão com o banco de dados
func (s *DeedsService) Close() error {
	return s.db.Close()
}

// CreateDeed cria um novo deed
func (s *DeedsService) CreateDeed(name, mayor, location string, sizeWidth, sizeHeight int,
	coffersIron, upkeepChipsIron, monthlyCostIron int64, upkeepDays, upkeepHours, upkeepMinutes int,
	rawText string) (*Deed, error) {
	now := time.Now()
	nowStr := now.Format("2006-01-02 15:04:05")

	result, err := s.db.Exec(
		`INSERT INTO deeds (name, mayor, location, size_width, size_height,
			coffers_iron, upkeep_chips_iron, monthly_cost_iron,
			upkeep_days, upkeep_hours, upkeep_minutes, raw_text, created_at, updated_at, last_upkeep_debit_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		name, mayor, location, sizeWidth, sizeHeight,
		coffersIron, upkeepChipsIron, monthlyCostIron,
		upkeepDays, upkeepHours, upkeepMinutes, rawText, nowStr, nowStr, nowStr,
	)
	if err != nil {
		return nil, err
	}
	id, err := result.LastInsertId()
	if err != nil {
		return nil, err
	}
	return s.GetDeed(id)
}

// GetDeed retorna um deed por ID
func (s *DeedsService) GetDeed(id int64) (*Deed, error) {
	var d Deed
	var rawText sql.NullString
	var mayor, location sql.NullString
	var createdAtStr, updatedAtStr string
	var lastDebitStr sql.NullString

	err := s.db.QueryRow(`
		SELECT id, name, mayor, location, size_width, size_height,
			coffers_iron, upkeep_chips_iron, monthly_cost_iron,
			upkeep_days, upkeep_hours, upkeep_minutes, raw_text, created_at, updated_at, last_upkeep_debit_at
		FROM deeds WHERE id = ?
	`, id).Scan(
		&d.ID, &d.Name, &mayor, &location, &d.SizeWidth, &d.SizeHeight,
		&d.CoffersIron, &d.UpkeepChipsIron, &d.MonthlyCostIron,
		&d.UpkeepDays, &d.UpkeepHours, &d.UpkeepMinutes, &rawText, &createdAtStr, &updatedAtStr, &lastDebitStr,
	)
	if err != nil {
		return nil, err
	}
	if mayor.Valid {
		d.Mayor = mayor.String
	}
	if location.Valid {
		d.Location = location.String
	}
	if rawText.Valid {
		d.RawText = rawText.String
	}
	d.CreatedAt, _ = time.Parse("2006-01-02 15:04:05", createdAtStr)
	d.UpdatedAt, _ = time.Parse("2006-01-02 15:04:05", updatedAtStr)
	if lastDebitStr.Valid && lastDebitStr.String != "" {
		d.LastUpkeepDebitAt, _ = time.Parse("2006-01-02 15:04:05", lastDebitStr.String)
	} else {
		d.LastUpkeepDebitAt = d.CreatedAt
	}
	return &d, nil
}

// GetAllDeeds retorna todos os deeds. Aplica débitos de upkeep antes de retornar.
func (s *DeedsService) GetAllDeeds() ([]*Deed, error) {
	deeds, err := s.getAllDeedsRaw()
	if err != nil {
		return nil, err
	}
	// Aplicar débitos de custo mensal (chips primeiro, depois cofre)
	s.applyUpkeepDebits(deeds)
	return deeds, nil
}

func (s *DeedsService) getAllDeedsRaw() ([]*Deed, error) {
	rows, err := s.db.Query(`
		SELECT id, name, mayor, location, size_width, size_height,
			coffers_iron, upkeep_chips_iron, monthly_cost_iron,
			upkeep_days, upkeep_hours, upkeep_minutes, raw_text, created_at, updated_at, last_upkeep_debit_at
		FROM deeds ORDER BY name ASC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var deeds []*Deed
	for rows.Next() {
		var d Deed
		var rawText sql.NullString
		var mayor, location sql.NullString
		var createdAtStr, updatedAtStr string
		var lastDebitStr sql.NullString
		err := rows.Scan(
			&d.ID, &d.Name, &mayor, &location, &d.SizeWidth, &d.SizeHeight,
			&d.CoffersIron, &d.UpkeepChipsIron, &d.MonthlyCostIron,
			&d.UpkeepDays, &d.UpkeepHours, &d.UpkeepMinutes, &rawText, &createdAtStr, &updatedAtStr, &lastDebitStr,
		)
		if err != nil {
			return nil, err
		}
		if mayor.Valid {
			d.Mayor = mayor.String
		}
		if location.Valid {
			d.Location = location.String
		}
		if rawText.Valid {
			d.RawText = rawText.String
		}
		d.CreatedAt, _ = time.Parse("2006-01-02 15:04:05", createdAtStr)
		d.UpdatedAt, _ = time.Parse("2006-01-02 15:04:05", updatedAtStr)
		if lastDebitStr.Valid && lastDebitStr.String != "" {
			d.LastUpkeepDebitAt, _ = time.Parse("2006-01-02 15:04:05", lastDebitStr.String)
		} else {
			d.LastUpkeepDebitAt = d.CreatedAt
		}
		deeds = append(deeds, &d)
	}
	return deeds, rows.Err()
}

// computeUpkeepDuration calcula dias/horas/minutos de upkeep a partir do total de iron (cofre+chips).
// Fórmula Wurm: 1 mês = 30 dias; totalMinutes = totalIron * (30*24*60) / MonthlyCostIron.
func computeUpkeepDuration(totalIron, monthlyCostIron int64) (days, hours, minutes int) {
	if monthlyCostIron <= 0 {
		return 0, 0, 0
	}
	const minutesPerMonth = 30 * 24 * 60 // 43200
	totalMinutes := totalIron * minutesPerMonth / monthlyCostIron
	days = int(totalMinutes / (24 * 60))
	hours = int((totalMinutes % (24 * 60)) / 60)
	minutes = int(totalMinutes % 60)
	return days, hours, minutes
}

// applyUpkeepDebits debita custo mensal: primeiro dos chips, depois do cofre.
// Um mês = 30 dias. Recalcula upkeep_days após débito. Atualiza o banco quando há débitos.
func (s *DeedsService) applyUpkeepDebits(deeds []*Deed) {
	now := time.Now()
	nowStr := now.Format("2006-01-02 15:04:05")
	const daysPerMonth = 30

	for _, d := range deeds {
		if d.MonthlyCostIron <= 0 {
			continue
		}
		ref := d.LastUpkeepDebitAt
		elapsedDays := now.Sub(ref).Hours() / 24
		monthsElapsed := int64(elapsedDays / daysPerMonth)
		if monthsElapsed <= 0 {
			continue
		}
		totalToDebit := monthsElapsed * d.MonthlyCostIron

		// Primeiro debita dos chips, depois do cofre
		chips := d.UpkeepChipsIron
		coffers := d.CoffersIron
		fromChips := totalToDebit
		if fromChips > chips {
			fromChips = chips
		}
		chips -= fromChips
		remaining := totalToDebit - fromChips
		fromCoffers := remaining
		if fromCoffers > coffers {
			fromCoffers = coffers
		}
		coffers -= fromCoffers

		d.UpkeepChipsIron = chips
		d.CoffersIron = coffers
		d.LastUpkeepDebitAt = now

		// Recalcular duração do upkeep após débito
		totalIron := coffers + chips
		d.UpkeepDays, d.UpkeepHours, d.UpkeepMinutes = computeUpkeepDuration(totalIron, d.MonthlyCostIron)

		_, err := s.db.Exec(`
			UPDATE deeds SET coffers_iron=?, upkeep_chips_iron=?, upkeep_days=?, upkeep_hours=?, upkeep_minutes=?,
				last_upkeep_debit_at=?, updated_at=?
			WHERE id=?
		`, coffers, chips, d.UpkeepDays, d.UpkeepHours, d.UpkeepMinutes, nowStr, nowStr, d.ID)
		if err != nil {
			continue // mantém valores em memória mesmo se falhar o update
		}
		d.UpdatedAt = now
	}
}

// UpdateDeed atualiza um deed
func (s *DeedsService) UpdateDeed(id int64, name, mayor, location string, sizeWidth, sizeHeight int,
	coffersIron, upkeepChipsIron, monthlyCostIron int64, upkeepDays, upkeepHours, upkeepMinutes int,
	rawText string) (*Deed, error) {
	now := time.Now()
	nowStr := now.Format("2006-01-02 15:04:05")

	_, err := s.db.Exec(`
		UPDATE deeds SET name=?, mayor=?, location=?, size_width=?, size_height=?,
			coffers_iron=?, upkeep_chips_iron=?, monthly_cost_iron=?,
			upkeep_days=?, upkeep_hours=?, upkeep_minutes=?, raw_text=?, updated_at=?, last_upkeep_debit_at=?
		WHERE id=?
	`, name, mayor, location, sizeWidth, sizeHeight,
		coffersIron, upkeepChipsIron, monthlyCostIron,
		upkeepDays, upkeepHours, upkeepMinutes, rawText, nowStr, nowStr, id)
	if err != nil {
		return nil, err
	}
	return s.GetDeed(id)
}

// DeleteDeed remove um deed
func (s *DeedsService) DeleteDeed(id int64) error {
	_, err := s.db.Exec("DELETE FROM deeds WHERE id = ?", id)
	return err
}

// AddDeedFunds adiciona fundos ao cofre ou chips e recalcula a duração do upkeep.
// addToCoffers: true = cofre, false = chips
func (s *DeedsService) AddDeedFunds(id int64, amountIron int64, addToCoffers bool) (*Deed, error) {
	d, err := s.GetDeed(id)
	if err != nil {
		return nil, err
	}
	if addToCoffers {
		d.CoffersIron += amountIron
		if d.CoffersIron < 0 {
			d.CoffersIron = 0
		}
	} else {
		d.UpkeepChipsIron += amountIron
		if d.UpkeepChipsIron < 0 {
			d.UpkeepChipsIron = 0
		}
	}
	// Recalcular duração do upkeep baseado no custo mensal (mesma fórmula que applyUpkeepDebits)
	if d.MonthlyCostIron > 0 {
		totalIron := d.CoffersIron + d.UpkeepChipsIron
		d.UpkeepDays, d.UpkeepHours, d.UpkeepMinutes = computeUpkeepDuration(totalIron, d.MonthlyCostIron)
	}
	now := time.Now()
	nowStr := now.Format("2006-01-02 15:04:05")
	_, err = s.db.Exec(`
		UPDATE deeds SET coffers_iron=?, upkeep_chips_iron=?, upkeep_days=?, upkeep_hours=?, upkeep_minutes=?, updated_at=?
		WHERE id=?
	`, d.CoffersIron, d.UpkeepChipsIron, d.UpkeepDays, d.UpkeepHours, d.UpkeepMinutes, nowStr, id)
	if err != nil {
		return nil, err
	}
	d.UpdatedAt = now
	return d, nil
}
