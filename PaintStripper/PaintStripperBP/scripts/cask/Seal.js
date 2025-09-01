import {world, system, Direction} from "@minecraft/server";
import {neighbouringCross, getBlockFromFace} from "../utils/blockPlacementUtils.js";
import {MathUtils} from "../utils/MathUtils.js";
import {Cask} from "cask/Cask.js";

export class Seal {

    static lifetimeSaveBoundary = 30;

    constructor(location = {}, sealType = "", sealStrength = 0, currentTick){

        this.location = location;
        this.type = sealType;
        this.strength = sealStrength;
        this.previousTick = currentTick;
        this.lifetime = 0;
    }
    

    addLifetime(timeToAge, cask){

        let lifeTimeUnloadTimeCompensation = 0;

        if(system.currentTick - this.previousTick === 60){
            this.lifetime++;
        }
        else{
            const tickTime = system.currentTick < timeToAge ? system.currentTick : timeToAge 
            lifeTimeUnloadTimeCompensation = (tickTime - this.previousTick) % 60 ;
            this.lifetime += lifeTimeUnloadTimeCompensation;
        }
        
        if(lifeTimeUnloadTimeCompensation > Seal.lifetimeSaveBoundary || this.lifetime % Seal.lifetimeSaveBoundary === 0){
            Cask.updateCask(cask)
        }
        
        this.previousTick = system.currentTick
    }

    spawnSealSingleFlameParticle(dimension, ageEndTick){
        if(this.location === undefined ||Object.keys(this.location).length === 0) return;

        const tickDelay = Math.floor(Math.random() * 30)
        
        system.runTimeout(() => {

            const seal = dimension.getBlock(this.location);

            if(!seal.hasTag("magical_brewery:seal") || system.currentTick > ageEndTick) return;

            const face = seal.permutation.getState("minecraft:block_face")
            const sealType = seal.getTags().find(el => el !== "magical_brewery:seal");
        
            let particleSpawnVector3 = MathUtils.addVectorFromBlockFace(face, seal.center());
            particleSpawnVector3.y += MathUtils.getRndFloat(-2.5, 3)

            particleSpawnVector3 = MathUtils.addRandomVectorBlockFace(face, particleSpawnVector3)

            dimension.spawnParticle(`magical_brewery:dust_${sealType.slice(16)}_flame`, particleSpawnVector3);
        }, tickDelay);
    }
    
    destroySealBlock(dimensionID){
        const dim = world.getDimension(dimensionID)

        const seal = dim.getBlock(this.location)
        const face = seal.permutation.getState("minecraft:block_face")
        const sealType = seal.getTags().find(el => el !== "magical_brewery:seal");
        
        let particleSpawnVector3 = MathUtils.addRandomVectorBlockFace(face, seal.center())
        particleSpawnVector3 = MathUtils.addVectorFromBlockFace(face, seal.center());

        dim.spawnParticle(`magical_brewery:seal_${sealType.slice(16)}_flame`, particleSpawnVector3);
    
        dim.setBlockType(this.location, "minecraft:air");
    }
    static setSeal(seal, cask){
        if(!seal){
            cask.seal = new Seal();
        }
        else{
            const sealStrength = seal.permutation.getState("magical_brewery:seal_level");
            const sealType = seal.getTags().find(el => el !== "magical_brewery:seal").slice(16);
            
            cask.seal = new Seal(seal.location, sealType, sealStrength, system.currentTick);
        }
    }

    static isSameType(seal, cask){
    if(!seal) return false;

    const sealType = seal.getTags().find(el => el !== "magical_brewery:seal").slice(16);
    const sealStrength = seal.permutation.getState("magical_brewery:seal_level");

    return cask.seal.strength === sealStrength && cask.seal.type  === sealType;

    }
    static findSeal(block){
        try{
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
        catch(e){
            console.warn("Magical brewery: Tried to find seal, but its unloaded. \n Now how do i check if a block is unloaded")
            return undefined;
        }
    }
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
