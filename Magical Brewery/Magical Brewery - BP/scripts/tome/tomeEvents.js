import {system, world} from '@minecraft/server';
import { Tome } from './Tome.js';
import { TomeResearch } from './TomeResearch.js';

//Tome item usage
system.beforeEvents.startup.subscribe(eventData => {
	eventData.itemComponentRegistry.registerCustomComponent('magical_brewery:on_use_brewers_tome', {
		onUse(e) {

			let tomePlayerData = e.source.getDynamicProperty('magical_brewery:tome_data_v2');
			let playerLastOpenedPage = "main";
			
			if(!tomePlayerData){
				Tome.createTomeDataV2(e.source)
				TomeResearch.createTomeResearchData(e.source)
				e.source.sendMessage({ translate: "magical_brewery:message.tome.chapter_pages.missing"});
				tomePlayerData = JSON.parse(e.source.getDynamicProperty('magical_brewery:tome_data_v2'));
				
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


world.afterEvents.itemUse.subscribe((e) => {
	const equipment = e.source.getComponent('equippable');
	const offHandItem = equipment.getEquipment('Offhand');

	if(!e.itemStack || !offHandItem || offHandItem.typeId !== "magical_brewery:brewers_tome") return;
	
	TomeResearch.tomeResearchItem(e.source, e.itemStack)
});

world.afterEvents.playerSpawn.subscribe((e) => {

	if(!e.initialSpawn) return;
	
	Tome.checkPlayerTomeData(e.player)

});