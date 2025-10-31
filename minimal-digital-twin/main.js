// === Import Three.js ===
import * as THREE from './three.module.js';
import { Paho } from './mqtt.min.js'; // or use MQTT.js if preferred

// === Scene setup ===
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// === Simple cube for visualization ===
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshStandardMaterial({ color: 0x0077ff });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

// === Lights ===
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);

// === MQTT setup ===
const clientID = "webclient_" + Math.random().toString(16).substr(2, 8);
const client = new Paho.MQTT.Client("localhost", 9001, clientID);

client.connect({
  onSuccess: () => {
    console.log("✅ Connected to MQTT broker");
    client.subscribe("motion/state");
  },
  onFailure: (err) => console.error("❌ MQTT connect failed:", err),
});

client.onMessageArrived = (message) => {
  try {
    const data = JSON.parse(message.payloadString);
    console.log("📡 Motion update:", data);

    // Example: expecting {x: 1.0, y: 2.0, z: 3.0}
    cube.position.set(data.x || 0, data.y || 0, data.z || 0);
  } catch (err) {
    console.error("Error parsing MQTT message:", err);
  }
};

// === Animation loop ===
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();

// === Handle window resize ===
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
