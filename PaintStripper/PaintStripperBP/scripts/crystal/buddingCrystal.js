import {world, system, ItemStack } from "@minecraft/server";

const buddingCrystals = []
export class BuddingCrystal {
    constructor(location, dimensionID, previousTick) {
        this.location = location
        this.dimension  = dimensionID
        this.previousTick = previousTick;
        buddingCrystals.push(this)
        console.log(buddingCrystals.length)
    }
}
//glowstone cluster growth via budding glowstone
system.beforeEvents.startup.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('ps:ort_bud_glowstone_growth', {
        onRandomTick(e) {
            canCrystalGrow(e.block, "glowstone_bud", "glowstone", -14)
        }
    });
});

system.beforeEvents.startup.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('ps:op_bud_glowstone', {
        onPlace(e) {
            new BuddingCrystal(e.block.location, e.block.dimension.id, system.currentTick)
        }
    });
});
system.beforeEvents.startup.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('ps:opd_bud_glowstone', {
        onPlayerBreak(e) {
            const {block, dimension} = e;
            // const fillLevel = block.permutation.getState("ps:fill_level");

            // if(fillLevel > 0) 
            // dimension.playSound("bucket.empty_powder_snow", block.location, {volume: 0.8, pitch: 1.0});
            console.log("breaking cask")
            deleteCask(dimension.id, block.location);
        }
    });
});

//redstone cluster growth via budding redstone
system.beforeEvents.startup.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('ps:ort_bud_redstone_growth', {
        onRandomTick(e) {
            canCrystalGrow(e.block, "redstone_bud", "redstone", -13)
        }
    });
});

system.beforeEvents.startup.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('ps:ort_bud_pure_quartz_growth', {
        onRandomTick(e) {
            canCrystalGrow(e.block, "pure_quartz_bud", "pure_quartz", -16)
        }
    });
});

system.beforeEvents.startup.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('ps:ort_bud_echo_growth', {
        onRandomTick(e) {
            canCrystalGrow(e.block, "echo_bud", "echo", -9)
        }
    });
});


function canCrystalGrow(block, budType, crystalType, lastCharNum){
    console.log(system.currentTick)
    if(Math.floor(Math.random() * 100) > 20) return;
            
    const validBlocks = getSurroundingBlocks(block, budType)
    
    if(validBlocks.length === 0) return;

    const budToGrow = validBlocks[Math.floor(Math.random() * validBlocks.length)]
            
    growCrystalBud(budToGrow, crystalType, 3, lastCharNum)
}


export function getSurroundingBlocks(block, budTag){
    const blockdAndFaces = [{block:block.above(), face:"up"},{block:block.below(), face:"down"},{block:block.north(), face:"north"}, 
        {block:block.south(), face:"south"},{block:block.west(), face:"west"},{block:block.east(), face:"east"},]

    return blockdAndFaces.filter(lumps => lumps.block.typeId === "minecraft:air" || lumps.block.typeId === "minecraft:water" || lumps.block.hasTag(budTag));
}

export function growCrystalBud(selectedBlock, type, firstCharNum, secondCharNum){
    let newSize;
    if(selectedBlock.block.typeId === "minecraft:air" || selectedBlock.block.typeId === "minecraft:water"){
        newSize = `ps:small_${type}_bud`;
    }
    else{
        const budSize =selectedBlock.block.typeId.slice(firstCharNum, secondCharNum);
        switch(budSize){
            case "small":
                newSize = `ps:medium_${type}_bud`;
            break;
            case "medium":
                newSize = `ps:large_${type}_bud`;
            break;
            case "large":
                newSize = `ps:${type}_cluster`;
        }
    }
    selectedBlock.block.setType(newSize)
    selectedBlock.block.setPermutation(selectedBlock.block.permutation.withState("minecraft:block_face", selectedBlock.face));
}