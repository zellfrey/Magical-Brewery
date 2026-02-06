import {system} from '@minecraft/server';
import {ActionFormData} from "@minecraft/server-ui";
import {setMainHand} from '../utils/containerUtils.js';
import {TOME_CHAPTERS, SEAL_CHAPTERS, CRYSTAL_CHAPTERS, BREWING_CHAPTERS, TEMP_CHAPTERS} from "tome/tomeChapters.js"
import {getTomePageButtonLayout} from "tome/tome.js"

//Implement the use of pages to be opened but only have those chapters
//Create separate function for chapters only
system.beforeEvents.startup.subscribe(eventData => {
    eventData.itemComponentRegistry.registerCustomComponent('magical_brewery:ou_get_pages', {
        onUse(e,p) {
			
			let pagesChapters = getPagesChapters(p.params.tome_chapter)
			
			if(e.source.isSneaking){
				addPagesChaptersToPlayer(e.source, p.params, pagesChapters)
			} 
			else{
				createPagesFormData(p.params.tome_chapter, e.source, pagesChapters)
			}		
        }
    });
});

function addPagesChaptersToPlayer(player, pagesParameters, pagesChapters){

	let tomePlayerData = player.getDynamicProperty('magical_brewery:tome_data_v2');

	if(!tomePlayerData){
		player.sendMessage({ translate: "magical_brewery:message.tome.chapter_pages.add"})
		return false;
	}

	tomePlayerData = JSON.parse(tomePlayerData);

	if(!doesPlayerMeetChapterRequirements(player, tomePlayerData, pagesParameters)) return;
	
	//We set players last page as the obtained chapter to show whats been added
	
	tomePlayerData = addChaptersToPlayerTomeData(tomePlayerData, pagesChapters)

	tomePlayerData.page_last_opened = pagesParameters.tome_parent_chapter;

	player.setDynamicProperty('magical_brewery:tome_data_v2', JSON.stringify(tomePlayerData))

	destroyItemChapterPages(player, pagesParameters.tome_chapter)
	
}

function doesPlayerMeetChapterRequirements(player, tomePlayerData, pagesParameters){

	
	//TODO Make check for multiple parent chapters
	//TODO don't check multiple parent chapters. Have a page give information for specific chapters only. Don't rock the boat
	//by adding chapters in various places.
	if(!Object.keys(tomePlayerData.unlocked_chapters).includes(pagesParameters.tome_parent_chapter)){	

		//TODO change object
		player.sendMessage({ translate: "magical_brewery:message.tome.chapter_pages.insufficient_knowledge"})
		return false;
	}
	//TODO: Check playerDB for value in parentChapter Key - DONE
	else if(tomePlayerData.unlocked_chapters[pagesParameters.tome_parent_chapter].includes(pagesParameters.tome_chapter)){

		player.sendMessage({ translate: "magical_brewery:message.tome.chapter_pages.owned"})
		return false;
	}

	return true;
}

export function getPagesChapters(pagesChapters){

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
		case "Memories":
			pagesChapters = TEMP_CHAPTERS;
		break;
	}
	return pagesChapters;
}

function createPagesFormData(tomeChapter, player, pagesChapters){
	
	let form = new ActionFormData();

	form.title({translate: TOME_CHAPTERS[tomeChapter].title});
	form.body({translate: TOME_CHAPTERS[tomeChapter].body});
	
	let buttonLayout = getTomePageButtonLayout(TOME_CHAPTERS[tomeChapter], pagesChapters[tomeChapter]);
		
	buttonLayout.forEach(el => form.button(el.chapter, el.icon))
	
	displayPagesFormData(form, player, TOME_CHAPTERS[tomeChapter], pagesChapters)

	player.dimension.playSound("item.book.page_turn", player.location, {volume: 0.7, pitch: 1})
}

function displayPagesFormData(form, player, tomeChapter, pagesChapters){

	form.show(player)
	.then((response) => {
		
		if (response.canceled) {
			player.dimension.playSound("item.book.put", player.location, {volume: 0.7, pitch: 0.7})
			return;
		}
		
		if(response.selection === tomeChapter.buttons.length){
			
			createPagesFormData(tomeChapter.exitPage, player, pagesChapters)
		}
		else{
			createPagesFormData(tomeChapter.buttons[response.selection].id, player, pagesChapters);
		}
		
	})
	.catch((e) => {
		console.error(e, e.stack);
	});
}

export function addChaptersToPlayerTomeData(tomePlayerData, pagesChapters){

	for (const [key, values] of Object.entries(pagesChapters)) {
		
		if(tomePlayerData.unlocked_chapters[key] && tomePlayerData.unlocked_chapters[key].length != 0){
				
			values.forEach(el => tomePlayerData.unlocked_chapters[key].push(el))

		}else{
			tomePlayerData.unlocked_chapters[key] = values;
		}
	}
	return tomePlayerData;
}

function destroyItemChapterPages(player, pagesChapter){
	const equipment = player.getComponent('equippable');
	const selectedItem = equipment.getEquipment('Mainhand');
	
	setMainHand(player, equipment, selectedItem, undefined);
	
	player.dimension.playSound("ui.cartography_table.take_result", player.location, {volume: 0.6, pitch: 1})

	const pagesAddedMessage = {
	translate: "magical_brewery:message.tome.chapter_pages.added",
	with: { rawtext: [{ translate: `magical_brewery:tome_chapter_${pagesChapter}.title` }] },
	};
	
	player.sendMessage(pagesAddedMessage);
}