/*------------------------------------------------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------------------------------------------------
---------THIS FILE CONTAINS OBVIOUS SPOILERS TO BREWING RESEARCH. SPOILERS AHEAD. You have been warned.-------------------------------
---------THIS FILE CONTAINS OBVIOUS SPOILERS TO BREWING RESEARCH. SPOILERS AHEAD. You have been warned.-------------------------------
---------THIS FILE CONTAINS OBVIOUS SPOILERS TO BREWING RESEARCH. SPOILERS AHEAD. You have been warned.-------------------------------
---------THIS FILE CONTAINS OBVIOUS SPOILERS TO BREWING RESEARCH. SPOILERS AHEAD. You have been warned.-------------------------------
---------THIS FILE CONTAINS OBVIOUS SPOILERS TO BREWING RESEARCH. SPOILERS AHEAD. You have been warned.-------------------------------
--------------------------------------------------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------------------------------------------------
*/

export const MULTI_CLUE_POTION_EFFECTS = ["invisibility", "harming", "weakness", "slowness"];
export const TOME_RESEARCH_ITEMS = new Map();
//tome_parent_chapter: "catalysers", "ingredients",
// "fuel"
//Type: clue, multi-clue, complete
//Each clue adds to the part. A complete part will not unviel until all clues are complete
//TODO, MVP, ingredients only
// TOME_RESEARCH_ITEMS.set("magical_brewery:potion_decay", {
// 			"tome_parent_chapter": "catalysers",
// 		}
// 	);
TOME_RESEARCH_ITEMS.set("minecraft:blaze_powder", {
			"tome_chapter": "ingredients",
			"type": "clue",
			"part": "strength_1"
		}
	);
TOME_RESEARCH_ITEMS.set("minecraft:glistering_melon_slice", {
			"tome_chapter": "ingredients",
			"type": "clue",
			"part": "healing_1"
		}
	);
TOME_RESEARCH_ITEMS.set("minecraft:sugar", {
			"tome_chapter": "ingredients",
			"type": "clue",
			"part": "swiftness_1"
		}
	);
TOME_RESEARCH_ITEMS.set("minecraft:rabbit_foot", {
			"tome_chapter": "ingredients",
			"type": "clue",
			"part": "leaping_1"
		}
	);
TOME_RESEARCH_ITEMS.set("minecraft:spider_eye", {
			"tome_chapter": "ingredients",
			"type": "clue",
			"part": "poison_1"
		}
	);
TOME_RESEARCH_ITEMS.set("minecraft:golden_carrot", {
			"tome_chapter": "ingredients",
			"type": "clue",
			"part": "nightvision_1"
		}
	);
TOME_RESEARCH_ITEMS.set("minecraft:ghast_tear", {
			"tome_chapter": "ingredients",
			"type": "clue",
			"part": "regeneration_1"
		}
	);
TOME_RESEARCH_ITEMS.set("minecraft:pufferfish", {
			"tome_chapter": "ingredients",
			"type": "clue",
			"part": "water_breathing_1"
		}
	);
TOME_RESEARCH_ITEMS.set("minecraft:magma_cream", {
			"tome_chapter": "ingredients",
			"type": "clue",
			"part": "fire_resistance_1"
		}
	);
TOME_RESEARCH_ITEMS.set("minecraft:turtle_helmet", {
			"tome_chapter": "ingredients",
			"type": "clue",
			"part": "turtle_master_1"
		}
	);
TOME_RESEARCH_ITEMS.set("minecraft:phantom_membrane", {
			"tome_chapter": "ingredients",
			"type": "clue",
			"part": "slow_falling_1"
		}
	);
TOME_RESEARCH_ITEMS.set("minecraft:breeze_rod", {
			"tome_chapter": "ingredients",
			"type": "clue",
			"part": "wind_charged_1"
		}
	);
TOME_RESEARCH_ITEMS.set("minecraft:stone", {
			"tome_chapter": "ingredients",
			"type": "clue",
			"part": "infested_1"
		}
	);
TOME_RESEARCH_ITEMS.set("minecraft:web", {
			"tome_chapter": "ingredients",
			"type": "clue",
			"part": "weaving_1"
		}
	);
TOME_RESEARCH_ITEMS.set("minecraft:fermented_spider_eye", {
			"tome_chapter": "ingredients",
			"type": "multi-clue",
			"parts": ["invisibility_1", "slowness_1", "harming_1", "weakness_1"]
		}
	);
TOME_RESEARCH_ITEMS.set("minecraft:slime_ball", {
			"tome_chapter": "ingredients",
			"type": "clue",
			"part": "oozing_1"
		}
	);

TOME_RESEARCH_ITEMS.set("minecraft:potion", {
			"tome_chapter": "ingredients",
			"type": "complete"
			//Part is determined by the potions effect id
			//Obviously this will include catalysers 
		}
	);
//Catalyer research items
TOME_RESEARCH_ITEMS.set("minecraft:redstone", {
			"tome_chapter": "catalysers",
			"type": "complete"
			//Part is determined by the potions effect id
			//Obviously this will include catalysers 
		}
	);
TOME_RESEARCH_ITEMS.set("minecraft:redstone", {
			"tome_chapter": "catalysers",
			"type": "clue",
			"part": "longevity_tier_1_1"
			//Part is determined by the potions effect id
			//Obviously this will include catalysers 
		}
	);
TOME_RESEARCH_ITEMS.set("magical_brewery:pure_redstone_dust", {
			"tome_chapter": "catalysers",
			"type": "clue",
			"part": "longevity_tier_2_1"
			//Part is determined by the potions effect id
			//Obviously this will include catalysers 
		}
	);
TOME_RESEARCH_ITEMS.set("minecraft:glowstone_dust", {
			"tome_chapter": "catalysers",
			"type": "clue",
			"part": "potency_tier_1_1"
			//Part is determined by the potions effect id
			//Obviously this will include catalysers 
		}
	);
TOME_RESEARCH_ITEMS.set("magical_brewery:pure_glowstone_dust", {
			"tome_chapter": "catalysers",
			"type": "clue",
			"part": "potency_tier_2_1"
			//Part is determined by the potions effect id
			//Obviously this will include catalysers 
		}
	);
TOME_RESEARCH_ITEMS.set("minecraft:gunpowder", {
			"tome_chapter": "catalysers",
			"type": "clue",
			"part": "expansion_tier_1_1"
			//Part is determined by the potions effect id
			//Obviously this will include catalysers 
		}
	);
TOME_RESEARCH_ITEMS.set("magical_brewery:crackling_oil", {
			"tome_chapter": "catalysers",
			"type": "clue",
			"part": "expansion_tier_2_1"
			//Part is determined by the potions effect id
			//Obviously this will include catalysers 
		}
	);
TOME_RESEARCH_ITEMS.set("minecraft:dragon_breath", {
			"tome_chapter": "catalysers",
			"type": "clue",
			"part": "lingering_tier_1_1"
			//Part is determined by the potions effect id
			//Obviously this will include catalysers 
		}
	);
//Complete research
TOME_RESEARCH_ITEMS.set("minecraft:potion", {
		"tome_chapter": "ingredients",
		"type": "complete"
		//Part is determined by the potions effect id
		//Obviously this will include catalysers 
	}
);
//invisibility is made with fermented spider eye and potions of nightvsion
//slowness is made with fermented spider eye and potions of swiftness or leaping
//harming