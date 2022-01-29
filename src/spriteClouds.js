import * as THREE from 'three';
import webGLSimplex3DNoise from './simplex3DShaderCode';

const mesh = new THREE.Group();

const geometry = new THREE.PlaneGeometry(1000, 1000);
const canvas = document.createElement('canvas');
canvas.height = canvas.width = 32;
const material = new THREE.MeshBasicMaterial({
	map: new THREE.Texture(canvas),
	transparent: true,
});

let lastFrame = Date.now();
const tick = () => {
	const delta = (Date.now() - lastFrame) / 1000;
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

		vec3 st = vWorldPosition.xyz * 0.05;

		float radians = snoise(vec3(st.x, st.y, st.z + u_time * .1));
		radians *= radians;
		radians *=  PI;
		vec2 uv = vec2(cos(radians), sin(radians)) * 0.2;
		float color = snoise(vec3(st.x + uv.x, st.y + uv.y - u_time * 0.1, vWorldPosition.z + u_time * 0.1)) * 0.25 + 0.5;
		

		//color += snoise(vec3(vWorldPosition.x * 0.2 + uv.x, vWorldPosition.y * 0.2 + uv.y - u_time * 0.2, vWorldPosition.z + u_time * 0.3)) * 0.25;

		float alpha = 1.0;
		
		// fade higher pixels out
		alpha *= max(0.0, min(1.0, 1.0 - vWorldPosition.y * 0.04));
		
		// fade out a "tunnel" close to the x/y center
		alpha *= max(0.0, min(1.0, distance(st.xy, vec2(0.0, 0.0)) * 0.4));

		// fade in further pixels
		alpha = alpha + min(1.0, max(0.0, (-(vWorldPosition.z + 10.0) * .0005)));

		diffuseColor = vec4(
			0.45,
			0.9,
			1.49,
			alpha * color
		);
	`)}`;
};

// Make sure WebGLRenderer doesn't reuse a single program
material.customProgramCacheKey = function () {
	return parseInt(window.shaderPID++); // some random ish number
};

for (let index = 0; index < 10; index++) {
	const plane = new THREE.Mesh(geometry, material);
	plane.position.z = -index * 15 - 10;
	mesh.add(plane);
}

export default mesh;