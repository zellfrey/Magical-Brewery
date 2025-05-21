import {world, system, ItemStack} from "@minecraft/server";
import {neighbouringCross} from "utils/blockPlacementUtils.js";

const vanillaItems = ["minecraft:quartz", "minecraft:redstone_dust", "minecraft:glowstone_dust"]
//purging with heat
//heat treated
world.afterEvents.entitySpawn.subscribe(async (e) => {
    const {entity} = e;
    if(entity.typeId !== "minecraft:item") return;
    const item = entity.getComponent("item").itemStack;
    if(!vanillaItems.includes(item.typeId)) return;

    //Wait for item entity to settle on the ground
    await system.waitTicks(20);
    const eCoords = entity.location
    const block = entity.dimension.getBlock(eCoords);
    console.log(item.typeId)
    cleanCrystal(item, entity, block, eCoords, block.location);

    
    

});
  function cleanCrystal(item, entity, block, entityCoords, blockCoords){
    
    const {x,y,z} = blockCoords
    const dim = entity.dimension
    const lore = item.getLore();
    
    let cleanStage;
    if(!lore.includes('§7Washed')){
        if(block.typeId === "minecraft:water"){
            const initialTick = system.currentTick
            const check = system.runInterval(() => {
                console.log(dim.getBlock(entityCoords).typeId)
                const entities  = dim.getEntitiesAtBlockLocation(blockCoords);
                if(entities.length === 0){
                    system.clearRun(check)
                    return;
                }  
                if(initialTick + 240 <= system.currentTick){
                    system.clearRun(check)
                    setCrystalItemLore(entities[0], '§7Washed', dim, entityCoords)
                }
                }, 60);
            // cleanStage = '§7Washed';
            
        }
        //find blocklocation, if not there, return,
        //await some Ticks, say 1 minute or 2
        //check again for block so people dont cheese it. TODO:Check every second or 2 seconds if block is
    }
    if(!lore.includes('§7Heat treated')){
        let candle;
        switch(item.typeId){
            case "minecraft:quartz":
                candle = "minecraft:white_candle"
            break;
            case "minecraft:redstone":
                candle = "minecraft:red_candle"
            break;
            case "minecraft:glowstone":
                candle = "minecraft:yellow_candle"
            break;
        }

        const crossBlocks = [];
        neighbouringCross.forEach((el) => { crossBlocks.push(block.offset({x:el.x, y: 0, z: el.z}))})
        const isCandleCrossValid = crossBlocks.every(el => el.typeId === candle)
        if(isCandleCrossValid){
            cleanStage = '§7Heat treated';
        }
        
        //find blocklocation, if not there, return,
        //await some Ticks, say 1 minute or 2
        //check again for block so people dont cheese it. TODO:Check every second or 2 seconds if block is
    }
    if(!lore.includes('§7Harmonised')){
        if(block.below().typeId === "minecraft:noteblock"){
            
            cleanStage = '§7Harmonised';
            
        }
        
        //find blocklocation, if not there, return,
        //await some Ticks, say 1 minute or 2
        //check again for block so people dont cheese it. TODO:Check every second or 2 seconds if block is
    }
    if(!lore.includes('§7Lunar charged')){
        const time = world.getTimeOfDay();
        const moonPhase = world.getMoonPhase();
        if((time >= 15000 && time <= 20000) && moonPhase === 0){
            cleanStage = '§7Lunar charged';
        }
        
        //find blocklocation, if not there, return,
        //await some Ticks, say 1 minute or 2
        //check again for block so people dont cheese it. TODO:Check every second or 2 seconds if block is
    }

    if(cleanStage === undefined) return;

    setCrystalItemLore(entities[0], '§7Washed', "minecraft:quartz", entityCoords)   
    
}

function validCandle(block, candle){

}

function setCrystalItemLore(entity, cleanStage, dimension, entityCoords){

    const item = entity.getComponent("item").itemStack;
    const quartz = new ItemStack(item.typeId, 1);
    const lore = item.getLore();
    entity.remove();
    
    lore.push(cleanStage)
    quartz.setLore(lore);
    const newLore = quartz.getLore()

    if(newLore.length === 4){
        dimension.spawnItem(new ItemStack("ps:pure_quartz_shard", 1), entityCoords)
    }else{
        dimension.spawnItem(quartz, entityCoords)
    }
}
                    
//Start with the easy steps
//Wash in water
//Medium steps
//Ring noteblock with item above
//heat treat item
//Final step
//leave to soak up lunar light