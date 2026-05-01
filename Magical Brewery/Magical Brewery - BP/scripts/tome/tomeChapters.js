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
		"casks": ["cask_degrading", "cask_oddities", "theories_cask_effects"],
		"cask_oddities": [],
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
		"recipes":["ingredients", "catalysers"],
		"ingredients": [],
		"catalysers": [],
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
		icon: "textures/beardedflea/magical_brewery/items/seals/seal_memories.png",
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
	"catalysers": {
		icon: "textures/items/redstone_dust",
		exitPage: "recipes"
	},
	//ingredients chapters
	"strength_1":{
		title: "item.blaze_powder.name",
		icon: "textures/items/blaze_powder",
		exitPage: "ingredients"
	},
	"strength_2":{
		title: "potion.damageBoost.name",
		icon: "textures/beardedflea/magical_brewery/tome/chapter_stren_2.png",
		exitPage: "ingredients"
	},
	"healing_1":{
		title: "item.speckled_melon.name",
		icon: "textures/items/melon_speckled",
		exitPage: "ingredients"
	},
	"healing_2":{
		title: "potion.heal.name",
		icon: "textures/beardedflea/magical_brewery/tome/chapter_heal_2.png",
		exitPage: "ingredients"
	},
	"swiftness_1":{
		title: "item.sugar.name",
		icon: "textures/items/sugar",
		exitPage: "ingredients"
	},
	"swiftness_2":{
		title: "potion.moveSpeed.name",
		icon: "textures/beardedflea/magical_brewery/tome/chapter_swiftness_2.png",
		exitPage: "ingredients"
	},
	"leaping_1":{
		title: "item.rabbit_foot.name",
		icon: "textures/items/rabbit_foot",
		exitPage: "ingredients"
	},
	"leaping_2":{
		title: "potion.jump.name",
		icon: "textures/beardedflea/magical_brewery/tome/chapter_leaping_2.png",
		exitPage: "ingredients"
	},
	"poison_1":{
		title: "item.spider_eye.name",
		icon: "textures/items/spider_eye",
		exitPage: "ingredients"
	},
	"poison_2":{
		title: "potion.poison.name",
		icon: "textures/beardedflea/magical_brewery/tome/chapter_poison_2.png",
		exitPage: "ingredients"
	},
	"nightvision_1":{
		title: "item.golden_carrot.name",
		icon: "textures/items/carrot_golden",
		exitPage: "ingredients"
	},
	"nightvision_2":{
		title: "potion.nightVision.name",
		icon: "textures/beardedflea/magical_brewery/tome/chapter_nightvision_2.png",
		exitPage: "ingredients"
	},
	"regeneration_1":{
		title: "item.ghast_tear.name",
		icon: "textures/items/ghast_tear",
		exitPage: "ingredients"
	},
	"regeneration_2":{
		title: "potion.regeneration.name",
		icon: "textures/beardedflea/magical_brewery/tome/chapter_regeneration_2.png",
		exitPage: "ingredients"
	},
	"water_breathing_1":{
		title: "item.pufferfish.name",
		icon: "textures/items/fish_pufferfish_raw",
		exitPage: "ingredients"
	},
	"water_breathing_2":{
		title: "potion.waterBreathing.name",
		icon: "textures/beardedflea/magical_brewery/tome/chapter_water_breathing_2.png",
		exitPage: "ingredients"
	},
	"fire_resistance_1":{
		title: "item.magma_cream.name",
		icon: "textures/items/magma_cream",
		exitPage: "ingredients"
	},
	"fire_resistance_2":{
		title: "potion.fireResistance.name",
		icon: "textures/beardedflea/magical_brewery/tome/chapter_fire_resistance_2.png",
		exitPage: "ingredients"
	},
	"turtle_master_1":{
		title: "item.turtle_helmet.name",
		icon: "textures/items/turtle_helmet",
		exitPage: "ingredients"
	},
	"turtle_master_2":{
		title: "potion.turtleMaster.name",
		icon: "textures/beardedflea/magical_brewery/tome/chapter_turtle_master_2.png",
		exitPage: "ingredients"
	},
	"slow_falling_1":{
		title: "item.phantom_membrane.name",
		icon: "textures/items/phantom_membrane",
		exitPage: "ingredients"
	},
	"slow_falling_2":{
		title: "potion.slowFalling.name",
		icon: "textures/beardedflea/magical_brewery/tome/chapter_slow_falling_2.png",
		exitPage: "ingredients"
	},
	"wind_charged_1":{
		title: "item.breeze_rod.name",
		icon: "textures/items/breeze_rod",
		exitPage: "ingredients"
	},
	"wind_charged_2":{
		title: "potion.windCharged.name",
		icon: "textures/beardedflea/magical_brewery/tome/chapter_wind_charged_2.png",
		exitPage: "ingredients"
	},
	"infested_1":{
		title: "tile.stone.stone.name",
		icon: "textures/items/stone_axe",
		exitPage: "ingredients"
	},
	"infested_2":{
		title: "potion.infested.name",
		icon: "textures/beardedflea/magical_brewery/tome/chapter_infested_2.png",
		exitPage: "ingredients"
	},
	"weaving_1":{
		title: "tile.web.name",
		icon: "textures/blocks/web",
		exitPage: "ingredients"
	},
	"weaving_2":{
		title: "potion.weaving.name",
		icon: "textures/beardedflea/magical_brewery/tome/chapter_weaving_2.png",
		exitPage: "ingredients"
	},
	"weakness_1":{
		title: "potion.moveSpeed.name",
		icon: "textures/items/spider_eye_fermented",
		exitPage: "ingredients"
	},
	"weakness_2":{
		title: "potion.weakness.name",
		icon: "textures/beardedflea/magical_brewery/tome/chapter_weakness_2.png",
		exitPage: "ingredients"
	},
	"oozing_1":{
		title: "item.slime_ball.name",
		icon: "textures/items/slimeball",
		exitPage: "ingredients"
	},
	"oozing_2":{
		title: "potion.oozing.name",
		icon: "textures/beardedflea/magical_brewery/tome/chapter_oozing_2.png",
		exitPage: "ingredients"
	},
	//catalysers chapters
	"longevity_tier_1_1":{
		title: "tile.redstone_wire.name",
		icon: "textures/items/redstone_dust",
		exitPage: "catalysers"
	},
	"longevity_tier_1_2":{
		icon: "textures/beardedflea/magical_brewery/tome/chapter_longevity_tier_1_2.png",
		exitPage: "catalysers"
	},
	"longevity_tier_2_1":{
		title: "item.magical_brewery:pure_redstone_dust.name",
		icon: "textures/beardedflea/magical_brewery/items/pure_redstone_dust.png",
		exitPage: "catalysers"
	},
	"longevity_tier_2_2":{
		icon: "textures/beardedflea/magical_brewery/tome/chapter_longevity_tier_2_2.png",
		exitPage: "catalysers"
	},
	"potency_tier_1_1":{
		title: "item.glowstone_dust.name",
		icon: "textures/items/glowstone_dust",
		exitPage: "catalysers"
	},
	"potency_tier_1_2":{
		icon: "textures/beardedflea/magical_brewery/tome/chapter_potency_tier_1_2.png",
		exitPage: "catalysers"
	},
	"potency_tier_2_1":{
		title: "item.magical_brewery:pure_glowstone_dust.name",
		icon: "textures/beardedflea/magical_brewery/items/pure_glowstone_dust.png",
		exitPage: "catalysers"
	},
	"potency_tier_2_2":{
		icon: "textures/beardedflea/magical_brewery/tome/chapter_potency_tier_2_2.png",
		exitPage: "catalysers"
	},
	"expansion_tier_1_1":{
		title: "item.gunpowder.name",
		icon: "textures/items/gunpowder",
		exitPage: "catalysers"
	},
	"expansion_tier_1_2":{
		icon: "textures/beardedflea/magical_brewery/tome/chapter_expansion_tier_1_2.png",
		exitPage: "catalysers"
	},
	"expansion_tier_2_1":{
		title: "item.magical_brewery:crackling_oil.name",
		icon: "textures/beardedflea/magical_brewery/items/crackling_oil.png",
		exitPage: "catalysers"
	},
	"lingering_tier_1_1":{
		title: "item.dragon_breath.name",
		icon: "textures/items/dragons_breath",
		exitPage: "catalysers"
	},
	"lingering_tier_1_2":{
		icon: "textures/items/dragons_breath",
		exitPage: "catalysers"
	},
	"echo_tier_1_1":{
		title: "item.magical_brewery:echo_dust.name",
		icon: "textures/beardedflea/magical_brewery/items/echo_dust.png",
		exitPage: "catalysers"
	},
	"echo_tier_1_2":{
		icon: "textures/beardedflea/magical_brewery/tome/chapter_echo_tier_1_2.png",
		exitPage: "catalysers"
	},
	//cask oddities chapters
	"harm_heal_to_decay":{
		icon: "textures/items/dobb",
		exitPage: "cask_oddities"
	},
	"pois_regn_to_mund":{
		icon: "textures/items/dobb",
		exitPage: "cask_oddities"
	},
	"slow_sped_to_mund":{
		icon: "textures/items/dobb",
		exitPage: "cask_oddities"
	},
	"weak_stre_to_mund":{
		icon: "textures/items/dobb",
		exitPage: "cask_oddities"
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
