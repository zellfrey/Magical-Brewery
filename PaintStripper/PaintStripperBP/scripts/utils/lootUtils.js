import {world, system, ItemStack } from "@minecraft/server";

//Functions used to hook into vanilla blocks/entities to drop custom loot
const nonSilkTouchBlocks = ["magical_brewery:growing_crystal","magical_brewery:budding_pure_quartz", 
    "magical_brewery:budding_redstone", "magical_brewery:budding_glowstone", "magical_brewery:budding_echo"]
//Hook into vanilla events to create custom loot table


world.beforeEvents.playerBreakBlock.subscribe((e) => {
    const {player, block} = e;

    if(!player || player.getGameMode() === "creative" || !player.getComponent('equippable')) return;

    const validBlock = nonSilkTouchBlocks.find((e) => e === block.typeId);
    
    if(validBlock){
        let hasSilkTouch = false;
        const equipment = player.getComponent('equippable');
        const selectedItem = equipment.getEquipment('Mainhand');
        const enchants = selectedItem.getComponent("minecraft:enchantable");
        if(enchants){
            const enchantments = enchants.getEnchantments();
            for (const enchant of enchantments) {
                if (enchant.type.id === "silk_touch") {
                    hasSilkTouch = true;
                    break;
                }
            }
        }
        if(!hasSilkTouch) return;

        e.cancel = true;

        if (player.lastTick == undefined) { player.lastTick = 0 }
        if (system.currentTick - player.lastTick > 5) {
          system.run(() => {
            block.dimension.playSound("break.amethyst_cluster", block.location);
            block.setType("minecraft:air")
          });
          player.lastTick = system.currentTick;
        }
    } 
});

  