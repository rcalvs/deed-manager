# Release v0.2.5 - Calibração de Tempo e Calendário de Colheitas

## 🎉 Novidades Principais

### ⚙️ Sistema de Calibração do Tempo do Wurm
Implementação completa de um sistema de calibração para ajustar precisamente o tempo do Wurm Online:

#### Funcionalidades
- **Modal de calibração**: Interface dedicada para calibrar o tempo do Wurm
- **Modo desenvolvedor**: Botão de calibração visível apenas quando o modo desenvolvedor está ativo
- **Parsing automático**: Sistema detecta e extrai automaticamente informações do comando `/time` do jogo
- **Validação completa**: Valida formato, valores e starfalls antes de calibrar
- **Preview em tempo real**: Mostra o resultado da calibração antes de salvar
- **Resetar calibração**: Opção para voltar à época padrão quando necessário
- **Persistência**: Época calibrada salva no localStorage e aplicada automaticamente

#### Formato do Comando
O sistema aceita o formato oficial do comando `/time`:
```
[HH:mm:ss] It is HH:mm:ss on day of the Wurm in week X of the starfall of the Y in the year of Z.
```

#### Benefícios
- **Precisão máxima**: Calibração baseada em dados reais do jogo
- **Flexibilidade**: Usuários podem recalibrar quando necessário
- **Fácil de usar**: Basta executar `/time` no jogo e colar o resultado
- **Transparente**: Preview mostra exatamente o que será salvo

### 📅 Calendário de Colheitas Atualizado
Atualização completa do calendário de colheitas baseado na tabela oficial do Wurmpedia:

#### Funcionalidades
- **Estrutura por semana**: Colheitas organizadas por starfall e semana (1-4)
- **Dados oficiais**: Baseado em https://www.wurmpedia.com/index.php/Harvest_calendar
- **Exibição precisa**: Mostra apenas as colheitas da semana atual do Wurm
- **8 starfalls mapeados**: Diamond, Leaf, Bear, Snake, Sun, Raven, Deer, Silent
- **Colheitas específicas**: Cada semana tem suas colheitas específicas listadas

#### Mapeamento Completo
- **Diamond**: Semana 1 - Pinenut
- **Leaf**: Semana 2 - Oleander; Semana 4 - Camellia
- **Bear**: Semana 2 - Lavender; Semana 3 - Rose; Semana 4 - Maple
- **Snake**: Semana 2 - Acorns
- **Sun**: Semana 1 - Cherries
- **Fire**: Semana 1 - Olives; Semana 2 - Blueberries; Semana 3 - Hops; Semana 4 - Oranges
- **Raven**: Semana 1 - Grapes; Semana 2 - Lemons; Semana 3 - Apples; Semana 4 - Chestnuts
- **Deer**: Semana 1 - Raspberries; Semana 2 - Walnuts; Semana 3 - Hazelnuts; Semana 4 - Lingonberries
- **Silent**: Semanas vazias (sem colheitas específicas)

#### Benefícios
- **Informações precisas**: Dados baseados na fonte oficial do jogo
- **Planejamento melhorado**: Saber exatamente quando cada item está disponível
- **Interface clara**: Exibição organizada e fácil de entender
- **Atualização automática**: Calendário se atualiza automaticamente com o tempo do Wurm

### 🎨 Melhorias de Interface

#### Modal de Calibração
- **Layout limpo**: Interface organizada e intuitiva
- **Data/hora legível**: Formato DD/MM/YYYY HH:mm:ss para melhor leitura
- **Botão de atualizar**: Permite atualizar a data/hora do PC facilmente
- **Feedback visual**: Mensagens de erro claras e preview de resultados
- **Responsivo**: Adapta-se a diferentes tamanhos de tela

#### Calendário
- **Exibição otimizada**: Informações de colheita mais claras
- **Formatação melhorada**: Texto mais legível e organizado

## 🔧 Melhorias Técnicas

### Frontend (React)

#### Novos Componentes
- **CalibrationModal**: Componente completo para calibração do tempo
  - Parsing de comandos `/time`
  - Validação de dados
  - Preview de resultados
  - Gerenciamento de estado

#### Utilitários Atualizados
- **wurmTime.js**: 
  - Função `parseTimeCommand()`: Extrai informações do comando `/time`
  - Função `calculateEpochFromCalibration()`: Calcula nova época baseada em calibração
  - Função `getWurmEpoch()`: Obtém época calibrada ou padrão do localStorage
  - Suporte a época customizada em `calculateWurmTime()`

#### Estrutura de Dados
- **HARVEST_CALENDAR**: Reestruturado para suportar colheitas por semana
  ```javascript
  {
    'Starfall': {
      name: 'Starfall',
      weeks: {
        1: ['Harvest1', 'Harvest2'],
        2: [],
        3: ['Harvest3'],
        4: []
      }
    }
  }
  ```

#### Função getHarvestInfo Atualizada
- Aceita parâmetro `week` opcional
- Retorna colheitas da semana específica quando fornecido
- Mantém compatibilidade com chamadas sem semana (retorna todas)

### Persistência
- **localStorage**: Época calibrada salva em `wurm_calibrated_epoch`
- **Fallback automático**: Se não houver calibração, usa época padrão
- **Reset simples**: Remover do localStorage para voltar ao padrão

## 📦 Novos Recursos

### Calibração
- **Modal de calibração**: Interface completa para calibrar tempo
- **Parsing de comandos**: Extração automática de dados do `/time`
- **Cálculo de época**: Algoritmo preciso para calcular nova época
- **Validação robusta**: Verificação de formato, valores e starfalls

### Calendário
- **Colheitas por semana**: Estrutura detalhada por semana
- **Dados oficiais**: Baseado na tabela oficial do Wurmpedia
- **Exibição dinâmica**: Atualiza automaticamente com o tempo do Wurm

## 🎯 Impacto

### Experiência do Usuário
- **Precisão melhorada**: Calibração permite sincronização perfeita com o jogo
- **Informações atualizadas**: Calendário de colheitas com dados oficiais
- **Interface intuitiva**: Modal de calibração fácil de usar
- **Feedback claro**: Mensagens e previews ajudam o usuário

### Funcionalidade
- **Calibração flexível**: Usuários podem ajustar quando necessário
- **Dados precisos**: Calendário de colheitas baseado em fonte oficial
- **Planejamento melhorado**: Saber exatamente quando colher cada item

### Manutenibilidade
- **Código organizado**: Funções bem estruturadas e documentadas
- **Validação robusta**: Tratamento de erros completo
- **Extensível**: Fácil adicionar novos starfalls ou colheitas

## 📈 Estatísticas

- **Novos componentes**: 1 (CalibrationModal)
- **Novos utilitários**: 2 funções principais (parseTimeCommand, calculateEpochFromCalibration)
- **Componentes atualizados**: 2 (CalendarTab, wurmTime.js)
- **Arquivos CSS adicionados**: 1 (CalibrationModal.css)
- **Traduções adicionadas**: 3 idiomas (PT, EN, RU)
- **Starfalls mapeados**: 8 (com colheitas por semana)
- **Linhas de código**: ~500 linhas adicionadas

## 🐛 Correções

### Interface
- ✅ Formatação de data/hora mais legível no modal de calibração
- ✅ Preview de calibração funcionando corretamente
- ✅ Validação de formato do comando `/time`

### Funcionalidade
- ✅ Cálculo de época corrigido e testado
- ✅ Suporte a época customizada funcionando
- ✅ Calendário de colheitas exibindo dados corretos por semana

## 🔄 Mudanças de Comportamento

### Calibração
- **Antes**: Época fixa, não ajustável
- **Agora**: Época calibrada via modal (modo desenvolvedor)

### Calendário de Colheitas
- **Antes**: Colheitas genéricas por starfall
- **Agora**: Colheitas específicas por semana dentro de cada starfall

## 📝 Notas para Desenvolvedores

### Como Usar a Calibração
1. Ativar Modo Desenvolvedor nas configurações
2. Ir para a aba "Calendário"
3. Clicar no botão "Calibrar" (ao lado de "Hoje")
4. Executar `/time` no jogo
5. Colar o resultado no campo apropriado
6. Verificar o preview
7. Clicar em "Calibrar" para salvar

### Formato Esperado
```
[23:00:02] It is 01:49:11 on day of the Wurm in week 1 of the starfall of the Leaf in the year of 1140.
```

### Resetar Calibração
- Clicar em "Resetar" no modal de calibração
- Ou remover manualmente `wurm_calibrated_epoch` do localStorage

---

**Nota**: Esta versão adiciona funcionalidades avançadas de calibração e atualiza o calendário de colheitas com dados oficiais. O sistema agora oferece precisão máxima no tempo do Wurm e informações detalhadas sobre quando cada colheita está disponível.

