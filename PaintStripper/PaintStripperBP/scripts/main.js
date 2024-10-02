import {world, system, ItemStack } from "@minecraft/server";
import {getAdjacentBlock, getBlockFromFace} from "blockPlacementUtils.js";

world.beforeEvents.worldInitialize.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('ps:seed_test', {
        onPlayerInteract(e) {
            const { block, player } = e;

            const seedStage = block.permutation.getState('ps:crystal_stage');
            const equipment = player.getComponent('equippable');
            const selectedItem = equipment.getEquipment('Mainhand');

            if (!selectedItem || selectedItem.typeId != "minecraft:bone_meal") return;
            
            if(seedStage == 4){
                block.setType("minecraft:budding_amethyst")
            }else{
                block.setPermutation(block.permutation.withState('ps:crystal_stage', seedStage+1)); 
            }
            
        }
    });
});

world.beforeEvents.worldInitialize.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('ps:on_random_tick_bud_growth', {
        onPlayerInteract(e) {
            const { block, player } = e;
            if(Math.floor(Math.random() * 100) > 20) return;

            const equipment = player.getComponent('equippable');
            const selectedItem = equipment.getEquipment('Mainhand');
            if (!selectedItem || selectedItem.typeId != "minecraft:bone_meal") return;
            
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

world.afterEvents.playerBreakBlock.subscribe((e) => {
    const { brokenBlockPermutation, dimension,block } = e;

    if (brokenBlockPermutation.type.id === "minecraft:glowstone" && (Math.floor(Math.random() * 100) < 5)) {
        dimension.spawnItem(new ItemStack("ps:glowstone_shard", 1), block.location);
    }
});

world.beforeEvents.worldInitialize.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('ps:bop_cluster_glowstone', {
        beforeOnPlayerPlace(e) {
            const { player, block, face, permutationToPlace, dimension } = e;
            const affectedBlock = getBlockFromFace(block, face)
            if(!affectedBlock.isSolid){
                e.cancel = true;
                return;
            }
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
