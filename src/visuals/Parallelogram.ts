// src/visuals/Parallelogram.ts

import * as THREE from 'three';

/**
 * Parallelogram: Visualizes the parallelogram spanned by two vectors from the origin.
 * The four vertices are: origin, v1, v1+v2, v2.
 * Rendered as a semi-transparent filled quad with a wireframe outline.
 */
export class Parallelogram extends THREE.Group {
  private mesh: THREE.Mesh;
  private outline: THREE.LineLoop;
  private geometry: THREE.BufferGeometry;
  private outlineGeometry: THREE.BufferGeometry;

  constructor(color: number = 0xffb500, opacity = 0.25) {
    super();

    // Filled quad (two triangles)
    this.geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(4 * 3); // 4 vertices × 3 components
    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.geometry.setIndex([0, 1, 2, 0, 2, 3]); // two triangles

    const mat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this.mesh = new THREE.Mesh(this.geometry, mat);
    this.add(this.mesh);

    // Wireframe outline
    this.outlineGeometry = new THREE.BufferGeometry();
    const outlinePositions = new Float32Array(4 * 3);
    this.outlineGeometry.setAttribute('position', new THREE.BufferAttribute(outlinePositions, 3));

    const lineMat = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: Math.min(opacity * 3, 0.9),
    });
    this.outline = new THREE.LineLoop(this.outlineGeometry, lineMat);
    this.add(this.outline);

    this.visible = false;
  }

  /**
   * Update the parallelogram to span from the origin between v1 and v2.
   * Vertices: O(0,0,0) → v1 → v1+v2 → v2
   */
  setVectors(v1: THREE.Vector3, v2: THREE.Vector3) {
    const sum = v1.clone().add(v2);

    // Quad vertices: origin, v1, v1+v2, v2
    const pos = this.geometry.getAttribute('position') as THREE.BufferAttribute;
    // vertex 0: origin
    pos.setXYZ(0, 0, 0, 0);
    // vertex 1: v1
    pos.setXYZ(1, v1.x, v1.y, v1.z);
    // vertex 2: v1 + v2
    pos.setXYZ(2, sum.x, sum.y, sum.z);
    // vertex 3: v2
    pos.setXYZ(3, v2.x, v2.y, v2.z);
    pos.needsUpdate = true;
    this.geometry.computeVertexNormals();

    // Outline follows the same quad
    const oPos = this.outlineGeometry.getAttribute('position') as THREE.BufferAttribute;
    oPos.setXYZ(0, 0, 0, 0);
    oPos.setXYZ(1, v1.x, v1.y, v1.z);
    oPos.setXYZ(2, sum.x, sum.y, sum.z);
    oPos.setXYZ(3, v2.x, v2.y, v2.z);
    oPos.needsUpdate = true;

    this.visible = true;
  }
}
