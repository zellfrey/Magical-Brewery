import {system, world} from '@minecraft/server';
import {TOME_RESEARCH_ITEMS} from "tome/tomeResearchData.js"
import {MinecraftPotion} from "../potion/MinecraftPotion.js";
import { Tome } from './Tome.js';

export class TomeResearch {

	static createTomeResearchData(player){
		const tomeResearchData = {};
		player.setDynamicProperty('magical_brewery:tome_research_data', JSON.stringify(tomeResearchData))
	}

	static tomeResearchItem(source, itemStack){
		let tomePlayerData = JSON.parse(source.getDynamicProperty('magical_brewery:tome_data_v2'));
		
		if(!TOME_RESEARCH_ITEMS.has(itemStack.typeId)){
			source.sendMessage("There doesn't seem to be much to learn from this item.")
			return;
		}
		else if(TomeResearch.canPlayerResearchItem(source, tomePlayerData)){
			TomeResearch.researchItemStack(source, itemStack, tomePlayerData)
		}
	}

	static canPlayerResearchItem(player, tomePlayerData){
		if(!tomePlayerData){
			player.sendMessage("You doughnut. How can you study something when you don't even know what subject you are researching")
			//The magicks in the tome yearn to be understood
			return false;
		}
		
		else if(!tomePlayerData["unlocked_chapters"].hasOwnProperty("brewing")){
			player.sendMessage("I should create a brewing chapter, and then i can research items.")
			return false;
		}
		else{
			return true;
		}
	}

	static researchItemStack(player, itemStack, tomeData){
		const researchItem = TOME_RESEARCH_ITEMS.get(itemStack.typeId);

		if(itemStack.typeId === "minecraft:potion"){
			TomeResearch.addMCPotionResearchToTomeData(player, itemStack, tomeData);		
		}
		else{
			switch(researchItem.type){
				case "clue":
					TomeResearch.addClueReseachtoTomeData(researchItem, player, tomeData);
				break;

				case "multi-clue":
					TomeResearch.addMultiClueResearchtoTomeData(researchItem, player, tomeData);
				break;
			}
		}	
	}

	static addMCPotionResearchToTomeData( player, itemStack, tomeData){

		let potion = {"effectID": "", "deliveryType": ""};
		potion = MinecraftPotion.getPotionProperties(itemStack, potion)
		console.log(potion["deliveryType"])

		let potionEffect = potion["effectID"].split(":")[1]; 

		if(MinecraftPotion.isPotionEnhanced(potion["effectID"])){
			
			potionEffect = potionEffect.split("_");
			potionEffect.shift();
			potionEffect = potionEffect.join("_");
		}
		
		let shouldPlayerlearnEnhancedEffect = true;

		if(tomeData.unlocked_chapters["ingredients"].includes(potionEffect + "_2")){

			player.sendMessage("I already know how to make this potion")
		}
		else if(tomeData.unlocked_chapters["ingredients"].includes(potionEffect + "_1")){

			TomeResearch.addCompleteChapterToTomeData(player, "ingredients", tomeData, potionEffect);

		}else{
			player.sendMessage("I don't know how to make this potion.")
			shouldPlayerlearnEnhancedEffect = false;
		}
		//TODO: include a connection from base potion to enhancement research.
		// i.e "I don't know how to make this potion." AND/BUT/HOWEVER im learning from the enhancement
		if(shouldPlayerlearnEnhancedEffect){
			TomeResearch.addMCPotionEnhancementToTomeData(potion, player, tomeData);
		}
		return;
	}

	static addMCPotionEnhancementToTomeData(potion, player, tomeData){
	
		if(!MinecraftPotion.isPotionEnhanced(potion["effectID"]) || !tomeData.unlocked_chapters["catalysers"]) return;

		const potionEnhancement = potion["effectID"].split(":")[1].split("_")[0]

		//get playerDynamicProperty research progression
		const playerResearchProgressionData = tome_research_progression;
		let enhancementChapter; 

		switch(potionEnhancement){
			case "long":
				enhancementChapter = "longevity_tier_1";
			break;
			case"strong":
				enhancementChapter = "potency_tier_1";
			break;
		}
		TomeResearch.addEnhancementProgressionToPlayerData(potion["effectID"], player, tomeData, enhancementChapter)
	}

	static addEnhancementProgressionToPlayerData(effectID, player, tomeData, enhancementType){

		//get playerDynamicProperty research progression
		const catalyerChapters = tomeData.unlocked_chapters["catalysers"];
		
		if(!TomeResearch.canPlayerLearnFromEnhancedPotion(catalyerChapters, player , enhancementType)) return;

		//get playerDynamicProperty research progression
		//TODO: change message to be more dynamic
		const playerResearchProgressionData = tome_research_progression;

		if(tome_research_progression[enhancementType] === undefined){
			tome_research_progression[enhancementType] = [];
		}
		else if(tome_research_progression[enhancementType].includes(effectID)){
			player.sendMessage("I already know no how to enhance this potion effect. I should test another potion effect...");
			return;
		}
		else{
			tome_research_progression[enhancementType].push(effectID);

			if(tome_research_progression[enhancementType].length === 3){

				TomeResearch.addCompleteChapterToTomeData(player, "catalysers", tomeData, enhancementType);

				tome_research_progression[enhancementType] = "done";
			}
			return;
		}
	}
	//Are you smarter than 10 year old ?!?! 
	//canPlayerLearnFromEnhancedPotion, brewers hate this 1 trick
	static canPlayerLearnFromEnhancedPotion(catalyserChapters, player , enhancementType){

		if(catalyserChapters.includes(`${enhancementType}_2`)){
			player.sendMessage("I know how to make these types of enhanced potions.");

			return false;
		}else if(!catalyserChapters.includes(`${enhancementType}_1`)){
			player.sendMessage("I should research the catalyst that enhances this potion.");

			return false;
		}else{
			return true;
		}
	}

	static addCompleteChapterToTomeData(player, tomeParentChapter, tomeData, chapterPart){

		const researchPartIndex = tomeData.unlocked_chapters[tomeParentChapter].findIndex(el => el === chapterPart + "_1");

		tomeData.unlocked_chapters[tomeParentChapter].splice(researchPartIndex, 1, chapterPart + "_2");
		tomeData.page_last_opened = tomeParentChapter;

		player.setDynamicProperty('magical_brewery:tome_data_v2', JSON.stringify(tomeData));
		//TODO: change message to be more dynamic
		player.sendMessage("i now have a new potion recipe")
	}

	static addClueReseachtoTomeData(researchItem, player, tomeData){
	
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

	static addMultiClueResearchtoTomeData(researchItem, player, tomeData){

	}
}











