import {world, system, ItemStack } from "@minecraft/server";

//Crystal cluster growth
world.beforeEvents.worldInitialize.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('ps:ort_bud_growth', {
        onRandomTick(e) {
            const { block } = e;
            if(Math.floor(Math.random() * 100) > 20) return;
            
            const blockdAndFaces = [{block:block.above(), face:"up"},{block:block.below(), face:"down"},{block:block.north(), face:"north"}, 
                                    {block:block.south(), face:"south"},{block:block.west(), face:"west"},{block:block.east(), face:"east"},]
            //ive used "block" enough times. Lets spice things up                        
            const availableLumps = blockdAndFaces.filter(parallelepiped => 
                                                            parallelepiped.block.isAir || parallelepiped.block.typeId.slice(-14) === "_glowstone_bud");
            
            if(availableLumps.length === 0) return;

            const budToGrow = availableLumps[Math.floor(Math.random() * availableLumps.length)]
            let newSize;
            if(budToGrow.block.isAir){
                newSize ="ps:small_glowstone_bud";
            }
            else{
                const budSize =budToGrow.block.typeId.slice(3, -14);
                console.warn(budSize)
                switch(budSize){
                    case "small":
                        newSize = "ps:medium_glowstone_bud";
                    break;
                    case "medium":
                        newSize = "ps:large_glowstone_bud";
                    break;
                    case "large":
                        newSize = "ps:glowstone_cluster";
                }
            }
            budToGrow.block.setType(newSize)
            budToGrow.block.setPermutation(budToGrow.block.permutation.withState("minecraft:block_face", budToGrow.face));
        }
    });
});

//Hook into vanilla events to create custom loot table
world.afterEvents.playerBreakBlock.subscribe((e) => {
    const { brokenBlockPermutation, dimension,block } = e;

    if (brokenBlockPermutation.type.id === "minecraft:glowstone" && (Math.floor(Math.random() * 100) < 5)) {
        dimension.spawnItem(new ItemStack("ps:glowstone_shard", 1), block.location);
    }
});

// world.beforeEvents.worldInitialize.subscribe(eventData => {
//     eventData.blockComponentRegistry.registerCustomComponent('ps:opd_loot_cluster', {
//         onPlayerDestroy(e) {
//             const {player, block} = e;

//             if(!player || player.getGameMode() === "creative" || !player.getComponent('equippable')) return;

//             const equipment = player.getComponent('equippable');
//             const selectedItem = equipment.getEquipment('Mainhand');
//             const enchants = selectedItem.getComponent("minecraft:enchantable");
//             if(enchants){
//                 const enchantments = enchants.getEnchantments();
//                 for (const enchant of enchantments) {
//                     if (enchant.type.id === "silk_touch") {
//                         console.warn("i has silk touch")
//                     }
//                 }
//             }
//             console.warn(selectedItem.typeId)
//             console.warn("crystal broken")
//         }
//     });
// });

function applyDurabilityDamage(player, item, inventory, slotIndex) {
    const durabilityComponent = item.getComponent("minecraft:durability");
    if (durabilityComponent) {
      const { unbreakingLevel } = getRelevantEnchantments(item);
      
      if (Math.random() < 1 / (unbreakingLevel + 1)) {
        const newDamage = durabilityComponent.damage + 1;
        if (newDamage >= durabilityComponent.maxDurability) {
          inventory.container.setItem(slotIndex, undefined);
          player.playSound("random.break");
        } else {
          durabilityComponent.damage = newDamage;
          inventory.container.setItem(slotIndex, item);
        }
      }
    }
  }
  
  function getRelevantEnchantments(item) {
    let unbreakingLevel = 0;
    let hasSilkTouch = false;
  
    try {
        const enchantableComponent = item.getComponent("minecraft:enchantable");
        if (enchantableComponent) {
            const enchantments = enchantableComponent.getEnchantments();
            for (const enchant of enchantments) {
                if (enchant.type.id === "unbreaking") {
                    unbreakingLevel = enchant.level;
                } else if (enchant.type.id === "silk_touch") {
                    hasSilkTouch = true;
                }
            }
        }
    } catch (error) {
        console.warn("Error checking enchantments:", error);
    }
    return { unbreakingLevel, hasSilkTouch };
  }