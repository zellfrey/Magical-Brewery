import {world, system, ItemStack, MolangVariableMap} from "@minecraft/server";
import {setMainHand} from '../utils/containerUtils.js';
import {potionPotencyArray, potionEffectsObject, getPotencyLevel} from "../potionEffects.js";
import {setCaskSeal, findCaskSeal, destroyCaskSeal, isSameSealType} from "cask/seal.js";
import {createCask, deleteCask, findCask, updateCask, updateCaskSeal} from "cask/caskDB.js";
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
            // const fillLevel = block.permutation.getState("ps:fill_level");

            // if(fillLevel > 0) 
            // dimension.playSound("bucket.empty_powder_snow", block.location, {volume: 0.8, pitch: 1.0});
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
            const aged = block.permutation.getState("ps:aged");

            //Failsafe
            // if(Object.keys(cask).length === 0) cask = createCask(dimension.id, {x, y, z})

            if(selectedItem.typeId === "ps:tasting_spoon"){

                const caskEffect = block.getTags().find(el => el !== "cask");
                
                if(fillLevel === 0){
                    dimension.playSound("hit.wood", block.location, {volume: 0.8, pitch: 0.6});
                    player.sendMessage("The cask is empty.");
                    return;
                }
                else{
                    dimension.playSound("bottle.empty", block.location, {volume: 0.8, pitch: 2.2});
                    let initialTaste = "The potion tastes of;\n";

                    if(!aged){

                        for(let i = 0; i !== cask.potion_effects.length; i++){
                            initialTaste += cask.potion_effects[i] + "\n"
                        }
                        player.sendMessage(initialTaste)

                        if(!shouldCaskAge(caskEffect, cask.potion_effects)){
                            player.sendMessage("It looks like the potion contains a similar effect as the cask, and cannot age.")
                        }else{
                            player.sendMessage("It looks like it still needs time to age.");
                        }
                        
                    }
                    else{
                        for(let i = 0; i !== cask.potion_effects.length-1; i++){
                            initialTaste += cask.potion_effects[i] + "\n"
                        }
                        player.sendMessage(initialTaste)
                        player.sendMessage("It also has a hint of " + cask.potion_effects[cask.potion_effects.length -1] + ".");
                        player.sendMessage("The potion has aged and is ready.");
                    }
                    return;
                }
            }
            
            if(selectedItem.typeId === "minecraft:potion" || selectedItem.typeId === "minecraft:lingering_potion" 
                || selectedItem.typeId === "minecraft:splash_potion"){
                
                //v2.0.0 uses "T" (generic) instead of a string. So im using this silly method to just get the first and only component of a potion
                const potion = selectedItem.getComponents()[0];

                if(fillLevel === 3 || potion === undefined || aged || potion.potionEffectType.id === "None") return;
                
                //Currently regeneration potions have an empty string for their effect. This extra check is so they arent used. Hopefully this gets fixed
                if(fillLevel === 0 && potion.potionEffectType.id){
                    cask.potion_effects.push(potion.potionEffectType.id)
                    cask.potion_liquid = potion.potionLiquidType.id
                    cask.potion_modifier = potion.potionModifierType.id
                    
                    if(selectedItem.getLore().length > 0){
                        const lore = selectedItem.getLore();
                        lore.forEach(effect => {cask.potion_effects.push(effect)})
                    }
                }
                
                if(!matchesPotion(cask, potion, selectedItem.getLore())) return;
                    
                block.setPermutation(block.permutation.withState("ps:fill_level", fillLevel+1));
                const emptyBottle = new ItemStack("glass_bottle", 1)
                setMainHand(player, equipment, selectedItem, emptyBottle);

                //honestly just pulling numbers out of my ass to see what works
                const pitch = fillLevel * 0.2 + 0.3
                dimension.playSound("bottle.empty", block.location, {volume: 0.8, pitch: pitch});

                const seal = findCaskSeal(block)

                setCaskSeal(seal, cask)
                    
                cask.age_start_tick = system.currentTick
                updateCask(cask)
                return;
            }
            if(selectedItem.typeId === "minecraft:glass_bottle"){

                if(fillLevel === 0){
                    dimension.playSound("hit.wood", block.location, {volume: 0.8, pitch: 0.6});
                    return;
                }
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
                setMainHand(player, equipment, selectedItem, undefined);
                player.getComponent("inventory").container.addItem(item)
                

                const pitch = fillLevel * 0.2 + 0.3
                dimension.playSound("bottle.fill", block.location, {volume: 0.8, pitch: pitch});
                block.setPermutation(block.permutation.withState("ps:fill_level", fillLevel-1));

                if(block.permutation.getState("ps:fill_level") === 0){
                    cask.potion_effects.length = 0;
                    cask.potion_liquid = "";
                    cask.potion_modifier = "";
                    cask.age_start_tick = -1
                    
                    block.setPermutation(block.permutation.withState("ps:aged", false));
                    updateCask(cask)
                }
                return;
            }
        }
    });
});

system.beforeEvents.startup.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('ps:ot_cask_aging', {
        onTick(e) {
            ageCask(e.block, e.dimension)
        }
    });
});
function ageCask(block, dimension){
    const {x,y,z} = block.location;
    let cask = findCask(dimension.id, {x, y, z})
    const caskEffect = block.getTags().find(el => el !== "cask");
    const canAge = shouldCaskAge(caskEffect, cask.potion_effects)
    
    if(!canAge) return;

    createAgeingFeedback(block, cask.potion_effects.length)
    
    const fillLevel = block.permutation.getState("ps:fill_level");
    const timeToAge = cask.age_start_tick + 12000*cask.potion_effects.length + fillLevel*10
    const hasAged = timeToAge <= system.currentTick

    checkCaskSeal(block, cask)
    
    if(hasAged){
        const caskAgeTime = (12000*cask.potion_effects.length + fillLevel*10)/3
        const caskSealAgeTime = Math.ceil(cask.seal_lifetime*20 / caskAgeTime *100)
        setPotionEffectForCask(caskEffect, cask, caskSealAgeTime)

        block.setPermutation(block.permutation.withState("ps:aged", true));
        
        const particleLocation = block.center();
        particleLocation.y += 0.4
        block.dimension.spawnParticle("minecraft:crop_growth_emitter", particleLocation);
    }
    return;
}

function matchesPotion(caskPotion, heldPotion, extraEffects){
    const matchesEffect = caskPotion.potion_effects[0] === heldPotion.potionEffectType.id;
    const matchesLiquid = caskPotion.potion_liquid === heldPotion.potionLiquidType.id;
    const matchesModifier = caskPotion.potion_modifier === heldPotion.potionModifierType.id;
    
    let matchesExtraEffects;
    if(caskPotion.potion_effects.length < 1 || extraEffects.length === 0){
        matchesExtraEffects = true;
    } 
    else{
        const caskExtraEffects = caskPotion.potion_effects.slice(1).sort();
        const potionExtraEffects = extraEffects.sort();
        for(let i = 0; i < caskExtraEffects.length; i++){
            matchesExtraEffects = caskExtraEffects[i] === potionExtraEffects[i] ? true : false;
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
            if(effect[0] === "Instant"){

                if(getPotencyLevel(effect) !== 0) effect.pop()
                    
                if(potionEffectsObject[caskTag].effects === effect.join(" ")){
                    shouldAge = false;
                    break;
                }

            }else{
                effect.pop();
                if(getPotencyLevel(effect) !== 0) effect.pop()

                if(potionEffectsObject[caskTag].effects === effect.join(" ")){
                shouldAge = false;
                break;
                }
            }
        }
    }
    return shouldAge
}

function checkCaskSeal(block, cask){
    let caskSeal = findCaskSeal(block)

    //If there is no seal the lifetime will remain the same, reducing the ability of effecting the age
    if(isSameSealType(caskSeal, cask)){

        if(JSON.stringify(caskSeal.location) == JSON.stringify(cask.seal_location)){
             cask.seal_lifetime++;
        }
        else{
            const previousSealLifeTime = cask.seal_lifetime;
            setCaskSeal(caskSeal, cask)
            cask.seal_lifetime = previousSealLifeTime;
        }
      
    }
    else if(caskSeal){
        setCaskSeal(caskSeal, cask)
        console.log(caskSeal.typeId)
    }
    console.log(cask.seal_lifetime)
    updateCaskSeal(cask)
}

export function setPotionEffectForCask(caskTag, cask, caskSealAge){
    
    const potionEffect = potionEffectsObject[caskTag]
    let effectName = potionEffect.effects
    let potencySeal = false;
    let sealStrength = 0;
    if(Object.keys(cask.seal_location).length !== 0 && caskSealAge >= 75){
        
        potencySeal = cask.is_potency_seal;
        sealStrength = cask.seal_strength;
        destroyCaskSeal(cask)
    }

    if(potencySeal){
        let potionPotency;

        if(effectName.includes("Instant")){
            potionPotency = " " + potionPotencyArray[sealStrength];

        }
        else if(effectName === "Slowness"){
            potionPotency = " " + potionPotencyArray[sealStrength+1] + 
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
    updateCask(cask);
}
function createAgeingFeedback(block, noOfPotions){
    
    const rgba = block.getComponent("minecraft:map_color").color
    const molang = new MolangVariableMap();
    molang.setColorRGBA("variable.color", { red: rgba.red, green: rgba.green, blue: rgba.blue, alpha: rgba.alpha});
    block.dimension.spawnParticle("minecraft:mobspell_emitter", block.center(), molang);

    if(Math.random() <= 0.1){
        const vol = 0.7 + (noOfPotions/10);
        block.dimension.playSound("ps:block.cask.creak", block.location, {volume: vol, pitch: 1.5});
    }
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