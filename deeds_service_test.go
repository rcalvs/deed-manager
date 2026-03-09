package main

import "testing"

func TestComputeUpkeepDuration(t *testing.T) {
	// 1 silver (10000 iron), custo mensal 1s 47c 20i = 14720 iron
	// Deveria dar ~20 dias: 10000 * 30 / (14720/30) ≈ 20.4
	// totalMinutes = 10000 * 43200 / 14720 = 29347 → 20d 10h 27m
	days, hours, minutes := computeUpkeepDuration(10000, 14720)
	if days != 20 {
		t.Errorf("1s com custo 1s47c20i: esperado 20 dias, obtido %d", days)
	}
	if hours < 9 || hours > 11 {
		t.Errorf("1s com custo 1s47c20i: esperado ~9-10h, obtido %dh", hours)
	}

	// 8.8 silver (88000 iron), custo 14720 → ~179 dias
	days, _, _ = computeUpkeepDuration(88320, 14720)
	if days < 175 || days > 185 {
		t.Errorf("8.8s com custo 1s47c20i: esperado ~180 dias, obtido %d", days)
	}

	// Edge: zero cost
	days, hours, minutes = computeUpkeepDuration(10000, 0)
	if days != 0 || hours != 0 || minutes != 0 {
		t.Errorf("custo 0: esperado 0,0,0 obtido %d,%d,%d", days, hours, minutes)
	}
}
