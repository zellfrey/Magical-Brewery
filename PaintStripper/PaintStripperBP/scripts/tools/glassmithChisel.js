// import {system} from "@minecraft/server";
// import {getAdjacentBlock} from "utils/blockPlacementUtils.js";

// const willChiselBlocks = ["minecraft:budding_amethyst", "minecraft:glowstone", "magical_brewery:budding_glowstone", "minecraft:redstone_ore",
//                         "minecraft:deepslate_redstone_ore","minecraft:lit_redstone_ore","minecraft:lit_deepslate_redstone_ore", "magical_brewery:budding_redstone"];

// const allowedRedstoneBlocks = ["minecraft:redstone_ore","minecraft:deepslate_redstone_ore","minecraft:lit_redstone_ore",
//                                 "minecraft:lit_deepslate_redstone_ore", "magical_brewery:budding_redstone"];

// system.beforeEvents.startup.subscribe(eventData => {
//     eventData.itemComponentRegistry.registerCustomComponent('magical_brewery:on_use_on_chisel', {
//         onUseOn(e) {
//             const {block, blockFace} = e;
//             console.warn(blockFace)
//             if(block.typeId === "magical_brewery:chiselled_crystal"){
//                 const chiselSize = block.permutation.getState("magical_brewery:chisel_size")

//                 if(chiselSize != 5){
//                     block.setPermutation(block.permutation.withState("magical_brewery:chisel_size", chiselSize+1)); 
//                     block.dimension.spawnParticle("minecraft:critical_hit_emitter", block.center()); 
//                     block.dimension.playSound('hit.amethyst_block', block.location);
//                 }
//                 else{
//                     block.dimension.playSound('dig.stone', block.location); 
//                 }
//             }
//             else if(willChiselBlocks.includes(block.typeId)){
//                 const adjacentBlock  = getAdjacentBlock(block, blockFace)
//                 adjacentBlock.setType("magical_brewery:chiselled_crystal");
//                 adjacentBlock.setPermutation(adjacentBlock.permutation.withState("minecraft:block_face", blockFace.toLowerCase()));

//                 if(block.typeId === "minecraft:budding_amethyst"){
//                     adjacentBlock.setPermutation(adjacentBlock.permutation.withState("magical_brewery:crystal_type", "amethyst")); 
//                 }
//                 else if(block.typeId === "minecraft:glowstone" || block.typeId === "magical_brewery:budding_glowstone"){
//                     adjacentBlock.setPermutation(adjacentBlock.permutation.withState("magical_brewery:crystal_type", "glowstone")); 
//                 }
//                 else if(allowedRedstoneBlocks.includes(block.typeId)){
//                     adjacentBlock.setPermutation(adjacentBlock.permutation.withState("magical_brewery:crystal_type", "redstone")); 
//                 }
//             } 
            
//             // Dimension.playSound("hit.amethyst_block", block.location, {volume: 0.8, pitch: 1.2});
//             block.dimension.playSound('hit.amethyst_block', block.location);
//         }
//     });
// });