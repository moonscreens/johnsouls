import * as THREE from 'three';
import webGLSimplex3DNoise from './simplex3DShaderCode';

function generateCloudMat(options) {
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

		shimmeryMat.userData.shader = shader;
		shader.fragmentShader = `
		uniform float u_time;
		${webGLSimplex3DNoise.split('float snoiseOffset')[0]}
		
		${shader.fragmentShader.replace('#include <alphamap_fragment>',`
			#include <alphamap_fragment>

			vec3 dim = vec3(0.0, 0.09, 0.149);

			// original vec3(1.0, 0.93, 0.43);
			vec3 highlight = vec3(0.045 * 1.4, 0.09 * 1.4, 0.149 * 1.4);
			
	
			vec2 st = vUv;
			st.x *= 1.0;
		
			vec3 color = vec3(0.0);
		
			// Scale the space in order to see the function
			st *= 10.;
	
			float alpha = .5 - snoise(vec3(st.x, st.y - u_time * 0.1, u_time * 0.01));
			float mixVariable = alpha;
			diffuseColor *= vec4(
				mix(dim.x, highlight.x, mixVariable),
				mix(dim.y, highlight.y, mixVariable),
				mix(dim.z, highlight.z, mixVariable),
				min(1.0, alpha) * 0.7
			);
		`)}`;
	};

	// Make sure WebGLRenderer doesn't reuse a single program
	shimmeryMat.customProgramCacheKey = function () {
		return parseInt(window.shaderPID++); // some random ish number
	};

	return shimmeryMat;
}



export default generateCloudMat;