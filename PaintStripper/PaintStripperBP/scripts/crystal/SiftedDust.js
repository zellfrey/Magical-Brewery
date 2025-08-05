import {world, system, ItemStack, MolangVariableMap} from "@minecraft/server";
import {neighbouringCross} from "utils/blockPlacementUtils.js";

const TIME_TICKS_TO_CLEAN = 2400;

const siftedDustEntityIds=[]
class SiftedDust {
    constructor(entity, block, lore, initialTick) {
        this.entity = entity
        this.block = block
        this.lore  = lore
        this.entityItem = this.entity.getComponent("item").itemStack;
        this.initialTick = initialTick;
        this.siftedDustCandle = getCandleType(this.entityItem.typeId)
        // siftedDustEntityIds.push(entity.id)
    }

    getCandleCross(){
        const crossBlocks = [];
        neighbouringCross.forEach((el) => { crossBlocks.push(this.block.offset({x:el.x, y: 0, z: el.z}))})
        
        return crossBlocks
    }

    cleanSiftedDust() {
        const id = this.entity.id;
        const dim = this.entity.dimension;
        const location = this.block.location
        let isCandleCrossValid = this.getCandleCross().every(el =>validCandle(el, this.siftedDustCandle))
        
        if(this.isWashed()){

            this.washSiftedDust(id, location, dim)
        }    
        if(!this.lore.includes('§7Heat treated') && isCandleCrossValid && this.block.typeId === "minecraft:air"){

            this.heatTreatSiftedDust(id, location, dim)           
        }
        if(!this.lore.includes('§7Lunar charged') && this.block.below().typeId === "minecraft:lodestone"
            && this.block.typeId === "minecraft:air"){

            this.lunarChargeSiftedDust(id, location, dim)    
        }
    }

    isWashed(){
        const isCauldronBlock = this.block.typeId === "minecraft:cauldron";
        const isFluidWater =  this.block.permutation.getState("cauldron_liquid") === "water";
        const isLodestoneBlockBelow = this.block.below().typeId === "minecraft:lodestone";

        return !this.lore.includes('§7Washed') && isCauldronBlock && isFluidWater && !isLodestoneBlockBelow
    }

    washSiftedDust(id, location, dim){

        const washing = system.runInterval(() => {

            const isFluidWater =  this.block.permutation.getState("cauldron_liquid") === "water";

            if(!entityExists(id, location, dim) || this.block.typeId !== "minecraft:cauldron" || !isFluidWater
            || this.block.below().typeId === "minecraft:lodestone"){
                system.clearRun(washing)
                return;
            }
            dim.playSound("bubble.pop", this.entity.location, {volume: 0.5, pitch: 2})
            // const molang = new MolangVariableMap();
            // const direction = getParticleRandomVector3(this.entity.location)
            // molang.setSpeedAndDirection("variable.direction", { x: direction.x, y: direction.y, z: direction.z});
            this.entity.dimension.spawnParticle("magical_brewery:bubble", this.entity.location);
            
            if(this.initialTick + TIME_TICKS_TO_CLEAN <= system.currentTick){
                system.clearRun(washing)
                this.setSiftedDustLore('§7Washed', dim)
            }
        }, 30);
    }
    heatTreatSiftedDust(id, location, dim){

        const heating = system.runInterval(() => {      

        let isCandleCrossValid = this.getCandleCross().every(el =>validCandle(el, this.siftedDustCandle))
            if(!entityExists(id, location, dim) || !isCandleCrossValid || this.block.typeId !== "minecraft:air"
            || this.block.below().typeId === "minecraft:lodestone"){
                system.clearRun(heating)
                return;
            }
            dim.playSound("mob.ghast.fireball", this.entity.location, {volume: 0.1, pitch: 2});
            this.spawnCandleCleaningParticle()
            if(this.initialTick + TIME_TICKS_TO_CLEAN <= system.currentTick){
                system.clearRun(heating)
                this.setSiftedDustLore('§7Heat treated', dim)
            }
        }, 30);
    }

    lunarChargeSiftedDust(id, location, dim){
        
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
            dim.playSound("beacon.ambient", this.entity.location, {volume: 0.3, pitch: 2.5});
            this.entity.dimension.spawnParticle("magical_brewery:lunar_charge", getParticleRandomVector3(this.entity.location));
            if(this.initialTick + TIME_TICKS_TO_CLEAN <= system.currentTick){
                system.clearRun(moon)
                this.setSiftedDustLore('§7Lunar charged', dim)
            }
        }, 30);
    }
            
    setSiftedDustLore(cleanStage, dimension){

        if(!entityExists(this.entity.id, this.block.location, dimension)) return;

        const item = this.entity.getComponent("item").itemStack;
        let spawnLocation= this.entity.location
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
        spawnPureParticle(dimension, item.typeId, spawnLocation)
        dimension.playSound("mob.ghast.fireball", spawnLocation, {volume: 0.5, pitch: 0.3});
        dimension.playSound("beacon.power", spawnLocation, {volume: 0.2, pitch: 1});
        }
        const newItemEntity = dimension.spawnItem(shard, spawnLocation)
        newItemEntity.teleport(spawnLocation)
        
    }
    spawnCandleCleaningParticle(){
        let dustType;
        switch(this.entityItem.typeId){
            case "magical_brewery:sifted_quartz":
                dustType = "enlargement";
            break;
            case "magical_brewery:sifted_redstone_dust":
                dustType = "longevity";
            break;
            case "magical_brewery:sifted_glowstone_dust":
                dustType = "potency";
        }
        this.entity.dimension.spawnParticle(`magical_brewery:dust_${dustType}_flame`, getParticleRandomVector3(this.entity.location));
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


const SIFTED_DUSTS = ["magical_brewery:sifted_quartz", "magical_brewery:sifted_redstone_dust", "magical_brewery:sifted_glowstone_dust"]
world.afterEvents.entitySpawn.subscribe(async (e) => {
    const {entity} = e;
    try{
        if(entity.typeId !== "minecraft:item") return;
        const item = entity.getComponent("item").itemStack;
        if(!SIFTED_DUSTS.includes(item.typeId)) return;
        await system.waitTicks(40);
        let block;
        block = entity.dimension.getBlock(entity.location);
        if(!entityExists(entity.id, block.location, entity.dimension)) return; 

        const siftedDust = new SiftedDust(entity, block, item.getLore(), system.currentTick);
        siftedDust.cleanSiftedDust();
    }catch(error){
        // console.warn("Magical Brewery: Sifted Item Entity wasn't found " + e)
        //Look there is going to be an error the entity disappears during the await period.
        //This is fine. Im just supressing the error
    }
});

function getRndFloat(min, max) {
  return (Math.floor(Math.random() * (max - min) ) + min)/10;
}

function spawnPureParticle(dimension, itemName, location){
    let dustType;
    switch(itemName){
        case "magical_brewery:sifted_quartz":
            dustType = "enlargement";
        break;
        case "magical_brewery:sifted_redstone_dust":
            dustType = "longevity";
        break;
        case "magical_brewery:sifted_glowstone_dust":
            dustType = "potency";
    }
    dimension.spawnParticle(`magical_brewery:seal_${dustType}_flame`, getParticleRandomVector3(location));
}

function getParticleRandomVector3(location){
    let particleSpawnVector3 = location;
    particleSpawnVector3.x += getRndFloat(-2, 2)
    particleSpawnVector3.y += getRndFloat(-2, 2) + 0.5;
    particleSpawnVector3.z += getRndFloat(-2, 2);
    return particleSpawnVector3;
}