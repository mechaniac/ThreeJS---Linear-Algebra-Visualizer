import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { AxisVisualizer } from './AxisVisualizer';
import { VectorArrow } from './VectorArrow';

// --- renderer / sizes ---
const width = window.innerWidth;
const height = window.innerHeight;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(width, height);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// --- scene ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

// --- camera ---
const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
camera.position.set(6, 6, 6);
camera.lookAt(0, 0, 0);

// --- controls ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enablePan = false; // no panning, only orbit + zoom

// --- lights ---
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(3, 5, 2);
scene.add(dirLight);
scene.add(new THREE.AmbientLight(0xffffff, 0.3));

// --- axis visualizer ---
const axes = new AxisVisualizer(4, 0.04);
scene.add(axes);

// --- vector arrow (yellow) ---
const vectorArrow = new VectorArrow(new THREE.Vector3(2, 3, 0), 0xffff00);
scene.add(vectorArrow);

// --- UI panel ---
const uiPanel = document.createElement('div');
uiPanel.id = 'ui-panel';

const toggleBtn = document.createElement('button');
toggleBtn.id = 'ui-toggle';
toggleBtn.textContent = '⮜'; // collapse
toggleBtn.onclick = () => {
  const collapsed = uiPanel.classList.toggle('collapsed');
  toggleBtn.textContent = collapsed ? '⮞' : '⮜';
};

const title = document.createElement('h2');
title.id = 'ui-title';
title.textContent = 'Vector';

const label = document.createElement('div');
label.id = 'vector-label';

uiPanel.appendChild(toggleBtn);
uiPanel.appendChild(title);
uiPanel.appendChild(label);
document.body.appendChild(uiPanel);

// helper to update label text
function updateVectorLabel() {
  const v = vectorArrow.vector;
  label.textContent = `[ ${v.x.toFixed(2)}, ${v.y.toFixed(2)}, ${v.z.toFixed(2)} ]`;
}
updateVectorLabel();

// --- interaction: right-click drag to set vector (on XY plane, z = 0) ---

const raycaster = new THREE.Raycaster();
const pointerNDC = new THREE.Vector2();
const dragPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0); // z = 0
let draggingVector = false;

function updateFromPointer(ev: PointerEvent) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointerNDC.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
  pointerNDC.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(pointerNDC, camera);

  const hit = new THREE.Vector3();
  if (raycaster.ray.intersectPlane(dragPlane, hit)) {
    hit.z = 0; // lock to XY plane
    vectorArrow.setFromVector(hit);
    updateVectorLabel();
  }
}

renderer.domElement.addEventListener('pointerdown', (ev: PointerEvent) => {
  if (ev.button === 2) {
    draggingVector = true;
    updateFromPointer(ev);
  }
});

renderer.domElement.addEventListener('pointermove', (ev: PointerEvent) => {
  if (!draggingVector) return;
  updateFromPointer(ev);
});

window.addEventListener('pointerup', () => {
  draggingVector = false;
});

// disable browser context menu so right-click drag feels clean
renderer.domElement.addEventListener('contextmenu', (ev) => ev.preventDefault());

// --- render loop ---
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

// --- resize ---
window.addEventListener('resize', () => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
});
