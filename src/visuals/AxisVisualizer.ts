import * as THREE from 'three';

export class AxisVisualizer extends THREE.Group {
  private axisLength: number;
  private axisThickness: number;
  private axisColors = [0xdd4522, 0x32d83e, 0x367ec6];
  private axisGroups: THREE.Group[] = [];

  constructor(axisLength = 5, axisThickness = 0.03) {
    super();

    this.axisLength = axisLength;
    this.axisThickness = axisThickness;

    // Grid on XZ plane
    const grid = new THREE.GridHelper(10, 10, 0x444444, 0x222222);
    this.add(grid);

    // build axes and keep references for updates
    this.axisGroups = [
      this.createAxis(new THREE.Vector3(1, 0, 0), this.axisLength, this.axisThickness, this.axisColors[0]),
      this.createAxis(new THREE.Vector3(0, 1, 0), this.axisLength, this.axisThickness, this.axisColors[1]),
      this.createAxis(new THREE.Vector3(0, 0, 1), this.axisLength, this.axisThickness, this.axisColors[2]),
    ];

    for (const g of this.axisGroups) this.add(g);
  }

  private createAxis(
    dir: THREE.Vector3,
    length: number,
    thickness: number,
    color: number
  ): THREE.Group {
    const group = new THREE.Group();

    // tip length is 18% of arrow length
    const tipLen = length * 0.18;
    const shaftLen = length - tipLen;

    // shaft: from 0 to shaftLen
    const shaftGeom = new THREE.CylinderGeometry(
      thickness,
      thickness,
      shaftLen,
      12
    );
    const shaftMat = new THREE.MeshBasicMaterial({ color });
    const shaft = new THREE.Mesh(shaftGeom, shaftMat);
    shaft.position.y = shaftLen / 2;
    group.add(shaft);

    // arrow head: positioned so tip ends exactly at length
    const headGeom = new THREE.ConeGeometry(thickness * 2, tipLen, 16);
    const headMat = new THREE.MeshBasicMaterial({ color });
    const head = new THREE.Mesh(headGeom, headMat);
    head.position.y = length - tipLen / 2;
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

  setThickness(thickness: number) {
    this.axisThickness = thickness;
    // remove old axis groups
    for (const g of this.axisGroups) this.remove(g);
    // recreate
    this.axisGroups = [
      this.createAxis(new THREE.Vector3(1, 0, 0), this.axisLength, this.axisThickness, this.axisColors[0]),
      this.createAxis(new THREE.Vector3(0, 1, 0), this.axisLength, this.axisThickness, this.axisColors[1]),
      this.createAxis(new THREE.Vector3(0, 0, 1), this.axisLength, this.axisThickness, this.axisColors[2]),
    ];
    for (const g of this.axisGroups) this.add(g);
  }

  setOpacity(opacity: number) {
    for (const g of this.axisGroups) {
      g.traverse((obj) => {
        if ((obj as THREE.Mesh).material) {
          const m = (obj as THREE.Mesh).material as THREE.Material & { opacity?: number; transparent?: boolean };
          if ('opacity' in m) {
            m.transparent = opacity < 1;
            m.opacity = opacity;
          }
        }
      });
    }
  }
}
