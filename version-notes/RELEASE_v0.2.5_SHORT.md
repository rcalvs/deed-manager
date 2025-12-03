# Release v0.2.5 - Calibração de Tempo e Calendário de Colheitas

## 🎉 Principais Novidades

### ⚙️ Sistema de Calibração do Tempo do Wurm
- **Modal de calibração**: Interface dedicada para calibrar o tempo (modo desenvolvedor)
- **Parsing automático**: Extrai informações do comando `/time` do jogo
- **Validação completa**: Verifica formato, valores e starfalls
- **Preview em tempo real**: Mostra resultado antes de salvar
- **Persistência**: Época calibrada salva no localStorage

### 📅 Calendário de Colheitas Atualizado
- **Estrutura por semana**: Colheitas organizadas por starfall e semana (1-4)
- **Dados oficiais**: Baseado na tabela do Wurmpedia
- **8 starfalls mapeados**: Diamond, Leaf, Bear, Snake, Sun, Fire, Raven, Deer, Silent
- **Exibição precisa**: Mostra apenas colheitas da semana atual

## 🎨 Melhorias de Interface

- **Data/hora legível**: Formato DD/MM/YYYY HH:mm:ss no modal
- **Botão de atualizar**: Atualiza data/hora do PC facilmente
- **Feedback visual**: Mensagens de erro claras

## 🔧 Melhorias Técnicas

- **Novos utilitários**: `parseTimeCommand()`, `calculateEpochFromCalibration()`, `getWurmEpoch()`
- **HARVEST_CALENDAR reestruturado**: Suporte a colheitas por semana
- **Suporte a época customizada**: `calculateWurmTime()` usa época calibrada quando disponível

## 📦 Novos Recursos

- **Modal de calibração**: Interface completa para calibrar tempo
- **Colheitas por semana**: Estrutura detalhada por semana
- **Validação robusta**: Verificação completa de dados

## 📈 Estatísticas

- **Novos componentes**: 1 (CalibrationModal)
- **Novos utilitários**: 2 funções principais
- **Componentes atualizados**: 2
- **Traduções**: 3 idiomas (PT, EN, RU)
- **Starfalls mapeados**: 8

## 🐛 Correções

- ✅ Formatação de data/hora mais legível
- ✅ Cálculo de época corrigido
- ✅ Calendário de colheitas exibindo dados corretos

