import * as THREE from '../three/three.module.js';
import Target from './Target.js';

class MovableTarget extends Target {
  constructor({ positions, TargetMesh, MeshName, rotation, direction, index, round }) {
    super({ positions, TargetMesh, MeshName })
    this.index = index
    this.round = round
    this.initialPos = positions
    this.rotation = rotation
    this.mesh.rotation.z = this.setedAngle
    // this.seted = true
    this.startMovAnim = false
    this.direction = direction
    this
  }

  updateTargetMovement(deltaTime, vel) {
    const velocity = vel * deltaTime
    if (this.direction == '+x') {
      this.mesh.position.x += velocity
      this.debugemesh.position.x += velocity
      this.updateTargetBB()
    }
    if (this.direction == '-x') {
      this.mesh.position.x -= velocity
      this.debugemesh.position.x -= velocity
      this.updateTargetBB()
    }

    if (this.direction == '+y') {
      this.mesh.position.y += velocity
      this.debugemesh.position.y += velocity
      this.updateTargetBB()
    }
    if (this.direction == '-y') {
      this.mesh.position.y -= velocity
      this.debugemesh.position.y -= velocity
      this.updateTargetBB()
    }

    if (this.direction == '+z') {
      this.mesh.position.z += velocity
      this.debugemesh.position.z += velocity
      this.updateTargetBB()
    }
    if (this.direction == '-z') {
      this.mesh.position.z -= velocity
      this.debugemesh.position.z -= velocity
      this.updateTargetBB()
    }
  }

  updateTargetBB() {
    // console.log(this.debugemesh)
    this.bb
      .copy(this.debugemesh.geometry.boundingBox)
      .applyMatrix4(this.debugemesh.matrixWorld)
  }
}

export default MovableTarget