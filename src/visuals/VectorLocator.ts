import * as THREE from 'three';

/**
 * VectorLocator: Visual marker (cross) indicating original unscaled vector position.
 * Displayed when a scalar multiplier != 1 is applied; hidden otherwise to avoid redundancy.
 */
export class VectorLocator extends THREE.Group {
  private arms: THREE.Line[] = [];
  private colorHex: string;
  private size: number;

  constructor(colorHex: string = '#ffffff', size: number = 0.3) {
    super();
    this.colorHex = colorHex;
    this.size = size;
    this.createCross();
  }

  private createCross() {
    // Remove old arms
    for (const arm of this.arms) {
      this.remove(arm);
    }
    this.arms = [];

    // Create three perpendicular line segments forming a cross
    const dirs = [
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(0, 0, 1),
    ];

    for (const dir of dirs) {
      const geom = new THREE.BufferGeometry();
      const points = [
        new THREE.Vector3().addScaledVector(dir, -this.size / 2),
        new THREE.Vector3().addScaledVector(dir, this.size / 2),
      ];
      geom.setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({ color: this.colorHex, linewidth: 2 });
      const line = new THREE.Line(geom, mat);
      this.arms.push(line);
      this.add(line);
    }
  }

  /** Update cross size and rebuild geometry */
  setSize(size: number) {
    this.size = size;
    this.createCross();
  }

  /** Update position of the locator */
  setPosition(x: number, y: number, z: number) {
    this.position.set(x, y, z);
  }
}
