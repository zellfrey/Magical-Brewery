import {system} from '@minecraft/server';
import {ActionFormData} from "@minecraft/server-ui";
import {setMainHand} from '../utils/containerUtils.js';
import {TOME_CHAPTERS, STARTER_CHAPTERS, CRYSTAL_CHAPTERS, SEAL_CHAPTERS, BREWING_CHAPTERS} from "tome/tomeChapters.js"

let tomePlayerData = {
	"Player":{
		unlocked_chapters:["Main"],
		page_last_opened: "",
	},
	// "Beardedflea5998":{
	// 	unlocked_chapters:["Main"],
	// 	page_last_opened: "Bazinga",
	// }
}

//Implement the use of pages to be opened but only have those chapters
//Create separate function for chapters only
system.beforeEvents.startup.subscribe(eventData => {
    eventData.itemComponentRegistry.registerCustomComponent('magical_brewery:ou_get_pages', {
        onUse(e,p) {
			
			if(e.source.isSneaking){
				addPagesChaptersToPlayer(e.source, p.params.tome_chapter)
			} 
			else{
				createPagesScreen(p.params.tome_chapter, e.source)
			}
			
        }
    });
});

function addPagesChaptersToPlayer(player, mainChapter){

	let tomePlayerData = player.getDynamicProperty('magical_brewery:tome_data')
	
	if(!tomePlayerData){
		player.sendMessage({ translate: "magical_brewery:message.tome.chapter_pages.add"})
		return;
	}
	
	let pagesChapters = getPagesChapters(mainChapter)
	
	tomePlayerData = JSON.parse(tomePlayerData);
	if(tomePlayerData.unlocked_chapters.includes(pagesChapters[0])){

		player.sendMessage({ translate: "magical_brewery:message.tome.chapter_pages.owned"})
		return;

	}else{
		const equipment = player.getComponent('equippable');
		const selectedItem = equipment.getEquipment('Mainhand');
		//We set players last page as the obtained chapter to show whats been added
		
		pagesChapters.forEach(el => tomePlayerData.unlocked_chapters.push(el));
		tomePlayerData.page_last_opened = pagesChapters[0];
		
		setMainHand(player, equipment, selectedItem, undefined);
		
		player.setDynamicProperty('magical_brewery:tome_data', JSON.stringify(tomePlayerData))
		player.dimension.playSound("ui.cartography_table.take_result", player.location, {volume: 0.6, pitch: 1})

		const pagesAddedMessage = {
        translate: "magical_brewery:message.tome.chapter_pages.added",
        with: { rawtext: [{ translate: `magical_brewery:tome_chapter_${mainChapter}.title` }] },
        };
		
		player.sendMessage(pagesAddedMessage);
	}
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
	}
	return pagesChapters;
}

function createPagesScreen(pagesChapters, player){
	
	player.dimension.playSound("item.book.page_turn", player.location, {volume: 0.7, pitch: 1})
	
	let form = new ActionFormData();

	form.title({translate: TOME_CHAPTERS[pagesChapters].title});
	form.body({translate: TOME_CHAPTERS[pagesChapters].body});
	
	TOME_CHAPTERS[pagesChapters].buttons.forEach(el => form.button(el.chapter, el.icon))
	
	form.show(player)
	.then((response) => {
		
		if (response.canceled) {
			player.dimension.playSound("item.book.put", player.location, {volume: 0.7, pitch: 0.7})
			return;
		}
		
		if(response.selection === TOME_CHAPTERS[pagesChapters].buttons.length){
			
			createPagesScreen(TOME_CHAPTERS[pagesChapters].exitPage, player)
		}
		else{
			createPagesScreen(TOME_CHAPTERS[pagesChapters].buttons[response.selection].id, player);
		}
		
	})
	.catch((e) => {
		console.error(e, e.stack);
	});
}

system.beforeEvents.startup.subscribe(eventData => {
    eventData.itemComponentRegistry.registerCustomComponent('magical_brewery:on_use_brewers_tome', {
        onUse(e) {
			
			let tomePlayerData = e.source.getDynamicProperty('magical_brewery:tome_data')
			
			if(!tomePlayerData){
				createTomeData(e.source)
				e.source.sendMessage({ translate: "magical_brewery:message.tome.chapter_pages.missing"});
				tomePlayerData = e.source.getDynamicProperty('magical_brewery:tome_data')
			}
			tomePlayerData = JSON.parse(tomePlayerData)
			
			let playerLastOpenedPage = e.source.isSneaking ? "Main" : getTomePlayerLastPage(e.source)
			
			
			createTomeScreen(playerLastOpenedPage, e.source, tomePlayerData)
        }
    });
});
function createTomeScreen(tomePage, player, tomePlayerData){
	
	player.dimension.playSound("item.book.page_turn", player.location, {volume: 0.7, pitch: 1})
	
	let form = new ActionFormData();

	form.title({translate: TOME_CHAPTERS[tomePage].title});
	form.body({translate: TOME_CHAPTERS[tomePage].body});
	
	let buttonLayout = [];
	TOME_CHAPTERS[tomePage].buttons.forEach(el => {
			if(tomePlayerData.unlocked_chapters.includes(el.id)){
				buttonLayout.push(el)
			}
		})
	
	buttonLayout.forEach(el => form.button(el.chapter, el.icon))
	
	if(TOME_CHAPTERS[tomePage].exitPage) form.button("Go back", "")
	
	form.show(player)
	.then((response) => {
		
		if (response.canceled){ 
			
			tomePlayerData.page_last_opened = tomePage;
			player.setDynamicProperty('magical_brewery:tome_data', JSON.stringify(tomePlayerData))
			player.dimension.playSound("item.book.put", player.location, {volume: 0.7, pitch: 0.7})
			
			return;
		}
		if(response.selection === buttonLayout.length){
			
			createTomeScreen(TOME_CHAPTERS[tomePage].exitPage, player, tomePlayerData)
		}
		else{
			createTomeScreen(buttonLayout[response.selection].id, player, tomePlayerData);
		}
		
	})
	.catch((e) => {
		console.error(e, e.stack);
	});
}

function createTomeData(player){
	const tomeChapterData = {
		unlocked_chapters:[""],
		page_last_opened: "Main",
	};
	STARTER_CHAPTERS.forEach(el => tomeChapterData.unlocked_chapters.push(el))
	player.setDynamicProperty('magical_brewery:tome_data', JSON.stringify(tomeChapterData))
}

function getTomePlayerLastPage(player){
	tomePlayerData = JSON.parse(player.getDynamicProperty('magical_brewery:tome_data'))
	return tomePlayerData.page_last_opened;
}

// function setTomePlayerLastPage(playerName, tomePage){
// 	tomePlayerData[playerName].page_last_opened = tomePage;
// }

// function addTomePlayerChapters(player, tomePlayerData, pagesChapters){
	
// 	pagesChapters.forEach(el => tomePlayerData.unlocked_chapters.push(el));
	
// 	player.setDynamicProperty('magical_brewery:tome_data', JSON.stringify(tomePlayerData))
// }