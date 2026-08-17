import {world, system, Direction, Dimension} from "@minecraft/server";
import {neighbouringCross, getBlockFromFace} from "../utils/blockPlacementUtils.js";
import {POTION_POTENCY_LEVELS, POTION_EFFECTS, getPotencyLevel} from "../potion/potionEffects.js";
import {MathUtils} from "../utils/MathUtils.js";
import {Cask} from "../cask/Cask.js";

export class Seal {

    static lifetimeSaveBoundary = 30;

    constructor(location = {}, sealType = "", sealStrength = 0, currentTick){

        this.location = location;
        this.type = sealType;
        this.strength = sealStrength;
        this.previousTick = currentTick;
        this.affectCaskAgeing = true;
        this.lifetime = 0;
    }
    
    canSealEffectLiquid(caskPotionLiquid){
        switch(this.type){
            case "memories":
                return caskPotionLiquid === "Consume" || caskPotionLiquid === "ConsumeEcho";;
            break;
            case "expansion":
                return caskPotionLiquid === "ThrownSplash" || caskPotionLiquid === "ThrownLingering";
            break;
            default:
                return true;
            break;
        }
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

    spawnSealSingleParticle(caskCenterLocation, dimension, ageEndTick, caskNoEffectSeals){
        if(this.location === undefined ||Object.keys(this.location).length === 0) return;

        const tickDelay = Math.floor(Math.random() * 30)
        
        system.runTimeout(() => {

            const seal = dimension.getBlock(this.location);

            if(!seal.hasTag("magical_brewery:seal") || caskNoEffectSeals.includes(this.type) || system.currentTick > ageEndTick) return;

            const face = seal.permutation.getState("minecraft:block_face")
            let sealType = seal.getTags().find(el => el !== "magical_brewery:seal");

            let particleSpawnVector3;
            let particleId;
            //TODO Make seal of retainment particles
            //TODO Make seal single particle have random coords in particle json file
            if(sealType === "magical_brewery:retainment"){
                sealType = "magical_brewery:potency";
                particleId = "magical_brewery:seal_retainment_shield";
                particleSpawnVector3 = caskCenterLocation;
				particleSpawnVector3.y += MathUtils.getRndFloat(-4, 5);
            }
            else{
                particleSpawnVector3 = MathUtils.addVectorFromBlockFace(face, seal.center());
                particleSpawnVector3.y += MathUtils.getRndFloat(-2.5, 3);
                particleSpawnVector3 = MathUtils.addRandomVectorBlockFace(face, particleSpawnVector3)

                particleId = `magical_brewery:dust_${sealType.slice(16)}_flame`
            }
            
            dimension.spawnParticle(particleId, particleSpawnVector3);
        }, tickDelay);
    }

    checkAgedLifetime(potionEffectsLength, fillLevel, agelessPocketWatchAddition = 0){

        const caskAgeTime = (12000 * potionEffectsLength + fillLevel*10)/3;
        let caskSealAgeTime = Math.ceil(this.lifetime*20 / caskAgeTime *100);
		
		caskSealAgeTime += agelessPocketWatchAddition;

		if(caskSealAgeTime < 75){
			this.type = "";
			this.strength = 0;
            this.affectCaskAgeing  = false;
		}
    }
    
    destroySealBlock(dimensionID){
        const dim = world.getDimension(dimensionID)

        const seal = dim.getBlock(this.location)
        const face = seal.permutation.getState("minecraft:block_face")
        const sealType = seal.getTags().find(el => el !== "magical_brewery:seal");
        
        let particleSpawnVector3 = MathUtils.addRandomVectorBlockFace(face, seal.center())
        particleSpawnVector3 = MathUtils.addVectorFromBlockFace(face, seal.center());

        dim.spawnParticle(`magical_brewery:seal_${sealType.slice(16)}_flame`, particleSpawnVector3);

        dim.playSound("mob.ghast.fireball", this.location, {volume: 0.5, pitch: 0.3});
        dim.playSound("beacon.power", this.location, {volume: 0.2, pitch: 1});
        
        dim.setBlockType(this.location, "minecraft:air");
    }
	
    addEffect(potionEffect, effectName){
        
        let effectString = effectName;

        if(potionEffect.duration_long.length !== 0){
            const effectTime =" (" + potionEffect.duration_long[this.strength] +  ")";
            effectString += effectTime;
        }

        switch(this.type){
            case "potency":
                effectString = this.addPotencyEffect(potionEffect, effectName, this.strength);
            break;
            case "memories":
                effectString += " [Echoing]";
            break;
            case "expansion":
                effectString += this.addExpansionEffect(this.strength);
            break;
        }     

        return effectString;
    }
    
    addPotencyEffect(potionEffect, effectName, sealStrength){
        let potionPotency;

        if(effectName.includes("Instant")){
            potionPotency = " " + POTION_POTENCY_LEVELS[sealStrength];

        }
        else if(effectName === "Slowness"){
            potionPotency = " " + POTION_POTENCY_LEVELS[sealStrength+1] + 
            " (" + potionEffect.duration_potency[sealStrength-1] +  ")";

        }else{
            potionPotency = " " + POTION_POTENCY_LEVELS[sealStrength] + 
            " (" + potionEffect.duration_potency[sealStrength-1] +  ")";
        }
        effectName += potionPotency;

        return effectName;
    }

    addExpansionEffect(sealStrength){
        switch(sealStrength){
            case 1:
                return " [Splash]";
            break;
            case 2:
                return " [Splash II]";
            break;
        }
    }

    addInspirationEffect(uniqueEffect, caskPotionLiquid){

        const inspirationStrength = MathUtils.getRandomInt(3);
        let effectString = uniqueEffect.effects;
        
        if(uniqueEffect.duration_potency.length === 0 && uniqueEffect.duration_long.length !== 0 ){

            const effectTime =" (" + uniqueEffect.duration_long[inspirationStrength] +  ")";
            effectString += effectTime;
        }
        else{
            const isLongevity = !Math.round(Math.random());

            if(!isLongevity && inspirationStrength !== 0){
                effectString = this.addPotencyEffect(uniqueEffect, effectString, inspirationStrength);
            }
            else{
                
				if(!effectString.includes("Instant")){
                    const effectTime =" (" + uniqueEffect.duration_long[inspirationStrength] +  ")";
                    effectString += effectTime;
                }
            }
        }
        if(Math.floor(Math.random() * 100) > 15) effectString += this.getInspirationTertiaryEffect(caskPotionLiquid);
		
        return effectString;
    }
    
    getInspirationTertiaryEffect(caskPotionLiquid){
        if(caskPotionLiquid === "Consume" || caskPotionLiquid === "ConsumeEcho"){
            return " [Echoing]";
        }
        else if(caskPotionLiquid === "ThrownSplash" || caskPotionLiquid === "ThrownLingering"){
			return this.addExpansionEffect(1);
        }else{
            return "";
        }
    }

    static setSeal(seal, cask){
        if(!seal){
            cask.seal = new Seal();
        }
        else{
            const sealType = seal.getTags().find(el => el !== "magical_brewery:seal").slice(16);
			let sealStrength = seal.permutation.getState("magical_brewery:seal_level");
			
            sealStrength = sealStrength !== undefined ? sealStrength : 0;
			
            cask.seal = new Seal(seal.location, sealType, sealStrength, system.currentTick);
        }
    }

    static isSameType(seal, cask){
		if(!seal) return false;

		const sealType = seal.getTags().find(el => el !== "magical_brewery:seal").slice(16);
		let sealStrength = seal.permutation.getState("magical_brewery:seal_level");
		
		sealStrength = sealStrength !== undefined ? sealStrength : 0;

		return cask.seal.strength === sealStrength && cask.seal.type  === sealType;

    }
	
    static findSeal(block){
        try{
            const crossBlocks = [];
            neighbouringCross.forEach((el) => { crossBlocks.push(block.offset({x:el.x, y: 0, z: el.z}))})
			
            const seals = crossBlocks.filter(el => el.dimension.isChunkLoaded(el.location) && el.hasTag("magical_brewery:seal"))

            if(seals.length === 0) return undefined;

            const seal = seals.find(el =>{
                const face = el.permutation.getState("minecraft:block_face");
                const potentialCask = getBlockFromFace(el, face)
                if(MathUtils.equalsVector3(potentialCask.location, block.location)) return el;
            })

            return seal ? seal : undefined
        }
        catch(e){
            console.error("Despite the block occupying a loaded chunk. It can't find the seal tag ¯\\_(ツ)_/¯")
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