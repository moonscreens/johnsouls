import TwitchChat from "twitch-chat-emotes-threejs";
import * as THREE from "three";
import "./main.css";

/*
** connect to twitch chat
*/

// a default array of twitch channels to join
let channels = ['moonmoon'];

// the following few lines of code will allow you to add ?channels=channel1,channel2,channel3 to the URL in order to override the default array of channels
const query_vars = {};
const query_parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
	query_vars[key] = value;
});

if (query_vars.channels) {
	channels = query_vars.channels.split(',');
}

const ChatInstance = new TwitchChat({
	// If using planes, consider using MeshBasicMaterial instead of SpriteMaterial
	materialType: THREE.MeshBasicMaterial,

	// Passed to material options
	materialOptions: {
		transparent: true,
		side: THREE.DoubleSide,
	},

	channels,
	maximumEmoteLimit: 3,
})

/*
** Initiate ThreejS scene
*/

const camera = new THREE.PerspectiveCamera(
	70,
	window.innerWidth / window.innerHeight,
	0.1,
	1000
);
camera.position.z = 5;
camera.position.y = 0.75;
camera.lookAt(0, 2.5, 0);

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.setSize(window.innerWidth, window.innerHeight);

function resize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('DOMContentLoaded', () => {
	window.addEventListener('resize', resize);
	if (query_vars.stats) document.body.appendChild(stats.dom);
	document.body.appendChild(renderer.domElement);
	draw();
})

/*
** Draw loop
*/
let lastFrame = Date.now();
function draw() {
	if (query_vars.stats) stats.begin();
	requestAnimationFrame(draw);
	const delta = (Date.now() - lastFrame) / 1000;

	cloudUniforms.u_time.value += delta * 2;

	for (let index = sceneEmoteArray.length - 1; index >= 0; index--) {
		const element = sceneEmoteArray[index];
		if (element.timestamp + element.lifespan < Date.now()) {
			sceneEmoteArray.splice(index, 1);
			scene.remove(element);
		} else {
			element.update();
		}
	}
	lastFrame = Date.now();


	renderer.render(scene, camera);
	if (query_vars.stats) stats.end();
};


/*
** Handle Twitch Chat Emotes
*/
const sceneEmoteArray = [];
const emoteGeometry = new THREE.PlaneGeometry(1, 1);
ChatInstance.listen((emotes) => {
	const group = new THREE.Group();
	group.position.z = johnSoulsMesh.position.z - 1;
	group.position.y = johnSoulsMesh.position.y;

	//give the group a random normalized offset
	const offset = new THREE.Vector3(
		Math.random() * 2 - 1,
		Math.random() * 2 - 1,
		Math.random() * 2 - 1
	).normalize().multiplyScalar(0.25);

	const rotationOffset = new THREE.Vector3(
		Math.random() * 2 - 1,
		Math.random() * 2 - 1,
		Math.random() * 2 - 1
	).normalize().multiplyScalar(0.5);

	group.scale.setScalar(0.5);
	group.lifespan = 10000;
	group.timestamp = Date.now();

	group.flipX = Math.random() > 0.5 ? 1 : -1;
	group.flipY = Math.random() > 0.5 ? 0 : -1;

	if (group.flipY < 0) {
		offset.y -= 1;
	}

	let i = 0;
	emotes.forEach((emote) => {
		const sprite = new THREE.Mesh(emoteGeometry, emote.material);
		sprite.position.x = i;
		group.add(sprite);
		i++;
	})


	group.update = () => { // called every frame
		let progress = (Date.now() - group.timestamp) / group.lifespan;
		group.position.z = johnSoulsMesh.position.z - 1 + progress * 9 + offset.z;
		group.position.x = ((Math.sin(progress * Math.PI * 2) * 3) * group.flipX + offset.x) * (group.flipY ? 2 : 1);
		group.position.y = Math.sin(progress * Math.PI * 2) * 1 * group.flipY + johnSoulsMesh.position.y + offset.y;

		group.rotation.x = progress * Math.PI * 2 + rotationOffset.x;
		group.rotation.z = progress * Math.PI * 2 + rotationOffset.z;
	}

	scene.add(group);
	sceneEmoteArray.push(group);
});



/*
** Set up scene
*/

import johnsmoulsURL from "./johnsmouls.png";
const johnSoulsPlane = new THREE.PlaneBufferGeometry(3, 6);

const johnSoulsMesh = new THREE.Mesh(
	johnSoulsPlane,
	new THREE.MeshBasicMaterial({
		map: new THREE.TextureLoader().load(johnsmoulsURL),
		transparent: true,
	})
);
johnSoulsMesh.position.set(0, 3, -3);
scene.add(johnSoulsMesh);

//const johnSoulsHelper = new THREE.BoxHelper(johnSoulsMesh);
//scene.add(johnSoulsHelper);

const JohnHat = new THREE.Mesh(
	new THREE.PlaneBufferGeometry(8, 8),
	new THREE.MeshBasicMaterial({
		color: 0xff0000,
	}),
)
JohnHat.position.set(0, 9, -1);
JohnHat.rotation.z = Math.PI / 4;
johnSoulsMesh.add(JohnHat);

const wallSize = 20;
const groundSize = 13;

import floorImageURL from "./floor.png";
const groundPlane = new THREE.Mesh(
	new THREE.PlaneBufferGeometry(groundSize * 2, groundSize),
	new THREE.MeshBasicMaterial({
		map: new THREE.TextureLoader().load(floorImageURL),
	})
);
groundPlane.rotation.x = -Math.PI / 2;
scene.add(groundPlane);
//const groundHelper = new THREE.BoxHelper(groundPlane, 0xff0000);
//scene.add(groundHelper);


import wallImageURL from "./background.png";
const wallPlane = new THREE.Mesh(
	new THREE.PlaneBufferGeometry(wallSize * 2, wallSize),
	new THREE.MeshBasicMaterial({
		//color: 0x555555,
		map: new THREE.TextureLoader().load(wallImageURL),
		transparent: true,
		opacity: 0.5,
	})
);
wallPlane.position.z = -groundSize / 2;
wallPlane.position.y = wallSize / 2;
scene.add(wallPlane);
//const wallHelper = new THREE.BoxHelper(wallPlane, 0x000fff);
//scene.add(wallHelper);


scene.background = new THREE.Color(0x000E16);

const cloudGeometry = new THREE.PlaneBufferGeometry(160, 100);
const cloudFragShader = document.getElementById('simplexFragmentShader').textContent;
const cloudVertShader = document.getElementById('SimpleVertexShader').textContent;
const cloudUniforms = {
	u_time: { value: Math.random()*10000 },
	u_resolution: { value: 512 },
}
const cloudMaterial = new THREE.ShaderMaterial({
	uniforms: cloudUniforms,
	vertexShader: cloudVertShader,
	fragmentShader: cloudFragShader,
	transparent: false,
})
const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
cloud.position.y = wallPlane.position.y * 2;
cloud.position.z = wallPlane.position.z;
cloud.rotation.x = Math.PI / 2.9;
scene.add(cloud);
