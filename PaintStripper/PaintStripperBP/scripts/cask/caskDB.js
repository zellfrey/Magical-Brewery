import {world, system, ItemStack} from "@minecraft/server";

export function createCask(dimension, {x, y, z}){
    let newCask = {
        dimensionId: dimension,
        location: {x, y, z},
        potion_effects: [],
        potion_liquid:"",
        potion_modifier: "",
        age_start_tick: -1
    }
    return newCask
}
export function findCask(dimension, {x, y, z}){
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

export function updateCask(cask){
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
    caskData[caskIndex].age_start_tick = cask.age_start_tick

    world.setDynamicProperty('magical_brewery:cask_data', JSON.stringify(caskData))
}

export function deleteCask(dimension, location){
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
