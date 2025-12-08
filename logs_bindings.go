package main

import (
	"log"
	"os"
	"path/filepath"
)

// Este arquivo contém os métodos expostos para o frontend via Wails relacionados a logs

// SetLogsPath define o caminho dos logs do Wurm
func (a *App) SetLogsPath(path string) error {
	log.Printf("[App] SetLogsPath: Definindo caminho dos logs: %s", path)
	return a.logsService.SetLogsPath(path)
}

// GetLogsPath retorna o caminho atual dos logs
func (a *App) GetLogsPath() string {
	return a.logsService.GetLogsPath()
}

// ReadTradeLogLastLine lê a última linha do arquivo Trade.2025-08.txt
// O ano e mês são calculados automaticamente baseado na data atual
func (a *App) ReadTradeLogLastLine() (string, error) {
	logsPath := a.logsService.GetLogsPath()
	if logsPath == "" {
		log.Printf("[App] ReadTradeLogLastLine: Caminho dos logs não configurado")
		return "", os.ErrNotExist
	}

	// Verificar se o diretório existe
	if _, err := os.Stat(logsPath); os.IsNotExist(err) {
		log.Printf("[App] ReadTradeLogLastLine: Diretório não existe: %s", logsPath)
		return "", err
	}

	// Construir nome do arquivo: Trade.YYYY-MM.txt
	// Os arquivos de log do Wurm têm extensão .txt
	// Por enquanto, vamos usar um formato fixo como no exemplo: Trade.2025-08.txt
	// No futuro, podemos calcular baseado na data atual
	fileName := "Trade.2025-08.txt"

	// Construir caminho completo
	fullPath := filepath.Join(logsPath, fileName)

	log.Printf("[App] ReadTradeLogLastLine: Caminho dos logs: %s", logsPath)
	log.Printf("[App] ReadTradeLogLastLine: Nome do arquivo: %s", fileName)
	log.Printf("[App] ReadTradeLogLastLine: Caminho completo: %s", fullPath)

	// Verificar se o arquivo existe antes de tentar ler
	if _, err := os.Stat(fullPath); os.IsNotExist(err) {
		log.Printf("[App] ReadTradeLogLastLine: Arquivo não encontrado: %s", fullPath)
		// Listar arquivos no diretório para debug
		if entries, listErr := os.ReadDir(logsPath); listErr == nil {
			log.Printf("[App] ReadTradeLogLastLine: Arquivos encontrados no diretório:")
			for _, entry := range entries {
				log.Printf("[App] ReadTradeLogLastLine:   - %s", entry.Name())
			}
		}
		return "", err
	}

	lastLine, err := a.logsService.ReadLastLineFromPath(fullPath)
	if err != nil {
		log.Printf("[App] ReadTradeLogLastLine: Erro ao ler arquivo: %v", err)
		return "", err
	}

	log.Printf("[App] ReadTradeLogLastLine: Última linha lida com sucesso (tamanho: %d caracteres)", len(lastLine))
	log.Printf("[App] ReadTradeLogLastLine: Última linha lida: %s", lastLine)

	return lastLine, nil
}

// ReadCurrentTradeLogLastNLines lê as últimas N linhas do arquivo Trade atual
func (a *App) ReadCurrentTradeLogLastNLines(n int) ([]string, error) {
	logsPath := a.logsService.GetLogsPath()
	if logsPath == "" {
		log.Printf("[App] ReadCurrentTradeLogLastNLines: Caminho dos logs não configurado")
		return nil, os.ErrNotExist
	}

	log.Printf("[App] ReadCurrentTradeLogLastNLines: Lendo últimas %d linhas do Trade atual", n)

	lines, err := a.logsService.ReadCurrentTradeLogLastNLines(n)
	if err != nil {
		log.Printf("[App] ReadCurrentTradeLogLastNLines: Erro ao ler linhas: %v", err)
		return nil, err
	}

	log.Printf("[App] ReadCurrentTradeLogLastNLines: %d linhas lidas com sucesso", len(lines))
	return lines, nil
}

// ReadCurrentEventsLogLastNLines lê as últimas N linhas do arquivo _Event atual
func (a *App) ReadCurrentEventsLogLastNLines(n int) ([]string, error) {
	logsPath := a.logsService.GetLogsPath()
	if logsPath == "" {
		log.Printf("[App] ReadCurrentEventsLogLastNLines: Caminho dos logs não configurado")
		return nil, os.ErrNotExist
	}

	log.Printf("[App] ReadCurrentEventsLogLastNLines: Lendo últimas %d linhas do _Event atual", n)

	lines, err := a.logsService.ReadCurrentEventsLogLastNLines(n)
	if err != nil {
		log.Printf("[App] ReadCurrentEventsLogLastNLines: Erro ao ler linhas: %v", err)
		return nil, err
	}

	log.Printf("[App] ReadCurrentEventsLogLastNLines: %d linhas lidas com sucesso", len(lines))
	return lines, nil
}
