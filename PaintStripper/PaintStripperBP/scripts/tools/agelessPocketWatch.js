import {world, system, ItemStack } from "@minecraft/server";
import {crystalGrowth} from "crystal/growingCrystal.js";
import {getSurroundingBlocks, growCrystalBud} from "crystal/buddingCrystal.js";

const buddingCrystals = ["ps:budding_glowstone", "ps:budding_redstone"];

world.beforeEvents.worldInitialize.subscribe(eventData => {
    eventData.itemComponentRegistry.registerCustomComponent('ps:on_use_on_ageless_pocket_watch', {
        onUseOn(e) {
            const {block, source} = e;
            
            //if(!isOpped) return;
            //Cant find method, but if it exists please let this be a thing
            if(block.typeId === "ps:growing_crystal"){
                const seedStage = block.permutation.getState('ps:crystal_stage');
                
                crystalGrowth(block, seedStage) 

            }else if(buddingCrystals.includes(block.typeId)){
                const buddingCrystal = buddingCrystals.find(bud => bud === block.typeId)

                let validBlocks;

                switch(buddingCrystal){
                    case "ps:budding_glowstone":
                        forceGrowCrystal(block, "glowstone_bud", "glowstone", 3, -14)
                    break;
                    case "ps:budding_redstone":
                        forceGrowCrystal(block, "redstone_bud", "redstone", 3, -13)
                    break;
                }
            }
        }
    });
});

function forceGrowCrystal(block, budBlock, type, firstCharNum, secondCharNum){
    const validBlocks = getSurroundingBlocks(block, budBlock)

    if(validBlocks.length === 0) return;

    const budToGrow = validBlocks[Math.floor(Math.random() * validBlocks.length)]

    growCrystalBud(budToGrow, type, firstCharNum, secondCharNum)
}
