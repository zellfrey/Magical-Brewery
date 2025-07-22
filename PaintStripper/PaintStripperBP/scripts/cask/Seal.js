import {world, system, Direction} from "@minecraft/server";
import {neighbouringCross, getBlockFromFace} from "../utils/blockPlacementUtils.js";

export class Seal {

    constructor(location = {}, isPotencySeal = false, sealStrength = 0){

        this.location = location;
        this.is_potency = isPotencySeal;
        this.strength = sealStrength;
        this.lifetime = 0;
    }
    
    static setSeal(seal, cask){
        if(!seal){
            cask.seal = new Seal();
        }
        else{
            const sealStrength = seal.permutation.getState("magical_brewery:seal_level");
            const sealType = seal.getTags().find(el => el !== "magical_brewery:seal");
            const isPotencySeal = sealType.slice(16) === "potency" ? true : false;
            
            cask.seal = new Seal(seal.location, isPotencySeal, sealStrength);
        }
        cask.seal.lifetime = 0;
    }

    static isSameType(seal, cask){
    if(!seal) return false;

    const sealType = seal.getTags().find(el => el !== "magical_brewery:seal");
    const sealStrength = seal.permutation.getState("magical_brewery:seal_level");
    const isPotency = sealType.slice(16) === "potency" ? true : false;

    return cask.seal.strength === sealStrength && cask.seal.is_potency  === isPotency;

    }
    static findSeal(block){
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
}

export function spawnSealSmokeParticle(dimension, particleSpawnVector3, blockFace, sealType){
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

