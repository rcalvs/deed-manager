# Release v0.4.0 - Deeds: Adicionar Fundos e Correções de Upkeep

## 🎉 Novidades Principais

### 💰 Adicionar Fundos aos Deeds
Sistema para adicionar fundos ao cofre ou aos upkeep chips diretamente no aplicativo:

#### Funcionalidades
- **Modal de adicionar fundos**: Botão "+" em cada card de deed para abrir o modal
- **Destino configurável**: Escolher entre Cofre (coffers) ou Chips de upkeep
- **Valores em g/s/c/i**: Campos para Gold, Silver, Copper e Iron
- **Recálculo automático**: Duração do upkeep recalculada após adicionar fundos
- **Atualização imediata**: Lista de deeds atualizada após operação

#### Benefícios
- **Controle centralizado**: Não precisa anotar e atualizar manualmente no DeedForm
- **Feedback visual**: Veja a nova duração de upkeep na hora
- **Flexibilidade**: Adicione ao cofre ou aos chips conforme sua estratégia

### 🐛 Correção: Cálculo de Upkeep Após Débitos

#### Problema
- Após aplicar débitos mensais de upkeep (chips primeiro, depois cofre), os valores de `upkeep_days` no banco permaneciam desatualizados
- Isso gerava exibição incorreta da duração restante

#### Solução
- `applyUpkeepDebits` agora **recalcula** `upkeep_days`, `upkeep_hours` e `upkeep_minutes` após cada débito
- Função `computeUpkeepDuration` centralizada para cálculo consistente em débitos e AddDeedFunds
- Fórmula Wurm: 1 mês = 30 dias; `totalMinutes = totalIron × 43200 / MonthlyCostIron`

#### Verificação
- Teste unitário garante que 1 silver com custo mensal 1s 47c 20i ≈ 20 dias de upkeep
- Mesma fórmula usada em `AddDeedFunds` e `applyUpkeepDebits`

## 🎨 Melhorias de Interface

### WelcomeScreen - Card de Funcionalidades Atualizado
O card de funcionalidades na tela de boas-vindas foi atualizado com as novas features:

#### Novas features no card
- **Deeds**: Gerenciamento de settlements, adicionar fundos ao upkeep, parse do texto do jogo
- **Calendar**: Tempo Wurm, estações, starfall, notas com datas
- **Events**: Eventos de Trade e do jogo a partir dos logs (habilite nas Configurações)

#### Ordem final dos cards (7 total)
1. Stock
2. Charts
3. Deeds *(novo)*
4. Notes
5. Locations
6. Calendar *(novo)*
7. Events *(novo)*

#### Traduções
- Novas chaves `welcome.features.deeds`, `calendar`, `events` em PT, EN e RU
- Área da tela de features ampliada (max-width 1000px) para acomodar os cards

## 🔧 Melhorias Técnicas

### Backend (Go)
- **AddDeedFunds(id, amountIron, addToCoffers)**: Adiciona fundos e recalcula duração
- **computeUpkeepDuration(totalIron, monthlyCostIron)**: Helper para cálculo de dias/horas/minutos
- **applyUpkeepDebits**: Passa a atualizar upkeep no banco após débito
- **deeds_service_test.go**: Teste unitário para a fórmula de duração

### Frontend (React)
- **AddFundsModal**: Modal para adicionar fundos (g/s/c/i) ao cofre ou chips
- **DeedList**: Botão "+" e integração com AddFundsModal
- **WelcomeScreen**: Array de features expandido com Deeds, Calendar, Events

## 📦 Resumo de Arquivos

- **Novos**: deeds_service_test.go, AddFundsModal.jsx, AddFundsModal.css
- **Modificados**: deeds_service.go, deeds_bindings.go, DeedList.jsx, WelcomeScreen.jsx, api.js, locales (PT, EN, RU)

## 🐛 Correções

- ✅ `upkeep_days` desatualizado após débitos mensais
- ✅ Consistência do cálculo de duração centralizada em `computeUpkeepDuration`
