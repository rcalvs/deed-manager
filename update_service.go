package main

import (
	"fmt"
	"os"
	"runtime"
	"strings"

	"github.com/blang/semver"
	"github.com/rhysd/go-github-selfupdate/selfupdate"
)

// UpdateService gerencia atualizações automáticas da aplicação
type UpdateService struct {
	owner      string
	repo       string
	currentVer string
}

// NewUpdateService cria uma nova instância do serviço de atualização
func NewUpdateService(owner, repo, currentVersion string) *UpdateService {
	// Remove o 'v' do prefixo se existir
	version := strings.TrimPrefix(currentVersion, "v")
	return &UpdateService{
		owner:      owner,
		repo:       repo,
		currentVer: version,
	}
}

// CheckForUpdate verifica se há atualizações disponíveis
func (u *UpdateService) CheckForUpdate() (bool, string, string, error) {
	slug := fmt.Sprintf("%s/%s", u.owner, u.repo)
	latest, found, err := selfupdate.DetectLatest(slug)
	if err != nil {
		return false, "", "", fmt.Errorf("erro ao verificar atualizações: %w", err)
	}

	if !found {
		return false, "", "", nil
	}

	// Parse versão atual
	currentSemver, err := semver.Parse(u.currentVer)
	if err != nil {
		// Se não conseguir fazer parse, assume que há atualização disponível
		return true, latest.Version.String(), latest.ReleaseNotes, nil
	}

	// Comparar versões
	if latest.Version.EQ(currentSemver) {
		return false, latest.Version.String(), "", nil
	}

	// Verificar se a versão mais recente é maior
	if latest.Version.LT(currentSemver) {
		return false, latest.Version.String(), "", nil
	}

	return true, latest.Version.String(), latest.ReleaseNotes, nil
}

// Update baixa e instala a atualização mais recente
func (u *UpdateService) Update() error {
	// Verificar se há atualização disponível
	available, _, _, err := u.CheckForUpdate()
	if err != nil {
		return err
	}

	if !available {
		return fmt.Errorf("nenhuma atualização disponível")
	}

	// Baixar e aplicar atualização
	exe, err := os.Executable()
	if err != nil {
		return fmt.Errorf("erro ao obter caminho do executável: %w", err)
	}

	slug := fmt.Sprintf("%s/%s", u.owner, u.repo)
	currentSemver, err := semver.Parse(u.currentVer)
	if err != nil {
		return fmt.Errorf("erro ao fazer parse da versão atual: %w", err)
	}

	// Usar UpdateCommand que é mais simples e seguro
	_, err = selfupdate.UpdateCommand(exe, currentSemver, slug)
	if err != nil {
		return fmt.Errorf("erro ao aplicar atualização: %w", err)
	}

	return nil
}

// GetCurrentVersion retorna a versão atual
func (u *UpdateService) GetCurrentVersion() string {
	return u.currentVer
}

// GetPlatform retorna a plataforma atual
func (u *UpdateService) GetPlatform() string {
	return fmt.Sprintf("%s/%s", runtime.GOOS, runtime.GOARCH)
}

// CanUpdate verifica se a atualização automática é suportada na plataforma atual
func (u *UpdateService) CanUpdate() bool {
	// Squirrel suporta Windows e macOS
	return runtime.GOOS == "windows" || runtime.GOOS == "darwin"
}

