/*------------------------------------------------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------------------------------------------------
---------THIS FILE CONTAINS OBVIOUS SPOILERS TO THE TOME CHAPTERS. SPOILERS AHEAD. You have been warned.-------------------------------
---------THIS FILE CONTAINS OBVIOUS SPOILERS TO THE TOME CHAPTERS. SPOILERS AHEAD. You have been warned.-------------------------------
---------THIS FILE CONTAINS OBVIOUS SPOILERS TO THE TOME CHAPTERS. SPOILERS AHEAD. You have been warned.-------------------------------
---------THIS FILE CONTAINS OBVIOUS SPOILERS TO THE TOME CHAPTERS. SPOILERS AHEAD. You have been warned.-------------------------------
---------THIS FILE CONTAINS OBVIOUS SPOILERS TO THE TOME CHAPTERS. SPOILERS AHEAD. You have been warned.-------------------------------
--------------------------------------------------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------------------------------------------------
*/


export const PAGES_CHAPTERS = {
	"starter":{
		"main": ["ageing", "zzz_about_the_author"],
		"ageing": ["casks"],
		"casks": ["cask_degrading", "cask_oddities", "theories_cask_effects"]
	},
	"seals":{
		"ageing": ["seals"],
		"seals": ["seal_base", "seal_longevity", "seal_potency", "seal_expansion", "seal_retainment"],
	},
	"crystallography":{
		"main": ["crystallography"],
		"crystallography": ["purifying", "crystal_seeds", "crystal_harvesting"],
		"purifying": ["washing", "heat_treating", "lunar_charging"],
		"crystal_seeds": ["theories_glowstone"],
	},
	"brewing":{
		"main": ["brewing"],
		"brewing" : ["recipes", "brewing_research"],
		"recipes":["ingredients", "catalyzers"],
		//"ingredients": ["stren_1", "stren_2", "heal_1", "heal_2"]
	},
	"seal_memories":{
		"seals" : ["seal_memories"],
	},
	"seal_inspiration":{
		"seals" : ["seal_inspiration"],
	}

};
export const TOME_POTION_CATALYZER_CHAPTERS= {};
export const TOME_POTION_INGREDIENT_CHAPTERS= {
	"ingredients": [
	]
};

// 	"Potion Materials": {
//         title: "magical_brewery:tome_chapter_potion_materials.title",
//         body: "magical_brewery:tome_chapter_potion_materials.body",
//         buttons: [
// 			{
// 				chapter: "magical_brewery:tome_chapter_glass_bottle.title",
// 				id: "Glass",
// 				icon: "textures/items/potion_bottle_empty"
// 			},
// 			{
// 				chapter: "magical_brewery:tome_chapter_amethyst_bottle.title",
// 				id: "Amethyst",
// 				icon: "textures/beardedflea/magical_brewery/items/amethyst/amethyst_bottle.png"
// 			},
// 		],
// 		exitPage: "Brewing"
// 	},

export const TOME_CHAPTERS = {
	//Main Chapters
	"main": {
		icon: "",
		exitPage: ""
	},
	"zzz_about_the_author": {
		icon: "textures/beardedflea/magical_brewery/items/chapter_of_wisdom_3.png",
		exitPage: "main"
	},
	//Ageing Chapters
	"ageing": {
		icon: "textures/beardedflea/magical_brewery/tome/chapter_cask.png",
		exitPage: "main"
	},
	"casks": {
		icon: "textures/beardedflea/magical_brewery/tome/chapter_cask.png",
		exitPage: "main"
	},
	//Casks Chapters
	"cask_degrading": {
		icon: "textures/beardedflea/magical_brewery/tome/chapter_cask_degrading.png",
		exitPage: "casks"
	},
	"cask_oddities": {
		icon: "textures/beardedflea/magical_brewery/tome/chapter_cask_oddities.png",
		exitPage: "casks"
	},
	"theories_cask_effects": {
		icon: "textures/items/potion_bottle_turtleMaster",
		exitPage: "main"
	},
	//Crystallography Chapters
	"crystallography": {
		icon: "textures/beardedflea/magical_brewery/blocks/crystals/glowstone_cluster.png",
		exitPage: "main"
	},
	"purifying": {
		icon: "textures/beardedflea/magical_brewery/items/pure_glowstone_dust.png",
		exitPage: "crystallography"
	},
	//Purifying Chapters
	"washing": {
		icon: "textures/beardedflea/magical_brewery/tome/chapter_washing.png",
		exitPage: "purifying"
	},
	"heat_treating": {
		icon: "textures/beardedflea/magical_brewery/tome/chapter_heat_treating.png",
		exitPage: "purifying"
	},
	"lunar_charging": {
		icon: "textures/beardedflea/magical_brewery/tome/chapter_lunar_charging.png",
		exitPage: "purifying"
	},
	"crystal_seeds": {
		icon: "textures/beardedflea/magical_brewery/items/pure_quartz_seed.png",
		exitPage: "crystallography"
	},
	//Crystal Seed Chapters
	"theories_glowstone": {
		icon: "textures/beardedflea/magical_brewery/tome/chapter_theories_glowstone.png",
		exitPage: "crystal_seeds"
	},
	"crystal_harvesting": {
		icon: "textures/beardedflea/magical_brewery/items/redstone_shard.png",
		exitPage: "crystallography"
	},
	//Seal Chapters
	"seals": {
		icon: "textures/beardedflea/magical_brewery/items/seals/seal_potency_1.png",
		exitPage: "ageing"
	},
	"seal_base": {
		icon: "textures/beardedflea/magical_brewery/items/seals/seal_basic.png",
		exitPage: "seals"
	},
	"seal_longevity": {
		icon: "textures/beardedflea/magical_brewery/items/seals/seal_longevity_1.png",
		exitPage: "seals"
	},
	"seal_potency": {
		icon: "textures/beardedflea/magical_brewery/items/seals/seal_potency_1.png",
		exitPage: "seals"
	},
	"seal_expansion": {
        icon: "textures/beardedflea/magical_brewery/items/seals/seal_expansion_1.png",
		exitPage: "seals"
	},
	"seal_retainment": {
		icon: "textures/beardedflea/magical_brewery/items/seals/seal_retainment.png",
		exitPage: "seals"
	},
	"seal_memories": {
		icon: "textures/beardedflea/magical_brewery/items/seals/seal_memories_temp.png",
		exitPage: "seals"
	},
	"seal_inspiration": {
		icon: "textures/beardedflea/magical_brewery/items/seals/seal_inspiration_dormant.png",
		exitPage: "seals"
	},
	//Brewing Chapters
	"brewing": {
		icon: "textures/items/brewing_stand",
		exitPage: "main"
	},
	"recipes": {
		icon: "textures/items/spider_eye_fermented",
		exitPage: "brewing"
	},
	"potion_materials": {
		icon: "textures/beardedflea/magical_brewery/items/redstone_shard.png",
		exitPage: "brewing"
	},
	"brewing_research": {
		icon: "textures/beardedflea/magical_brewery/tome/chapter_brewing_research.png",
		exitPage: "brewing"
	},
	//Recipes Chapters
	"ingredients": {
		icon: "textures/items/spider_eye_fermented",
		exitPage: "recipes"
	},
	"catalyzers": {
		icon: "textures/items/redstone_dust",
		exitPage: "recipes"
	},
	//ingredients chapters
	"strength_1":{
		icon: "textures/items/blaze_powder",
		exitPage: "ingredients"
	},
	"strength_2":{
		icon: "textures/beardedflea/magical_brewery/tome/chapter_stren_2.png",
		exitPage: "ingredients"
	},
	"healing_1":{
		icon: "textures/items/melon_speckled",
		exitPage: "ingredients"
	},
	"healing_2":{
		icon: "textures/beardedflea/magical_brewery/tome/chapter_heal_2.png",
		exitPage: "ingredients"
	},
	"swiftness_1":{
		icon: "textures/items/sugar",
		exitPage: "ingredients"
	},
	"swiftness_2":{
		icon: "textures/beardedflea/magical_brewery/tome/chapter_swiftness_2.png",
		exitPage: "ingredients"
	},
	"leaping_1":{
		icon: "textures/items/rabbit_foot",
		exitPage: "ingredients"
	},
	"leaping_2":{
		icon: "textures/beardedflea/magical_brewery/tome/chapter_leaping_2.png",
		exitPage: "ingredients"
	},
	"poison_1":{
		icon: "textures/items/spider_eye",
		exitPage: "ingredients"
	},
	"poison_2":{
		icon: "textures/beardedflea/magical_brewery/tome/chapter_poison_2.png",
		exitPage: "ingredients"
	},
	"nightvision_1":{
		icon: "textures/items/carrot_golden",
		exitPage: "ingredients"
	},
	"nightvision_2":{
		icon: "textures/beardedflea/magical_brewery/tome/chapter_nightvision_2.png",
		exitPage: "ingredients"
	},
	"regeneration_1":{
		icon: "textures/items/ghast_tear",
		exitPage: "ingredients"
	},
	"regeneration_2":{
		icon: "textures/beardedflea/magical_brewery/tome/chapter_regeneration_2.png",
		exitPage: "ingredients"
	},
	"water_breathing_1":{
		icon: "textures/items/fish_pufferfish_raw",
		exitPage: "ingredients"
	},
	"water_breathing_2":{
		icon: "textures/beardedflea/magical_brewery/tome/chapter_water_breathing_2.png",
		exitPage: "ingredients"
	},
	"fire_resistance_1":{
		icon: "textures/items/magma_cream",
		exitPage: "ingredients"
	},
	"fire_resistance_2":{
		icon: "textures/beardedflea/magical_brewery/tome/chapter_fire_resistance_2.png",
		exitPage: "ingredients"
	},
	"turtle_master_1":{
		icon: "textures/items/turtle_helmet",
		exitPage: "ingredients"
	},
	"turtle_master_2":{
		icon: "textures/beardedflea/magical_brewery/tome/chapter_turtle_master_2.png",
		exitPage: "ingredients"
	},
	"slow_falling_1":{
		icon: "textures/items/phantom_membrane",
		exitPage: "ingredients"
	},
	"slow_falling_2":{
		icon: "textures/beardedflea/magical_brewery/tome/chapter_slow_falling_2.png",
		exitPage: "ingredients"
	},
	"wind_charged_1":{
		icon: "textures/items/breeze_rod",
		exitPage: "ingredients"
	},
	"wind_charged_2":{
		icon: "textures/beardedflea/magical_brewery/tome/chapter_wind_charged_2.png",
		exitPage: "ingredients"
	},
	"infested_1":{
		icon: "textures/items/stone_axe",
		exitPage: "ingredients"
	},
	"infested_2":{
		icon: "textures/beardedflea/magical_brewery/tome/chapter_infested_2.png",
		exitPage: "ingredients"
	},
	"weaving_1":{
		icon: "textures/blocks/web",
		exitPage: "ingredients"
	},
	"weaving_2":{
		icon: "textures/beardedflea/magical_brewery/tome/chapter_weaving_2.png",
		exitPage: "ingredients"
	},
	"weakness_1":{
		icon: "textures/items/spider_eye_fermented",
		exitPage: "ingredients"
	},
	"weakness_2":{
		icon: "textures/beardedflea/magical_brewery/tome/chapter_weakness_2.png",
		exitPage: "ingredients"
	},
	"oozing_1":{
		icon: "textures/items/slimeball",
		exitPage: "ingredients"
	},
	"oozing_2":{
		icon: "textures/beardedflea/magical_brewery/tome/chapter_oozing_2.png",
		exitPage: "ingredients"
	},
	//catalyzers chapters
	"longevity_tier_1_1":{
		icon: "textures/items/redstone_dust",
		exitPage: "catalyzers"
	},
	"longevity_tier_1_2":{
		icon: "textures/beardedflea/magical_brewery/tome/chapter_longevity_tier_1_2.png",
		exitPage: "catalyzers"
	},
	"longevity_tier_2_1":{
		icon: "textures/beardedflea/magical_brewery/items/pure_redstone_dust.png",
		exitPage: "catalyzers"
	},
	"potency_tier_1_1":{
		icon: "textures/items/glowstone_dust",
		exitPage: "catalyzers"
	},
	"potency_tier_1_2":{
		icon: "textures/beardedflea/magical_brewery/tome/chapter_potency_tier_1_2.png",
		exitPage: "catalyzers"
	},
	"potency_tier_2_1":{
		icon: "textures/beardedflea/magical_brewery/items/pure_glowstone_dust.png",
		exitPage: "catalyzers"
	},
	"expansion_tier_1_1":{
		icon: "textures/items/gunpowder",
		exitPage: "catalyzers"
	},
	"expansion_tier_1_2":{
		icon: "textures/beardedflea/magical_brewery/tome/chapter_expansion_tier_1_2.png",
		exitPage: "catalyzers"
	},
	"expansion_tier_2_1":{
		icon: "textures/beardedflea/magical_brewery/items/crackling_oil.png",
		exitPage: "catalyzers"
	},
	"lingering_tier_1_1":{
		icon: "textures/items/dragons_breath",
		exitPage: "catalyzers"
	},
}



//let dummyTomePlayerData = {
	// "Beardedflea5998":
	// {
	// 	unlocked_chapters:
	// 			{
	// 				"Main": ["Ageing", "Crystallography", "Brewing", "About the Author"],

	// 				//Ageing Chapters & subChapters
	// 				"Ageing": ["Casks", "Seals"],
	// 				"Casks": ["Cask Degrading", "Theories: Cask Effects"],
	// 				"Seals": ["Base Seal", "Longevity", "Potency", "Retainment"],
					
	// 				//Crystal Chapters and subChapters
	// 				"Crystallography": ["Purifying", "Crystal Seeds", "Crystal Harvesting"],
	// 				"Purifying": ["Washing", "Heat Treating", "Lunar Charging"],
	// 				"Crystal Seeds": ["Theories: Glowstone"],

	// 				//Brewing Chapters & subChapters
	// 				"Brewing" : ["Enhanced Potions"],
	// 				"Enhanced Potions": ["Potency +", "Duration +"]
	// 			},
	// 	page_last_opened: "Main",
	// }
//}
