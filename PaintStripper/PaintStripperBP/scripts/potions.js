import {world, ItemStack, system} from '@minecraft/server';
import {setMainHand} from './utils/containerUtils.js';

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
            if(modifier === "Instant Health" || modifier === "Instant Damage"){
                source.addEffect(modifier.replace(" ","_").toLowerCase(), 1, { amplifier: 0 })
            }else{
                const words = modifier.split(' ');
                const effectTime = words.pop();
                let effect = words.join("_").toLowerCase()
                // if(Potions.getPotionEffectType(effect) ! == undefined){
                // }
                const ms = effectTime.substring(1, 5)
                const [minutes, seconds] = ms.split(':');
                const totalSeconds = (+minutes) * 60 + (+seconds);
                
                source.addEffect(effect, totalSeconds * 20, { amplifier: 0 })
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
        onUse(e) {
            const {source, itemStack} = e
            const{block} = source.getBlockFromViewDirection({includeLiquidBlocks: true});
            // maxDistance: 4.0
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