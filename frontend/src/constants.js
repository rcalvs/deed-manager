// Constantes compartilhadas para tipos de itens

export const ITEM_TYPES = [
  { value: 'stone_brick', label: 'Stone Brick' },
  { value: 'colossus_brick', label: 'Colossus Brick' },
  { value: 'slate_brick', label: 'Slate Brick' },
  { value: 'marble_brick', label: 'Marble Bricks' },
  { value: 'sandstone_brick', label: 'Sandstone Brick' },
  { value: 'pottery_brick', label: 'Pottery Bricks' },
  { value: 'clay', label: 'Clay' },
  { value: 'sand', label: 'Sand' },
  { value: 'dirt', label: 'Dirt' },
  { value: 'stone_shard', label: 'Stone Shards' },
  { value: 'slate_shard', label: 'Slate Shards' },
  { value: 'marble_shard', label: 'Marble Shards' },
  { value: 'sandstone_shard', label: 'Sandstone Shards' },
  { value: 'mortar', label: 'Mortar' },
  // Metals
  { value: 'iron_lump', label: 'Iron Lump' },
  { value: 'copper_lump', label: 'Copper Lump' },
  { value: 'silver_lump', label: 'Silver Lump' },
  { value: 'gold_lump', label: 'Gold Lump' },
  { value: 'tin_lump', label: 'Tin Lump' },
  { value: 'zinc_lump', label: 'Zinc Lump' },
  { value: 'lead_lump', label: 'Lead Lump' },
  { value: 'empyrean_lump', label: 'Empyrean Lump' },
  { value: 'steel_lump', label: 'Steel Lump' },
  { value: 'brass_lump', label: 'Brass Lump' },
  { value: 'bronze_lump', label: 'Bronze Lump' },
  { value: 'electrum_lump', label: 'Electrum Lump' },
  { value: 'glimmersteel_lump', label: 'Glimmersteel Lump' },
  { value: 'adamantine_lump', label: 'Adamantine Lump' },
  { value: 'seryll_lump', label: 'Seryll Lump' },
  // Ores
  { value: 'iron_ore', label: 'Iron Ore' },
  { value: 'copper_ore', label: 'Copper Ore' },
  { value: 'silver_ore', label: 'Silver Ore' },
  { value: 'gold_ore', label: 'Gold Ore' },
  { value: 'tin_ore', label: 'Tin Ore' },
  { value: 'zinc_ore', label: 'Zinc Ore' },
  { value: 'lead_ore', label: 'Lead Ore' },
  // Smithing
  { value: 'small_nail', label: 'Small Nail' },
  { value: 'large_nail', label: 'Large Nail' },
  { value: 'ribbon', label: 'Ribbon' },
]

export const ITEM_TYPE_LABELS = { 
  stone_brick: 'Stone Brick',
  colossus_brick: 'Colossus Brick',
  slate_brick: 'Slate Brick',
  marble_brick: 'Marble Bricks',
  sandstone_brick: 'Sandstone Brick',
  pottery_brick: 'Pottery Bricks',
  clay: 'Clay',
  sand: 'Sand',
  dirt: 'Dirt',
  stone_shard: 'Stone Shards',
  slate_shard: 'Slate Shards',
  marble_shard: 'Marble Shards',
  sandstone_shard: 'Sandstone Shards',
  mortar: 'Mortar',
  // Metals
  iron_lump: 'Iron Lump',
  copper_lump: 'Copper Lump',
  silver_lump: 'Silver Lump',
  gold_lump: 'Gold Lump',
  tin_lump: 'Tin Lump',
  zinc_lump: 'Zinc Lump',
  lead_lump: 'Lead Lump',
  empyrean_lump: 'Empyrean Lump',
  steel_lump: 'Steel Lump',
  brass_lump: 'Brass Lump',
  bronze_lump: 'Bronze Lump',
  electrum_lump: 'Electrum Lump',
  glimmersteel_lump: 'Glimmersteel Lump',
  adamantine_lump: 'Adamantine Lump',
  seryll_lump: 'Seryll Lump',
  // Ores
  iron_ore: 'Iron Ore',
  copper_ore: 'Copper Ore',
  silver_ore: 'Silver Ore',
  gold_ore: 'Gold Ore',
  tin_ore: 'Tin Ore',
  zinc_ore: 'Zinc Ore',
  lead_ore: 'Lead Ore',
  // Smithing
  small_nail: 'Small Nail',
  large_nail: 'Large Nail',
  ribbon: 'Ribbon',
}

// Mapeamento de categorias para cada tipo de item
export const ITEM_CATEGORIES = {
  stone_shard: 'Shards',
  slate_shard: 'Shards',
  marble_shard: 'Shards',
  sandstone_shard: 'Shards',
  stone_brick: 'Bricks',
  colossus_brick: 'Bricks',
  pottery_brick: 'Bricks',
  slate_brick: 'Bricks',
  marble_brick: 'Bricks',
  sandstone_brick: 'Bricks',
  clay: 'Construction',
  sand: 'Construction',
  dirt: 'Construction',
  mortar: 'Construction',
  // Metals
  iron_lump: 'Metals',
  copper_lump: 'Metals',
  silver_lump: 'Metals',
  gold_lump: 'Metals',
  tin_lump: 'Metals',
  zinc_lump: 'Metals',
  lead_lump: 'Metals',
  empyrean_lump: 'Metals',
  steel_lump: 'Metals',
  brass_lump: 'Metals',
  bronze_lump: 'Metals',
  electrum_lump: 'Metals',
  glimmersteel_lump: 'Metals',
  adamantine_lump: 'Metals',
  seryll_lump: 'Metals',
  // Ores
  iron_ore: 'Ores',
  copper_ore: 'Ores',
  silver_ore: 'Ores',
  gold_ore: 'Ores',
  tin_ore: 'Ores',
  zinc_ore: 'Ores',
  lead_ore: 'Ores',
  // Smithing
  small_nail: 'Smithing',
  large_nail: 'Smithing',
  ribbon: 'Smithing',
}

// Lista de todas as categorias disponíveis
export const CATEGORIES = ['Shards', 'Bricks', 'Construction', 'Metals', 'Ores', 'Smithing']

// Cores para os gráficos (cores específicas para cada tipo)
const colorMap = {
  stone_brick: 'rgba(139, 69, 19, 1)',        // Marrom - Stone Brick
  colossus_brick: 'rgba(105, 105, 105, 1)',  // Cinza escuro - Colossus Brick
  slate_brick: 'rgba(112, 128, 144, 1)',      // Cinza ardósia - Slate Brick
  marble_brick: 'rgba(255, 250, 250, 1)',     // Branco neve - Marble Brick
  sandstone_brick: 'rgba(210, 180, 140, 1)',  // Tan - Sandstone Brick
  pottery_brick: 'rgba(160, 82, 45, 1)',      // Sienna - Pottery Brick
  clay: 'rgba(205, 133, 63, 1)',              // Peru - Clay
  sand: 'rgba(238, 203, 173, 1)',             // Pêssego - Sand
  dirt: 'rgba(101, 67, 33, 1)',               // Marrom escuro - Dirt
  stone_shard: 'rgba(169, 169, 169, 1)',     // Cinza - Stone Shard
  slate_shard: 'rgba(119, 136, 153, 1)',     // Cinza claro - Slate Shard
  marble_shard: 'rgba(220, 220, 220, 1)',    // Cinza claro - Marble Shard
  sandstone_shard: 'rgba(184, 134, 11, 1)',  // Dourado escuro - Sandstone Shard
  mortar: 'rgba(128, 128, 128, 1)',            // Cinza - Mortar
  // Metals
  iron_lump: 'rgba(192, 192, 192, 1)',        // Prata - Iron
  copper_lump: 'rgba(184, 115, 51, 1)',       // Cobre - Copper
  silver_lump: 'rgba(192, 192, 192, 1)',      // Prata brilhante - Silver
  gold_lump: 'rgba(255, 215, 0, 1)',          // Dourado - Gold
  tin_lump: 'rgba(200, 200, 200, 1)',         // Cinza claro - Tin
  zinc_lump: 'rgba(220, 220, 220, 1)',        // Cinza prateado - Zinc
  lead_lump: 'rgba(64, 64, 64, 1)',           // Cinza escuro - Lead
  empyrean_lump: 'rgba(138, 43, 226, 1)',     // Roxo - Empyrean
  steel_lump: 'rgba(128, 128, 128, 1)',        // Cinza aço - Steel
  brass_lump: 'rgba(181, 166, 66, 1)',        // Latão - Brass
  bronze_lump: 'rgba(205, 127, 50, 1)',       // Bronze - Bronze
  electrum_lump: 'rgba(255, 215, 0, 1)',      // Dourado eletro - Electrum
  glimmersteel_lump: 'rgba(176, 196, 222, 1)', // Azul aço - Glimmersteel
  adamantine_lump: 'rgba(75, 0, 130, 1)',     // Índigo escuro - Adamantine
  seryll_lump: 'rgba(255, 20, 147, 1)',       // Rosa choque - Seryll
  // Ores
  iron_ore: 'rgba(139, 69, 19, 1)',           // Marrom ferrugem - Iron Ore
  copper_ore: 'rgba(160, 82, 45, 1)',         // Marrom cobre - Copper Ore
  silver_ore: 'rgba(192, 192, 192, 1)',       // Prata - Silver Ore
  gold_ore: 'rgba(218, 165, 32, 1)',          // Dourado - Gold Ore
  tin_ore: 'rgba(169, 169, 169, 1)',          // Cinza - Tin Ore
  zinc_ore: 'rgba(200, 200, 200, 1)',         // Cinza claro - Zinc Ore
  lead_ore: 'rgba(105, 105, 105, 1)',         // Cinza escuro - Lead Ore
  // Smithing
  small_nail: 'rgba(192, 192, 192, 1)',       // Prata - Small Nail
  large_nail: 'rgba(128, 128, 128, 1)',       // Cinza - Large Nail
  ribbon: 'rgba(255, 20, 147, 1)',             // Rosa - Ribbon
}

export const ITEM_TYPE_COLORS = {}
ITEM_TYPES.forEach((item) => {
  ITEM_TYPE_COLORS[item.value] = colorMap[item.value] || 'rgba(100, 149, 237, 1)'
})

