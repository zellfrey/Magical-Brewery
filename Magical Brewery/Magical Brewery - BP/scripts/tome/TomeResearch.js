import {system, world, RawMessage} from '@minecraft/server';
import {TOME_RESEARCH_ITEMS, TOME_RESEARCH_ODD_CASKS, MULTI_CLUE_POTION_EFFECTS, MULTI_COMPLETE_POTION_EFFECTS} from "tome/tomeResearchData.js"
import {TOME_CHAPTERS} from "tome/tomeChapters.js"
import {MinecraftPotion} from "../potion/MinecraftPotion.js";
import {PotionManager} from "../potion/PotionManager.js";
import {setMainHand} from '../utils/containerUtils.js';
import { Tome } from './Tome.js';
import {Cask} from "../cask/Cask.js";

export class TomeResearch {

	static createTomeResearchData(player){
		const tomeResearchData = {};
		player.setDynamicProperty('magical_brewery:tome_research_data', JSON.stringify(tomeResearchData));
	}

	static tomeResearchItem(source, itemStack){
		
		let tomePlayerData = source.getDynamicProperty('magical_brewery:tome_data_v2');
		
		if(tomePlayerData === undefined) return;

		tomePlayerData = JSON.parse(tomePlayerData);
		
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
		
		if(!tomePlayerData["unlocked_chapters"].hasOwnProperty("brewing")){
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
			TomeResearch.addEffectToMultiClue(player, tomeData, potionEffect);
			TomeResearch.removeResearchItem(player);
			return false;

		}else{
			player.sendMessage({ translate: "magical_brewery:message.tome_research_potion.item_not_discovered"});
			return false;
		}
	}

	static potionDeliveryResearch(tomeData, player, potionEffect, potion){

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
			TomeResearch.removeResearchItem(player);
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
			const catalyserDiscoveryMessage = "magical_brewery:message.tome_research_potion.enhanced_discovery";
			TomeResearch.sendPlayerDiscoveryMessage(catalyserDiscoveryMessage, chapterPart + "_1", chapterPart + "_2", player)
		}
		
		player.dimension.playSound("ui.cartography_table.take_result", player.location, {volume: 0.6, pitch: 1});
	}

	static addClueReseachtoTomeData(researchItem, player, tomeData){
	
		const chapterPart = researchItem.part.slice(0, researchItem.part.length-2);
		const tomeResearchChapter = tomeData.unlocked_chapters[researchItem.tome_chapter];

		if(tomeResearchChapter.includes(chapterPart + "_2")){
			player.sendMessage({ translate: `magical_brewery:message.tome_research_potion.item_discovered`})
			return;
		}
		else if(tomeResearchChapter.includes(researchItem.part)){
			player.sendMessage({ translate: `magical_brewery:message.tome_research_item.discovered`})
			return;
		}
		else{
			Tome.addTomeResearchChapter(player, tomeData, researchItem.tome_chapter, researchItem.part);

			const discoveryMessage = "magical_brewery:message.tome_research_item.clue_discovery";
			
			TomeResearch.sendPlayerDiscoveryMessage(discoveryMessage, researchItem.part, researchItem.tome_chapter, player)
			TomeResearch.removeResearchItem(player);

			return;
		}
	}
	static sendPlayerDiscoveryMessage(discoveryMessage, chapterID, parentChapter, player){

		const clueDiscoveryMessage = {
				translate: discoveryMessage,
				with: { rawtext: [
					{ translate: TOME_CHAPTERS[chapterID].title}, 
					{ translate: `magical_brewery:tome_chapter_${parentChapter}.title` }
				] },
			};

		player.sendMessage(clueDiscoveryMessage);
	}

	static sendPlayerCatalyserProgressionMessage(potionChapter, catalyserChapter, player){

		const catalyserProgressionMessage = {
				translate: "magical_brewery:message.tome_research_potion.enhanced_progression",
				with: { rawtext: [
					{ translate: TOME_CHAPTERS[potionChapter].title},
					{ translate: TOME_CHAPTERS[catalyserChapter].title},
				] },
			};

		player.sendMessage(catalyserProgressionMessage);
	}

	

	static addMultiClueResearchtoTomeData(researchItem, player, tomeData){

		const tomeResearchChapter = tomeData.unlocked_chapters[researchItem.tome_chapter];

		if(!TomeResearch.canPlayerLearnMultiClueItem(researchItem, player, tomeResearchChapter)) return;

		const playerResearchProgressionData = JSON.parse(player.getDynamicProperty('magical_brewery:tome_research_data'));
		let recipesDiscovered = 0;

		if(playerResearchProgressionData[researchItem.part] === undefined){
			playerResearchProgressionData[researchItem.part] = MULTI_COMPLETE_POTION_EFFECTS;
		}
		else{
			for(const potionEffect of playerResearchProgressionData[researchItem.part]){

				if(!tomeResearchChapter.includes(potionEffect + "_1")){

					tomeData.unlocked_chapters[researchItem.tome_chapter].push(potionEffect + "_1");
					recipesDiscovered++;
				}
			}
		}
		Tome.addTomeResearchChapter(player, tomeData, researchItem.tome_chapter, researchItem.part);

		const multiClueDiscoveryMessage = {
				translate: "magical_brewery:message.tome_research_item.multi_clue_discovery",
				with: { rawtext: [{ translate: TOME_CHAPTERS[researchItem.part].title}, ] },
			};

		player.sendMessage(multiClueDiscoveryMessage);

		if(recipesDiscovered > 0){

			//const recipesDiscoveredAmountString= recipesDiscovered === 1 ? "singular" : "plural" ;
			//recipesDiscovered.toString();
			const multiCluePotionProgressionMessage = {
				translate: "magical_brewery:message.tome_research_item.multi_clue_progression",
				with: { rawtext: [{ translate: TOME_CHAPTERS[researchItem.part].title}, ] },
			};
			player.sendMessage(multiCluePotionProgressionMessage);
		}

		TomeResearch.removeMultiClueIngredient(researchItem, player, tomeData);
		TomeResearch.removeResearchItem(player);
	}

	static canPlayerLearnMultiClueItem(researchItem, player, tomeResearchChapter){

		let canLearnMultiClue = true;

		for(const potionEffect of MULTI_COMPLETE_POTION_EFFECTS){
			if(tomeResearchChapter.includes(potionEffect + "_2") || tomeResearchChapter.includes(potionEffect + "_1") ){
				canLearnMultiClue = false;
			}
		}

		if(tomeResearchChapter.includes(researchItem.part)){
			player.sendMessage({ translate: `magical_brewery:message.tome_research_item.discovered`})
			canLearnMultiClue =  false;
		}

		return canLearnMultiClue;

	}

	static addEffectToMultiClue(player, tomeData, potionEffect){

		if(!MULTI_CLUE_POTION_EFFECTS.includes(potionEffect)) return;

		let playerTomeResearch = JSON.parse(player.getDynamicProperty('magical_brewery:tome_research_data'));

		if(playerTomeResearch["ferm_spider_eye"] === undefined) playerTomeResearch["ferm_spider_eye"] = [];
		
		let multiCluePotionEffect = TomeResearch.getMultiCluePotionEffect(potionEffect);
		
		if(!TomeResearch.canPlayerLearnMultiClueEffect(tomeData, playerTomeResearch, multiCluePotionEffect, "ferm_spider_eye")) return;
		
		playerTomeResearch["ferm_spider_eye"].push(multiCluePotionEffect);
		
		if(tomeData.unlocked_chapters["ingredients"].includes("ferm_spider_eye")){
			
			Tome.addTomeResearchChapter(player, tomeData, "ingredients", multiCluePotionEffect + "_1");

			player.sendMessage({ translate: "magical_brewery:message.tome_research_potion.multi_clue_discovery"})
			
		}
		
		player.setDynamicProperty('magical_brewery:tome_research_data', JSON.stringify(playerTomeResearch));

		TomeResearch.removeMultiClueIngredient(TOME_RESEARCH_ITEMS.get("minecraft:fermented_spider_eye"), player, tomeData);
		
	}
	static getMultiCluePotionEffect(potionEffect){
		
		switch(potionEffect){
			case "nightvision":
				return "invisibility";
			case "swiftness":
				return "slowness";
			case "leaping":
				return "slowness";
			case "poison":
				return "harming";
			case "healing":
				return "harming";
			case "strength":
				return "weakness";
		}
	}
	static canPlayerLearnMultiClueEffect(tomeData, playerTomeResearch, multiCluePotionEffect, multiClueItemResearch){
		
		if(tomeData.unlocked_chapters["ingredients"].includes(multiCluePotionEffect + "_2")){
			return false;
		}
		else if(playerTomeResearch[multiClueItemResearch].includes(multiCluePotionEffect)){
			return false;
		}
		return true;
	}

	static removeMultiClueIngredient(researchItem, player, tomeData){

		let unlockedEffects = 0;
		for(const potionEffect of MULTI_COMPLETE_POTION_EFFECTS){
			if(tomeData.unlocked_chapters[researchItem.tome_chapter].includes(potionEffect + "_1")){
				unlockedEffects++;
			}
		}

		if(unlockedEffects === MULTI_COMPLETE_POTION_EFFECTS.length){
			const researchPartIndex = tomeData.unlocked_chapters[researchItem.tome_chapter].findIndex(el => el === researchItem.part);

			tomeData.unlocked_chapters[researchItem.tome_chapter].splice(researchPartIndex, 1)
			player.setDynamicProperty('magical_brewery:tome_data_v2', JSON.stringify(tomeData));
		}
		return;
	}

	static removeResearchItem(player){
		const equipment = player.getComponent('equippable');
        const selectedItem = equipment.getEquipment('Mainhand');

		if(selectedItem === undefined || equipment === undefined) return;

        setMainHand(player, equipment, selectedItem, undefined);

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
		

		Tome.addTomeResearchChapter(player, tomePlayerData, "cask_oddities", caskResearch.odd_chapter);
		
		playerTomeResearch[caskResearch.research] = "done";
		
		playerTomeResearch = TomeResearch.setOppositeOddResearch(playerTomeResearch, caskResearch.research);

		player.setDynamicProperty('magical_brewery:tome_research_data', JSON.stringify(playerTomeResearch));
		player.sendMessage({ translate: "magical_brewery:message.tome_research_cask_odd.discovery"});
	}
	
	static setOppositeOddResearch(playerTomeResearch, caskResearch){
		const researchArr = caskResearch.split("_");
		const oppositeResearchString = `${researchArr[1]}_${researchArr[0]}_${researchArr[2]}`;
		
		playerTomeResearch[oppositeResearchString] = "done";
		
		return playerTomeResearch;
	}
	
	static potionVesselResearch(player, potionVesselType, noOfEffects){
		
		let tomePlayerData = player.getDynamicProperty('magical_brewery:tome_data_v2');
		
		if(tomePlayerData === undefined) return;
		
		tomePlayerData = JSON.parse(tomePlayerData);
		
		if(TomeResearch.canPlayerResearchItem(player, tomePlayerData) &&
		!tomePlayerData.unlocked_chapters["potion_vessels"].includes(`${potionVesselType}_vessels_2`)){
			
			const researchPartIndex = tomePlayerData.unlocked_chapters["potion_vessels"].findIndex(el => el === `${potionVesselType}_vessels_1`);
			
			tomePlayerData.unlocked_chapters["potion_vessels"].splice(researchPartIndex, 1, `${potionVesselType}_vessels_2`)

			player.setDynamicProperty('magical_brewery:tome_data_v2', JSON.stringify(tomePlayerData));
			player.sendMessage({ translate: "magical_brewery:message.tome_research_potion_vessel.broken"});
			player.dimension.playSound("ui.cartography_table.take_result", player.location, {volume: 0.6, pitch: 1});

			TomeResearch.sendPlayerPotionVesselDiscoveryMessage(player, potionVesselType, noOfEffects.toString());
			
		}
		else{
			player.sendMessage({ translate: "magical_brewery:message.tome_research_potion_vessel.broken"});
		}
	}

	static sendPlayerPotionVesselDiscoveryMessage(player, potionVesselType, noOfEffects){

		const PotionVesselDiscoveryMessage = {
				translate: "magical_brewery:message.tome_research_potion_vessel.discovery",
				with: { rawtext: [
					{ translate: potionVesselType}, 
					{ translate: noOfEffects }
				] },
			};

		player.sendMessage(PotionVesselDiscoveryMessage);
	}
}