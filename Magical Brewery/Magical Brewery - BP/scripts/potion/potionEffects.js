export const POTION_POTENCY_LEVELS = ["I", "II", "III", "IV", "V", "VI"]
export const POTION_DURATION_LEVELS = ["long", "strong", "xlong", "xstrong"]
export const ON_DEATH_EFFECTS= ["minecraft:oozing", "minecraft:weaving", "minecraft:wind_charged"];
export const ON_HIT_EFFECTS= ["minecraft:infested"];

//instant potions have 1 element for the array
//Potions with long duration, 0th element represent base effect time, 1st is longevity
//If a potion doesnt have a potency variant, it will fallback onto the base effect time in duration_long
export const POTION_EFFECTS = {
    // "Decay": {
    //     effects: "Wither",
    //     duration_long: ["0:40", "1:00", "2:00"], 
    //     duration_potency: [],
    // },
    "Harming": {
        effects: "Instant Damage",
        duration_long: [],
        duration_potency: [],
    },
    "Healing": {
        effects: "Instant Health",
        duration_long: [],
        duration_potency: [],
    },
    "Invisibility": {
        effects: "Invisibility",
        duration_long: ["3:00", "8:00", "15:00"],
        duration_potency: [],
    },
    "Leaping": {
        effects: "Jump Boost",
        duration_long: ["3:00", "8:00", "15:00"],
        duration_potency: ["1:30", "1:30"],
    },
    "Poison": {
        effects: "Poison",
        duration_long: ["0:45", "2:00", "3:30"],
        duration_potency: ["0:22", "0:22"],
    },
    "Regeneration": {
        effects: "Regeneration",
        duration_long: ["0:45", "2:00", "3:30"],
        duration_potency: ["0:22","0:22"],
    },
    "Fire_Resistance": {
        effects: "Fire Resistance",
        duration_long: ["3:00", "8:00", "15:00"],
        duration_potency: [],
    },
    "Slow_Falling": {
        effects: "Slow Falling",
        duration_long: ["1:30", "4:00", "7:00"],
        duration_potency: [],
    },
    "Slowness": {
        effects: "Slowness",
        duration_long: ["1:30", "4:00", "7:00"],
        duration_potency: ["0:20", "0:20"],
    },
    "Strength": {
        effects: "Strength",
        duration_long: ["3:00", "8:00", "15:00"],
        duration_potency: ["1:30", "1:30"],
    },
    "Swiftness": {
        effects: "Speed",
        duration_long: ["3:00", "8:00", "15:00"],
        duration_potency: ["1:30", "1:30"],
    },
    "Turtle_Master": {
        effects: ["Slowness", "Resistance"],
        duration_long: ["0:20", "0:40", "1:10"],
        duration_potency: ["0:20", "0:20"], 
    },
    "Night_Vision": {
        effects: "Night Vision",
        duration_long: ["3:00", "8:00", "15:00"],
        duration_potency: [],
    },
    "Water_Breathing": {
        effects: "Water Breathing",
        duration_long: ["3:00", "8:00", "15:00"],
        duration_potency: [],
    },
    "Weakness": {
        effects: "Weakness",
        duration_long: ["1:30", "4:00", "7:00"],
        duration_potency: [],
    },
    "Oozing": {
        effects: "Oozing",
        duration_long: ["3:00", "8:00", "15:00"],
        duration_potency: ["1:30", "1:30"],
    },
    "Infested": {
        effects: "Infested",
        duration_long: ["3:00", "8:00", "15:00"],
        duration_potency: ["1:30", "1:30"],
    },
    "Weaving": {
        effects: "Weaving",
        duration_long: ["3:00", "8:00", "15:00"],
        duration_potency: ["1:30", "1:30"],
    },
    "Wind_Charged": {
        effects: "Wind Charged",
        duration_long: ["3:00", "8:00", "15:00"],
        duration_potency: ["1:30", "1:30"],
    },
  };

export function getPotencyLevel(effect){
    let potency = POTION_POTENCY_LEVELS.findIndex(el => el === effect[effect.length-1]);
    potency = potency !== -1 ? potency : 0

    return potency;
}


