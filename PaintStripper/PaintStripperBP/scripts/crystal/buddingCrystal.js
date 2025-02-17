import {world, system, ItemStack } from "@minecraft/server";

//glowstone cluster growth via budding glowstone
system.beforeEvents.startup.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('ps:ort_bud_glowstone_growth', {
        onRandomTick(e) {
            const { block } = e;
            if(Math.floor(Math.random() * 100) > 20) return;
            
            const validBlocks = getSurroundingBlocks(block, "glowstone_bud")
            
            if(validBlocks.length === 0) return;

            const budToGrow = validBlocks[Math.floor(Math.random() * validBlocks.length)]
            
            growCrystalBud(budToGrow, "glowstone", 3, -14)
        }
    });
});
//redstone cluster growth via budding redstone
system.beforeEvents.startup.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('ps:ort_bud_redstone_growth', {
        onRandomTick(e) {
            const { block } = e;
            if(Math.floor(Math.random() * 100) > 20) return;
            
            const validBlocks = getSurroundingBlocks(block, "redstone_bud")

            if(validBlocks.length === 0) return;

            const budToGrow = validBlocks[Math.floor(Math.random() * validBlocks.length)]
            
            growCrystalBud(budToGrow, "redstone", 3, -13)
        }
    });
});

system.beforeEvents.startup.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('ps:ort_bud_pure_quartz_growth', {
        onRandomTick(e) {
            const { block } = e;
            if(Math.floor(Math.random() * 100) > 20) return;
            
            const validBlocks = getSurroundingBlocks(block, "pure_quartz_bud")
            
            if(validBlocks.length === 0) return;

            const budToGrow = validBlocks[Math.floor(Math.random() * validBlocks.length)]
            
            growCrystalBud(budToGrow, "pure_quartz", 3, -16)
        }
    });
});

system.beforeEvents.startup.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('ps:ort_bud_echo_growth', {
        onRandomTick(e) {
            const { block } = e;
            if(Math.floor(Math.random() * 100) > 20) return;
            
            const validBlocks = getSurroundingBlocks(block, "echo_bud")
            
            if(validBlocks.length === 0) return;

            const budToGrow = validBlocks[Math.floor(Math.random() * validBlocks.length)]
            
            growCrystalBud(budToGrow, "echo", 3, -9)
        }
    });
});





export function getSurroundingBlocks(block, budTag){
    const blockdAndFaces = [{block:block.above(), face:"up"},{block:block.below(), face:"down"},{block:block.north(), face:"north"}, 
        {block:block.south(), face:"south"},{block:block.west(), face:"west"},{block:block.east(), face:"east"},]

    return blockdAndFaces.filter(lumps => lumps.block.isAir || lumps.block.hasTag(budTag));
}

export function growCrystalBud(selectedBlock, type, firstCharNum, secondCharNum){
    let newSize;
    if(selectedBlock.block.isAir){
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


// world.beforeEvents.worldInitialize.subscribe(eventData => {
//     eventData.blockComponentRegistry.registerCustomComponent('ps:opd_loot_cluster', {
//         onPlayerDestroy(e) {
//             const {player, block} = e;

//             if(!player || player.getGameMode() === "creative" || !player.getComponent('equippable')) return;

//             const equipment = player.getComponent('equippable');
//             const selectedItem = equipment.getEquipment('Mainhand');
//             const enchants = selectedItem.getComponent("minecraft:enchantable");
//             if(enchants){
//                 const enchantments = enchants.getEnchantments();
//                 for (const enchant of enchantments) {
//                     if (enchant.type.id === "silk_touch") {
//                         console.warn("i has silk touch")
//                     }
//                 }
//             }
//             console.warn(selectedItem.typeId)
//             console.warn("crystal broken")
//         }
//     });
// });

