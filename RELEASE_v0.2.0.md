# Release v0.2.0 - Expansão de Categorias e Melhorias de Interface

## 🎉 Novidades Principais

### ✨ Sistema de Categorias
Implementação completa de sistema de categorização para organização dos itens:
- **7 categorias principais**: Shards, Bricks, Construction, Metals, Ores, Smithing, Wood
- **Badges visuais** para identificação rápida de categorias na tabela
- **Filtros por categoria** sincronizados entre tabela e gráficos

### 🌳 Categoria Wood - 175 Novos Tipos de Itens
Adição massiva de itens de madeira com suporte a:
- **25 tipos de madeira**: Apple, Birch, Cedar, Cherry, Chestnut, Fir, Lemon, Linden, Maple, Oak, Oleander, Olive, Orange, Pine, Walnut, Willow, Blueberry, Raspberry, Grape, Hazelnut, Thorn, Lavender, Camelia, Rose, Lingoberry
- **7 tipos de item por madeira**: Log, Plank, Wooden Beam, Shaft, Branch, Peg, Tenon
- **Total**: 175 novos tipos de itens de madeira

### 🔍 Sistema de Busca Avançado
- **Busca na tabela**: Filtro por texto para encontrar itens rapidamente no estoque atual
- **Busca no formulário**: Campo de busca para facilitar seleção entre 220+ tipos de itens
- Busca case-insensitive que funciona tanto no nome quanto no código do item

### 🔄 Conversão de Ores para Lumps
Nova funcionalidade para conversão automática:
- Botão de conversão ao lado de itens de Ore
- Modal para especificar quantidade a converter
- Conversão 1:1 mantendo a qualidade original
- Suporte para todos os tipos de Ore (Iron, Copper, Silver, Gold, Tin, Zinc, Lead)

### 📊 Melhorias nos Gráficos
- **Sincronização de filtros**: Filtros aplicados na tabela refletem automaticamente nos gráficos
- **Quantidades acumuladas**: Gráfico de evolução agora mostra valores acumulados ao longo do tempo
- Filtros funcionam tanto por categoria quanto por texto de busca

### 🛠️ Modo Desenvolvedor
Novo painel de configurações com:
- Toggle para ativar/desativar modo desenvolvedor
- Campo de data customizada para testes de gráficos
- Botão para limpar banco de dados (com confirmação dupla)
- Configurações salvas em localStorage

### 🎨 Melhorias de Interface
- **Sistema de abas**: Organização modular para futuras expansões
- **Espaçamentos otimizados**: Layout mais conciso e compacto
- **Badges de categoria**: Identificação visual rápida dos tipos de itens
- **Contador de resultados**: Mostra quantos itens foram encontrados nas buscas

## 📦 Novos Tipos de Itens Adicionados

### Metals (15 tipos)
Iron Lump, Copper Lump, Silver Lump, Gold Lump, Tin Lump, Zinc Lump, Lead Lump, Empyrean Lump, Steel Lump, Brass Lump, Bronze Lump, Electrum Lump, Glimmersteel Lump, Adamantine Lump, Seryll Lump

### Ores (7 tipos)
Iron Ore, Copper Ore, Silver Ore, Gold Ore, Tin Ore, Zinc Ore, Lead Ore

### Smithing (3 tipos)
Small Nail, Large Nail, Ribbon

### Wood (175 tipos)
Todos os itens de madeira (25 madeiras × 7 tipos de item)

## 🔧 Melhorias Técnicas

- Refatoração do código para melhor organização modular
- Componentes reutilizáveis (Tabs, Settings, ConvertModal)
- Otimização de performance com useMemo para filtros
- Melhorias na estrutura de dados e constantes centralizadas

## 📝 Mudanças de API

- Novo método: `ConvertOreToLump(oreID, quantity)` - Converte Ores em Lumps
- Novo método: `ClearDatabase()` - Limpa todo o banco de dados
- Melhorias no método `GetStockHistory()` - Agora calcula quantidades acumuladas

## 🐛 Correções

- Corrigido cálculo de quantidades acumuladas no gráfico de evolução
- Melhorado tratamento de datas NULL no histórico
- Ajustes de espaçamento e layout para melhor usabilidade

## 📈 Estatísticas

- **Total de tipos de itens**: 220+ (anteriormente ~17)
- **Categorias**: 7 (anteriormente sem categorização)
- **Componentes React**: 8 (anteriormente 3)
- **Funcionalidades de busca**: 2 (tabela + formulário)

## 🚀 Próximos Passos

Esta versão estabelece a base para futuras expansões:
- Sistema de abas pronto para novas funcionalidades
- Arquitetura modular facilita adição de novos recursos
- Categorização permite organização de novos tipos de itens

---

**Nota**: Esta é uma versão de expansão significativa que adiciona suporte massivo para itens de madeira e melhora substancialmente a experiência do usuário com filtros, buscas e organização visual.

