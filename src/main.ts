// src/main.ts
import './style.css';
import * as THREE from 'three';
import { createThreeEnv } from './core/ThreeEnv';
import { AxisVisualizer } from './visuals/AxisVisualizer';
import { VectorArrow } from './visuals/VectorArrow';
import { createSidePanel } from './ui/SidePanel';
import { installVectorInteractionController } from './interactions/VectorInteractionController';
import type { VectorEntry } from './interactions/VectorInteractionController';


const env = createThreeEnv();
const { scene, controls } = env;

// axis
const axes = new AxisVisualizer(4, 0.04);
scene.add(axes);

// colors
const v1ColorHex = '#ffff00';
const v2ColorHex = '#fdffbc';
const v1ColorNum = 0xffff00;
const v2ColorNum = 0xfdffbc;

// vectors
const v1Initial = new THREE.Vector3(2, 3, 0);
const v2Initial = new THREE.Vector3(-1, 2, 0);

const v1Arrow = new VectorArrow(v1Initial, v1ColorNum);
const v2Arrow = new VectorArrow(v2Initial, v2ColorNum);

scene.add(v1Arrow);
scene.add(v2Arrow);

// UI
const panel = createSidePanel('Vectors');

const v1UI = panel.addVectorControl('v₁', v1ColorHex);
const v2UI = panel.addVectorControl('v₂', v2ColorHex);

v1UI.setVector(v1Initial.x, v1Initial.y, v1Initial.z);
v2UI.setVector(v2Initial.x, v2Initial.y, v2Initial.z);

// active vector state
type VectorId = number;
const vectors: { id: VectorId; arrow: VectorArrow; ui: typeof v1UI }[] = [
  { id: 1, arrow: v1Arrow, ui: v1UI },
  { id: 2, arrow: v2Arrow, ui: v2UI },
];

let activeId: VectorId | null = 1; // start with v₁ active

function updateActiveUI() {
  for (const v of vectors) {
    v.ui.setActive(v.id === activeId);
  }
}
updateActiveUI();

function setActive(id: VectorId) {
  activeId = id;
  updateActiveUI();
}

function getActive(): VectorId | null {
  return activeId;
}

// clicking UI blocks sets active
for (const v of vectors) {
  v.ui.root.addEventListener('click', () => {
    setActive(v.id);
  });
}

// UI -> scene updates
v1UI.onVectorChanged((x, y, z) => {
  const vec = new THREE.Vector3(x, y, z);
  v1Arrow.setFromVector(vec);
});
v2UI.onVectorChanged((x, y, z) => {
  const vec = new THREE.Vector3(x, y, z);
  v2Arrow.setFromVector(vec);
});

// scene interaction: pick & drag active vector
const entries: VectorEntry[] = vectors.map((v) => ({
  id: v.id,
  arrow: v.arrow,
}));

installVectorInteractionController(
  env,
  entries,
  () => getActive(),
  (id) => setActive(id),
  (id, vec) => {
    const v = vectors.find((x) => x.id === id);
    if (!v) return;
    v.ui.setVector(vec.x, vec.y, vec.z);
  }
);

// loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  env.renderer.render(scene, env.camera);
}
animate();
