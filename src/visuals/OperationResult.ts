// src/visuals/OperationResult.ts

import * as THREE from 'three';

/**
 * OperationResult: Visual representation of linear algebra operation results.
 * Displays a vector arrow in fixed color (#ffb500) showing the computed result.
 * Handles addition, cross product, and other operations.
 */
export class OperationResult extends THREE.Group {
  private shaft: THREE.Mesh;
  private head: THREE.Mesh;
  private _vector = new THREE.Vector3();
  private _thickness: number = 0.05;
  private readonly color = 0xffb500; // Fixed result color

  constructor(thickness = 0.05) {
    super();
    this._thickness = thickness;
    this._vector.copy(new THREE.Vector3());
    const len = this._vector.length();
    const tipLen = thickness * 6;
    const shaftLen = Math.max(len - tipLen, 0.01);

    const shaftGeom = new THREE.CylinderGeometry(thickness, thickness, shaftLen, 8);
    const mat = new THREE.MeshBasicMaterial({ color: this.color });
    this.shaft = new THREE.Mesh(shaftGeom, mat);
    this.shaft.position.y = shaftLen / 2;

    const headGeom = new THREE.ConeGeometry(thickness * 2, tipLen, 12);
    this.head = new THREE.Mesh(headGeom, mat);
    this.head.position.y = len - tipLen / 2;

    this.add(this.shaft);
    this.add(this.head);
    this.visible = false; // Hidden until result is set
  }

  private updateOrientation() {
    const v = this._vector.clone();
    const len = v.length();

    if (len < 0.001) {
      this.visible = false;
      return;
    }

    this.visible = true;

    // Orient to point in direction of v using Y-axis as default
    const up = new THREE.Vector3(0, 1, 0);
    const dir = v.clone().normalize();
    const quat = new THREE.Quaternion().setFromUnitVectors(up, dir);
    this.quaternion.copy(quat);

    // Update geometry sizes and positions
    const thickness = this._thickness;
    const tipLen = thickness * 6;
    const shaftLen = Math.max(len - tipLen, 0.01);

    (this.shaft.geometry as THREE.CylinderGeometry).dispose();
    this.shaft.geometry = new THREE.CylinderGeometry(thickness, thickness, shaftLen, 8);
    this.shaft.position.set(0, shaftLen / 2, 0);

    (this.head.geometry as THREE.ConeGeometry).dispose();
    this.head.geometry = new THREE.ConeGeometry(thickness * 2, tipLen, 12);
    this.head.position.set(0, len - tipLen / 2, 0);
  }

  setFromVector(v: THREE.Vector3) {
    this._vector.copy(v);
    this.updateOrientation();
  }

  setThickness(thickness: number) {
    this._thickness = thickness;
    this.updateOrientation();
  }
}
