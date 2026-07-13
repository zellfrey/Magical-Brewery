import {ItemStack, system} from "@minecraft/server";
import {POTION_POTENCY_LEVELS, POTION_EFFECTS, getPotencyLevel, POTION_DURATION_LEVELS} from "../potion/potionEffects.js";
import {PotionManager} from "../potion/PotionManager.js";
import {MathUtils} from "../utils/MathUtils.js";
import {setMainHand} from '../utils/containerUtils.js';

export class MagicalBreweryPotion {

	static echoPotionQueue = {
		"beardedflea" : []
	};

	static onConsume(entity, potionItem, potionParams){

		entity.addEffect(
			potionParams.effect_properties[0], 
			potionParams.effect_properties[1], 
			{ amplifier: potionParams.effect_properties[2]}
		);
	
		PotionManager.giveExtraEffectsToEntity(entity, potionItem)
	}

	static onConsumeMultipleEffects(entity, potionItem, potionParams){

		potionParams.effect_properties.forEach(elEffect => { 
			entity.addEffect(elEffect[0], elEffect[1], { amplifier: elEffect[2]});
		});
		
		PotionManager.giveExtraEffectsToEntity(entity, potionItem);
	}

	// static getEffectDuration(effectObj, potionDuration){

	// 	let effectTime;

	// 	switch(potionDuration){
	// 		case "regular":
	// 			effectTime = effectObj.duration_long[0];
	// 		break;
	// 		case "long":
	// 			effectTime = effectObj.duration_long[1];
	// 		break;
	// 		case "xlong":
	// 			effectTime = effectObj.duration_long[2];
	// 		break;
	// 		case "strong":
	// 			effectTime = effectObj.duration_potency[0];
	// 		break;
	// 		case "xstrong":
	// 			effectTime = effectObj.duration_potency[1];
	// 		break;
	// 	}
	// 	return effectTime;
	// }

	static getProperties(selectedItem, potion){
		
		let potionEffect = selectedItem.typeId.split(":")[1].split("_");
		
		if(selectedItem.hasTag("magical_brewery:amethyst")){
			//Remove Amethyst word do bring amethyst potions to "default" level
			potionEffect.shift("");
		}
		
		potion["deliveryType"] = MagicalBreweryPotion.getDeliveryType(selectedItem);
		
		//Remove deliveryType string from typeId(I wish there was a better item system)
		if(potionEffect[0] !== "potion") potionEffect.shift("");
		
		//Remove "potion"
		potionEffect.shift("");
		
		potion["effectID"] = "magical_brewery:" + potionEffect.join("_");
		
    	return potion;
	}
	
	static getDeliveryType(potionItem){
		return potionItem.getComponent("magical_brewery:oc_potion").customComponentParameters.params.delivery_type;
	}
	
	static getEffectString(effectID, potionDeliveryType){

		//remove potion element(1st)
		//effectID.shift();

		let modifier = ""; 

		if(POTION_DURATION_LEVELS.includes(effectID[0])){

			switch(effectID[0]){
				case "strong":
					if(effectID[1] === "slowness"){
						modifier += " IV"
					}else{
						modifier += " II" 
					}
				break;
				case "long": 
					modifier += " Extended" 
				break;
				case "xstrong":
					if(effectID[1] === "slowness"){
						modifier += " V"
					}else{
						modifier += " III" 
					}
				break;
				case "xlong": 
					modifier += " Extended +" 
				break;
			}

			effectID.shift();
		}
		
		if(effectID[0] === "vision" || effectID[0] === "resistance"){
			effectID = [effectID[1], effectID[0]]
		}
		
		for(let i = 0; i < effectID.length; i++){
			effectID[i] = effectID[i][0].toUpperCase() + effectID[i].substring(1);
		}

		const effectString = effectID.join(" ") + modifier + MagicalBreweryPotion.getDeliveryTypeString(potionDeliveryType);

		return effectString;
	}
	
	static getDeliveryTypeString(potionDeliveryType){
		
		switch(potionDeliveryType){
			case "ConsumeEcho":
				return " (Echoing)";
			break;
			default:
				return "";
			break;
		}
	}
	
	static getEffectID(effectID){
		
		//remove potion element(1st)
		//effectID.shift();
		
		if(POTION_DURATION_LEVELS.includes(effectID[0])){

			effectID.shift();
		}
		
		//Changed item ids to match vanilla potions, despite the inconsistency. Namely, "nightvision", which could be like "slow_falling" "night_vision"
		// if(effectID[0] === "vision" || effectID[0] === "resistance"){
		// 	effectID = [effectID[1], effectID[0]]
		// }
		
		return effectID.join("_");
	}
	
	static buildPotionType(rootPotionID, caskPotionLiquid, isAmethystBottle){
		
		let MagicalBreweryPotionType = MagicalBreweryPotion.getPotionDeliveryTypeId(caskPotionLiquid) + "potion_" + rootPotionID;
		
		if(isAmethystBottle) MagicalBreweryPotionType = "amethyst_" + MagicalBreweryPotionType;
		
		return "magical_brewery:" + MagicalBreweryPotionType;
		
	}
	
	static getPotionDeliveryTypeId(caskPotionLiquid){
		switch(caskPotionLiquid){
			case "ConsumeEcho":
				return "echo_";
			break;
			default:
				return "";
			break;
		}
	}

	static setItemStack(MagicalBreweryPotion){
		return new ItemStack(MagicalBreweryPotion, 1);;
	}

	static applyEchoEffect(entity, effect, totalTicks, potency){

		if(totalTicks <= 1) return;

		const echoDuration = totalTicks * 0.75;
		const echoTriggerTime = (totalTicks * 1.2) + MathUtils.getRandomInt(300, 1800);
		
		system.runTimeout(() => 
			{
				entity.addEffect(effect, echoDuration, { amplifier: potency });
				console.log("applying echo effect");
			},		
		echoTriggerTime);
	}
}