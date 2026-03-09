package main

import "log"

// HusbandryBindings expõe métodos do HusbandryService para o frontend
type HusbandryBindings struct {
	service *HusbandryService
}

// NewHusbandryBindings cria uma nova instância de bindings
func NewHusbandryBindings(service *HusbandryService) *HusbandryBindings {
	return &HusbandryBindings{service: service}
}

// CreateAnimal cria um novo animal
func (b *HusbandryBindings) CreateAnimal(name string, animalType string, gender string, age string, condition string, father string, mother string, traits []string, notes string) (*Animal, error) {
	log.Printf("[HusbandryBindings] CreateAnimal chamado com: name=%s, type=%s, gender=%s, age=%s, condition=%s, father=%s, mother=%s, traits=%v, notes=%s",
		name, animalType, gender, age, condition, father, mother, traits, notes)
	
	animal, err := b.service.CreateAnimal(
		name,
		AnimalType(animalType),
		AnimalGender(gender),
		AnimalAge(age),
		AnimalCondition(condition),
		father,
		mother,
		traits,
		notes,
	)
	
	if err != nil {
		log.Printf("[HusbandryBindings] CreateAnimal retornou erro: %v", err)
		return nil, err
	}
	
	log.Printf("[HusbandryBindings] CreateAnimal concluído com sucesso, ID do animal: %d", animal.ID)
	return animal, nil
}

// GetAnimal obtém um animal por ID
func (b *HusbandryBindings) GetAnimal(id int) (*Animal, error) {
	return b.service.GetAnimal(id)
}

// GetAllAnimals obtém todos os animais
func (b *HusbandryBindings) GetAllAnimals() ([]*Animal, error) {
	return b.service.GetAllAnimals()
}

// UpdateAnimal atualiza um animal existente
func (b *HusbandryBindings) UpdateAnimal(id int, name string, animalType string, gender string, age string, condition string, father string, mother string, traits []string, notes string) error {
	return b.service.UpdateAnimal(
		id,
		name,
		AnimalType(animalType),
		AnimalGender(gender),
		AnimalAge(age),
		AnimalCondition(condition),
		father,
		mother,
		traits,
		notes,
	)
}

// DeleteAnimal deleta um animal
func (b *HusbandryBindings) DeleteAnimal(id int) error {
	return b.service.DeleteAnimal(id)
}

// SetBreeding marca uma fêmea como grávida
func (b *HusbandryBindings) SetBreeding(femaleID int, maleID int, days int, hours int) error {
	return b.service.SetBreeding(femaleID, maleID, days, hours)
}

// ClearBreeding remove o status de grávida de uma fêmea
func (b *HusbandryBindings) ClearBreeding(animalID int) error {
	return b.service.ClearBreeding(animalID)
}

// GetPregnantAnimals obtém todas as fêmeas grávidas
func (b *HusbandryBindings) GetPregnantAnimals() ([]*Animal, error) {
	return b.service.GetPregnantAnimals()
}

