import {world, system, ItemStack } from "@minecraft/server";
import {getAdjacentBlock, getBlockFromFace} from "./utils/blockPlacementUtils.js";
import "./crystal/buddingCrystal.js"
import "./crystal/growingCrystal.js"
import "./tools/glassmithHammer.js"
import "./tools/glassmithChisel.js"
import "./tools/agelessPocketWatch.js"
import "./potions.js"
import "./slabStained.js"

system.runInterval(
    () => {
        const players = world.getAllPlayers();
        for (let i = 0; i < players.length; i++) {
            const player = players[i];
            try {
                const { block, face } = player.getBlockFromViewDirection();
                if (!block) {
                    player.onScreenDisplay.setActionBar( "Not looking at a Block." );
                    return;
                };
                
                player.onScreenDisplay.setActionBar(
                    `§rblock: §7${block.typeId}§r, face: §7${face}§r, xyz: §6${block.location.x} §r/ §6${block.location.y} §r/ §6${block.location.z}§r,\n`
                    + `data: §7${JSON.stringify(block.permutation.getAllStates(), null, 4)}`
                );
            } catch {
                player.onScreenDisplay.setActionBar( "Not looking at a Block." );
            };
        };
    },
);

world.afterEvents.entitySpawn.subscribe((e) => {
    const { entity } = e;
    if(entity.typeId !== "minecraft:item") return;
    
    const item = entity.getComponent("item");
    console.warn(item.typeId)
});
