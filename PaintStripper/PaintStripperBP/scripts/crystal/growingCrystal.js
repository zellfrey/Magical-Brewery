import {world, system, ItemStack } from "@minecraft/server";

//Functions are structured in terms of gameplay progression. 
//seed to growing crystal
system.beforeEvents.startup.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('ps:ort_seed_to_crystal', {
        onRandomTick(e) {
            const { block } = e;
            if(block.typeId === "ps:glowstone_seed" && block.dimension.id !== "minecraft:nether") return;

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
            const seedStage = e.block.permutation.getState('ps:crystal_stage');
            
            crystalGrowth(e.block, seedStage) 
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
        //Setting the block type triggers the budding crystal "onPlace" event. So creating a new BuddingCrystal is not only redundant but also
        //can create 2 objects in the same space. Not good
    }else{
        block.setPermutation(block.permutation.withState('ps:crystal_stage', seedStage+1)); 
    }
}