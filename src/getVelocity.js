import SimplexNoise from 'simplex-noise';
import * as THREE from 'three';
const simplex = new SimplexNoise();

const dummy = new THREE.Vector3();
const offset = 0.1;
const getVelocity = (ox, oy, oz) => {
	const x = ox * 0.1;
	const y = oy * 0.1;
	const z = oz * 0.1;
	const t = performance.now() * 0.0001;
	dummy.x = simplex.noise4D(x - offset, y, z, t) - simplex.noise4D(x + offset, y, z, t);
	dummy.y = simplex.noise4D(x, y - offset, z, t) - simplex.noise4D(x, y + offset, z, t);
	dummy.z = simplex.noise4D(x, y, z - offset, t) - simplex.noise4D(x, y, z + offset, t);

	return dummy;
}

export default getVelocity;