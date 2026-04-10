import {system, world} from '@minecraft/server';
import {ActionFormData} from "@minecraft/server-ui";
import {TOME_CHAPTERS, PAGES_CHAPTERS} from "tome/tomeChapters.js"
import {TOME_RESEARCH_ITEMS} from "tome/tomeResearchData.js"
import {MinecraftPotion} from "../potion/MinecraftPotion.js";
import {getPagesChapters, addChaptersToPlayerTomeData} from "tome/pages.js"


system.beforeEvents.startup.subscribe(eventData => {
    eventData.itemComponentRegistry.registerCustomComponent('magical_brewery:on_use_brewers_tome', {
        onUse(e) {

			let tomePlayerData = e.source.getDynamicProperty('magical_brewery:tome_data_v2');
			let playerLastOpenedPage = "main";
			
			if(!tomePlayerData){
				createTomeDataV2(e.source)
				e.source.sendMessage({ translate: "magical_brewery:message.tome.chapter_pages.missing"});
				tomePlayerData = JSON.parse(e.source.getDynamicProperty('magical_brewery:tome_data_v2'));
			}

			if(tomePlayerData && e.source.isSneaking){
				playerLastOpenedPage = "main";
			}

			tomePlayerData = JSON.parse(tomePlayerData)
			playerLastOpenedPage = getTomePlayerLastPage(e.source);

			createTomeFormData(playerLastOpenedPage, e.source, tomePlayerData)
        }
    });
});

function createTomeFormData(tomePage, player, tomePlayerData){

	let form = new ActionFormData();

	form.title({translate: `magical_brewery:tome_chapter_${tomePage}.title`});
	form.body({translate: `magical_brewery:tome_chapter_${tomePage}.body`});
	
	let buttonLayout = getTomePageButtonLayout(tomePlayerData.unlocked_chapters[tomePage]);
	
	buttonLayout.forEach(el => form.button(`magical_brewery:tome_chapter_${TOME_CHAPTERS[el].id}.title`, TOME_CHAPTERS[el].icon))
	
	if(TOME_CHAPTERS[tomePage].exitPage) form.button("Go back", "");

	displayTomePageFormData(form, player, tomePlayerData.unlocked_chapters[tomePage], tomePlayerData, tomePage)

	player.dimension.playSound("item.book.page_turn", player.location, {volume: 0.7, pitch: 1})
}

export function getTomePageButtonLayout(unlockedChapters){

	let buttonPageLayout = [];
	if(!unlockedChapters){
		return buttonPageLayout;
	}else{
		unlockedChapters.forEach(el => buttonPageLayout.push(el))
		return buttonPageLayout;
	}
}
function displayTomePageFormData(form, player, tomePageChapters = [], tomePlayerData, tomePage){

	form.show(player)
	.then((response) => {
		
		if (response.canceled){ 
			
			tomePlayerData.page_last_opened = tomePage;
			player.setDynamicProperty('magical_brewery:tome_data_v2', JSON.stringify(tomePlayerData))
			player.dimension.playSound("item.book.put", player.location, {volume: 0.7, pitch: 0.7})
			
			return;
		}
		if(response.selection === (tomePageChapters.length)){
			createTomeFormData(TOME_CHAPTERS[tomePage].exitPage, player, tomePlayerData)
		}
		else{
			createTomeFormData(tomePageChapters[response.selection], player, tomePlayerData);
		}
	})
	.catch((e) => {
		console.error(e, e.stack);
	});
}

function createTomeDataV2(player){

	const tomeChapterData = {
		unlocked_chapters:{},
		page_last_opened: "main",
	};

	for (const [key, value] of Object.entries(PAGES_CHAPTERS["starter"])) {
		tomeChapterData.unlocked_chapters[key] = value;
	}
	
	player.setDynamicProperty('magical_brewery:tome_data_v2', JSON.stringify(tomeChapterData))
}

function getTomePlayerLastPage(player){
	let tomePlayerData = JSON.parse(player.getDynamicProperty('magical_brewery:tome_data_v2'));
	return tomePlayerData.page_last_opened;
}

//Tome research functions----------------------
world.afterEvents.itemUse.subscribe((e) => {
	const equipment = e.source.getComponent('equippable');
	const offHandItem = equipment.getEquipment('Offhand');

	if(!e.itemStack || !offHandItem || offHandItem.typeId !== "magical_brewery:brewers_tome") return;
	
	tomeResearchItem(e.source, e.itemStack)
});

function tomeResearchItem(source, itemStack){

	let tomePlayerData = JSON.parse(source.getDynamicProperty('magical_brewery:tome_data_v2'));
	
	if(!TOME_RESEARCH_ITEMS.has(itemStack.typeId)){
		source.sendMessage("There doesn't seem to be much to learn from this item.")
		return;
	}
	else if(canPlayerResearchItem(source, tomePlayerData)){
		researchItemStack(source, itemStack, tomePlayerData)
	}
}

function canPlayerResearchItem(player, tomePlayerData){
	if(!tomePlayerData){
		player.sendMessage("You doughnut. How can you study something when you don't even know what subject you are researching")
		//The magicks in the tome yearn to be understood
		return false;
	}
	
	else if(!tomePlayerData["unlocked_chapters"].hasOwnProperty("brewing")){
		player.sendMessage({ translate: "magical_brewery:message.tome.chapter_pages.insufficient_knowledge"})
		return false;
	}
	else{
		return true;
	}
}

function researchItemStack(player, itemStack, tomeData){
	
	const researchItem = TOME_RESEARCH_ITEMS.get(itemStack.typeId);

	if(itemStack.typeId === "minecraft:potion"){
		addMCPotionResearchtoTomeData(player, itemStack, tomeData);		
	}
	else{
		switch(researchItem.type){
			case "clue":
				addClueReseachtoTomeData(researchItem, player, tomeData);
			case "multi-clue":
				//addMultiClueResearchtoTomeData();
		}
	}	
}
function addMCPotionResearchtoTomeData( player, itemStack, tomeData){

	let potion = {"effectID": "", "deliveryType": ""};
	potion = MinecraftPotion.getPotionProperties(itemStack, potion)
	
	let potionEffect = potion["effectID"].split(":")[1]; 
	
	if(MinecraftPotion.isPotionEnhanced(potion["effectID"])){
		potionEffect = potionEffect.split("_");
		potionEffect.shift();
		potionEffect = potionEffect.join("_");
	}
	if(tomeData.unlocked_chapters["ingredients"].includes(potionEffect + "_2")){
		player.sendMessage("I already know how to make this potion")
	}
	else if(tomeData.unlocked_chapters["ingredients"].includes(potionEffect + "_1")){
		
		const researchPartIndex = tomeData.unlocked_chapters["ingredients"].findIndex(el => el === potionEffect + "_1");

		tomeData.unlocked_chapters["ingredients"].splice(researchPartIndex, 1, potionEffect + "_2");

		player.setDynamicProperty('magical_brewery:tome_data_v2', JSON.stringify(tomeData));

		player.sendMessage("i now have a new potion recipe")

	}else{
		player.sendMessage("I don't know how to make this potion.")
	}
}

function addClueReseachtoTomeData(researchItem, player, tomeData){
	
	const chapterPart = researchItem.part.slice(0, researchItem.part.length-2);
	if(!tomeData.unlocked_chapters[researchItem.tome_chapter]){
		tomeData.unlocked_chapters[researchItem.tome_chapter] = [];
	}
	
	if(tomeData.unlocked_chapters[researchItem.tome_chapter].includes(researchItem.part)){
		player.sendMessage("There is no further research that can be obtained from this item...")
		return;
	}
	else if(tomeData.unlocked_chapters[researchItem.tome_chapter].includes(chapterPart + "_2")){
		player.sendMessage("I have already found the potion associated with this ingredient")
		return;
	}
	else{
		tomeData.unlocked_chapters[researchItem.tome_chapter].push(researchItem.part);
		console.log(tomeData.unlocked_chapters[researchItem.tome_chapter]);
		//TODO: Add custom research part messages
		player.sendMessage({ translate: `magical_brewery:message.tome.${researchItem.tome_chapter}.discovery.${researchItem.part}`});
		
		tomeData.page_last_opened = researchItem.tome_chapter;
		player.setDynamicProperty('magical_brewery:tome_data_v2', JSON.stringify(tomeData));

		return;
	}
	
}
//Tome V2 conversion functions ---------------
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
				pagesChapterObject = getPagesChapters("crystallography");
			break;
			case "Seals":
				pagesChapterObject = getPagesChapters("seals");
			break;
			case "Brewing":
				pagesChapterObject = getPagesChapters("brewing");
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