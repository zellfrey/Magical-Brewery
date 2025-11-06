import {world, system} from '@minecraft/server';
import {MagicalBreweryPotion} from "./MagicalBreweryPotion.js";
import {MinecraftPotion} from "../potion/MinecraftPotion.js";
import {MathUtils} from "../utils/MathUtils.js";

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
// world.afterEvents.entityHurt.subscribe((e) => {
//     const {damage} = e;
//     console.log("damage: " + damage)
// });

const ON_DEATH_EFFECTS= ["minecraft:oozing", "minecraft:weaving", "minecraft:wind_charged"];

const ON_HIT_EFFECTS= ["minecraft:infested"];
world.afterEvents.entityHealthChanged.subscribe((e) => {

    if(e.newValue > 0 || e.entity.getEffects().length === 0) return;

    applyOnDeathEffects(e.entity)
    
});

function applyOnDeathEffects(entity){

    const onDeathEffects = entity.getEffects().filter((effect) => ON_DEATH_EFFECTS.includes(effect.typeId));

    if(onDeathEffects.length === 0) return;

    onDeathEffects.forEach(effect => {

        if(effect.amplifier ===0) return;

        switch(effect.typeId){
        case "minecraft:oozing":
            system.runJob(applyOozingEffect(entity, effect.amplifier));
        break;
        case "minecraft:weaving":
            applyWeavingEffect(entity, effect.amplifier);
            
        break;
    }
    });
    
}

function* applyOozingEffect(entity, noSlimesToSpawn){
    for(let i = 0; i < noSlimesToSpawn; i++){
        entity.dimension.spawnEntity("minecraft:slime", entity.location,{spawnEvent: "spawn_medium"})
        yield;
    }
    
}
function applyWeavingEffect(entity, potencyLevel){

    if(!world.gameRules.mobGriefing) return;
    
    const dimension = entity.dimension;
    let webSpawnArea = getAirBlockBox(entity, potencyLevel);

    let validSpawnLocations = webSpawnArea.filter(location =>{

        const block = dimension.getBlock({ x: location.x, y: location.y, z: location.z });

        if(!block.below().isAir && block.below().typeId !== "minecraft:web") return true;
    })

    let noOfCobWebs = potencyLevel *3
    system.runJob(spawnWeavingWebs(noOfCobWebs, dimension, validSpawnLocations))
}

function* spawnWeavingWebs(noOfWebsToSpawn, dimension, validSpawnLocations){
   for(let i = 0; i <= noOfWebsToSpawn; i++){
        const location = validSpawnLocations[MathUtils.getRandomInt(validSpawnLocations.length)];
        const block = dimension.getBlock({ x: location.x, y: location.y, z: location.z });
        block.setType("minecraft:web")
        yield;
    }
}



function getAirBlockBox(entity, potencyLevel){
    let boxCorner = entity.location;

    boxCorner.y += - potencyLevel
	boxCorner.x += - potencyLevel
	boxCorner.z += - potencyLevel

    const boxSize = 1 + potencyLevel*2

    return getAirBlockVectors(boxCorner, entity.dimension, boxSize);
}

function getAirBlockVectors(startingLocation, dimension, size) {
    
    const heightMax = dimension.heightRange.max;
    const heightMin = dimension.heightRange.min;

    let validAirBlocks = [];
    for (let x = startingLocation.x; x < startingLocation.x + size; x++) {
        for (let y = startingLocation.y; y < startingLocation.y + size; y++) {
            for (let z = startingLocation.z; z < startingLocation.z + size; z++) {

                if(y <= heightMin || y >= heightMax) continue;

                const block = dimension.getBlock({ x: x, y: y, z: z });
                
                if (block && (block.isAir)) {
                validAirBlocks.push(block.location)
                }
            }
        }
    }
    return validAirBlocks
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