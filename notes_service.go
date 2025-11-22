package main

import (
	"database/sql"
	"time"

	_ "modernc.org/sqlite"
)

// NotesService gerencia notas e localizações
type NotesService struct {
	db *sql.DB
}

// NewNotesService cria uma nova instância do serviço de notas
func NewNotesService() *NotesService {
	return &NotesService{}
}

// Initialize inicializa o banco de dados
func (s *NotesService) Initialize() error {
	db, err := sql.Open("sqlite", "wurm_stock.db")
	if err != nil {
		return err
	}
	s.db = db

	// Criar tabelas
	if err := s.initDatabase(); err != nil {
		return err
	}

	return nil
}

// initDatabase inicializa as tabelas de notas e localizações
func (s *NotesService) initDatabase() error {
	// Tabela de notas
	_, err := s.db.Exec(`
		CREATE TABLE IF NOT EXISTS notes (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			title TEXT NOT NULL,
			description TEXT,
			start_date TEXT,
			end_date TEXT,
			completed INTEGER DEFAULT 0,
			created_at TEXT NOT NULL,
			updated_at TEXT NOT NULL
		)
	`)
	if err != nil {
		return err
	}

	// Tabela de localizações
	_, err = s.db.Exec(`
		CREATE TABLE IF NOT EXISTS locations (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			description TEXT,
			map_type TEXT DEFAULT 'yaga',
			server TEXT DEFAULT 'Harmony',
			x INTEGER NOT NULL,
			y INTEGER NOT NULL,
			created_at TEXT NOT NULL,
			updated_at TEXT NOT NULL
		)
	`)
	if err != nil {
		return err
	}

	// Migração: adicionar colunas map_type e server se não existirem (ignorar erro se já existirem)
	// SQLite não suporta IF NOT EXISTS em ALTER TABLE, então vamos tentar e ignorar o erro
	s.db.Exec("ALTER TABLE locations ADD COLUMN map_type TEXT DEFAULT 'yaga'")
	s.db.Exec("ALTER TABLE locations ADD COLUMN server TEXT DEFAULT 'Harmony'")

	return nil
}

// Close fecha a conexão com o banco de dados
func (s *NotesService) Close() error {
	return s.db.Close()
}

// ========== NOTAS ==========

// CreateNote cria uma nova nota
func (s *NotesService) CreateNote(title, description string, startDate, endDate *time.Time) (*Note, error) {
	now := time.Now()
	nowStr := now.Format("2006-01-02 15:04:05")

	var startDateStr, endDateStr sql.NullString
	if startDate != nil {
		startDateStr.String = startDate.Format("2006-01-02 15:04:05")
		startDateStr.Valid = true
	}
	if endDate != nil {
		endDateStr.String = endDate.Format("2006-01-02 15:04:05")
		endDateStr.Valid = true
	}

	result, err := s.db.Exec(
		"INSERT INTO notes (title, description, start_date, end_date, completed, created_at, updated_at) VALUES (?, ?, ?, ?, 0, ?, ?)",
		title, description, startDateStr, endDateStr, nowStr, nowStr,
	)
	if err != nil {
		return nil, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return nil, err
	}

	return s.GetNote(id)
}

// GetNote retorna uma nota por ID
func (s *NotesService) GetNote(id int64) (*Note, error) {
	var note Note
	var startDateStr, endDateStr sql.NullString
	var createdAtStr, updatedAtStr string

	err := s.db.QueryRow(
		"SELECT id, title, description, start_date, end_date, completed, created_at, updated_at FROM notes WHERE id = ?",
		id,
	).Scan(&note.ID, &note.Title, &note.Description, &startDateStr, &endDateStr, &note.Completed, &createdAtStr, &updatedAtStr)

	if err != nil {
		return nil, err
	}

	if startDateStr.Valid {
		startDate, err := time.Parse("2006-01-02 15:04:05", startDateStr.String)
		if err == nil {
			note.StartDate = &startDate
		}
	}

	if endDateStr.Valid {
		endDate, err := time.Parse("2006-01-02 15:04:05", endDateStr.String)
		if err == nil {
			note.EndDate = &endDate
		}
	}

	note.CreatedAt, _ = time.Parse("2006-01-02 15:04:05", createdAtStr)
	note.UpdatedAt, _ = time.Parse("2006-01-02 15:04:05", updatedAtStr)

	return &note, nil
}

// GetAllNotes retorna todas as notas
func (s *NotesService) GetAllNotes() ([]*Note, error) {
	rows, err := s.db.Query(
		"SELECT id, title, description, start_date, end_date, completed, created_at, updated_at FROM notes ORDER BY created_at DESC",
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var notes []*Note
	for rows.Next() {
		var note Note
		var startDateStr, endDateStr sql.NullString
		var createdAtStr, updatedAtStr string

		err := rows.Scan(&note.ID, &note.Title, &note.Description, &startDateStr, &endDateStr, &note.Completed, &createdAtStr, &updatedAtStr)
		if err != nil {
			continue
		}

		if startDateStr.Valid {
			startDate, err := time.Parse("2006-01-02 15:04:05", startDateStr.String)
			if err == nil {
				note.StartDate = &startDate
			}
		}

		if endDateStr.Valid {
			endDate, err := time.Parse("2006-01-02 15:04:05", endDateStr.String)
			if err == nil {
				note.EndDate = &endDate
			}
		}

		note.CreatedAt, _ = time.Parse("2006-01-02 15:04:05", createdAtStr)
		note.UpdatedAt, _ = time.Parse("2006-01-02 15:04:05", updatedAtStr)

		notes = append(notes, &note)
	}

	return notes, nil
}

// UpdateNote atualiza uma nota
func (s *NotesService) UpdateNote(id int64, title, description string, startDate, endDate *time.Time, completed bool) (*Note, error) {
	now := time.Now()
	nowStr := now.Format("2006-01-02 15:04:05")

	var startDateStr, endDateStr sql.NullString
	if startDate != nil {
		startDateStr.String = startDate.Format("2006-01-02 15:04:05")
		startDateStr.Valid = true
	}
	if endDate != nil {
		endDateStr.String = endDate.Format("2006-01-02 15:04:05")
		endDateStr.Valid = true
	}

	_, err := s.db.Exec(
		"UPDATE notes SET title = ?, description = ?, start_date = ?, end_date = ?, completed = ?, updated_at = ? WHERE id = ?",
		title, description, startDateStr, endDateStr, completed, nowStr, id,
	)
	if err != nil {
		return nil, err
	}

	return s.GetNote(id)
}

// DeleteNote remove uma nota
func (s *NotesService) DeleteNote(id int64) error {
	_, err := s.db.Exec("DELETE FROM notes WHERE id = ?", id)
	return err
}

// ToggleNoteCompleted alterna o status de conclusão de uma nota
func (s *NotesService) ToggleNoteCompleted(id int64) (*Note, error) {
	note, err := s.GetNote(id)
	if err != nil {
		return nil, err
	}

	return s.UpdateNote(id, note.Title, note.Description, note.StartDate, note.EndDate, !note.Completed)
}

// ========== LOCALIZAÇÕES ==========

// CreateLocation cria uma nova localização
func (s *NotesService) CreateLocation(name, description, mapType, server string, x, y int) (*Location, error) {
	now := time.Now()
	nowStr := now.Format("2006-01-02 15:04:05")

	// Valores padrão
	if mapType == "" {
		mapType = "yaga"
	}
	if server == "" {
		server = "Harmony"
	}

	result, err := s.db.Exec(
		"INSERT INTO locations (name, description, map_type, server, x, y, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
		name, description, mapType, server, x, y, nowStr, nowStr,
	)
	if err != nil {
		return nil, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return nil, err
	}

	return s.GetLocation(id)
}

// GetLocation retorna uma localização por ID
func (s *NotesService) GetLocation(id int64) (*Location, error) {
	var location Location
	var createdAtStr, updatedAtStr string
	var mapType, server sql.NullString

	err := s.db.QueryRow(
		"SELECT id, name, description, map_type, server, x, y, created_at, updated_at FROM locations WHERE id = ?",
		id,
	).Scan(&location.ID, &location.Name, &location.Description, &mapType, &server, &location.X, &location.Y, &createdAtStr, &updatedAtStr)

	if err != nil {
		return nil, err
	}

	location.MapType = "yaga"
	location.Server = "Harmony"
	if mapType.Valid {
		location.MapType = mapType.String
	}
	if server.Valid {
		location.Server = server.String
	}

	location.CreatedAt, _ = time.Parse("2006-01-02 15:04:05", createdAtStr)
	location.UpdatedAt, _ = time.Parse("2006-01-02 15:04:05", updatedAtStr)

	return &location, nil
}

// GetAllLocations retorna todas as localizações
func (s *NotesService) GetAllLocations() ([]*Location, error) {
	rows, err := s.db.Query(
		"SELECT id, name, description, map_type, server, x, y, created_at, updated_at FROM locations ORDER BY created_at DESC",
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var locations []*Location
	for rows.Next() {
		var location Location
		var createdAtStr, updatedAtStr string
		var mapType, server sql.NullString

		err := rows.Scan(&location.ID, &location.Name, &location.Description, &mapType, &server, &location.X, &location.Y, &createdAtStr, &updatedAtStr)
		if err != nil {
			continue
		}

		location.MapType = "yaga"
		location.Server = "Harmony"
		if mapType.Valid {
			location.MapType = mapType.String
		}
		if server.Valid {
			location.Server = server.String
		}

		location.CreatedAt, _ = time.Parse("2006-01-02 15:04:05", createdAtStr)
		location.UpdatedAt, _ = time.Parse("2006-01-02 15:04:05", updatedAtStr)

		locations = append(locations, &location)
	}

	return locations, nil
}

// UpdateLocation atualiza uma localização
func (s *NotesService) UpdateLocation(id int64, name, description, mapType, server string, x, y int) (*Location, error) {
	now := time.Now()
	nowStr := now.Format("2006-01-02 15:04:05")

	// Valores padrão
	if mapType == "" {
		mapType = "yaga"
	}
	if server == "" {
		server = "Harmony"
	}

	_, err := s.db.Exec(
		"UPDATE locations SET name = ?, description = ?, map_type = ?, server = ?, x = ?, y = ?, updated_at = ? WHERE id = ?",
		name, description, mapType, server, x, y, nowStr, id,
	)
	if err != nil {
		return nil, err
	}

	return s.GetLocation(id)
}

// DeleteLocation remove uma localização
func (s *NotesService) DeleteLocation(id int64) error {
	_, err := s.db.Exec("DELETE FROM locations WHERE id = ?", id)
	return err
}
