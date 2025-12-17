package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"time"

	_ "modernc.org/sqlite"
)

// HusbandryService gerencia operações de husbandry (criação de animais)
type HusbandryService struct {
	db *sql.DB
}

// NewHusbandryService cria uma nova instância do serviço de husbandry
func NewHusbandryService() *HusbandryService {
	return &HusbandryService{}
}

// Initialize inicializa o banco de dados
func (s *HusbandryService) Initialize() error {
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
func (s *HusbandryService) createTables() error {
	// Tabela de animais
	createAnimalsTable := `
	CREATE TABLE IF NOT EXISTS animals (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL,
		type TEXT NOT NULL,
		gender TEXT NOT NULL,
		age TEXT NOT NULL,
		condition TEXT NOT NULL,
		father TEXT DEFAULT '',
		mother TEXT DEFAULT '',
		traits TEXT NOT NULL DEFAULT '[]',
		notes TEXT DEFAULT '',
		created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
		updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
	);`

	// Criar índices para melhor performance
	createIndexes := `
	CREATE INDEX IF NOT EXISTS idx_animals_type ON animals(type);
	CREATE INDEX IF NOT EXISTS idx_animals_age ON animals(age);
	CREATE INDEX IF NOT EXISTS idx_animals_condition ON animals(condition);
	`

	if _, err := s.db.Exec(createAnimalsTable); err != nil {
		return err
	}

	if _, err := s.db.Exec(createIndexes); err != nil {
		return err
	}

	// Executar migrações
	if err := s.migrateTables(); err != nil {
		return err
	}

	return nil
}

// migrateTables executa migrações de schema
func (s *HusbandryService) migrateTables() error {
	// Verificar se a coluna gender existe
	var count int
	err := s.db.QueryRow(`
		SELECT COUNT(*) FROM pragma_table_info('animals') WHERE name='gender'
	`).Scan(&count)
	
	if err != nil {
		log.Printf("[HusbandryService] Erro ao verificar coluna gender: %v", err)
		return err
	}

	// Se a coluna gender não existe, adicioná-la
	if count == 0 {
		log.Printf("[HusbandryService] Coluna 'gender' não encontrada. Adicionando coluna...")
		_, err := s.db.Exec(`
			ALTER TABLE animals ADD COLUMN gender TEXT NOT NULL DEFAULT 'male'
		`)
		if err != nil {
			log.Printf("[HusbandryService] Erro ao adicionar coluna gender: %v", err)
			return err
		}
		log.Printf("[HusbandryService] Coluna 'gender' adicionada com sucesso")
	}

	// Verificar se as colunas father e mother existem
	err = s.db.QueryRow(`
		SELECT COUNT(*) FROM pragma_table_info('animals') WHERE name='father'
	`).Scan(&count)
	
	if err != nil {
		log.Printf("[HusbandryService] Erro ao verificar coluna father: %v", err)
		return err
	}

	if count == 0 {
		log.Printf("[HusbandryService] Coluna 'father' não encontrada. Adicionando coluna...")
		_, err := s.db.Exec(`
			ALTER TABLE animals ADD COLUMN father TEXT DEFAULT ''
		`)
		if err != nil {
			log.Printf("[HusbandryService] Erro ao adicionar coluna father: %v", err)
			return err
		}
		log.Printf("[HusbandryService] Coluna 'father' adicionada com sucesso")
	}

	err = s.db.QueryRow(`
		SELECT COUNT(*) FROM pragma_table_info('animals') WHERE name='mother'
	`).Scan(&count)
	
	if err != nil {
		log.Printf("[HusbandryService] Erro ao verificar coluna mother: %v", err)
		return err
	}

	if count == 0 {
		log.Printf("[HusbandryService] Coluna 'mother' não encontrada. Adicionando coluna...")
		_, err := s.db.Exec(`
			ALTER TABLE animals ADD COLUMN mother TEXT DEFAULT ''
		`)
		if err != nil {
			log.Printf("[HusbandryService] Erro ao adicionar coluna mother: %v", err)
			return err
		}
		log.Printf("[HusbandryService] Coluna 'mother' adicionada com sucesso")
	}

	// Verificar se as colunas de breeding existem
	err = s.db.QueryRow(`
		SELECT COUNT(*) FROM pragma_table_info('animals') WHERE name='is_pregnant'
	`).Scan(&count)
	
	if err != nil {
		log.Printf("[HusbandryService] Erro ao verificar coluna is_pregnant: %v", err)
		return err
	}

	if count == 0 {
		log.Printf("[HusbandryService] Coluna 'is_pregnant' não encontrada. Adicionando coluna...")
		_, err := s.db.Exec(`
			ALTER TABLE animals ADD COLUMN is_pregnant INTEGER DEFAULT 0
		`)
		if err != nil {
			log.Printf("[HusbandryService] Erro ao adicionar coluna is_pregnant: %v", err)
			return err
		}
		log.Printf("[HusbandryService] Coluna 'is_pregnant' adicionada com sucesso")
	}

	err = s.db.QueryRow(`
		SELECT COUNT(*) FROM pragma_table_info('animals') WHERE name='breeding_male_id'
	`).Scan(&count)
	
	if err != nil {
		log.Printf("[HusbandryService] Erro ao verificar coluna breeding_male_id: %v", err)
		return err
	}

	if count == 0 {
		log.Printf("[HusbandryService] Coluna 'breeding_male_id' não encontrada. Adicionando coluna...")
		_, err := s.db.Exec(`
			ALTER TABLE animals ADD COLUMN breeding_male_id INTEGER
		`)
		if err != nil {
			log.Printf("[HusbandryService] Erro ao adicionar coluna breeding_male_id: %v", err)
			return err
		}
		log.Printf("[HusbandryService] Coluna 'breeding_male_id' adicionada com sucesso")
	}

	err = s.db.QueryRow(`
		SELECT COUNT(*) FROM pragma_table_info('animals') WHERE name='breeding_due_date'
	`).Scan(&count)
	
	if err != nil {
		log.Printf("[HusbandryService] Erro ao verificar coluna breeding_due_date: %v", err)
		return err
	}

	if count == 0 {
		log.Printf("[HusbandryService] Coluna 'breeding_due_date' não encontrada. Adicionando coluna...")
		_, err := s.db.Exec(`
			ALTER TABLE animals ADD COLUMN breeding_due_date DATETIME
		`)
		if err != nil {
			log.Printf("[HusbandryService] Erro ao adicionar coluna breeding_due_date: %v", err)
			return err
		}
		log.Printf("[HusbandryService] Coluna 'breeding_due_date' adicionada com sucesso")
	}

	return nil
}

// CreateAnimal cria um novo animal
func (s *HusbandryService) CreateAnimal(name string, animalType AnimalType, gender AnimalGender, age AnimalAge, condition AnimalCondition, father string, mother string, traits []string, notes string) (*Animal, error) {
	// Converter traits para JSON
	traitsJSON, err := json.Marshal(traits)
	if err != nil {
		return nil, err
	}

	now := time.Now()
	result, err := s.db.Exec(
		"INSERT INTO animals (name, type, gender, age, condition, father, mother, traits, notes, is_pregnant, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)",
		name, animalType, gender, age, condition, father, mother, string(traitsJSON), notes, now, now,
	)
	if err != nil {
		return nil, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return nil, err
	}

	return s.GetAnimal(int(id))
}

// GetAnimal obtém um animal por ID
func (s *HusbandryService) GetAnimal(id int) (*Animal, error) {
	var animal Animal
	var traitsJSON string
	var createdAt, updatedAt string

	var breedingMaleID sql.NullInt64
	var breedingDueDate sql.NullString
	var isPregnant int

	err := s.db.QueryRow(
		"SELECT id, name, type, gender, age, condition, father, mother, traits, notes, is_pregnant, breeding_male_id, breeding_due_date, created_at, updated_at FROM animals WHERE id = ?",
		id,
	).Scan(&animal.ID, &animal.Name, &animal.Type, &animal.Gender, &animal.Age, &animal.Condition, &animal.Father, &animal.Mother, &traitsJSON, &animal.Notes, &isPregnant, &breedingMaleID, &breedingDueDate, &createdAt, &updatedAt)
	if err != nil {
		return nil, err
	}

	animal.IsPregnant = isPregnant == 1
	if breedingMaleID.Valid {
		maleID := int(breedingMaleID.Int64)
		animal.BreedingMaleID = &maleID
	}
	if breedingDueDate.Valid {
		dueDate, err := time.Parse("2006-01-02 15:04:05", breedingDueDate.String)
		if err == nil {
			animal.BreedingDueDate = &dueDate
		}
	}

	// Parsear traits JSON
	if err := json.Unmarshal([]byte(traitsJSON), &animal.Traits); err != nil {
		animal.Traits = []string{}
	}

	// Parsear datas
	animal.CreatedAt, _ = time.Parse("2006-01-02 15:04:05", createdAt)
	animal.UpdatedAt, _ = time.Parse("2006-01-02 15:04:05", updatedAt)

	return &animal, nil
}

// GetAllAnimals obtém todos os animais
func (s *HusbandryService) GetAllAnimals() ([]*Animal, error) {
	rows, err := s.db.Query(
		"SELECT id, name, type, gender, age, condition, father, mother, traits, notes, is_pregnant, breeding_male_id, breeding_due_date, created_at, updated_at FROM animals ORDER BY created_at DESC",
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var animals []*Animal
	for rows.Next() {
		var animal Animal
		var traitsJSON string
		var createdAt, updatedAt string
		var breedingMaleID sql.NullInt64
		var breedingDueDate sql.NullString
		var isPregnant int

		if err := rows.Scan(&animal.ID, &animal.Name, &animal.Type, &animal.Gender, &animal.Age, &animal.Condition, &animal.Father, &animal.Mother, &traitsJSON, &animal.Notes, &isPregnant, &breedingMaleID, &breedingDueDate, &createdAt, &updatedAt); err != nil {
			log.Printf("Erro ao escanear animal: %v", err)
			continue
		}
		
		animal.IsPregnant = isPregnant == 1
		if breedingMaleID.Valid {
			maleID := int(breedingMaleID.Int64)
			animal.BreedingMaleID = &maleID
		}
		if breedingDueDate.Valid {
			dueDate, err := time.Parse("2006-01-02 15:04:05", breedingDueDate.String)
			if err == nil {
				animal.BreedingDueDate = &dueDate
			}
		}

		// Parsear traits JSON
		if err := json.Unmarshal([]byte(traitsJSON), &animal.Traits); err != nil {
			animal.Traits = []string{}
		}

		// Parsear datas
		animal.CreatedAt, _ = time.Parse("2006-01-02 15:04:05", createdAt)
		animal.UpdatedAt, _ = time.Parse("2006-01-02 15:04:05", updatedAt)

		animals = append(animals, &animal)
	}

	return animals, rows.Err()
}

// UpdateAnimal atualiza um animal existente
func (s *HusbandryService) UpdateAnimal(id int, name string, animalType AnimalType, gender AnimalGender, age AnimalAge, condition AnimalCondition, father string, mother string, traits []string, notes string) error {
	// Converter traits para JSON
	traitsJSON, err := json.Marshal(traits)
	if err != nil {
		return err
	}

	_, err = s.db.Exec(
		"UPDATE animals SET name = ?, type = ?, gender = ?, age = ?, condition = ?, father = ?, mother = ?, traits = ?, notes = ?, updated_at = ? WHERE id = ?",
		name, animalType, gender, age, condition, father, mother, string(traitsJSON), notes, time.Now(), id,
	)
	return err
}

// SetBreeding marca uma fêmea como grávida
func (s *HusbandryService) SetBreeding(femaleID int, maleID int, days int, hours int) error {
	dueDate := time.Now().AddDate(0, 0, days).Add(time.Duration(hours) * time.Hour)
	
	_, err := s.db.Exec(
		"UPDATE animals SET is_pregnant = 1, breeding_male_id = ?, breeding_due_date = ?, updated_at = ? WHERE id = ?",
		maleID, dueDate, time.Now(), femaleID,
	)
	return err
}

// ClearBreeding remove o status de grávida de uma fêmea
func (s *HusbandryService) ClearBreeding(animalID int) error {
	_, err := s.db.Exec(
		"UPDATE animals SET is_pregnant = 0, breeding_male_id = NULL, breeding_due_date = NULL, updated_at = ? WHERE id = ?",
		time.Now(), animalID,
	)
	return err
}

// GetPregnantAnimals obtém todas as fêmeas grávidas
func (s *HusbandryService) GetPregnantAnimals() ([]*Animal, error) {
	rows, err := s.db.Query(
		"SELECT id, name, type, gender, age, condition, father, mother, traits, notes, is_pregnant, breeding_male_id, breeding_due_date, created_at, updated_at FROM animals WHERE is_pregnant = 1 AND gender = 'female' ORDER BY breeding_due_date ASC",
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var animals []*Animal
	for rows.Next() {
		var animal Animal
		var traitsJSON string
		var createdAt, updatedAt string
		var breedingMaleID sql.NullInt64
		var breedingDueDate sql.NullString
		var isPregnant int

		if err := rows.Scan(&animal.ID, &animal.Name, &animal.Type, &animal.Gender, &animal.Age, &animal.Condition, &animal.Father, &animal.Mother, &traitsJSON, &animal.Notes, &isPregnant, &breedingMaleID, &breedingDueDate, &createdAt, &updatedAt); err != nil {
			log.Printf("Erro ao escanear animal grávido: %v", err)
			continue
		}
		
		animal.IsPregnant = isPregnant == 1
		if breedingMaleID.Valid {
			maleID := int(breedingMaleID.Int64)
			animal.BreedingMaleID = &maleID
		}
		if breedingDueDate.Valid {
			dueDate, err := time.Parse("2006-01-02 15:04:05", breedingDueDate.String)
			if err == nil {
				animal.BreedingDueDate = &dueDate
			}
		}

		// Parsear traits JSON
		if err := json.Unmarshal([]byte(traitsJSON), &animal.Traits); err != nil {
			animal.Traits = []string{}
		}

		// Parsear datas
		animal.CreatedAt, _ = time.Parse("2006-01-02 15:04:05", createdAt)
		animal.UpdatedAt, _ = time.Parse("2006-01-02 15:04:05", updatedAt)

		animals = append(animals, &animal)
	}

	return animals, rows.Err()
}

// DeleteAnimal deleta um animal
func (s *HusbandryService) DeleteAnimal(id int) error {
	_, err := s.db.Exec("DELETE FROM animals WHERE id = ?", id)
	return err
}

// Close fecha a conexão com o banco de dados
func (s *HusbandryService) Close() error {
	if s.db != nil {
		return s.db.Close()
	}
	return nil
}

