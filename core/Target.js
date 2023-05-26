import * as THREE from '../three/three.module.js';

class Target {
  constructor({positions, TargetMesh, MeshName}) {
    const scale_factor = 0.75
    this.nonSetedAngle = - Math.PI / 2
    this.setedAngle = 0

    this.group = new THREE.Group()

    this.mesh = TargetMesh
    this.mesh.rotation.z = this.nonSetedAngle
    this.mesh.scale.set(scale_factor, scale_factor, scale_factor)
    this.mesh.position.set(positions.x, positions.y, positions.z)
    this.mesh.name = MeshName

    this.group.add(this.mesh)

    const box = new THREE.BoxGeometry(0.1, 0.7, 0.7);
    const material = new THREE.MeshBasicMaterial({ color: "red", transparent: true });
    material.opacity = 0.2
    this.debugemesh = new THREE.Mesh(box, material);
    this.debugemesh.position.set(this.mesh.position.x, this.mesh.position.y + 1.05, this.mesh.position.z)
    this.debugemesh.visible = false
    this.group.add(this.debugemesh)
    // group.add(debugcube)

    this.name = this.mesh.name
    this.seted = false
    this.startAnimUp = false
    this.startAnimDown = false
    this.velUp = 5.5
    this.velDown = 7.5
    this.bb = new THREE.Box3().setFromObject(this.debugemesh)
  }

  animateUp(deltaTime){
    const vel = this.velUp * deltaTime
    if (this.mesh.rotation.z < 0){
      this.mesh.rotation.z += vel
    }
    if (this.mesh.rotation.z >= 0)
    {
      this.mesh.rotation.z = 0
      this.seted = true
      this.startAnimUp = false
    }
  }

  animateDown(deltaTime){
    const vel = this.velDown * deltaTime
    if (this.mesh.rotation.z > -(Math.PI / 2)){
      this.mesh.rotation.z -= vel
    }
    if (this.mesh.rotation.z <= -(Math.PI / 2))
    {
      this.mesh.rotation.z = -(Math.PI / 2)
      this.seted = false
      this.startAnimDown = false
    }
  }
}

export default Target