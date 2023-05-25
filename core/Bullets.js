import * as THREE from '../three/three.module.js';
class Bullets {
  #geometry
  #material
  #BULLET_SPEED
  #BULLET_LIFESPAN
  #BULLET_RADIUS
  #NUM_BULLETS

  constructor(scene, material, player) {
    this.#BULLET_LIFESPAN = 100;
    this.#BULLET_RADIUS = 0.05
    this.#BULLET_SPEED = 1;
    this.#NUM_BULLETS = 10;
    this.#geometry = new THREE.IcosahedronGeometry(this.#BULLET_RADIUS, 5);
    this.#material = material;

    this.player = player
    this.bullets = [];
    this.bulletIndex = 0;

    for (let i = 0; i < this.#NUM_BULLETS; i++) {

      const sphere = new THREE.Mesh(this.#geometry, this.#material);
      sphere.castShadow = true;
      sphere.receiveShadow = true;

      scene.add(sphere);

      this.bullets.push({
        mesh: sphere,
        collider: new THREE.Sphere(new THREE.Vector3(0, - 100, 0), this.#BULLET_RADIUS),
        velocity: new THREE.Vector3()
      });

    }

  }


  shoot({ playerCollider, playerDirection, playerVelocity, mouseTime }) {
    const bullet = this.bullets[this.bulletIndex]
    // camera.getWorldDirection(playerDirection);
    bullet.collider.center.copy(playerCollider.end).addScaledVector(playerDirection, playerCollider.radius * 1.5);
    const impulse = 15 + 30 * (1 - Math.exp((mouseTime - performance.now()) * 0.001));

    bullet.velocity.copy(playerDirection).multiplyScalar(impulse);
    bullet.velocity.addScaledVector(playerVelocity, 2);

    this.bulletIndex = (this.bulletIndex + 1) % this.bullets.length;
    console.log(`datos: bulletIndex="${this.bulletIndex}" lenght="${this.bullets.length}"`)
  }

  updateBullet(deltaTime, worldOctree, GRAVITY) {

    this.bullets.forEach(proyectile => {

      proyectile.collider.center.addScaledVector(proyectile.velocity, deltaTime);

      const result = worldOctree.sphereIntersect(proyectile.collider);

      if (result) {

        proyectile.velocity.addScaledVector(result.normal, - result.normal.dot(proyectile.velocity) * 1.5);
        proyectile.collider.center.add(result.normal.multiplyScalar(result.depth));

      } else {

        proyectile.velocity.y -= (GRAVITY * 0.35) * deltaTime;

      }

      const damping = Math.exp(- 0.25 * deltaTime) - 1;
      proyectile.velocity.addScaledVector(proyectile.velocity, damping);

    });

    for (const bullet of this.bullets) {

      bullet.mesh.position.copy(bullet.collider.center);

    }

  }

  scorePlayer() {
    console.log(`player: ${this.player} scored!!!!!!`)
  }

}
export default Bullets