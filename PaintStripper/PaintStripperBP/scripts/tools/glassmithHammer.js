import {system} from "@minecraft/server";

system.beforeEvents.startup.subscribe(eventData => {
    eventData.itemComponentRegistry.registerCustomComponent('ps:on_use_on_hammer', {
        onUseOn(e) {
            const {block} = e;
            if(!block.hasTag("crystal_seed")) return;

            const seedDepth = block.permutation.getState("ps:seed_depth")
            if(seedDepth != 4){
                block.setPermutation(block.permutation.withState("ps:seed_depth", seedDepth+1));
                block.dimension.spawnParticle("minecraft:critical_hit_emitter", block.center()); 
                block.dimension.playSound('hit.amethyst_block', block.location);
            }
            else{
                block.dimension.playSound('dig.stone', block.location);
            }

            block.dimension.playSound("hit.amethyst_block", block.location, {volume: 0.8, pitch: 1.2});
            
        }
    });
});