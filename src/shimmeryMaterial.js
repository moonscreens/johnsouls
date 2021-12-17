import * as THREE from 'three';
import webGLSimplex3DNoise from './simplex3DShaderCode';

function generateShimmeryMat(options) {
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

	const shimmeryMat = new THREE.MeshBasicMaterial({
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
			float bnScale = 3.0;
	
			vec3 transformed = position + vec3(
				snoiseOffset(vec3(bnScale * 2.0, 0, 0), bnScale * 2.0, 0.2),
				snoiseOffset(vec3(0, bnScale, 0), bnScale, 0.2),
				1.0+snoiseOffset(vec3(0, bnScale, 0), bnScale, 0.2)
			) * .08;
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



export default generateShimmeryMat;