package main

import (
	"log"
	"time"
)

// ========== NOTAS ==========

// CreateNote cria uma nova nota
func (a *App) CreateNote(title, description, category string, startDateStr, endDateStr string) (*Note, error) {
	log.Printf("[App] CreateNote: title=%s, category=%s", title, category)

	var startDate, endDate *time.Time

	if startDateStr != "" {
		parsed, err := time.Parse("2006-01-02", startDateStr)
		if err != nil {
			parsed, err = time.Parse("2006-01-02T15:04:05", startDateStr)
			if err != nil {
				log.Printf("[App] CreateNote: Erro ao parsear startDate '%s': %v", startDateStr, err)
			} else {
				startDate = &parsed
			}
		} else {
			startDate = &parsed
		}
	}

	if endDateStr != "" {
		parsed, err := time.Parse("2006-01-02", endDateStr)
		if err != nil {
			parsed, err = time.Parse("2006-01-02T15:04:05", endDateStr)
			if err != nil {
				log.Printf("[App] CreateNote: Erro ao parsear endDate '%s': %v", endDateStr, err)
			} else {
				endDate = &parsed
			}
		} else {
			endDate = &parsed
		}
	}

	return a.notesService.CreateNote(title, description, category, startDate, endDate)
}

// GetNotes retorna todas as notas
func (a *App) GetNotes() ([]*Note, error) {
	return a.notesService.GetAllNotes()
}

// UpdateNote atualiza uma nota
func (a *App) UpdateNote(id int64, title, description, category string, startDateStr, endDateStr string, completed bool) (*Note, error) {
	log.Printf("[App] UpdateNote: id=%d, title=%s, category=%s", id, title, category)

	var startDate, endDate *time.Time

	if startDateStr != "" {
		parsed, err := time.Parse("2006-01-02", startDateStr)
		if err != nil {
			parsed, err = time.Parse("2006-01-02T15:04:05", startDateStr)
			if err != nil {
				log.Printf("[App] UpdateNote: Erro ao parsear startDate '%s': %v", startDateStr, err)
			} else {
				startDate = &parsed
			}
		} else {
			startDate = &parsed
		}
	}

	if endDateStr != "" {
		parsed, err := time.Parse("2006-01-02", endDateStr)
		if err != nil {
			parsed, err = time.Parse("2006-01-02T15:04:05", endDateStr)
			if err != nil {
				log.Printf("[App] UpdateNote: Erro ao parsear endDate '%s': %v", endDateStr, err)
			} else {
				endDate = &parsed
			}
		} else {
			endDate = &parsed
		}
	}

	return a.notesService.UpdateNote(id, title, description, category, startDate, endDate, completed)
}

// DeleteNote remove uma nota
func (a *App) DeleteNote(id int64) error {
	log.Printf("[App] DeleteNote: id=%d", id)
	return a.notesService.DeleteNote(id)
}

// ToggleNoteCompleted alterna o status de conclusão de uma nota
func (a *App) ToggleNoteCompleted(id int64) (*Note, error) {
	log.Printf("[App] ToggleNoteCompleted: id=%d", id)
	return a.notesService.ToggleNoteCompleted(id)
}

// ========== LOCALIZAÇÕES ==========

// CreateLocation cria uma nova localização
func (a *App) CreateLocation(name, description, category, mapType, server string, x, y int) (*Location, error) {
	log.Printf("[App] CreateLocation: name=%s, category=%s, mapType=%s, server=%s, x=%d, y=%d", name, category, mapType, server, x, y)
	return a.notesService.CreateLocation(name, description, category, mapType, server, x, y)
}

// GetLocations retorna todas as localizações
func (a *App) GetLocations() ([]*Location, error) {
	return a.notesService.GetAllLocations()
}

// UpdateLocation atualiza uma localização
func (a *App) UpdateLocation(id int64, name, description, category, mapType, server string, x, y int) (*Location, error) {
	log.Printf("[App] UpdateLocation: id=%d, name=%s, category=%s, mapType=%s, server=%s, x=%d, y=%d", id, name, category, mapType, server, x, y)
	return a.notesService.UpdateLocation(id, name, description, category, mapType, server, x, y)
}

// DeleteLocation remove uma localização
func (a *App) DeleteLocation(id int64) error {
	log.Printf("[App] DeleteLocation: id=%d", id)
	return a.notesService.DeleteLocation(id)
}

