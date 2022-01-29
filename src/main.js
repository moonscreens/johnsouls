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
			element.update();
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
import johnsmoulsHighlightURL from "./johnsmoulsCutout.png";

const johnCanvas = document.createElement('canvas');
const johnContext = johnCanvas.getContext('2d');
const johnImage = new Image();
johnImage.src = johnsmoulsURL;
johnImage.onload = () => {
	johnCanvas.width = johnImage.width;
	johnCanvas.height = johnImage.height;
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
const johnSoulsPlane = new THREE.PlaneBufferGeometry(JohnWidth, JohnHeight, 256, 256);
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
const JohnHat = new THREE.Mesh(
	new THREE.CylinderBufferGeometry(hatSize * 0.75, JohnWidth * 0.09, hatSize, 64, 64, true),
	generateTurbanMat({
		map: new THREE.TextureLoader().load(hatURL),
		color: 0xaaaaaa,
	})
)
JohnHat.geometry.rotateY(Math.PI / 2);
JohnHat.position.y += hatSize * 0.5 + JohnHeight * 0.16;
JohnHat.position.x += JohnWidth * 0.118;
johnSoulsMesh.add(JohnHat);


/* game boxes */
import newBoxArt from './boxart';

import demonsoulsURL from './games/demonsouls.png';
const gamebox = newBoxArt(demonsoulsURL);
gamebox.position.z = -3.8;
gamebox.position.y = -0.35;
gamebox.rotation.set(-Math.PI * 0.45, 0.02, 0.6 + Math.random() * 3);
gamebox.scale.setScalar(5);
setInterval(() => {
	gamebox.rotation.z += 0.0005;
}, 16)
scene.add(gamebox);


import darkSoulsURL from './games/darksouls.png';
import darkSouls2URL from './games/darksouls2.png';
import darkSouls3URL from './games/darksouls3.png';
import eldenringURL from './games/eldenring.png';
const boxArts = [
	newBoxArt(darkSoulsURL),
	newBoxArt(darkSouls2URL),
	newBoxArt(darkSouls3URL),
	newBoxArt(eldenringURL),
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


scene.add(new THREE.AmbientLight(0xffffff, 0.2));

//const johnLight = new THREE.PointLight(0xff2211, 0.5, 5);
const johnLight = new THREE.RectAreaLight(0xff2211, 1, 5, 1, 1);
johnLight.lookAt(new THREE.Vector3(0, -1, 0));
johnLight.position.copy(johnSoulsMesh.position);
scene.add(johnLight);

const backLight1 = new THREE.DirectionalLight(0xffffff, 0.5);
backLight1.position.set(0, -1, -1);
scene.add(backLight1);

const backLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
backLight2.position.set(0, 1, -1);
scene.add(backLight2);

const frontLight = new THREE.DirectionalLight(0xffffff, 0.15);
frontLight.position.set(0, 0, 1);
scene.add(frontLight);