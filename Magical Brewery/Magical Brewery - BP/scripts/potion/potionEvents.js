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

            const {source, itemStack} = e
            const{block} = source.getBlockFromViewDirection({includeLiquidBlocks: true, maxDistance: 4.0});
            
            if(block.typeId === "minecraft:water" || block.isWaterlogged){
                console.log("filling from water")
            }
            //Currently I cannot edit the filllevel of a potion, in the meantime, this is what we get

            // else if(block.typeId === "minecraft:cauldron"){
            //     const fillLevel =  block.getComponent("minecraft:fluid_container").fillLevel;
            //     const fluid = block.getComponent("minecraft:fluid_container").getFluidType();
            //     console.log(fluid + fillLevel)

            //     if(fillLevel > 1 && fluid == "Water"){

            //         // block.setPermutation(block.permutation.withState("fill_level", fillLevel-2));
            //         console.log("emptying cauldron")
            //     }
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

        switch(effect.typeId){
            case "minecraft:infested":
                applyInfestedEffect(hurtEntity, hurtEntity.dimension, effect.amplifier)
            break;
        }
    });
    
	
	   
}

function applyInfestedEffect(entity, dimension, potency){
	
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

function applyWindChargedEffect(entity, dimension, potency){
   console.log("Must have been the wind") 
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

        switch(effect.typeId){
            case "minecraft:oozing":
                system.runJob(applyOozingEffect(entity, dimension, effect.amplifier));
            break;
            case "minecraft:weaving":
                applyWeavingEffect(entity, dimension, effect.amplifier);
                
            break;
            case "minecraft:wind_charged":
                applyWindChargedEffect(entity, dimension, effect.amplifier);
                
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