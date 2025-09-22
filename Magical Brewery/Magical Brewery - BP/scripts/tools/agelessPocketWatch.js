import {world, system, ItemStack, MolangVariableMap } from "@minecraft/server";
import {crystalGrowth} from "crystal/growingCrystal.js";
import {getSurroundingBlocks, growCrystalBud} from "crystal/BuddingCrystal.js";
import {Cask} from "cask/Cask.js";

const buddingCrystals = ["magical_brewery:budding_glowstone", "magical_brewery:budding_redstone", 
    "magical_brewery:budding_pure_quartz", "magical_brewery:budding_echo"];

system.beforeEvents.startup.subscribe(eventData => {
    eventData.itemComponentRegistry.registerCustomComponent('magical_brewery:on_use_on_ageless_pocket_watch', {
        onUseOn(e) {
            const {block, source} = e;

            if(source.playerPermissionLevel != 2) {
                source.sendMessage("You do not have the strength to use such an artifact!")
                return;
            }
                
            if(block.typeId === "magical_brewery:growing_crystal"){
                forceGrowGrowingCrystal(block)
                // source.sendMessage("The crystal creaks as it grows from the passage of time") 

            }else if(buddingCrystals.includes(block.typeId)){
                forceGrowBuddingCrystal(block)   
                // source.sendMessage("Sparks fly out of the budding crystal as its forced to grow shards.") 

            }else if(block.typeId.includes("magical_brewery:cask")){
                forceAgeCask(block, source)
            }
            block.dimension.playSound("conduit.ambient", block.location, {volume: 0.8, pitch: 3});
        }
    });
});

function forceGrowGrowingCrystal(block){
    const seedStage = block.permutation.getState('magical_brewery:crystal_stage');
    const rotation = Math.floor(Math.random() * 4)
    block.setPermutation(block.permutation.withState("magical_brewery:crystal_rotation", rotation));
    crystalGrowth(block, seedStage)
}

function forceGrowBuddingCrystal(block){
    const buddingCrystal = buddingCrystals.find(bud => bud === block.typeId)

    switch(buddingCrystal){
        case "magical_brewery:budding_glowstone":
            if(block.dimension.id !== "minecraft:nether") return;
            checkValidCrystalGrowth(block, "magical_brewery:glowstone_bud", "glowstone", -14)
        break;
        case "magical_brewery:budding_redstone":
            checkValidCrystalGrowth(block, "magical_brewery:redstone_bud", "redstone", -13)
        break;
        case "magical_brewery:budding_pure_quartz":
            checkValidCrystalGrowth(block, "magical_brewery:pure_quartz_bud", "pure_quartz", -16)
        break;
        case "magical_brewery:budding_echo":
            checkValidCrystalGrowth(block, "magical_brewery:echo_bud", "echo", -9)
        break;
    }
}
function checkValidCrystalGrowth(block, budTag, type, CharNum){
    const validBlocks = getSurroundingBlocks(block, budTag)

    if(validBlocks.length === 0) return;

    const budToGrow = validBlocks[Math.floor(Math.random() * validBlocks.length)]

    growCrystalBud(budToGrow, type, CharNum)
}

function forceAgeCask(block, source){

    let cask = Cask.casks[Cask.findIndexCask(block.dimension.id, block.location)]

    const fillLevel = block.permutation.getState("magical_brewery:fill_level");
    const caskPotionType = block.getComponent("magical_brewery:pi_cask_fill").customComponentParameters.params.cask_effect
    const canAge = cask.canCaskAge(caskPotionType)
    const aged = block.permutation.getState("magical_brewery:aged");
    

    if(!canAge || aged || fillLevel === 0){
        source.sendMessage("Despite accelerating time, the cask cannot age.")
        return;
    } 
    const particleLocation = block.center();
    particleLocation.y += 0.4
    block.dimension.spawnParticle("minecraft:crop_growth_emitter", particleLocation);
    block.setPermutation(block.permutation.withState("magical_brewery:aged", true));
    cask.addAgedPotionEffect(caskPotionType, 100)
    Cask.updateCask(cask)
    source.sendMessage("The watch has sped up time, and has aged the cask.")
}