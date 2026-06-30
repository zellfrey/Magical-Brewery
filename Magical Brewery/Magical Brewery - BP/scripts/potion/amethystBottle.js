import {world, ItemStack, system} from "@minecraft/server";
import {MathUtils} from "../utils/MathUtils.js";
import {setMainHand} from '../utils/containerUtils.js';


//Amethyst Bottle events
system.beforeEvents.startup.subscribe(eventData => {
	eventData.itemComponentRegistry.registerCustomComponent('magical_brewery:on_use_amethyst_bottle', {
		onUse(e) {
			getAmethystWaterBottle(e.source, e.itemStack);
		}
	});
});
world.afterEvents.playerInteractWithBlock.subscribe((e) => {
	amethystBottleInteractCauldron(e.beforeItemStack, e.block, e.player);
});
world.afterEvents.playerInteractWithBlock.subscribe((e) => {
	amethystWaterBottleInteractCauldron(e.beforeItemStack, e.block, e.player);
});

function getAmethystWaterBottle(player, selectedItem){
		//max distance is as close as to a glass bottle interaction range on water.
		//This is a rough estimation, im not getting nit picky with raycast options
		const blockRayCastOptions = {includeLiquidBlocks: true, maxDistance: 7.5};
		const blockRaycastHit = player.getBlockFromViewDirection(blockRayCastOptions);
		
		if(blockRaycastHit === undefined) return;

		const block = blockRaycastHit.block;
		
		if(block.typeId === "minecraft:water" || block.isWaterlogged){
			const equipment = player.getComponent('equippable');
			const amethystWaterBottle = new ItemStack("magical_brewery:amethyst_water_bottle", 1);

			block.dimension.playSound("bottle.fill", block.location, {volume: 0.8, pitch: 1.0});

			setMainHand(player, equipment, selectedItem, undefined);

			player.getComponent("inventory").container.addItem(amethystWaterBottle);
		}
	}

function amethystBottleInteractCauldron(beforeItemStack, interactedBlock, player){

		if(beforeItemStack?.typeId === "magical_brewery:amethyst_bottle" && interactedBlock.typeId === "minecraft:cauldron"){

			const fillLevel =  interactedBlock.getComponent("minecraft:fluid_container").fillLevel;
			const fluid = interactedBlock.getComponent("minecraft:fluid_container").getFluidType();

			if(fillLevel < 1 || fluid !== "Water") return;

			const equipment = player.getComponent('equippable');
			const selectedItem = equipment.getEquipment('Mainhand');
			const amethystWaterBottle = new ItemStack("magical_brewery:amethyst_water_bottle", 1)
			
			interactedBlock.setPermutation(interactedBlock.permutation.withState("fill_level", fillLevel-2));

			interactedBlock.dimension.playSound("bottle.fill", interactedBlock.location, {volume: 0.8, pitch: 1.0});

			setMainHand(player, equipment, selectedItem, undefined);
			player.getComponent("inventory").container.addItem(amethystWaterBottle)
	}
}

function amethystWaterBottleInteractCauldron(beforeItemStack, interactedBlock, player){

		if(beforeItemStack?.typeId === "magical_brewery:amethyst_water_bottle" && interactedBlock.typeId === "minecraft:cauldron"){

			const fillLevel =  interactedBlock.getComponent("minecraft:fluid_container").fillLevel;
			const fluid = interactedBlock.getComponent("minecraft:fluid_container").getFluidType();
			
			//26/06/2026. How long has this api been out for? Why has it been 3 years or so and we still dont have cauldron interaction.
			//Look i want it to be as close to a glass bottle as I can, but supposedly i can't manipulate the blocks permutation
			//despite this code being executed in an after event. So fuck me I guess and just bend me over and take Microslops dick
			if(fillLevel >= 5 || fluid !== "Water") return;

			const equipment = player.getComponent('equippable');
			const selectedItem = equipment.getEquipment('Mainhand');
			const amethystBottle = new ItemStack("magical_brewery:amethyst_bottle", 1)
			
			interactedBlock.setPermutation(interactedBlock.permutation.withState("fill_level", fillLevel+2));

			interactedBlock.dimension.playSound("bottle.empty", interactedBlock.location, {volume: 0.8, pitch: 1.0});

			setMainHand(player, equipment, selectedItem, undefined);
			player.getComponent("inventory").container.addItem(amethystBottle)
	}
}