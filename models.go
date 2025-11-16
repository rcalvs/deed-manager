package main

import "time"

// ItemType representa o tipo de item de bulk
type ItemType string

const (
	ItemTypeStoneBrick     ItemType = "stone_brick"     // Stone Brick
	ItemTypeColossusBrick  ItemType = "colossus_brick"  // Colossus Brick
	ItemTypeSlateBrick     ItemType = "slate_brick"     // Slate Brick
	ItemTypeMarbleBrick    ItemType = "marble_brick"    // Marble Bricks
	ItemTypeSandstoneBrick ItemType = "sandstone_brick" // Sandstone Brick
	ItemTypePotteryBrick   ItemType = "pottery_brick"   // Pottery Bricks
	ItemTypeClay           ItemType = "clay"            // Clay
	ItemTypeSand           ItemType = "sand"            // Sand
	ItemTypeDirt           ItemType = "dirt"            // Dirt
	ItemTypeStoneShard     ItemType = "stone_shard"     // Stone Shards
	ItemTypeSlateShard     ItemType = "slate_shard"     // Slate Shards
	ItemTypeMarbleShard    ItemType = "marble_shard"    // Marble Shards
	ItemTypeSandstoneShard ItemType = "sandstone_shard" // Sandstone Shards
	ItemTypeMortar         ItemType = "mortar"          // Mortar
	// Metals
	ItemTypeIronLump         ItemType = "iron_lump"         // Iron Lump
	ItemTypeCopperLump       ItemType = "copper_lump"       // Copper Lump
	ItemTypeSilverLump       ItemType = "silver_lump"       // Silver Lump
	ItemTypeGoldLump         ItemType = "gold_lump"         // Gold Lump
	ItemTypeTinLump          ItemType = "tin_lump"          // Tin Lump
	ItemTypeZincLump         ItemType = "zinc_lump"         // Zinc Lump
	ItemTypeLeadLump         ItemType = "lead_lump"         // Lead Lump
	ItemTypeEmpyreanLump     ItemType = "empyrean_lump"     // Empyrean Lump
	ItemTypeSteelLump        ItemType = "steel_lump"        // Steel Lump
	ItemTypeBrassLump        ItemType = "brass_lump"        // Brass Lump
	ItemTypeBronzeLump       ItemType = "bronze_lump"       // Bronze Lump
	ItemTypeElectrumLump     ItemType = "electrum_lump"     // Electrum Lump
	ItemTypeGlimmersteelLump ItemType = "glimmersteel_lump" // Glimmersteel Lump
	ItemTypeAdamantineLump   ItemType = "adamantine_lump"   // Adamantine Lump
	ItemTypeSeryllLump       ItemType = "seryll_lump"       // Seryll Lump
	// Ores
	ItemTypeIronOre   ItemType = "iron_ore"   // Iron Ore
	ItemTypeCopperOre ItemType = "copper_ore" // Copper Ore
	ItemTypeSilverOre ItemType = "silver_ore" // Silver Ore
	ItemTypeGoldOre   ItemType = "gold_ore"   // Gold Ore
	ItemTypeTinOre    ItemType = "tin_ore"    // Tin Ore
	ItemTypeZincOre   ItemType = "zinc_ore"   // Zinc Ore
	ItemTypeLeadOre   ItemType = "lead_ore"   // Lead Ore
	// Smithing
	ItemTypeSmallNail ItemType = "small_nail" // Small Nail
	ItemTypeLargeNail ItemType = "large_nail" // Large Nail
	ItemTypeRibbon    ItemType = "ribbon"     // Ribbon
)

// Category representa a categoria de um item
type Category string

const (
	CategoryShards       Category = "Shards"
	CategoryBricks       Category = "Bricks"
	CategoryConstruction Category = "Construction"
	CategoryMetals       Category = "Metals"
	CategoryOres         Category = "Ores"
	CategorySmithing     Category = "Smithing"
)

// GetCategory retorna a categoria de um tipo de item
func GetCategory(itemType ItemType) Category {
	switch itemType {
	case ItemTypeStoneShard, ItemTypeSlateShard, ItemTypeMarbleShard, ItemTypeSandstoneShard:
		return CategoryShards
	case ItemTypeStoneBrick, ItemTypeColossusBrick, ItemTypePotteryBrick, ItemTypeSlateBrick, ItemTypeMarbleBrick, ItemTypeSandstoneBrick:
		return CategoryBricks
	case ItemTypeClay, ItemTypeSand, ItemTypeDirt, ItemTypeMortar:
		return CategoryConstruction
	case ItemTypeIronLump, ItemTypeCopperLump, ItemTypeSilverLump, ItemTypeGoldLump, ItemTypeTinLump, ItemTypeZincLump, ItemTypeLeadLump, ItemTypeEmpyreanLump, ItemTypeSteelLump, ItemTypeBrassLump, ItemTypeBronzeLump, ItemTypeElectrumLump, ItemTypeGlimmersteelLump, ItemTypeAdamantineLump, ItemTypeSeryllLump:
		return CategoryMetals
	case ItemTypeIronOre, ItemTypeCopperOre, ItemTypeSilverOre, ItemTypeGoldOre, ItemTypeTinOre, ItemTypeZincOre, ItemTypeLeadOre:
		return CategoryOres
	case ItemTypeSmallNail, ItemTypeLargeNail, ItemTypeRibbon:
		return CategorySmithing
	default:
		return CategoryConstruction // Default
	}
}

// StockItem representa um item no estoque
type StockItem struct {
	ID        int64     `json:"id"`
	Type      ItemType  `json:"type"`
	Category  Category  `json:"category"`
	Quality   float64   `json:"quality"`
	Quantity  int       `json:"quantity"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// StockEntry representa uma entrada no histórico de estoque
type StockEntry struct {
	ID        int64     `json:"id"`
	ItemID    int64     `json:"itemId"`
	Type      ItemType  `json:"type"`
	Quality   float64   `json:"quality"`
	Quantity  int       `json:"quantity"`
	Change    int       `json:"change"` // Mudança na quantidade (positivo para adição, negativo para remoção)
	Timestamp time.Time `json:"timestamp"`
}

// StockSummary representa um resumo do estoque por tipo e qualidade
type StockSummary struct {
	Type     ItemType `json:"type"`
	Quality  float64  `json:"quality"`
	Quantity int      `json:"quantity"`
}

// StockHistoryPoint representa um ponto no histórico para gráficos
type StockHistoryPoint struct {
	Date     string   `json:"date"` // Data formatada
	Type     ItemType `json:"type"`
	Quality  float64  `json:"quality"`
	Quantity int      `json:"quantity"`
}
