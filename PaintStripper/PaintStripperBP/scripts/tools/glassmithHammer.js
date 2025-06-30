import {system} from "@minecraft/server";
import {setMainHand} from 'utils/containerUtils.js';

system.beforeEvents.startup.subscribe(eventData => {
    eventData.itemComponentRegistry.registerCustomComponent('magical_brewery:on_use_on_hammer', {
        onUseOn(e) {
            const {block, itemStack, source} = e;
            if(!block.hasTag("magical_brewery:crystal_seed")) return;

            const seedDepth = block.permutation.getState("magical_brewery:seed_depth")
            if(seedDepth != 4){
                block.setPermutation(block.permutation.withState("magical_brewery:seed_depth", seedDepth+1));
                block.dimension.spawnParticle("minecraft:critical_hit_emitter", block.center()); 
                const pitch = seedDepth * 0.75
                block.dimension.playSound("hit.amethyst_block", block.location, {volume: 0.8, pitch: pitch});

                setItemStackDurability(itemStack, source)
            }     
        }
    });
});

function setItemStackDurability(itemStack, player){
    const enchants = itemStack.getComponent("minecraft:enchantable");
    const unbreakingLevel = enchants?.getEnchantment("unbreaking")?.level ?? 0;

    const shouldntBreak = (100 / (unbreakingLevel + 1) < Math.random() * 100)

    if (shouldntBreak) return;

    const durability = itemStack.getComponent("minecraft:durability");
    durability.damage++;
    const equipment = player.getComponent('equippable');
    const selectedItem = equipment.getEquipment('Mainhand');

    if (durability.damage >= durability.maxDurability){
        player.playSound('random.break', { pitch: 1, location: player.location, volume: 1 })
        setMainHand(player, equipment, selectedItem, undefined);
    }
    else if (durability.damage < durability.maxDurability) {
        setMainHand(player, equipment, selectedItem, itemStack);
    }
}