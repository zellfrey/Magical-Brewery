import {world, system, ItemStack} from '@minecraft/server';
import {POTION_POTENCY_LEVELS, POTION_EFFECTS, getPotencyLevel, POTION_DURATION_LEVELS} from "../potion/potionEffects.js";
import {MinecraftPotion} from "../potion/MinecraftPotion.js";
import {MagicalBreweryPotion} from "../potion/MagicalBreweryPotion.js";
import {TomeResearch} from "../tome/TomeResearch.js";
import {setMainHand} from '../utils/containerUtils.js';

export class PotionManager {

	static giveExtraEffectsToEntity(entity, heldPotion){
    
		if(heldPotion.getLore().length == 0) return;
		// const potion = e.itemStack.getComponent('minecraft:potion')

		const extraEffects = heldPotion.getLore();

		for(let i = 0; i < extraEffects.length; i++){
			
			const words = extraEffects[i].split(' ');
			let isEchoEffect;

			//As to why extraEffects === "Mundane (no effect)" doesnt work, idk so its this for now
			if(words[0] === "Mundane") continue;
			
			if(words[words.length-1] === "[Echoing]"){
				isEchoEffect = true;
				words.pop();
			}
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

			if(isEchoEffect) MagicalBreweryPotion.applyEchoEffect(entity, effect, totalTicks, potency)
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

	static hasTertiaryEffect(deliveryType){
		return deliveryType !== "Consume" ? true : false;
	}

	static getPotionEnhancement(potion){
		const effectID = potion.split(":")[1].split("_");
		let enhancedType;
		for(const part of effectID){
			if(POTION_DURATION_LEVELS.includes(part)) enhancedType = part;
		}
		return enhancedType;
	}

	static getEffectString(potion, potionDeliveryType){
		
		const potionRootID = potion.split(":")[0];
        const effectID = potion.split(":")[1].split("_");

		if(potionRootID === "minecraft"){
			return MinecraftPotion.getEffectString(effectID, potionDeliveryType)
		}
		else{
            return MagicalBreweryPotion.getEffectString(effectID, potionDeliveryType)
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
		
		const rootPotionID = caskPotionEffects[0].split(":")[1];
		const isAmethystBottle = selectedItem.typeId === "magical_brewery:amethyst_bottle";
			
		let newPotion;
		
		if(rootPotionID === "wither" || rootPotionID === "strong_wither"){
			
			newPotion = PotionManager.setDecayPotionFromCask(rootPotionID, caskPotionLiquid, isAmethystBottle);
		}
		else if(!isAmethystBottle){
			
			try{
				newPotion = MinecraftPotion.setItemStack("minecraft:" + rootPotionID, caskPotionLiquid);
			}
			catch{
				const magicalBreweryPotion = MagicalBreweryPotion.buildPotionType(rootPotionID, caskPotionLiquid, isAmethystBottle);
				
				newPotion = MagicalBreweryPotion.setItemStack(magicalBreweryPotion);
			}
		}
		else{
			const magicalBreweryPotion = MagicalBreweryPotion.buildPotionType(rootPotionID, caskPotionLiquid, isAmethystBottle);
			newPotion = MagicalBreweryPotion.setItemStack(magicalBreweryPotion);
		}
		
	
		if(caskPotionEffects.length > 1){
			const extraEffects = caskPotionEffects.slice(1)
			const lore = selectedItem.getLore();
			extraEffects.forEach(effect => lore.push(effect))
			
			newPotion.setLore(lore);
		}
		return newPotion;
	}
	
	static setDecayPotionFromCask(rootPotionID, caskPotionLiquid, isAmethystBottle){
		
		if(isAmethystBottle){
			const magicalBreweryPotion = MagicalBreweryPotion.buildPotionType(rootPotionID, caskPotionLiquid, isAmethystBottle);
			return MagicalBreweryPotion.setItemStack(magicalBreweryPotion);
		}else{
			if(rootPotionID === "strong_wither"){
				return MinecraftPotion.setItemStack("minecraft:wither", caskPotionLiquid);
			}else{
				const magicalBreweryPotion = MagicalBreweryPotion.buildPotionType(rootPotionID, caskPotionLiquid, isAmethystBottle);
				return MagicalBreweryPotion.setItemStack(magicalBreweryPotion);
			}
		}
	}
	static legalPotionCheck(player, item){

		const potionValidEffects = PotionManager.getValidEffects(item.getLore());
		const equipment = player.getComponent('equippable');

		if(!PotionManager.shouldPotionBreak(PotionManager.getPotionVesselType(item), potionValidEffects.length + 1)) return;
		
		setMainHand(player, equipment, item, undefined);

		player.playSound("random.glass", {volume: 0.8, pitch: 1.2});
		player.applyDamage(2);
		player.sendMessage({ translate: "magical_brewery:message.magical_brewery_illegal_potion.dhmis"});

	}

	static givePotionFromCask(selectedItem, player, block, cask){

		const item = PotionManager.setItemStackFromCask(selectedItem, cask.potion_effects, cask.potion_liquid);
		const bottleVesselType = selectedItem.typeId.split(":")[1].split("_")[0];	
		const potionValidEffects = PotionManager.getValidEffects(cask.potion_effects);
		const equipment = player.getComponent('equippable');
		
		

		if(PotionManager.shouldPotionBreak(bottleVesselType, potionValidEffects.length)){

			PotionManager.potionBreak(player, selectedItem, item, bottleVesselType, equipment, potionValidEffects.length-1)
		}
		else{
			TomeResearch.caskOddProgression(player, block, cask, "empty");

			setMainHand(player, equipment, selectedItem, undefined);

        	player.getComponent("inventory").container.addItem(item);
		}
	}

	static getPotionVesselType(potion){
		if(potion.hasTag("magical_brewery:potion")){
		    const potionVesselType = potion.getTags().find(el => el !== "magical_brewery:potion");
			
			return potionVesselType.split(":")[1];
        }
		else{
           return "glass";
        }
	}

	static shouldPotionBreak(potionVesselType, noOfEffects){
		switch(potionVesselType){
			case "glass":
				return noOfEffects > 2;
			break;
			case "amethyst":
				return noOfEffects > 5;
			break;
		}
	}

	static potionBreak(player, selectedItem, item, potionVesselType, equipment, noOfEffects){

		const inventory = player.getComponent("inventory").container;
		setMainHand(player, equipment, selectedItem, undefined);

		const emptySlotIndex = inventory.firstEmptySlot();
		inventory.setItem(emptySlotIndex, item);

		system.runTimeout(() => 
			{	
				const currentItem  = inventory.getItem(emptySlotIndex);
				//Just doing a basic check. Further checks on an illegal potion item will be 
				//done when a player is either consuming, throwing or dropping said illegal potion,
				if(!player.isValid || currentItem === undefined || !currentItem.matches(item.typeId)) return;
				
				inventory.setItem(emptySlotIndex, undefined);
				player.playSound("random.glass", {volume: 0.8, pitch: 1.2})
				player.applyDamage(2);
				TomeResearch.potionVesselResearch(player, potionVesselType, noOfEffects);
			},
		20);
	}
	
	static getValidEffects(potionEffects){
		return potionEffects.filter(el => el !== "Mundane (no effect)" && el !== "minecraft:mundane");
	}
}