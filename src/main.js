import TwitchChat from "twitch-chat-emotes-threejs";
import * as THREE from "three";
import Stats from "stats-js";
import "./main.css";
import generateShimmeryMat from "./shimmeryMaterial";
import generateTurbanMat from "./turbanMaterial";
window.shaderPID = 10000;

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

let stats = false;
if (query_vars.stats) {
	stats = new Stats();
	stats.showPanel(1);
	document.body.appendChild(stats.dom);
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
	query_vars.fov ? Number(query_vars.fov) : 70,
	window.innerWidth / window.innerHeight,
	0.1,
	1000
);
camera.position.z = 5;
camera.position.y = 0.75;
camera.lookAt(0, 2.5, 0);

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ antialias: true });
window.maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

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

	for (let index = sceneEmoteArray.length - 1; index >= 0; index--) {
		const element = sceneEmoteArray[index];
		if (element.timestamp + element.lifespan < Date.now()) {
			sceneEmoteArray.splice(index, 1);
			scene.remove(element);
		} else {
			element.update(delta);
		}
	}
	lastFrame = Date.now();


	for (let i = 0; i < boxArts.length; i++) {
		const element = boxArts[i];
		const p = Date.now() / 10000 + (i / boxArts.length) * Math.PI * 2;
		element.position.x = Math.sin(p) * 5 + johnSoulsMesh.position.x;
		element.position.z = Math.cos(p) * 5 + johnSoulsMesh.position.z;
		element.rotation.z += delta * 0.1;
	}


	renderer.render(scene, camera);
	if (query_vars.stats) stats.end();
};


/*
** Handle Twitch Chat Emotes
*/

import getVelocity from "./getVelocity";

const sceneEmoteArray = [];
const emoteGeometry = new THREE.PlaneGeometry(1, 1);
ChatInstance.listen((emotes) => {
	const group = new THREE.Group();
	group.position.z = johnSoulsMesh.position.z;
	group.position.y = 2 + Math.random() * 4;


	group.lifespan = 10000;
	group.timestamp = Date.now();


	let i = 0;
	emotes.forEach((emote) => {
		const sprite = new THREE.Mesh(emoteGeometry, emote.material);
		sprite.position.x = i;
		group.add(sprite);
		i++;
	})

	const direction = Math.random() * Math.PI * 2;
	const distance = Math.random() * 4 + 2;
	group.position.x += Math.sin(direction) * distance * 2;
	group.position.z += Math.cos(direction) * distance;

	group.velocity = new THREE.Vector3();

	group.update = (delta) => { // called every frame
		let progress = (Date.now() - group.timestamp) / group.lifespan;

		if (progress <= emoteFadeLength) {
			group.scale.setScalar(Math.pow(progress * (1 / emoteFadeLength), 2) * emoteScale);
		} else if (progress >= 1 - emoteFadeLength) {
			group.scale.setScalar((1 - Math.pow((progress - (1 - emoteFadeLength)) * (1 / emoteFadeLength), 2)) * emoteScale);
		} else if (group.scale.x !== emoteScale) {
			group.scale.setScalar(emoteScale);
		}

		group.velocity.lerp(getVelocity(group.position.x, group.position.y, group.position.z), delta);
		group.position.set(
			group.position.x + group.velocity.x * delta,
			group.position.y + group.velocity.y * delta,
			group.position.z + group.velocity.z * delta,
		)
	}

	scene.add(group);
	sceneEmoteArray.push(group);
});

const emoteFadeLength = 0.1;
const emoteScale = 0.3;


/*
** Set up scene
*/

import johnsmoulsURL from "./johnsmouls.png";
import johnsmoulsHighlightURL from "./johnsmoulsCutout.png";

const johnCanvas = document.createElement('canvas');
const johnContext = johnCanvas.getContext('2d');
const johnImage = new Image();
johnImage.src = johnsmoulsURL;
johnImage.onload = () => {
	johnCanvas.width = johnImage.width;
	johnCanvas.height = johnImage.height;
	if (chairImage.complete) {
		johnContext.drawImage(chairImage, 0, 0);
	}
	johnContext.drawImage(johnImage, 0, 0);
	johnTexture.needsUpdate = true;
};

import johnChairURL from "./johnChair.png";
const chairImage = new Image();
chairImage.src = johnChairURL;
chairImage.onload = () => {
	chairImage.width = johnImage.width;
	chairImage.height = johnImage.height;
	johnContext.drawImage(chairImage, 0, 0);
	if (johnImage.complete) {
		johnContext.drawImage(johnImage, 0, 0);
	}
	johnTexture.needsUpdate = true;
};

const JohnWidth = 3.5;
const JohnHeight = JohnWidth * 2;
const johnSoulsPlane = new THREE.PlaneBufferGeometry(JohnWidth, JohnHeight, 1, 1);
const johnTexture = new THREE.Texture(johnCanvas);

const johnSoulsMesh = new THREE.Mesh(
	johnSoulsPlane,
	new THREE.MeshBasicMaterial({
		map: johnTexture,
		transparent: true,
		opacity: query_vars.nojohn !== undefined ? 0 : 1,
	})
);
const johnSoulsHighlight = new THREE.Mesh(
	johnSoulsPlane,
	generateShimmeryMat({
		map: new THREE.TextureLoader().load(johnsmoulsHighlightURL),
		transparent: true,
		opacity: 1,
		blending: THREE.AdditiveBlending,
	})
);
johnSoulsHighlight.position.z = 0.025;
johnSoulsMesh.add(johnSoulsHighlight);
johnSoulsMesh.position.set(0, 3.02, -3);
scene.add(johnSoulsMesh);

const hatSize = 4;
import hatURL from './hat.png';
import hatBlurURL from './hatBlur.png';
import hatDisplaceURL from './hatDisplace.png';
const JohnHat = new THREE.Mesh(
	new THREE.CylinderBufferGeometry(hatSize * 0.75, JohnWidth * 0.093, hatSize, 2048, 2048, true),
	generateTurbanMat({
		map: new THREE.TextureLoader().load(hatURL),
		bumpMap: new THREE.TextureLoader().load(hatBlurURL),
		bumpScale: 0.005,
		displacementMap: new THREE.TextureLoader().load(hatDisplaceURL),
		displacementScale: 0.15,
		color: 0xBBBBBB,
		roughness: 1,
		metalness: 0.1,
	})
)
JohnHat.geometry.rotateY(-Math.PI);
JohnHat.position.y += hatSize * 0.5 + JohnHeight * 0.16;
JohnHat.position.x += JohnWidth * 0.118;
johnSoulsMesh.add(JohnHat);

/* game boxes */
import newBoxArt from './boxart';

import demonsoulsURL from './games/demonsouls.webp';
const gamebox = newBoxArt(demonsoulsURL);
gamebox.position.z = -3.8;
gamebox.position.y = -0.35;
gamebox.rotation.set(-Math.PI * 0.45, 0.02, 0.6 + Math.random() * 3);
gamebox.scale.setScalar(5);
setInterval(() => {
	gamebox.rotation.z += 0.0005;
}, 16)
scene.add(gamebox);


import darkSoulsURL from './games/darksouls.webp';
import darkSouls2URL from './games/darksouls2.webp';
import darkSouls3URL from './games/darksouls3.webp';
import eldenringURL from './games/eldenring.webp';
import bloodborneURL from './games/bloodborne.webp';
const boxArts = [
	newBoxArt(darkSoulsURL),
	newBoxArt(darkSouls2URL),
	newBoxArt(darkSouls3URL),
	newBoxArt(eldenringURL),
	newBoxArt(bloodborneURL),
];
for (let i = 0; i < boxArts.length; i++) {
	scene.add(boxArts[i]);
	boxArts[i].rotation.set(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2);
	boxArts[i].scale.setScalar(2);
}


scene.background = new THREE.Color(0x000E16);
scene.fog = new THREE.Fog(scene.background, 4, 300);



import spriteClouds from './spriteClouds';
scene.add(spriteClouds);

const envGenerator = new THREE.PMREMGenerator(renderer);
envGenerator.compileCubemapShader();

import envMapURL from './envmap.jpg';
new THREE.TextureLoader().load(envMapURL, texture => {
	const envMap = envGenerator.fromEquirectangular(texture);

	scene.environment = envMap.texture;
});


/*const ground = new THREE.Mesh(
	new THREE.PlaneBufferGeometry(1000, 1000, 1, 1),
	new THREE.MeshStandardMaterial({
		color: 0x222222,
		roughness: 0.6,
		metalness: 0.75,
	})
)
ground.rotateX(-Math.PI / 2);
ground.position.y = -1;
scene.add(ground);*/


//const johnLight = new THREE.PointLight(0xff2211, 0.5, 5);
const johnLight = new THREE.RectAreaLight(0xff2211, 0.8, 7, 7);
johnLight.lookAt(new THREE.Vector3(0, -1, 0));
johnLight.position.copy(johnSoulsMesh.position);
scene.add(johnLight);
scene.add(johnLight.clone().rotateX(Math.PI));



const backLight1 = new THREE.DirectionalLight(0x00B8FF, 0.4);
backLight1.position.set(0, -1, -1);
scene.add(backLight1);

const backLight2 = new THREE.DirectionalLight(0x00B8FF, 0.4);
backLight2.position.set(0, 1, -1);
scene.add(backLight2);

/*const frontLight = new THREE.DirectionalLight(0x7FB8FF, 0.15);
frontLight.position.set(0, 0, 1);
scene.add(frontLight);*/

const bottomLight = new THREE.SpotLight(0x7FB8FF, 1, 15, Math.PI / 4, 1, 1);
bottomLight.position.set(0, -10, 0);
bottomLight.target.position.set(0, 0, 0);
scene.add(bottomLight);