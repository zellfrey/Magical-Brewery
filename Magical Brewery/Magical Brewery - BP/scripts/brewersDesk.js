import {world, system, BlockPermutation} from "@minecraft/server";
import {getAdjacentBlock} from "./utils/blockPlacementUtils.js"

system.beforeEvents.startup.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('magical_brewery:bop_brewers_desk_left_side', {
        beforeOnPlayerPlace(e) {
            const deskDirection = e.permutationToPlace.getState("minecraft:cardinal_direction")
			
            const potentialDeskRightSideBlock = getAdjacentBlock(e.block, deskDirection)

            if(!potentialDeskRightSideBlock.isAir) e.cancel = true;
        },
    });
});

system.beforeEvents.startup.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('magical_brewery:op_brewers_desk_left_side', {
        onPlace(e) {
            const deskDirection = e.block.permutation.getState("minecraft:cardinal_direction")
            const brewersDeskRightSide = getAdjacentBlock(e.block, deskDirection)

			brewersDeskRightSide.setType("magical_brewery:brewers_desk_right")
			
            const deskRightSideDirection = { "minecraft:cardinal_direction": getOppositeDeskDirection(deskDirection) }
			const brewersDeskRightSidePermutation = BlockPermutation.resolve("magical_brewery:brewers_desk_right", deskRightSideDirection);
			
			brewersDeskRightSide.setPermutation(brewersDeskRightSidePermutation);
        }
    });
});

system.beforeEvents.startup.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('magical_brewery:ob_brewers_desk_left_side', {
        onBreak(e) {
            const deskDirection = e.brokenBlockPermutation.getState("minecraft:cardinal_direction")
            const brewersDeskRightSide = getAdjacentBlock(e.block, deskDirection)
            
            
			if(brewersDeskRightSide === undefined || brewersDeskRightSide.typeId !== "magical_brewery:brewers_desk_right") return;
				
			brewersDeskRightSide.setType("minecraft:air")
        }
    });
});

system.beforeEvents.startup.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('magical_brewery:ob_brewers_desk_right_side', {
        onBreak(e) {
            const deskDirection = e.brokenBlockPermutation.getState("minecraft:cardinal_direction")
            const brewersDeskLeftSide = getAdjacentBlock(e.block, deskDirection)
            
            
			if(brewersDeskLeftSide === undefined || brewersDeskLeftSide.typeId !== "magical_brewery:brewers_desk_left") return;
				
			brewersDeskLeftSide.setType("minecraft:air")
        }
    });
});

function getOppositeDeskDirection(deskDirection){

    let deskLeftDirection = "north";

    switch(deskDirection){
        case "north":
            deskLeftDirection = "south"
        break;
        case "south":
            deskLeftDirection = "north"
        break;
        case "west":
            deskLeftDirection = "east"
        break;
        case "east":
            deskLeftDirection = "west"
        break;
    }

    return deskLeftDirection;
}