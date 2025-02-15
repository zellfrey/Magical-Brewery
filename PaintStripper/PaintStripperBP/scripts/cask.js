import {world, system, ItemStack} from "@minecraft/server";
import {setMainHand} from './utils/containerUtils.js';


world.beforeEvents.worldInitialize.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('ps:op_cask', {
        onPlace(e) {
            const {block, dimension} = e;
            const {x,y,z} = block.location
            let getCaskData = world.getDynamicProperty('magical_brewery:cask_data')
            if (getCaskData) {
                getCaskData = JSON.parse(getCaskData)
                getCaskData.push(createCask(dimension.id, {x, y, z}))
            } else {
                getCaskData = [createCask(dimension.id, {x, y, z})]
            }
            world.setDynamicProperty('magical_brewery:cask_data', JSON.stringify(getCaskData))
        }
    });
});

world.beforeEvents.worldInitialize.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('ps:opd_cask', {
        onPlayerDestroy(e) {
            const {block, dimension} = e;
            deleteCask(dimension.id, block.location);
        }
    });
});

world.beforeEvents.worldInitialize.subscribe(eventData => {
    eventData.blockComponentRegistry.registerCustomComponent('ps:pi_cask_fill', {
        onPlayerInteract(e) {
            const {block, dimension, player} = e;

            const equipment = player.getComponent('equippable');
            const selectedItem = equipment.getEquipment('Mainhand');

            if (!player || !equipment || !selectedItem)  return;

            const {x,y,z} = block.location;
            let cask = findCask(dimension.id, {x, y, z})
            const fillLevel = block.permutation.getState("ps:fill_level");
            

            if(selectedItem.typeId === "ps:tasting_spoon"){
                
                if(fillLevel === 0){
                    player.sendMessage("The cask is empty.");
                }
                else{
                    const initialTaste = "The potion tastes of " + cask.potion_effects[0];
                    if(!cask.is_aged){
                        player.sendMessage(initialTaste);
                        player.sendMessage("It looks like it still needs time to age.");
                    }
                    else{
                        player.sendMessage(initialTaste + ", and has a hint of " + cask.potion_effects[cask.potion_effects -1].toLowerCase());
                        player.sendMessage("The potion has aged and is ready.");
                    }
                }
            }
            if(selectedItem.typeId === "ps:ageless_pocket_watch"){
                
                const agePhase = block.permutation.getState("ps:aging_phase");
                const newAge = agePhase !== 3 && fillLevel !== 0 ? agePhase+1 : agePhase;
                block.setPermutation(block.permutation.withState("ps:aging_phase", newAge));

                if(agePhase === 3 && !cask.is_aged){
                    const effectId = getEffectfromCask(block.getTags()[0])
                
                    console.log(effectId)
                    cask.potion_effects.push(effectId);
                    cask.is_aged = true;
                    updateCask(cask);
                }
                return;
            } 
            if(selectedItem.typeId === "minecraft:potion" || selectedItem.typeId === "minecraft:lingering_potion" 
                || selectedItem.typeId === "minecraft:splash_potion"){

                const potion = selectedItem.getComponent('minecraft:potion')
                
                if(fillLevel === 3 || potion === undefined) return;
                
                if(fillLevel === 0){
                    cask.potion_effects.push(potion.potionEffectType.id)
                    cask.potion_liquid = potion.potionLiquidType.id
                    cask.potion_modifier = potion.potionModifierType.id

                    updateCask(cask)
                    if(selectedItem.getLore().length > 0){
                        const lore = selectedItem.getLore();
                        
                    }
                    
                }

                if(!matchesPotion(cask, potion)) return;

                block.setPermutation(block.permutation.withState("ps:fill_level", fillLevel+1));
                
                const emptyBottle = new ItemStack("glass_bottle", 1)
                setMainHand(player, equipment, selectedItem, emptyBottle);

                return;
            }
            if(selectedItem.typeId === "minecraft:glass_bottle" && fillLevel !== 0){
                block.setPermutation(block.permutation.withState("ps:fill_level", fillLevel-1));

                const item = ItemStack.createPotion({
                    effect: cask.potion_effects[0],
                    liquid: cask.potion_liquid,
                    modifier: cask.potion_modifier,
                });
                
                if(cask.is_aged){
                    const newEffect = cask.potion_effects[cask.potion_effects.length-1].replace("_", " ") + " (2:00)"
                    console.log(cask.potion_effects[cask.potion_effects.length-1])
                    const lore = selectedItem.getLore();

                    lore.push(newEffect)
                    item.setLore(lore);
                    console.warn(item.getLore().length)
                    console.warn(item.getLore()[item.getLore().length -1].toString())

                }
                player.getComponent("inventory").container.addItem(item)

                if(block.permutation.getState("ps:fill_level") === 0){
                    cask.potion_effects.length = 0;
                    cask.potion_liquid = "";
                    cask.potion_modifier = "";
                    cask.is_aged = false;
                    
                    block.setPermutation(block.permutation.withState("ps:aging_phase", 0));
                    updateCask(cask)
                }
                return;
            }
        }
    });
});

//Database functions i.e CRUD
function createCask(dimension, {x, y, z}){
    let newCask = {
        dimensionId: dimension,
        location: {x, y, z},
        potion_effects: [],
        potion_liquid:"",
        potion_modifier: "",
        is_aged: false,
    }
    return newCask
}
function findCask(dimension, {x, y, z}){
    const caskData = JSON.parse(world.getDynamicProperty('magical_brewery:cask_data'));
    let cask;
    caskData.forEach(el => {
        if(el.dimensionId === dimension && JSON.stringify(el.location) === JSON.stringify({x, y, z})){
            cask = el;
            return;
        } 
    })
    return cask
}

function updateCask(cask){
    const caskData = JSON.parse(world.getDynamicProperty('magical_brewery:cask_data'));
    let caskIndex;
    for(let i = 0; i < caskData.length; i++){
        if(caskData[i].dimensionId === cask.dimensionId && JSON.stringify(caskData[i].location) === JSON.stringify(cask.location)){
            caskIndex = i;
            break;
        }
    }
    caskData[caskIndex].potion_effects = cask.potion_effects
    caskData[caskIndex].potion_liquid = cask.potion_liquid
    caskData[caskIndex].potion_modifier = cask.potion_modifier
    caskData[caskIndex].is_aged = cask.is_aged

    console.log("effects: " + caskData[caskIndex].potion_effects[0])
    console.log("liquid: " + caskData[caskIndex].potion_liquid)
    console.log("modifier: " + caskData[caskIndex].potion_modifier)
    world.setDynamicProperty('magical_brewery:cask_data', JSON.stringify(caskData))
}

function deleteCask(dimension, location){
    const caskData = JSON.parse(world.getDynamicProperty('magical_brewery:cask_data'));
    let caskIndex;

    for(let i = 0; i < caskData.length; i++){
        if(caskData[i].dimensionId === dimension && JSON.stringify(caskData[i].location) === JSON.stringify(location)){
            caskIndex = i;
            break;
        }
    }
    caskData.splice(caskIndex, 1);
    world.setDynamicProperty('magical_brewery:cask_data', JSON.stringify(caskData))
}

function matchesPotion(caskPotion, heldPotion){
    const matchesEffect = caskPotion.potion_effects[0] === heldPotion.potionEffectType.id;
    const matchesLiquid = caskPotion.potion_liquid === heldPotion.potionLiquidType.id;
    const matchesModifier = caskPotion.potion_modifier === heldPotion.potionModifierType.id;
    return matchesEffect && matchesLiquid &&  matchesModifier;
}

//From testing, block tags seem to be sorted alphabetically. So im having to rely on this. Its not pretty, its archaic, but what can you do
function getEffectfromCask(tag){
    let effect;
    switch(tag){
        case "Decay":
            effect = "Wither";
        break;
        case "Harming":
            effect = "Instant_Damage";
        break;
        case "Healing":
            effect = "Instant_Health";
        break;
        case "Leaping":
            effect = "Jump_Boost";
        break;
        case "Swiftness":
            effect = "Speed";
        break;
        default:
        effect = tag;
    }
    return effect;
}