
export const STARTER_CHAPTERS = ["Main", "Ageing", "Casks", "Theories: Cask Effects", "About the Author"]
//"Cask Degrading",
export const CRYSTAL_CHAPTERS = ["Crystallography", "Purifying", "Washing", "Heat Treating", "Lunar Charging", "Crystal Seeds", "Theories: Glowstone", "Crystal Harvesting"]

export const SEAL_CHAPTERS = ["Seals", "Base Seal", "Longevity", "Potency", "Expansion", "Retainment"]

export const BREWING_CHAPTERS = ["Brewing", "Enhanced Potions", "Potency +", "Duration +", "Expansion +", "Ingredients", "Potion Materials", "Glass", "Amethyst"]

//Add "Expansion", "Retainment"
export const TOME_CHAPTERS = {
	"Main": {
        title: "magical_brewery:tome_chapter_main.title",
        body: "magical_brewery:tome_chapter_main.body",
        buttons: [
			{
				chapter: "magical_brewery:tome_chapter_ageing.title",
				id: "Ageing",
				icon: "textures/beardedflea/magical_brewery/tome/chapter_icon_cask.png"
			},
			{
				chapter: "magical_brewery:tome_chapter_crystallography.title",
				id: "Crystallography",
				icon: "textures/beardedflea/magical_brewery/blocks/crystals/glowstone_cluster.png"
			},
			{
				chapter: "magical_brewery:tome_chapter_brewing.title",
				id: "Brewing",
				icon: "textures/items/brewing_stand"
			},
			{
				chapter: "About the Author",
				id: "About the Author",
				icon: "textures/beardedflea/magical_brewery/items/chapter_of_wisdom_3.png"
			}
		],
		exitPage: ""
    },
	////Crystallography and various subChapters
	"Crystallography": {
        title: "magical_brewery:tome_chapter_crystallography.title",
        body: "magical_brewery:tome_chapter_crystallography.body",
        buttons: [
			{
				chapter: "magical_brewery:tome_chapter_purifying.title",
				id: "Purifying",
				icon: "textures/beardedflea/magical_brewery/items/pure_glowstone_dust.png"
			},
			{
				chapter: "magical_brewery:tome_chapter_crystal_seeds.title",
				id: "Crystal Seeds",
				icon: "textures/beardedflea/magical_brewery/items/pure_quartz_seed.png"
			},
			{
				chapter: "magical_brewery:tome_chapter_crystal_harvesting.title",
				id: "Crystal Harvesting",
				icon: "textures/beardedflea/magical_brewery/items/redstone_shard.png"
			}
		],
		exitPage: "Main"
    },
	//Crystallography SubChapters
	"Purifying": {
        title: "magical_brewery:tome_chapter_purifying.title",
        body: "magical_brewery:tome_chapter_purifying.body",
        buttons: [
			{
				chapter: "magical_brewery:tome_chapter_washing.title",
				id: "Washing",
				icon: "textures/beardedflea/magical_brewery/tome/chapter_icon_washing.png"
			},
			{
				chapter: "magical_brewery:tome_chapter_heat_treating.title",
				id: "Heat Treating",
				icon: "textures/beardedflea/magical_brewery/tome/chapter_icon_heat_treating.png"
			},
			{
				chapter: "magical_brewery:tome_chapter_lunar_charging.title",
				id: "Lunar Charging",
				icon: "textures/beardedflea/magical_brewery/tome/chapter_icon_lunar_charging.png"
			},
		],
		exitPage: "Crystallography"
	},
	//Purifying SubChapters
	"Washing": {
        title: "magical_brewery:tome_chapter_washing.title",
        body: "magical_brewery:tome_chapter_washing.body",
        buttons: [],
		exitPage: "Purifying"
	},
	"Heat Treating": {
        title: "magical_brewery:tome_chapter_heat_treating.title",
        body: "magical_brewery:tome_chapter_heat_treating.body",
        buttons: [],
		exitPage: "Purifying"
	},
	"Lunar Charging": {
        title: "magical_brewery:tome_chapter_lunar_charging.title",
        body: "magical_brewery:tome_chapter_lunar_charging.body",
        buttons: [],
		exitPage: "Purifying"
	},
	"Crystal Seeds": {
        title: "magical_brewery:tome_chapter_crystal_seeds.title",
        body: "magical_brewery:tome_chapter_crystal_seeds.body",
        buttons: [
			{
				chapter: "magical_brewery:tome_chapter_theories_glowstone.title",
				id: "Theories: Glowstone",
				icon: "textures/beardedflea/magical_brewery/tome/chapter_icon_theories_glowstone.png"
			},
		],
		exitPage: "Crystallography"
	},
	//Crystal Harvesting sub chapters 
	"Theories: Glowstone": {
        title: "magical_brewery:tome_chapter_theories_glowstone.title",
        body: "magical_brewery:tome_chapter_theories_glowstone.body",
        buttons: [],
		exitPage: "Crystal Seeds"
	},
	"Crystal Harvesting": {
        title: "magical_brewery:tome_chapter_crystal_harvesting.title",
        body: "magical_brewery:tome_chapter_crystal_harvesting.body",
        buttons: [],
		exitPage: "Crystallography"
	},
	"Ageing": {
        title: "magical_brewery:tome_chapter_ageing.title",
        body: "magical_brewery:tome_chapter_ageing.body",
        buttons: [
			{
				chapter: "magical_brewery:tome_chapter_casks.title",
				id: "Casks",
				icon: "textures/beardedflea/magical_brewery/tome/chapter_icon_cask.png"
			},
			{
				chapter: "magical_brewery:tome_chapter_seals.title",
				id: "Seals",
				icon: "textures/beardedflea/magical_brewery/items/seals/seal_potency_1.png"
			},
		],
		exitPage: "Main"
    },
	//Ageing SubChapters
	"Casks": {
        title: "magical_brewery:tome_chapter_casks.title",
        body: "magical_brewery:tome_chapter_casks.body",
        buttons: [
			{
				chapter: "magical_brewery:tome_chapter_cask_degrading.title",
				id: "Cask Degrading",
				icon: "textures/beardedflea/magical_brewery/tome/chapter_icon_cask_degrading.png"
			},
			{
				chapter: "magical_brewery:tome_chapter_theories_cask_effects.title",
				id: "Theories: Cask Effects",
				icon: "textures/items/potion_bottle_turtleMaster"
			}
		],
		exitPage: "Ageing"
	},
	//Cask SubChapter
	"Cask Degrading": {
        title: "magical_brewery:tome_chapter_cask_degrading.title",
        body: "magical_brewery:tome_chapter_cask_degrading.body",
        buttons: [],
		exitPage: "Casks"
	},
	"Theories: Cask Effects": {
        title: "magical_brewery:tome_chapter_theories_cask_effects.title",
        body: "magical_brewery:tome_chapter_theories_cask_effects.body",
        buttons: [],
		exitPage: "Casks"
	},
	"Seals": {
        title: "magical_brewery:tome_chapter_seals.title",
        body: "magical_brewery:tome_chapter_seals.body",
        buttons: [
			{
				chapter: "magical_brewery:tome_chapter_seal_base.title",
				id: "Base Seal",
				icon: "textures/beardedflea/magical_brewery/items/seals/seal_basic.png"
			},
			{
				chapter: "magical_brewery:tome_chapter_seal_longevity.title",
				id: "Longevity",
				icon: "textures/beardedflea/magical_brewery/items/seals/seal_longevity_1.png"
			},
			{
				chapter: "magical_brewery:tome_chapter_seal_potency.title",
				id: "Potency",
				icon: "textures/beardedflea/magical_brewery/items/seals/seal_potency_1.png"
			},
			// {
			// 	chapter: "magical_brewery:tome_chapter_seal_expansion.title",
			// 	id: "Expansion",
			// 	icon: "textures/beardedflea/magical_brewery/items/seals/seal_expansion_1.png"
			// },
			{
				chapter: "magical_brewery:tome_chapter_seal_retainment.title",
				id: "Retainment",
				icon: "textures/beardedflea/magical_brewery/items/seals/seal_retainment.png"
			},
			// {
			// 	chapter: "magical_brewery:tome_chapter_seal_memories.title",
			// 	id: "Memories",
			// 	icon: "textures/beardedflea/magical_brewery/items/seals/seal_memories_temp.png"
			// },
			// {
			// 	chapter: "magical_brewery:tome_chapter_seal_inspiration.title",
			// 	id: "Inspiration",
			// 	icon: "textures/beardedflea/magical_brewery/items/seals/seal_inspiration_dormant.png"
			// },
		],
		exitPage: "Ageing"
    },
	//Seal SubChapters
	"Base Seal": {
        title: "magical_brewery:tome_chapter_seal_base.title",
        body: "magical_brewery:tome_chapter_seal_base.body",
        buttons: [],
		exitPage: "Seals"
	},
	"Longevity": {
        title: "magical_brewery:tome_chapter_seal_longevity.title",
        body: "magical_brewery:tome_chapter_seal_longevity.body",
        buttons: [],
		exitPage: "Seals"
	},
	"Potency": {
        title: "magical_brewery:tome_chapter_seal_potency.title",
        body: "magical_brewery:tome_chapter_seal_potency.body",
        buttons: [],
		exitPage: "Seals"
	},
	"Expansion": {
        title: "magical_brewery:tome_chapter_seal_expansion.title",
        body: "magical_brewery:tome_chapter_seal_expansion.body",
        buttons: [],
		exitPage: "Seals"
	},
	"Retainment": {
        title: "magical_brewery:tome_chapter_seal_retainment.title",
        body: "magical_brewery:tome_chapter_seal_retainment.body",
        buttons: [],
		exitPage: "Seals"
	},
	"Memories": {
        title: "magical_brewery:tome_chapter_seal_memories.title",
        body: "magical_brewery:tome_chapter_seal_memories.body",
        buttons: [],
		exitPage: "Seals"
	},
	"Inspiration": {
        title: "magical_brewery:tome_chapter_seal_inspiration.title",
        body: "magical_brewery:tome_chapter_seal_inspiration.body",
        buttons: [],
		exitPage: "Seals"
	},
	"About the Author": {
        title: "magical_brewery:tome_chapter_author.title",
        body: "magical_brewery:tome_chapter_author.body",
        buttons: [],
		exitPage: "Main"
    },
	"Brewing": {
        title: "magical_brewery:tome_chapter_brewing.title",
        body: "magical_brewery:tome_chapter_brewing.body",
        buttons: [
			{
				chapter: "magical_brewery:tome_chapter_enhanced_potions.title",
				id: "Enhanced Potions",
				icon: "textures/beardedflea/magical_brewery/tome/potion_potency_plus.png"
			},
			// {
			// 	chapter: "magical_brewery:tome_chapter_ingredients.title",
			// 	id: "Ingredients",
			// 	icon: "textures/items/spider_eye_fermented"
			// },
			// {
			// 	chapter: "magical_brewery:tome_chapter_potion_materials.title",
			// 	id: "Potion Materials",
			// 	icon: "textures/beardedflea/magical_brewery/items/redstone_shard.png"
			// }
		],
		exitPage: "Main"
	//Brewing SubChapters
    },
	"Enhanced Potions": {
        title: "magical_brewery:tome_chapter_enhanced_potions.title",
        body: "magical_brewery:tome_chapter_enhanced_potions.body",
        buttons: [
			{
				chapter: "magical_brewery:tome_chapter_potency_plus.title",
				id: "Potency +",
				icon: "textures/beardedflea/magical_brewery/tome/potion_potency_plus.png"
			},
			{
				chapter: "magical_brewery:tome_chapter_duration_plus.title",
				id: "Duration +",
				icon: "textures/beardedflea/magical_brewery/tome/potion_duration_plus.png"
			},
			// {
			// 	chapter: "magical_brewery:tome_chapter_crystal_expansion_plus.title",
			// 	id: "Expansion +",
			// 	icon: "textures/beardedflea/magical_brewery/tome/potion_expansion_plus.png"
			// }
		],
		exitPage: "Brewing"
	},
	//Enhanced Potions SubChapters
	"Potency +": {
        title: "magical_brewery:tome_chapter_potency_plus.title",
        body: "magical_brewery:tome_chapter_potency_plus.body",
        buttons: [],
		exitPage: "Enhanced Potions"
	},
	"Duration +": {
        title: "magical_brewery:tome_chapter_duration_plus.title",
        body: "magical_brewery:tome_chapter_duration_plus.body",
        buttons: [],
		exitPage: "Enhanced Potions"
	},
	"Expansion +": {
        title: "magical_brewery:tome_chapter_expansion_plus.title",
        body: "magical_brewery:tome_chapter_expansion_plus.body",
        buttons: [],
		exitPage: "Enhanced Potions"
	},
	"Ingredients": {
        title: "magical_brewery:tome_chapter_ingredients.title",
        body: "magical_brewery:tome_chapter_ingredients.body",
        buttons: [
			//Probably just a load of sub chapters showing various new potions added my MB
			//However as of right now(28/10/2025) I'm thinking of changing the tome player data structure
			//A flat array was not a pro gamer move
		],
		exitPage: "Brewing"
	},
	"Potion Materials": {
        title: "magical_brewery:tome_chapter_potion_materials.title",
        body: "magical_brewery:tome_chapter_potion_materials.body",
        buttons: [
			{
				chapter: "magical_brewery:tome_chapter_glass_bottle.title",
				id: "Glass",
				icon: "textures/items/potion_bottle_empty"
			},
			{
				chapter: "magical_brewery:tome_chapter_amethyst_bottle.title",
				id: "Amethyst",
				icon: "textures/beardedflea/magical_brewery/items/amethyst/amethyst_bottle.png"
			},
		],
		exitPage: "Brewing"
	},
	//Potion Materials SubChapters
	"Glass": {
        title: "magical_brewery:tome_chapter_glass_bottle.title",
        body: "magical_brewery:tome_chapter_glass_bottle.body",
        buttons: [],
		exitPage: "Enhanced Potions"
	},
	"Amethyst": {
        title: "magical_brewery:tome_chapter_amethyst_bottle.title",
        body: "magical_brewery:tome_chapter_amethyst_bottle.body",
        buttons: [],
		exitPage: "Enhanced Potions"
	}
}