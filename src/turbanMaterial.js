import * as THREE from 'three';
import webGLSimplex3DNoise from './simplex3DShaderCode';

function generateTurbanMat(options) {
	let lastFrame = Date.now();
	const tick = () => {
		const delta = (Date.now() - lastFrame) / 1000;
		lastFrame = Date.now();
		if (uniforms) {
			uniforms.u_time.value += delta;
		}
		window.requestAnimationFrame(tick);
	}
	let uniforms = null;

	const shimmeryMat = new THREE.MeshStandardMaterial({
		...options
	});
	shimmeryMat.onBeforeCompile = function (shader) {
		shader.uniforms.u_time = { value: Math.random() * 1000 };
		uniforms = shader.uniforms;
		tick();
		shader.vertexShader = `
			uniform float u_time;
			${webGLSimplex3DNoise}
			${shader.vertexShader}`;
		shader.vertexShader = shader.vertexShader.replace(
			'#include <displacementmap_vertex>',
			`
			#include <displacementmap_vertex>
			// scales based on how high the vertex is from the base
			float transformScale = max(0.0, (position.y + 2.0) / 5.0);

			float time = u_time * 0.065;
			float hatNoise = snoise(vec3(position.y * 0.5 - time, position.x * 0.1, position.z * 0.1 + time * 0.25));
			transformed += vec3(
				-sin(hatNoise * 3.14),
				0,
				cos(hatNoise * 3.14)
			) * (transformScale) * 1.0;
			`,
		);

		shimmeryMat.userData.shader = shader;
	};

	// Make sure WebGLRenderer doesn't reuse a single program
	shimmeryMat.customProgramCacheKey = function () {
		return parseInt(window.shaderPID++); // some random ish number
	};

	return shimmeryMat;
}



export default generateTurbanMat;