import {world, system, ItemStack } from "@minecraft/server";
import {getAdjacentBlock, getBlockFromFace} from "blockPlacementUtils.js";
import "./crystal/budding_glowstone.js"
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

system.runInterval(
    () => {
        const players = world.getAllPlayers();
        for (let i = 0; i < players.length; i++) {
            const player = players[i];
            try {
                const { block, face } = player.getBlockFromViewDirection();
                if (!block) {
                    player.onScreenDisplay.setActionBar( "Not looking at a Block." );
                    return;
                };
                
                player.onScreenDisplay.setActionBar(
                    `§rblock: §7${block.typeId}§r, face: §7${face}§r, xyz: §6${block.location.x} §r/ §6${block.location.y} §r/ §6${block.location.z}§r,\n`
                    + `data: §7${JSON.stringify(block.permutation.getAllStates(), null, 4)}`
                );
            } catch {
                player.onScreenDisplay.setActionBar( "Not looking at a Block." );
            };
        };
    },
);