import * as THREE from 'three';
import webGLSimplex3DNoise from './simplex3DShaderCode';

function generateCloudMat(options = {}) {
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

	const cloudMat = new THREE.MeshBasicMaterial({
		color: 0xffffff,
		...options,
	});
	cloudMat.onBeforeCompile = function (shader) {
		shader.uniforms.u_time = { value: Math.random() * 1000 };
		uniforms = shader.uniforms;
		tick();
		cloudMat.userData.shader = shader;
		shader.fragmentShader = `
		uniform float u_time;
		${webGLSimplex3DNoise.split('float snoiseOffset')[0]}
		
		${shader.fragmentShader.replace('#include <alphamap_fragment>',`
			#include <alphamap_fragment>

			vec3 dim = vec3(0.0, 0.09, 0.149);

			// original vec3(1.0, 0.93, 0.43);
			vec3 highlight = vec3(0.045, 0.09, 0.149) * 2.5;
			
	
			vec2 st = vUv;
			st.x *= 1.0;
		
			vec3 color = vec3(0.0);
		
			// Scale the space in order to see the function
			st *= 10.;
	
			float alpha = 1.0 - snoise(vec3(st.x, st.y - u_time * 0.1, u_time * 0.01)) * 0.5;
			float mixVariable = alpha;
			
			mixVariable += snoise(vec3(st.x * 2.0, st.y * 2.0, u_time * 0.01)) * 0.25;
			mixVariable += snoise(vec3(st.x * 4.0, st.y * 4.0, u_time * 0.01)) * 0.25;

			diffuseColor = vec4(
				mix(dim.x, highlight.x, mixVariable),
				mix(dim.y, highlight.y, mixVariable),
				mix(dim.z, highlight.z, mixVariable),
				1.0
			);
		`)}`;
	};

	// Make sure WebGLRenderer doesn't reuse a single program
	cloudMat.customProgramCacheKey = function () {
		return parseInt(window.shaderPID++); // some random ish number
	};

	return cloudMat;
}



export default generateCloudMat;