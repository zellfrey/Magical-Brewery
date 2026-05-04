import {system, world, RawMessage} from '@minecraft/server';
import {TOME_RESEARCH_ITEMS, TOME_RESEARCH_ODD_CASKS} from "tome/tomeResearchData.js"
import {TOME_CHAPTERS} from "tome/tomeChapters.js"
import {MinecraftPotion} from "../potion/MinecraftPotion.js";
import {PotionManager} from "../potion/PotionManager.js";
import { Tome } from './Tome.js';
import {Cask} from "../cask/Cask.js";

export class TomeResearch {

	static createTomeResearchData(player){
		const tomeResearchData = {};
		player.setDynamicProperty('magical_brewery:tome_research_data', JSON.stringify(tomeResearchData))
	}

	static tomeResearchItem(source, itemStack){
		let tomePlayerData = JSON.parse(source.getDynamicProperty('magical_brewery:tome_data_v2'));
		
		const canPlayerLearn = TomeResearch.canPlayerResearchItem(source, tomePlayerData);

		//I would rather not have a dataset of hundreds of potions, so im treating "magical_brewery:potions" as 1 item similar to "minecraft:potion"
		if(itemStack.hasTag("magical_brewery:potion") && canPlayerLearn){
			TomeResearch.potionResearch(source, itemStack, tomePlayerData);
		}
		else if(!TOME_RESEARCH_ITEMS.has(itemStack.typeId)){
			source.sendMessage({ translate: "magical_brewery:message.tome_research_item.invalid"});
			return;
		}
		else if(canPlayerLearn){
			TomeResearch.researchItemStack(source, itemStack, tomePlayerData);
		}
	}

	static canPlayerResearchItem(player, tomePlayerData){
		if(!tomePlayerData){
			player.sendMessage({ translate: "magical_brewery:message.tome_research_item.no_tome"});
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
				TomeResearch.potionResearch(player, itemStack, tomeData);
			break;
		}
	}

	static potionResearch( player, itemStack, tomeData){

		const potion = PotionManager.getProperties(itemStack);
		const potionEffect = PotionManager.getEffectID(potion["effectID"]);
		const isEnhanced = PotionManager.isEnhanced(potion["effectID"]);
		const hasTertiaryEffect = PotionManager.hasTertiaryEffect(potion["deliveryType"]);
		
		let playerLearntBasePotion = TomeResearch.canPlayerLearnBasePotionEffect(tomeData, player, potionEffect);
		
		if(playerLearntBasePotion && hasTertiaryEffect){
			TomeResearch.potionDeliveryResearch(tomeData, player, potionEffect, potion);
		}
	 
		if(playerLearntBasePotion && isEnhanced){
			TomeResearch.potionEnhancementResearch(potion["effectID"], potionEffect, player, tomeData);
		}
		return;
	}
	static canPlayerLearnBasePotionEffect(tomeData, player, potionEffect){

		if(tomeData.unlocked_chapters["ingredients"].includes(potionEffect + "_2")){

			//player.sendMessage({ translate: "magical_brewery:message.tome_research_potion.discovered"});
			return true;
		}
		else if(tomeData.unlocked_chapters["ingredients"].includes(potionEffect + "_1")){

			TomeResearch.addCompleteChapterToTomeData(player, "ingredients", tomeData, potionEffect);
			//keep it simple stupid
			return false;

		}else{
			player.sendMessage({ translate: "magical_brewery:message.tome_research_potion.item_not_discovered"});
			return false;
		}
	}

	static potionDeliveryResearch(tomeData, player, potionEffect, potion){
		console.log(potion["effectID"])

		let deliveryChapter;
		
		switch(potion["deliveryType"]){
			case "ThrownSplash":
				deliveryChapter = "expansion_tier_1";
			break;
			case"ThrownLingering":
				deliveryChapter = TomeResearch.canPlayerLearnLingering(player, tomeData) ? "lingering_tier_1" : "";
			break;
			case"ThrownSplashPlus":
				deliveryChapter = "expansion_tier_2";
			break;
			case"ConsumeEcho":
				deliveryChapter = "echo_tier_1";
			break;
		}
		if(!deliveryChapter) return;

		TomeResearch.addEnhancementProgressionToPlayerData(potion["effectID"], potionEffect, player, tomeData, deliveryChapter)
	}
	static potionEnhancementResearch(effectID, potionEffect, player, tomeData){

		const potionEnhancement = PotionManager.getPotionEnhancement(effectID);
		
		let enhancementChapter; 

		switch(potionEnhancement){
			case "long":
				enhancementChapter = "longevity_tier_1";
			break;
			case"strong":
				enhancementChapter = "potency_tier_1";
			break;
			case"xlong":
				enhancementChapter = "longevity_tier_2";
			break;
			case"xstrong":
				enhancementChapter = "potency_tier_2";
			break;
		}
		TomeResearch.addEnhancementProgressionToPlayerData(effectID, potionEffect, player, tomeData, enhancementChapter)
	}

	static addEnhancementProgressionToPlayerData(effectID, effectString, player, tomeData, enhancementType){
		const catalyerChapters = tomeData.unlocked_chapters["catalysers"];
		
		if(!TomeResearch.canPlayerLearnFromEnhancedPotion(catalyerChapters, player , enhancementType)) return;

		const playerResearchProgressionData = JSON.parse(player.getDynamicProperty('magical_brewery:tome_research_data'));
		
		if(playerResearchProgressionData[enhancementType] === undefined) playerResearchProgressionData[enhancementType] = [];

		
		if(playerResearchProgressionData[enhancementType].includes(effectID)){
			//player.sendMessage({ translate: "magical_brewery:message.tome_research_potion.enhanced_discovered"});
			return;
		}
		else{
			//console.log(playerResearchProgressionData[enhancementType].length)
			playerResearchProgressionData[enhancementType].push(effectID);
			//console.log(playerResearchProgressionData[enhancementType])

			if(playerResearchProgressionData[enhancementType].length === 3){

				TomeResearch.addCompleteChapterToTomeData(player, "catalysers", tomeData, enhancementType);

				playerResearchProgressionData[enhancementType] = [];
			}
			else{
				const noOfPotionsToResearch = 3-playerResearchProgressionData[enhancementType].length;
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
			//player.sendMessage({ translate: "magical_brewery:message.tome_research_potion.enhanced_type_discovered"});
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

	static canPlayerLearnLingering(player, tomeData){
		if(!tomeData.unlocked_chapters["catalysers"].includes("expansion_tier_1_2")){
			player.sendMessage({ translate: "magical_brewery:message.tome_research_potion.lingering_progression"});
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
			//TODO:custom message for catalysyers
			player.sendMessage("i now have a new potion recipe")
		}
		
		player.dimension.playSound("ui.cartography_table.take_result", player.location, {volume: 0.6, pitch: 1});
	}

	static addClueReseachtoTomeData(researchItem, player, tomeData){
	
		const chapterPart = researchItem.part.slice(0, researchItem.part.length-2);
		
		if(tomeData.unlocked_chapters[researchItem.tome_chapter].includes(chapterPart + "_2")){
			player.sendMessage({ translate: `magical_brewery:message.tome_research_potion.item_discovered`})
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


	static caskOddProgression(player, block, cask, interaction){

		const tomePlayerData = player.getDynamicProperty('magical_brewery:tome_data_v2');
		const caskType = !cask.og_cask_type ? Cask.getCaskType(block.typeId) : cask.og_cask_type;
		
		if(!tomePlayerData || !TOME_RESEARCH_ODD_CASKS.has(caskType)) return;
		
		TomeResearch.playerLearnOddResearch(player, caskType, cask, interaction);
	}

	static playerLearnOddResearch(player, caskType, cask, interaction){

		const caskResearch = TOME_RESEARCH_ODD_CASKS.get(caskType);
		let tomePlayerData = JSON.parse(player.getDynamicProperty('magical_brewery:tome_data_v2'));
		let playerTomeResearch = JSON.parse(player.getDynamicProperty('magical_brewery:tome_research_data'));
		
		if(tomePlayerData.unlocked_chapters["cask_oddities"].includes(caskResearch.odd_chapter)) return;


		if(!playerTomeResearch[caskResearch.research]) playerTomeResearch[caskResearch.research] = [];
		
		const rootPotionID = cask.getFirstPotionEffectID();
		const extraEffects = cask.potion_effects.slice(1);
		let canPlayerLearnResearch = false;
	
		if(interaction === "fill"){

			canPlayerLearnResearch = TomeResearch.canPlayerLearnOddFillResearch(caskResearch, rootPotionID, extraEffects, playerTomeResearch);
		}
		else{
			
			canPlayerLearnResearch = TomeResearch.canPlayerLearnOddEmptyResearch(caskResearch, rootPotionID, extraEffects, playerTomeResearch);
		}
		
		if(canPlayerLearnResearch){
			TomeResearch.updatePlayerTomeResearch(caskResearch, player, tomePlayerData, playerTomeResearch, interaction);
		}
		
		return;
	}

	static canPlayerLearnOddFillResearch(caskResearch, rootPotionID, extraEffects, playerTomeResearch){
		
		let hasOddExtraEffect = false;

		for (const effect of extraEffects) {
			if(effect.includes(caskResearch.potion_nth_fill)) hasOddExtraEffect = true;
		}

		if(playerTomeResearch[caskResearch.research][0] === "fill"){
			return false;
		}
		else if(hasOddExtraEffect || rootPotionID == caskResearch.potion_1st_fill){
			return true;
		}
	}

	static canPlayerLearnOddEmptyResearch(caskResearch, rootPotionID, extraEffects, playerTomeResearch){

		const potion1stEmpty = !caskResearch.potion_1st_empty ? "mundane" : caskResearch.potion_1st_empty;
		const potionNthEmpty = !caskResearch.potion_nth_empty ? "Mundane (no effect)" : caskResearch.potion_nth_empty;
		
		let hasOddExtraEffect = false;
		
		for (const effect of extraEffects) {
			if(effect.includes(potionNthEmpty)) hasOddExtraEffect = true;
		}
		
		if(playerTomeResearch[caskResearch.research][0] === "undefined"){
			return false;
		}
		else if(hasOddExtraEffect || rootPotionID === potion1stEmpty ){
			return true;
		}
	}
	
	static updatePlayerTomeResearch(caskResearch, player, tomePlayerData, playerTomeResearch, interaction){
		
		playerTomeResearch[caskResearch.research].push(interaction);
		
		if(playerTomeResearch[caskResearch.research].length === 2){
			
			TomeResearch.addCaskOdditiesChaptertoTome(caskResearch, player, tomePlayerData, playerTomeResearch);
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

		player.setDynamicProperty('magical_brewery:tome_research_data', JSON.stringify(playerTomeResearch));
		player.dimension.playSound("ui.cartography_table.take_result", player.location, {volume: 0.6, pitch: 1});
		player.sendMessage({ translate: "magical_brewery:message.tome_research_cask_odd.discovery"});
	}
	
	static setOppositeOddResearch(playerTomeResearch, caskResearch){
		const researchArr = caskResearch.split("_");
		const oppositeResearchString = `${researchArr[1]}_${researchArr[0]}_${researchArr[2]}`;
		
		playerTomeResearch[oppositeResearchString] = "done";
		
		return playerTomeResearch;
	}
}