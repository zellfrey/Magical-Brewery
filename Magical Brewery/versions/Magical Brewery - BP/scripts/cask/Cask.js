import {world, system, ItemStack, MolangVariableMap} from "@minecraft/server";
import {POTION_POTENCY_LEVELS, POTION_EFFECTS, getPotencyLevel} from "../potion/potionEffects.js";
import {MagicalBreweryPotion} from "../potion/MagicalBreweryPotion.js";
import {MinecraftPotion} from "../potion/MinecraftPotion.js";
import {Seal} from "../cask/Seal.js";
import {MathUtils} from "../utils/MathUtils.js";
import {setMainHand} from '../utils/containerUtils.js';

export class Cask {

    static casks = []

    constructor(dimensionID, location){

        this.dimensionID = dimensionID;
        this.location = location;
        this.potion_effects = [];
        //Delivery Type
        this.potion_liquid = "";
        //Not used, as modifier is now used in the effectType id, but keeping as it may break some old worlds
        this.potion_modifier = "";
        this.age_start_tick = -1;
        this.seal = {};
        Cask.casks.push(this)
    }

    setCaskPotion(potion, extraEffects){
        this.potion_effects.push(potion["effectID"])
        this.potion_liquid = potion["deliveryType"]
        
        if(extraEffects.length > 0){
            extraEffects.forEach(effect => {this.potion_effects.push(effect)})
        }
    }

    resetCaskPotion(){
        this.potion_effects.length = 0;
        this.potion_liquid = "";
        this.potion_modifier = "";
        this.age_start_tick = -1
    }

    matchesCaskPotion(potion, extraEffects){
        const matchesEffect = this.potion_effects[0] === potion["effectID"];
        const matchesLiquid = this.potion_liquid === potion["deliveryType"];

        let matchesExtraEffects;
        if(this.potion_effects.length < 1 || extraEffects.length === 0){
            matchesExtraEffects = true;
        } 
        else{
            const caskExtraEffects = this.potion_effects.slice(1).sort();
            const potionExtraEffects = extraEffects.sort();
            for(let i = 0; i < caskExtraEffects.length; i++){
                matchesExtraEffects = caskExtraEffects[i] === potionExtraEffects[i] ? true : false;
                if(!matchesExtraEffects) break;
            }
        }
        return matchesEffect && matchesLiquid && matchesExtraEffects;
    }

    getFirstPotionString(){
        
        const potionRootID = this.potion_effects[0].split(":")[0]
        const effectID = this.potion_effects[0].split(":")[1].split("_")

        let caskPotionIdString;

        if(potionRootID === "minecraft"){
           caskPotionIdString = MinecraftPotion.getEffectString(effectID)
        }
        else{
            caskPotionIdString = MagicalBreweryPotion.getEffectString(effectID)
        }
        
        return caskPotionIdString;
    }

    canCaskAge(caskPotionType){
        let canAge = true;
        const effectId= caskParamEffectToEffectId(caskPotionType.replace("_", ""))
        
        if(effectId === this.potion_effects[0]){
            canAge = false;
        }
        else{
            for(let i = 1; i < this.potion_effects.length; i++){
                const effect = this.potion_effects[i].split(' ');
                if(effect[0] === "Instant"){

                    if(getPotencyLevel(effect) !== 0) effect.pop()
                        
                    if(POTION_EFFECTS[caskPotionType].effects === effect.join(" ")){
                        canAge = false;
                        break;
                    }

                }else{
                    effect.pop();
                    if(getPotencyLevel(effect) !== 0) effect.pop()

                    if(POTION_EFFECTS[caskPotionType].effects === effect.join(" ")){
                    canAge = false;
                    break;
                    }
                }
            }
        }
        return canAge
    }

    fillCask(selectedItem, block, dimension, player){
    
        const fillLevel = block.permutation.getState("magical_brewery:fill_level");
        const aged = block.permutation.getState("magical_brewery:aged");
        let potion = {"effectID": "", "deliveryType": ""};
        
        if(selectedItem.hasTag("magical_brewery:potion")){
		
		    potion = MagicalBreweryPotion.getPotionProperties(selectedItem, potion)
		
        }else{

            potion = MinecraftPotion.getPotionProperties(selectedItem, potion)

        }

        if(fillLevel === 3 || aged || potion["effectID"] === "None") return;

        if(fillLevel === 0 && potion["effectID"]){
            this.setCaskPotion(potion, selectedItem.getLore())
        }

        if(!this.matchesCaskPotion(potion, selectedItem.getLore())) return;
                        
                    
        this.updateCaskBlock(block, fillLevel, dimension)

        const equipment = player.getComponent('equippable');
        const emptyBottle = new ItemStack("glass_bottle", 1);
        setMainHand(player, equipment, selectedItem, emptyBottle);

        return;
    }

    updateCaskBlock(block, fillLevel, dimension){
    
        block.setPermutation(block.permutation.withState("magical_brewery:fill_level", fillLevel+1));
        
        //honestly just pulling numbers out of my ass to see what works
        const pitch = fillLevel * 0.2 + 0.3
        dimension.playSound("bottle.empty", block.location, {volume: 0.8, pitch: pitch});
    
        const seal = Seal.findSeal(block)
    
        Seal.setSeal(seal, this)
        this.age_start_tick = system.currentTick
        Cask.updateCask(this)
    }

    createAgeingFeedback(block){
    
        const rgba = block.getComponent("minecraft:map_color").color
        const molang = new MolangVariableMap();
        molang.setColorRGBA("variable.color", { red: rgba.red, green: rgba.green, blue: rgba.blue, alpha: rgba.alpha});
        block.dimension.spawnParticle("minecraft:mobspell_emitter", block.center(), molang);

        if(Math.random() <= 0.1){
            const vol = 0.7 + (this.potion_effects.length/10);
            block.dimension.playSound("magical_brewery:block.cask.creak", block.location, {volume: vol, pitch: 1.5});
        }
    }

    checkSeal(block, timeToAge){
        let seal = Seal.findSeal(block)

        //If there is no seal the lifetime will remain the same, reducing the ability of affecting the age
        if(Seal.isSameType(seal, this)){

            if(MathUtils.equalsVector3(seal.location, this.seal.location)){
                
                this.seal.addLifetime(timeToAge, this)
            }
            else{
                const previousSealLifeTime = this.seal.lifetime;
                Seal.setSeal(seal, this)
                this.seal.lifetime = previousSealLifeTime;
            }
        
        }
        else if(seal){
            Seal.setSeal(seal, this)
        }
    }


    addAgedPotionEffect(caskPotionType){
        
        const potionEffect = POTION_EFFECTS[caskPotionType]
        let effectName = potionEffect.effects
        let sealType = this.seal.type;
        let sealStrength = this.seal.strength;

        if(sealType === "potency"){
            let potionPotency;

            if(effectName.includes("Instant")){
                potionPotency = " " + POTION_POTENCY_LEVELS[sealStrength];

            }
            else if(effectName === "Slowness"){
                potionPotency = " " + POTION_POTENCY_LEVELS[sealStrength+1] + 
                " (" + potionEffect.duration_potency[sealStrength-1] +  ")";

            }
            else if(potionEffect.duration_potency.length === 0){
                potionPotency =" (" + potionEffect.duration_long[0] +  ")";

            }else{
                potionPotency = " " + POTION_POTENCY_LEVELS[sealStrength] + 
                " (" + potionEffect.duration_potency[sealStrength-1] +  ")";
            }
            effectName += potionPotency;
        }
        
        else{
            if(potionEffect.duration_long.length !== 0){
                const effectTime =" (" + potionEffect.duration_long[sealStrength] +  ")";
                effectName += effectTime;
            }
        }
        this.potion_effects.push(effectName);
    }

    setCaskAge(block){

        block.setPermutation(block.permutation.withState("magical_brewery:aged", true));
        const particleLocation = block.center();
        particleLocation.y += 0.4
        block.dimension.spawnParticle("minecraft:crop_growth_emitter", particleLocation);

    }

    deleteCaskSeal(){
        if(Object.keys(this.seal.location).length === 0) return;
        
        if(this.seal.affectCaskAgeing){
            this.seal.destroySealBlock(this.dimensionID)
            this.seal = {};
        }
    }
    static createCask(blockDimensionID, blockLocation){

        new Cask(blockDimensionID, blockLocation)
        let caskJSONData = world.getDynamicProperty('magical_brewery:cask_data')
        if (caskJSONData) {
            caskJSONData = JSON.parse(caskJSONData)
            caskJSONData.push(Cask.casks[Cask.casks.length-1])
        } else {
            caskJSONData = [Cask.casks[0]]
        }
        world.setDynamicProperty('magical_brewery:cask_data', JSON.stringify(caskJSONData))

    }

    static updateCask(cask){

        const caskJSONData = JSON.parse(world.getDynamicProperty('magical_brewery:cask_data'));

        const caskIndex = caskJSONData.findIndex(el => el.dimensionID === cask.dimensionID && MathUtils.equalsVector3(el.location, cask.location))

        caskJSONData[caskIndex] = cask;
        world.setDynamicProperty('magical_brewery:cask_data', JSON.stringify(caskJSONData))
    }

    static destroyCask(blockDimensionID, blockLocation){
        const index = Cask.findIndexCask(blockDimensionID, blockLocation)

        if(index === -1) return;
        
        Cask.casks.splice(index, 1)
        
        const caskJSONData = JSON.parse(world.getDynamicProperty('magical_brewery:cask_data'));
        caskJSONData.splice(index, 1);

        world.setDynamicProperty('magical_brewery:cask_data', JSON.stringify(caskJSONData));
    }

    static findIndexCask(blockDimensionID, blockLocation){
        const index = Cask.casks.findIndex(el => MathUtils.equalsVector3(el.location, blockLocation) && el.dimensionID === blockDimensionID);
        return index;                                            
    }

}


function caskParamEffectToEffectId(caskParamEffect){
    let name;
    switch(caskParamEffect){
        case "Slowness":
            name = "Slowing";
        break;
        case "WaterBreathing":
            name = "WaterBreath";
        break;
        // case "Decay":
        //     name = "Wither";
        // break;
        default:
        name = caskParamEffect;
    }
    return name;
}

