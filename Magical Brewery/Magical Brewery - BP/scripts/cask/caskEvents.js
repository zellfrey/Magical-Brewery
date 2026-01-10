import {world, system} from "@minecraft/server";
import {setMainHand} from '../utils/containerUtils.js';
import {MagicalBreweryPotion} from "../potion/MagicalBreweryPotion.js";
import {MinecraftPotion} from "../potion/MinecraftPotion.js";
import {Seal} from "../cask/Seal.js";
import {Cask} from "../cask/Cask.js";
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
            Cask.destroyCask(e.block.dimension.id, e.block.location)
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
			
			if(cask === undefined){
				Cask.createCask(dimension.id, block.location)
				cask = Cask.casks[Cask.findIndexCask(block.dimension.id, block.location)]
			} 
			
            const fillLevel = block.permutation.getState("magical_brewery:fill_level");
            const aged = block.permutation.getState("magical_brewery:aged");
            //Failsafe
            

            if(selectedItem.typeId === "magical_brewery:tasting_spoon"){

                const caskPotionType = p.params.cask.effect;
                const caskTranslateKey = p.params.cask.translate_key;

                if(fillLevel === 0){
                    dimension.playSound("hit.chiseled_bookshelf", block.location, {volume: 0.8, pitch: 0.6});
                    player.sendMessage({ translate: "magical_brewery:message.cask.tasting_spoon.empty"});
                }
                else{
                    dimension.playSound("bottle.empty", block.location, {volume: 0.8, pitch: 2.2});

                    let caskPotions = cask.getFirstPotionString() + "\n";

                    player.sendMessage({ translate: "magical_brewery:message.cask.tasting_spoon.initial_taste"})

                    if(!aged){

                        for(let i = 1; i !== cask.potion_effects.length; i++){
                            caskPotions += cask.potion_effects[i] + "\n"
                        }

                        player.sendMessage(caskPotions)

                        if(block.typeId === "magical_brewery:cask_no_effect"){
                            player.sendMessage({ translate: "magical_brewery:message.cask.tasting_spoon.cask_no_effect"});
                        }
                        else if(!cask.canCaskAge(caskPotionType)){
                            player.sendMessage({ translate: "magical_brewery:message.cask.tasting_spoon.cannot_age"});
                        }
                        else{
                            const ageTime = 12000*cask.potion_effects.length + fillLevel*10;
                            const ageEndTick = cask.age_start_tick + ageTime;
                            const ageCompletionPercentage = Math.trunc(100 - ((ageEndTick - system.currentTick)/ageTime) * 100);

                            sendAgingTasteMessage(player, caskTranslateKey, ageCompletionPercentage);
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
            if(selectedItem.typeId === "minecraft:potion" || selectedItem.hasTag("magical_brewery:potion")){
                
                cask.fillCask(selectedItem, block, dimension, player);
				
                return;
            }

            if(selectedItem.typeId === "minecraft:glass_bottle"){

                if(fillLevel === 0){
                    dimension.playSound("hit.chiseled_bookshelf", block.location, {volume: 0.8, pitch: 0.6});
                    return;
                }
                
                let item;
                const potionCreationType = cask.potion_effects[0].split(":")[0]

                if(potionCreationType === "minecraft"){

                    item = MinecraftPotion.setItemStack(cask.potion_effects[0], cask.potion_liquid)
                }
                else{
                    item = MagicalBreweryPotion.setItemStack(cask.potion_effects[0])
                }

                
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
            ageCask(e.block, p.params)
        }
    });
});


function sendAgingTasteMessage(player, caskTranslateKey, ageCompletionPercentage){

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
    
    const agingStageMessage = {
        translate: `magical_brewery:message.cask.tasting_spoon.aging.${agingStage}`,
        with: { rawtext: [{ translate: `potion.${caskTranslateKey}` }] },
        };

    player.sendMessage(agingStageMessage);

    player.sendMessage({ translate: "magical_brewery:message.cask.tasting_spoon.aging"});
}

function ageCask(block, caskAgingParameters){
    let cask = Cask.casks[Cask.findIndexCask(block.dimension.id, block.location)]
    
    if(!cask || !cask.canCaskAge(caskAgingParameters.cask.effect)) return;

    const fillLevel = block.permutation.getState("magical_brewery:fill_level");
    const ageEndTick = cask.age_start_tick + 12000*cask.potion_effects.length + fillLevel*10

    cask.createAgeingFeedback(block)
    cask.checkSeal(block, ageEndTick, caskAgingParameters.seal.no_effect)
    cask.seal.spawnSealSingleParticle(block.center(), block.dimension, ageEndTick, caskAgingParameters.seal.no_effect)
    if(ageEndTick <= system.currentTick){
        
        cask.seal.checkAgedLifetime(cask.potion_effects.length, fillLevel)
        cask.addAgedPotionEffect(caskAgingParameters.cask.effect)
        Cask.updateCask(cask)
        cask.setCaskAge(block);
        cask.setCaskQuality(block, caskAgingParameters.cask.id)
        cask.deleteCaskSeal();
        
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



