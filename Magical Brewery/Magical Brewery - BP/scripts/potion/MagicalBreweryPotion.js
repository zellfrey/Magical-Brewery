import {ItemStack} from "@minecraft/server";
import {POTION_POTENCY_LEVELS, POTION_EFFECTS, getPotencyLevel} from "../potion/potionEffects.js";
import {MinecraftPotion} from "../potion/MinecraftPotion.js";

export class MagicalBreweryPotion {

	static onConsume(entity, potionItem, potionParams){

		if(potionParams.potion.effect === "Turtle_Master"){
			MagicalBreweryPotion.applyTurtleMasterEffect(entity, potionParams)
		}
		else{
			const potionEffectObj = POTION_EFFECTS[potionParams.potion.effect]
			const effectID = potionEffectObj.effects.replace(" ", "_").toLowerCase()

			let totalTicks;

			if(potionParams.potion.duration === "instant"){
				totalTicks = 1;
			}
			else{
				const durationTime  = MagicalBreweryPotion.getEffectDuration(potionEffectObj, potionParams.potion.duration) 
				const [minutes, seconds] = durationTime.split(':');
			
				totalTicks = ((+minutes) * 60 + (+seconds)) * 20;
			}
			

			entity.addEffect(effectID, totalTicks, { amplifier: potionParams.potion.potency })
		}
		MinecraftPotion.giveExtraEffectsToEntity(entity, potionItem)
	}
	
	static applyTurtleMasterEffect(entity, potionParams){
		const potionEffectObj = POTION_EFFECTS[potionParams.potion.effect]

		const durationTime  = MagicalBreweryPotion.getEffectDuration(potionEffectObj, potionParams.potion.duration) 
		const [minutes, seconds] = durationTime.split(':');

		let totalTicks = ((+minutes) * 60 + (+seconds)) * 20;

		entity.addEffect("slowness", totalTicks, { amplifier: potionParams.potion.potency[0] })
		entity.addEffect("resistance", totalTicks, { amplifier: potionParams.potion.potency[1] })

	}

	static getEffectDuration(effectObj, potionDuration){

		let effectTime;

		switch(potionDuration){
			case "long":
				effectTime = effectObj.duration_long[1];
			break;
			case "xlong":
				effectTime = effectObj.duration_long[2];
			break;
			case "strong":
				effectTime = effectObj.duration_potency[0];
			break;
			case "xstrong":
				effectTime = effectObj.duration_potency[1];
			break;
		}
		return effectTime;
	}

	static getPotionProperties(selectedItem, potion){
    
		potion["effectID"] = selectedItem.typeId;
		potion["deliveryType"] = "Consume";
    
    	return potion;
	}

	static getEffectString(effectID){
		//Currently being lazy and just implementing an easy method of getting ID String, rather than
		//breaking down the effectID array and analysing each part 
		//remove potion element(1st)
		effectID.shift();

		let modifier = ""; 

		if(effectID[0] === "xstrong" || effectID[0] === "xlong"){

			switch(effectID[0]){
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
		
		for(let i = 0; i < effectID.length; i++){
			effectID[i] = effectID[i][0].toUpperCase() + effectID[i].substring(1);
		}

		const effectString = effectID.join(" ") + modifier;

		return effectString;
	}

	static setItemStack(caskFirstPotionEffect){
		return new ItemStack(caskFirstPotionEffect, 1);
	}
}