import {world, system, ItemStack } from "@minecraft/server";

const willChiselBlocks = ["minecraft:budding_amethyst", "minecraft:glowstone", "minecraft:redstone_ore",
    "minecraft:deepslate_redstone_ore","minecraft:lit_redstone_ore","minecraft:lit_deepslate_redstone_ore"]

world.beforeEvents.worldInitialize.subscribe(eventData => {
    eventData.itemComponentRegistry.registerCustomComponent('ps:on_use_on_chisel', {
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