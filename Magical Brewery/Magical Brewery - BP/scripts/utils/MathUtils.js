import {world, system, ItemStack } from "@minecraft/server";

export class MathUtils {

	static getRndFloat(min, max) {
  		return (Math.floor(Math.random() * (max - min) ) + min)/10;
	}

    static getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

	static addVectorFromBlockFace(face, blockCentre){
        switch(face){
            case "north":
                blockCentre.z += 0.38;
            break;
            case "south":
                blockCentre.z -= 0.38;
            break;
            case "west":
                blockCentre.x += 0.38;
            break;
            case "east":
                blockCentre.x -= 0.38;
            break;
        }
        return blockCentre;
    }

	static addRandomVectorBlockFace(face, particleSpawnVector3){

        if(face === "north" || face === "south"){
            particleSpawnVector3.x += MathUtils.getRndFloat(-2.5, 2.5)
        }

        else if(face === "west" || face === "east"){
            particleSpawnVector3.z += MathUtils.getRndFloat(-2.5, 2.5)
        }

        return particleSpawnVector3
    }

	static getParticleRandomVectors3(location){

        let particleSpawnVector3 = location;
        particleSpawnVector3.x += MathUtils.getRndFloat(-2, 2)
        particleSpawnVector3.y += MathUtils.getRndFloat(-2, 2) + 0.5;
        particleSpawnVector3.z += MathUtils.getRndFloat(-2, 2);

        return particleSpawnVector3;
    }

    static equalsVector3(vector1, vector2){

        let equalsX = vector1.x === vector2.x;
        let equalsY = vector1.y === vector2.y;
        let equalsZ = vector1.z === vector2.z;

        return equalsX && equalsY && equalsZ;
    }
}

