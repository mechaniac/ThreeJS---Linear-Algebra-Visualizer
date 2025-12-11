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

const initialVector = new THREE.Vector3(2, 3, 0);
const vectorArrow = new VectorArrow(initialVector, 0xffff00);
scene.add(vectorArrow);

// UI
const sidePanel = createSidePanel('Vector');
sidePanel.setVector(initialVector.x, initialVector.y, initialVector.z);

// when UI changes -> update scene vector
sidePanel.onVectorChanged((x, y, z) => {
  const v = new THREE.Vector3(x, y, z);
  vectorArrow.setFromVector(v);
});

// when dragging in scene -> update UI
installVectorDragController(env, vectorArrow, (v) => {
  sidePanel.setVector(v.x, v.y, v.z);
});

// loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  env.renderer.render(scene, env.camera);
}
animate();
