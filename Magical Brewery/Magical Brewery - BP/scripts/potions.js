import {world, ItemStack, system} from '@minecraft/server';
import {setMainHand} from './utils/containerUtils.js';
import {getPotencyLevel} from "./potionEffects.js";

//12 mins duration in ticks i.e 12*60 *20
const xLongDuration = 14400;
system.beforeEvents.startup.subscribe(eventData => {
    eventData.itemComponentRegistry.registerCustomComponent('magical_brewery:oc_potion', {
        onConsume(e) {
            e.source.addEffect(e.itemStack.getTags()[0], xLongDuration, { amplifier: 0 })
        }
    });
});

world.afterEvents.itemCompleteUse.subscribe((e) => {
    giveEffectsToEntity(e.source, e.itemStack)
});

function giveEffectsToEntity(entity, heldPotion){
    if(heldPotion.typeId !== "minecraft:potion" || heldPotion.getLore().length == 0) return;
    // const potion = e.itemStack.getComponent('minecraft:potion')
    heldPotion.getLore().forEach(modifier => {
        const words = modifier.split(' ');
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
        entity.addEffect(effect, totalTicks, { amplifier: potency })
    });
}

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

// world.afterEvents.entityHealthChanged.subscribe((e) => {
//     const {entity, newValue} = e;
//     if(newValue > 0) return;
//     console.log("name" + entity.typeId)
// 	console.log("effects length " + entity.getEffects().length)
// 	console.log("1st effect " + entity.getEffects()[0].typeId)
// 	console.log("1st effect level" +entity.getEffects()[0].amplifier)
// });
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