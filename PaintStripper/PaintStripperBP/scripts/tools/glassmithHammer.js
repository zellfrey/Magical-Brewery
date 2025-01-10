import {world, system, ItemStack } from "@minecraft/server";

world.beforeEvents.worldInitialize.subscribe(eventData => {
    eventData.itemComponentRegistry.registerCustomComponent('ps:on_use_on_hammer', {
        onUseOn(e) {
            const {block} = e;
            if(!block.hasTag("crystal_seed")) return;

            const seedDepth = block.permutation.getState("ps:seed_depth")
            if(seedDepth != 4){
                block.setPermutation(block.permutation.withState("ps:seed_depth", seedDepth+1));
                block.dimension.spawnParticle("minecraft:critical_hit_emitter", block.center()); 
                world.playSound('hit.amethyst_block', block.location);
            }
            else{
                world.playSound('dig.stone', block.location);
            }

            // Dimension.playSound("hit.amethyst_block", block.location, {volume: 0.8, pitch: 1.2});
            
        }
    });
});