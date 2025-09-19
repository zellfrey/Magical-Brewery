import {world, system, ItemStack } from "@minecraft/server";

const BUDDING_BLOCK_IDS = ["magical_brewery:budding_pure_quartz", "magical_brewery:budding_redstone", 
    "magical_brewery:budding_glowstone", "magical_brewery:budding_echo"]
export class BuddingCrystal {

    static buddingCrystals = []

    constructor(location, dimensionID, previousTick) {
        this.location = location;
        this.dimension  = dimensionID;
        this.previousTick = previousTick;    
        BuddingCrystal.buddingCrystals.push(this)
    }

    setPreviousTick(tick){
        this.previousTick = tick;
    }

    static createBuddingCrystal(blockLocation, blockDimensionID, previousTick){
        new BuddingCrystal(blockLocation, blockDimensionID, previousTick)
        
        let buddingCrystalData = world.getDynamicProperty('magical_brewery:budding_crystal_data')
        if (buddingCrystalData) {
            buddingCrystalData = JSON.parse(buddingCrystalData)
            buddingCrystalData.push(BuddingCrystal.buddingCrystals[BuddingCrystal.buddingCrystals.length-1])
        } else {
            buddingCrystalData = [BuddingCrystal.buddingCrystals[0]]
        }
        world.setDynamicProperty('magical_brewery:budding_crystal_data', JSON.stringify(buddingCrystalData))
        // console.log(BuddingCrystal.buddingCrystals.length)
        // console.log(buddingCrystalData.length)
    }

    static destroyCrystal(blockLocation, blockDimensionID){
        const index = BuddingCrystal.findIndexCrystal(blockLocation, blockDimensionID)

        BuddingCrystal.buddingCrystals.splice(index, 1)
        
        const buddingCrystalsData = JSON.parse(world.getDynamicProperty('magical_brewery:budding_crystal_data'));
        buddingCrystalsData.splice(index, 1);
        // buddingCrystalsData.length = 0;
        // BuddingCrystal.buddingCrystals.length = 0;
        world.setDynamicProperty('magical_brewery:budding_crystal_data', JSON.stringify(buddingCrystalsData));
    }

    static findIndexCrystal(blockLocation, blockDimensionID){
        return BuddingCrystal.buddingCrystals.findIndex(el => JSON.stringify(el.location) == JSON.stringify(blockLocation) 
                                                            && el.dimension === blockDimensionID)
    }
}

function crystalGrowth(block, budType, crystalType, lastCharNum){
    let buddingCrystal = BuddingCrystal.buddingCrystals[BuddingCrystal.findIndexCrystal(block.location, block.dimension.id)]
    let unloadTimeCompensation = 1;
    let blockUnloadedTime = system.currentTick - buddingCrystal.previousTick
    
    if(blockUnloadedTime >= 8000) unloadTimeCompensation += Math.trunc(blockUnloadedTime/8000)
    
    buddingCrystal.setPreviousTick(system.currentTick)
    for(let i = 0; i < unloadTimeCompensation; i++){
        if(Math.floor(Math.random() * 100) > 20) continue;
            
        const validBlocks = getSurroundingBlocks(block, budType)
    
        if(validBlocks.length === 0) return;

        const budToGrow = validBlocks[Math.floor(Math.random() * validBlocks.length)]
            
        growCrystalBud(budToGrow, crystalType, lastCharNum)
    }
}


export function getSurroundingBlocks(block, budTag){
    const blockdAndFaces = [{block:block.above(), face:"up"},{block:block.below(), face:"down"},{block:block.north(), face:"north"}, 
        {block:block.south(), face:"south"},{block:block.west(), face:"west"},{block:block.east(), face:"east"},]

    return blockdAndFaces.filter(lumps => lumps.block.typeId === "minecraft:air" || lumps.block.typeId === "minecraft:water" || lumps.block.hasTag(budTag));
}

export function growCrystalBud(selectedBlock, type, lastCharNum){
    let newSize;
    if(selectedBlock.block.typeId === "minecraft:air" || selectedBlock.block.typeId === "minecraft:water"){
        newSize = `magical_brewery:small_${type}_bud`;
    }
    else{
        const budSize =selectedBlock.block.typeId.slice(16, lastCharNum);
        switch(budSize){
            case "small":
                newSize = `magical_brewery:medium_${type}_bud`;
            break;
            case "medium":
                newSize = `magical_brewery:large_${type}_bud`;
            break;
            case "large":
                newSize = `magical_brewery:${type}_cluster`;
        }
    }
    selectedBlock.block.setType(newSize)
    selectedBlock.block.setPermutation(selectedBlock.block.permutation.withState("minecraft:block_face", selectedBlock.face));
}

//This is also triggered when a growing crystal transforms to a budding crystal
system.beforeEvents.startup.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('magical_brewery:opd_budding_crystal_place', {
        onPlace(e) {
            BuddingCrystal.createBuddingCrystal(e.block.location, e.block.dimension.id, system.currentTick)
        }
    });
});
system.beforeEvents.startup.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('magical_brewery:opd_budding_crystal_destroy', {
        onPlayerBreak(e) {
            BuddingCrystal.destroyCrystal(e.block.location, e.dimension.id)
        }
    });
});

system.beforeEvents.startup.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('magical_brewery:ort_budding_crystal_growth', {
        onRandomTick(e) {
            switch(e.block.typeId){
                case "magical_brewery:budding_glowstone":
                    if(e.block.dimension.id !== "minecraft:nether") return;
                    crystalGrowth(e.block, "magical_brewery:glowstone_bud", "glowstone", -14)
                break;
                case "magical_brewery:budding_redstone":
                    crystalGrowth(e.block, "magical_brewery:redstone_bud", "redstone", -13)
                break;
                case "magical_brewery:budding_pure_quartz":
                    crystalGrowth(e.block, "magical_brewery:pure_quartz_bud", "pure_quartz", -16)
                break;
                case "magical_brewery:budding_echo":
                    crystalGrowth(e.block, "magical_brewery:echo_bud", "echo", -9)
                break;
            }
        }
    });
});

world.afterEvents.worldLoad.subscribe((e) => {
    // console.log("loading budding crystal data")
    let buddingCrystalData = world.getDynamicProperty('magical_brewery:budding_crystal_data')
    if(!buddingCrystalData || buddingCrystalData.length === 0) return;

    buddingCrystalData = JSON.parse(buddingCrystalData)

    buddingCrystalData.forEach(crystal => {new BuddingCrystal(crystal.location, crystal.dimension, crystal.previousTick)});
});

world.afterEvents.blockExplode.subscribe((e) => {
    const { block, explodedBlockPermutation} = e;

    const validBlock = BUDDING_BLOCK_IDS.find((el) => el === explodedBlockPermutation.type.id);
    if(validBlock){
        BuddingCrystal.destroyCrystal(block.location, block.dimension.id)
    }
});
