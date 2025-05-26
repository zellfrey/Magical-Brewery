import {world, system, Direction} from "@minecraft/server";
import {neighbouringCross, getBlockFromFace} from "../utils/blockPlacementUtils.js";
import {updateCaskSeal} from "cask/caskDB.js";

system.beforeEvents.startup.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('ps:bop_seal', {
        beforeOnPlayerPlace(e) {
            const {player, permutationToPlace } = e;
            const equipment = player.getComponent('equippable');
            const selectedItem = equipment.getEquipment('Mainhand');
            
            const sealStrength = Number(selectedItem.typeId.slice(selectedItem.typeId.length-1))

            e.permutationToPlace = permutationToPlace.withState('ps:seal_level', sealStrength);
        },
    });
});

export function destroyCaskSeal(cask){
    const dim = world.getDimension(cask.dimensionId)
    dim.setBlockType(cask.seal_location, "minecraft:air");
    dim.spawnParticle("minecraft:basic_flame_particle", cask.seal_location);

    cask.seal_location = {};
    cask.is_potency_seal = false;
    cask.seal_strength = 0;
    cask.seal_lifetime = 0;

    updateCaskSeal(cask)
    console.log("destroying seal")
}
    
export function findCaskSeal(block){
    const crossBlocks = [];
    neighbouringCross.forEach((el) => { crossBlocks.push(block.offset({x:el.x, y: 0, z: el.z}))})

    const seals = crossBlocks.filter(el => el.hasTag("seal"))

    if(seals.length === 0) return undefined;

    const seal = seals.find(el =>{
        const face = el.permutation.getState("minecraft:block_face");
        const potentialCask = getBlockFromFace(el, face)
        if(JSON.stringify(potentialCask.location) === (JSON.stringify(block.location))) return el;
    })

    return seal ? seal : undefined
}

export function setCaskSeal(seal, cask){

    if(!seal){
        cask.seal_location = {};
        cask.is_potency_seal = false;
        cask.seal_strength = 0;
    }
    else{
        cask.seal_location = seal.location
        cask.seal_strength = seal.permutation.getState("ps:seal_level");
        const sealType = seal.getTags().find(el => el !== "seal");
        cask.is_potency_seal = sealType === "potency" ? true : false;
    }

    cask.seal_lifetime = 0;
    updateCaskSeal(cask)
}
export function isSameSealType(caskSeal, cask){
    if(!caskSeal) return false;

    const sealType = caskSeal.getTags().find(el => el !== "seal");
    const sealStrength = caskSeal.permutation.getState("ps:seal_level");
    const isPotency = sealType === "potency" ? true : false;

    return cask.seal_strength === sealStrength && cask.is_potency_seal === isPotency;
}