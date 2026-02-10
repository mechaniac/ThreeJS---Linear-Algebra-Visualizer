// src/main.ts
import './style.css';
import * as THREE from 'three';
import { createThreeEnv } from './core/ThreeEnv';
import { AxisVisualizer } from './visuals/AxisVisualizer';
import { VectorArrow } from './visuals/VectorArrow';
import { VectorLocator } from './visuals/VectorLocator';
import { createSidePanel } from './ui/SidePanel';
import { installVectorInteractionController } from './interactions/VectorInteractionController';
import type { VectorEntry } from './interactions/VectorInteractionController';

import type { SidePanel as SP } from './ui/SidePanel';

const env = createThreeEnv();
const { scene, controls } = env;

// axis
const axes = new AxisVisualizer(5, 0.04);
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
const panel = createSidePanel('Vectors') as SP;

// add settings (if available)
const settingsPanel = (panel as any).addSettingsPanel && (panel as any).addSettingsPanel('Display Settings');

// default display params
const defaultAxisThickness = 0.01;
const defaultVectorThickness = 0.05;
const defaultVerticalGridEnabled = false;
const defaultLocatorSize = 0.2;

// apply defaults
axes.setThickness(defaultAxisThickness);
axes.toggleVerticalGrid(defaultVerticalGridEnabled);
v1Arrow.setThickness(defaultVectorThickness);
v2Arrow.setThickness(defaultVectorThickness);

if (settingsPanel) {
  settingsPanel.setValues({ axisThickness: defaultAxisThickness, vectorThickness: defaultVectorThickness, verticalGridEnabled: defaultVerticalGridEnabled, locatorSize: defaultLocatorSize });
}

const v1UI = panel.addVectorControl('v₁', v1ColorHex);
const v2UI = panel.addVectorControl('v₂', v2ColorHex);

// Create locators for each vector (visual markers for input positions)
const v1Locator = new VectorLocator(v1ColorHex);
const v2Locator = new VectorLocator(v2ColorHex);
v1Locator.setSize(defaultLocatorSize);
v2Locator.setSize(defaultLocatorSize);
scene.add(v1Locator);
scene.add(v2Locator);

v1UI.setVector(v1Initial.x, v1Initial.y, v1Initial.z);
v2UI.setVector(v2Initial.x, v2Initial.y, v2Initial.z);

// Initialize locator positions to input vectors
v1Locator.setPosition(v1Initial.x, v1Initial.y, v1Initial.z);
v2Locator.setPosition(v2Initial.x, v2Initial.y, v2Initial.z);

// active vector state
type VectorId = number;

interface VectorState {
  id: VectorId;
  arrow: VectorArrow;
  locator: VectorLocator;
  ui: typeof v1UI;
  inputVector: THREE.Vector3;
  scalar: number;
}

const vectors: VectorState[] = [
  { id: 1, arrow: v1Arrow, locator: v1Locator, ui: v1UI, inputVector: v1Initial.clone(), scalar: 1 },
  { id: 2, arrow: v2Arrow, locator: v2Locator, ui: v2UI, inputVector: v2Initial.clone(), scalar: 1 },
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

// Helper: compute scaled vector and update arrow
function updateScaledVector(state: VectorState) {
  const scaled = state.inputVector.clone().multiplyScalar(state.scalar);
  state.arrow.setFromVector(scaled);
  
  // Locator visibility: hide if scalar is 1 (same as input)
  const showLocator = Math.abs(state.scalar - 1) > 0.01;
  state.locator.visible = showLocator;
}

// clicking UI blocks sets active
for (const v of vectors) {
  v.ui.root.addEventListener('click', () => {
    setActive(v.id);
  });
}

// UI -> scene updates: input vector changed
v1UI.onVectorChanged((x, y, z) => {
  const state = vectors.find((v) => v.id === 1);
  if (!state) return;
  state.inputVector.set(x, y, z);
  state.locator.setPosition(x, y, z);
  updateScaledVector(state);
});

v2UI.onVectorChanged((x, y, z) => {
  const state = vectors.find((v) => v.id === 2);
  if (!state) return;
  state.inputVector.set(x, y, z);
  state.locator.setPosition(x, y, z);
  updateScaledVector(state);
});

// UI -> scene updates: scalar changed
v1UI.onScalarChanged((scalar: number) => {
  const state = vectors.find((v) => v.id === 1);
  if (!state) return;
  state.scalar = scalar;
  updateScaledVector(state);
});

v2UI.onScalarChanged((scalar: number) => {
  const state = vectors.find((v) => v.id === 2);
  if (!state) return;
  state.scalar = scalar;
  updateScaledVector(state);
});

// scene interaction: pick & drag active locator (not arrow)
// Dragging locator updates input vector, which then drives scaled arrow
const entries: VectorEntry[] = vectors.map((v) => ({
  id: v.id,
  arrow: v.locator as any, // raycaster will pick the locator
}));

installVectorInteractionController(
  env,
  entries,
  () => getActive(),
  (id) => setActive(id),
  (id, vec) => {
    const state = vectors.find((x) => x.id === id);
    if (!state) return;
    // Update input vector from locator drag
    state.inputVector.set(vec.x, vec.y, vec.z);
    state.locator.setPosition(vec.x, vec.y, vec.z);
    state.ui.setVector(vec.x, vec.y, vec.z);
    updateScaledVector(state);
  }
);

// wire settings callbacks
if (settingsPanel) {
  settingsPanel.onAxisThicknessChanged((v: number) => axes.setThickness(v));
  settingsPanel.onVectorThicknessChanged((v: number) => {
    v1Arrow.setThickness(v);
    v2Arrow.setThickness(v);
  });
  settingsPanel.onVerticalGridToggled((enabled: boolean) => axes.toggleVerticalGrid(enabled));
  settingsPanel.onLocatorSizeChanged((v: number) => {
    v1Locator.setSize(v);
    v2Locator.setSize(v);
  });
}

// loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  env.renderer.render(scene, env.camera);
}
animate();
