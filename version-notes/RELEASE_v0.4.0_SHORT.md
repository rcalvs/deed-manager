# Release v0.4.0 - Deeds: Adicionar Fundos e Correções

## 🎉 Principais Novidades

### 💰 Adicionar Fundos aos Deeds
- **Modal dedicado**: Botão "+" em cada card de deed
- **Cofre ou Chips**: Escolha o destino dos fundos (g/s/c/i)
- **Recálculo automático**: Duração do upkeep atualizada após adicionar

### 🐛 Correção de Upkeep
- **applyUpkeepDebits**: Agora recalcula `upkeep_days` após cada débito mensal
- **computeUpkeepDuration**: Função centralizada para cálculo consistente
- **Teste unitário**: Valida fórmula (1s com custo 1s47c20i ≈ 20 dias)

## 🎨 Melhorias

### WelcomeScreen
- **Novos cards**: Deeds, Calendar, Events adicionados à tela de funcionalidades
- **7 cards total**: Stock, Charts, Deeds, Notes, Locations, Calendar, Events
- **Traduções**: PT, EN, RU atualizados

## 📦 Resumo

- Novo: AddFundsModal, deeds_service_test.go
- Corrigido: upkeep_days desatualizado após débitos
- Melhorado: Card de boas-vindas com todas as features
