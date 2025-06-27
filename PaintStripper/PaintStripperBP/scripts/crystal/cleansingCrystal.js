import {world, system, ItemStack,MolangVariableMap} from "@minecraft/server";
import {neighbouringCross} from "utils/blockPlacementUtils.js";

const crystalEntityIds=[]
class Crystal {
    constructor(entity, block, lore, initialTick) {
        this.entity = entity
        this.block = block
        this.lore  = lore
        this.entityItem = this.entity.getComponent("item").itemStack;
        this.initialTick = initialTick;
        this.crystalCandle = getCandleType(this.entityItem.typeId)
        // crystalEntityIds.push(entity.id)
    }

    cleanCrystal() {
        const id = this.entity.id;
        const dim = this.entity.dimension;
        const location = this.block.location
        let isCandleCrossValid = this.getCandleCross().every(el =>validCandle(el, this.crystalCandle))
        
        if(!this.lore.includes('§7Washed') && this.block.typeId === "minecraft:water" 
        && this.block.below().typeId !== "minecraft:lodestone"){

            const washing = system.runInterval(() => {
                if(!entityExists(id, location, dim) || this.block.typeId !== "minecraft:water" 
                || this.block.below().typeId === "minecraft:lodestone"){
                    system.clearRun(washing)
                    return;
                }

                if(this.initialTick + 240 <= system.currentTick){
                    system.clearRun(washing)
                    this.setCrystalLore('§7Washed', dim)
                }
            }, 30);
        }
        
        if(!this.lore.includes('§7Heat treated') && isCandleCrossValid && this.block.typeId === "minecraft:air"){
            
            const heating = system.runInterval(() => {
                 
                isCandleCrossValid = this.getCandleCross().every(el =>validCandle(el, this.crystalCandle))
                if(!entityExists(id, location, dim) || !isCandleCrossValid || this.block.typeId !== "minecraft:air"
                    || this.block.below().typeId === "minecraft:lodestone"){
                    system.clearRun(heating)
                    return;
                }
            //     const molang = new MolangVariableMap();
            //     molang.setColorRGBA("variable.color", { red: 3, green: 4, blue: 3, alpha: 0});
            //    dim.spawnParticle("minecraft:colored_flame_particle", this.entity.location);  
                if(this.initialTick + 240 <= system.currentTick){
                    system.clearRun(heating)
                    console.log('§7Heat treated')
                    this.setCrystalLore('§7Heat treated', dim)
                }
            }, 30);        
        }

        if(!this.lore.includes('§7Lunar charged') && this.block.below().typeId === "minecraft:lodestone"
            && this.block.typeId === "minecraft:air"){
            
            const moon = system.runInterval(() => {
                
                if(!entityExists(id, location, dim)){
                    system.clearRun(moon)
                    return;
                }
                const time = world.getTimeOfDay();
                const moonPhase = world.getMoonPhase();
                const {x,y,z} = this.block.location
                const topBlock = this.entity.dimension.getTopmostBlock({x,z})
                
                if((JSON.stringify(topBlock.location) !== JSON.stringify(this.block.below().location)) 
                    || !(time >= 15000 && time <= 20000) || moonPhase !== 0){
                    system.clearRun(moon)
                    return;
                }
                if(this.initialTick + 240 <= system.currentTick){
                    system.clearRun(moon)
                    console.log('§7Lunar charged')
                    this.setCrystalLore('§7Lunar charged', dim)
                }
                
            }, 30);
        }
    }
    getCandleCross(){
        const crossBlocks = [];
        neighbouringCross.forEach((el) => { crossBlocks.push(this.block.offset({x:el.x, y: 0, z: el.z}))})
        
        return crossBlocks
    }
    setCrystalLore(cleanStage, dimension){

        if(!entityExists(this.entity.id, this.block.location, dimension)) return;

        const item = this.entity.getComponent("item").itemStack;
        const spawnLocation= this.entity.location
        let shard = new ItemStack(item.typeId, 1);
        this.entity.remove();

        this.lore.push(cleanStage)
        shard.setLore(this.lore);
        const newLore = shard.getLore()

        if(newLore.length === 3){
            let pureItem;
            switch(item.typeId){
                case "magical_brewery:sifted_quartz":
                    pureItem = "magical_brewery:pure_quartz_shard";
                break;
                case "magical_brewery:sifted_redstone_dust":
                    pureItem = "magical_brewery:pure_redstone_dust";
                break;
                case "magical_brewery:sifted_glowstone_dust":
                    pureItem = "magical_brewery:pure_glowstone_dust";
            }
        shard = new ItemStack(pureItem, 1);
        }
        const newItemEntity = dimension.spawnItem(shard, spawnLocation)
        newItemEntity.teleport(spawnLocation)
    }
}

function validCandle(block, candle){
    const lit = block.permutation.getState("lit");
    const candles = block.permutation.getState("candles");
    const validCandleBlock = lit && candles === 3
    return validCandleBlock && block.typeId === candle
}
function getCandleType(itemName){
    let candle;
        switch(itemName){
            case "magical_brewery:sifted_quartz":
                candle = "minecraft:white_candle"
            break;
            case "magical_brewery:sifted_redstone_dust":
                candle = "minecraft:red_candle"
            break;
            case "magical_brewery:sifted_glowstone_dust":
                candle = "minecraft:yellow_candle"
            break;
        }
    return candle;
}
function entityExists(entityId, location, dimension){
    const entities  = dimension.getEntitiesAtBlockLocation(location);
    if(entities.length === 0){
        return false;
    }  
    for(let i = 0; i < entities.length; i++){
        if(entities[i].id === entityId){
            return true;
        }
    }
    return false;
}


const siftedItems = ["magical_brewery:sifted_quartz", "magical_brewery:sifted_redstone_dust", "magical_brewery:sifted_glowstone_dust"]
world.afterEvents.entitySpawn.subscribe(async (e) => {
    const {entity} = e;
    try{
        if(entity.typeId !== "minecraft:item") return;
        const item = entity.getComponent("item").itemStack;
        if(!siftedItems.includes(item.typeId)) return;
        await system.waitTicks(40);
        let block;
        block = entity.dimension.getBlock(entity.location);
        if(!entityExists(entity.id, block.location, entity.dimension)) return; 

        const crystal = new Crystal(entity, block, item.getLore(), system.currentTick);
        crystal.cleanCrystal();
    }catch(error){
        // console.warn("Magical Brewery: Sifted Item Entity wasn't found " + e)
        //Look there is going to be an error the entity disappears during the await period.
        //This is fine. Im just supressing the error
    }
});