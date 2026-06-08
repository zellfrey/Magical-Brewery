import {world, system, BlockPermutation, ItemStack} from "@minecraft/server";
import { MathUtils } from "./utils/MathUtils";

system.beforeEvents.startup.subscribe(eventData => {
	eventData.blockComponentRegistry.registerCustomComponent('magical_brewery:on_entity_fall_on_crackling_ore', {
		onEntityFallOn(e) {
			const {entity, block, fallDistance} = e;

			if(entity === undefined) return;
			console.log(fallDistance)
			onEntityFallCracklingOre(block, fallDistance)
		},
	});
});

system.beforeEvents.startup.subscribe(eventData => {
	eventData.blockComponentRegistry.registerCustomComponent('magical_brewery:ort_crackling_ore', {
		onRandomTick(e) {
			
			if(!e.block.dimension.isChunkLoaded(e.block.location) || !e.block.below().isAir) return;
			
			e.block.dimension.spawnParticle("magical_brewery:crackling_oil_drip_particle", e.block.center());
		},
	});
});

system.beforeEvents.startup.subscribe(eventData => {
	eventData.blockComponentRegistry.registerCustomComponent('magical_brewery:on_entity_fall_on_crackling_ore_unstable', {
		onEntityFallOn(e) {
			const {entity, block, fallDistance} = e;

			if(entity === undefined) return;

			block.dimension.createExplosion(block.location, 2);
		},
	});
});


world.afterEvents.entityHurt.subscribe((e) => {

	if(!e.hurtEntity.isValid || !e.hurtEntity.dimension.isChunkLoaded(e.hurtEntity.location) || e.damageSource !== "fall") return;

	cracklingOilOreDamageEntity(e.hurtEntity, e.damageSource, e.damage)

});
function cracklingOilOreDamageEntity(entity, dmgSource, dmg){

	const cOreStack = new ItemStack("magical_brewery:crackling_ore", 1);
	const cOilStack = new ItemStack("magical_brewery:crackling_oil", 1);
	const bundleStack = new ItemStack("magical_brewery:crackling_oil", 1);
	const entityContainer = entity.getComponent("inventory").container;
	const cOilInventorySlot = entityContainer.find(cOilStack);
	const cOreInventorySlot = entityContainer.find(cOreStack);

	
	//console.log(cOilInventorySlot);
	//console.log(cOreInventorySlot);
	//console.log(dmgSource.cause)
}

world.afterEvents.entityHurt.subscribe((e) => {

	if(!e.hurtEntity.isValid || !e.hurtEntity.dimension.isChunkLoaded(e.hurtEntity.location)) return;

	//onEntityFallCracklingOre(e.hurtEntity, e.damageSource, e.damage);

	if(e.damageSource.cause !== "fall") return;
	console.log(e.damage)
});



function onEntityFallCracklingOre(block, fallDistance){

	if(fallDistance < 8 && fallDistance >= 5){
		
		block.dimension.playSound('random.fuse', block.location);
		//sound play for 1.5 seconds
		//block go unstable then stabilising
		block.setPermutation(block.permutation.withState("magical_brewery:ore_stability", "unstable"));
		console.log("unstable");
		system.runTimeout(() => 
			{
				block.setPermutation(block.permutation.withState("magical_brewery:ore_stability", "stabilising"));
				//sound play for 1.5 seconds
				console.log("stabilising")
				system.runTimeout(() => 
					{
						block.setPermutation(block.permutation.withState("magical_brewery:ore_stability", "stable"));
						console.log("stable");
					},		
				30);
			},
		30);
		
	}else if(fallDistance < 11 && fallDistance >= 8){
		block.dimension.playSound('random.fuse', block.location);
		//sound play for 1.5 seconds
		block.setPermutation(block.permutation.withState("magical_brewery:ore_stability", "unstable")); 
		console.log("imma bout to bust");
		system.runTimeout(() => 
			{
				block.dimension.createExplosion(block.location, 2);
				console.log("explosded");
			},		
		30);
	}else{
		//ya fucked up kid, imma add salt to the wound after that terrible slip hazard
		block.dimension.createExplosion(block.location, 2)
	}
}