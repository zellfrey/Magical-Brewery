import {world, system, ItemStack, MolangVariableMap } from "@minecraft/server";
import {crystalGrowth} from "crystal/growingCrystal.js";
import {getSurroundingBlocks, growCrystalBud} from "crystal/buddingCrystal.js";
import {shouldCaskAge, setPotionEffectForCask} from "cask/cask.js";
import {findCask} from "cask/caskDB.js";

const buddingCrystals = ["ps:budding_glowstone", "ps:budding_redstone", "ps:budding_pure_quartz", "ps:budding_echo"];

system.beforeEvents.startup.subscribe(eventData => {
    eventData.itemComponentRegistry.registerCustomComponent('ps:on_use_on_ageless_pocket_watch', {
        onUseOn(e) {
            const {block, source} = e;

            if(source.playerPermissionLevel != 2) {
                source.sendMessage("You do not have the strength to use such an artifact!")
                return;
            }
                

            if(block.typeId === "ps:growing_crystal"){
                const seedStage = block.permutation.getState('ps:crystal_stage');
                const rotation = Math.floor(Math.random() * 4)
                block.setPermutation(block.permutation.withState("ps:crystal_rotation", rotation));
                crystalGrowth(block, seedStage)
                // source.sendMessage("The crystal creaks as it grows from the passage of time") 

            }else if(buddingCrystals.includes(block.typeId)){
                const buddingCrystal = buddingCrystals.find(bud => bud === block.typeId)

                switch(buddingCrystal){
                    case "ps:budding_glowstone":
                        if(block.dimension.id !== "minecraft:nether") return;
                        forceGrowCrystal(block, "glowstone_bud", "glowstone", -14)
                    break;
                    case "ps:budding_redstone":
                        forceGrowCrystal(block, "redstone_bud", "redstone", -13)
                    break;
                    case "ps:budding_pure_quartz":
                        forceGrowCrystal(block, "pure_quartz_bud", "pure_quartz", -16)
                    break;
                    case "ps:budding_echo":
                        forceGrowCrystal(block, "echo_bud", "echo", -9)
                    break;
                }
                // source.sendMessage("Sparks fly out of the budding crystal as its forced to grow shards.") 

            }else if(block.typeId.includes("ps:cask")){
                const {x,y,z} = block.location;
                let cask = findCask(block.dimension.id, {x, y, z})
                const fillLevel = block.permutation.getState("ps:fill_level");
                const caskEffect = block.getComponent("magical_brewery:pi_cask_fill").customComponentParameters.params.cask_effect
                const canAge = shouldCaskAge(caskEffect, cask.potion_effects)
                const aged = block.permutation.getState("ps:aged");
                

                if(!canAge || aged || fillLevel === 0){
                    source.sendMessage("Despite accelerating time, the cask cannot age.")
                    return;
                } 
                const particleLocation = block.center();
                particleLocation.y += 0.4
                block.dimension.spawnParticle("minecraft:crop_growth_emitter", particleLocation);
                block.setPermutation(block.permutation.withState("ps:aged", true));
                setPotionEffectForCask(caskEffect, cask, 100)
                source.sendMessage("The watch has sped up time, and has aged the cask.")
            }
            block.dimension.playSound("conduit.ambient", block.location, {volume: 0.8, pitch: 3});
        }
    });
});

function forceGrowCrystal(block, budBlock, type, CharNum){
    const validBlocks = getSurroundingBlocks(block, budBlock)

    if(validBlocks.length === 0) return;

    const budToGrow = validBlocks[Math.floor(Math.random() * validBlocks.length)]

    growCrystalBud(budToGrow, type, 3, CharNum)
}
