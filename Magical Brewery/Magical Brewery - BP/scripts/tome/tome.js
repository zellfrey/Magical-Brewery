import {system, world} from '@minecraft/server';
import {ActionFormData} from "@minecraft/server-ui";
import {TOME_CHAPTERS, STARTER_CHAPTERS} from "tome/tomeChapters.js"
import {getPagesChapters, addChaptersToPlayerTomeData} from "tome/pages.js"

let dummyTomePlayerData = {
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
}

system.beforeEvents.startup.subscribe(eventData => {
    eventData.itemComponentRegistry.registerCustomComponent('magical_brewery:on_use_brewers_tome', {
        onUse(e) {

			let tomePlayerData = JSON.parse(e.source.getDynamicProperty('magical_brewery:tome_data_v2'))
			
			if(!tomePlayerData){
				createTomeDataV2(e.source)
				e.source.sendMessage({ translate: "magical_brewery:message.tome.chapter_pages.missing"});
				tomePlayerData = JSON.parse(e.source.getDynamicProperty('magical_brewery:tome_data_v2'))
			}
			let playerLastOpenedPage = e.source.isSneaking ? "Main" : getTomePlayerLastPage(e.source);
			createTomeFormData(playerLastOpenedPage, e.source, tomePlayerData)
        }
    });
});
function createTomeFormData(tomePage, player, tomePlayerData){
	
	let form = new ActionFormData();

	form.title({translate: TOME_CHAPTERS[tomePage].title});
	form.body({translate: TOME_CHAPTERS[tomePage].body});
	
	let buttonLayout = getTomePageButtonLayout(TOME_CHAPTERS[tomePage], tomePlayerData.unlocked_chapters[tomePage]);
	
	buttonLayout.forEach(el => form.button(el.chapter, el.icon))
	
	if(TOME_CHAPTERS[tomePage].exitPage) form.button("Go back", "")
	
	displayTomePageFormData(form, player, tomePlayerData, tomePage, TOME_CHAPTERS[tomePage].exitPage, buttonLayout)
	
	player.dimension.playSound("item.book.page_turn", player.location, {volume: 0.7, pitch: 1})
}

export function getTomePageButtonLayout(tomeChaptersPage, unlockedChapters){

	let buttonPageLayout = [];
	tomeChaptersPage.buttons.forEach(el => {
			if(unlockedChapters.includes(el.id)){
				buttonPageLayout.push(el)
			}
		})
	
	return buttonPageLayout;
}

function displayTomePageFormData(form, player, tomePlayerData, tomePage, exitPage, buttons){

	form.show(player)
	.then((response) => {
		
		if (response.canceled){ 
			
			tomePlayerData.page_last_opened = tomePage;
			player.setDynamicProperty('magical_brewery:tome_data_v2', JSON.stringify(tomePlayerData))
			player.dimension.playSound("item.book.put", player.location, {volume: 0.7, pitch: 0.7})
			
			return;
		}
		if(response.selection === buttons.length){
			
			createTomeFormData(exitPage, player, tomePlayerData)
		}
		else{
			createTomeFormData(buttons[response.selection].id, player, tomePlayerData);
		}
		
	})
	.catch((e) => {
		console.error(e, e.stack);
	});
}

function createTomeDataV2(player){

	const tomeChapterData = {
		unlocked_chapters:{},
		page_last_opened: "Main",
	};

	for (const [key, value] of Object.entries(STARTER_CHAPTERS)) {
		tomeChapterData.unlocked_chapters[key] = value;
	}
	
	player.setDynamicProperty('magical_brewery:tome_data_v2', JSON.stringify(tomeChapterData))
}

function getTomePlayerLastPage(player){
	let tomePlayerData = JSON.parse(player.getDynamicProperty('magical_brewery:tome_data_v2'));
	return tomePlayerData.page_last_opened;
}

// world.afterEvents.worldLoad.subscribe((e) => {

// 	// if(!e.initialSpawn) return;
// 	//console.log()
// 	checkPlayerTomeData(world.getPlayers()[0])

// });

world.afterEvents.playerSpawn.subscribe((e) => {

	if(!e.initialSpawn) return;
	
	checkPlayerTomeData(e.player)

});

function checkPlayerTomeData(player){
	const tomeDataV1 = player.getDynamicProperty('magical_brewery:tome_data');

	if(!tomeDataV1){
		console.log(`${player.name} does not have tome data V1, skipping...`);
		return;
	}

	const tomeDataV2 = player.getDynamicProperty('magical_brewery:tome_data_v2');

	if(tomeDataV2){
		console.log(`${player.name} already has tome data V2, skipping...`);
		return;
	}
	else{
		convertToTomeDataV2(player, tomeDataV1)
	}
	
}

function convertToTomeDataV2(player, tomeDataV1){

	//Setup tomeDataV2 structure and add Main Chapters
	console.log(`Setting up tome data v2 structure for ${player.name}`);
	createTomeDataV2(player);


	console.log(`Iterating through v1 tome data ${player.name}`);
	
	const playerTomeDataV1 = JSON.parse(tomeDataV1)
	let playerTomeDataV2 = JSON.parse(player.getDynamicProperty('magical_brewery:tome_data_v2'));
	
	playerTomeDataV1.unlocked_chapters.forEach(chapter =>{

		let pagesChapterObject;

		switch(chapter){
			case "Crystallography":
				pagesChapterObject = getPagesChapters("Crystallography");
			break;
			case "Seals":
				pagesChapterObject = getPagesChapters("Seals");
			break;
			case "Brewing":
				pagesChapterObject = getPagesChapters("Brewing");
			break;
		}

		if(pagesChapterObject){
			console.log(`Found tome chapter: ${chapter}. Adding to ${player.name}'s tome data v2...`)
			console.log(JSON.stringify(pagesChapterObject))
			playerTomeDataV2 = addChaptersToPlayerTomeData(playerTomeDataV2, pagesChapterObject);
		}
	});
	player.setDynamicProperty('magical_brewery:tome_data_v2', JSON.stringify(playerTomeDataV2))
}	