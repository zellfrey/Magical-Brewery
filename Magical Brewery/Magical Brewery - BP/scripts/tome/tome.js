import {system} from '@minecraft/server';
import {ActionFormData} from "@minecraft/server-ui";
import {setMainHand} from '../utils/containerUtils.js';
import {TOME_CHAPTERS, STARTER_CHAPTERS, SEAL_CHAPTERS, CRYSTAL_CHAPTERS, BREWING_CHAPTERS, TEMP_CHAPTERS} from "tome/tomeChapters.js"

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

//Implement the use of pages to be opened but only have those chapters
//Create separate function for chapters only
system.beforeEvents.startup.subscribe(eventData => {
    eventData.itemComponentRegistry.registerCustomComponent('magical_brewery:ou_get_pages', {
        onUse(e,p) {
			
			if(e.source.isSneaking){
				addPagesChaptersToPlayer(e.source, p.params)
			} 
			else{
				createPagesFormData(p.params.tome_chapter, e.source)
			}		
        }
    });
});

function addPagesChaptersToPlayer(player, pagesParameters){
	
	if(!doesPlayerMeetChapterRequirements(player, pagesParameters)) return;

	let pagesChapters = getPagesChapters(pagesParameters.tome_chapter)
	const equipment = player.getComponent('equippable');
	const selectedItem = equipment.getEquipment('Mainhand');
	//We set players last page as the obtained chapter to show whats been added
	
	addChaptersToPlayerTomeData(player.name, pagesChapters)

	dummyTomePlayerData[player.name].page_last_opened = pagesParameters.tome_parent_chapter;
	
	setMainHand(player, equipment, selectedItem, undefined);
	
	player.dimension.playSound("ui.cartography_table.take_result", player.location, {volume: 0.6, pitch: 1})

	const pagesAddedMessage = {
	translate: "magical_brewery:message.tome.chapter_pages.added",
	with: { rawtext: [{ translate: `magical_brewery:tome_chapter_${pagesParameters.tome_chapter}.title` }] },
	};
	
	player.sendMessage(pagesAddedMessage);
}

function doesPlayerMeetChapterRequirements(player, pagesParameters){

	if(!dummyTomePlayerData[player.name]){
		player.sendMessage({ translate: "magical_brewery:message.tome.chapter_pages.add"})
		return false;
	}
	//TODO Make check for multiple parent chapters
	//TODO don't check multiple parent chapters. Have a page give information for specific chapters only. Don't rock the boat
	//by adding chapters in various places.
	else if(!Object.keys(dummyTomePlayerData[player.name].unlocked_chapters).includes(pagesParameters.tome_parent_chapter)){	

		//TODO change object
		player.sendMessage("You do not have the knowledge required to understand these notes. Your tome needs more stuff")
		return false;
	}
	//TODO: Check playerDB for value in parentChapter Key - DONE
	else if(dummyTomePlayerData[player.name].unlocked_chapters[pagesParameters.tome_parent_chapter].includes(pagesParameters.tome_chapter)){

		player.sendMessage({ translate: "magical_brewery:message.tome.chapter_pages.owned"})
		return false;
	}

	return true;
}
function getPagesChapters(pagesChapters){

	switch(pagesChapters){
		case "Crystallography":
			pagesChapters = CRYSTAL_CHAPTERS;
		break;
		case "Seals":
			pagesChapters = SEAL_CHAPTERS;
		break;
		case "Brewing":
			pagesChapters = BREWING_CHAPTERS;
		break;
		case "Temp":
			pagesChapters = TEMP_CHAPTERS;
		break;
	}
	return pagesChapters;
}

function createPagesFormData(pagesChapters, player){
	
	player.dimension.playSound("item.book.page_turn", player.location, {volume: 0.7, pitch: 1})
	
	let form = new ActionFormData();

	form.title({translate: TOME_CHAPTERS[pagesChapters].title});
	form.body({translate: TOME_CHAPTERS[pagesChapters].body});
	
	TOME_CHAPTERS[pagesChapters].buttons.forEach(el => form.button(el.chapter, el.icon))
	
	displayPagesFormData(form, player, TOME_CHAPTERS[pagesChapters])
	
}

function displayPagesFormData(form, player, pagesChapters){

	form.show(player)
	.then((response) => {
		
		if (response.canceled) {
			player.dimension.playSound("item.book.put", player.location, {volume: 0.7, pitch: 0.7})
			return;
		}
		
		if(response.selection === pagesChapters.buttons.length){
			
			createPagesFormData(pagesChapters.exitPage, player)
		}
		else{
			createPagesFormData(pagesChapters.buttons[response.selection].id, player);
		}
		
	})
	.catch((e) => {
		console.error(e, e.stack);
	});
}

system.beforeEvents.startup.subscribe(eventData => {
    eventData.itemComponentRegistry.registerCustomComponent('magical_brewery:on_use_brewers_tome', {
        onUse(e) {
			if(!dummyTomePlayerData[e.source.name]){
				createTomeData(e.source.name)
				e.source.sendMessage({ translate: "magical_brewery:message.tome.chapter_pages.missing"});
			}
			let playerLastOpenedPage = e.source.isSneaking ? "Main" : dummyTomePlayerData[e.source.name].page_last_opened;
			
			createTomeFormData(playerLastOpenedPage, e.source, dummyTomePlayerData[e.source.name])
        }
    });
});
function createTomeFormData(tomePage, player, tomePlayerData){
	
	player.dimension.playSound("item.book.page_turn", player.location, {volume: 0.7, pitch: 1})
	
	let form = new ActionFormData();

	form.title({translate: TOME_CHAPTERS[tomePage].title});
	form.body({translate: TOME_CHAPTERS[tomePage].body});
	
	let buttonLayout = getTomePageButtonLayout(TOME_CHAPTERS[tomePage], tomePlayerData.unlocked_chapters[tomePage]);
	
	buttonLayout.forEach(el => form.button(el.chapter, el.icon))
	
	if(TOME_CHAPTERS[tomePage].exitPage) form.button("Go back", "")
	
	displayTomePageFormData(form, player, tomePlayerData, tomePage, TOME_CHAPTERS[tomePage].exitPage, buttonLayout)
	
}

function getTomePageButtonLayout(tomeChaptersPage, playerUnlockedChapters){

	let buttonPageLayout = [];
	tomeChaptersPage.buttons.forEach(el => {
			if(playerUnlockedChapters.includes(el.id)){
				buttonPageLayout.push(el)
			}
		})
	
	return buttonPageLayout;
}

function displayTomePageFormData( form, player, tomePlayerData, tomePage, exitPage, buttons){

	form.show(player)
	.then((response) => {
		
		if (response.canceled){ 
			
			tomePlayerData.page_last_opened = tomePage;
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

function createTomeData(player){

	dummyTomePlayerData[player] = {
		unlocked_chapters:{},
		page_last_opened: "Main",
	};

	for (const [key, value] of Object.entries(STARTER_CHAPTERS)) {
		dummyTomePlayerData[player].unlocked_chapters[key] = value;
	}
}


// function setTomePlayerLastPage(playerName, tomePage){
// 	tomePlayerData[playerName].page_last_opened = tomePage;
// }

function addChaptersToPlayerTomeData(player, pagesChapters){

	for (const [key, values] of Object.entries(pagesChapters)) {
		
		if(dummyTomePlayerData[player].unlocked_chapters[key] && dummyTomePlayerData[player].unlocked_chapters[key].length != 0){
				
			values.forEach(el => dummyTomePlayerData[player].unlocked_chapters[key].push(el))

		}else{
			dummyTomePlayerData[player].unlocked_chapters[key] = values;
		}
	}
}