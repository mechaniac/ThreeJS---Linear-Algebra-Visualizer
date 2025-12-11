// src/interactions/VectorInteractionController.ts
import * as THREE from 'three';
import type { ThreeEnv } from '../core/ThreeEnv';
import { VectorArrow } from '../visuals/VectorArrow';

export interface VectorEntry {
  id: number;
  arrow: VectorArrow;
}

export function installVectorInteractionController(
  env: ThreeEnv,
  entries: VectorEntry[],
  getActiveId: () => number | null,
  setActiveId: (id: number) => void,
  onVectorChanged: (id: number, v: THREE.Vector3) => void
): void {
  const { renderer, camera } = env;

  const raycaster = new THREE.Raycaster();
  const pointerNDC = new THREE.Vector2();
  const dragPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0); // z = 0
  let dragging = false;
  let activeEntry: VectorEntry | null = null;

  function updateFromPointer(ev: PointerEvent) {
    if (!activeEntry) return;

    const rect = renderer.domElement.getBoundingClientRect();
    pointerNDC.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
    pointerNDC.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(pointerNDC, camera);

    const hit = new THREE.Vector3();
    if (raycaster.ray.intersectPlane(dragPlane, hit)) {
      hit.z = 0;
      activeEntry.arrow.setFromVector(hit);
      onVectorChanged(activeEntry.id, hit.clone());
    }
  }

  function pickVector(ev: PointerEvent) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointerNDC.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
    pointerNDC.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(pointerNDC, camera);

    const objects = entries.map((e) => e.arrow as THREE.Object3D);
    const hits = raycaster.intersectObjects(objects, true);
    if (hits.length === 0) return;

    // find which entry was hit
    const hitObj = hits[0].object;
    const entry = entries.find((e) => hitObj === e.arrow || hitObj.parent === e.arrow || hitObj.parent?.parent === e.arrow);
    if (!entry) return;

    setActiveId(entry.id);
  }

  renderer.domElement.addEventListener('pointerdown', (ev: PointerEvent) => {
    if (ev.button === 0) {
      // left click = pick active vector
      pickVector(ev);
      return;
    }

    if (ev.button === 2) {
      // right button = drag active vector
      const activeId = getActiveId();
      if (activeId == null) return;
      activeEntry = entries.find((e) => e.id === activeId) ?? null;
      if (!activeEntry) return;

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
    activeEntry = null;
  });

  renderer.domElement.addEventListener('contextmenu', (ev) => ev.preventDefault());
}
