import {world, system, ItemStack } from "@minecraft/server";
import {getAdjacentBlock, getBlockFromFace} from "blockPlacementUtils.js";
import "./crystal/budding_glowstone.js"
import "./potions.js"
import "./slabStained.js"
world.beforeEvents.worldInitialize.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('ps:seed_test', {
        onPlayerInteract(e) {
            const { block, player } = e;

            const seedStage = block.permutation.getState('ps:crystal_stage');
            const equipment = player.getComponent('equippable');
            const selectedItem = equipment.getEquipment('Mainhand');

            if (!selectedItem || selectedItem.typeId != "minecraft:bone_meal") return;
            

            if(seedStage == 4){
                switch(block.permutation.getState("ps:crystal_type")){
                    case "amethyst":
                        block.setType("minecraft:budding_amethyst");
                    break;
                    case "glowstone":
                        block.setType("ps:budding_glowstone");
                    break;
                    case "redstone":
                        block.setType("ps:budding_redstone");
                }
            }else{
                block.setPermutation(block.permutation.withState('ps:crystal_stage', seedStage+1)); 
            }
            
        }
    });
});
world.beforeEvents.worldInitialize.subscribe(eventData => {
    eventData.itemComponentRegistry.registerCustomComponent('ps:on_use_on_hammer', {
        onUseOn(e) {
            const {block} = e;
            if(!block.hasTag("crystal_seed")) return;

            const seedDepth = block.permutation.getState("ps:seed_depth")
            if(seedDepth != 4){
                block.setPermutation(block.permutation.withState("ps:seed_depth", seedDepth+1)); 
            }

            // Dimension.playSound("hit.amethyst_block", block.location, {volume: 0.8, pitch: 1.2});
            world.playSound('hit.amethyst_block', block.location);
        }
    });
});

world.beforeEvents.worldInitialize.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('ps:ort_seed_to_crystal', {
        onRandomTick(e) {
            const { block } = e;

            const crystalType = block.typeId.slice(8);
            const face = block.permutation.getState("minecraft:block_face");

            block.setType("ps:growing_crystal");
            block.setPermutation(block.permutation.withState("ps:crystal_type", crystalType)); 
            block.setPermutation(block.permutation.withState("minecraft:block_face", face));
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