package main

import "fmt"

// UpdateInfo contém informações sobre atualizações
type UpdateInfo struct {
	Available      bool   `json:"available"`
	CurrentVersion string `json:"currentVersion"`
	LatestVersion  string `json:"latestVersion"`
	ReleaseNotes   string `json:"releaseNotes"`
	Platform       string `json:"platform"`
	CanUpdate      bool   `json:"canUpdate"`
}

// CheckForUpdate verifica se há atualizações disponíveis
func (a *App) CheckForUpdate() (*UpdateInfo, error) {
	if a.updateService == nil {
		return &UpdateInfo{
			Available:      false,
			CurrentVersion: "unknown",
			CanUpdate:      false,
		}, nil
	}

	available, latestVer, releaseNotes, err := a.updateService.CheckForUpdate()
	if err != nil {
		return nil, err
	}

	return &UpdateInfo{
		Available:      available,
		CurrentVersion: a.updateService.GetCurrentVersion(),
		LatestVersion:  latestVer,
		ReleaseNotes:   releaseNotes,
		Platform:       a.updateService.GetPlatform(),
		CanUpdate:      a.updateService.CanUpdate(),
	}, nil
}

// ApplyUpdate baixa e aplica a atualização
func (a *App) ApplyUpdate() error {
	if a.updateService == nil {
		return fmt.Errorf("serviço de atualização não disponível")
	}

	return a.updateService.Update()
}

// GetCurrentVersion retorna a versão atual
func (a *App) GetCurrentVersion() string {
	if a.updateService == nil {
		return "unknown"
	}
	return a.updateService.GetCurrentVersion()
}

// GetUpdatePlatform retorna a plataforma atual
func (a *App) GetUpdatePlatform() string {
	if a.updateService == nil {
		return "unknown"
	}
	return a.updateService.GetPlatform()
}

// CanAutoUpdate verifica se a atualização automática é suportada
func (a *App) CanAutoUpdate() bool {
	if a.updateService == nil {
		return false
	}
	return a.updateService.CanUpdate()
}

// GetAppVersion retorna a versão da aplicação
func (a *App) GetAppVersion() string {
	return AppVersion
}

