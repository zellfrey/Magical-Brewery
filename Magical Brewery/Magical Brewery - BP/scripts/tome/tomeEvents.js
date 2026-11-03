import {system, world} from '@minecraft/server';
import { Tome } from './Tome.js';
import { TomeResearch } from './TomeResearch.js';
import {TOME_RESEARCH_ITEMS} from "tome/tomeResearchData.js"

//Tome item usage
system.beforeEvents.startup.subscribe(eventData => {
	eventData.itemComponentRegistry.registerCustomComponent('magical_brewery:on_use_brewers_tome', {
		onUse(e) {

			let tomePlayerData = e.source.getDynamicProperty('magical_brewery:tome_data_v2');
			let playerLastOpenedPage = "main";
			
			if(!tomePlayerData){
				Tome.createTomeDataV2(e.source)
				TomeResearch.createTomeResearchData(e.source)
				//let player know that there are pages missing. Opening the book may cause the message to disappear
				e.source.sendMessage({ translate: "magical_brewery:message.tome.chapter_pages.missing"});
				return;
			}

			if(e.source.isSneaking){
				playerLastOpenedPage = "main";
			}
			else{
				playerLastOpenedPage = Tome.getTomePlayerLastPage(e.source);
			}

			tomePlayerData = JSON.parse(tomePlayerData)
			
			Tome.createTomeFormData(playerLastOpenedPage, e.source, tomePlayerData)
		}
	});
});


world.afterEvents.itemCompleteUse.subscribe((e) => {
	const equipment = e.source.getComponent('equippable');
	const offHandItem = equipment.getEquipment('Offhand');
	
	//If there is no item in the mainhand, something is seriously wrong
	if(!e.itemStack || !offHandItem || offHandItem.typeId !== "magical_brewery:brewers_tome" ) return;
	
	TomeResearch.tomeResearchItem(e.source, e.itemStack)
});

world.afterEvents.itemUse.subscribe((e) => {
	const equipment = e.source.getComponent('equippable');
	const offHandItem = equipment.getEquipment('Offhand');

	if(isItemConsumable(e.itemStack) || e.itemStack.hasTag("magical_brewery:tome_pages") 
		|| !offHandItem || offHandItem.typeId !== "magical_brewery:brewers_tome" )return;
	
	if(isMBSplashPotion(e.itemStack) || TOME_RESEARCH_ITEMS.has(e.itemStack.typeId)){
		TomeResearch.tomeResearchItem(e.source, e.itemStack);
	}
	else if(!TOME_RESEARCH_ITEMS.has(e.itemStack.typeId)){
		e.source.sendMessage({ translate: "magical_brewery:message.tome_research_item.invalid"});
	}
});

function isItemConsumable(itemStack){
	return itemStack.hasTag("minecraft:is_food") || itemStack.typeId === "minecraft:potion"
}

function isMBSplashPotion(itemStack){
	return itemStack.hasTag("magical_brewery:splash_potion") || itemStack.hasTag("magical_brewery:xsplash_potion")
}

world.afterEvents.playerSpawn.subscribe((e) => {

	if(!e.initialSpawn) return;
	
	Tome.checkPlayerTomeData(e.player)

});