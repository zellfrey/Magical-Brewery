import {world, system, ItemStack } from "@minecraft/server";
import {BuddingCrystal} from "crystal/BuddingCrystal.js";
//Functions used to hook into vanilla blocks/entities to drop custom loot
const NON_SILK_TOUCH_BLOCKS = ["magical_brewery:growing_crystal","magical_brewery:budding_pure_quartz", 
    "magical_brewery:budding_redstone", "magical_brewery:budding_glowstone", "magical_brewery:budding_echo"]
//Hook into vanilla events to create custom loot table

world.beforeEvents.playerBreakBlock.subscribe((e) => {
    const {player, block} = e;

    const equipment = player.getComponent('equippable');
    const selectedItem = equipment.getEquipment('Mainhand');

    if(!player || player.getGameMode() === "Creative" || !selectedItem) return;

    const validBlock = NON_SILK_TOUCH_BLOCKS.find((e) => e === block.typeId);
    
    if(validBlock  && hasSilkTouch(selectedItem)){
        
        e.cancel = true;

        removeNonSilkTouchBlock(player, block)
        BuddingCrystal.destroyCrystal(block.location, block.dimension.id)
    } 
});

function hasSilkTouch(selectedItem){
    let hasSilkTouch = false;
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
    return hasSilkTouch;
}


function removeNonSilkTouchBlock(player, block){
    if (player.lastTick == undefined) { player.lastTick = 0 }

    if (system.currentTick - player.lastTick > 5) {
        system.run(() => {
            block.dimension.playSound("break.amethyst_cluster", block.location);
            block.setType("minecraft:air")
        });
        player.lastTick = system.currentTick;
    }
}