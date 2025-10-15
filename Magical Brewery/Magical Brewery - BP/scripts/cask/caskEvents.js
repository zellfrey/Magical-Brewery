import {world, system, ItemStack, Potions} from "@minecraft/server";
import {setMainHand} from '../utils/containerUtils.js';
import {Seal} from "cask/Seal.js";
import {Cask} from "cask/Cask.js";
//'utils/containerUtils.js';

system.beforeEvents.startup.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('magical_brewery:op_cask', {
        onPlace(e) {
            Cask.createCask(e.block.dimension.id, e.block.location)
        }
    });
});

system.beforeEvents.startup.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('magical_brewery:opd_cask', {
        onPlayerBreak(e) {
            // if(fillLevel > 0) 
            // dimension.playSound("bucket.empty_powder_snow", block.location, {volume: 0.8, pitch: 1.0});
            Cask.destroyCask(e.block.location, e.block.dimension.id)
        }
    });
});

system.beforeEvents.startup.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('magical_brewery:pi_cask_fill', {
        onPlayerInteract(e,p) {
            const {block, dimension, player} = e;

            const equipment = player.getComponent('equippable');
            const selectedItem = equipment.getEquipment('Mainhand');

            if (!player || !equipment || !selectedItem)  return;
            
            let cask = Cask.casks[Cask.findIndexCask(block.dimension.id, block.location)]
            const fillLevel = block.permutation.getState("magical_brewery:fill_level");
            const aged = block.permutation.getState("magical_brewery:aged");
            //Failsafe
            // if(Object.keys(cask).length === 0) cask = createCask(dimension.id, {x, y, z})

            if(selectedItem.typeId === "magical_brewery:tasting_spoon"){

                const caskPotionType = p.params.cask_effect;
                
                if(fillLevel === 0){
                    dimension.playSound("hit.wood", block.location, {volume: 0.8, pitch: 0.6});
                    player.sendMessage({ translate: "magical_brewery:message.cask.tasting_spoon.empty"});
                }
                else{
                    dimension.playSound("bottle.empty", block.location, {volume: 0.8, pitch: 2.2});

                    let caskPotions = getCaskFirstPotionString(cask.potion_effects[0]) + "\n";

                    player.sendMessage({ translate: "magical_brewery:message.cask.tasting_spoon.initial_taste"})

                    if(!aged){

                        for(let i = 1; i !== cask.potion_effects.length; i++){
                            caskPotions += cask.potion_effects[i] + "\n"
                        }

                        player.sendMessage(caskPotions)

                        if(!cask.canCaskAge(caskPotionType)){
                            player.sendMessage({ translate: "magical_brewery:message.cask.tasting_spoon.cannot_age"});
                        }else{
                            const ageTime = 12000*cask.potion_effects.length + fillLevel*10;
                            const ageEndTick = cask.age_start_tick + ageTime;
                            const ageCompletionPercentage = Math.trunc(100 - ((ageEndTick - system.currentTick)/ageTime) * 100);

                            sendAgingTasteMessage(player, caskPotionType, ageCompletionPercentage);
                        }
                        
                    }
                    else{
                        for(let i = 1; i !== cask.potion_effects.length-1; i++){
                            caskPotions = cask.potion_effects[i] + "\n"
                        }
                        
                        player.sendMessage(caskPotions)
                        player.sendMessage({ translate: "magical_brewery:message.cask.tasting_spoon.new_effect", 
                                            with: [cask.potion_effects[cask.potion_effects.length -1]] });
                        player.sendMessage({ translate: "magical_brewery:message.cask.tasting_spoon.aged"});
                    }
                   
                }

                return;
            }
            //Will implement splash and lingering potions at a later date
            if(selectedItem.typeId === "minecraft:lingering_potion" || selectedItem.typeId === "minecraft:splash_potion"){
                player.sendMessage({ translate: "magical_brewery:message.magical_brewery_general.wip"});
            }
            if(selectedItem.typeId === "minecraft:potion"){

                const potion = selectedItem.getComponent("minecraft:potion");

                if(fillLevel === 3 || !potion.isValid || aged || potion.potionEffectType.id === "None") return;
                
                
                if(fillLevel === 0 && potion.potionEffectType.id){
                    cask.setCaskPotion(potion, selectedItem.getLore())
                }
                
                if(!cask.matchesCaskPotion(potion, selectedItem.getLore())) return;
                    
                block.setPermutation(block.permutation.withState("magical_brewery:fill_level", fillLevel+1));
                const emptyBottle = new ItemStack("glass_bottle", 1)
                setMainHand(player, equipment, selectedItem, emptyBottle);

                //honestly just pulling numbers out of my ass to see what works
                const pitch = fillLevel * 0.2 + 0.3
                dimension.playSound("bottle.empty", block.location, {volume: 0.8, pitch: pitch});

                const seal = Seal.findSeal(block)

                Seal.setSeal(seal, cask)
                
                cask.age_start_tick = system.currentTick
                Cask.updateCask(cask)

                return;
            }

            if(selectedItem.typeId === "minecraft:glass_bottle"){

                if(fillLevel === 0){
                    dimension.playSound("hit.wood", block.location, {volume: 0.8, pitch: 0.6});
                    return;
                }
               
                const item = Potions.resolve(cask.potion_effects[0], cask.potion_liquid)

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
                block.setPermutation(block.permutation.withState("magical_brewery:fill_level", fillLevel-1));

                if(block.permutation.getState("magical_brewery:fill_level") === 0){
                    
                    block.setPermutation(block.permutation.withState("magical_brewery:aged", false));
                    cask.resetCaskPotion();
                    Cask.updateCask(cask)
                }
                return;
            }
        }
    });
});

system.beforeEvents.startup.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('magical_brewery:ot_cask_aging', {
        onTick(e,p) {
            ageCask(e.block, p.params.cask_effect)
        }
    });
});

function getCaskFirstPotionString(caskFirstPotion){
    const effectID = caskFirstPotion.split(":")[1].split("_")
    
    let modifier = ""; 

    if(effectID[0] === "strong" || effectID[0] === "long"){

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

    return effectString
}

function sendAgingTasteMessage(player, caskPotionType, ageCompletionPercentage){

    let agingStage;

    if(ageCompletionPercentage < 20){
        agingStage = 0;
    }
    else if(20 <= ageCompletionPercentage &&  ageCompletionPercentage < 40){
        agingStage = 1;
    }
    else if(40 <= ageCompletionPercentage &&  ageCompletionPercentage < 60){
        agingStage = 2;
    }
    else if(60 <= ageCompletionPercentage &&  ageCompletionPercentage < 80){
        agingStage = 3;
    }
    else if(80 <= ageCompletionPercentage){
        agingStage = 4;
    }
    player.sendMessage({ translate: `magical_brewery:message.cask.tasting_spoon.aging.${agingStage}`, with: [caskPotionType] });

    player.sendMessage({ translate: "magical_brewery:message.cask.tasting_spoon.aging"});
}

function ageCask(block, caskPotionType){
    let cask = Cask.casks[Cask.findIndexCask(block.dimension.id, block.location)]
    
    if(!cask || !cask.canCaskAge(caskPotionType)) return;

    const fillLevel = block.permutation.getState("magical_brewery:fill_level");
    const ageEndTick = cask.age_start_tick + 12000*cask.potion_effects.length + fillLevel*10

    cask.createAgeingFeedback(block)
    cask.checkSeal(block, ageEndTick)
    cask.seal.spawnSealSingleFlameParticle(block.dimension, ageEndTick)
    if(ageEndTick <= system.currentTick){
        
        cask.seal.checkAgedLifetime(cask.potion_effects.length, fillLevel)
        cask.addAgedPotionEffect(caskPotionType)
        Cask.updateCask(cask)
        cask.setCaskAge(block);
        cask.deleteCaskSeal();
        
        // cask.seal.checkAgedLifetime(cask.potion_effects.length, fillLevel)
        // cask.addAgedPotionEffect(caskPotionType)
        // Cask.updateCask(cask)
        // cask.setCaskAge(block);
        // cask.setCaskChargeLevel(block)
        // cask.deleteCaskSeal();
        
    }
    return;
}

world.afterEvents.blockExplode.subscribe((e) => {

    if(e.explodedBlockPermutation.hasTag("magical_brewery:cask")){
        Cask.destroyCask(e.block.dimension.id, e.block.location)
    }
});

world.afterEvents.worldLoad.subscribe((e) => {
    // console.log("loading cask data")
    let caskData = world.getDynamicProperty('magical_brewery:cask_data')
    if(!caskData || caskData.length === 0) return;

    caskData = JSON.parse(caskData)
    caskData.forEach(caskEl => {
        //implement a better test to validate if a block is cask. Somehow need to do it when the player has logged in and loading chunks
        // const caskBlock = world.getDimension(caskEl.dimensionID).getBlock(caskEl.location)
        // console.log(caskBlock.hasTag("magical_brewery:cask"))
        //TODO: Change to a for loop. A "continue" statement is not allowed in a function(despite the functions purpose being of iteration. Like why else would i use it)
        // if(!caskBlock.hasTag("magical_brewery:cask")){
        //     console.log("not a valid block")
        //     return;
        // }
        let cask = new Cask(caskEl.dimensionID, caskEl.location)
        cask.potion_effects = caskEl.potion_effects
        cask.potion_liquid = caskEl.potion_liquid
        //not used but again keeping
        cask.potion_modifier = caskEl.potion_modifier
        cask.age_start_tick = caskEl.age_start_tick
        
        if(caskEl.seal.location !== undefined){

            cask.seal = new Seal(caskEl.seal.location, caskEl.seal.type, caskEl.seal.strength, caskEl.seal.previousTick);
            
            cask.seal.affectCaskAgeing = caskEl.seal.affectCaskAgeing
            cask.seal.lifetime = caskEl.seal.lifetime                 
        }
    });
});



