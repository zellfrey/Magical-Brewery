import {world, system, Direction} from "@minecraft/server";
import {neighbouringCross, getBlockFromFace} from "../utils/blockPlacementUtils.js";
import {updateCaskSeal} from "cask/caskDB.js";

system.beforeEvents.startup.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('magical_brewery:bop_seal', {
        beforeOnPlayerPlace(e) {
            const {player, permutationToPlace } = e;
            const equipment = player.getComponent('equippable');
            const selectedItem = equipment.getEquipment('Mainhand');
            
            const sealStrength = Number(selectedItem.typeId.slice(selectedItem.typeId.length-1))

            e.permutationToPlace = permutationToPlace.withState('magical_brewery:seal_level', sealStrength);
        },
    });
});

export function destroyCaskSeal(cask){
    const dim = world.getDimension(cask.dimensionId)
    const seal = dim.getBlock(cask.seal_location)
    const sealType = seal.getTags().find(el => el !== "magical_brewery:seal");
    spawnSealSmokeParticle(dim, seal.center(), seal.permutation.getState("minecraft:block_face"),sealType)
    
    dim.setBlockType(cask.seal_location, "minecraft:air");
    
    cask.seal_location = {};
    cask.is_potency_seal = false;
    cask.seal_strength = 0;
    cask.seal_lifetime = 0;

    updateCaskSeal(cask)
}
    
export function findCaskSeal(block){
    const crossBlocks = [];
    neighbouringCross.forEach((el) => { crossBlocks.push(block.offset({x:el.x, y: 0, z: el.z}))})

    const seals = crossBlocks.filter(el => el.hasTag("magical_brewery:seal"))

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
        cask.seal_strength = seal.permutation.getState("magical_brewery:seal_level");
        const sealType = seal.getTags().find(el => el !== "magical_brewery:seal");
        cask.is_potency_seal = sealType.slice(16) === "potency" ? true : false;
    }

    cask.seal_lifetime = 0;
    updateCaskSeal(cask)
}
export function isSameSealType(caskSeal, cask){
    if(!caskSeal) return false;

    const sealType = caskSeal.getTags().find(el => el !== "magical_brewery:seal");
    const sealStrength = caskSeal.permutation.getState("magical_brewery:seal_level");
    const isPotency = sealType.slice(16) === "potency" ? true : false;

    return cask.seal_strength === sealStrength && cask.is_potency_seal === isPotency;
}

function spawnSealSmokeParticle(dimension, particleSpawnVector3, blockFace, sealType){
    switch(blockFace){
        case "north":
            particleSpawnVector3.z += 0.4;
        break;
        case "south":
            particleSpawnVector3.z -= 0.4;
        break;
        case "west":
            particleSpawnVector3.x += 0.4;
        break;
        case "east":
            particleSpawnVector3.x -= 0.4;
        break;
    }
    dimension.spawnParticle(`magical_brewery:seal_${sealType.slice(16)}_flame`, particleSpawnVector3);
}