// src/interactions/VectorDragController.ts
import * as THREE from 'three';
import type { ThreeEnv } from '../core/ThreeEnv';
import { VectorArrow } from '../visuals/VectorArrow';

export function installVectorDragController(
  env: ThreeEnv,
  vectorArrow: VectorArrow,
  onVectorChanged: (v: THREE.Vector3) => void
): void {
  const { renderer, camera } = env;

  const raycaster = new THREE.Raycaster();
  const pointerNDC = new THREE.Vector2();
  const dragPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0); // z = 0
  let dragging = false;

  function updateFromPointer(ev: PointerEvent) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointerNDC.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
    pointerNDC.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(pointerNDC, camera);

    const hit = new THREE.Vector3();
    if (raycaster.ray.intersectPlane(dragPlane, hit)) {
      hit.z = 0;
      vectorArrow.setFromVector(hit);
      onVectorChanged(hit.clone());
    }
  }

  renderer.domElement.addEventListener('pointerdown', (ev: PointerEvent) => {
    if (ev.button === 2) {
      dragging = true;
      updateFromPointer(ev);
    }
  });

  renderer.domElement.addEventListener('pointermove', (ev: PointerEvent) => {
    if (!dragging) return;
    updateFromPointer(ev);
  });

  window.addEventListener('pointerup', () => {
    dragging = false;
  });

  renderer.domElement.addEventListener('contextmenu', (ev) => ev.preventDefault());
}
