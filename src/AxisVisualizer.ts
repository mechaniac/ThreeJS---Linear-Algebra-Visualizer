import * as THREE from 'three';

export class AxisVisualizer extends THREE.Group {
  constructor(axisLength = 5, axisThickness = 0.03) {
    super();

    // Grid on XZ plane
    const grid = new THREE.GridHelper(10, 10, 0x444444, 0x222222);
    this.add(grid);

    this.add(this.createAxis(new THREE.Vector3(1, 0, 0), axisLength, axisThickness, 0xdd4522)); // X
    this.add(this.createAxis(new THREE.Vector3(0, 1, 0), axisLength, axisThickness, 0x32d83e)); // Y
    this.add(this.createAxis(new THREE.Vector3(0, 0, 1), axisLength, axisThickness, 0x367ec6)); // Z
  }

  private createAxis(
    dir: THREE.Vector3,
    length: number,
    thickness: number,
    color: number
  ): THREE.Group {
    const group = new THREE.Group();

    // shaft
    const shaftGeom = new THREE.CylinderGeometry(
      thickness,
      thickness,
      length,
      12
    );
    const shaftMat = new THREE.MeshBasicMaterial({ color });
    const shaft = new THREE.Mesh(shaftGeom, shaftMat);

    // cylinders are aligned along Y by default -> rotate into direction
    // we build it along +Y, then orient the whole group
    shaft.position.y = length / 2;
    group.add(shaft);

    // arrow head
    const headGeom = new THREE.ConeGeometry(thickness * 2, length * 0.18, 16);
    const headMat = new THREE.MeshBasicMaterial({ color });
    const head = new THREE.Mesh(headGeom, headMat);
    head.position.y = length;
    group.add(head);

    // orient group so its local +Y matches dir
    const up = new THREE.Vector3(0, 1, 0);
    const quat = new THREE.Quaternion().setFromUnitVectors(
      up,
      dir.clone().normalize()
    );
    group.quaternion.copy(quat);

    return group;
  }
}
