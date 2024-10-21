import {world, system, ItemStack } from "@minecraft/server";

//Crystal cluster growth
world.beforeEvents.worldInitialize.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('ps:ort_bud_growth', {
        onRandomTick(e) {
            const { block } = e;
            if(Math.floor(Math.random() * 100) > 20) return;
            
            const blockdAndFaces = [{block:block.above(), face:"up"},{block:block.below(), face:"down"},{block:block.north(), face:"north"}, 
                                    {block:block.south(), face:"south"},{block:block.west(), face:"west"},{block:block.east(), face:"east"},]
            //ive used "block" enough times. Lets spice things up                        
            const availableLumps = blockdAndFaces.filter(parallelepiped => 
                                                            parallelepiped.block.isAir || parallelepiped.block.typeId === "ps:cluster_glowstone");

            if(availableLumps.length === 0) return;

            const budToGrow = availableLumps[Math.floor(Math.random() * availableLumps.length)]
            
            if(budToGrow.block.isAir){
                budToGrow.block.setType("ps:cluster_glowstone")
                budToGrow.block.setPermutation(budToGrow.block.permutation.withState("minecraft:block_face", budToGrow.face)); 
            }
            else{
                const seedStage = budToGrow.block.permutation.getState('ps:crystal_stage');
                if(seedStage === 4) return;
                budToGrow.block.setPermutation(budToGrow.block.permutation.withState('ps:crystal_stage', seedStage+1)); 
            }
        }
    });
});

//Hook into vanilla events to create custom loot table
world.afterEvents.playerBreakBlock.subscribe((e) => {
    const { brokenBlockPermutation, dimension,block } = e;

    if (brokenBlockPermutation.type.id === "minecraft:glowstone" && (Math.floor(Math.random() * 100) < 5)) {
        dimension.spawnItem(new ItemStack("ps:glowstone_shard", 1), block.location);
    }
});


world.beforeEvents.worldInitialize.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('ps:bop_cluster_glowstone', {
        beforeOnPlayerPlace(e) {
            const { player, permutationToPlace } = e;
            //Would prefer if custom blocks can have a "isSolid" component. Also the swing animation still plays if something isnt placeable
            // const affectedBlock = getBlockFromFace(block, face)
            // if(!affectedBlock.isSolid){
            //     e.cancel = true;
            //     return;
            // }
            const equipment = player.getComponent('equippable');
            const selectedItem = equipment.getEquipment('Mainhand');
            let stageSize; 
            
            if(selectedItem.typeId === "ps:glowstone_cluster"){
                stageSize = 4;
            }else{
                const clusterSize = selectedItem.typeId.split("_")[0].substring(3);

                switch(clusterSize){
                    case "large":
                        stageSize = 3;
                    break;
                    case "medium":
                        stageSize = 2;
                    break;
                    case "small":
                        stageSize = 1;
                    break;
                }
            }
            e.permutationToPlace = permutationToPlace.withState('ps:crystal_stage', stageSize);
            }
    });
});

world.beforeEvents.worldInitialize.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('ps:opd_loot_cluster', {
        onPlayerDestroy(e) {
            const {player, block} = e;

            if(!player || player.getGameMode() === "creative" || !player.getComponent('equippable')) return;

            const equipment = player.getComponent('equippable');
            const selectedItem = equipment.getEquipment('Mainhand');
            console.warn("crystal broken")
        }
    });
});