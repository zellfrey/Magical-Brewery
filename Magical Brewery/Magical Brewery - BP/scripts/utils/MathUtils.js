
export class MathUtils {

	static getRndFloat(min, max) {
  		return (Math.floor(Math.random() * (max - min) ) + min)/10;
	}

    static getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

    static degToRadRounded(degrees) {
        return degrees * (Math.PI / 180);
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

    static getVectorsCube(startingLocation, dimension, size){
        const heightMax = dimension.heightRange.max;
        const heightMin = dimension.heightRange.min;

        let validVectorsCube = [];
        
        for (let x = startingLocation.x; x < startingLocation.x + size; x++) {
            for (let y = startingLocation.y; y < startingLocation.y + size; y++) {
                for (let z = startingLocation.z; z < startingLocation.z + size; z++) {

                    if(y <= heightMin || y >= heightMax) continue;

                    validVectorsCube.push({ x: x, y: y, z: z })
                }
            }
        }
        return validVectorsCube;
    }

    static getHorizontalDirectionalVectors(degreeInterval){
        const directions = []

        for (let x = 0; x <= 359; x += degreeInterval) {
		
            let directionAngle;
            if(x % 90 === 0){
                switch(x){
					case 0:
                        directionAngle = {x:1, y:0, z:0};
                    break;
                    case 90:
                        directionAngle = {x:0, y:0, z:1};
                    break;
                    case 180:
                        directionAngle = {x:-1, y:0, z:0};
                    break;
                    case 270:
                        directionAngle = {x:0, y:0, z:-1};
                }
            }
            else{
                 directionAngle  = {
                                x:Math.fround(Math.cos(MathUtils.degToRadRounded(x))), 
                                y: 0, 
                                z: Math.fround(Math.sin(MathUtils.degToRadRounded(x)))
                            }         
            }
			//console.log(JSON.stringify(directionAngle) + `degrees ${x}`)
            directions.push(directionAngle)
        }
        return directions
    }

    static getVector3Sphere(vector2Directions, degreeInterval){

        let vector3Directions = [];
        //Up vectorDirection
        vector3Directions.push({x: 0, y: -1, z: 0})
		
        for (let i = 0; i < vector2Directions.length; i ++) {
            for (let j = degreeInterval ; j < 180; j += degreeInterval) {
                let vectorAngleY;
				
                if(j % 90 === 0){
					vectorAngleY = 0;
                }
                else{
                    vectorAngleY = Math.fround(-Math.cos(MathUtils.degToRadRounded(j)))        
                }
				
                let vector3 = {x: vector2Directions[i].x, y: vectorAngleY, z: vector2Directions[i].z}

                vector3Directions.push(vector3)
            }
        }
		
		//Down vectorDirection
        vector3Directions.push({x: 0, y: 1, z: 0})

        return vector3Directions;
    }

    static euclideanVector3Distance(x1, y1, z1, x2, y2, z2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2) + Math.pow(z2 - z1, 2));
    }
}

