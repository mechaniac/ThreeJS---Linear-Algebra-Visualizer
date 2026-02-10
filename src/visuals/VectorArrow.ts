import * as THREE from 'three';

export class VectorArrow extends THREE.Group {
  private shaft: THREE.Mesh;
  private head: THREE.Mesh;
  private _vector = new THREE.Vector3();
  private color: number;

  constructor(initial: THREE.Vector3, color = 0xffff00, thickness = 0.05) {
    super();
    this.color = color;
    this._vector.copy(initial);
    const len = initial.length();
    // tip length: 6 * thickness
    const tipLen = thickness * 6;
    const shaftLen = Math.max(len - tipLen, 0.01);
    // create shaft: from 0 to len - tipLen
    const shaftGeom = new THREE.CylinderGeometry(thickness, thickness, shaftLen, 8);
    const shaftMat = new THREE.MeshBasicMaterial({ color });
    this.shaft = new THREE.Mesh(shaftGeom, shaftMat);
    this.shaft.position.y = shaftLen / 2;

    // create head: positioned so tip ends exactly at len
    const headGeom = new THREE.ConeGeometry(thickness * 2, tipLen, 12);
    const headMat = new THREE.MeshBasicMaterial({ color });
    this.head = new THREE.Mesh(headGeom, headMat);
    this.head.position.y = len - tipLen / 2;

    this.add(this.shaft);
    this.add(this.head);

    this.updateOrientation();
  }

  private updateOrientation() {
    const v = this._vector.clone();
    const len = v.length();
    const up = new THREE.Vector3(0, 1, 0);
    const dir = len > 1e-6 ? v.clone().normalize() : new THREE.Vector3(1, 0, 0);
    const quat = new THREE.Quaternion().setFromUnitVectors(up, dir);
    this.quaternion.copy(quat);
    // position shaft and head according to length
    const thickness = (this.shaft.geometry as THREE.CylinderGeometry).parameters.radiusTop as number || 0.05;
    const tipLen = thickness * 6;
    const shaftLen = Math.max(len - tipLen, 0.01);
    (this.shaft.geometry as THREE.CylinderGeometry).dispose();
    this.shaft.geometry = new THREE.CylinderGeometry(thickness, thickness, shaftLen, 8);
    this.shaft.position.set(0, shaftLen / 2, 0);
    // position head so tip ends exactly at len
    this.head.position.set(0, len - tipLen / 2, 0);
  }

  setFromVector(v: THREE.Vector3) {
    this._vector.copy(v);
    this.updateOrientation();
  }

  setThickness(thickness: number) {
    // recreate geometries with new thickness
    const len = this._vector.length();
    const tipLen = thickness * 6;
    const shaftLen = Math.max(len - tipLen, 0.01);
    (this.shaft.geometry as THREE.CylinderGeometry).dispose();
    this.shaft.geometry = new THREE.CylinderGeometry(thickness, thickness, shaftLen, 8);
    (this.head.geometry as THREE.ConeGeometry).dispose();
    this.head.geometry = new THREE.ConeGeometry(thickness * 2, tipLen, 12);
    // update positions: shaft ends where tip begins, tip ends at vector position
    this.shaft.position.set(0, shaftLen / 2, 0);
    this.head.position.set(0, len - tipLen / 2, 0);
  }

  setOpacity(opacity: number) {
    [this.shaft, this.head].forEach((m) => {
      const mat = m.material as THREE.Material & { opacity?: number; transparent?: boolean };
      if ('opacity' in mat) {
        mat.transparent = opacity < 1;
        mat.opacity = opacity;
      }
    });
  }

  get vector(): THREE.Vector3 {
    return this._vector.clone();
  }
}
