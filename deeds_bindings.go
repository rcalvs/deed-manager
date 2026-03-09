package main

// CreateDeed cria um novo deed
func (a *App) CreateDeed(name, mayor, location string, sizeWidth, sizeHeight int,
	coffersIron, upkeepChipsIron, monthlyCostIron int64, upkeepDays, upkeepHours, upkeepMinutes int,
	rawText string) (*Deed, error) {
	return a.deedsService.CreateDeed(name, mayor, location, sizeWidth, sizeHeight,
		coffersIron, upkeepChipsIron, monthlyCostIron, upkeepDays, upkeepHours, upkeepMinutes, rawText)
}

// GetDeed retorna um deed por ID
func (a *App) GetDeed(id int64) (*Deed, error) {
	return a.deedsService.GetDeed(id)
}

// GetAllDeeds retorna todos os deeds
func (a *App) GetAllDeeds() ([]*Deed, error) {
	return a.deedsService.GetAllDeeds()
}

// UpdateDeed atualiza um deed
func (a *App) UpdateDeed(id int64, name, mayor, location string, sizeWidth, sizeHeight int,
	coffersIron, upkeepChipsIron, monthlyCostIron int64, upkeepDays, upkeepHours, upkeepMinutes int,
	rawText string) (*Deed, error) {
	return a.deedsService.UpdateDeed(id, name, mayor, location, sizeWidth, sizeHeight,
		coffersIron, upkeepChipsIron, monthlyCostIron, upkeepDays, upkeepHours, upkeepMinutes, rawText)
}

// DeleteDeed remove um deed
func (a *App) DeleteDeed(id int64) error {
	return a.deedsService.DeleteDeed(id)
}

// AddDeedFunds adiciona fundos ao cofre ou chips do deed e recalcula a duração do upkeep
func (a *App) AddDeedFunds(id int64, amountIron int64, addToCoffers bool) (*Deed, error) {
	return a.deedsService.AddDeedFunds(id, amountIron, addToCoffers)
}
