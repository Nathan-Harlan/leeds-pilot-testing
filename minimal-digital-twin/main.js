// Minimal Three.js + MQTT retained status publisher and cube position subscriber.
// Assumes three.module.js and mqtt.min.js are available locally next to this file.

import * as THREE from './three.module.js';
import { Paho } from './mqtt.min.js';

// Scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 3;
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 1x1x1 cube centered at origin
const cube = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: 0x00aaee, wireframe: false })
);
scene.add(cube);

// Render loop
function loop() {
  requestAnimationFrame(loop);
  renderer.render(scene, camera);
}
loop();

// Resize handling
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// MQTT
const clientId = 'twin_' + Math.random().toString(16).slice(2);
const client = new Paho.MQTT.Client('localhost', 9001, clientId);

client.onConnectionLost = (responseObject) => {
  if (responseObject.errorCode !== 0) {
    console.error('MQTT connection lost', responseObject.errorMessage);
  }
};

client.onMessageArrived = (message) => {
  if (message.destinationName === 'cube_pos') {
    try {
      const data = JSON.parse(message.payloadString);
      cube.position.set(data.x || 0, data.y || 0, data.z || 0);
    } catch (e) {
      console.error('Invalid cube_pos payload', e);
    }
  }
};

client.connect({
  onSuccess: () => {
    console.log('Connected MQTT');
    client.subscribe('cube_pos', { qos: 2 });
    // Publish retained status once
    const status = new Paho.MQTT.Message(JSON.stringify({ msg: 'hello world' }));
    status.destinationName = 'minimal-digital-twin/status';
    status.qos = 2;
    status.retained = true;
    client.send(status);
  },
  onFailure: (err) => console.error('MQTT connect failed', err)
});
