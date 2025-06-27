import {world, system, ItemStack } from "@minecraft/server";

//Functions are structured in terms of gameplay progression. 
//seed to growing crystal
system.beforeEvents.startup.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('magical_brewery:ort_seed_to_crystal', {
        onRandomTick(e,p) {
            const { block } = e;
            if(block.typeId === "magical_brewery:glowstone_seed" && block.dimension.id !== "minecraft:nether") return;
            const face = block.permutation.getState("minecraft:block_face");
            const rotation = Math.floor(Math.random() * 4)

            block.setType("magical_brewery:growing_crystal");
            block.setPermutation(block.permutation.withState("magical_brewery:crystal_type", p.params.crystal_type)); 
            block.setPermutation(block.permutation.withState("minecraft:block_face", face));
            block.setPermutation(block.permutation.withState("magical_brewery:crystal_rotation", rotation));
        }
    });
});


//Growing crystal growth mechanic.
system.beforeEvents.startup.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('magical_brewery:ort_crystal_growth', {
        onRandomTick(e) {
            const seedStage = e.block.permutation.getState('magical_brewery:crystal_stage');
            
            crystalGrowth(e.block, seedStage) 
        }
    });
});

export function crystalGrowth(block, seedStage){
    if(seedStage == 5){
        switch(block.permutation.getState("magical_brewery:crystal_type")){
            case "amethyst":
                block.setType("minecraft:budding_amethyst");
            break;
            case "glowstone":
                block.setType("magical_brewery:budding_glowstone");
            break;
            case "redstone":
                block.setType("magical_brewery:budding_redstone");
            break;
            case "echo":
                block.setType("magical_brewery:budding_echo");
            break;
            case "pure_quartz":
                block.setType("magical_brewery:budding_pure_quartz");
            break;
        }
        //Setting the block type triggers the budding crystal "onPlace" event. So creating a new BuddingCrystal is not only redundant but also
        //can create 2 objects in the same space. Not good
    }else{
        block.setPermutation(block.permutation.withState('magical_brewery:crystal_stage', seedStage+1)); 
    }
}