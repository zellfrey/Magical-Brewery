import {system, world, RawMessage} from '@minecraft/server';
import {TOME_RESEARCH_ITEMS, TOME_RESEARCH_ODD_CASKS} from "tome/tomeResearchData.js"
import {TOME_CHAPTERS} from "tome/tomeChapters.js"
import {MinecraftPotion} from "../potion/MinecraftPotion.js";
import { Tome } from './Tome.js';
import {Cask} from "../cask/Cask.js";

export class TomeResearch {

	static createTomeResearchData(player){
		const tomeResearchData = {};
		player.setDynamicProperty('magical_brewery:tome_research_data', JSON.stringify(tomeResearchData))
	}

	static tomeResearchItem(source, itemStack){
		let tomePlayerData = JSON.parse(source.getDynamicProperty('magical_brewery:tome_data_v2'));
		
		if(!TOME_RESEARCH_ITEMS.has(itemStack.typeId)){
			source.sendMessage({ translate: "magical_brewery:message.tome_research_item.invalid"});
			return;
		}
		else if(TomeResearch.canPlayerResearchItem(source, tomePlayerData)){
			TomeResearch.researchItemStack(source, itemStack, tomePlayerData);
		}
	}

	static canPlayerResearchItem(player, tomePlayerData){
		if(!tomePlayerData){
			player.sendMessage({ translate: "magical_brewery:message.tome_research_item.no_tome"});
			//The magicks in the tome yearn to be understood
			return false;
		}
		
		else if(!tomePlayerData["unlocked_chapters"].hasOwnProperty("brewing")){
			player.sendMessage({ translate: "magical_brewery:message.tome_research_item.no_brewing_chapter"});
			return false;
		}
		else{
			return true;
		}
	}

	static researchItemStack(player, itemStack, tomeData){
		const researchItem = TOME_RESEARCH_ITEMS.get(itemStack.typeId);

		switch(researchItem.type){
			case "clue":
				TomeResearch.addClueReseachtoTomeData(researchItem, player, tomeData);
			break;

			case "multi-clue":
				TomeResearch.addMultiClueResearchtoTomeData(researchItem, player, tomeData);
			break;

			case "complete":
				TomeResearch.checkCompleteResearchItem(player, itemStack, tomeData);
			break;
		}
	}

	static checkCompleteResearchItem(player, itemStack, tomeData){
		if(itemStack.typeId === "minecraft:potion"){
			TomeResearch.mcPotionResearch(player, itemStack, tomeData);		
		}
	}

	static mcPotionResearch( player, itemStack, tomeData){

		let potion = {"effectID": "", "deliveryType": ""};
		potion = MinecraftPotion.getPotionProperties(itemStack, potion)
		console.log(potion["deliveryType"])

		let potionEffect = potion["effectID"].split(":")[1]; 

		if(MinecraftPotion.isPotionEnhanced(potion["effectID"])){
			
			potionEffect = potionEffect.split("_");
			potionEffect.shift();
			potionEffect = potionEffect.join("_");
		}
		
		let shouldPlayerlearnEnhancedEffect = TomeResearch.canPlayerLearnBaseMCPotionEffect(tomeData, player, potionEffect);
		//TODO: include a connection from base potion to enhancement research.
		// i.e "I don't know how to make this potion." AND/BUT/HOWEVER im learning from the enhancement
		if(shouldPlayerlearnEnhancedEffect){
			TomeResearch.mcPotionEnhancementResearch(potion, potionEffect, player, tomeData);
		}
		return;
	}
	static canPlayerLearnBaseMCPotionEffect(tomeData, player, potionEffect){

		if(tomeData.unlocked_chapters["ingredients"].includes(potionEffect + "_2")){

			player.sendMessage({ translate: "magical_brewery:message.tome_research_potion.discovered"});
			return true;
		}
		else if(tomeData.unlocked_chapters["ingredients"].includes(potionEffect + "_1")){

			TomeResearch.addCompleteChapterToTomeData(player, "ingredients", tomeData, potionEffect);
			return true;

		}else{
			player.sendMessage({ translate: "magical_brewery:message.tome_research_potion.item_not_discovered"});
			return false;
		}
	}

	static mcPotionEnhancementResearch(potion, potionEffect, player, tomeData){
		if(!MinecraftPotion.isPotionEnhanced(potion["effectID"]) || !tomeData.unlocked_chapters["catalysers"]) return;

		const potionEnhancement = potion["effectID"].split(":")[1].split("_")[0]
		
		let enhancementChapter; 

		switch(potionEnhancement){
			case "long":
				enhancementChapter = "longevity_tier_1";
			break;
			case"strong":
				enhancementChapter = "potency_tier_1";
			break;
		}
		TomeResearch.addEnhancementProgressionToPlayerData(potion["effectID"], potionEffect, player, tomeData, enhancementChapter)
	}

	static addEnhancementProgressionToPlayerData(effectID, effectString, player, tomeData, enhancementType){
		
		const catalyerChapters = tomeData.unlocked_chapters["catalysers"];
		
		if(!TomeResearch.canPlayerLearnFromEnhancedPotion(catalyerChapters, player , enhancementType)) return;

		const playerResearchProgressionData = JSON.parse(player.getDynamicProperty('magical_brewery:tome_research_data'));
		
		if(playerResearchProgressionData[enhancementType] === undefined) playerResearchProgressionData[enhancementType] = [];

		if(playerResearchProgressionData[enhancementType].includes(effectID)){
			player.sendMessage({ translate: "magical_brewery:message.tome_research_potion.enhanced_discovered"});
			return;
		}
		else{
			console.log(playerResearchProgressionData[enhancementType].length)
			playerResearchProgressionData[enhancementType].push(effectID);

			if(playerResearchProgressionData[enhancementType].length === 3){

				TomeResearch.addCompleteChapterToTomeData(player, "catalysers", tomeData, enhancementType);

				playerResearchProgressionData[enhancementType] = "done";
			}
			else{
				const noOfPotionsToResearch = 3-playerResearchProgressionData[enhancementType].length;
				//idk how to name this variable, im adding an "s" to a word. Give me a break
				//Oh fuck i just had a though about different languages. I should simmer down as a lingual brit, but cmon why you gotta make it difficult world
				//Actually i got it, its dum but im going to just change the whole string
				const potionAmountString= noOfPotionsToResearch === 1 ? "singular" : "plural" ;

				TomeResearch.sendPlayerCatalyserProgressionMessage(effectString + "_2", enhancementType + "_1", player)
				
				player.sendMessage({ translate: `magical_brewery:message.tome_research_item.enhanced_progression_${potionAmountString}`, 
										with: [noOfPotionsToResearch.toString()] });
			}

			player.setDynamicProperty('magical_brewery:tome_research_data', JSON.stringify(playerResearchProgressionData));

			return;
		}
	}
	//Are you smarter than 10 year old ?!?! 
	//canPlayerLearnFromEnhancedPotion, brewers hate this 1 trick
	static canPlayerLearnFromEnhancedPotion(catalyserChapters, player , enhancementType){

		if(catalyserChapters.includes(`${enhancementType}_2`)){
			player.sendMessage({ translate: "magical_brewery:message.tome_research_potion.enhanced_type_discovered"});
			return false;
		}
		else if(!catalyserChapters.includes(`${enhancementType}_1`)){
			player.sendMessage({ translate: "magical_brewery:message.tome_research_potion.catalyst_not_discovered"});
			return false;
		}
		else{
			return true;
		}
	}

	static addCompleteChapterToTomeData(player, tomeParentChapter, tomeData, chapterPart){

		const researchPartIndex = tomeData.unlocked_chapters[tomeParentChapter].findIndex(el => el === chapterPart + "_1");

		tomeData.unlocked_chapters[tomeParentChapter].splice(researchPartIndex, 1, chapterPart + "_2");
		tomeData.page_last_opened = tomeParentChapter;

		player.setDynamicProperty('magical_brewery:tome_data_v2', JSON.stringify(tomeData));
		
		if(tomeParentChapter === "ingredients"){
			const discoveryMessage = "magical_brewery:message.tome_research_potion.discovery";
			TomeResearch.sendPlayerDiscoveryMessage(discoveryMessage, chapterPart + "_2", tomeParentChapter, player);
		}
		else{
			//custom message for catalysyers
			player.sendMessage("i now have a new potion recipe")
		}
		
		player.dimension.playSound("ui.cartography_table.take_result", player.location, {volume: 0.6, pitch: 1});
	}

	static addClueReseachtoTomeData(researchItem, player, tomeData){
	
		const chapterPart = researchItem.part.slice(0, researchItem.part.length-2);
		
		if(tomeData.unlocked_chapters[researchItem.tome_chapter].includes(chapterPart + "_2")){
			player.sendMessage({ translate: `magical_brewery:message.tome_research_potion.discovered`})
			return;
		}
		else if(tomeData.unlocked_chapters[researchItem.tome_chapter].includes(researchItem.part)){
			player.sendMessage({ translate: `magical_brewery:message.tome_research_item.discovered`})
			return;
		}
		else{
			tomeData.unlocked_chapters[researchItem.tome_chapter].push(researchItem.part);
			tomeData.page_last_opened = researchItem.tome_chapter;

			const discoveryMessage = "magical_brewery:message.tome_research_item.clue_discovery";
			TomeResearch.sendPlayerDiscoveryMessage(discoveryMessage, researchItem.part, researchItem.tome_chapter, player)
			
			player.setDynamicProperty('magical_brewery:tome_data_v2', JSON.stringify(tomeData));
			player.dimension.playSound("ui.cartography_table.take_result", player.location, {volume: 0.6, pitch: 1});

			return;
		}
	}
	static sendPlayerDiscoveryMessage(discoveryMessage, tomeChapterID, tomeParentChapter, player){

		const clueDiscoveryMessage = {
				translate: discoveryMessage,
				with: { rawtext: [
					{ translate: TOME_CHAPTERS[tomeChapterID].title}, 
					{ translate: `magical_brewery:tome_chapter_${tomeParentChapter}.title` }
				] },
			};

		player.sendMessage(clueDiscoveryMessage);
	}

	static sendPlayerCatalyserProgressionMessage(tomePotionChapter, tomeCatalyserChapter, player){

		const catalyserProgressionMessage = {
				translate: "magical_brewery:message.tome_research_potion.enhanced_progression",
				with: { rawtext: [
					{ translate: TOME_CHAPTERS[tomePotionChapter].title},
					{ translate: TOME_CHAPTERS[tomeCatalyserChapter].title},
				] },
			};

		player.sendMessage(catalyserProgressionMessage);
	}

	static addMultiClueResearchtoTomeData(researchItem, player, tomeData){

	}


	static caskOddProgression(player, block, potion, interaction){

		const tomePlayerData = player.getDynamicProperty('magical_brewery:tome_data_v2');
		const cask = Cask.getCaskType(block.typeId);

		if(!tomePlayerData || !TOME_RESEARCH_ODD_CASKS.has(cask)) return;
		
		TomeResearch.playerLearnOddResearch(player, potion, cask, interaction);
	}

	static playerLearnOddResearch(player, potion, cask, interaction){

		const caskResearch = TOME_RESEARCH_ODD_CASKS.get(cask);
		let tomePlayerData = JSON.parse(player.getDynamicProperty('magical_brewery:tome_data_v2'));
		let playerTomeResearch = JSON.parse(player.getDynamicProperty('magical_brewery:tome_research_data'));
		
		if(tomePlayerData.unlocked_chapters["cask_oddities"].includes(caskResearch.odd_chapter)) return;


		if(!playerTomeResearch[caskResearch.research]) playerTomeResearch[caskResearch.research] = [];
		//TODO: expand to cater for potions like water breathing, slow falling etc
		let canPlayerLearnResearch = false;
		
		if(interaction === "fill"){
			const effect = potion.split(":")[1].split("_");

			canPlayerLearnResearch = TomeResearch.canPlayerLearnOddFillResearch(caskResearch, effect[effect.length-1], playerTomeResearch);
		}else{
			
			canPlayerLearnResearch = TomeResearch.canPlayerLearnOddEmptyResearch(caskResearch, minecraftPotion.potionEffectType.id, playerTomeResearch);
		}
		
		if(canPlayerLearnResearch){
			TomeResearch.updatePlayerTomeResearch(caskResearch, player, tomePlayerData, playerTomeResearch, interaction);
		}
		
		return;
	}

	static canPlayerLearnOddFillResearch(caskResearch, potionEffect, playerTomeResearch){
		
		if(playerTomeResearch[caskResearch.research][0] === "fill"){
			return false;
		}
		if(potionEffect !== caskResearch.potion_fill){
			return false;
		}
		else{
			return true;
		}
	}

	static canPlayerLearnOddEmptyResearch(caskResearch, potionEffect, playerTomeResearch){
		let potion_empty = caskResearch.potion_empty;

		if(!potion_empty) potion_empty = "minecraft:mundane";
		console.log(potion_empty)
		if(potionEffect !== potion_empty || playerTomeResearch[caskResearch.research][0] === undefined){
			return false;
		}
		else{
		 	return true;
		}
	}
	
	static updatePlayerTomeResearch(caskResearch, player, tomePlayerData, playerTomeResearch, interaction){
		
		playerTomeResearch[caskResearch.research].push(interaction);
		
		if(playerTomeResearch[caskResearch.research].length === 2){
			
			TomeResearch.addCaskOdditiesChaptertoTome(caskResearch, player, tomePlayerData, playerTomeResearch);
			
			player.dimension.playSound("ui.cartography_table.take_result", player.location, {volume: 0.6, pitch: 1});
		}
		else{
			player.setDynamicProperty('magical_brewery:tome_research_data', JSON.stringify(playerTomeResearch));
		}
	}
	
	static addCaskOdditiesChaptertoTome(caskResearch, player, tomePlayerData, playerTomeResearch){
		
		
		
		tomePlayerData.unlocked_chapters["cask_oddities"].push(caskResearch.odd_chapter);
		tomePlayerData.page_last_opened = "cask_oddities";
		
		player.setDynamicProperty('magical_brewery:tome_data_v2', JSON.stringify(tomePlayerData));
		
		playerTomeResearch[caskResearch.research] = "done";
		
		playerTomeResearch = TomeResearch.setOppositeOddResearch(playerTomeResearch, caskResearch.research);
		console.log(tomePlayerData.unlocked_chapters["cask_oddities"])
		player.setDynamicProperty('magical_brewery:tome_research_data', JSON.stringify(playerTomeResearch));
		
	}
	
	static setOppositeOddResearch(playerTomeResearch, caskResearch){
		const researchArr = caskResearch.split("_");
		const oppositeResearchString = `${researchArr[1]}_${researchArr[0]}_${researchArr[2]}`;
		
		playerTomeResearch[oppositeResearchString] = "done";
		
		return playerTomeResearch;
	}
}











