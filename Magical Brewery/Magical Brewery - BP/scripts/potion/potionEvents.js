import {world, system} from '@minecraft/server';
import {MagicalBreweryPotion} from "./MagicalBreweryPotion.js";
import {PotionManager} from "../potion/PotionManager.js";
import {ON_DEATH_EFFECTS, ON_HIT_EFFECTS, SPLASH_POTION_EFFECTS, getPotencyLevel} from "../potion/potionEffects.js";
import {MathUtils} from "../utils/MathUtils.js";
import {getAirBlockBox} from "../utils/blockPlacementUtils.js";

//Potion consume events
system.beforeEvents.startup.subscribe(eventData => {
    eventData.itemComponentRegistry.registerCustomComponent('magical_brewery:oc_potion', {
        onConsume(e,p) {
            MagicalBreweryPotion.onConsume(e.source, e.itemStack, p.params)
        }
    });
});

system.beforeEvents.startup.subscribe(eventData => {
    eventData.itemComponentRegistry.registerCustomComponent('magical_brewery:oc_potion_multiple', {
        onConsume(e,p) {
            MagicalBreweryPotion.onConsumeMultipleEffects(e.source, e.itemStack, p.params)
        }
    });
});

world.afterEvents.itemCompleteUse.subscribe((e) => {
    if(e.itemStack.typeId !== "minecraft:potion") return; 

    PotionManager.giveExtraEffectsToEntity(e.source, e.itemStack)
});

//Check illegal potion items events
world.afterEvents.itemStartUse.subscribe((e) => {

    if(e.itemStack.typeId === "minecraft:potion" || e.itemStack.hasTag("magical_brewery:potion")){
        PotionManager.legalPotionCheck(e.source, e.itemStack);
	}
});

world.afterEvents.entitySpawn.subscribe((e) => {
    const {entity} = e;
    try{
        if(entity.typeId !== "minecraft:item") return;

        const item = entity.getComponent("item").itemStack;

        if(item.typeId === "minecraft:potion" || item.hasTag("magical_brewery:potion")){


			const potionValidEffects = PotionManager.getValidEffects(item.getLore());

	        if(!PotionManager.shouldPotionBreak(PotionManager.getPotionVesselType(item), potionValidEffects.length + 1)) return;

            system.runTimeout(() => 
                {	
                    if(!entity.isValid) return;
                    
                    entity.dimension.playSound("random.glass", entity.location, {volume: 0.8, pitch: 1.2})
                    entity.remove();
                },
            20);
		}
	
    }catch(error){
        console.warn(error)
    }
});


world.afterEvents.entityHurt.subscribe((e) => {

    if(!e.hurtEntity.isValid || !e.hurtEntity.dimension.isChunkLoaded(e.hurtEntity.location) || 
        e.hurtEntity.getEffects().length === 0) return;

    applyOnHitEffects(e.hurtEntity)
});


function applyOnHitEffects(hurtEntity){

    const onHitEffects = hurtEntity.getEffects().filter((effect) => ON_HIT_EFFECTS.includes(effect.typeId));

    if(onHitEffects.length === 0) return;

    onHitEffects.forEach(effect => {

        if(effect.amplifier ===0) return;

        let potency = effect.amplifier > 5 ? 5 : effect.amplifier;

        switch(effect.typeId){
            case "minecraft:infested":
                applyInfestedEffect(hurtEntity, hurtEntity.dimension, potency)
            break;
        }
    });
    
	
	   
}

function applyInfestedEffect(entity, dimension, potency){
	
	if(Math.floor(Math.random() * 100) > (10 + (potency * 2.5))) return;
	
    let amountToSpawn = potency + MathUtils.getRandomInt(2)
	
    system.runJob(spawnInfestedSilverFish(entity, dimension, amountToSpawn, entity.getViewDirection()))
    
}

function* spawnInfestedSilverFish(entity, dimension, amountToSpawn, appliedVelocity){

    for(let i = 0; i < amountToSpawn; i++){

        let silverfishEntity  = dimension.spawnEntity("minecraft:silverfish", entity.location)

		appliedVelocity.x = appliedVelocity.x/10 + MathUtils.getRndFloat(-5, 5)/10
		appliedVelocity.z = appliedVelocity.z/10 + MathUtils.getRndFloat(-5, 5)/10

	    silverfishEntity.applyImpulse(appliedVelocity)
        yield;
    } 

}



world.afterEvents.entityHealthChanged.subscribe((e) => {

    if(!e.entity.isValid || !e.entity.dimension.isChunkLoaded(e.entity.location) 
        || e.newValue > 0 || e.entity.getEffects().length === 0) return;
    
    applyOnDeathEffects(e.entity)
});


function applyOnDeathEffects(entity){

    const onDeathEffects = entity.getEffects().filter((effect) => ON_DEATH_EFFECTS.includes(effect.typeId));
    const dimension = entity.dimension;

    if(onDeathEffects.length === 0) return;

    onDeathEffects.forEach(effect => {

        if(effect.amplifier ===0) return;

        let potency = effect.amplifier > 5 ? 5 : effect.amplifier;

        switch(effect.typeId){
            case "minecraft:oozing":
                system.runJob(applyOozingEffect(entity, dimension, potency));
            break;
            case "minecraft:weaving":
                applyWeavingEffect(entity, dimension, potency);
                
            break;
            case "minecraft:wind_charged":
                applyWindChargedEffect(entity, dimension, potency);
                
            break;
        }
    });
    
}

function* applyOozingEffect(entity, dimension, noSlimesToSpawn){
    for(let i = 0; i < noSlimesToSpawn; i++){
        dimension.spawnEntity("minecraft:slime", entity.location,{spawnEvent: "spawn_medium"})
        yield;
    }    
}

function applyWeavingEffect(entity, dimension, potencyLevel){

    if(!world.gameRules.mobGriefing) return;

    let webSpawnArea = getAirBlockBox(entity.location, entity.dimension, potencyLevel);

    if(webSpawnArea.length === 0) return;

    let validWebSpawnLocations = webSpawnArea.filter(location =>{

        const block = dimension.getBlock({ x: location.x, y: location.y, z: location.z });

        if(!block.below().isAir && block.below().typeId !== "minecraft:web") return true;
    })

    if(validWebSpawnLocations.length === 0) return;

    let noOfCobWebs = potencyLevel *3
    system.runJob(placeWeavingWebs(noOfCobWebs, dimension, validWebSpawnLocations))
}

function* placeWeavingWebs(noOfWebsToSpawn, dimension, validWebSpawnLocations){
   for(let i = 0; i <= noOfWebsToSpawn; i++){
    
        const location = validWebSpawnLocations[MathUtils.getRandomInt(validWebSpawnLocations.length)];

        if(!dimension.isChunkLoaded(location)) return;

        const block = dimension.getBlock({ x: location.x, y: location.y, z: location.z });
        block.setType("minecraft:web")
        yield;
    }
}

function applyWindChargedEffect(entity, dimension, potency){

    const deadEntityLocation = entity.location;
    const deadEntityID = entity.id;

    const degreeInterval  = 10;
    const vector3Directions = MathUtils.getVector3Sphere(MathUtils.getHorizontalDirectionalVectors(degreeInterval), degreeInterval)
    
    const totalEntities = [];
    const uniqueEntityIDs = []
    const maxDistance = 6;
	const entityRaycastOptions = {includePassableBlocks: true, includeLiquidBlocks: true, maxDistance: maxDistance};

    vector3Directions.forEach(vector3Direction => {
        const entities =  dimension.getEntitiesFromRay(deadEntityLocation, vector3Direction, entityRaycastOptions)
			
		if(entities.length > 0){
		    entities.forEach(entityRayCastHit => {
                if(entityRayCastHit.entity.id == deadEntityID || uniqueEntityIDs.includes(entityRayCastHit.entity.id) ) return;
                    totalEntities.push(entityRayCastHit)
                    uniqueEntityIDs.push(entityRayCastHit.entity.id)
                })
		}
    })

	system.runJob(launchEntity(deadEntityLocation, totalEntities, maxDistance, potency))
}

function* launchEntity(deadEntityLocation, totalEntities, maxDistance, potency){
    
	const impulseStrength = potency /2.25

    for(let i = 0; i <= totalEntities.length; i++){

        if(totalEntities[i] === undefined) continue;

        const location  = totalEntities[i].entity.location;
        
        const distance = Math.abs(MathUtils.euclideanVector3Distance(deadEntityLocation.x, deadEntityLocation.y, deadEntityLocation.z,
                                                             location.x, location.y, location.z))
  
		if(distance > maxDistance) continue;
		
        const fallOffDistancePercentage =  100 - Math.round(distance / maxDistance * 100);
        const slopeDirection = {x:location.x - deadEntityLocation.x, y:location.y - deadEntityLocation.y, z:location.z - deadEntityLocation.z}
        
		slopeDirection.x *= fallOffDistancePercentage/100 * impulseStrength;
		slopeDirection.y*= fallOffDistancePercentage/100 * impulseStrength;
		slopeDirection.z *= fallOffDistancePercentage/100 * impulseStrength;
		
		totalEntities[i].entity.applyImpulse(slopeDirection)

        yield;
    }
}


world.beforeEvents.itemUse.subscribe((e) => {
	
	//if(e.swingSource !== "ThrowItem" && e.heldItemStack === undefined) return;
	
	setThrownPotionData(e.source, e.itemStack, system.currentTick)

});

function setThrownPotionData(player, heldItemStack, currentTick){
	

	if(heldItemStack.hasTag("magical_brewery:splash_potion") || heldItemStack.typeId === "minecraft:splash_potion"){
		
		const potionExtraEffects = heldItemStack.getLore();
		
		if(potionExtraEffects.length === 0) return;
		
		const thrownPotionData = {
									tickThrown: currentTick, 
									potionID: heldItemStack.typeId, 
									playerId: player.id, 
									extraEffects: potionExtraEffects
								};
								
		PotionManager.thrownPotionItems.push(thrownPotionData)
		//PotionManager.thrownPotionItems.length = 0;
		
	}
}

world.afterEvents.entitySpawn.subscribe((e) => {
	const addonID = e.entity.typeId.split(":")[0];
	
	if(addonID === "magical_brewery" || e.entity.typeId === "minecraft:splash_potion"){
		//console.log(PotionManager.thrownPotionItems.length)
		const thrownPotionData = getThrownPotionData(e.entity.typeId, system.currentTick);
		
		if(!thrownPotionData) return;
		
		destroyThrownPotionData(e.entity.typeId, system.currentTick);
		
		const potionEntityExtraEffects = {entityUUID: e.entity.id, playerId: thrownPotionData.playerId, extraEffects: thrownPotionData.extraEffects};
		PotionManager.PotionEntitiesExtraEffects.push(potionEntityExtraEffects)
	}
	
});

function getThrownPotionData(entityTypeId, currentTick){
	
	return PotionManager.thrownPotionItems.find(thrownPotion => thrownPotion.potionID === entityTypeId && thrownPotion.tickThrown === currentTick);
}

function destroyThrownPotionData(entityTypeId, currentTick){

    const thrownPotionIndex = PotionManager.thrownPotionItems.findIndex(thrownPotion => thrownPotion.potionID === entityTypeId && thrownPotion.tickThrown === currentTick);
	
	if(thrownPotionIndex === -1) return;
        
    PotionManager.thrownPotionItems.splice(thrownPotionIndex, 1)
}
	
world.afterEvents.projectileHitBlock.subscribe((e) => {
    const mbSplashPotionId = e.projectile.typeId.split(":")[1];
    const splashPotionTraits = SPLASH_POTION_EFFECTS[mbSplashPotionId];
    
    if(!splashPotionTraits) return;
	
    try {
    e.dimension.getEntities({ location: e.location, maxDistance: 4 }).forEach((entity) => {
        try {
            entity.addEffect(splashPotionTraits.effect, splashPotionTraits.duration, { amplifier: splashPotionTraits.amplifier })
        } catch (e) {}
    });
    } catch (e) {}
	
	const potionEntityData = getPotionEntityExtraEffects(e.projectile.id, e.source?.id);
	
	if(!potionEntityData) return;
	
	console.log(potionEntityData);
	destroyPotionEntityExtraEffectsData(e.projectile.id, e.source?.id);
	console.log(PotionManager.PotionEntitiesExtraEffects.length)
	
	const splashPotionExtraEffects = potionEntityData.extraEffects;
	
	if(!splashPotionExtraEffects) return;

    for(let i = 0; i < splashPotionExtraEffects.length; i++){
                
        const words = splashPotionExtraEffects[i].split(' ');

        //As to why extraEffects === "Mundane (no effect)" doesnt work, idk so its this for now
        if(words[0] === "Mundane") continue;
        
        // if(words[words.length-1] === "[Echoing]"){
        //     isEchoEffect = true;
        //     words.pop();
        // }

        let effect, potency;
        let totalTicks = 1;
        if(words[0] === "Instant"){
            potency = getPotencyLevel(words)
            if(potency !== 0) words.pop();
            effect = words.join("_").toLowerCase()
        }
        else{
            
            const effectTime = words[words.length-1].substring(1, 5)
            const [minutes, seconds] = effectTime.split(':');
            totalTicks = ((+minutes) * 60 + (+seconds)) * 20;
            words.pop();

            potency = getPotencyLevel(words)
            
            if(potency !== 0) words.pop();

            effect = words.join("_").toLowerCase()
            // if(Potions.getPotionEffectType(effect) ! == undefined){
            // }
            
        }
		//console.log(e.location.x)
        //entity.addEffect(effect, totalTicks, { amplifier: potency })

        try {
            e.dimension.getEntities({ location: e.location, maxDistance: 4 }).forEach((entity) => {
                try {
                    entity.addEffect(effect, totalTicks, { amplifier: potency })
                } catch (e) {}
            });
        } catch (e) {}
    }
});

function getPotionEntityExtraEffects(projectileID, sourceID){
	
	return PotionManager.PotionEntitiesExtraEffects.find(potionEntity => potionEntity.entityUUID === projectileID && potionEntity.playerId === sourceID);
}

function destroyPotionEntityExtraEffectsData(projectileID, sourceID){

    const potionEntityDataIndex = PotionManager.PotionEntitiesExtraEffects.findIndex(potionEntity => potionEntity.entityUUID === projectileID && potionEntity.playerId === sourceID);
	
	if(potionEntityDataIndex === -1) return;
        
    PotionManager.PotionEntitiesExtraEffects.splice(potionEntityDataIndex, 1)
}

world.afterEvents.projectileHitEntity.subscribe((e) => {
	console.log("projectileHitBlock")
    console.log(e.projectile.typeId);
    const addonID = e.projectile.typeId.split(":")[0]
    const mbSplashPotionId = e.projectile.typeId.split(":")[1].split("_");
    mbSplashPotionId.pop();
	const mbSplashPotionString = mbSplashPotionId.join("_");
	console.log(mbSplashPotionString)
    const splashPotionTraits = SPLASH_POTION_EFFECTS[mbSplashPotionString];
    
    if(!splashPotionTraits) return;
    try {
    e.dimension.getEntities({ location: e.location, maxDistance: 4 }).forEach((entity) => {
        try {
            entity.addEffect(splashPotionTraits.effect, splashPotionTraits.duration, { amplifier: splashPotionTraits.amplifier })
        } catch (e) {}
    });
    } catch (e) {}
});