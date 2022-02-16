import * as THREE from 'three';
import webGLSimplex3DNoise from './simplex3DShaderCode';

const mesh = new THREE.Group();

const canvas = document.createElement('canvas');
canvas.height = canvas.width = 32;
const material = new THREE.MeshBasicMaterial({
	map: new THREE.Texture(canvas),
	transparent: true,
	side: THREE.BackSide,
});

let lastFrame = Date.now();
const tick = () => {
	lastFrame = Date.now();
	if (uniforms) {
		uniforms.u_time.value = performance.now() / 1000;
	}
	window.requestAnimationFrame(tick);
}
let uniforms = null;

material.onBeforeCompile = function (shader) {
	shader.uniforms.u_time = { value: Math.random() * 1000 };
	uniforms = shader.uniforms;
	tick();
	material.userData.shader = shader;
	shader.vertexShader = shader.vertexShader.replace(
		'void main()',
		`
			varying vec4 vWorldPosition;
			varying vec3 vNormal;
			void main()
		`);
	shader.vertexShader = shader.vertexShader.replace(
		'#include <begin_vertex>',
		`
			#include <begin_vertex>
			vWorldPosition = modelMatrix * vec4(position, 1.0);
			vNormal = normal;
		`);

	shader.fragmentShader = `
	uniform float u_time;
	varying vec4 vWorldPosition;
	${webGLSimplex3DNoise.split('float snoiseOffset')[0]}
	
	${shader.fragmentShader.replace('#include <alphamap_fragment>', `
		#include <alphamap_fragment>

		vec3 dim = vec3(0.0, 0.0, 0.0);
		vec3 highlight = vec3(255.0, 255.0, 255.0);

		vec3 st = vWorldPosition.xyz;
		if (vWorldPosition.z > 0.0) {
			st.xyz *= 2.0;
		} else {
			st *= 0.025;
		}

		float rotational_noise = snoise(vec3(st.x * 0.8, st.y * 0.8 - u_time * .1, st.z + u_time * .01)) * 1.5;
		rotational_noise += snoise(vec3(st.x * 0.5, st.y * 0.5 - u_time * .1, st.z * 0.5 + u_time * .01)) * 3.0;
		float uv = cos(rotational_noise * PI * 0.001) * (rotational_noise * 0.5 + 0.5);

		float alpha = snoise(vec3(st.x, st.y + uv, st.z + u_time * 0.1)) * 0.5 + 0.5;

		alpha -= (snoise(vec3(st.x * 5.0 + uv, st.y * 5.0, st.z + u_time * 0.5) * 0.5) * 0.5 + 0.5) * 0.1;
		alpha -= (snoise(vec3(st.x * 5.0 + uv, st.y * 5.0, st.z + u_time * 0.25) * 0.5) * 0.5 + 0.5) * 0.1;

		// fade higher pixels out
		alpha *= max(0.0, min(1.0, 1.0 - vWorldPosition.y * 0.0025));

		float fadeDistance = 1.5; // ThreeJS units
		if (vWorldPosition.z > 0.0) {
			alpha *= max(0.0, min(1.0, 1.0 - vWorldPosition.y * 0.25));
			alpha *= pow(max(0.0, min(1.0, smoothstep(0.0, 1.0, distance(vWorldPosition.xy, vec2(0.0, 1.95)) / fadeDistance))), 4.0);
		}

		diffuseColor = vec4(
			vec3(0.5, 0.75, 1.0),
			(pow(alpha, 1.0))
		);
	`)}`;
};

// Make sure WebGLRenderer doesn't reuse a single program
material.customProgramCacheKey = function () {
	return parseInt(window.shaderPID++); // some random ish number
};

const sphere = new THREE.Mesh(
	new THREE.SphereGeometry(150, 32, 32),
	material
);
sphere.position.z = -7;
sphere.position.y = 74;
mesh.add(sphere);

const foreground = new THREE.Mesh(
	new THREE.PlaneBufferGeometry(20, 20),
	material
);
foreground.rotation.y = Math.PI;
foreground.position.z = 4;
mesh.add(foreground);

export default mesh;