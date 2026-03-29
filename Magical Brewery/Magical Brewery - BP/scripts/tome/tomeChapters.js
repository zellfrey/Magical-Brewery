export const PAGES_CHAPTERS = {
	"starter":{
		"main": ["ageing", "zzz_about_the_author"],
		"ageing": ["casks"],
		"casks": ["cask_degrading", "theories_cask_effects"]
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
	"Ingredients": [
		{
			chapter: "magical_brewery:tome_chapter_ingredients_stren_1.title",
			id: "stren_1",
			icon: "textures/items/blaze_powder"
		},
		{
			chapter: "magical_brewery:tome_chapter_ingredients_stren_2.title",
			id: "stren_2",
			icon: "textures/beardedflea/magical_brewery/tome/chapter_icon_stren_2.png"
		},
		{
			chapter: "magical_brewery:tome_chapter_ingredients_heal_1.title",
			id: "heal_1",
			icon: "textures/items/melon_speckled"
		},
		{
			chapter: "magical_brewery:tome_chapter_ingredients_heal_2.title",
			id: "heal_2",
			icon: "textures/beardedflea/magical_brewery/tome/chapter_icon_heal_2.png"
		},
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
		id: "main",
		icon: "",
		exitPage: ""
	},
	"zzz_about_the_author": {
		id: "zzz_about_the_author",
		icon: "textures/beardedflea/magical_brewery/items/chapter_of_wisdom_3.png",
		exitPage: "main"
	},
	//Ageing Chapters
	"ageing": {
		id: "ageing",
		icon: "textures/beardedflea/magical_brewery/tome/chapter_icon_cask.png",
		exitPage: "main"
	},
	"casks": {
		id: "casks",
		icon: "textures/beardedflea/magical_brewery/tome/chapter_icon_cask.png",
		exitPage: "main"
	},
	//Casks Chapters
	"cask_degrading": {
		id: "cask_degrading",
		icon: "textures/beardedflea/magical_brewery/tome/chapter_icon_cask_degrading.png",
		exitPage: "casks"
	},
	"theories_cask_effects": {
		id: "theories_cask_effects",
		icon: "textures/items/potion_bottle_turtleMaster",
		exitPage: "main"
	},
	//Crystallography Chapters
	"crystallography": {
		id: "crystallography",
		icon: "textures/beardedflea/magical_brewery/blocks/crystals/glowstone_cluster.png",
		exitPage: "main"
	},
	"purifying": {
		id: "purifying",
		icon: "textures/beardedflea/magical_brewery/items/pure_glowstone_dust.png",
		exitPage: "crystallography"
	},
	//Purifying Chapters
	"washing": {
		id: "washing",
		icon: "textures/beardedflea/magical_brewery/tome/chapter_icon_washing.png",
		exitPage: "purifying"
	},
	"heat_treating": {
		id: "heat_treating",
		icon: "textures/beardedflea/magical_brewery/tome/chapter_icon_heat_treating.png",
		exitPage: "purifying"
	},
	"lunar_charging": {
		id: "lunar_charging",
		icon: "textures/beardedflea/magical_brewery/tome/chapter_icon_lunar_charging.png",
		exitPage: "purifying"
	},
	"crystal_seeds": {
		id: "crystal_seeds",
		icon: "textures/beardedflea/magical_brewery/items/pure_quartz_seed.png",
		exitPage: "crystallography"
	},
	//Crystal Seed Chapters
	"theories_glowstone": {
		id: "theories_glowstone",
		icon: "textures/beardedflea/magical_brewery/tome/chapter_icon_theories_glowstone.png",
		exitPage: "crystal_seeds"
	},
	"crystal_harvesting": {
		id: "purifying",
		icon: "textures/beardedflea/magical_brewery/items/redstone_shard.png",
		exitPage: "crystallography"
	},
	//Seal Chapters
	"seals": {
		id: "seals",
		icon: "textures/beardedflea/magical_brewery/items/seals/seal_potency_1.png",
		exitPage: "ageing"
	},
	"seal_base": {
		id: "seal_base",
		icon: "textures/beardedflea/magical_brewery/items/seals/seal_basic.png",
		exitPage: "seals"
	},
	"seal_longevity": {
		id: "seal_longevity",
		icon: "textures/beardedflea/magical_brewery/items/seals/seal_longevity_1.png",
		exitPage: "seals"
	},
	"seal_potency": {
		id: "seal_potency",
		icon: "textures/beardedflea/magical_brewery/items/seals/seal_potency_1.png",
		exitPage: "seals"
	},
	"seal_expansion": {
		id: "seal_expansion",
        icon: "textures/beardedflea/magical_brewery/items/seals/seal_expansion_1.png",
		exitPage: "seals"
	},
	"seal_retainment": {
		id: "seal_retainment",
		icon: "textures/beardedflea/magical_brewery/items/seals/seal_retainment.png",
		exitPage: "seals"
	},
	"seal_memories": {
		id: "seal_memories",
		icon: "textures/beardedflea/magical_brewery/items/seals/seal_memories_temp.png",
		exitPage: "seals"
	},
	"seal_inspiration": {
		id: "seal_inspiration",
		icon: "textures/beardedflea/magical_brewery/items/seals/seal_inspiration_dormant.png",
		exitPage: "seals"
	},
	//Brewing Chapters
	"brewing": {
		id: "brewing",
		icon: "textures/items/brewing_stand",
		exitPage: "main"
	},
	"recipes": {
		id: "recipes",
		icon: "textures/items/spider_eye_fermented",
		exitPage: "brewing"
	},
	"potion_materials": {
		id: "potion_materials",
		icon: "textures/beardedflea/magical_brewery/items/redstone_shard.png",
		exitPage: "brewing"
	},
	"brewing_research": {
		id: "brewing_research",
		icon: "textures/beardedflea/magical_brewery/tome/chapter_icon_brewing_research.png",
		exitPage: "brewing"
	},
	//Recipes Chapters
	"ingredients": {
		id: "ingredients",
		icon: "textures/items/spider_eye_fermented",
		exitPage: "recipes"
	},
	"catalyzers": {
		id: "catalyzers",
		icon: "textures/items/redstone_dust",
		exitPage: "recipes"
	},
}
