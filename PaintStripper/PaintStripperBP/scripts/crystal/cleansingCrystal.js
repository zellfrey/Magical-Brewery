import {world, system, ItemStack} from "@minecraft/server";
import {neighbouringCross} from "utils/blockPlacementUtils.js";

const vanillaItems = ["minecraft:quartz", "minecraft:redstone", "minecraft:glowstone"]
//purging with heat
//heat treated
world.afterEvents.entitySpawn.subscribe(async (e) => {
    const {entity} = e;
    if(entity.typeId !== "minecraft:item") return;
    const item = entity.getComponent("item").itemStack;
    if(!vanillaItems.includes(item.typeId)) return;
    await system.waitTicks(20);
    const eCoords = entity.location
    const block = entity.dimension.getBlock(eCoords);

    cleanCrystal(item, entity, block, eCoords, block.location);

    // let candle;
    // switch(name){
    //     case "minecraft:quartz":
    //         candle = "minecraft:white_candle"
    //     break;
    //     case "minecraft:redstone":
    //         candle = "minecraft:red_candle"
    //     break;
    //     case "minecraft:glowstone":
    //         candle = "minecraft:yellow_candle"
    //     break;
    // }
    

});
  function cleanCrystal(item, entity, block, entityCoords, blockCoords){
    
    const {x,y,z} = blockCoords
    const dim = entity.dimension
    const lore = item.getLore();
    
    let cleanStage;
    if(!lore.includes('§7Washed')){
        if(block.typeId === "minecraft:water"){
            
            cleanStage = '§7Washed';
            
        }
        //find blocklocation, if not there, return,
        //await some Ticks, say 1 minute or 2
        //check again for block so people dont cheese it. TODO:Check every second or 2 seconds if block is
    }else if(!lore.includes('§7Heat treated')){
        // neighbouringCross.forEach((el) => {
        // const neighbour = block.offset({x: x+el.x, y: y, z:z+ el.z})
        // console.warn(neighbour.type)
        // });
        cleanStage = '§7Heat treated';
        //find blocklocation, if not there, return,
        //await some Ticks, say 1 minute or 2
        //check again for block so people dont cheese it. TODO:Check every second or 2 seconds if block is
    }else if(!lore.includes('§7Harmonised')){
        cleanStage = '§7Harmonised';
        //find blocklocation, if not there, return,
        //await some Ticks, say 1 minute or 2
        //check again for block so people dont cheese it. TODO:Check every second or 2 seconds if block is
    }else if(!lore.includes('§7Lunar charged')){
        cleanStage = '§7Lunar charged';
        world.getMoonPhase();
        //find blocklocation, if not there, return,
        //await some Ticks, say 1 minute or 2
        //check again for block so people dont cheese it. TODO:Check every second or 2 seconds if block is
    }

    if(cleanStage === undefined) return;

    entity.remove();
    const quartz = new ItemStack("minecraft:quartz", 1);
    lore.push(cleanStage)
    quartz.setLore(lore);
    const newLore = quartz.getLore()
    console.warn(newLore.length)
    console.warn(newLore.toString())

    if(newLore.length === 4){
        dim.spawnItem(new ItemStack("ps:pure_quartz_shard", 1), entityCoords)
    }else{
        dim.spawnItem(quartz, entityCoords)
    }
    
}
//Start with the easy steps
//Clean dust/crystal with brush
//Wash in water
//Medium steps
//Ring noteblock with item above
//heat treat item
//Final step
//leave to soak up lunar light