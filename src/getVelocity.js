import SimplexNoise from 'simplex-noise';
import * as THREE from 'three';
const simplex = new SimplexNoise();

const dummy = new THREE.Vector3();
const offset = 0.1;
const gravityInverseStart = 0;

const getVelocity = (ox, oy, oz) => {
	const x = ox * 0.3;
	const y = oy * 0.3;
	const z = oz * 0.3;
	const t = performance.now() * 0.0001;
	dummy.x = simplex.noise4D(x - offset, y, z, t) - simplex.noise4D(x + offset, y, z, t);
	dummy.y = simplex.noise4D(x, y - offset, z, t) - simplex.noise4D(x, y + offset, z, t);
	dummy.z = simplex.noise4D(x, y, z - offset, t) - simplex.noise4D(x, y, z + offset, t);
	dummy.multiplyScalar(0.5);


	if (oy < gravityInverseStart) {
		dummy.y += -(oy - gravityInverseStart) * 1;
	}


	// distance to center
	const distance = Math.sqrt(ox * ox + oz * oz);
	//dummy.y += Math.pow(distance / 6, 2);

	// make emotes swirl around 0, 0, 3
	const angle = Math.atan2(ox, oz + 3);
	//dummy.x += Math.sin(angle + Math.PI * 0.5) * 1;
	//dummy.z += Math.cos(angle + Math.PI * 0.5) * 1;

	if (distance < 2) {
		dummy.x += Math.sin(angle) * (2 - distance / 2);
		dummy.z += Math.cos(angle) * (2 - distance / 2);
	}

	return dummy;
}

export default getVelocity;