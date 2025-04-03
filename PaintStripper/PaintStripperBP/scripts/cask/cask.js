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
            console.log("ageing")
            
            if(caskAge === 3 && !cask.is_aged){
                
                let effectName = potionEffectsObject[block.getTags()[0]].effect_name
                
                if(potionEffectsObject[block.getTags()[0]].mod_type_none){
                    const effectTime =" (" + potionEffectsObject[block.getTags()[0]].mod_type_none +  ")"
                    effectName += effectTime;
                }
                
                cask.potion_effects.push(effectName);
                cask.is_aged = true;
                updateCask(cask);
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
            if(potionEffectsObject[caskTag].effect_name === effect.join(" ")){
                shouldAge = false;
                break;
            }
        }
    }
    return shouldAge
}
// function chanceToAge(potionEffects, fillLevel){
//     return true;
// }


function caskTagToEffectId(caskTag){
    let name;
    switch(caskTag){
        case "Slowness":
            name = "Slowing";
        break;
        case "WaterBreathing":
            name = "WaterBreath";
        break;
        case "Decay":
            name = "Wither";
        break;
        default:
        name = caskTag;
    }
    return name;
}

function getPotionEffectTime(caskTag){
    let baseTime;
    return baseTime;   
}
export const potionEffectsObject = {
    "Decay": {
        effect_name: "Wither",
        mod_type_none: "0:40",
        "mod_type_long": "8:00",
        "mod_type_potency": false,
    },
    "Harming": {
        effect_name: "Instant Damage",
        mod_type_none: "",
        "mod_type_long": "8:00",
        "mod_type_potency": false,
    },
    "Healing": {
        effect_name: "Instant Health",
        mod_type_none: "",
        "mod_type_long": "8:00",
        "mod_type_potency": false,
    },
    "Invisibility": {
        effect_name: "Invisibility",
        mod_type_none: "3:00",
        "long": 42,
        "potency": false,
    },
    "Leaping": {
        effect_name: "Jump Boost",
        mod_type_none: "3:00",
        "mod_type_long": "8:00",
        "mod_type_potency": false,
    },
    "Poison": {
        effect_name: "Poison",
        mod_type_none: "0:45",
        "mod_type_long": "8:00",
        "mod_type_potency": false,
    },
    "Regeneration": {
        effect_name: "Regeneration",
        mod_type_none: "0:45",
        "mod_type_long": "8:00",
        "mod_type_potency": false,
    },
    "Fire_Resistance": {
        effect_name: "Fire Resistance",
        mod_type_none: "3:00",
        "mod_type_long": "8:00",
        "mod_type_potency": false,
    },
    "Slow_Falling": {
        effect_name: "Slow Falling",
        mod_type_none: "1:30",
        "mod_type_long": "8:00",
        "mod_type_potency": false,
    },
    "Slowness": {
        effect_name: "Slowness",
        mod_type_none: "1:30",
        "mod_type_long": "8:00",
        "mod_type_potency": false,
    },
    "Strength": {
        effect_name: "Strength",
        mod_type_none: "3:00",
        "mod_type_long": "8:00",
        "mod_type_potency": false,
    },
    "Swiftness": {
        effect_name: "Speed",
        mod_type_none: "3:00",
        "mod_type_long": "8:00",
        "mod_type_potency": false,
    },
    "Turtle_Master": {
        effect_name: "Turtle Master",
        mod_type_none: "0:40",
        "mod_type_long": "8:00",
        "mod_type_potency": false,
    },
    "Night_Vision": {
        effect_name: "Night Vision",
        mod_type_none: "3:00",
        "mod_type_long": "8:00",
        "mod_type_potency": false,
    },
    "Water_Breathing": {
        effect_name: "Water Breathing",
        mod_type_none: "3:00",
        "mod_type_long": "8:00",
        "mod_type_potency": false,
    },
    "Weakness": {
        effect_name: "Weakness",
        mod_type_none: "1:30",
        "mod_type_long": "8:00",
        "mod_type_potency": false,
    }
  };