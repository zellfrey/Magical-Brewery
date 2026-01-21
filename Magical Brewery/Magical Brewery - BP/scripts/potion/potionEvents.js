import {world, system} from '@minecraft/server';
import {MagicalBreweryPotion} from "./MagicalBreweryPotion.js";
import {MinecraftPotion} from "../potion/MinecraftPotion.js";
import {ON_DEATH_EFFECTS, ON_HIT_EFFECTS} from "../potion/potionEffects.js";
import {MathUtils} from "../utils/MathUtils.js";
import {getAirBlockBox} from "../utils/blockPlacementUtils.js";

//12 mins duration in ticks i.e 12*60 *20
//const xLongDuration = 14400;
system.beforeEvents.startup.subscribe(eventData => {
    eventData.itemComponentRegistry.registerCustomComponent('magical_brewery:oc_potion', {
        onConsume(e,p) {
            MagicalBreweryPotion.onConsume(e.source, e.itemStack, p.params)
        }
    });
});


world.afterEvents.itemCompleteUse.subscribe((e) => {

    if(e.itemStack.typeId !== "minecraft:potion") return; 

    MinecraftPotion.giveExtraEffectsToEntity(e.source, e.itemStack)
});



// system.beforeEvents.startup.subscribe(eventData => {
//     eventData.itemComponentRegistry.registerCustomComponent('magical_brewery:on_use_amethyst_bottle', {
//         onUseOn(e) {
//             const {source, itemStack, block} = e
//             console.log(block.typeId)
//             if(block.typeId !== "minecraft:water") return;
            
//             const equipment = source.getComponent('equippable');
//             const selectedItem = equipment.getEquipment('Mainhand');
//             const amethystWaterBottle = new ItemStack("magical_brewery:amethyst_water_bottle", 1)
            

//             // if (block.typeId === "minecraft:cauldron"){

//             //     const fillLevel =  block.getComponent("minecraft:fluid_container").fillLevel;
//             //     const fluid = block.getComponent("minecraft:fluid_container").getFluidType();

//             //     if(fillLevel < 1 || fluid !== "Water") return;

//             //     block.setPermutation(block.permutation.withState("fill_level", fillLevel-2));
//             // }

//             block.dimension.playSound("bottle.fill", block.location, {volume: 0.8, pitch: 1.0});

//             setMainHand(source, equipment, selectedItem, undefined);
//             source.getComponent("inventory").container.addItem(amethystWaterBottle)
//         }
//     });
// });

system.beforeEvents.startup.subscribe(eventData => {
    eventData.itemComponentRegistry.registerCustomComponent('magical_brewery:on_use_amethyst_bottle', {
        onUse(e) {

            const {source, itemStack } = e
            // console.log(usedOnBlockPermutation.type.id)
            const blockRayCastOptions = {includeLiquidBlocks: true, maxDistance: 6};
            const blockRaycastHit = source.getBlockFromViewDirection(blockRayCastOptions);
			if(blockRaycastHit === undefined) return;
            console.log(blockRaycastHit.block.typeId)
            //Another for loop to iterate through each horizontal cardinal direction adding to the y value
            // if(block.typeId === "minecraft:water" || block.isWaterlogged){
            //     console.log("filling from water")
            // }
        }
    });
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



// world.afterEvents.entitySpawn.subscribe((e) => {
//     const {entity} = e;
//     // const item = entity.getComponent("item").itemStack;
//     if(entity.typeId !== "minecraft:splash_potion") return;

//     console.warn(entity.typeId)
//     console.log(entity.getComponents()[0].typeId)

// });

// world.afterEvents.projectileHitBlock.subscribe((e) => {
//     const {projectile} = e;
//     // const item = entity.getComponent("item").itemStack;
//     console.warn(projectile.typeId)
//     // console.warn(projectile.getComponents()[0].typeId)

// });