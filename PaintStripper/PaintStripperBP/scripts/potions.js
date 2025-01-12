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