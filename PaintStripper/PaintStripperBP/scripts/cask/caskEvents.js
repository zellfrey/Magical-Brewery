import {world, system, ItemStack} from "@minecraft/server";
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
2
system.beforeEvents.startup.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('magical_brewery:opd_cask', {
        onPlayerBreak(e) {
            // const fillLevel = block.permutation.getState("magical_brewery:fill_level");

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
                tasteCaskPotion(cask, fillLevel, caskPotionType, block, dimension, player)
            }
            //Will implement splash and lingering potions at a later date
            //  || selectedItem.typeId === "minecraft:lingering_potion" 
            //     || selectedItem.typeId === "minecraft:splash_potion"
            if(selectedItem.typeId === "minecraft:potion")  emptyPotion(cask, fillLevel, block, dimension, player, equipment, selectedItem)

            if(selectedItem.typeId === "minecraft:glass_bottle")    fillBottle(cask, fillLevel, block, dimension, player)

            return;
        }
    });
});

function tasteCaskPotion(cask, fillLevel, caskPotionType, block, dimension, player){
    
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

            if(!cask.canCaskAge(caskPotionType)){
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
function emptyPotion(cask, fillLevel, block, dimension, player, equipment, selectedItem){

    //v2.0.0 uses "T" (generic) instead of a string. So im using this silly method to just get the first and only component of a potion
    const potion = selectedItem.getComponents()[0];

    if(fillLevel === 3 || potion === undefined || aged || potion.potionEffectType.id === "None") return;
    
    //Currently regeneration potions have an empty string for their effect. This extra check is so they arent used. Hopefully this gets fixed
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

function fillBottle(cask, fillLevel, block, dimension, player, equipment, selectedItem){

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
    block.setPermutation(block.permutation.withState("magical_brewery:fill_level", fillLevel-1));

    if(block.permutation.getState("magical_brewery:fill_level") === 0){
        
        block.setPermutation(block.permutation.withState("magical_brewery:aged", false));
        cask.resetCaskPotion();
        Cask.updateCask(cask)
    }
    
    return;
}

system.beforeEvents.startup.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('magical_brewery:ot_cask_aging', {
        onTick(e,p) {
            ageCask(e.block, p.params.cask_effect)
        }
    });
});

function ageCask(block, caskPotionType){
    let cask = Cask.casks[Cask.findIndexCask(block.dimension.id, block.location)]
    
    if(!cask || !cask.canCaskAge(caskPotionType)) return;

    cask.createAgeingFeedback(block)
    
    const fillLevel = block.permutation.getState("magical_brewery:fill_level");
    const timeToAge = cask.age_start_tick + 12000*cask.potion_effects.length + fillLevel*10

    cask.checkSeal(block)
    
    if(timeToAge <= system.currentTick){
        const caskAgeTime = (12000*cask.potion_effects.length + fillLevel*10)/3
        const caskSealAgeTime = Math.ceil(cask.seal.lifetime*20 / caskAgeTime *100)
        cask.addAgedPotionEffect(caskPotionType, caskSealAgeTime)
        Cask.updateCask(cask)
        block.setPermutation(block.permutation.withState("magical_brewery:aged", true));
        
        const particleLocation = block.center();
        particleLocation.y += 0.4
        block.dimension.spawnParticle("minecraft:crop_growth_emitter", particleLocation);
    }
    return;
}

world.afterEvents.blockExplode.subscribe((e) => {
    const { block, explodedBlockPermutation} = e;

    if(explodedBlockPermutation.hasTag("magical_brewery:cask")){
        Cask.destroyCask(block.dimension.id, block.location)
    }
});

world.afterEvents.worldLoad.subscribe((e) => {
    console.log("loading cask data")
    let caskData = world.getDynamicProperty('magical_brewery:cask_data')
    if(!caskData || caskData.length === 0) return;

    caskData = JSON.parse(caskData)
    caskData.forEach(caskEl => {
        let cask = new Cask(caskEl.dimensionID, caskEl.location)
        cask.potion_effects = caskEl.potion_effects
        cask.potion_liquid = caskEl.potion_liquid
        cask.potion_modifier = caskEl.potion_modifier
        cask.age_start_tick = caskEl.age_start_tick
        cask.seal = caskEl.seal
    });
});



