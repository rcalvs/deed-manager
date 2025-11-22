package main

import (
	"context"
)

// App struct
type App struct {
	ctx           context.Context
	stockService  *StockService
	notesService  *NotesService
}

// NewApp cria uma nova instância da aplicação
func NewApp(stockService *StockService, notesService *NotesService) *App {
	return &App{
		stockService: stockService,
		notesService: notesService,
	}
}

// startup é chamado quando a aplicação inicia
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	// Inicializar banco de dados
	if err := a.stockService.Initialize(); err != nil {
		panic(err)
	}
	if err := a.notesService.Initialize(); err != nil {
		panic(err)
	}
}

// shutdown é chamado quando a aplicação fecha
func (a *App) shutdown(ctx context.Context) {
	// Fechar conexão com banco de dados
	if err := a.stockService.Close(); err != nil {
		panic(err)
	}
	if err := a.notesService.Close(); err != nil {
		panic(err)
	}
}


