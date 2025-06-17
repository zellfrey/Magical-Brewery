import {world, system, ItemStack } from "@minecraft/server";
import {BuddingCrystal} from "crystal/buddingCrystal.js";

//Functions are structured in terms of gameplay progression. 
//seed to growing crystal
system.beforeEvents.startup.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('ps:ort_seed_to_crystal', {
        onRandomTick(e) {
            const { block } = e;

            const crystalType = block.typeId.slice(3,-5);
            const face = block.permutation.getState("minecraft:block_face");
            const rotation = Math.floor(Math.random() * 4)

            block.setType("ps:growing_crystal");
            block.setPermutation(block.permutation.withState("ps:crystal_type", crystalType)); 
            block.setPermutation(block.permutation.withState("minecraft:block_face", face));
            block.setPermutation(block.permutation.withState("ps:crystal_rotation", rotation));
        }
    });
});


//Growing crystal growth mechanic.
system.beforeEvents.startup.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('ps:ort_crystal_growth', {
        onRandomTick(e) {
            const { block } = e;

            const seedStage = block.permutation.getState('ps:crystal_stage');
            
            crystalGrowth(block, seedStage) 
        }
    });
});

export function crystalGrowth(block, seedStage){
    if(seedStage == 5){
        switch(block.permutation.getState("ps:crystal_type")){
            case "amethyst":
                block.setType("minecraft:budding_amethyst");
            break;
            case "glowstone":
                block.setType("ps:budding_glowstone");
            break;
            case "redstone":
                block.setType("ps:budding_redstone");
            break;
            case "echo":
                block.setType("ps:budding_echo");
            break;
            case "pure_quartz":
                block.setType("ps:budding_pure_quartz");
            break;
        }
        new BuddingCrystal(block.location, block.dimension.id, system.currentTick)
    }else{
        block.setPermutation(block.permutation.withState('ps:crystal_stage', seedStage+1)); 
    }
}