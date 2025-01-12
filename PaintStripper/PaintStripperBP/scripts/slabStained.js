import {world, Direction} from "@minecraft/server"
import {setMainHand} from './utils/containerUtils.js';
import {getAdjacentBlock, getBlockFromFace} from "./utils/blockPlacementUtils.js";

world.beforeEvents.worldInitialize.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('ps:before_on_place_rotatable_slab', {
        beforeOnPlayerPlace(e) {
            const {block, player, face } = e;
            const equipment = player.getComponent('equippable');
            const selectedItem = equipment.getEquipment('Mainhand');

            let blockToCheck = getBlockFromFace(block, face)

            if (selectedItem?.typeId === blockToCheck.typeId && !blockToCheck.permutation.getState('ps:double')){
                
                const verticalHalf = blockToCheck.permutation.getState('minecraft:vertical_half');
                const isBottomUp = verticalHalf === 'bottom' && face === 'Up';
                const isTopDown = verticalHalf === 'top' && face === 'Down';
                
                if (isBottomUp || isTopDown) {

                    blockToCheck.setPermutation(blockToCheck.permutation.withState('ps:double', true)); 
                    world.playSound('use.wood', blockToCheck.location);
                    e.cancel = true;
                    setMainHand(player, equipment, selectedItem);
                }
                
            }
        },
    });
});

world.beforeEvents.worldInitialize.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('ps:on_player_destroy_slab', {
        onPlayerDestroy(e) {
            const {player, destroyedBlockPermutation: perm } = e;

            if (!player || !player.getComponent('equippable'))  return;

            // const selectedItem = player.getComponent('equippable').getEquipment('Mainhand');
            // if (!selectedItem || !selectedItem.hasTag('minecraft:is_pickaxe')) {
            //     return;
            // }
            //TODO
            //Small testing, a sword seems to destroy hay bales faster than other tools. Will also implement more functionality for every tool to loose durability(or maybe it willbe added shortly)
            if (player.getGameMode() === "creative") return;

            const slabItem = perm.getItemStack(1);
            if (slabItem) e.dimension.spawnItem(slabItem, e.block.location);
        }
    });
});