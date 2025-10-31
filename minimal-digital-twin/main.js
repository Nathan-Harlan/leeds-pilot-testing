// Minimal Three.js + MQTT retained status publisher and cube position subscriber.
// Assumes three.module.js and mqtt.min.js are available locally next to this file.

// Use global THREE and Paho provided by CDN scripts in index.html.

const statusEl = document.getElementById('status');

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 3;
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Cube 1x1x1 at origin
const cube = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: 0x00aaee })
);
scene.add(cube);

function renderLoop() {
  requestAnimationFrame(renderLoop);
  renderer.render(scene, camera);
}
renderLoop();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// MQTT client
const clientId = 'twin_' + Math.random().toString(16).slice(2);
const client = new Paho.MQTT.Client('localhost', 9001, clientId);

client.onConnectionLost = (resp) => {
  if (resp.errorCode !== 0) {
    console.error('MQTT lost', resp.errorMessage);
    if (statusEl) statusEl.textContent = 'Disconnected';
  }
};

client.onMessageArrived = (message) => {
  if (message.destinationName === 'cube_pos') {
    try {
      const data = JSON.parse(message.payloadString);
      cube.position.set(data.x || 0, data.y || 0, data.z || 0);
      if (statusEl) statusEl.textContent = `Cube: (${cube.position.x.toFixed(2)}, ${cube.position.y.toFixed(2)}, ${cube.position.z.toFixed(2)})`;
    } catch (e) {
      console.error('Bad cube_pos payload', e);
    }
  }
};

client.connect({
  onSuccess: () => {
    console.log('MQTT connected');
    if (statusEl) statusEl.textContent = 'Connected - awaiting cube_pos';
    client.subscribe('cube_pos', { qos: 2 });
    const statusMsg = new Paho.MQTT.Message(JSON.stringify({ msg: 'hello world' }));
    statusMsg.destinationName = 'minimal-digital-twin/status';
    statusMsg.qos = 2;
    statusMsg.retained = true;
    client.send(statusMsg);
  },
  onFailure: (err) => {
    console.error('MQTT connect failed', err);
    if (statusEl) statusEl.textContent = 'Connect failed';
  }
});
