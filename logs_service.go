package main

import (
	"bufio"
	"log"
	"os"
	"path/filepath"
	"strings"
	"time"
)

// LogsService gerencia a leitura de logs do Wurm Online
type LogsService struct {
	logsPath string
}

// NewLogsService cria uma nova instância do serviço de logs
func NewLogsService() *LogsService {
	return &LogsService{}
}

// SetLogsPath define o caminho dos logs
func (ls *LogsService) SetLogsPath(path string) error {
	// Validar se o caminho existe
	if _, err := os.Stat(path); os.IsNotExist(err) {
		return err
	}
	ls.logsPath = path
	return nil
}

// GetLogsPath retorna o caminho atual dos logs
func (ls *LogsService) GetLogsPath() string {
	return ls.logsPath
}

// ReadLastLine lê a última linha de um arquivo de log
// fileName deve ser o nome do arquivo (ex: "Trade.2025-08")
func (ls *LogsService) ReadLastLine(fileName string) (string, error) {
	if ls.logsPath == "" {
		return "", os.ErrNotExist
	}

	// Construir caminho completo
	fullPath := filepath.Join(ls.logsPath, fileName)

	// Verificar se o arquivo existe
	if _, err := os.Stat(fullPath); os.IsNotExist(err) {
		return "", err
	}

	// Abrir arquivo
	file, err := os.Open(fullPath)
	if err != nil {
		log.Printf("[LogsService] Erro ao abrir arquivo %s: %v", fullPath, err)
		return "", err
	}
	defer file.Close()

	// Ler última linha
	scanner := bufio.NewScanner(file)
	var lastLine string
	for scanner.Scan() {
		line := scanner.Text()
		// Ignorar linhas vazias
		if strings.TrimSpace(line) != "" {
			lastLine = line
		}
	}

	if err := scanner.Err(); err != nil {
		log.Printf("[LogsService] Erro ao ler arquivo %s: %v", fullPath, err)
		return "", err
	}

	return lastLine, nil
}

// ReadLastLineFromPath lê a última linha de um arquivo de log usando caminho completo
func (ls *LogsService) ReadLastLineFromPath(filePath string) (string, error) {
	// Verificar se o arquivo existe
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		return "", err
	}

	// Abrir arquivo
	file, err := os.Open(filePath)
	if err != nil {
		log.Printf("[LogsService] Erro ao abrir arquivo %s: %v", filePath, err)
		return "", err
	}
	defer file.Close()

	// Ler última linha
	scanner := bufio.NewScanner(file)
	var lastLine string
	for scanner.Scan() {
		line := scanner.Text()
		// Ignorar linhas vazias
		if strings.TrimSpace(line) != "" {
			lastLine = line
		}
	}

	if err := scanner.Err(); err != nil {
		log.Printf("[LogsService] Erro ao ler arquivo %s: %v", filePath, err)
		return "", err
	}

	return lastLine, nil
}

// ReadLastNLines lê as últimas N linhas de um arquivo de log
func (ls *LogsService) ReadLastNLines(filePath string, n int) ([]string, error) {
	// Verificar se o arquivo existe
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		return nil, err
	}

	// Abrir arquivo
	file, err := os.Open(filePath)
	if err != nil {
		log.Printf("[LogsService] Erro ao abrir arquivo %s: %v", filePath, err)
		return nil, err
	}
	defer file.Close()

	// Ler todas as linhas
	scanner := bufio.NewScanner(file)
	var allLines []string
	for scanner.Scan() {
		line := scanner.Text()
		// Ignorar linhas vazias
		if strings.TrimSpace(line) != "" {
			allLines = append(allLines, line)
		}
	}

	if err := scanner.Err(); err != nil {
		log.Printf("[LogsService] Erro ao ler arquivo %s: %v", filePath, err)
		return nil, err
	}

	// Retornar últimas N linhas
	if len(allLines) <= n {
		return allLines, nil
	}
	return allLines[len(allLines)-n:], nil
}

// ReadCurrentTradeLogLastNLines lê as últimas N linhas do arquivo Trade atual
func (ls *LogsService) ReadCurrentTradeLogLastNLines(n int) ([]string, error) {
	if ls.logsPath == "" {
		return nil, os.ErrNotExist
	}

	// Construir nome do arquivo baseado na data atual
	now := time.Now()
	fileName := filepath.Join(ls.logsPath, "Trade."+now.Format("2006-01")+".txt")

	log.Printf("[LogsService] ReadCurrentTradeLogLastNLines: Lendo últimas %d linhas de %s", n, fileName)

	return ls.ReadLastNLines(fileName, n)
}

// ReadCurrentEventsLogLastNLines lê as últimas N linhas do arquivo _Event atual
func (ls *LogsService) ReadCurrentEventsLogLastNLines(n int) ([]string, error) {
	if ls.logsPath == "" {
		return nil, os.ErrNotExist
	}

	// Construir nome do arquivo baseado na data atual
	now := time.Now()
	fileName := filepath.Join(ls.logsPath, "_Event."+now.Format("2006-01")+".txt")

	log.Printf("[LogsService] ReadCurrentEventsLogLastNLines: Lendo últimas %d linhas de %s", n, fileName)

	return ls.ReadLastNLines(fileName, n)
}
