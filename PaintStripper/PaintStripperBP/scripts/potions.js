import {world, ItemStack} from '@minecraft/server';
import {setMainHand} from './utils/containerUtils.js';

//12 mins duration in ticks i.e 12*60 *20
const xLongDuration = 14400;
world.beforeEvents.worldInitialize.subscribe(eventData => {
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
        console.log(lore.length)
        lore.forEach(modifier => {
            const words = modifier.split(' ');
            words.pop();
            let effect = words.join("_").toLowerCase()
            // if(Potions.getPotionEffectType(effect) ! == undefined){
            // }
            console.log(effect)
            if(effect === "instant_health" || effect === "instant_damage"){
                source.addEffect(effect, 1, { amplifier: 0 })
           }else{
               source.addEffect(effect, 2400, { amplifier: 0 })
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
