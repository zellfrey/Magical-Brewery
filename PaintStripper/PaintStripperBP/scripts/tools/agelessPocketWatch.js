import {world, system, ItemStack } from "@minecraft/server";
import {crystalGrowth} from "crystal/growingCrystal.js";
import {getSurroundingBlocks, growCrystalBud} from "crystal/buddingCrystal.js";
import {setPotionEffectForCask, shouldCaskAge} from "cask/cask.js";
import {findCask, updateCask} from "cask/caskDB.js";

const buddingCrystals = ["ps:budding_glowstone", "ps:budding_redstone", "ps:budding_pure_quartz", "ps:budding_echo"];

system.beforeEvents.startup.subscribe(eventData => {
    eventData.itemComponentRegistry.registerCustomComponent('ps:on_use_on_ageless_pocket_watch', {
        onUseOn(e) {
            const {block, source} = e;

            if(!source.isOp()) return;

            if(block.typeId === "ps:growing_crystal"){
                const seedStage = block.permutation.getState('ps:crystal_stage');
                const rotation = Math.floor(Math.random() * 4)
                block.setPermutation(block.permutation.withState("ps:crystal_rotation", rotation));
                crystalGrowth(block, seedStage) 

            }else if(buddingCrystals.includes(block.typeId)){
                const buddingCrystal = buddingCrystals.find(bud => bud === block.typeId)

                switch(buddingCrystal){
                    case "ps:budding_glowstone":
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

            }else if(block.typeId.includes("ps:cask")){
                const cask = findCask(block.dimension.id, block.location)
                const fillLevel = block.permutation.getState("ps:fill_level");
                const agePhase = block.permutation.getState("ps:aging_phase");
                const canAge = shouldCaskAge(block.getTags()[0], cask.potion_effects)
                            
                if(!canAge) return;
                console.log("you have sped up time, aging the cask")
                const newAge = agePhase !== 3 && fillLevel > 0 ? agePhase+1 : agePhase;
                block.setPermutation(block.permutation.withState("ps:aging_phase", newAge));

                if(agePhase === 3 && !cask.is_aged){
                    
                    setPotionEffectForCask(block.getTags()[0], cask)
                }
            }
        }
    });
});

function forceGrowCrystal(block, budBlock, type, CharNum){
    const validBlocks = getSurroundingBlocks(block, budBlock)

    if(validBlocks.length === 0) return;

    const budToGrow = validBlocks[Math.floor(Math.random() * validBlocks.length)]

    growCrystalBud(budToGrow, type, 3, CharNum)
}
