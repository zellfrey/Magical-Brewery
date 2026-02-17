import {world, system} from "@minecraft/server";
import {MathUtils} from "../utils/MathUtils.js";
import {getRandomAdjacentBlockAndFace} from "../utils/blockPlacementUtils.js";

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
        const index = BuddingCrystal.buddingCrystals.findIndex(el => MathUtils.equalsVector3(el.location, blockLocation) && el.dimension === blockDimensionID);
        return index;
    }
}

function crystalGrowth(buddingBlock, crystalBudParams){
	
    let buddingCrystal = BuddingCrystal.buddingCrystals[BuddingCrystal.findIndexCrystal(buddingBlock.location, buddingBlock.dimension.id)]
    let unloadTimeCompensation = 1;
    let blockUnloadedTime = system.currentTick - buddingCrystal.previousTick
    
    if(blockUnloadedTime >= 8000) unloadTimeCompensation += Math.trunc(blockUnloadedTime/8000);

    for(let i = 0; i < unloadTimeCompensation; i++){
            
        const budToGrow = getValidGrowthSpace(buddingBlock, crystalBudParams);

        if(!budToGrow || Math.floor(Math.random() * 100) > 20) continue;
            
        growCrystalBud(budToGrow, crystalBudParams.type, crystalBudParams.lastCharNum)
    }
    
    buddingCrystal.setPreviousTick(system.currentTick)
    console.log(system.currentTick)
}

function getValidGrowthSpace(buddingBlock, crystalBudParams){

    const adjacentBlock = getRandomAdjacentBlockAndFace(buddingBlock)
    const budTag = "magical_brewery:" + crystalBudParams.type + "_bud";

    if(!adjacentBlock.block){
        return undefined;
    }
	else if(canCrystalBudGrow(adjacentBlock.block) || adjacentBlock.block.hasTag(budTag)){
		
		return adjacentBlock;
	}
    return undefined;
}

function canCrystalBudGrow(adjacentBlock){
    return adjacentBlock.typeId === "minecraft:air" || adjacentBlock.typeId === "minecraft:water";
}

export function getSurroundingBlocks(block, budTag){
    const blockdAndFaces = [{block:block.above(), face:"up"},{block:block.below(), face:"down"},{block:block.north(), face:"north"}, 
        {block:block.south(), face:"south"},{block:block.west(), face:"west"},{block:block.east(), face:"east"},]

    return blockdAndFaces.filter(lumps => lumps.block.typeId === "minecraft:air" || lumps.block.typeId === "minecraft:water" || lumps.block.hasTag(budTag));
}

export function growCrystalBud(budToGrow, type, lastCharNum){
    let newSize;
    if(budToGrow.block.typeId === "minecraft:air" || budToGrow.block.typeId === "minecraft:water"){
        newSize = `magical_brewery:small_${type}_bud`;
    }
    else{
        const budSize = budToGrow.block.typeId.slice(16, lastCharNum);
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
    budToGrow.block.setType(newSize)
    budToGrow.block.setPermutation(budToGrow.block.permutation.withState("minecraft:block_face", budToGrow.face.toLowerCase()));
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
        onBreak(e) {
            BuddingCrystal.destroyCrystal(e.block.location, e.dimension.id)
        }
    });
});

system.beforeEvents.startup.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('magical_brewery:ort_budding_crystal_growth', {
        onRandomTick(e, p) {
            crystalGrowth(e.block, p.params.crystal_bud)
        }
    });
});

system.beforeEvents.startup.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('magical_brewery:ort_budding_crystal_nether_growth', {
        onRandomTick(e, p) {
            if(e.block.dimension.id !== "minecraft:nether") return;
            crystalGrowth(e.block, p.params.crystal_bud)
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

