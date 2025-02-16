import {system} from "@minecraft/server"
import {setMainHand} from './utils/containerUtils.js';
import {getBlockFromFace} from "./utils/blockPlacementUtils.js";

system.beforeEvents.startup.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('ps:bop_slab', {
        beforeOnPlayerPlace(e) {
            const {block, player, face, dimension } = e;
            const equipment = player.getComponent('equippable');
            const selectedItem = equipment.getEquipment('Mainhand');

            let blockToCheck = getBlockFromFace(block, face)
            
            if (selectedItem?.typeId === blockToCheck.typeId && !blockToCheck.permutation.getState('ps:double')){
                
                const verticalHalf = blockToCheck.permutation.getState('minecraft:vertical_half');
                const isBottomUp = verticalHalf === 'bottom' && face === 'Up';
                const isTopDown = verticalHalf === 'top' && face === 'Down';
                
                if (isBottomUp || isTopDown) {

                    blockToCheck.setPermutation(blockToCheck.permutation.withState('ps:double', true)); 
                    dimension.playSound('use.wood', blockToCheck.location);
                    e.cancel = true;
                    setMainHand(player, equipment, selectedItem, undefined);
                }
                
            }
        },
    });
});

system.beforeEvents.startup.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('ps:opd_slab', {
        onPlayerDestroy(e) {
            const {player, destroyedBlockPermutation: perm } = e;

            if (!player || !player.getComponent('equippable'))  return;

            if (player.getGameMode() === "creative") return;

            const slabItem = perm.getItemStack(1);
            if (slabItem) e.dimension.spawnItem(slabItem, e.block.location);
            
        }
    });
});