import {world, system, ItemStack } from "@minecraft/server";

//Functions used to hook into vanilla blocks/entities to drop custom loot

//Hook into vanilla events to create custom loot table
world.afterEvents.playerBreakBlock.subscribe((e) => {
    const { brokenBlockPermutation, dimension,block } = e;

    if (brokenBlockPermutation.type.id === "minecraft:glowstone" && (Math.floor(Math.random() * 100) < 5)) {
        dimension.spawnItem(new ItemStack("ps:glowstone_shard", 1), block.location);
    }
});
