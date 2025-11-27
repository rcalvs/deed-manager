# Release v0.2.3 - Expansão de Itens e Melhorias de Organização

## 🎉 Novidades Principais

### 📦 Expansão Massiva do Catálogo de Itens
Adição de **116 novos itens** ao sistema de estoque, organizados em 4 novas categorias:

#### 🚜 Categoria Farm (28 itens)
Itens agrícolas e de cultivo:
- **Vegetais**: Potato, Carrot, Tomato, Cabbage, Corn, Lettuce, Onion, Cucumber, Pumpkin
- **Grãos**: Wheat, Barley, Rye, Oat, Rice, Corn
- **Outros**: Cotton, Wemp, Reed, Hay, Strawberries, Pea Pod, Garlic, Sugar Beet
- **Cogumelos**: Black, Green, Yellow, Blue, Brown, Red Mushroom

#### 🌿 Categoria Garden (18 itens)
Ervas, especiarias e plantas especiais:
- **Ervas**: Basil, Fennel, Lovage, Mint, Oregano, Parsley, Rosemary, Sage, Thyme
- **Especiarias**: Cumin, Ginger, Paprika, Turmeric
- **Especiais**: Belladonna, Woad, Green Coffee Beans, Tea Seeds, Cacao Beans

#### 🦌 Categoria Animal (44 itens)
Recursos de animais e criaturas:
- **Carnes**: Bear, Beef, Canine, Dragon, Feline, Fowl, Game, Horse, Human, Humanoid, Insect, Lamb, Pork, Seafood, Snake, Toughat Meat
- **Partes de animais**: Fat, Hide, Bladder, Eye, Feather, Fur, Gland, Heart, Hoof, Horn, Long Horn, Paw, Pelt, Skull, Tail, Tooth, Wool
- **Especiais**: Cochineal, Crab Meat, Dragon Scale, Drake Hide, Fish Fillet, Flint, Goblin Skull, Octopus Ink Sac, Small Tortoise Shell, Unicorn Twisted Horn

#### 🍎 Categoria Fruits (16 itens)
Frutas e nozes:
- **Frutas**: Apples, Cherries, Blue Grapes, Green Grapes, Lemons, Olives, Oranges, Blueberries, Lingonberries, Strawberries, Raspberries
- **Nozes**: Acorns, Chestnuts, Hazelnuts, Pinenuts, Walnuts

### 🏷️ Sistema de Categorização para Notes e Locations
Implementação de categorização opcional para melhor organização:

#### Funcionalidades
- **Campo de categoria opcional**: Notes e Locations podem ser categorizadas usando as mesmas categorias do estoque
- **Integração completa**: Categorias disponíveis: Shards, Bricks, Construction, Metals, Ores, Smithing, Wood, Farm, Garden, Animal, Fruits
- **Persistência**: Categoria salva no banco de dados e mantida entre sessões
- **Edição**: Categoria pode ser alterada a qualquer momento ao editar uma nota ou localização

#### Benefícios
- **Organização melhorada**: Agrupar notas e localizações por categoria facilita a navegação
- **Consistência**: Mesmo sistema de categorias usado em todo o aplicativo
- **Flexibilidade**: Campo opcional permite uso sem categorização quando não necessário

### 🔍 Sistema de Busca e Filtro Avançado
Implementação completa de busca e filtro para Notes e Locations:

#### Busca por Texto
- **Busca em tempo real**: Filtro instantâneo conforme o usuário digita
- **Busca abrangente**: 
  - **Notes**: Busca em título e descrição
  - **Locations**: Busca em nome e descrição
- **Interface intuitiva**: Campo de busca com ícone de lupa e botão para limpar
- **Feedback visual**: Ícone de busca e botão de limpar visíveis

#### Filtro por Categoria
- **Select dropdown**: Filtro por categoria com todas as opções disponíveis
- **Opção "Todas"**: Permite remover o filtro de categoria
- **Combinação de filtros**: Busca e categoria podem ser usados simultaneamente

#### Otimização
- **useMemo**: Filtros otimizados com React.useMemo para melhor performance
- **Filtros combinados**: Busca e categoria funcionam em conjunto
- **Mensagens de estado**: Diferenciação entre "sem itens" e "sem resultados do filtro"

### 🎨 Melhorias de Layout e UX

#### Formulários Mais Compactos
- **Espaçamento reduzido**: Formulários de Notes e Locations agora seguem o padrão compacto do StockForm
- **Consistência visual**: Mesmo estilo de espaçamento em todos os formulários
- **Melhor aproveitamento**: Mais conteúdo visível sem scroll excessivo

#### Ajustes de Estilo
- **Padding reduzido**: Container de formulário de `1.5rem` para `1.25rem`
- **Gap reduzido**: Espaçamento entre campos de `1rem` para `0.1rem`
- **Altura padronizada**: Inputs e selects com altura fixa de `2.5rem`
- **Margens otimizadas**: Redução de margens para layout mais compacto

## 🔧 Melhorias Técnicas

### Backend (Go)

#### Novos Modelos e Categorias
- **4 novas categorias**: `CategoryFarm`, `CategoryGarden`, `CategoryAnimal`, `CategoryFruits`
- **116 novos ItemType**: Constantes para todos os novos itens
- **Função GetCategory atualizada**: Mapeamento completo de todos os itens para suas categorias
- **Migração de banco**: Coluna `category` adicionada às tabelas `notes` e `locations`

#### Serviços Atualizados
- **NotesService**: Métodos atualizados para incluir categoria
  - `CreateNote`, `UpdateNote`, `GetNote`, `GetAllNotes`
- **LocationsService**: Métodos atualizados para incluir categoria
  - `CreateLocation`, `UpdateLocation`, `GetLocation`, `GetAllLocations`

### Frontend (React)

#### Novos Componentes e Funcionalidades
- **Sistema de filtro**: Implementação completa de busca e filtro por categoria
- **useMemo para performance**: Otimização de filtros com React.useMemo
- **Estados de filtro**: Gerenciamento de `searchText` e `selectedCategory`

#### Estilos CSS
- **Filtros estilizados**: Estilos consistentes com StockTable
- **Layout responsivo**: Filtros se adaptam a diferentes tamanhos de tela
- **Ícones e botões**: Estilização completa dos elementos de busca

## 📝 Estrutura de Dados

### Novos Itens por Categoria

#### Farm (28 itens)
```json
{
  "potato": "Potato",
  "cotton": "Cotton",
  "rye": "Rye",
  "wemp": "Wemp",
  "cucumber": "Cucumber",
  "oat": "Oat",
  "pumpkin": "Pumpkin",
  "barley": "Barley",
  "reed": "Reed",
  "carrot": "Carrot",
  "hay": "Hay",
  "wheat": "Wheat",
  "cabbage": "Cabbage",
  "corn": "Corn",
  "tomato": "Tomato",
  "lettuce": "Lettuce",
  "onion": "Onion",
  "strawberries": "Strawberries",
  "pea_pod": "Pea Pod",
  "garlic": "Garlic",
  "rice": "Rice",
  "sugar_beet": "Sugar Beet",
  "black_mushroom": "Black Mushroom",
  "green_mushroom": "Green Mushroom",
  "yellow_mushroom": "Yellow Mushroom",
  "blue_mushroom": "Blue Mushroom",
  "brown_mushroom": "Brown Mushroom",
  "red_mushroom": "Red Mushroom"
}
```

#### Garden (18 itens)
```json
{
  "basil": "Basil",
  "belladonna": "Belladonna",
  "fennel": "Fennel",
  "lovage": "Lovage",
  "mint": "Mint",
  "oregano": "Oregano",
  "parsley": "Parsley",
  "rosemary": "Rosemary",
  "sage": "Sage",
  "thyme": "Thyme",
  "cumin": "Cumin",
  "ginger": "Ginger",
  "paprika": "Paprika",
  "turmeric": "Turmeric",
  "woad": "Woad",
  "green_coffee_beans": "Green Coffee Beans",
  "tea_seeds": "Tea Seeds",
  "cacao_beans": "Cacao Beans"
}
```

#### Animal (44 itens)
```json
{
  "fat": "Fat",
  "hide": "Hide",
  "bladder": "Bladder",
  "cochineal": "Cochineal",
  "crab_meat": "Crab Meat",
  "dragon_scale": "Dragon Scale",
  "drake_hide": "Drake Hide",
  "eye": "Eye",
  "feather": "Feather",
  "fish_fillet": "Fish Fillet",
  "flint": "Flint",
  "fur": "Fur",
  "gland": "Gland",
  "goblin_skull": "Goblin Skull",
  "heart": "Heart",
  "hoof": "Hoof",
  "horn": "Horn",
  "long_horn": "Long Horn",
  "bear_meat": "Bear Meat",
  "beef_meat": "Beef Meat",
  "canine_meat": "Canine Meat",
  "dragon_meat": "Dragon Meat",
  "feline_meat": "Feline Meat",
  "fowl_meat": "Fowl Meat",
  "game_meat": "Game Meat",
  "horse_meat": "Horse Meat",
  "human_meat": "Human Meat",
  "humanoid_meat": "Humanoid Meat",
  "insect_meat": "Insect Meat",
  "lamb_meat": "Lamb Meat",
  "pork_meat": "Pork Meat",
  "seafood_meat": "Seafood Meat",
  "snake_meat": "Snake Meat",
  "toughat_meat": "Toughat Meat",
  "octopus_ink_sac": "Octopus Ink Sac",
  "paw": "Paw",
  "pelt": "Pelt",
  "skull": "Skull",
  "small_tortoise_shell": "Small Tortoise Shell",
  "tail": "Tail",
  "tooth": "Tooth",
  "unicorn_twisted_horn": "Unicorn Twisted Horn",
  "wool": "Wool"
}
```

#### Fruits (16 itens)
```json
{
  "apples": "Apples",
  "cherries": "Cherries",
  "blue_grapes": "Blue Grapes",
  "green_grapes": "Green Grapes",
  "lemons": "Lemons",
  "olives": "Olives",
  "oranges": "Oranges",
  "blueberries": "Blueberries",
  "lingonberries": "Lingonberries",
  "strawberries": "Strawberries",
  "raspberries": "Raspberries",
  "acorns": "Acorns",
  "chestnuts": "Chestnuts",
  "hazelnuts": "Hazelnuts",
  "pinenuts": "Pinenuts",
  "walnuts": "Walnuts"
}
```

## 🐛 Correções e Melhorias

### Correções
- **Categorização de strawberries**: Corrigido para categoria Farm (não Fruits)
- **Duplicação de constantes**: Removida duplicação de `ItemTypeStrawberries` no backend
- **Versão no main.go**: Corrigido formato da versão (removido prefixo "v")

### Melhorias de UX
- **Formulários compactos**: Layout mais eficiente e consistente
- **Busca intuitiva**: Interface clara e fácil de usar
- **Filtros combinados**: Possibilidade de usar múltiplos filtros simultaneamente
- **Feedback visual**: Mensagens claras sobre estado dos filtros

## 📦 Novos Recursos

### Backend
- **116 novos tipos de item**: Expansão significativa do catálogo
- **4 novas categorias**: Farm, Garden, Animal, Fruits
- **Campo category**: Adicionado aos modelos Note e Location
- **Migração de banco**: Suporte a categoria em notas e localizações

### Frontend
- **Sistema de busca**: Implementação completa para Notes e Locations
- **Filtro por categoria**: Select dropdown com todas as categorias
- **Otimização de performance**: Uso de useMemo para filtros
- **Estilos de filtro**: CSS consistente com o resto da aplicação

## 📈 Estatísticas

- **Novos itens adicionados**: 116
- **Novas categorias**: 4 (Farm, Garden, Animal, Fruits)
- **Total de categorias**: 11 (incluindo as 7 anteriores)
- **Total de itens no sistema**: ~336 (220 anteriores + 116 novos)
- **Campos de categoria**: 2 (Notes e Locations)
- **Sistemas de filtro**: 2 (Notes e Locations)
- **Traduções adicionadas**: 4 novas chaves (searchPlaceholder, searchLocationPlaceholder, noNotesFiltered, noLocationsFiltered)

## 🎯 Impacto

### Funcionalidade
- **Cobertura expandida**: Sistema agora suporta praticamente todos os itens do jogo
- **Organização melhorada**: Categorização permite melhor gestão de notas e localizações
- **Busca eficiente**: Encontrar informações rapidamente com sistema de busca

### Experiência do Usuário
- **Mais opções**: Usuários podem gerenciar muito mais tipos de itens
- **Navegação facilitada**: Busca e filtros tornam a localização de informações mais rápida
- **Consistência**: Mesmo padrão de categorias em todo o aplicativo

### Manutenibilidade
- **Estrutura escalável**: Fácil adicionar novos itens e categorias
- **Código organizado**: Filtros e busca implementados de forma reutilizável
- **Performance otimizada**: Uso de useMemo garante filtros eficientes

---

**Nota**: Esta versão expande significativamente as capacidades do Wurm Manager, adicionando suporte para uma ampla gama de itens do jogo e melhorando a organização através de categorização e busca. Os usuários agora podem gerenciar praticamente todos os tipos de recursos do Wurm Online de forma organizada e eficiente.

