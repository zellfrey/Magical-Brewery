import {world, system, ItemStack} from "@minecraft/server";
import {setMainHand} from '../utils/containerUtils.js';
import {createCask, deleteCask, findCask, updateCask} from "cask/caskDB.js";
//'utils/containerUtils.js';

system.beforeEvents.startup.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('ps:op_cask', {
        onPlace(e) {
            const {block, dimension} = e;
            const {x,y,z} = block.location
            let getCaskData = world.getDynamicProperty('magical_brewery:cask_data')
            if (getCaskData) {
                getCaskData = JSON.parse(getCaskData)
                getCaskData.push(createCask(dimension.id, {x, y, z}))
            } else {
                getCaskData = [createCask(dimension.id, {x, y, z})]
            }
            world.setDynamicProperty('magical_brewery:cask_data', JSON.stringify(getCaskData))
        }
    });
});

system.beforeEvents.startup.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('ps:opd_cask', {
        onPlayerDestroy(e) {
            const {block, dimension} = e;
            deleteCask(dimension.id, block.location);
        }
    });
});

system.beforeEvents.startup.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('ps:pi_cask_fill', {
        onPlayerInteract(e) {
            const {block, dimension, player} = e;

            const equipment = player.getComponent('equippable');
            const selectedItem = equipment.getEquipment('Mainhand');

            if (!player || !equipment || !selectedItem)  return;

            const {x,y,z} = block.location;
            let cask = findCask(dimension.id, {x, y, z})
            const fillLevel = block.permutation.getState("ps:fill_level");
            const caskAge = block.permutation.getState("ps:aging_phase");
            
            //Failsafe
            if(Object.keys(cask).length === 0) cask = createCask(dimension.id, {x, y, z})

            if(selectedItem.typeId === "ps:tasting_spoon"){
                
                if(fillLevel === 0){
                    player.sendMessage("The cask is empty.");
                }
                else{
                    const initialTaste = "The potion tastes of " + cask.potion_effects[0];
                    if(!cask.is_aged){
                        player.sendMessage(initialTaste);
                        player.sendMessage("It looks like it still needs time to age.");
                    }
                    else{
                        player.sendMessage(initialTaste + ", and has a hint of " + cask.potion_effects[cask.potion_effects -1].toLowerCase());
                        player.sendMessage("The potion has aged and is ready.");
                    }
                }
            }
            
            if(selectedItem.typeId === "minecraft:potion" || selectedItem.typeId === "minecraft:lingering_potion" 
                || selectedItem.typeId === "minecraft:splash_potion"){
                
                //v2.0.0 uses "T" (generic) instead of a string. So im using this silly method to just get the first and only component of a potion
                const potion = selectedItem.getComponents()[0];

                if(fillLevel === 3 || potion === undefined || cask.is_aged || potion.potionEffectType.id === "None") return;
                
                //Currently regeneration potions have an empty string for their effect. This extra check is so they arent used. Hopefully this gets fixed
                if(fillLevel === 0 && potion.potionEffectType.id){
                    cask.potion_effects.push(potion.potionEffectType.id)
                    cask.potion_liquid = potion.potionLiquidType.id
                    cask.potion_modifier = potion.potionModifierType.id
                    
                    if(selectedItem.getLore().length > 0){
                        const lore = selectedItem.getLore();
                        lore.forEach(effect => {cask.potion_effects.push(effect)})
                    }
                    updateCask(cask)
                }
                
                if(!matchesPotion(cask, potion, selectedItem.getLore())) return;
                    
                block.setPermutation(block.permutation.withState("ps:fill_level", fillLevel+1));
                const emptyBottle = new ItemStack("glass_bottle", 1)
                setMainHand(player, equipment, selectedItem, emptyBottle);

                if(caskAge > 0) block.setPermutation(block.permutation.withState("ps:aging_phase", 0))

                return;
            }
            if(selectedItem.typeId === "minecraft:glass_bottle" && fillLevel !== 0){
                block.setPermutation(block.permutation.withState("ps:fill_level", fillLevel-1));

                const item = ItemStack.createPotion({
                    effect: cask.potion_effects[0],
                    liquid: cask.potion_liquid,
                    modifier: cask.potion_modifier,
                });
                
                if(cask.potion_effects.length > 1){
                    const extraEffects = cask.potion_effects.slice(1)
                    const lore = selectedItem.getLore();
                    extraEffects.forEach(effect => lore.push(effect))
                    
                    item.setLore(lore);

                }
                player.getComponent("inventory").container.addItem(item)

                if(block.permutation.getState("ps:fill_level") === 0){
                    cask.potion_effects.length = 0;
                    cask.potion_liquid = "";
                    cask.potion_modifier = "";
                    cask.is_aged = false;
                    
                    block.setPermutation(block.permutation.withState("ps:aging_phase", 0));
                    updateCask(cask)
                }
                return;
            }
        }
    });
});
system.beforeEvents.startup.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('ps:ort_cask_aging', {
        onRandomTick(e) {
            const { block, dimension } = e;
            const {x,y,z} = block.location;
            let cask = findCask(dimension.id, {x, y, z})
            const fillLevel = block.permutation.getState("ps:fill_level");
            const canAge = shouldCaskAge(block.getTags()[0], cask.potion_effects)
            
            if(!canAge) return;

            const caskAge = block.permutation.getState("ps:aging_phase");
            block.setPermutation(block.permutation.withState("ps:aging_phase", caskAge+1));
            
            if(caskAge === 3 && !cask.is_aged){
                
                setPotionEffectForCask(block.getTags()[0], cask)
            }
            return;
        }
    });
});


function matchesPotion(caskPotion, heldPotion, extraEffects){
    const matchesEffect = caskPotion.potion_effects[0] === heldPotion.potionEffectType.id;
    const matchesLiquid = caskPotion.potion_liquid === heldPotion.potionLiquidType.id;
    const matchesModifier = caskPotion.potion_modifier === heldPotion.potionModifierType.id;
    
    let matchesExtraEffects;
    if(caskPotion.potion_effects.length < 1 || extraEffects.length === 0){
        matchesExtraEffects = true;
    } 
    else{
        //Start at 2nd element as the first element will be the root potion effect
        for(let i = 1; i < caskPotion.potion_effects.length; i++){
            matchesExtraEffects = caskPotion.potion_effects[i] === extraEffects[i-1] ? true : false;
            if(!matchesExtraEffects) break;
        }
    }
    return matchesEffect && matchesLiquid && matchesModifier && matchesExtraEffects;
}

export function shouldCaskAge(caskTag, potionEffects){
    let shouldAge = true;
    const effectId= caskTagToEffectId(caskTag.replace("_", ""))
    if(effectId === potionEffects[0]){
        shouldAge = false;
    }
    else{
        for(let i = 1; i < potionEffects.length; i++){
            const effect = potionEffects[i].split(' ');
            effect.pop();
            if(potionEffectsObject[caskTag].effects === effect.join(" ")){
                shouldAge = false;
                break;
            }
        }
    }
    return shouldAge
}


function caskTagToEffectId(caskTag){
    let name;
    switch(caskTag){
        case "Slowness":
            name = "Slowing";
        break;
        case "WaterBreathing":
            name = "WaterBreath";
        break;
        // case "Decay":
        //     name = "Wither";
        // break;
        default:
        name = caskTag;
    }
    return name;
}
export function setPotionEffectForCask(caskTag, cask){
    const potencySeal = true;
    let sealStrength = 1;
    if(caskTag === "Turtle_Master"){
        const effects = potionEffectsObject[caskTag].effects

        const potionTime = potencySeal ? potionEffectsObject[caskTag].duration_potency : 
        potionEffectsObject[caskTag].duration_long;

        setTurtleMasterEffect(sealStrength, effects, potionTime, cask, potencySeal)
        
    }
    else{
        const potionEffect = potionEffectsObject[caskTag]
        let effectName = potionEffect.effects
        if(potencySeal){
            let potionPotency;

            if(effectName.includes("Instant")){
                potionPotency = " " + potionPotencyArray[sealStrength];

            }
            else if(effectName === "Slowness"){
                potionPotency = " " + potionPotencyArray[sealStrength+2] + 
                " (" + potionEffect.duration_potency[sealStrength-1] +  ")";

            }
            else if(potionEffect.duration_potency.length === 0){
                potionPotency =" (" + potionEffect.duration_long[0] +  ")";

            }else{
                potionPotency = " " + potionPotencyArray[sealStrength] + 
                " (" + potionEffect.duration_potency[sealStrength-1] +  ")";
            }
            effectName += potionPotency;
        }
        else{
            if(potionEffect.duration_long.length !== 0){
                const effectTime =" (" + potionEffect.duration_long[sealStrength] +  ")";
                effectName += effectTime;
            }
        }
        cask.potion_effects.push(effectName);  
    }       
    cask.is_aged = true;
    updateCask(cask);
}

function setTurtleMasterEffect(seal, effects, potionTime, cask, potency){

    let effectSlowness = effects[0] +  " " + potionPotencyArray[3 + (potency *2)] 
                        + " (" + potionTime[seal - potency] +  ")"
    cask.potion_effects.push(effectSlowness);

    let effectResistance = effects[1] +  " " + potionPotencyArray[2 + potency]
                         + " (" + potionTime[seal - potency] +  ")"
    cask.potion_effects.push(effectResistance);
}
const potionPotencyArray = ["I", "II", "III", "IV", "V", "VI"]
//instant potions have 1 element for the array
//Potions with long duration, 0th element represent base effect time, 1st is longevity
//If a potion doesnt have a potency variant, it will fallback onto the base effect time in duration_long
const potionEffectsObject = {
    // "Decay": {
    //     effects: "Wither",
    //     duration_long: ["0:40", "1:00", "2:00"], 
    //     duration_potency: [],
    // },
    "Harming": {
        effects: "Instant Damage",
        duration_long: [],
        duration_potency: [],
    },
    "Healing": {
        effects: "Instant Health",
        duration_long: [],
        duration_potency: [],
    },
    "Invisibility": {
        effects: "Invisibility",
        duration_long: ["3:00", "8:00"],
        duration_potency: [],
    },
    "Leaping": {
        effects: "Jump Boost",
        duration_long: ["3:00", "8:00"],
        duration_potency: ["1:30"],
    },
    "Poison": {
        effects: "Poison",
        duration_long: ["0:45", "2:00"],
        duration_potency: ["0:22"],
    },
    "Regeneration": {
        effects: "Regeneration",
        duration_long: ["0:45", "2:00"],
        duration_potency: ["0:22"],
    },
    "Fire_Resistance": {
        effects: "Fire Resistance",
        duration_long: ["3:00", "8:00", "15:00"],
        duration_potency: [],
    },
    "Slow_Falling": {
        effects: "Slow Falling",
        duration_long: ["1:30", "4:00"],
        duration_potency: [],
    },
    "Slowness": {
        effects: "Slowness",
        duration_long: ["1:30", "4:00"],
        duration_potency: ["0:20"],
    },
    "Strength": {
        effects: "Strength",
        duration_long: ["3:00", "8:00"],
        duration_potency: ["1:30"],
    },
    "Swiftness": {
        effects: "Speed",
        duration_none: "3:00",
        duration_long: ["3:00", "8:00"],
        duration_potency: ["1:30"],
    },
    "Turtle_Master": {
        effects: ["Slowness", "Resistance"],
        duration_long: ["0:20", "0:40", "2:00"],
        duration_potency: ["0:20"],
    },
    "Night_Vision": {
        effects: "Night Vision",
        duration_long: ["3:00", "8:00"],
        duration_potency: [],
    },
    "Water_Breathing": {
        effects: "Water Breathing",
        duration_long: ["3:00", "8:00"],
        duration_potency: [],
    },
    "Weakness": {
        effects: "Weakness",
        duration_long: ["1:30", "4:00"],
        duration_potency: [],
    }
  };
//Freezes the object, initialize on server startup  
//Object.freeze(obj);
//Array.isArray(arr) && !ar.length