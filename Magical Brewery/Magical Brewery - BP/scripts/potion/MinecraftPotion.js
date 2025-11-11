import {Potions} from "@minecraft/server";
import {getPotencyLevel, POTION_DURATION_LEVELS} from "../potion/potionEffects.js";

export class MinecraftPotion {


	static giveExtraEffectsToEntity(entity, heldPotion){
    
		if(heldPotion.getLore().length == 0) return;
		// const potion = e.itemStack.getComponent('minecraft:potion')
		heldPotion.getLore().forEach(modifier => {
			const words = modifier.split(' ');
			let effect, potency;
			let totalTicks = 1;
			if(words[0] === "Instant"){
				potency = getPotencyLevel(words)
				if(potency !== 0) words.pop();
				effect = words.join("_").toLowerCase()
			}
			else{
				
				const effectTime = words[words.length-1].substring(1, 5)
				const [minutes, seconds] = effectTime.split(':');
				totalTicks = ((+minutes) * 60 + (+seconds)) * 20;
				words.pop();

				potency = getPotencyLevel(words)
				
				if(potency !== 0) words.pop();

				effect = words.join("_").toLowerCase()
				// if(Potions.getPotionEffectType(effect) ! == undefined){
				// }
				
			}
			entity.addEffect(effect, totalTicks, { amplifier: potency })
		});
	}

	static getPotionProperties(selectedItem, potion){

		const minecraftPotion = selectedItem.getComponent("minecraft:potion");
		
		if(!minecraftPotion.isValid) return potion;
		
		potion["effectID"] = minecraftPotion.potionEffectType.id;
		potion["deliveryType"] = minecraftPotion.potionDeliveryType.id;
		
		return potion;
    
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