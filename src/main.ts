// src/main.ts
import './style.css';
import * as THREE from 'three';
import { createThreeEnv } from './core/ThreeEnv';
import { AxisVisualizer } from './visuals/AxisVisualizer';
import { VectorArrow } from './visuals/VectorArrow';
import { createSidePanel } from './ui/SidePanel';
import { installVectorDragController } from './interactions/VectorDragController';

const env = createThreeEnv();
const { scene, controls } = env;

const axes = new AxisVisualizer(4, 0.04);
scene.add(axes);

// colors
const v1ColorHex = '#ffff00';
const v2ColorHex = '#fdffbc';
const v1ColorNum = 0xffff00;
const v2ColorNum = 0xfdffbc;

// vectors in scene
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

// UI -> scene
v1UI.onVectorChanged((x, y, z) => {
  v1Arrow.setFromVector(new THREE.Vector3(x, y, z));
});

v2UI.onVectorChanged((x, y, z) => {
  v2Arrow.setFromVector(new THREE.Vector3(x, y, z));
});

// scene drag -> UI
installVectorDragController(env, [
  {
    button: 2, // right mouse -> v1
    arrow: v1Arrow,
    onChanged: (v) => v1UI.setVector(v.x, v.y, v.z),
  },
  {
    button: 1, // middle mouse -> v2
    arrow: v2Arrow,
    onChanged: (v) => v2UI.setVector(v.x, v.y, v.z),
  },
]);

// loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  env.renderer.render(scene, env.camera);
}
animate();
