package main

import (
	"context"
)

// App struct
type App struct {
	ctx               context.Context
	stockService      *StockService
	notesService      *NotesService
	deedsService      *DeedsService
	updateService     *UpdateService
	logsService       *LogsService
	husbandryService  *HusbandryService
	husbandryBindings *HusbandryBindings
}

// NewApp cria uma nova instância da aplicação
// husbandryService pode ser nil quando Husbandry está desabilitado
func NewApp(stockService *StockService, notesService *NotesService, deedsService *DeedsService, updateService *UpdateService, logsService *LogsService, husbandryService *HusbandryService) *App {
	app := &App{
		stockService:     stockService,
		notesService:     notesService,
		deedsService:     deedsService,
		updateService:    updateService,
		logsService:      logsService,
		husbandryService: husbandryService,
	}
	if husbandryService != nil {
		app.husbandryBindings = NewHusbandryBindings(husbandryService)
	}
	return app
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
	if err := a.deedsService.Initialize(); err != nil {
		panic(err)
	}
	// HUSBANDRY DESABILITADO
	if a.husbandryService != nil {
		if err := a.husbandryService.Initialize(); err != nil {
			panic(err)
		}
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
	if err := a.deedsService.Close(); err != nil {
		panic(err)
	}
	// HUSBANDRY DESABILITADO
	if a.husbandryService != nil {
		if err := a.husbandryService.Close(); err != nil {
			panic(err)
		}
	}
}


