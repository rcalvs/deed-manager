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
	// Wood
	ItemTypeAppleLog         ItemType = "apple_log"          // Apple Log
	ItemTypeApplePlank       ItemType = "apple_plank"        // Apple Plank
	ItemTypeAppleWoodenBeam  ItemType = "apple_wooden_beam"  // Apple Wooden Beam
	ItemTypeAppleShaft       ItemType = "apple_shaft"        // Apple Shaft
	ItemTypeAppleBranch      ItemType = "apple_branch"       // Apple Branch
	ItemTypeApplePeg         ItemType = "apple_peg"          // Apple Peg
	ItemTypeAppleTenon       ItemType = "apple_tenon"        // Apple Tenon
	ItemTypeBirchLog          ItemType = "birch_log"         // Birch Log
	ItemTypeBirchPlank       ItemType = "birch_plank"        // Birch Plank
	ItemTypeBirchWoodenBeam  ItemType = "birch_wooden_beam"  // Birch Wooden Beam
	ItemTypeBirchShaft       ItemType = "birch_shaft"        // Birch Shaft
	ItemTypeBirchBranch      ItemType = "birch_branch"       // Birch Branch
	ItemTypeBirchPeg         ItemType = "birch_peg"          // Birch Peg
	ItemTypeBirchTenon       ItemType = "birch_tenon"        // Birch Tenon
	ItemTypeCedarLog         ItemType = "cedar_log"          // Cedar Log
	ItemTypeCedarPlank       ItemType = "cedar_plank"        // Cedar Plank
	ItemTypeCedarWoodenBeam  ItemType = "cedar_wooden_beam"  // Cedar Wooden Beam
	ItemTypeCedarShaft       ItemType = "cedar_shaft"        // Cedar Shaft
	ItemTypeCedarBranch      ItemType = "cedar_branch"       // Cedar Branch
	ItemTypeCedarPeg         ItemType = "cedar_peg"          // Cedar Peg
	ItemTypeCedarTenon       ItemType = "cedar_tenon"        // Cedar Tenon
	ItemTypeCherryLog        ItemType = "cherry_log"         // Cherry Log
	ItemTypeCherryPlank      ItemType = "cherry_plank"       // Cherry Plank
	ItemTypeCherryWoodenBeam ItemType = "cherry_wooden_beam" // Cherry Wooden Beam
	ItemTypeCherryShaft      ItemType = "cherry_shaft"       // Cherry Shaft
	ItemTypeCherryBranch     ItemType = "cherry_branch"      // Cherry Branch
	ItemTypeCherryPeg        ItemType = "cherry_peg"         // Cherry Peg
	ItemTypeCherryTenon      ItemType = "cherry_tenon"       // Cherry Tenon
	ItemTypeChestnutLog      ItemType = "chestnut_log"       // Chestnut Log
	ItemTypeChestnutPlank    ItemType = "chestnut_plank"     // Chestnut Plank
	ItemTypeChestnutWoodenBeam ItemType = "chestnut_wooden_beam" // Chestnut Wooden Beam
	ItemTypeChestnutShaft    ItemType = "chestnut_shaft"     // Chestnut Shaft
	ItemTypeChestnutBranch   ItemType = "chestnut_branch"    // Chestnut Branch
	ItemTypeChestnutPeg      ItemType = "chestnut_peg"       // Chestnut Peg
	ItemTypeChestnutTenon    ItemType = "chestnut_tenon"     // Chestnut Tenon
	ItemTypeFirLog           ItemType = "fir_log"            // Fir Log
	ItemTypeFirPlank         ItemType = "fir_plank"          // Fir Plank
	ItemTypeFirWoodenBeam    ItemType = "fir_wooden_beam"    // Fir Wooden Beam
	ItemTypeFirShaft         ItemType = "fir_shaft"          // Fir Shaft
	ItemTypeFirBranch        ItemType = "fir_branch"         // Fir Branch
	ItemTypeFirPeg           ItemType = "fir_peg"            // Fir Peg
	ItemTypeFirTenon         ItemType = "fir_tenon"          // Fir Tenon
	ItemTypeLemonLog         ItemType = "lemon_log"          // Lemon Log
	ItemTypeLemonPlank       ItemType = "lemon_plank"        // Lemon Plank
	ItemTypeLemonWoodenBeam  ItemType = "lemon_wooden_beam"  // Lemon Wooden Beam
	ItemTypeLemonShaft       ItemType = "lemon_shaft"        // Lemon Shaft
	ItemTypeLemonBranch      ItemType = "lemon_branch"       // Lemon Branch
	ItemTypeLemonPeg         ItemType = "lemon_peg"          // Lemon Peg
	ItemTypeLemonTenon       ItemType = "lemon_tenon"        // Lemon Tenon
	ItemTypeLindenLog        ItemType = "linden_log"         // Linden Log
	ItemTypeLindenPlank      ItemType = "linden_plank"       // Linden Plank
	ItemTypeLindenWoodenBeam ItemType = "linden_wooden_beam" // Linden Wooden Beam
	ItemTypeLindenShaft      ItemType = "linden_shaft"       // Linden Shaft
	ItemTypeLindenBranch     ItemType = "linden_branch"      // Linden Branch
	ItemTypeLindenPeg        ItemType = "linden_peg"         // Linden Peg
	ItemTypeLindenTenon      ItemType = "linden_tenon"       // Linden Tenon
	ItemTypeMapleLog         ItemType = "maple_log"          // Maple Log
	ItemTypeMaplePlank       ItemType = "maple_plank"        // Maple Plank
	ItemTypeMapleWoodenBeam  ItemType = "maple_wooden_beam"  // Maple Wooden Beam
	ItemTypeMapleShaft       ItemType = "maple_shaft"        // Maple Shaft
	ItemTypeMapleBranch      ItemType = "maple_branch"       // Maple Branch
	ItemTypeMaplePeg         ItemType = "maple_peg"          // Maple Peg
	ItemTypeMapleTenon       ItemType = "maple_tenon"        // Maple Tenon
	ItemTypeOakLog           ItemType = "oak_log"            // Oak Log
	ItemTypeOakPlank         ItemType = "oak_plank"          // Oak Plank
	ItemTypeOakWoodenBeam    ItemType = "oak_wooden_beam"    // Oak Wooden Beam
	ItemTypeOakShaft         ItemType = "oak_shaft"          // Oak Shaft
	ItemTypeOakBranch        ItemType = "oak_branch"         // Oak Branch
	ItemTypeOakPeg           ItemType = "oak_peg"            // Oak Peg
	ItemTypeOakTenon         ItemType = "oak_tenon"          // Oak Tenon
	ItemTypeOleanderLog      ItemType = "oleander_log"       // Oleander Log
	ItemTypeOleanderPlank    ItemType = "oleander_plank"     // Oleander Plank
	ItemTypeOleanderWoodenBeam ItemType = "oleander_wooden_beam" // Oleander Wooden Beam
	ItemTypeOleanderShaft    ItemType = "oleander_shaft"     // Oleander Shaft
	ItemTypeOleanderBranch   ItemType = "oleander_branch"    // Oleander Branch
	ItemTypeOleanderPeg      ItemType = "oleander_peg"       // Oleander Peg
	ItemTypeOleanderTenon    ItemType = "oleander_tenon"     // Oleander Tenon
	ItemTypeOliveLog         ItemType = "olive_log"          // Olive Log
	ItemTypeOlivePlank       ItemType = "olive_plank"        // Olive Plank
	ItemTypeOliveWoodenBeam  ItemType = "olive_wooden_beam"  // Olive Wooden Beam
	ItemTypeOliveShaft       ItemType = "olive_shaft"        // Olive Shaft
	ItemTypeOliveBranch      ItemType = "olive_branch"       // Olive Branch
	ItemTypeOlivePeg         ItemType = "olive_peg"          // Olive Peg
	ItemTypeOliveTenon       ItemType = "olive_tenon"        // Olive Tenon
	ItemTypeOrangeLog        ItemType = "orange_log"         // Orange Log
	ItemTypeOrangePlank      ItemType = "orange_plank"       // Orange Plank
	ItemTypeOrangeWoodenBeam ItemType = "orange_wooden_beam" // Orange Wooden Beam
	ItemTypeOrangeShaft      ItemType = "orange_shaft"       // Orange Shaft
	ItemTypeOrangeBranch     ItemType = "orange_branch"      // Orange Branch
	ItemTypeOrangePeg        ItemType = "orange_peg"         // Orange Peg
	ItemTypeOrangeTenon      ItemType = "orange_tenon"       // Orange Tenon
	ItemTypePineLog          ItemType = "pine_log"           // Pine Log
	ItemTypePinePlank        ItemType = "pine_plank"         // Pine Plank
	ItemTypePineWoodenBeam   ItemType = "pine_wooden_beam"   // Pine Wooden Beam
	ItemTypePineShaft        ItemType = "pine_shaft"         // Pine Shaft
	ItemTypePineBranch       ItemType = "pine_branch"        // Pine Branch
	ItemTypePinePeg          ItemType = "pine_peg"           // Pine Peg
	ItemTypePineTenon        ItemType = "pine_tenon"         // Pine Tenon
	ItemTypeWalnutLog        ItemType = "walnut_log"         // Walnut Log
	ItemTypeWalnutPlank      ItemType = "walnut_plank"       // Walnut Plank
	ItemTypeWalnutWoodenBeam ItemType = "walnut_wooden_beam" // Walnut Wooden Beam
	ItemTypeWalnutShaft      ItemType = "walnut_shaft"       // Walnut Shaft
	ItemTypeWalnutBranch     ItemType = "walnut_branch"      // Walnut Branch
	ItemTypeWalnutPeg        ItemType = "walnut_peg"         // Walnut Peg
	ItemTypeWalnutTenon      ItemType = "walnut_tenon"       // Walnut Tenon
	ItemTypeWillowLog        ItemType = "willow_log"         // Willow Log
	ItemTypeWillowPlank      ItemType = "willow_plank"       // Willow Plank
	ItemTypeWillowWoodenBeam ItemType = "willow_wooden_beam" // Willow Wooden Beam
	ItemTypeWillowShaft      ItemType = "willow_shaft"       // Willow Shaft
	ItemTypeWillowBranch     ItemType = "willow_branch"      // Willow Branch
	ItemTypeWillowPeg        ItemType = "willow_peg"         // Willow Peg
	ItemTypeWillowTenon      ItemType = "willow_tenon"       // Willow Tenon
	ItemTypeBlueberryLog     ItemType = "blueberry_log"      // Blueberry Log
	ItemTypeBlueberryPlank   ItemType = "blueberry_plank"    // Blueberry Plank
	ItemTypeBlueberryWoodenBeam ItemType = "blueberry_wooden_beam" // Blueberry Wooden Beam
	ItemTypeBlueberryShaft   ItemType = "blueberry_shaft"    // Blueberry Shaft
	ItemTypeBlueberryBranch  ItemType = "blueberry_branch"   // Blueberry Branch
	ItemTypeBlueberryPeg     ItemType = "blueberry_peg"      // Blueberry Peg
	ItemTypeBlueberryTenon   ItemType = "blueberry_tenon"    // Blueberry Tenon
	ItemTypeRaspberryLog     ItemType = "raspberry_log"      // Raspberry Log
	ItemTypeRaspberryPlank   ItemType = "raspberry_plank"    // Raspberry Plank
	ItemTypeRaspberryWoodenBeam ItemType = "raspberry_wooden_beam" // Raspberry Wooden Beam
	ItemTypeRaspberryShaft   ItemType = "raspberry_shaft"    // Raspberry Shaft
	ItemTypeRaspberryBranch  ItemType = "raspberry_branch"   // Raspberry Branch
	ItemTypeRaspberryPeg     ItemType = "raspberry_peg"      // Raspberry Peg
	ItemTypeRaspberryTenon   ItemType = "raspberry_tenon"    // Raspberry Tenon
	ItemTypeGrapeLog         ItemType = "grape_log"          // Grape Log
	ItemTypeGrapePlank       ItemType = "grape_plank"        // Grape Plank
	ItemTypeGrapeWoodenBeam  ItemType = "grape_wooden_beam"  // Grape Wooden Beam
	ItemTypeGrapeShaft       ItemType = "grape_shaft"        // Grape Shaft
	ItemTypeGrapeBranch      ItemType = "grape_branch"       // Grape Branch
	ItemTypeGrapePeg         ItemType = "grape_peg"          // Grape Peg
	ItemTypeGrapeTenon       ItemType = "grape_tenon"        // Grape Tenon
	ItemTypeHazelnutLog      ItemType = "hazelnut_log"       // Hazelnut Log
	ItemTypeHazelnutPlank    ItemType = "hazelnut_plank"     // Hazelnut Plank
	ItemTypeHazelnutWoodenBeam ItemType = "hazelnut_wooden_beam" // Hazelnut Wooden Beam
	ItemTypeHazelnutShaft    ItemType = "hazelnut_shaft"     // Hazelnut Shaft
	ItemTypeHazelnutBranch   ItemType = "hazelnut_branch"    // Hazelnut Branch
	ItemTypeHazelnutPeg      ItemType = "hazelnut_peg"       // Hazelnut Peg
	ItemTypeHazelnutTenon    ItemType = "hazelnut_tenon"     // Hazelnut Tenon
	ItemTypeThornLog         ItemType = "thorn_log"          // Thorn Log
	ItemTypeThornPlank       ItemType = "thorn_plank"        // Thorn Plank
	ItemTypeThornWoodenBeam  ItemType = "thorn_wooden_beam"  // Thorn Wooden Beam
	ItemTypeThornShaft       ItemType = "thorn_shaft"        // Thorn Shaft
	ItemTypeThornBranch      ItemType = "thorn_branch"       // Thorn Branch
	ItemTypeThornPeg         ItemType = "thorn_peg"          // Thorn Peg
	ItemTypeThornTenon       ItemType = "thorn_tenon"        // Thorn Tenon
	ItemTypeLavenderLog      ItemType = "lavender_log"       // Lavender Log
	ItemTypeLavenderPlank    ItemType = "lavender_plank"     // Lavender Plank
	ItemTypeLavenderWoodenBeam ItemType = "lavender_wooden_beam" // Lavender Wooden Beam
	ItemTypeLavenderShaft    ItemType = "lavender_shaft"     // Lavender Shaft
	ItemTypeLavenderBranch   ItemType = "lavender_branch"    // Lavender Branch
	ItemTypeLavenderPeg      ItemType = "lavender_peg"       // Lavender Peg
	ItemTypeLavenderTenon    ItemType = "lavender_tenon"     // Lavender Tenon
	ItemTypeCameliaLog       ItemType = "camelia_log"        // Camelia Log
	ItemTypeCameliaPlank     ItemType = "camelia_plank"      // Camelia Plank
	ItemTypeCameliaWoodenBeam ItemType = "camelia_wooden_beam" // Camelia Wooden Beam
	ItemTypeCameliaShaft     ItemType = "camelia_shaft"      // Camelia Shaft
	ItemTypeCameliaBranch    ItemType = "camelia_branch"     // Camelia Branch
	ItemTypeCameliaPeg       ItemType = "camelia_peg"        // Camelia Peg
	ItemTypeCameliaTenon     ItemType = "camelia_tenon"      // Camelia Tenon
	ItemTypeRoseLog          ItemType = "rose_log"           // Rose Log
	ItemTypeRosePlank        ItemType = "rose_plank"         // Rose Plank
	ItemTypeRoseWoodenBeam   ItemType = "rose_wooden_beam"   // Rose Wooden Beam
	ItemTypeRoseShaft        ItemType = "rose_shaft"         // Rose Shaft
	ItemTypeRoseBranch       ItemType = "rose_branch"        // Rose Branch
	ItemTypeRosePeg          ItemType = "rose_peg"           // Rose Peg
	ItemTypeRoseTenon        ItemType = "rose_tenon"         // Rose Tenon
	ItemTypeLingoberryLog    ItemType = "lingoberry_log"     // Lingoberry Log
	ItemTypeLingoberryPlank  ItemType = "lingoberry_plank"   // Lingoberry Plank
	ItemTypeLingoberryWoodenBeam ItemType = "lingoberry_wooden_beam" // Lingoberry Wooden Beam
	ItemTypeLingoberryShaft  ItemType = "lingoberry_shaft"   // Lingoberry Shaft
	ItemTypeLingoberryBranch ItemType = "lingoberry_branch"  // Lingoberry Branch
	ItemTypeLingoberryPeg    ItemType = "lingoberry_peg"     // Lingoberry Peg
	ItemTypeLingoberryTenon  ItemType = "lingoberry_tenon"   // Lingoberry Tenon
	// Farm
	ItemTypePotato         ItemType = "potato"          // Potato
	ItemTypeCotton         ItemType = "cotton"           // Cotton
	ItemTypeRye            ItemType = "rye"              // Rye
	ItemTypeWemp           ItemType = "wemp"             // Wemp
	ItemTypeCucumber       ItemType = "cucumber"         // Cucumber
	ItemTypeOat            ItemType = "oat"              // Oat
	ItemTypePumpkin        ItemType = "pumpkin"          // Pumpkin
	ItemTypeBarley         ItemType = "barley"           // Barley
	ItemTypeReed           ItemType = "reed"             // Reed
	ItemTypeCarrot         ItemType = "carrot"           // Carrot
	ItemTypeHay            ItemType = "hay"             // Hay
	ItemTypeWheat          ItemType = "wheat"            // Wheat
	ItemTypeCabbage        ItemType = "cabbage"         // Cabbage
	ItemTypeCorn           ItemType = "corn"             // Corn
	ItemTypeTomato         ItemType = "tomato"          // Tomato
	ItemTypeLettuce        ItemType = "lettuce"         // Lettuce
	ItemTypeOnion          ItemType = "onion"           // Onion
	ItemTypeStrawberries   ItemType = "strawberries"    // Strawberries
	ItemTypePeaPod         ItemType = "pea_pod"         // Pea Pod
	ItemTypeGarlic         ItemType = "garlic"          // Garlic
	ItemTypeRice           ItemType = "rice"            // Rice
	ItemTypeSugarBeet      ItemType = "sugar_beet"      // Sugar Beet
	ItemTypeBlackMushroom   ItemType = "black_mushroom"  // Black Mushroom
	ItemTypeGreenMushroom  ItemType = "green_mushroom"  // Green Mushroom
	ItemTypeYellowMushroom ItemType = "yellow_mushroom" // Yellow Mushroom
	ItemTypeBlueMushroom   ItemType = "blue_mushroom"   // Blue Mushroom
	ItemTypeBrownMushroom  ItemType = "brown_mushroom"  // Brown Mushroom
	ItemTypeRedMushroom    ItemType = "red_mushroom"    // Red Mushroom
	// Garden
	ItemTypeBasil            ItemType = "basil"              // Basil
	ItemTypeBelladonna       ItemType = "belladonna"         // Belladonna
	ItemTypeFennel           ItemType = "fennel"             // Fennel
	ItemTypeLovage           ItemType = "lovage"            // Lovage
	ItemTypeMint             ItemType = "mint"               // Mint
	ItemTypeOregano          ItemType = "oregano"           // Oregano
	ItemTypeParsley          ItemType = "parsley"            // Parsley
	ItemTypeRosemary         ItemType = "rosemary"           // Rosemary
	ItemTypeSage             ItemType = "sage"              // Sage
	ItemTypeThyme            ItemType = "thyme"              // Thyme
	ItemTypeCumin            ItemType = "cumin"              // Cumin
	ItemTypeGinger           ItemType = "ginger"             // Ginger
	ItemTypePaprika          ItemType = "paprika"            // Paprika
	ItemTypeTurmeric         ItemType = "turmeric"          // Turmeric
	ItemTypeWoad             ItemType = "woad"              // Woad
	ItemTypeGreenCoffeeBeans ItemType = "green_coffee_beans" // Green Coffee Beans
	ItemTypeTeaSeeds         ItemType = "tea_seeds"         // Tea Seeds
	ItemTypeCacaoBeans       ItemType = "cacao_beans"       // Cacao Beans
	// Animal
	ItemTypeFat                ItemType = "fat"                  // Fat
	ItemTypeHide               ItemType = "hide"                 // Hide
	ItemTypeBladder            ItemType = "bladder"              // Bladder
	ItemTypeCochineal           ItemType = "cochineal"           // Cochineal
	ItemTypeCrabMeat            ItemType = "crab_meat"           // Crab Meat
	ItemTypeDragonScale         ItemType = "dragon_scale"         // Dragon Scale
	ItemTypeDrakeHide           ItemType = "drake_hide"          // Drake Hide
	ItemTypeEye                 ItemType = "eye"                 // Eye
	ItemTypeFeather             ItemType = "feather"              // Feather
	ItemTypeFishFillet          ItemType = "fish_fillet"         // Fish Fillet
	ItemTypeFlint               ItemType = "flint"               // Flint
	ItemTypeFur                 ItemType = "fur"                 // Fur
	ItemTypeGland               ItemType = "gland"               // Gland
	ItemTypeGoblinSkull         ItemType = "goblin_skull"        // Goblin Skull
	ItemTypeHeart               ItemType = "heart"               // Heart
	ItemTypeHoof                ItemType = "hoof"                 // Hoof
	ItemTypeHorn                ItemType = "horn"               // Horn
	ItemTypeLongHorn            ItemType = "long_horn"           // Long Horn
	ItemTypeBearMeat            ItemType = "bear_meat"           // Bear Meat
	ItemTypeBeefMeat            ItemType = "beef_meat"           // Beef Meat
	ItemTypeCanineMeat          ItemType = "canine_meat"         // Canine Meat
	ItemTypeDragonMeat          ItemType = "dragon_meat"         // Dragon Meat
	ItemTypeFelineMeat          ItemType = "feline_meat"         // Feline Meat
	ItemTypeFowlMeat            ItemType = "fowl_meat"          // Fowl Meat
	ItemTypeGameMeat            ItemType = "game_meat"          // Game Meat
	ItemTypeHorseMeat           ItemType = "horse_meat"         // Horse Meat
	ItemTypeHumanMeat           ItemType = "human_meat"          // Human Meat
	ItemTypeHumanoidMeat        ItemType = "humanoid_meat"       // Humanoid Meat
	ItemTypeInsectMeat          ItemType = "insect_meat"         // Insect Meat
	ItemTypeLambMeat            ItemType = "lamb_meat"          // Lamb Meat
	ItemTypePorkMeat            ItemType = "pork_meat"          // Pork Meat
	ItemTypeSeafoodMeat          ItemType = "seafood_meat"        // Seafood Meat
	ItemTypeSnakeMeat           ItemType = "snake_meat"          // Snake Meat
	ItemTypeToughatMeat         ItemType = "toughat_meat"       // Toughat Meat
	ItemTypeOctopusInkSac        ItemType = "octopus_ink_sac"    // Octopus Ink Sac
	ItemTypePaw                 ItemType = "paw"                 // Paw
	ItemTypePelt                ItemType = "pelt"               // Pelt
	ItemTypeSkull               ItemType = "skull"               // Skull
	ItemTypeSmallTortoiseShell  ItemType = "small_tortoise_shell" // Small Tortoise Shell
	ItemTypeTail                ItemType = "tail"                // Tail
	ItemTypeTooth               ItemType = "tooth"               // Tooth
	ItemTypeUnicornTwistedHorn  ItemType = "unicorn_twisted_horn" // Unicorn Twisted Horn
	ItemTypeWool                ItemType = "wool"               // Wool
	// Fruits
	ItemTypeApples        ItemType = "apples"         // Apples
	ItemTypeCherries      ItemType = "cherries"       // Cherries
	ItemTypeBlueGrapes    ItemType = "blue_grapes"    // Blue Grapes
	ItemTypeGreenGrapes   ItemType = "green_grapes"   // Green Grapes
	ItemTypeLemons        ItemType = "lemons"         // Lemons
	ItemTypeOlives        ItemType = "olives"         // Olives
	ItemTypeOranges       ItemType = "oranges"        // Oranges
	ItemTypeBlueberries   ItemType = "blueberries"    // Blueberries
	ItemTypeLingonberries ItemType = "lingonberries"   // Lingonberries
	ItemTypeRaspberries   ItemType = "raspberries"    // Raspberries
	ItemTypeAcorns        ItemType = "acorns"         // Acorns
	ItemTypeChestnuts     ItemType = "chestnuts"      // Chestnuts
	ItemTypeHazelnuts     ItemType = "hazelnuts"     // Hazelnuts
	ItemTypePinenuts      ItemType = "pinenuts"      // Pinenuts
	ItemTypeWalnuts       ItemType = "walnuts"       // Walnuts
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
	CategoryWood         Category = "Wood"
	CategoryFarm         Category = "Farm"
	CategoryGarden       Category = "Garden"
	CategoryAnimal      Category = "Animal"
	CategoryFruits       Category = "Fruits"
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
	case ItemTypePotato, ItemTypeCotton, ItemTypeRye, ItemTypeWemp, ItemTypeCucumber, ItemTypeOat, ItemTypePumpkin, ItemTypeBarley, ItemTypeReed, ItemTypeCarrot, ItemTypeHay, ItemTypeWheat, ItemTypeCabbage, ItemTypeCorn, ItemTypeTomato, ItemTypeLettuce, ItemTypeOnion, ItemTypeStrawberries, ItemTypePeaPod, ItemTypeGarlic, ItemTypeRice, ItemTypeSugarBeet, ItemTypeBlackMushroom, ItemTypeGreenMushroom, ItemTypeYellowMushroom, ItemTypeBlueMushroom, ItemTypeBrownMushroom, ItemTypeRedMushroom:
		return CategoryFarm
	case ItemTypeBasil, ItemTypeBelladonna, ItemTypeFennel, ItemTypeLovage, ItemTypeMint, ItemTypeOregano, ItemTypeParsley, ItemTypeRosemary, ItemTypeSage, ItemTypeThyme, ItemTypeCumin, ItemTypeGinger, ItemTypePaprika, ItemTypeTurmeric, ItemTypeWoad, ItemTypeGreenCoffeeBeans, ItemTypeTeaSeeds, ItemTypeCacaoBeans:
		return CategoryGarden
	case ItemTypeFat, ItemTypeHide, ItemTypeBladder, ItemTypeCochineal, ItemTypeCrabMeat, ItemTypeDragonScale, ItemTypeDrakeHide, ItemTypeEye, ItemTypeFeather, ItemTypeFishFillet, ItemTypeFlint, ItemTypeFur, ItemTypeGland, ItemTypeGoblinSkull, ItemTypeHeart, ItemTypeHoof, ItemTypeHorn, ItemTypeLongHorn, ItemTypeBearMeat, ItemTypeBeefMeat, ItemTypeCanineMeat, ItemTypeDragonMeat, ItemTypeFelineMeat, ItemTypeFowlMeat, ItemTypeGameMeat, ItemTypeHorseMeat, ItemTypeHumanMeat, ItemTypeHumanoidMeat, ItemTypeInsectMeat, ItemTypeLambMeat, ItemTypePorkMeat, ItemTypeSeafoodMeat, ItemTypeSnakeMeat, ItemTypeToughatMeat, ItemTypeOctopusInkSac, ItemTypePaw, ItemTypePelt, ItemTypeSkull, ItemTypeSmallTortoiseShell, ItemTypeTail, ItemTypeTooth, ItemTypeUnicornTwistedHorn, ItemTypeWool:
		return CategoryAnimal
	case ItemTypeApples, ItemTypeCherries, ItemTypeBlueGrapes, ItemTypeGreenGrapes, ItemTypeLemons, ItemTypeOlives, ItemTypeOranges, ItemTypeBlueberries, ItemTypeLingonberries, ItemTypeRaspberries, ItemTypeAcorns, ItemTypeChestnuts, ItemTypeHazelnuts, ItemTypePinenuts, ItemTypeWalnuts:
		return CategoryFruits
	default:
		// Verificar se é Wood usando função auxiliar (para evitar lista gigante no switch)
		if IsWood(itemType) {
			return CategoryWood
		}
		return CategoryConstruction // Default
	}
}

// GetLumpFromOre retorna o tipo de Lump correspondente a um Ore
// Retorna vazio se o item não for um Ore
func GetLumpFromOre(oreType ItemType) (ItemType, bool) {
	oreToLumpMap := map[ItemType]ItemType{
		ItemTypeIronOre:   ItemTypeIronLump,
		ItemTypeCopperOre: ItemTypeCopperLump,
		ItemTypeSilverOre: ItemTypeSilverLump,
		ItemTypeGoldOre:   ItemTypeGoldLump,
		ItemTypeTinOre:    ItemTypeTinLump,
		ItemTypeZincOre:   ItemTypeZincLump,
		ItemTypeLeadOre:   ItemTypeLeadLump,
	}
	
	lumpType, ok := oreToLumpMap[oreType]
	return lumpType, ok
}

// IsOre verifica se um tipo de item é um Ore
func IsOre(itemType ItemType) bool {
	_, ok := GetLumpFromOre(itemType)
	return ok
}

// IsWood verifica se um tipo de item é Wood baseado no padrão de nome
func IsWood(itemType ItemType) bool {
	woodTypes := []string{
		"apple", "birch", "cedar", "cherry", "chestnut", "fir", "lemon", "linden",
		"maple", "oak", "oleander", "olive", "orange", "pine", "walnut", "willow",
		"blueberry", "raspberry", "grape", "hazelnut", "thorn", "lavender", "camelia", "rose", "lingoberry",
	}
	woodItems := []string{"_log", "_plank", "_wooden_beam", "_shaft", "_branch", "_peg", "_tenon"}
	
	itemStr := string(itemType)
	for _, wood := range woodTypes {
		for _, item := range woodItems {
			if itemStr == wood+item {
				return true
			}
		}
	}
	return false
}

// GetWoodType extrai o tipo de madeira de um item (ex: "cherry" de "cherry_log")
func GetWoodType(itemType ItemType) (string, bool) {
	woodTypes := []string{
		"apple", "birch", "cedar", "cherry", "chestnut", "fir", "lemon", "linden",
		"maple", "oak", "oleander", "olive", "orange", "pine", "walnut", "willow",
		"blueberry", "raspberry", "grape", "hazelnut", "thorn", "lavender", "camelia", "rose", "lingoberry",
	}
	
	itemStr := string(itemType)
	for _, wood := range woodTypes {
		if len(itemStr) > len(wood) && itemStr[:len(wood)] == wood {
			return wood, true
		}
	}
	return "", false
}

// IsLog verifica se um item é um Log de madeira
func IsLog(itemType ItemType) bool {
	if !IsWood(itemType) {
		return false
	}
	itemStr := string(itemType)
	return len(itemStr) > 4 && itemStr[len(itemStr)-4:] == "_log"
}

// IsShaft verifica se um item é um Shaft de madeira
func IsShaft(itemType ItemType) bool {
	if !IsWood(itemType) {
		return false
	}
	itemStr := string(itemType)
	return len(itemStr) > 6 && itemStr[len(itemStr)-6:] == "_shaft"
}

// GetPlankFromLog retorna o tipo de Plank correspondente a um Log
func GetPlankFromLog(logType ItemType) (ItemType, bool) {
	woodType, ok := GetWoodType(logType)
	if !ok || !IsLog(logType) {
		return "", false
	}
	return ItemType(woodType + "_plank"), true
}

// GetShaftFromLog retorna o tipo de Shaft correspondente a um Log
func GetShaftFromLog(logType ItemType) (ItemType, bool) {
	woodType, ok := GetWoodType(logType)
	if !ok || !IsLog(logType) {
		return "", false
	}
	return ItemType(woodType + "_shaft"), true
}

// GetPegFromShaft retorna o tipo de Peg correspondente a um Shaft
func GetPegFromShaft(shaftType ItemType) (ItemType, bool) {
	woodType, ok := GetWoodType(shaftType)
	if !ok || !IsShaft(shaftType) {
		return "", false
	}
	return ItemType(woodType + "_peg"), true
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

// Note representa uma nota/tarefa
type Note struct {
	ID          int64      `json:"id"`
	Title       string     `json:"title"`
	Description string     `json:"description"`
	Category    string     `json:"category,omitempty"` // Categoria opcional (mesmas do estoque)
	StartDate   *time.Time `json:"startDate,omitempty"`
	EndDate     *time.Time `json:"endDate,omitempty"`
	Completed   bool       `json:"completed"`
	CreatedAt   time.Time  `json:"createdAt"`
	UpdatedAt   time.Time  `json:"updatedAt"`
}

// Location representa uma localização do mapa
type Location struct {
	ID          int64     `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Category    string    `json:"category,omitempty"` // Categoria opcional (mesmas do estoque)
	MapType     string    `json:"mapType"`     // "yaga" ou "wurmmaps"
	Server      string    `json:"server"`       // "Harmony", "Cadence", "Melody"
	X           int       `json:"x"`
	Y           int       `json:"y"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}
