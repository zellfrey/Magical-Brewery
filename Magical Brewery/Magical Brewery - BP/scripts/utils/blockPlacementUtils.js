import {Direction} from "@minecraft/server"
import {MathUtils} from "../utils/MathUtils.js";

//Down,Up,North,South,West,East
const adjacentVectors = [{x: 0, y:-1, z:0},{x: 0, y:1, z:0},{x: 0, y:0, z:-1},{x: 0, y:0, z:1},{x: -1, y:0, z:0},{x: 1, y:0, z:0}]
const getRelativeBlockLocation = (l, aL) => ({x:l.x + aL.x, y:l.y + aL.y, z:l.z + aL.z });

//Down,Up,North,South,West,East
const blockFaceLocations = [{x: 0, y:1, z:0},{x: 0, y:-1, z:0},{x: 0, y:0, z:1},{x: 0, y:0, z:-1},{x: 1, y:0, z:0},{x: -1, y:0, z:0}]


//East, West, North, South
export const neighbouringCross = [{x:1,z:0},{x:-1,z:0},{x:0,z:-1},{x:0,z:1}]

export function getAdjacentBlock(source, face){
    const faceNum = Object.keys(Direction).indexOf(faceToUpperCase(face));
    const adjacentBlock = source.dimension.getBlock(getRelativeBlockLocation(source.location, adjacentVectors[faceNum]));
    return adjacentBlock;
}

//Gets the block that the non-solid block is attached to. E.g finds what the item frame is attached to
export function getBlockFromFace(source, face){
    const faceNum = Object.keys(Direction).indexOf(faceToUpperCase(face));
    const attachedBlock = source.dimension.getBlock(getRelativeBlockLocation(source.location, blockFaceLocations[faceNum]));
    return attachedBlock;
}

//Subtle change from mojang not allowing lowercase entries for the Direction Enum
function faceToUpperCase(face){
    return face.charAt(0).toUpperCase() + face.slice(1)
}

export function getAirBlockBox(location, dimension, potencyLevel){

    location.y += - potencyLevel
	location.x += - potencyLevel
	location.z += - potencyLevel

    const boxSize = 1 + potencyLevel*2

    let airBlockBox = MathUtils.getVectorsCube(location, dimension, boxSize)
                        .filter(vector =>{
                            const block = dimension.getBlock(vector);
                
                            if (block && (block.isAir) && dimension.isChunkLoaded(vector)) return true;
                        });

    return airBlockBox;
}