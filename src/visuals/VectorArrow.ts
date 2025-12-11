import * as THREE from 'three';

export class VectorArrow extends THREE.Group {
  private arrow: THREE.ArrowHelper;
  private _vector = new THREE.Vector3();

  constructor(initial: THREE.Vector3, color = 0xffff00) {
    super();

    const dir = initial.clone().normalize();
    const len = initial.length();

    this.arrow = new THREE.ArrowHelper(
      dir.lengthSq() > 0 ? dir : new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(0, 0, 0),
      len,
      color,
      0.3,
      0.18
    );

    this._vector.copy(initial);
    this.add(this.arrow);
  }

  setFromVector(v: THREE.Vector3) {
    const len = v.length();
    const dir = len > 1e-6 ? v.clone().normalize() : new THREE.Vector3(1, 0, 0);

    this.arrow.setDirection(dir);
    this.arrow.setLength(len);
    this._vector.copy(v);
  }

  get vector(): THREE.Vector3 {
    return this._vector.clone();
  }
}
