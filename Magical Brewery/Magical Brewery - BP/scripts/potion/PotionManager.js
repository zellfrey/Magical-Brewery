import {world, system, ItemStack} from '@minecraft/server';
import {POTION_POTENCY_LEVELS, POTION_EFFECTS, getPotencyLevel, POTION_DURATION_LEVELS} from "../potion/potionEffects.js";
import {MinecraftPotion} from "../potion/MinecraftPotion.js";
import {MagicalBreweryPotion} from "../potion/MagicalBreweryPotion.js";

export class PotionManager {

	static giveExtraEffectsToEntity(entity, heldPotion){
    
		if(heldPotion.getLore().length == 0) return;
		// const potion = e.itemStack.getComponent('minecraft:potion')

		const extraEffects = heldPotion.getLore();

		for(let i = 0; i < extraEffects.length; i++){
			
			const words = extraEffects[i].split(' ');
			
			//As to why extraEffects === "Mundane (no effect)" doesnt work, idk so its this for now
			if(words[0] === "Mundane") continue;
			
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
		}
	}
	
	static isEnhanced(potion){
		const effectID = potion.split(":")[1].split("_");
		let isEnhanced = false;
		for(const part of effectID){
			if(POTION_DURATION_LEVELS.includes(part)) isEnhanced = true;
		}
		return isEnhanced;
	}

	static getPotionEnhancement(potion){
		const effectID = potion.split(":")[1].split("_");
		let enhancedType;
		for(const part of effectID){
			if(POTION_DURATION_LEVELS.includes(part)) enhancedType = part;
		}
		return enhancedType;
	}

	static getEffectString(potion){
		
		const potionRootID = potion.split(":")[0];
        const effectID = potion.split(":")[1].split("_");

		if(potionRootID === "minecraft"){
			return MinecraftPotion.getEffectString(effectID)
		}
		else{
            return MagicalBreweryPotion.getEffectString(effectID)
        }
	}

	static getEffectID(potion){

		const potionRootID = potion.split(":")[0];
        const effectID = potion.split(":")[1].split("_");

		if(potionRootID === "minecraft"){
			return MinecraftPotion.getEffectID(effectID);
        }
        else{
            return MagicalBreweryPotion.getEffectID(effectID);
        }
	}

	static getProperties(selectedItem){
		let potion = {"effectID": "", "deliveryType": ""};

		if(selectedItem.hasTag("magical_brewery:potion")){
		    potion = MagicalBreweryPotion.getProperties(selectedItem, potion);
        }
		else{
            potion = MinecraftPotion.getProperties(selectedItem, potion);
        }
		return potion;
	}

	static setItemStackFromCask(selectedItem, caskPotionEffects, caskPotionLiquid){

		const potionCreationType = caskPotionEffects[0].split(":")[0];
		let newPotion;

		if(potionCreationType === "minecraft"){
			newPotion = MinecraftPotion.setItemStack(caskPotionEffects[0], caskPotionLiquid)
		}
		else{
			newPotion = MagicalBreweryPotion.setItemStack(caskPotionEffects[0])
		}
	
		if(caskPotionEffects.length > 1){
			const extraEffects = caskPotionEffects.slice(1)
			const lore = selectedItem.getLore();
			extraEffects.forEach(effect => lore.push(effect))
			
			newPotion.setLore(lore);
		}
		return newPotion;
	}
}