import {system, ItemStack, world} from "@minecraft/server";
import {setMainHand} from 'utils/containerUtils.js';

const HAMMER_SILK_TOUCHABLE_BLOCK_IDS = [
    //Amethyst Buds
    "minecraft:small_amethyst_bud", "minecraft:medium_amethyst_bud", "minecraft:large_amethyst_bud",
    //Glass
    "minecraft:glass", "minecraft:glass_pane",
    //Stained Glass
    "minecraft:white_stained_glass", "minecraft:white_stained_glass", "minecraft:magenta_stained_glass", "minecraft:light_blue_stained_glass", 
    "minecraft:yellow_stained_glass", "minecraft:lime_stained_glass", "minecraft:pink_stained_glass", "minecraft:gray_stained_glass", 
    "minecraft:light_gray_stained_glass", "minecraft:cyan_stained_glass", "minecraft:purple_stained_glass", "minecraft:blue_stained_glass", 
    "minecraft:brown_stained_glass", "minecraft:green_stained_glass", "minecraft:red_stained_glass", "minecraft:black_stained_glass",
    //Stained Panes
    "minecraft:white_stained_glass_pane", "minecraft:white_stained_glass_pane", "minecraft:magenta_stained_glass_pane", "minecraft:light_blue_stained_glass_pane", 
    "minecraft:yellow_stained_glass_pane", "minecraft:lime_stained_glass_pane", "minecraft:pink_stained_glass_pane", "minecraft:gray_stained_glass_pane", 
    "minecraft:light_gray_stained_glass_pane", "minecraft:cyan_stained_glass_pane", "minecraft:purple_stained_glass_pane", "minecraft:blue_stained_glass_pane", 
    "minecraft:brown_stained_glass_pane", "minecraft:green_stained_glass_pane", "minecraft:red_stained_glass_pane", "minecraft:black_stained_glass_pane",  
]

system.beforeEvents.startup.subscribe(eventData => {
    eventData.itemComponentRegistry.registerCustomComponent('magical_brewery:on_use_on_hammer', {
        onUseOn(e) {
            const {block, itemStack, source} = e;
            if(block.hasTag("magical_brewery:crystal_seed")){
                setCrystalSeedDepth(block, itemStack, source);   
            }
            
        }
    });
});

system.beforeEvents.startup.subscribe(eventData => {
    eventData.itemComponentRegistry.registerCustomComponent('magical_brewery:on_mine_block_hammer', {
        onMineBlock(e) {
            const {block, minedBlockPermutation, itemStack, source} = e;

            const blockItemStack = getHammerSilkTouchAbleBlockItem(block, minedBlockPermutation);

            if(blockItemStack !== undefined){
                block.dimension.spawnItem(blockItemStack, block.center());
            }
            setItemDurability(itemStack, source);
        }
    });
});

//Amethyst cluster break event
world.beforeEvents.playerBreakBlock.subscribe((e) => {
    const {player, block} = e;

    const equipment = player.getComponent('equippable');
    const selectedItem = equipment.getEquipment('Mainhand');

    if(!player || player.getGameMode() === "Creative" || !selectedItem) return;

    if(block.typeId === "minecraft:amethyst_cluster" && selectedItem.typeId === "magical_brewery:glassmith_hammer"){
        
        e.cancel = true;

        system.run(() => {removeAmethystCluster(player, block, selectedItem);});
        
    } 
});

function setCrystalSeedDepth(block, itemStack, source){
    const seedDepth = block.permutation.getState("magical_brewery:seed_depth");
    if(seedDepth != 4){
        block.setPermutation(block.permutation.withState("magical_brewery:seed_depth", seedDepth+1));
        block.dimension.spawnParticle("minecraft:critical_hit_emitter", block.center()); 
        const pitch = seedDepth * 0.75
        block.dimension.playSound("hit.amethyst_block", block.location, {volume: 0.8, pitch: pitch});

        setItemDurability(itemStack, source);
    }
}

function setItemDurability(itemStack, player){
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

function getHammerSilkTouchAbleBlockItem(block, minedBlockPermutation){
    
    if(!HAMMER_SILK_TOUCHABLE_BLOCK_IDS.includes(minedBlockPermutation.type.id)) return;

    return new ItemStack(minedBlockPermutation.type.id, 1);
}


function removeAmethystCluster(player, block, selectedItem){
    const amethystClusterItem = new ItemStack("minecraft:amethyst_cluster", 1);

    block.dimension.playSound("break.amethyst_cluster", block.location);
    block.setType("minecraft:air");
    block.dimension.spawnItem(amethystClusterItem, block.center());

    setItemDurability(selectedItem, player);
}