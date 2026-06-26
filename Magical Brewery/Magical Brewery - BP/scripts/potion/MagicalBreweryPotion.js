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
    
		potion["effectID"] = selectedItem.typeId;
		//TODO: Use custom parameters to get delivery type
		potion["deliveryType"] = "Consume";
    
    	return potion;
	}

	static getEffectString(effectID){
		//Currently being lazy and just implementing an easy method of getting ID String, rather than
		//breaking down the effectID array and analysing each part 
		//remove potion element(1st)
		effectID.shift();

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

		const effectString = effectID.join(" ") + modifier;

		return effectString;
	}

	static getEffectID(effectID){
		
		//remove potion element(1st)
		effectID.shift();
		
		if(POTION_DURATION_LEVELS.includes(effectID[0])){

			effectID.shift();
		}
		
		//Changed item ids to match vanilla potions, despite the inconsistency. Namely, "nightvision", which could be like "slow_falling" "night_vision"
		// if(effectID[0] === "vision" || effectID[0] === "resistance"){
		// 	effectID = [effectID[1], effectID[0]]
		// }
		return effectID.join("_");
	}

	static setItemStack(caskFirstPotionEffect){
		return new ItemStack(caskFirstPotionEffect, 1);
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