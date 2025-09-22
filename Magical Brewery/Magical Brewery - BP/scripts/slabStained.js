import {system, world} from "@minecraft/server"
import {setMainHand} from './utils/containerUtils.js';
import {getAdjacentBlock} from "./utils/blockPlacementUtils.js";

system.beforeEvents.startup.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('magical_brewery:opd_slab', {
        onPlayerBreak(e) {
            const {player, destroyedBlockPermutation: perm } = e;

            if (!player || !player.getComponent('equippable'))  return;

            if (player.getGameMode() === "Creative") return;

            const slabItem = perm.getItemStack(1);
            if (slabItem) e.dimension.spawnItem(slabItem, e.block.location);
            
        }
    });
});

// system.beforeEvents.startup.subscribe(eventData => {
//     eventData.itemComponentRegistry.registerCustomComponent('magical_brewery:on_use_slab_stained', {
//         onUseOn(e) {
//             const {source, itemStack, block, blockFace} = e

//             const equipment = source.getComponent('equippable');
//             const selectedItem = equipment.getEquipment('Mainhand');
            

//             if (itemStack.typeId === block.typeId){
                
//                 const verticalHalf = block.permutation.getState('minecraft:vertical_half');
//                 const isBottomUp = verticalHalf === 'bottom' && blockFace === 'Up';
//                 const isTopDown = verticalHalf === 'top' && blockFace === 'Down';
                
//                 if (isBottomUp || isTopDown) {

//                     block.setPermutation(block.permutation.withState('magical_brewery:double', true)); 
//                     block.dimension.playSound('use.wood', block.location);
//                     setMainHand(source, equipment, selectedItem, undefined);
//                 }
//             }
//             else{
//                 let adjacentBlock = getAdjacentBlock(block, blockFace)
//                 if(itemStack.typeId === adjacentBlock.typeId){
//                     adjacentBlock.setPermutation(adjacentBlock.permutation.withState('magical_brewery:double', true)); 
//                     adjacentBlock.dimension.playSound('use.wood', adjacentBlock.location);
//                     setMainHand(source, equipment, selectedItem, undefined);
//                 }
//             }
//         }
//     });
// });

