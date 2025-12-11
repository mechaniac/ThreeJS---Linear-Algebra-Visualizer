// src/interactions/VectorDragController.ts
import * as THREE from 'three';
import type { ThreeEnv } from '../core/ThreeEnv';
import { VectorArrow } from '../visuals/VectorArrow';

export interface DraggableVectorConfig {
  button: number; // 0 left, 1 middle, 2 right
  arrow: VectorArrow;
  onChanged: (v: THREE.Vector3) => void;
}

export function installVectorDragController(
  env: ThreeEnv,
  configs: DraggableVectorConfig[]
): void {
  const { renderer, camera } = env;

  const raycaster = new THREE.Raycaster();
  const pointerNDC = new THREE.Vector2();
  const dragPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0); // z = 0
  let activeConfig: DraggableVectorConfig | null = null;

  function updateFromPointer(ev: PointerEvent) {
    if (!activeConfig) return;

    const rect = renderer.domElement.getBoundingClientRect();
    pointerNDC.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
    pointerNDC.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(pointerNDC, camera);

    const hit = new THREE.Vector3();
    if (raycaster.ray.intersectPlane(dragPlane, hit)) {
      hit.z = 0;
      activeConfig.arrow.setFromVector(hit);
      activeConfig.onChanged(hit.clone());
    }
  }

  renderer.domElement.addEventListener('pointerdown', (ev: PointerEvent) => {
    const cfg = configs.find((c) => c.button === ev.button);
    if (!cfg) return;
    activeConfig = cfg;
    updateFromPointer(ev);
  });

  renderer.domElement.addEventListener('pointermove', (ev: PointerEvent) => {
    if (!activeConfig) return;
    updateFromPointer(ev);
  });

  window.addEventListener('pointerup', () => {
    activeConfig = null;
  });

  renderer.domElement.addEventListener('contextmenu', (ev) => ev.preventDefault());
}
