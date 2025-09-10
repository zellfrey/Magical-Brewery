
export const STARTER_CHAPTERS = ["Main", "Ageing", "Casks", "Theories: Cask Effects", "About the Author"]

export const CRYSTAL_CHAPTERS = ["Crystallography", "Purifying", "Washing", "Heat Treating", "Lunar Charging", "Crystal Seeds", "Theories: Glowstone", "Crystal Harvesting"]

export const SEAL_CHAPTERS = ["Seals", "Base Seal", "Longevity", "Potency", "Expansion", "Retainment"]

//Add "Expansion", "Retainment"
export const TOME_CHAPTERS = {
	"Main": {
        title: "magical_brewery:tome_chapter_main.title",
        body: "magical_brewery:tome_chapter_main.body",
        buttons: [
			{
				chapter: "magical_brewery:tome_chapter_ageing.title",
				id: "Ageing",
				icon: "textures/tome/chapter_icon_cask.png"
			},
			{
				chapter: "magical_brewery:tome_chapter_crystallography.title",
				id: "Crystallography",
				icon: "textures/blocks/crystals/glowstone_cluster.png"
			},
			{
				chapter: "About the Author",
				id: "About the Author",
				icon: "textures/items/chapter_of_wisdom_3.png"
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
				icon: "textures/items/pure_glowstone_dust.png"
			},
			{
				chapter: "magical_brewery:tome_chapter_crystal_seeds.title",
				id: "Crystal Seeds",
				icon: "textures/items/pure_quartz_seed.png"
			},
			{
				chapter: "magical_brewery:tome_chapter_crystal_harvesting.title",
				id: "Crystal Harvesting",
				icon: "textures/items/redstone_shard.png"
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
				icon: "textures/tome/chapter_icon_washing.png"
			},
			{
				chapter: "magical_brewery:tome_chapter_heat_treating.title",
				id: "Heat Treating",
				icon: "textures/tome/chapter_icon_heat_treating.png"
			},
			{
				chapter: "magical_brewery:tome_chapter_lunar_charging.title",
				id: "Lunar Charging",
				icon: "textures/tome/chapter_icon_lunar_charging.png"
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
				icon: "textures/tome/chapter_icon_theories_glowstone.png"
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
				icon: "textures/tome/chapter_icon_cask.png"
			},
			{
				chapter: "magical_brewery:tome_chapter_seals.title",
				id: "Seals",
				icon: "textures/items/seals/seal_potency_1.png"
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
				chapter: "magical_brewery:tome_chapter_theories_cask_effects.title",
				id: "Theories: Cask Effects",
				icon: "textures/items/potion_bottle_turtleMaster"
			}
		],
		exitPage: "Ageing"
	},
	//Cask SubChapter
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
				icon: "textures/items/seals/seal_basic.png"
			},
			{
				chapter: "magical_brewery:tome_chapter_seal_longevity.title",
				id: "Longevity",
				icon: "textures/items/seals/seal_longevity_1.png"
			},
			{
				chapter: "magical_brewery:tome_chapter_seal_potency.title",
				id: "Potency",
				icon: "textures/items/seals/seal_potency_1.png"
			},
			{
				chapter: "magical_brewery:tome_chapter_seal_expansion.title",
				id: "Expansion",
				icon: "textures/items/seals/seal_expansion_1.png"
			},
			{
				chapter: "magical_brewery:tome_chapter_seal_retainment.title",
				id: "Retainment",
				icon: "textures/items/seals/seal_retainment.png"
			},
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
	"About the Author": {
        title: "magical_brewery:tome_chapter_author.title",
        body: "magical_brewery:tome_chapter_author.body",
        buttons: [],
		exitPage: "Main"
    },
}