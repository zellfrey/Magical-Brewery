import {world, ItemStack, system} from '@minecraft/server';
import {setMainHand} from './utils/containerUtils.js';
import {getPotencyLevel} from "./potionEffects.js";

//12 mins duration in ticks i.e 12*60 *20
const xLongDuration = 14400;
system.beforeEvents.startup.subscribe(eventData => {
    eventData.itemComponentRegistry.registerCustomComponent('ps:oc_potion', {
        onConsume(e) {
            const { source, itemStack} = e;
            source.addEffect(itemStack.getTags()[0], xLongDuration, { amplifier: 0 })
            
        }
    });
});

world.afterEvents.itemCompleteUse.subscribe((e) => {
    const { source, itemStack } = e;
    if(itemStack.typeId !== "minecraft:potion") return;

    const potion = itemStack.getComponent('minecraft:potion')
    const lore = itemStack.getLore();
    if(lore.length != 0){
        lore.forEach(modifier => {
            const words = modifier.split(' ');

            if(words[0] === "Instant"){
                const potency = getPotencyLevel(words)
                if(potency !== 0) words.pop();
                source.addEffect(words.join("_").toLowerCase(), 1, { amplifier: potency })
            }
            else{
                
                const effectTime = words[words.length-1].substring(1, 5)
                const [minutes, seconds] = effectTime.split(':');
                const totalTicks = ((+minutes) * 60 + (+seconds)) * 20;
                words.pop();

                const potency = getPotencyLevel(words)
                
                if(potency !== 0) words.pop();

                let effect = words.join("_").toLowerCase()
                // if(Potions.getPotionEffectType(effect) ! == undefined){
                // }
                source.addEffect(effect, totalTicks, { amplifier: potency })
            }
        });
    }
});



world.afterEvents.entitySpawn.subscribe((e) => {
    const {entity} = e;
    // const item = entity.getComponent("item").itemStack;
    if(entity.typeId !== "minecraft:splash_potion") return;

    console.warn(entity.typeId)
    

});
system.beforeEvents.startup.subscribe(eventData => {
    eventData.itemComponentRegistry.registerCustomComponent('ps:on_use_amethyst_bottle', {
        onUseOn(e) {
            const {source, itemStack, block} = e
            console.log(block.typeId)
            if(block.typeId !== "minecraft:water") return;
            
            const equipment = source.getComponent('equippable');
            const selectedItem = equipment.getEquipment('Mainhand');
            const amethystWaterBottle = new ItemStack("ps:amethyst_water_bottle", 1)
            

            // if (block.typeId === "minecraft:cauldron"){

            //     const fillLevel =  block.getComponent("minecraft:fluid_container").fillLevel;
            //     const fluid = block.getComponent("minecraft:fluid_container").getFluidType();

            //     if(fillLevel < 1 || fluid !== "Water") return;

            //     block.setPermutation(block.permutation.withState("fill_level", fillLevel-2));
            // }

            block.dimension.playSound("bottle.fill", block.location, {volume: 0.8, pitch: 1.0});

            setMainHand(source, equipment, selectedItem, undefined);
            source.getComponent("inventory").container.addItem(amethystWaterBottle)
        }
    });
});