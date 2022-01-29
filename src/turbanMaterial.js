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
			'#include <begin_vertex>',
			`
			// scales based on how high the vertex is from the base
			float transformScale = (position.y + 2.0) / 5.0;

			float time = u_time * 0.1;
			float hatNoise = snoise(vec3(position.y * 0.5 - time, position.x * 0.1, position.z * 0.1 + time * 0.25));
			vec3 transformed = position + vec3(
				-sin(hatNoise * 3.14),
				0,
				cos(hatNoise * 3.14)
			) * (transformScale * transformScale) * 1.0;
			`,
		);

		shimmeryMat.userData.shader = shader;

		shader.fragmentShader = `
		uniform float u_time;
		${webGLSimplex3DNoise.split('float snoiseOffset')[0]}
		
		${shader.fragmentShader.replace('#include <alphamap_fragment>',`
			#include <alphamap_fragment>

			float alphaMult = 0.0;

			float bnScale = 3.0;
			float timeScale = 0.3;
			alphaMult += (1.0 + 0.5 * snoise(vec3(vUv.x * bnScale, vUv.y * bnScale - u_time * timeScale,  u_time * timeScale * 0.1)));
			
			float bnScale2 = bnScale * 3.0;
			float timeScale2 = timeScale * 1.5;
			alphaMult += (1.0 + 0.5 * snoise(vec3(vUv.x * bnScale2, vUv.y * bnScale2 - u_time * timeScale2, u_time * -timeScale2)));

			float bnScale3 = bnScale2 * 1.0;
			float timeScale3 = timeScale2 * 0.25;
			alphaMult -= 0.5 * (1.0 + 0.5 * snoise(vec3(vUv.x * bnScale3, vUv.y * bnScale3, u_time * timeScale3)));

			diffuseColor.a *= alphaMult / 2.0;
		`)}`;
	};

	// Make sure WebGLRenderer doesn't reuse a single program
	shimmeryMat.customProgramCacheKey = function () {
		return parseInt(window.shaderPID++); // some random ish number
	};

	return shimmeryMat;
}



export default generateTurbanMat;