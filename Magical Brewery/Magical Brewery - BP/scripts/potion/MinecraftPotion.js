import {Potions} from "@minecraft/server";
import {POTION_DURATION_LEVELS} from "../potion/potionEffects.js";

export class MinecraftPotion {

	static getProperties(selectedItem, potion){

		const minecraftPotion = selectedItem.getComponent("minecraft:potion");
		
		if(!minecraftPotion.isValid) return potion;
		
		potion["effectID"] = minecraftPotion.potionEffectType.id;
		potion["deliveryType"] = minecraftPotion.potionDeliveryType.id;
		
		return potion;
    
	}

	static isPotionEnhanced(effectID){
		const potionEnhancement = effectID.split(":")[1].split("_")[0]
		
		if(potionEnhancement === "long" || potionEnhancement === "strong"){
			return true;
		}
		else{
			return false
		}
	}

	static getEffectString(effectID){
		
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
			}

			effectID.shift();
		}
	
		for(let i = 0; i < effectID.length; i++){
			effectID[i] = effectID[i][0].toUpperCase() + effectID[i].substring(1);
		}

		const effectString = effectID.join(" ") + modifier;

		return effectString;
	}

	static getEffectID(effectID){

		if(POTION_DURATION_LEVELS.includes(effectID[0])){

			effectID.shift();
		}
		
		return effectID.join("_");
	}
	
	static setItemStack(caskFirstPotionEffect, caskPotionLiquid){
		return Potions.resolve(caskFirstPotionEffect, caskPotionLiquid)
	}
}