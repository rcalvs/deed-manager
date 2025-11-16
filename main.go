package main

import (
	"embed"
	"log"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	// Criar instância do serviço de estoque
	stockService := NewStockService()

	// Criar instância da aplicação
	app := NewApp(stockService)

	// Configurar opções da aplicação
	appOptions := &options.App{
		Title:            "Wurm Manager",
		Width:            1200,
		Height:           800,
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup:        app.startup,
		OnShutdown:       app.shutdown,
		Bind:             []interface{}{app},
	}

	// Configurar AssetServer
	// Nota: No modo 'wails dev', o Wails automaticamente usa o servidor de desenvolvimento
	// do Vite e ignora o AssetServer. Em produção (wails build), usa os assets embutidos.
	appOptions.AssetServer = &assetserver.Options{
		Assets: assets,
	}

	// Criar contexto da aplicação
	err := wails.Run(appOptions)

	if err != nil {
		log.Fatal("Erro ao iniciar aplicação:", err)
	}
}
